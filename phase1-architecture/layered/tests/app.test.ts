import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
describe('layered baseline', () => {
  it('persists category through creation, updates, and retrieval', async () => {
    const app = buildApp();
    const created = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: { title: 'Categorized task', category: 'Work' },
    });

    expect(created.statusCode).toBe(201);
    const task = created.json() as { id: string; category?: string };
    expect(task.category).toBe('Work');

    const updated = await app.inject({
      method: 'PATCH',
      url: `/tasks/${task.id}`,
      payload: { category: 'Personal' },
    });
    expect(updated.json()).toMatchObject({ category: 'Personal' });
    expect((await app.inject({ method: 'GET', url: `/tasks/${task.id}` })).json()).toMatchObject({
      category: 'Personal',
    });
    expect((await app.inject({ method: 'GET', url: '/tasks' })).json()).toMatchObject([
      { id: task.id, category: 'Personal' },
    ]);
    await app.close();
  });

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
});
