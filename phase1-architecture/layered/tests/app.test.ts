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

  it('archives a task through DELETE while preserving it for detail lookup', async () => {
    const app = buildApp();
    const created = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: { title: 'Past due task', dueDate: '2000-01-01' },
    });
    const task = created.json() as { id: string };

    const archived = await app.inject({ method: 'DELETE', url: `/tasks/${task.id}` });
    expect(archived.statusCode).toBe(200);
    expect(archived.json()).toMatchObject({
      id: task.id,
      status: 'ARCHIVED',
      isOverdue: false,
      warnings: [],
    });
    expect((await app.inject({ method: 'GET', url: '/tasks' })).json()).toEqual([]);
    expect((await app.inject({ method: 'GET', url: `/tasks/${task.id}` })).json()).toMatchObject({
      id: task.id,
      status: 'ARCHIVED',
      isOverdue: false,
      warnings: [],
    });
    expect((await app.inject({ method: 'GET', url: '/tasks/missing' })).statusCode).toBe(404);
    expect((await app.inject({ method: 'DELETE', url: '/tasks/missing' })).statusCode).toBe(404);
    await app.close();
  });
});
