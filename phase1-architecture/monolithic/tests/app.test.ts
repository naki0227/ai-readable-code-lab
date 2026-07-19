import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';

describe('monolithic baseline', () => {
  it('archives a task while retaining it for detail requests', async () => {
    const app = buildApp();
    const created = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: { title: 'Write experiment', dueDate: '2000-01-01' },
    });
    expect(created.statusCode).toBe(201);
    const task = created.json() as { id: string; status: string };

    const archived = await app.inject({ method: 'DELETE', url: `/tasks/${task.id}` });
    expect(archived.statusCode).toBe(200);
    expect(archived.json()).toMatchObject({
      id: task.id,
      status: 'ARCHIVED',
      isOverdue: false,
      warnings: [],
    });
    expect((await app.inject({ method: 'GET', url: `/tasks` })).json()).toEqual([]);
    expect((await app.inject({ method: 'GET', url: `/tasks/${task.id}` })).json()).toMatchObject({
      id: task.id,
      status: 'ARCHIVED',
      isOverdue: false,
    });
    await app.close();
  });
});
