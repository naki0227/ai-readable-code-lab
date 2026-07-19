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

  it('supports an optional category across task responses and preserves it on unrelated updates', async () => {
    const app = buildApp();
    const created = (
      await app.inject({
        method: 'POST',
        url: '/tasks',
        payload: { title: 'Categorized task', category: 'work' },
      })
    ).json() as { id: string; category?: string };

    expect(created).toMatchObject({ category: 'work' });
    expect((await app.inject({ method: 'GET', url: `/tasks/${created.id}` })).json()).toMatchObject(
      { category: 'work' },
    );
    expect((await app.inject({ method: 'GET', url: '/tasks' })).json()).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: created.id, category: 'work' })]),
    );

    expect(
      (
        await app.inject({
          method: 'PATCH',
          url: `/tasks/${created.id}`,
          payload: { priority: 'HIGH' },
        })
      ).json(),
    ).toMatchObject({ category: 'work', priority: 'HIGH' });
    expect(
      (
        await app.inject({
          method: 'PATCH',
          url: `/tasks/${created.id}`,
          payload: { category: 'personal' },
        })
      ).json(),
    ).toMatchObject({ category: 'personal' });
    await app.close();
  });
});
