import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';

describe('monolithic baseline', () => {
  it('creates, completes, and excludes archived behavior through its API', async () => {
    const app = buildApp();
    const created = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: { title: 'Write experiment' },
    });
    expect(created.statusCode).toBe(201);
    const task = created.json() as { id: string; status: string };
    const completed = await app.inject({ method: 'POST', url: `/tasks/${task.id}/complete` });
    expect(completed.json()).toMatchObject({ status: 'COMPLETED', isOverdue: false });
    expect(
      (await app.inject({ method: 'POST', url: `/tasks/${task.id}/complete` })).statusCode,
    ).toBe(409);
    await app.close();
  });

  it('does not mark completed or archived tasks with past due dates as overdue', async () => {
    const app = buildApp();
    const completedTask = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: { title: 'Completed past-due task', dueDate: '2000-01-01' },
    });
    const archivedTask = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: { title: 'Archived past-due task', dueDate: '2000-01-01' },
    });

    const completed = await app.inject({
      method: 'POST',
      url: `/tasks/${(completedTask.json() as { id: string }).id}/complete`,
    });
    const archived = await app.inject({
      method: 'PATCH',
      url: `/tasks/${(archivedTask.json() as { id: string }).id}`,
      payload: { status: 'ARCHIVED' },
    });

    expect(completed.json()).toMatchObject({
      status: 'COMPLETED',
      isOverdue: false,
      warnings: [],
    });
    expect(archived.json()).toMatchObject({
      status: 'ARCHIVED',
      isOverdue: false,
      warnings: [],
    });
    await app.close();
  });
});
