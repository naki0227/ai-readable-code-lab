import type { Task, TaskEvent } from './domain.js';
export class TaskRepository {
  private readonly tasks = new Map<string, Task>();
  private sequence = 0;
  private eventSequence = 0;
  private readonly events = new Map<string, TaskEvent[]>();
  nextId() {
    return String(++this.sequence);
  }
  save(task: Task) {
    this.tasks.set(task.id, task);
    return task;
  }
  find(id: string) {
    return this.tasks.get(id);
  }
  list() {
    return [...this.tasks.values()];
  }
  addEvent(taskId: string, action: TaskEvent['action'], createdAt: string) {
    const event = { id: String(++this.eventSequence), taskId, action, createdAt };
    this.events.set(taskId, [...(this.events.get(taskId) ?? []), event]);
  }
  history(taskId: string) {
    return this.events.get(taskId) ?? [];
  }
}
