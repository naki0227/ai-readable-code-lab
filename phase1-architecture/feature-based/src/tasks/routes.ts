import type { FastifyInstance } from 'fastify';
import { TaskRepository } from './repository.js';
import { asResponse } from './task.js';
export function registerTaskRoutes(app: FastifyInstance) {
  const repository = new TaskRepository();
  const now = () => new Date().toISOString();
  app.post<{
    Body: {
      title?: string;
      description?: string;
      priority?: 'LOW' | 'MEDIUM' | 'HIGH';
      dueDate?: string;
    };
  }>('/tasks', async (r, reply) => {
    if (!r.body?.title?.trim()) return reply.code(400).send({ error: 'title is required' });
    const timestamp = now();
    const task = repository.create({
      title: r.body.title.trim(),
      description: r.body.description,
      priority: r.body.priority ?? 'MEDIUM',
      dueDate: r.body.dueDate,
      status: 'TODO',
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    return reply.code(201).send(asResponse(task));
  });
  app.get('/tasks', async () =>
    repository
      .list()
      .filter((task) => task.status !== 'ARCHIVED')
      .map(asResponse),
  );
  app.get<{ Params: { id: string } }>('/tasks/:id', async (r, reply) => {
    const task = repository.find(r.params.id);
    return task ? asResponse(task) : reply.code(404).send({ error: 'task not found' });
  });
  app.patch<{
    Params: { id: string };
    Body: {
      title?: string;
      description?: string;
      priority?: 'LOW' | 'MEDIUM' | 'HIGH';
      dueDate?: string;
      assigneeId?: string;
    };
  }>('/tasks/:id', async (r, reply) => {
    const task = repository.find(r.params.id);
    if (!task) return reply.code(404).send({ error: 'task not found' });
    if (r.body.title !== undefined && !r.body.title.trim())
      return reply.code(400).send({ error: 'title is required' });
    if (r.body.assigneeId !== undefined && task.status === 'COMPLETED')
      return reply.code(409).send({ error: 'completed task assignee cannot be changed' });
    if (r.body.assigneeId !== undefined && !['user-1', 'user-2'].includes(r.body.assigneeId))
      return reply.code(404).send({ error: 'assignee not found' });
    Object.assign(task, r.body, { title: r.body.title?.trim() ?? task.title, updatedAt: now() });
    return asResponse(task);
  });
  app.post<{ Params: { id: string } }>('/tasks/:id/complete', async (r, reply) => {
    const task = repository.find(r.params.id);
    if (!task) return reply.code(404).send({ error: 'task not found' });
    if (task.status === 'COMPLETED')
      return reply.code(409).send({ error: 'task is already completed' });
    task.status = 'COMPLETED';
    task.updatedAt = now();
    return asResponse(task);
  });
  app.delete<{ Params: { id: string } }>('/tasks/:id', async (r, reply) => {
    const task = repository.find(r.params.id);
    if (!task) return reply.code(404).send({ error: 'task not found' });
    repository.remove(task.id);
    return reply.code(204).send();
  });
}
