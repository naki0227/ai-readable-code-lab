import type { Task } from './task.js';
export class TaskRepository {
  private values = new Map<string, Task>();
  private next = 0;
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
}
