import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../src/app.js';

afterEach(() => {
  vi.useRealTimers();
});

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

  it('duplicates selected source fields without changing the original task', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-19T00:00:00.000Z'));
    const app = buildApp();
    const source = (
      await app.inject({
        method: 'POST',
        url: '/tasks',
        payload: {
          title: 'Source task',
          description: 'Keep this',
          priority: 'HIGH',
          dueDate: '2026-08-01',
          category: 'Planning',
        },
      })
    ).json() as Record<string, string>;
    await app.inject({
      method: 'PATCH',
      url: `/tasks/${source.id}`,
      payload: { assigneeId: 'user-1' },
    });
    await app.inject({ method: 'POST', url: `/tasks/${source.id}/complete` });

    vi.advanceTimersByTime(1);
    const duplicated = await app.inject({ method: 'POST', url: `/tasks/${source.id}/duplicate` });
    const duplicate = duplicated.json() as Record<string, string | undefined>;

    expect(duplicated.statusCode).toBe(201);
    expect(duplicate).toMatchObject({
      title: 'Source task',
      description: 'Keep this',
      priority: 'HIGH',
      dueDate: '2026-08-01',
      category: 'Planning',
      status: 'TODO',
    });
    expect(duplicate).not.toHaveProperty('assigneeId');
    expect(duplicate.id).not.toBe(source.id);
    expect(duplicate.createdAt).not.toBe(source.createdAt);
    expect(duplicate.updatedAt).toBe(duplicate.createdAt);
    expect((await app.inject({ method: 'GET', url: `/tasks/${source.id}` })).json()).toMatchObject({
      id: source.id,
      status: 'COMPLETED',
      assigneeId: 'user-1',
    });
    await app.close();
  });

  it('returns 404 when duplicating a missing task', async () => {
    const app = buildApp();
    const response = await app.inject({ method: 'POST', url: '/tasks/missing/duplicate' });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: 'task not found' });
    await app.close();
  });
});
