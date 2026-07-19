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

  it('preserves a completed task assignee when a different assignee is requested', async () => {
    const app = buildApp();
    const task = (
      await app.inject({
        method: 'POST',
        url: '/tasks',
        payload: { title: 'Assigned task' },
      })
    ).json() as { id: string };

    await app.inject({
      method: 'PATCH',
      url: `/tasks/${task.id}`,
      payload: { assigneeId: 'user-1' },
    });
    await app.inject({ method: 'POST', url: `/tasks/${task.id}/complete` });

    const assigneeUpdate = await app.inject({
      method: 'PATCH',
      url: `/tasks/${task.id}`,
      payload: { assigneeId: 'user-2' },
    });
    expect(assigneeUpdate.statusCode).toBe(409);
    expect(assigneeUpdate.json()).toEqual({ error: 'assignee cannot be changed after completion' });

    const titleUpdate = await app.inject({
      method: 'PATCH',
      url: `/tasks/${task.id}`,
      payload: { title: 'Completed task' },
    });
    expect(titleUpdate.statusCode).toBe(200);
    expect(titleUpdate.json()).toMatchObject({
      title: 'Completed task',
      assigneeId: 'user-1',
      status: 'COMPLETED',
    });
    await app.close();
  });
});
