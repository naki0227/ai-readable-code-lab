import type { Task, TaskHistory, TaskHistoryAction } from './task.js';
export class TaskRepository {
  private values = new Map<string, Task>();
  private histories = new Map<string, TaskHistory[]>();
  private next = 0;
  private nextHistory = 0;
  create(task: Omit<Task, 'id'>) {
    const value = { ...task, id: String(++this.next) };
    this.values.set(value.id, value);
    this.record(value.id, 'CREATED', value.createdAt);
    return value;
  }
  find(id: string) {
    return this.values.get(id);
  }
  list() {
    return [...this.values.values()];
  }
  findHistory(taskId: string) {
    return this.values.has(taskId) ? (this.histories.get(taskId) ?? []) : undefined;
  }
  record(taskId: string, action: TaskHistoryAction, createdAt: string) {
    const history = this.histories.get(taskId) ?? [];
    const entry = { id: String(++this.nextHistory), taskId, action, createdAt };
    history.push(entry);
    this.histories.set(taskId, history);
    return entry;
  }
  remove(id: string) {
    return this.values.delete(id);
  }
}
