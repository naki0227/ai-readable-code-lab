import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';

describe('monolithic baseline', () => {
  it('creates and completes tasks through its API', async () => {
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

  it('archives tasks without permanently deleting them', async () => {
    const app = buildApp();
    const created = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: { title: 'Archive experiment', dueDate: '2000-01-01' },
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

    expect((await app.inject({ method: 'GET', url: '/tasks' })).json()).toEqual([]);
    expect((await app.inject({ method: 'GET', url: `/tasks/${task.id}` })).json()).toMatchObject({
      id: task.id,
      status: 'ARCHIVED',
      isOverdue: false,
    });
    expect((await app.inject({ method: 'DELETE', url: '/tasks/missing' })).statusCode).toBe(404);
    await app.close();
  });
});
