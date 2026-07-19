import Fastify from 'fastify';

type Status = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
type Task = {
  id: string;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  dueDate?: string;
  assigneeId?: string;
  createdAt: string;
  updatedAt: string;
};
type CreateTask = { title: string; description?: string; priority?: Priority; dueDate?: string };
type UpdateTask = Partial<CreateTask> & { assigneeId?: string };

export function buildApp() {
  const app = Fastify();
  const tasks = new Map<string, Task>();
  let sequence = 0;
  const now = () => new Date().toISOString();
  const isOverdue = (task: Task) =>
    !['COMPLETED', 'ARCHIVED'].includes(task.status) &&
    Boolean(task.dueDate && task.dueDate < now().slice(0, 10));
  const response = (task: Task) => {
    const overdue = isOverdue(task);
    return {
      ...task,
      isOverdue: overdue,
      warnings: overdue ? ['due date is in the past'] : [],
    };
  };
  const hasUser = (id: string) => id === 'user-1' || id === 'user-2';

  app.post<{ Body: CreateTask }>('/tasks', async (request, reply) => {
    if (!request.body?.title?.trim()) return reply.code(400).send({ error: 'title is required' });
    const timestamp = now();
    const task: Task = {
      id: String(++sequence),
      title: request.body.title.trim(),
      description: request.body.description,
      priority: request.body.priority ?? 'MEDIUM',
      dueDate: request.body.dueDate,
      status: 'TODO',
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    tasks.set(task.id, task);
    return reply.code(201).send(response(task));
  });
  app.get('/tasks', async () =>
    [...tasks.values()].filter((task) => task.status !== 'ARCHIVED').map(response),
  );
  app.get<{ Params: { id: string } }>('/tasks/:id', async (request, reply) => {
    const task = tasks.get(request.params.id);
    return task ? response(task) : reply.code(404).send({ error: 'task not found' });
  });
  app.patch<{ Params: { id: string }; Body: UpdateTask }>('/tasks/:id', async (request, reply) => {
    const task = tasks.get(request.params.id);
    if (!task) return reply.code(404).send({ error: 'task not found' });
    if (request.body.title !== undefined && !request.body.title.trim())
      return reply.code(400).send({ error: 'title is required' });
    if (request.body.assigneeId !== undefined && !hasUser(request.body.assigneeId))
      return reply.code(404).send({ error: 'assignee not found' });
    Object.assign(task, request.body, {
      title: request.body.title?.trim() ?? task.title,
      updatedAt: now(),
    });
    return response(task);
  });
  app.post<{ Params: { id: string } }>('/tasks/:id/complete', async (request, reply) => {
    const task = tasks.get(request.params.id);
    if (!task) return reply.code(404).send({ error: 'task not found' });
    if (task.status === 'COMPLETED')
      return reply.code(409).send({ error: 'task is already completed' });
    task.status = 'COMPLETED';
    task.updatedAt = now();
    return response(task);
  });
  app.delete<{ Params: { id: string } }>('/tasks/:id', async (request, reply) => {
    const task = tasks.get(request.params.id);
    if (!task) return reply.code(404).send({ error: 'task not found' });
    tasks.delete(task.id);
    return reply.code(204).send();
  });
  return app;
}
