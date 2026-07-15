import type { Task } from './domain.js';
export class TaskRepository {
  private readonly tasks = new Map<string, Task>();
  private sequence = 0;
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
}
