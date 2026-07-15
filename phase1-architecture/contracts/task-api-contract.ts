import type { FastifyInstance } from 'fastify';
import { describe, expect, it } from 'vitest';

type BuildApp = () => FastifyInstance;

export function taskApiContract(name: string, buildApp: BuildApp) {
  describe(`${name} task API contract`, () => {
    it('supports the same task lifecycle and error responses', async () => {
      const app = buildApp();
      const invalid = await app.inject({ method: 'POST', url: '/tasks', payload: { title: ' ' } });
      expect(invalid.statusCode).toBe(400);

      const created = await app.inject({
        method: 'POST',
        url: '/tasks',
        payload: {
          title: 'Contract task',
          description: 'shared',
          priority: 'HIGH',
          dueDate: '2000-01-01',
        },
      });
      expect(created.statusCode).toBe(201);
      const task = created.json() as { id: string; isOverdue: boolean; status: string };
      expect(task).toMatchObject({
        title: 'Contract task',
        priority: 'HIGH',
        isOverdue: true,
        status: 'TODO',
        warnings: ['due date is in the past'],
      });

      const updated = await app.inject({
        method: 'PATCH',
        url: `/tasks/${task.id}`,
        payload: { title: 'Updated task', priority: 'LOW' },
      });
      expect(updated.json()).toMatchObject({ title: 'Updated task', priority: 'LOW' });
      expect(
        (await app.inject({ method: 'PATCH', url: `/tasks/${task.id}`, payload: { title: '' } }))
          .statusCode,
      ).toBe(400);
      expect(
        (
          await app.inject({
            method: 'PATCH',
            url: `/tasks/${task.id}`,
            payload: { assigneeId: 'missing' },
          })
        ).statusCode,
      ).toBe(404);
      expect(
        (
          await app.inject({
            method: 'PATCH',
            url: `/tasks/${task.id}`,
            payload: { assigneeId: 'user-1' },
          })
        ).json(),
      ).toMatchObject({ assigneeId: 'user-1' });

      const completed = await app.inject({ method: 'POST', url: `/tasks/${task.id}/complete` });
      expect(completed.json()).toMatchObject({ status: 'COMPLETED', isOverdue: false });
      expect(
        (await app.inject({ method: 'POST', url: `/tasks/${task.id}/complete` })).statusCode,
      ).toBe(409);

      expect(
        (await app.inject({ method: 'POST', url: `/tasks/${task.id}/archive` })).json(),
      ).toMatchObject({ status: 'ARCHIVED' });
      expect(
        (await app.inject({ method: 'GET', url: `/tasks/${task.id}/history` })).json(),
      ).toMatchObject([
        { action: 'CREATED' },
        { action: 'UPDATED' },
        { action: 'ASSIGNEE_CHANGED' },
        { action: 'COMPLETED' },
        { action: 'ARCHIVED' },
      ]);
      expect((await app.inject({ method: 'GET', url: '/tasks' })).json()).toEqual([]);
      expect((await app.inject({ method: 'GET', url: '/tasks/missing' })).statusCode).toBe(404);
      await app.close();
    });
  });
}
