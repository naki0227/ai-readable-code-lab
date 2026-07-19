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

  it('records the ordered operation history for a task', async () => {
    const app = buildApp();
    const created = await app.inject({ method: 'POST', url: '/tasks', payload: { title: 'Test' } });
    const { id } = created.json() as { id: string };

    await app.inject({ method: 'PATCH', url: `/tasks/${id}`, payload: { title: 'Updated' } });
    await app.inject({ method: 'PATCH', url: `/tasks/${id}`, payload: { assigneeId: 'user-1' } });
    await app.inject({ method: 'POST', url: `/tasks/${id}/complete` });
    await app.inject({ method: 'POST', url: `/tasks/${id}/archive` });

    const response = await app.inject({ method: 'GET', url: `/tasks/${id}/history` });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject([
      { taskId: id, action: 'CREATED' },
      { taskId: id, action: 'UPDATED' },
      { taskId: id, action: 'ASSIGNEE_CHANGED' },
      { taskId: id, action: 'COMPLETED' },
      { taskId: id, action: 'ARCHIVED' },
    ]);
    await app.close();
  });
});
