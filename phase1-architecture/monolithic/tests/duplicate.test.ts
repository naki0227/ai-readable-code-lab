import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';

describe('task duplication', () => {
  it('creates an independent unassigned TODO copy with copied task details', async () => {
    const app = buildApp();
    const created = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: {
        title: 'Copy me',
        description: 'details',
        category: 'planning',
        priority: 'HIGH',
        dueDate: '2030-01-01',
      },
    });
    const original = created.json() as { id: string };
    await app.inject({
      method: 'PATCH',
      url: `/tasks/${original.id}`,
      payload: { assigneeId: 'user-1' },
    });

    const duplicated = await app.inject({ method: 'POST', url: `/tasks/${original.id}/duplicate` });

    expect(duplicated.statusCode).toBe(201);
    expect(duplicated.json()).toMatchObject({
      title: 'Copy me',
      description: 'details',
      category: 'planning',
      priority: 'HIGH',
      dueDate: '2030-01-01',
      status: 'TODO',
    });
    expect(duplicated.json()).not.toHaveProperty('assigneeId');
    expect(duplicated.json().id).not.toBe(original.id);
    expect(
      (await app.inject({ method: 'GET', url: `/tasks/${original.id}` })).json(),
    ).toMatchObject({
      title: 'Copy me',
      description: 'details',
      category: 'planning',
      priority: 'HIGH',
      dueDate: '2030-01-01',
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
