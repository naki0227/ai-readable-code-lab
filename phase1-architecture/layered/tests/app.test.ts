import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import type { Task } from '../src/domain.js';
import { TaskRepository } from '../src/repository.js';
import { TaskService } from '../src/service.js';

const pastDueTask = (status: Task['status']): Task => ({
  id: 'past-due',
  title: 'Past due task',
  status,
  priority: 'MEDIUM',
  dueDate: '2026-07-17',
  createdAt: '2026-07-01T00:00:00.000Z',
  updatedAt: '2026-07-01T00:00:00.000Z',
});

describe('layered baseline', () => {
  it('uses the same public completion contract', async () => {
    const app = buildApp();
    const task = (
      await app.inject({ method: 'POST', url: '/tasks', payload: { title: 'Test' } })
    ).json() as { id: string };
    expect(
      (await app.inject({ method: 'POST', url: `/tasks/${task.id}/complete` })).json(),
    ).toMatchObject({ status: 'COMPLETED' });
    await app.close();
  });

  it('clears overdue metadata when a past-due task is completed', async () => {
    const app = buildApp();
    const created = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: { title: 'Past due task', dueDate: '2020-01-01' },
    });
    const task = created.json() as { id: string; isOverdue: boolean; warnings: string[] };
    expect(task).toMatchObject({ isOverdue: true, warnings: ['due date is in the past'] });

    const completed = await app.inject({ method: 'POST', url: `/tasks/${task.id}/complete` });
    expect(completed.json()).toMatchObject({
      status: 'COMPLETED',
      isOverdue: false,
      warnings: [],
    });
    await app.close();
  });

  it('clears overdue metadata for archived past-due tasks', () => {
    const repository = new TaskRepository();
    const service = new TaskService(repository, () => '2026-07-19T00:00:00.000Z');

    expect(service.view(pastDueTask('ARCHIVED'))).toMatchObject({
      isOverdue: false,
      warnings: [],
    });
  });
});
