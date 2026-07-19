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

  it('records task operation history in chronological order', async () => {
    const app = buildApp();
    const created = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: { title: 'Write experiment' },
    });
    const task = created.json() as { id: string };

    expect(
      (
        await app.inject({
          method: 'PATCH',
          url: `/tasks/${task.id}`,
          payload: { title: 'Revise experiment' },
        })
      ).statusCode,
    ).toBe(200);
    expect(
      (
        await app.inject({
          method: 'PATCH',
          url: `/tasks/${task.id}`,
          payload: { assigneeId: 'user-1' },
        })
      ).statusCode,
    ).toBe(200);
    expect(
      (await app.inject({ method: 'POST', url: `/tasks/${task.id}/complete` })).statusCode,
    ).toBe(200);

    const history = await app.inject({ method: 'GET', url: `/tasks/${task.id}/history` });
    expect(history.statusCode).toBe(200);
    expect(history.json()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ taskId: task.id, action: 'CREATED' }),
        expect.objectContaining({ taskId: task.id, action: 'UPDATED' }),
        expect.objectContaining({ taskId: task.id, action: 'ASSIGNEE_CHANGED' }),
        expect.objectContaining({ taskId: task.id, action: 'COMPLETED' }),
      ]),
    );
    expect((history.json() as { action: string }[]).map((event) => event.action)).toEqual([
      'CREATED',
      'UPDATED',
      'ASSIGNEE_CHANGED',
      'COMPLETED',
    ]);
    expect(history.json()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: expect.any(String), createdAt: expect.any(String) }),
      ]),
    );
    await app.close();
  });

  it('returns 404 when a task history is requested for a missing task', async () => {
    const app = buildApp();
    const response = await app.inject({ method: 'GET', url: '/tasks/missing/history' });
    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: 'task not found' });
    await app.close();
  });
});
