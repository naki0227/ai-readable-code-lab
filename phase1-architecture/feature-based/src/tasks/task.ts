export type Task = {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  assigneeId?: string;
  createdAt: string;
  updatedAt: string;
};

const isClosed = (task: Task) => task.status === 'COMPLETED' || task.status === 'ARCHIVED';

export const asResponse = (task: Task) => ({
  ...task,
  isOverdue:
    !isClosed(task) &&
    Boolean(task.dueDate) &&
    (task.dueDate as string) < new Date().toISOString().slice(0, 10),
  warnings:
    !isClosed(task) && task.dueDate && task.dueDate < new Date().toISOString().slice(0, 10)
      ? ['due date is in the past']
      : [],
});
