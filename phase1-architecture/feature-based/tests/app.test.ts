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

  it('duplicates a task as an unassigned TODO without changing the source', async () => {
    const app = buildApp();
    const source = (
      await app.inject({
        method: 'POST',
        url: '/tasks',
        payload: {
          title: 'Source task',
          description: 'Copy this description',
          priority: 'HIGH',
          dueDate: '2030-01-02',
          category: 'Planning',
        },
      })
    ).json() as {
      id: string;
      createdAt: string;
      updatedAt: string;
    };
    await app.inject({
      method: 'PATCH',
      url: `/tasks/${source.id}`,
      payload: { assigneeId: 'user-1' },
    });
    await app.inject({ method: 'POST', url: `/tasks/${source.id}/complete` });
    const sourceBeforeDuplicate = (
      await app.inject({ method: 'GET', url: `/tasks/${source.id}` })
    ).json() as { createdAt: string };

    const duplicated = await app.inject({ method: 'POST', url: `/tasks/${source.id}/duplicate` });

    expect(duplicated.statusCode).toBe(201);
    expect(duplicated.json()).toMatchObject({
      title: 'Source task',
      description: 'Copy this description',
      priority: 'HIGH',
      dueDate: '2030-01-02',
      category: 'Planning',
      status: 'TODO',
    });
    const duplicate = duplicated.json() as {
      id: string;
      assigneeId?: string;
      createdAt: string;
      updatedAt: string;
    };
    expect(duplicate.id).not.toBe(source.id);
    expect(duplicate.assigneeId).toBeUndefined();
    expect(duplicate.createdAt).not.toBe(sourceBeforeDuplicate.createdAt);
    expect(duplicate.updatedAt).toBe(duplicate.createdAt);
    expect((await app.inject({ method: 'GET', url: `/tasks/${source.id}` })).json()).toEqual(
      sourceBeforeDuplicate,
    );
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
