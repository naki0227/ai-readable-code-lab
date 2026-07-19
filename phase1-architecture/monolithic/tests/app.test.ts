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

  it('rejects reassignment of a completed task while retaining its assignee', async () => {
    const app = buildApp();
    const created = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: { title: 'Keep completed task assignee' },
    });
    const { id } = created.json() as { id: string };

    expect(
      (
        await app.inject({
          method: 'PATCH',
          url: `/tasks/${id}`,
          payload: { assigneeId: 'user-1' },
        })
      ).statusCode,
    ).toBe(200);
    await app.inject({ method: 'POST', url: `/tasks/${id}/complete` });
    const assignment = await app.inject({
      method: 'PATCH',
      url: `/tasks/${id}`,
      payload: { assigneeId: 'user-2' },
    });

    expect(assignment.statusCode).toBe(409);
    expect(assignment.json()).toEqual({ error: 'completed task cannot be assigned' });
    expect((await app.inject({ method: 'GET', url: `/tasks/${id}` })).json()).toMatchObject({
      assigneeId: 'user-1',
      status: 'COMPLETED',
    });
    await app.close();
  });

  it('keeps unknown assignee updates as not found', async () => {
    const app = buildApp();
    const created = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: { title: 'Reject missing assignee' },
    });
    const { id } = created.json() as { id: string };

    const assignment = await app.inject({
      method: 'PATCH',
      url: `/tasks/${id}`,
      payload: { assigneeId: 'missing-user' },
    });

    expect(assignment.statusCode).toBe(404);
    expect(assignment.json()).toEqual({ error: 'assignee not found' });
    await app.close();
  });
});
