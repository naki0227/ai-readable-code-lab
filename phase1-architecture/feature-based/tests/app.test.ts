import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';

type HistoryRecord = {
  id: string;
  taskId: string;
  action: string;
  createdAt: string;
};

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

  it('records task creation in history', async () => {
    const app = buildApp();
    const task = (
      await app.inject({ method: 'POST', url: '/tasks', payload: { title: 'Test' } })
    ).json() as { id: string };

    const history = (
      await app.inject({ method: 'GET', url: `/tasks/${task.id}/history` })
    ).json() as HistoryRecord[];

    expect(history).toHaveLength(1);
    expect(history[0]).toMatchObject({ taskId: task.id, action: 'CREATED' });
    expect(history[0].id).toEqual(expect.any(String));
    expect(history[0].createdAt).toEqual(expect.any(String));
    await app.close();
  });

  it('returns ordered update, assignee, and completion history', async () => {
    const app = buildApp();
    const task = (
      await app.inject({ method: 'POST', url: '/tasks', payload: { title: 'Test' } })
    ).json() as { id: string };

    await app.inject({ method: 'PATCH', url: `/tasks/${task.id}`, payload: { title: 'Updated' } });
    await app.inject({
      method: 'PATCH',
      url: `/tasks/${task.id}`,
      payload: { assigneeId: 'user-1' },
    });
    await app.inject({ method: 'POST', url: `/tasks/${task.id}/complete` });

    const history = (
      await app.inject({ method: 'GET', url: `/tasks/${task.id}/history` })
    ).json() as HistoryRecord[];

    expect(history.map((record) => record.action)).toEqual([
      'CREATED',
      'UPDATED',
      'ASSIGNEE_CHANGED',
      'COMPLETED',
    ]);
    expect(history.every((record) => record.taskId === task.id)).toBe(true);
    await app.close();
  });

  it('returns 404 for history of a missing task', async () => {
    const app = buildApp();

    const response = await app.inject({ method: 'GET', url: '/tasks/missing/history' });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: 'task not found' });
    await app.close();
  });
});
