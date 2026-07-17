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

  it('archives tasks instead of deleting them', async () => {
    const app = buildApp();
    const created = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: { title: 'Archive me', dueDate: '2000-01-01' },
    });
    const task = created.json() as { id: string };

    const archived = await app.inject({ method: 'DELETE', url: `/tasks/${task.id}` });
    expect(archived.statusCode).toBe(204);

    expect((await app.inject({ method: 'GET', url: '/tasks' })).json()).toEqual([]);
    expect((await app.inject({ method: 'GET', url: `/tasks/${task.id}` })).json()).toMatchObject({
      id: task.id,
      title: 'Archive me',
      status: 'ARCHIVED',
      isOverdue: false,
    });
    expect((await app.inject({ method: 'DELETE', url: '/tasks/missing' })).statusCode).toBe(404);
    await app.close();
  });
});
