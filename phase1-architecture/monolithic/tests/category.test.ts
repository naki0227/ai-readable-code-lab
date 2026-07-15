import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';

describe('Task 01: category', () => {
  it('returns category after creating and updating a task', async () => {
    const app = buildApp();
    const created = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: { title: 'Categorize experiment', category: 'research' },
    });
    const task = created.json() as { id: string; category?: string };
    expect(task.category).toBe('research');

    const updated = await app.inject({
      method: 'PATCH',
      url: `/tasks/${task.id}`,
      payload: { category: 'analysis' },
    });
    expect(updated.json()).toMatchObject({ category: 'analysis' });
    expect((await app.inject({ method: 'GET', url: `/tasks/${task.id}` })).json()).toMatchObject({
      category: 'analysis',
    });
    await app.close();
  });
});
