import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';

describe('task duplication', () => {
  const app = buildApp();

  afterEach(async () => {
    await app.close();
  });

  it('creates an independent unassigned TODO copy', async () => {
    const created = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: {
        title: 'Copy me',
        description: 'details',
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
      priority: 'HIGH',
      dueDate: '2030-01-01',
      status: 'TODO',
    });
    expect(duplicated.json()).not.toHaveProperty('assigneeId');
    expect(duplicated.json().id).not.toBe(original.id);
    expect(
      (await app.inject({ method: 'GET', url: `/tasks/${original.id}` })).json(),
    ).toMatchObject({
      assigneeId: 'user-1',
    });
  });
});
