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

  it('duplicates a task without its assignee and resets its status', async () => {
    const app = buildApp();
    const created = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: {
        title: 'Prepare release notes',
        description: 'Summarize the changes',
        category: 'release',
        priority: 'HIGH',
        dueDate: '2030-01-15',
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
      title: 'Prepare release notes',
      description: 'Summarize the changes',
      category: 'release',
      priority: 'HIGH',
      dueDate: '2030-01-15',
      status: 'TODO',
    });
    expect(duplicated.json()).not.toHaveProperty('assigneeId');
    expect(duplicated.json().id).not.toBe(original.id);
    expect(duplicated.json().createdAt).toEqual(expect.any(String));
    expect(duplicated.json().updatedAt).toEqual(expect.any(String));
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
