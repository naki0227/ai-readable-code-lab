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

  it('does not mark a completed past-due task as overdue', async () => {
    const app = buildApp();
    const created = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: { title: 'Close monthly books', dueDate: '2000-01-01' },
    });
    const task = created.json() as { id: string; isOverdue: boolean };
    expect(task.isOverdue).toBe(true);

    const completed = await app.inject({ method: 'POST', url: `/tasks/${task.id}/complete` });
    expect(completed.json()).toMatchObject({
      status: 'COMPLETED',
      isOverdue: false,
      warnings: [],
    });
    await app.close();
  });
});
