import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';

describe('Task 03: history', () => {
  it('returns task operations in order', async () => {
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
    expect(
      (await app.inject({ method: 'GET', url: `/tasks/${task.id}/history` })).json(),
    ).toMatchObject([
      { action: 'CREATED' },
      { action: 'UPDATED' },
      { action: 'ASSIGNEE_CHANGED' },
      { action: 'COMPLETED' },
    ]);
    await app.close();
  });
});
