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

  it('archives a task without deleting its detail record', async () => {
    const app = buildApp();
    const created = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: { title: 'Archive me', dueDate: '2000-01-01' },
    });
    const task = created.json() as { id: string };

    const archived = await app.inject({ method: 'DELETE', url: `/tasks/${task.id}` });
    expect(archived.statusCode).toBe(200);
    expect(archived.json()).toMatchObject({
      id: task.id,
      status: 'ARCHIVED',
      isOverdue: false,
      warnings: [],
    });

    const list = await app.inject({ method: 'GET', url: '/tasks' });
    expect(list.json()).toEqual([]);

    const detail = await app.inject({ method: 'GET', url: `/tasks/${task.id}` });
    expect(detail.statusCode).toBe(200);
    expect(detail.json()).toMatchObject({ id: task.id, status: 'ARCHIVED', isOverdue: false });

    expect((await app.inject({ method: 'DELETE', url: '/tasks/missing' })).statusCode).toBe(404);
    await app.close();
  });
});
