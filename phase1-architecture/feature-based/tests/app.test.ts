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

  it('only marks active tasks with past due dates as overdue', async () => {
    const app = buildApp();
    const createTask = async (payload: { title: string; dueDate?: string }) =>
      (await app.inject({ method: 'POST', url: '/tasks', payload })).json() as {
        id: string;
        isOverdue: boolean;
        warnings: string[];
      };

    const pastDueTask = await createTask({ title: 'Past due', dueDate: '2000-01-01' });
    expect(pastDueTask).toMatchObject({
      isOverdue: true,
      warnings: ['due date is in the past'],
    });

    const completed = await app.inject({
      method: 'POST',
      url: `/tasks/${pastDueTask.id}/complete`,
    });
    expect(completed.json()).toMatchObject({
      isOverdue: false,
      warnings: ['due date is in the past'],
    });

    const archivedTask = await createTask({ title: 'Archived past due', dueDate: '2000-01-01' });
    const archived = await app.inject({
      method: 'PATCH',
      url: `/tasks/${archivedTask.id}`,
      payload: { status: 'ARCHIVED' },
    });
    expect(archived.json()).toMatchObject({
      status: 'ARCHIVED',
      isOverdue: false,
      warnings: ['due date is in the past'],
    });

    const listed = (await app.inject({ method: 'GET', url: '/tasks' })).json() as Array<{
      id: string;
      isOverdue: boolean;
    }>;
    const detailed = (
      await app.inject({ method: 'GET', url: `/tasks/${pastDueTask.id}` })
    ).json() as {
      isOverdue: boolean;
    };
    expect(listed.find((task) => task.id === pastDueTask.id)?.isOverdue).toBe(false);
    expect(detailed.isOverdue).toBe(false);

    await expect(createTask({ title: 'Future due', dueDate: '2999-01-01' })).resolves.toMatchObject(
      {
        isOverdue: false,
        warnings: [],
      },
    );
    await expect(createTask({ title: 'No due date' })).resolves.toMatchObject({
      isOverdue: false,
      warnings: [],
    });
    await app.close();
  });
});
