import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { TaskRepository } from '../src/repository.js';
import { TaskService } from '../src/service.js';

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

  it('duplicates task fields and category without copying its assignment or status', async () => {
    const repository = new TaskRepository();
    repository.save({
      id: 'original',
      title: 'Original task',
      description: 'Keep these details',
      priority: 'HIGH',
      dueDate: '2030-01-01',
      category: 'Planning',
      status: 'IN_PROGRESS',
      createdAt: '2029-01-01T00:00:00.000Z',
      updatedAt: '2029-01-02T00:00:00.000Z',
    });
    const app = buildApp(new TaskService(repository, () => '2030-02-01T00:00:00.000Z'));

    const assignmentResponse = await app.inject({
      method: 'PATCH',
      url: '/tasks/original',
      payload: { assigneeId: 'user-1' },
    });
    expect(assignmentResponse.statusCode).toBe(200);

    const duplicateResponse = await app.inject({
      method: 'POST',
      url: '/tasks/original/duplicate',
    });
    const duplicate = duplicateResponse.json() as Record<string, unknown>;

    expect(duplicateResponse.statusCode).toBe(201);
    expect(duplicate).toMatchObject({
      title: 'Original task',
      description: 'Keep these details',
      priority: 'HIGH',
      dueDate: '2030-01-01',
      category: 'Planning',
      status: 'TODO',
      createdAt: '2030-02-01T00:00:00.000Z',
      updatedAt: '2030-02-01T00:00:00.000Z',
    });
    expect(duplicate.id).not.toBe('original');
    expect(duplicate.assigneeId).toBeUndefined();

    expect((await app.inject({ method: 'GET', url: '/tasks/original' })).json()).toMatchObject({
      id: 'original',
      status: 'IN_PROGRESS',
      assigneeId: 'user-1',
    });
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
