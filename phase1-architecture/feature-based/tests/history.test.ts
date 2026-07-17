import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';

describe('Task 03: history', () => {
  it('returns task operations in order, including archival', async () => {
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
    await app.inject({ method: 'DELETE', url: `/tasks/${task.id}` });

    const history = await app.inject({ method: 'GET', url: `/tasks/${task.id}/history` });
    expect(history.statusCode).toBe(200);
    expect(history.json()).toMatchObject([
      { action: 'CREATED' },
      { action: 'UPDATED' },
      { action: 'ASSIGNEE_CHANGED' },
      { action: 'COMPLETED' },
      { action: 'ARCHIVED' },
    ]);
    await app.close();
  });

  it('returns 404 when the task has no history', async () => {
    const app = buildApp();
    const response = await app.inject({ method: 'GET', url: '/tasks/missing/history' });
    expect(response.statusCode).toBe(404);
    await app.close();
  });
});
