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

  it('does not mark a completed task with a past due date as overdue', async () => {
    const app = buildApp();
    const task = (
      await app.inject({
        method: 'POST',
        url: '/tasks',
        payload: { title: 'Completed task', dueDate: '2020-01-01' },
      })
    ).json() as { id: string };

    expect(
      (await app.inject({ method: 'POST', url: `/tasks/${task.id}/complete` })).json(),
    ).toMatchObject({ isOverdue: false, warnings: [] });

    await app.close();
  });
});
