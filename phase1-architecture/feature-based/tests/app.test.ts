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

  it('duplicates a task as an unassigned TODO without changing the original', async () => {
    const app = buildApp();
    const created = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: {
        title: 'Prepare release',
        description: 'Confirm changelog',
        priority: 'HIGH',
        dueDate: '2030-01-15',
        category: 'release',
      },
    });
    const original = created.json() as { id: string };
    await app.inject({
      method: 'PATCH',
      url: `/tasks/${original.id}`,
      payload: { assigneeId: 'user-1' },
    });

    const duplicated = await app.inject({
      method: 'POST',
      url: `/tasks/${original.id}/duplicate`,
    });

    expect(duplicated.statusCode).toBe(201);
    expect(duplicated.json()).toMatchObject({
      title: 'Prepare release',
      description: 'Confirm changelog',
      priority: 'HIGH',
      dueDate: '2030-01-15',
      category: 'release',
      status: 'TODO',
    });
    expect(duplicated.json()).not.toHaveProperty('assigneeId');
    expect(duplicated.json().id).not.toBe(original.id);
    expect((await app.inject({ method: 'GET', url: `/tasks/${original.id}` })).json()).toMatchObject({
      status: 'TODO',
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
