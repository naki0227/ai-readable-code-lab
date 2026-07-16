import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';

describe('task archiving', () => {
  const app = buildApp();

  afterEach(async () => {
    await app.close();
  });

  it('archives a task while retaining it for detail lookup', async () => {
    const created = await app.inject({
      method: 'POST',
      url: '/tasks',
      payload: { title: 'Archive me', dueDate: '2000-01-01' },
    });
    const { id } = created.json() as { id: string };

    const archived = await app.inject({ method: 'DELETE', url: `/tasks/${id}` });
    expect(archived.statusCode).toBe(200);
    expect(archived.json()).toMatchObject({ status: 'ARCHIVED', isOverdue: false });
    expect((await app.inject({ method: 'GET', url: '/tasks' })).json()).toEqual([]);
    expect((await app.inject({ method: 'GET', url: `/tasks/${id}` })).json()).toMatchObject({
      status: 'ARCHIVED',
    });
  });
});
