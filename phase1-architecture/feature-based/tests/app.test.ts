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

  it('does not allow changing the assignee of a completed task', async () => {
    const app = buildApp();
    const task = (
      await app.inject({ method: 'POST', url: '/tasks', payload: { title: 'Test' } })
    ).json() as { id: string };

    await app.inject({
      method: 'PATCH',
      url: `/tasks/${task.id}`,
      payload: { assigneeId: 'user-1' },
    });
    await app.inject({ method: 'POST', url: `/tasks/${task.id}/complete` });

    const response = await app.inject({
      method: 'PATCH',
      url: `/tasks/${task.id}`,
      payload: { assigneeId: 'user-2' },
    });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toEqual({ error: 'completed task assignee cannot be changed' });
    expect((await app.inject({ method: 'GET', url: `/tasks/${task.id}` })).json()).toMatchObject({
      assigneeId: 'user-1',
    });
    await app.close();
  });
});
