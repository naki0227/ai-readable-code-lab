import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';

describe('Task 03: history', () => {
  it('returns task operations in chronological order with their task id', async () => {
    const app = buildApp();
    const task = (
      await app.inject({ method: 'POST', url: '/tasks', payload: { title: 'Task' } })
    ).json() as { id: string };

    await app.inject({
      method: 'PATCH',
      url: `/tasks/${task.id}`,
      payload: { description: 'Updated' },
    });
    await app.inject({
      method: 'PATCH',
      url: `/tasks/${task.id}`,
      payload: { assigneeId: 'user-1' },
    });
    await app.inject({ method: 'POST', url: `/tasks/${task.id}/complete` });

    const history = (
      await app.inject({ method: 'GET', url: `/tasks/${task.id}/history` })
    ).json() as Array<{ id: string; taskId: string; action: string; createdAt: string }>;

    expect(history).toMatchObject([
      { taskId: task.id, action: 'CREATED' },
      { taskId: task.id, action: 'UPDATED' },
      { taskId: task.id, action: 'ASSIGNEE_CHANGED' },
      { taskId: task.id, action: 'COMPLETED' },
    ]);
    expect(history.map(({ id, createdAt }) => ({ id, createdAt }))).toEqual([
      expect.objectContaining({ id: expect.any(String), createdAt: expect.any(String) }),
      expect.objectContaining({ id: expect.any(String), createdAt: expect.any(String) }),
      expect.objectContaining({ id: expect.any(String), createdAt: expect.any(String) }),
      expect.objectContaining({ id: expect.any(String), createdAt: expect.any(String) }),
    ]);
    await app.close();
  });

  it('returns 404 for a task that does not exist', async () => {
    const app = buildApp();

    const response = await app.inject({ method: 'GET', url: '/tasks/missing/history' });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: 'task not found' });
    await app.close();
  });

  it('records a repeated assignee as an update rather than an assignee change', async () => {
    const app = buildApp();
    const task = (
      await app.inject({ method: 'POST', url: '/tasks', payload: { title: 'Task' } })
    ).json() as { id: string };

    await app.inject({
      method: 'PATCH',
      url: `/tasks/${task.id}`,
      payload: { assigneeId: 'user-1' },
    });
    await app.inject({
      method: 'PATCH',
      url: `/tasks/${task.id}`,
      payload: { assigneeId: 'user-1' },
    });

    const history = (
      await app.inject({ method: 'GET', url: `/tasks/${task.id}/history` })
    ).json() as Array<{ action: string }>;

    expect(history.map((item) => item.action)).toEqual(['CREATED', 'ASSIGNEE_CHANGED', 'UPDATED']);
    await app.close();
  });
});
