import type { Task, TaskHistory, TaskHistoryAction } from './task.js';
export class TaskRepository {
  private values = new Map<string, Task>();
  private history = new Map<string, TaskHistory[]>();
  private next = 0;
  private nextHistory = 0;
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
  recordHistory(taskId: string, action: TaskHistoryAction, createdAt: string) {
    const record = { id: String(++this.nextHistory), taskId, action, createdAt };
    const history = this.history.get(taskId) ?? [];
    history.push(record);
    this.history.set(taskId, history);
    return record;
  }
  listHistory(taskId: string) {
    return this.history.get(taskId) ?? [];
  }
}
