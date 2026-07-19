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

  it('rejects assignee patches for completed tasks while allowing title-only patches', async () => {
    const app = buildApp();
    const task = (
      await app.inject({ method: 'POST', url: '/tasks', payload: { title: 'Original title' } })
    ).json() as { id: string };

    await app.inject({ method: 'POST', url: `/tasks/${task.id}/complete` });

    const assigneePatch = await app.inject({
      method: 'PATCH',
      url: `/tasks/${task.id}`,
      payload: { assigneeId: 'user-1' },
    });
    expect(assigneePatch.statusCode).toBe(409);
    expect(assigneePatch.json()).toEqual({ error: 'cannot change assignee of a completed task' });

    const titlePatch = await app.inject({
      method: 'PATCH',
      url: `/tasks/${task.id}`,
      payload: { title: 'Updated title' },
    });
    expect(titlePatch.statusCode).toBe(200);
    expect(titlePatch.json()).toMatchObject({ title: 'Updated title', status: 'COMPLETED' });

    await app.close();
  });

  it('returns 404 when patching a missing task', async () => {
    const app = buildApp();

    const response = await app.inject({
      method: 'PATCH',
      url: '/tasks/missing-task',
      payload: { assigneeId: 'user-1' },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: 'task not found' });
    await app.close();
  });
});
