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

  it('keeps overdue state consistent between list and detail after completion', async () => {
    const app = buildApp();
    const created = (
      await app.inject({
        method: 'POST',
        url: '/tasks',
        payload: { title: 'Past due task', dueDate: '2000-01-01' },
      })
    ).json() as { id: string; isOverdue: boolean; warnings: string[] };

    expect(created).toMatchObject({
      isOverdue: true,
      warnings: ['due date is in the past'],
    });

    const listed = (await app.inject({ method: 'GET', url: '/tasks' })).json() as Array<{
      id: string;
      isOverdue: boolean;
    }>;
    const detail = (await app.inject({ method: 'GET', url: `/tasks/${created.id}` })).json() as {
      isOverdue: boolean;
    };
    expect(listed.find((task) => task.id === created.id)?.isOverdue).toBe(true);
    expect(detail.isOverdue).toBe(true);

    const completed = (
      await app.inject({ method: 'POST', url: `/tasks/${created.id}/complete` })
    ).json() as { isOverdue: boolean; warnings: string[] };
    expect(completed).toMatchObject({
      isOverdue: false,
      warnings: ['due date is in the past'],
    });

    const completedList = (await app.inject({ method: 'GET', url: '/tasks' })).json() as Array<{
      id: string;
      isOverdue: boolean;
    }>;
    const completedDetail = (
      await app.inject({ method: 'GET', url: `/tasks/${created.id}` })
    ).json() as { isOverdue: boolean };
    expect(completedList.find((task) => task.id === created.id)?.isOverdue).toBe(false);
    expect(completedDetail.isOverdue).toBe(false);
    await app.close();
  });
});
