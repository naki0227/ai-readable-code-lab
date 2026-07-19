import type { Task, TaskHistoryItem } from './domain.js';
export class TaskRepository {
  private readonly tasks = new Map<string, Task>();
  private readonly histories = new Map<string, TaskHistoryItem[]>();
  private sequence = 0;
  private historySequence = 0;
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
  remove(id: string) {
    const removed = this.tasks.delete(id);
    if (removed) this.histories.delete(id);
    return removed;
  }
  saveHistory(item: Omit<TaskHistoryItem, 'id'>) {
    const history = this.histories.get(item.taskId) ?? [];
    const saved = { ...item, id: String(++this.historySequence) };
    history.push(saved);
    this.histories.set(item.taskId, history);
    return saved;
  }
  listHistory(taskId: string) {
    return this.histories.get(taskId) ?? [];
  }
}
