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

  it('duplicates a task without changing the original', async () => {
    const app = buildApp();
    let original = (
      await app.inject({
        method: 'POST',
        url: '/tasks',
        payload: {
          title: 'Prepare release',
          description: 'Write notes',
          priority: 'HIGH',
          dueDate: '2026-08-01',
          category: 'release',
        },
      })
    ).json() as {
      id: string;
      title: string;
      description: string;
      priority: string;
      dueDate: string;
      category: string;
      assigneeId?: string;
      status: string;
      createdAt: string;
      updatedAt: string;
    };

    original = (
      await app.inject({
        method: 'PATCH',
        url: `/tasks/${original.id}`,
        payload: { assigneeId: 'user-1' },
      })
    ).json() as typeof original;

    const response = await app.inject({
      method: 'POST',
      url: `/tasks/${original.id}/duplicate`,
    });
    const duplicate = response.json() as typeof original;

    expect(response.statusCode).toBe(201);
    expect(duplicate).toMatchObject({
      title: original.title,
      description: original.description,
      priority: original.priority,
      dueDate: original.dueDate,
      category: original.category,
      status: 'TODO',
    });
    expect(duplicate.id).not.toBe(original.id);
    expect(duplicate.assigneeId).toBeUndefined();
    expect(original.assigneeId).toBe('user-1');
    expect(duplicate.createdAt).toBeDefined();
    expect(duplicate.updatedAt).toBeDefined();
    expect(
      (await app.inject({ method: 'GET', url: `/tasks/${original.id}` })).json(),
    ).toMatchObject(original);
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
