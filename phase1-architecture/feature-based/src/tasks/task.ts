export type Task = {
  id: string;
  title: string;
  description?: string;
  category?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  assigneeId?: string;
  createdAt: string;
  updatedAt: string;
};
export type TaskEvent = {
  id: string;
  taskId: string;
  action: 'CREATED' | 'UPDATED' | 'ASSIGNEE_CHANGED' | 'COMPLETED' | 'ARCHIVED';
  createdAt: string;
};
export const asResponse = (task: Task) => ({
  ...task,
  isOverdue:
    Boolean(task.dueDate) &&
    task.status !== 'COMPLETED' &&
    task.status !== 'ARCHIVED' &&
    (task.dueDate as string) < new Date().toISOString().slice(0, 10),
  warnings:
    task.dueDate && task.dueDate < new Date().toISOString().slice(0, 10)
      ? ['due date is in the past']
      : [],
});
