import type { Priority, Task } from './domain.js';
import { isOverdue } from './domain.js';
import { TaskRepository } from './repository.js';
export class TaskService {
  constructor(
    private readonly repository = new TaskRepository(),
    private readonly clock = () => new Date().toISOString(),
  ) {}
  view(task: Task) {
    const today = this.clock().slice(0, 10);
    return {
      ...task,
      isOverdue: isOverdue(task, today),
      warnings: task.dueDate && task.dueDate < today ? ['due date is in the past'] : [],
    };
  }
  create(input: {
    title?: string;
    description?: string;
    priority?: Priority;
    dueDate?: string;
    category?: string;
  }) {
    if (!input.title?.trim()) throw new Error('title is required');
    const time = this.clock();
    const task = this.repository.save({
      id: this.repository.nextId(),
      title: input.title.trim(),
      description: input.description,
      priority: input.priority ?? 'MEDIUM',
      dueDate: input.dueDate,
      category: input.category,
      status: 'TODO',
      createdAt: time,
      updatedAt: time,
    });
    return task;
  }
  get(id: string) {
    return this.repository.find(id);
  }
  duplicate(id: string) {
    const original = this.get(id);
    if (!original) throw new Error('task not found');

    const time = this.clock();
    return this.repository.save({
      id: this.repository.nextId(),
      title: original.title,
      description: original.description,
      priority: original.priority,
      dueDate: original.dueDate,
      ...(original.category === undefined ? {} : { category: original.category }),
      status: 'TODO',
      createdAt: time,
      updatedAt: time,
    });
  }
  list() {
    return this.repository.list().filter((task) => task.status !== 'ARCHIVED');
  }
  complete(id: string) {
    const task = this.get(id);
    if (!task) throw new Error('task not found');
    if (task.status === 'COMPLETED') throw new Error('task is already completed');
    task.status = 'COMPLETED';
    task.updatedAt = this.clock();
    return task;
  }
  update(
    id: string,
    input: {
      title?: string;
      description?: string;
      priority?: Priority;
      dueDate?: string;
      category?: string;
      assigneeId?: string;
    },
  ) {
    const task = this.get(id);
    if (!task) throw new Error('task not found');
    if (input.title !== undefined && !input.title.trim()) throw new Error('title is required');
    if (input.assigneeId !== undefined && !this.hasUser(input.assigneeId))
      throw new Error('assignee not found');
    Object.assign(task, input, {
      title: input.title?.trim() ?? task.title,
      updatedAt: this.clock(),
    });
    return task;
  }
  remove(id: string) {
    if (!this.repository.remove(id)) throw new Error('task not found');
  }
  private hasUser(id: string) {
    return id === 'user-1' || id === 'user-2';
  }
}
