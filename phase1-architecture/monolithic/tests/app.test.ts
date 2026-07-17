import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';

describe('monolithic baseline', () => {
  it('duplicates task content into a new TODO task', async () => {
    const app = buildApp();
    const created = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: {
        title: 'Prepare release notes',
        description: 'Summarize the changes',
        priority: 'HIGH',
        dueDate: '2030-01-02',
      },
    });
    const source = created.json() as {
      id: string;
      title: string;
      description?: string;
      priority: string;
      dueDate?: string;
      status: string;
      createdAt: string;
      updatedAt: string;
    };
    const assigned = await app.inject({
      method: 'PATCH',
      url: `/tasks/${source.id}`,
      payload: { assigneeId: 'user-1' },
    });
    const original = assigned.json() as typeof source & { assigneeId?: string };

    const duplicated = await app.inject({ method: 'POST', url: `/tasks/${source.id}/duplicate` });

    expect(duplicated.statusCode).toBe(201);
    const duplicate = duplicated.json() as typeof source & { assigneeId?: string };
    expect(duplicate).toMatchObject({
      title: 'Prepare release notes',
      description: 'Summarize the changes',
      priority: 'HIGH',
      dueDate: '2030-01-02',
      status: 'TODO',
    });
    expect(duplicate.id).not.toBe(source.id);
    expect(duplicate.createdAt).toEqual(expect.any(String));
    expect(duplicate.updatedAt).toBe(duplicate.createdAt);
    expect(duplicate.assigneeId).toBeUndefined();

    const unchanged = await app.inject({ method: 'GET', url: `/tasks/${source.id}` });
    expect(unchanged.statusCode).toBe(200);
    expect(unchanged.json()).toMatchObject(original);
    await app.close();
  });

  it('returns 404 when duplicating a missing task', async () => {
    const app = buildApp();

    const duplicated = await app.inject({ method: 'POST', url: '/tasks/missing/duplicate' });

    expect(duplicated.statusCode).toBe(404);
    expect(duplicated.json()).toEqual({ error: 'task not found' });
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
