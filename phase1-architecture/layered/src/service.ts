import type { Priority, Task } from './domain.js';
import { isOverdue } from './domain.js';
import { TaskRepository } from './repository.js';
export class TaskService {
  constructor(
    private readonly repository = new TaskRepository(),
    private readonly clock = () => new Date().toISOString(),
  ) {}
  view(task: Task) {
    return { ...task, isOverdue: isOverdue(task, this.clock().slice(0, 10)) };
  }
  create(input: { title?: string; description?: string; priority?: Priority; dueDate?: string }) {
    if (!input.title?.trim()) throw new Error('title is required');
    const time = this.clock();
    return this.repository.save({
      id: this.repository.nextId(),
      title: input.title.trim(),
      description: input.description,
      priority: input.priority ?? 'MEDIUM',
      dueDate: input.dueDate,
      status: 'TODO',
      createdAt: time,
      updatedAt: time,
    });
  }
  get(id: string) {
    return this.repository.find(id);
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
    input: { title?: string; description?: string; priority?: Priority; dueDate?: string },
  ) {
    const task = this.get(id);
    if (!task) throw new Error('task not found');
    if (input.title !== undefined && !input.title.trim()) throw new Error('title is required');
    Object.assign(task, input, {
      title: input.title?.trim() ?? task.title,
      updatedAt: this.clock(),
    });
    return task;
  }
  archive(id: string) {
    const task = this.get(id);
    if (!task) throw new Error('task not found');
    task.status = 'ARCHIVED';
    task.updatedAt = this.clock();
    return task;
  }
}
