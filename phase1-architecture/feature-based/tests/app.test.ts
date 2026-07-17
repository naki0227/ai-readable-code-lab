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

  it('rejects assignee updates for completed tasks while allowing title-only updates', async () => {
    const app = buildApp();
    const task = (
      await app.inject({ method: 'POST', url: '/tasks', payload: { title: 'Test' } })
    ).json() as { id: string };
    await app.inject({ method: 'POST', url: `/tasks/${task.id}/complete` });

    const rejected = await app.inject({
      method: 'PATCH',
      url: `/tasks/${task.id}`,
      payload: { assigneeId: 'user-1' },
    });
    expect(rejected.statusCode).toBe(409);
    expect(rejected.json()).toEqual({ error: 'cannot change assignee of a completed task' });

    const updated = await app.inject({
      method: 'PATCH',
      url: `/tasks/${task.id}`,
      payload: { title: 'Retitled completed task' },
    });
    expect(updated.statusCode).toBe(200);
    expect(updated.json()).toMatchObject({
      title: 'Retitled completed task',
      status: 'COMPLETED',
    });

    const missing = await app.inject({
      method: 'PATCH',
      url: '/tasks/missing',
      payload: { assigneeId: 'user-1' },
    });
    expect(missing.statusCode).toBe(404);
    expect(missing.json()).toEqual({ error: 'task not found' });
    await app.close();
  });
});
