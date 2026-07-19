import { describe, expect, it } from 'vitest';
import { isOverdue, type Status, type Task } from '../src/domain.js';

const pastDueTask = (status: Status): Task => ({
  id: 'task-1',
  title: 'Past due task',
  status,
  priority: 'MEDIUM',
  dueDate: '2000-01-01',
  createdAt: '2000-01-01T00:00:00.000Z',
  updatedAt: '2000-01-01T00:00:00.000Z',
});

describe('isOverdue', () => {
  it('does not treat a task due today as overdue when today includes a time', () => {
    expect(isOverdue(pastDueTask('TODO'), '2000-01-01T12:00:00.000Z')).toBe(false);
  });

  it.each<Status>(['TODO', 'IN_PROGRESS'])('returns true for past due %s tasks', (status) => {
    expect(isOverdue(pastDueTask(status), '2000-01-02')).toBe(true);
  });

  it.each<Status>(['COMPLETED', 'ARCHIVED'])('returns false for past due %s tasks', (status) => {
    expect(isOverdue(pastDueTask(status), '2000-01-02')).toBe(false);
  });
});
