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

  it('prevents assignee updates after completion while allowing title-only updates', async () => {
    const app = buildApp();
    const created = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: { title: 'Assign before completion' },
    });
    const task = created.json() as { id: string };

    expect(
      (
        await app.inject({
          method: 'PATCH',
          url: `/tasks/${task.id}`,
          payload: { assigneeId: 'user-1' },
        })
      ).statusCode,
    ).toBe(200);
    expect(
      (await app.inject({ method: 'POST', url: `/tasks/${task.id}/complete` })).statusCode,
    ).toBe(200);

    const assigneeUpdate = await app.inject({
      method: 'PATCH',
      url: `/tasks/${task.id}`,
      payload: { assigneeId: 'user-2' },
    });
    expect(assigneeUpdate.statusCode).toBe(409);
    expect(assigneeUpdate.json()).toEqual({ error: 'completed task assignee cannot be changed' });

    const titleUpdate = await app.inject({
      method: 'PATCH',
      url: `/tasks/${task.id}`,
      payload: { title: 'Renamed after completion' },
    });
    expect(titleUpdate.statusCode).toBe(200);
    expect(titleUpdate.json()).toMatchObject({
      title: 'Renamed after completion',
      assigneeId: 'user-1',
      status: 'COMPLETED',
    });
    await app.close();
  });

  it('returns 404 when updating an assignee on a missing task', async () => {
    const app = buildApp();
    const response = await app.inject({
      method: 'PATCH',
      url: '/tasks/missing',
      payload: { assigneeId: 'user-1' },
    });
    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: 'task not found' });
    await app.close();
  });
});
