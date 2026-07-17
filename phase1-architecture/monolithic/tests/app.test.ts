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

  it('rejects assignee changes for completed tasks but allows title-only updates', async () => {
    const app = buildApp();
    const created = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: { title: 'Write experiment' },
    });
    const task = created.json() as { id: string };
    await app.inject({ method: 'POST', url: `/tasks/${task.id}/complete` });

    const assigneeUpdate = await app.inject({
      method: 'PATCH',
      url: `/tasks/${task.id}`,
      payload: { assigneeId: 'user-1' },
    });
    expect(assigneeUpdate.statusCode).toBe(409);
    expect(assigneeUpdate.json()).toEqual({ error: 'cannot change assignee of a completed task' });

    const titleUpdate = await app.inject({
      method: 'PATCH',
      url: `/tasks/${task.id}`,
      payload: { title: 'Write final experiment' },
    });
    expect(titleUpdate.statusCode).toBe(200);
    expect(titleUpdate.json()).toMatchObject({
      title: 'Write final experiment',
      status: 'COMPLETED',
    });
    await app.close();
  });

  it('returns 404 when updating a missing task', async () => {
    const app = buildApp();
    const update = await app.inject({
      method: 'PATCH',
      url: '/tasks/missing',
      payload: { assigneeId: 'user-1' },
    });
    expect(update.statusCode).toBe(404);
    expect(update.json()).toEqual({ error: 'task not found' });
    await app.close();
  });
});
