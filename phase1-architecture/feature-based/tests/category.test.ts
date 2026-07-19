import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';

describe('task category', () => {
  it('persists an optional category through create, detail, and list responses', async () => {
    const app = buildApp();

    const created = (
      await app.inject({
        method: 'POST',
        url: '/tasks',
        payload: { title: 'Plan launch', category: 'work' },
      })
    ).json() as { id: string; category?: string };

    expect(created).toMatchObject({ category: 'work' });
    expect((await app.inject({ method: 'GET', url: `/tasks/${created.id}` })).json()).toMatchObject(
      {
        category: 'work',
      },
    );
    expect((await app.inject({ method: 'GET', url: '/tasks' })).json()).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: created.id, category: 'work' })]),
    );

    await app.close();
  });

  it('updates and preserves a category in detail and list responses', async () => {
    const app = buildApp();
    const created = (
      await app.inject({ method: 'POST', url: '/tasks', payload: { title: 'Plan launch' } })
    ).json() as { id: string };

    expect(
      (
        await app.inject({
          method: 'PATCH',
          url: `/tasks/${created.id}`,
          payload: { category: 'personal' },
        })
      ).json(),
    ).toMatchObject({ category: 'personal' });
    expect((await app.inject({ method: 'GET', url: `/tasks/${created.id}` })).json()).toMatchObject(
      {
        category: 'personal',
      },
    );
    expect((await app.inject({ method: 'GET', url: '/tasks' })).json()).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: created.id, category: 'personal' })]),
    );

    await app.close();
  });
});
