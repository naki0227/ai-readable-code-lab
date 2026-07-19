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

  it('records chronological task events and returns 404 for an unknown task history', async () => {
    const app = buildApp();
    const created = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: { title: 'Record changes' },
    });
    const task = created.json() as { id: string };

    await app.inject({
      method: 'PATCH',
      url: `/tasks/${task.id}`,
      payload: { title: 'Record events' },
    });
    await app.inject({
      method: 'PATCH',
      url: `/tasks/${task.id}`,
      payload: { assigneeId: 'user-1' },
    });
    await app.inject({ method: 'POST', url: `/tasks/${task.id}/complete` });

    const history = await app.inject({ method: 'GET', url: `/tasks/${task.id}/history` });
    expect(history.statusCode).toBe(200);
    expect(history.json()).toMatchObject([
      { id: '1', taskId: task.id, action: 'CREATED' },
      { id: '2', taskId: task.id, action: 'UPDATED' },
      { id: '3', taskId: task.id, action: 'ASSIGNEE_CHANGED' },
      { id: '4', taskId: task.id, action: 'COMPLETED' },
    ]);
    expect(
      (history.json() as Array<{ createdAt: string }>).every((event) => Boolean(event.createdAt)),
    ).toBe(true);

    const missing = await app.inject({ method: 'GET', url: '/tasks/missing/history' });
    expect(missing.statusCode).toBe(404);
    expect(missing.json()).toEqual({ error: 'task not found' });
    await app.close();
  });
});
