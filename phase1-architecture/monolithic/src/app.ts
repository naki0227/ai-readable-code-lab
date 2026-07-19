import Fastify from 'fastify';

type Status = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
type Task = {
  id: string;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  category?: string;
  dueDate?: string;
  assigneeId?: string;
  createdAt: string;
  updatedAt: string;
};
type CreateTask = {
  title: string;
  description?: string;
  priority?: Priority;
  category?: string;
  dueDate?: string;
};
type UpdateTask = Partial<CreateTask> & { assigneeId?: string };
type TaskEvent = { id: string; taskId: string; action: string; createdAt: string };

export function buildApp() {
  const app = Fastify();
  const tasks = new Map<string, Task>();
  const history = new Map<string, TaskEvent[]>();
  let sequence = 0;
  let eventSequence = 0;
  const now = () => new Date().toISOString();
  const isOverdue = (task: Task) =>
    Boolean(
      task.dueDate &&
      task.status !== 'COMPLETED' &&
      task.status !== 'ARCHIVED' &&
      task.dueDate < now().slice(0, 10),
    );
  const response = (task: Task) => ({
    ...task,
    isOverdue: isOverdue(task),
    warnings: task.dueDate && task.dueDate < now().slice(0, 10) ? ['due date is in the past'] : [],
  });
  const hasUser = (id: string) => id === 'user-1' || id === 'user-2';
  const record = (taskId: string, action: string) => {
    const event = { id: String(++eventSequence), taskId, action, createdAt: now() };
    history.set(taskId, [...(history.get(taskId) ?? []), event]);
  };

  app.post<{ Body: CreateTask }>('/tasks', async (request, reply) => {
    if (!request.body?.title?.trim()) return reply.code(400).send({ error: 'title is required' });
    const timestamp = now();
    const task: Task = {
      id: String(++sequence),
      title: request.body.title.trim(),
      description: request.body.description,
      priority: request.body.priority ?? 'MEDIUM',
      category: request.body.category,
      dueDate: request.body.dueDate,
      status: 'TODO',
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    tasks.set(task.id, task);
    record(task.id, 'CREATED');
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
    record(task.id, request.body.assigneeId === undefined ? 'UPDATED' : 'ASSIGNEE_CHANGED');
    return response(task);
  });
  app.post<{ Params: { id: string } }>('/tasks/:id/complete', async (request, reply) => {
    const task = tasks.get(request.params.id);
    if (!task) return reply.code(404).send({ error: 'task not found' });
    if (task.status === 'COMPLETED')
      return reply.code(409).send({ error: 'task is already completed' });
    task.status = 'COMPLETED';
    task.updatedAt = now();
    record(task.id, 'COMPLETED');
    return response(task);
  });
  app.post<{ Params: { id: string } }>('/tasks/:id/archive', async (request, reply) => {
    const task = tasks.get(request.params.id);
    if (!task) return reply.code(404).send({ error: 'task not found' });
    task.status = 'ARCHIVED';
    task.updatedAt = now();
    record(task.id, 'ARCHIVED');
    return response(task);
  });
  app.get<{ Params: { id: string } }>('/tasks/:id/history', async (request, reply) => {
    if (!tasks.has(request.params.id)) return reply.code(404).send({ error: 'task not found' });
    return history.get(request.params.id) ?? [];
  });
  return app;
}
