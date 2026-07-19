import type { HistoryAction, Task, TaskHistoryEntry } from './domain.js';
export class TaskRepository {
  private readonly tasks = new Map<string, Task>();
  private sequence = 0;
  private historySequence = 0;
  private readonly histories = new Map<string, TaskHistoryEntry[]>();
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
    return this.tasks.delete(id);
  }
  addHistory(taskId: string, action: HistoryAction, createdAt: string): TaskHistoryEntry {
    const history = { id: String(++this.historySequence), taskId, action, createdAt };
    this.histories.set(taskId, [...(this.histories.get(taskId) ?? []), history]);
    return history;
  }
  historyFor(taskId: string): TaskHistoryEntry[] {
    return this.histories.get(taskId) ?? [];
  }
}
