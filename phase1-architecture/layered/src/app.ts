import Fastify from 'fastify';
import { TaskService } from './service.js';
export function buildApp() {
  const app = Fastify();
  const service = new TaskService();
  const respond = (task: ReturnType<TaskService['view']>) => task;
  app.post<{ Body: { title?: string; priority?: 'LOW' | 'MEDIUM' | 'HIGH'; dueDate?: string } }>(
    '/tasks',
    async (r, reply) => {
      try {
        return reply.code(201).send(respond(service.view(service.create(r.body))));
      } catch (e) {
        return reply.code(400).send({ error: (e as Error).message });
      }
    },
  );
  app.get('/tasks', async () => service.list().map((task) => respond(service.view(task))));
  app.get<{ Params: { id: string } }>('/tasks/:id', async (r, reply) => {
    const task = service.get(r.params.id);
    return task ? respond(service.view(task)) : reply.code(404).send({ error: 'task not found' });
  });
  app.post<{ Params: { id: string } }>('/tasks/:id/complete', async (r, reply) => {
    try {
      return respond(service.view(service.complete(r.params.id)));
    } catch (e) {
      const message = (e as Error).message;
      return reply.code(message === 'task not found' ? 404 : 409).send({ error: message });
    }
  });
  return app;
}
