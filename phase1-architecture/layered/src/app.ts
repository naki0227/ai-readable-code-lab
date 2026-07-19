import Fastify from 'fastify';
import { TaskService } from './service.js';
export function buildApp(service = new TaskService()) {
  const app = Fastify();
  const respond = (task: ReturnType<TaskService['view']>) => task;
  app.post<{
    Body: {
      title?: string;
      description?: string;
      priority?: 'LOW' | 'MEDIUM' | 'HIGH';
      dueDate?: string;
      category?: string;
      assigneeId?: string;
    };
  }>('/tasks', async (r, reply) => {
    try {
      return reply.code(201).send(respond(service.view(service.create(r.body))));
    } catch (e) {
      return reply.code(400).send({ error: (e as Error).message });
    }
  });
  app.get('/tasks', async () => service.list().map((task) => respond(service.view(task))));
  app.get<{ Params: { id: string } }>('/tasks/:id', async (r, reply) => {
    const task = service.get(r.params.id);
    return task ? respond(service.view(task)) : reply.code(404).send({ error: 'task not found' });
  });
  app.post<{ Params: { id: string } }>('/tasks/:id/duplicate', async (r, reply) => {
    try {
      return reply.code(201).send(respond(service.view(service.duplicate(r.params.id))));
    } catch (e) {
      return reply.code(404).send({ error: (e as Error).message });
    }
  });
  app.patch<{
    Params: { id: string };
    Body: {
      title?: string;
      description?: string;
      priority?: 'LOW' | 'MEDIUM' | 'HIGH';
      dueDate?: string;
      category?: string;
      assigneeId?: string;
    };
  }>('/tasks/:id', async (r, reply) => {
    try {
      return respond(service.view(service.update(r.params.id, r.body)));
    } catch (e) {
      const message = (e as Error).message;
      return reply.code(message === 'title is required' ? 400 : 404).send({ error: message });
    }
  });
  app.post<{ Params: { id: string } }>('/tasks/:id/complete', async (r, reply) => {
    try {
      return respond(service.view(service.complete(r.params.id)));
    } catch (e) {
      const message = (e as Error).message;
      return reply.code(message === 'task not found' ? 404 : 409).send({ error: message });
    }
  });
  app.delete<{ Params: { id: string } }>('/tasks/:id', async (r, reply) => {
    try {
      service.remove(r.params.id);
      return reply.code(204).send();
    } catch (e) {
      return reply.code(404).send({ error: (e as Error).message });
    }
  });
  return app;
}
