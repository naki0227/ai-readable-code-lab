import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';

describe('monolithic baseline', () => {
  it('creates, updates, and returns an optional category', async () => {
    const app = buildApp();
    const created = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: { title: 'Plan release', category: 'Planning' },
    });

    expect(created.statusCode).toBe(201);
    const task = created.json() as { id: string; category?: string };
    expect(task.category).toBe('Planning');

    const updated = await app.inject({
      method: 'PATCH',
      url: `/tasks/${task.id}`,
      payload: { category: 'Release' },
    });
    expect(updated.json()).toMatchObject({ category: 'Release' });

    expect((await app.inject({ method: 'GET', url: `/tasks/${task.id}` })).json()).toMatchObject({
      category: 'Release',
    });
    expect((await app.inject({ method: 'GET', url: '/tasks' })).json()).toMatchObject([
      { id: task.id, category: 'Release' },
    ]);
    await app.close();
  });

  it('creates, completes, and excludes archived behavior through its API', async () => {
    const app = buildApp();
    const created = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: { title: 'Write experiment' },
    });
    expect(created.statusCode).toBe(201);
    const task = created.json() as { id: string; status: string };
    const completed = await app.inject({ method: 'POST', url: `/tasks/${task.id}/complete` });
    expect(completed.json()).toMatchObject({ status: 'COMPLETED', isOverdue: false });
    expect(
      (await app.inject({ method: 'POST', url: `/tasks/${task.id}/complete` })).statusCode,
    ).toBe(409);
    await app.close();
  });
});
