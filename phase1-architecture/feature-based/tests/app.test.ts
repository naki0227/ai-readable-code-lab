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

  it('archives deleted tasks while retaining an archival-safe detail response', async () => {
    const app = buildApp();
    const created = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: {
        title: 'Past due task',
        description: 'Retain this detail',
        dueDate: '2000-01-01',
      },
    });
    const task = created.json() as {
      id: string;
      title: string;
      description: string;
      dueDate: string;
    };

    const archived = await app.inject({ method: 'DELETE', url: `/tasks/${task.id}` });
    expect(archived.statusCode).toBe(200);
    expect(archived.json()).toMatchObject({
      id: task.id,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      status: 'ARCHIVED',
      isOverdue: false,
      warnings: [],
    });

    const detail = await app.inject({ method: 'GET', url: `/tasks/${task.id}` });
    expect(detail.statusCode).toBe(200);
    expect(detail.json()).toMatchObject({
      id: task.id,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      status: 'ARCHIVED',
      isOverdue: false,
      warnings: [],
    });
    expect((await app.inject({ method: 'GET', url: '/tasks' })).json()).toEqual([]);
    await app.close();
  });
});
