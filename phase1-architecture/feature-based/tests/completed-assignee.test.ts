import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';

describe('Task 02: completed task assignee', () => {
  it('rejects assignee changes after completion without blocking title updates', async () => {
    const app = buildApp();
    const task = (
      await app.inject({ method: 'POST', url: '/tasks', payload: { title: 'Task' } })
    ).json() as { id: string };
    await app.inject({
      method: 'PATCH',
      url: `/tasks/${task.id}`,
      payload: { assigneeId: 'user-1' },
    });
    await app.inject({ method: 'POST', url: `/tasks/${task.id}/complete` });
    expect(
      (
        await app.inject({
          method: 'PATCH',
          url: `/tasks/${task.id}`,
          payload: { assigneeId: 'user-2' },
        })
      ).statusCode,
    ).toBe(409);
    expect(
      (
        await app.inject({
          method: 'PATCH',
          url: `/tasks/${task.id}`,
          payload: { title: 'Renamed' },
        })
      ).json(),
    ).toMatchObject({ title: 'Renamed', assigneeId: 'user-1' });
    await app.close();
  });
});
