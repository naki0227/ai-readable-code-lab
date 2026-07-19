import { describe, expect, it } from 'vitest';
import { asResponse, type Task } from '../src/tasks/task.js';

const pastDueTask = (status: Task['status']): Task => ({
  id: 'task-1',
  title: 'Past-due task',
  status,
  priority: 'MEDIUM',
  dueDate: '2000-01-01',
  createdAt: '2000-01-01T00:00:00.000Z',
  updatedAt: '2000-01-01T00:00:00.000Z',
});

describe('asResponse', () => {
  it.each(['TODO', 'IN_PROGRESS'] as const)('marks a past-due %s task as overdue', (status) => {
    expect(asResponse(pastDueTask(status))).toMatchObject({
      isOverdue: true,
      warnings: ['due date is in the past'],
    });
  });

  it.each(['COMPLETED', 'ARCHIVED'] as const)(
    'does not mark a past-due %s task as overdue',
    (status) => {
      expect(asResponse(pastDueTask(status))).toMatchObject({
        isOverdue: false,
        warnings: [],
      });
    },
  );
});
