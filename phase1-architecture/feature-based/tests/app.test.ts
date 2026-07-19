import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { asResponse, type Task } from '../src/tasks/task.js';
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

  it('clears overdue state and warnings when a past-due task is completed', async () => {
    const app = buildApp();
    const task = (
      await app.inject({
        method: 'POST',
        url: '/tasks',
        payload: { title: 'Past-due task', dueDate: '2000-01-01' },
      })
    ).json() as { id: string; isOverdue: boolean; warnings: string[] };

    expect(task).toMatchObject({ isOverdue: true, warnings: ['due date is in the past'] });

    const completed = (
      await app.inject({ method: 'POST', url: `/tasks/${task.id}/complete` })
    ).json() as { status: string; isOverdue: boolean; warnings: string[] };

    expect(completed).toMatchObject({ status: 'COMPLETED', isOverdue: false, warnings: [] });
    await app.close();
  });

  it('clears overdue state and warnings for archived past-due tasks', () => {
    const archivedTask: Task = {
      id: 'archived-task',
      title: 'Archived past-due task',
      status: 'ARCHIVED',
      priority: 'MEDIUM',
      dueDate: '2000-01-01',
      createdAt: '2000-01-01T00:00:00.000Z',
      updatedAt: '2000-01-01T00:00:00.000Z',
    };

    expect(asResponse(archivedTask)).toMatchObject({ isOverdue: false, warnings: [] });
  });
});
