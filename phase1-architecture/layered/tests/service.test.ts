import { describe, expect, it } from 'vitest';
import { TaskRepository } from '../src/repository.js';
import { TaskService } from '../src/service.js';

describe('TaskService duplicate', () => {
  it('persists a new TODO task with fresh timestamps and copied task details', () => {
    const clockValues = [
      '2030-01-01T00:00:00.000Z',
      '2030-01-01T01:00:00.000Z',
      '2030-01-01T02:00:00.000Z',
      '2030-01-02T00:00:00.000Z',
    ];
    const service = new TaskService(new TaskRepository(), () => clockValues.shift() ?? '');
    const source = service.create({
      title: 'Source',
      description: 'Details',
      priority: 'HIGH',
      category: 'work',
      dueDate: '2030-02-01',
    });
    service.update(source.id, { assigneeId: 'user-1' });
    service.complete(source.id);

    const duplicate = service.duplicate(source.id);

    expect(duplicate).toMatchObject({
      title: source.title,
      description: source.description,
      priority: source.priority,
      category: source.category,
      dueDate: source.dueDate,
      status: 'TODO',
      createdAt: '2030-01-02T00:00:00.000Z',
      updatedAt: '2030-01-02T00:00:00.000Z',
    });
    expect(duplicate.id).not.toBe(source.id);
    expect(duplicate).not.toHaveProperty('assigneeId');
    expect(service.get(source.id)).toMatchObject({ status: 'COMPLETED', assigneeId: 'user-1' });
  });
});
