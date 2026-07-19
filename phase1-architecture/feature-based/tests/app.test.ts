import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
describe('feature baseline', () => {
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

  it('returns a task operation history in creation order', async () => {
    const app = buildApp();
    const task = (
      await app.inject({ method: 'POST', url: '/tasks', payload: { title: 'Test' } })
    ).json() as { id: string };

    await app.inject({ method: 'PATCH', url: `/tasks/${task.id}`, payload: { title: 'Renamed' } });
    await app.inject({
      method: 'PATCH',
      url: `/tasks/${task.id}`,
      payload: { assigneeId: 'user-1' },
    });
    await app.inject({ method: 'POST', url: `/tasks/${task.id}/complete` });

    const response = await app.inject({ method: 'GET', url: `/tasks/${task.id}/history` });

    expect(response.statusCode).toBe(200);
    const history = response.json() as {
      id: string;
      taskId: string;
      action: string;
      createdAt: string;
    }[];
    expect(history.map((entry) => entry.action)).toEqual([
      'CREATED',
      'UPDATED',
      'ASSIGNEE_CHANGED',
      'COMPLETED',
    ]);
    for (const entry of history) {
      expect(entry).toMatchObject({
        id: expect.any(String),
        taskId: task.id,
        createdAt: expect.any(String),
      });
    }
    await app.close();
  });

  it('returns not found for an unknown task history', async () => {
    const app = buildApp();

    const response = await app.inject({ method: 'GET', url: '/tasks/unknown/history' });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: 'task not found' });
    await app.close();
  });
});
