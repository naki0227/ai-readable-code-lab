import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { asResponse, type Task } from '../src/tasks/task.js';

const pastDueTask = (status: Task['status']): Task => ({
  id: 'task-1',
  title: 'Past due task',
  status,
  priority: 'MEDIUM',
  dueDate: '2000-01-01',
  createdAt: '2000-01-01T00:00:00.000Z',
  updatedAt: '2000-01-01T00:00:00.000Z',
});

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

  it.each(['COMPLETED', 'ARCHIVED'] as const)(
    'does not mark %s past-due tasks as overdue or warn about them',
    (status) => {
      const response = asResponse(pastDueTask(status));

      expect(response).toMatchObject({ isOverdue: false, warnings: [] });
    },
  );

  it('keeps overdue warnings for active past-due tasks', () => {
    const response = asResponse(pastDueTask('IN_PROGRESS'));

    expect(response).toMatchObject({
      isOverdue: true,
      warnings: ['due date is in the past'],
    });
  });
});
