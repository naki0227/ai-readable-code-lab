import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';

describe('overdue task status', () => {
  const app = buildApp();

  afterEach(async () => {
    await app.close();
  });

  it('does not mark a completed past-due task as overdue', async () => {
    const created = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: { title: 'Past-due task', dueDate: '2000-01-01' },
    });

    expect(created.json()).toMatchObject({ isOverdue: true });

    const completed = await app.inject({
      method: 'POST',
      url: `/tasks/${created.json().id}/complete`,
    });

    expect(completed.json()).toMatchObject({ status: 'COMPLETED', isOverdue: false });
  });
});
