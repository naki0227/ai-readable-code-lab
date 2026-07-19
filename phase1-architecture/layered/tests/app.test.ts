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
  it('duplicates a task with reset workflow fields', async () => {
    const app = buildApp();
    const original = (
      await app.inject({
        method: 'POST',
        url: '/tasks',
        payload: {
          title: 'Prepare release',
          description: 'Copy the checklist',
          priority: 'HIGH',
          category: 'release',
          dueDate: '2030-01-01',
        },
      })
    ).json() as { id: string };
    await app.inject({
      method: 'PATCH',
      url: `/tasks/${original.id}`,
      payload: { assigneeId: 'user-1' },
    });
    await app.inject({ method: 'POST', url: `/tasks/${original.id}/complete` });

    const response = await app.inject({ method: 'POST', url: `/tasks/${original.id}/duplicate` });
    expect(response.statusCode).toBe(201);
    const duplicate = response.json() as { id: string };
    expect(duplicate).toMatchObject({
      title: 'Prepare release',
      description: 'Copy the checklist',
      priority: 'HIGH',
      category: 'release',
      dueDate: '2030-01-01',
      status: 'TODO',
    });
    expect(duplicate.id).not.toBe(original.id);
    expect(duplicate).not.toHaveProperty('assigneeId');
    expect(duplicate).toHaveProperty('createdAt');
    expect(duplicate).toHaveProperty('updatedAt');
    expect((await app.inject({ method: 'GET', url: `/tasks/${original.id}` })).json()).toMatchObject({
      status: 'COMPLETED',
      assigneeId: 'user-1',
    });
    await app.close();
  });

  it('returns 404 when duplicating an unknown task', async () => {
    const app = buildApp();
    const response = await app.inject({ method: 'POST', url: '/tasks/missing/duplicate' });
    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: 'task not found' });
    await app.close();
  });
});
