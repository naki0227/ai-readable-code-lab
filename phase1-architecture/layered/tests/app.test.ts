import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
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

  it('returns each task operation history in creation order', async () => {
    const app = buildApp();
    const task = (
      await app.inject({ method: 'POST', url: '/tasks', payload: { title: 'Test' } })
    ).json() as { id: string };

    await app.inject({
      method: 'PATCH',
      url: `/tasks/${task.id}`,
      payload: { title: 'Updated task' },
    });
    await app.inject({
      method: 'PATCH',
      url: `/tasks/${task.id}`,
      payload: { assigneeId: 'user-1' },
    });
    await app.inject({ method: 'POST', url: `/tasks/${task.id}/complete` });

    const response = await app.inject({ method: 'GET', url: `/tasks/${task.id}/history` });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ taskId: task.id, action: 'CREATED' }),
        expect.objectContaining({ taskId: task.id, action: 'UPDATED' }),
        expect.objectContaining({ taskId: task.id, action: 'ASSIGNEE_CHANGED' }),
        expect.objectContaining({ taskId: task.id, action: 'COMPLETED' }),
      ]),
    );
    expect((response.json() as { action: string }[]).map((item) => item.action)).toEqual([
      'CREATED',
      'UPDATED',
      'ASSIGNEE_CHANGED',
      'COMPLETED',
    ]);
    expect(response.json()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: expect.any(String), createdAt: expect.any(String) }),
      ]),
    );
    await app.close();
  });

  it('returns 404 for history of an unknown task', async () => {
    const app = buildApp();
    const response = await app.inject({ method: 'GET', url: '/tasks/missing/history' });
    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: 'task not found' });
    await app.close();
  });
});
