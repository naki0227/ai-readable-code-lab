import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';

describe('monolithic baseline', () => {
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

  it('duplicates task details into a new unassigned TODO task without changing the source', async () => {
    const app = buildApp();
    const created = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: {
        title: 'Write experiment',
        description: 'Record results',
        priority: 'HIGH',
        dueDate: '2030-01-01',
        category: 'research',
      },
    });
    const source = created.json() as { id: string };
    await app.inject({
      method: 'PATCH',
      url: `/tasks/${source.id}`,
      payload: { assigneeId: 'user-1' },
    });

    const duplicated = await app.inject({ method: 'POST', url: `/tasks/${source.id}/duplicate` });

    expect(duplicated.statusCode).toBe(201);
    expect(duplicated.json()).toMatchObject({
      title: 'Write experiment',
      description: 'Record results',
      priority: 'HIGH',
      dueDate: '2030-01-01',
      category: 'research',
      status: 'TODO',
    });
    expect(duplicated.json()).not.toHaveProperty('assigneeId');
    expect(duplicated.json().id).not.toBe(source.id);
    expect((await app.inject({ method: 'GET', url: `/tasks/${source.id}` })).json()).toMatchObject({
      assigneeId: 'user-1',
      status: 'TODO',
    });
    await app.close();
  });

  it('returns 404 when duplicating a missing task', async () => {
    const app = buildApp();

    expect((await app.inject({ method: 'POST', url: '/tasks/missing/duplicate' })).statusCode).toBe(
      404,
    );
    await app.close();
  });
});
