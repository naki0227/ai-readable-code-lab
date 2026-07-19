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

export type TaskHistoryAction =
  'CREATED' | 'UPDATED' | 'ASSIGNEE_CHANGED' | 'COMPLETED' | 'ARCHIVED';

export type TaskHistory = {
  id: string;
  taskId: string;
  action: TaskHistoryAction;
  createdAt: string;
};

export const asResponse = (task: Task) => ({
  ...task,
  isOverdue:
    Boolean(task.dueDate) && (task.dueDate as string) < new Date().toISOString().slice(0, 10),
  warnings:
    task.dueDate && task.dueDate < new Date().toISOString().slice(0, 10)
      ? ['due date is in the past']
      : [],
});
