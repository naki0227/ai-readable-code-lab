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

  it('creates, updates, and retrieves a task category', async () => {
    const app = buildApp();
    const created = (
      await app.inject({
        method: 'POST',
        url: '/tasks',
        payload: { title: 'Categorized task', category: 'WORK' },
      })
    ).json() as { id: string; category?: string };

    expect(created).toMatchObject({ category: 'WORK' });

    const updated = (
      await app.inject({
        method: 'PATCH',
        url: `/tasks/${created.id}`,
        payload: { category: 'PERSONAL' },
      })
    ).json() as { category?: string };

    expect(updated).toMatchObject({ category: 'PERSONAL' });
    expect((await app.inject({ method: 'GET', url: `/tasks/${created.id}` })).json()).toMatchObject(
      { category: 'PERSONAL' },
    );

    await app.close();
  });
});
