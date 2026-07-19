import type { CreateTaskInput, Task } from './task.js';
export class TaskRepository {
  private values = new Map<string, Task>();
  private next = 0;
  create(task: CreateTaskInput) {
    const value = { ...task, id: String(++this.next) };
    this.values.set(value.id, value);
    return value;
  }
  duplicate(source: Task, timestamp: string) {
    return this.create({
      title: source.title,
      description: source.description,
      priority: source.priority,
      dueDate: source.dueDate,
      category: source.category,
      status: 'TODO',
      createdAt: timestamp,
      updatedAt: timestamp,
    });
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
}
