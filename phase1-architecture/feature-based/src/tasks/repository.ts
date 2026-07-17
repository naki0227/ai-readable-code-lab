import type { Task, TaskEvent } from './task.js';
export class TaskRepository {
  private values = new Map<string, Task>();
  private next = 0;
  private eventNext = 0;
  private events = new Map<string, TaskEvent[]>();
  create(task: Omit<Task, 'id'>) {
    const value = { ...task, id: String(++this.next) };
    this.values.set(value.id, value);
    return value;
  }
  find(id: string) {
    return this.values.get(id);
  }
  list() {
    return [...this.values.values()];
  }
  remove(id: string) {
    return this.values.delete(id);
  }
  addEvent(taskId: string, action: TaskEvent['action'], createdAt: string) {
    const event = { id: String(++this.eventNext), taskId, action, createdAt };
    this.events.set(taskId, [...(this.events.get(taskId) ?? []), event]);
  }
  history(taskId: string) {
    return this.events.get(taskId);
  }
}
