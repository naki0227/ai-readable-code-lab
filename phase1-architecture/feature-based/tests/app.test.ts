import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
describe('feature baseline', () => {
  it('creates, updates, and retrieves a task category', async () => {
    const app = buildApp();
    const created = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: { title: 'Plan release', category: 'planning' },
    });

    expect(created.statusCode).toBe(201);
    const task = created.json() as { id: string; category?: string };
    expect(task.category).toBe('planning');

    const updated = await app.inject({
      method: 'PATCH',
      url: `/tasks/${task.id}`,
      payload: { category: 'delivery' },
    });
    expect(updated.json()).toMatchObject({ category: 'delivery' });
    expect((await app.inject({ method: 'GET', url: `/tasks/${task.id}` })).json()).toMatchObject({
      category: 'delivery',
    });
    expect((await app.inject({ method: 'GET', url: '/tasks' })).json()).toMatchObject([
      { category: 'delivery' },
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
