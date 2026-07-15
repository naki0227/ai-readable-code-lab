export type Status = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type Task = {
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
export type TaskEvent = {
  id: string;
  taskId: string;
  action: 'CREATED' | 'UPDATED' | 'ASSIGNEE_CHANGED' | 'COMPLETED' | 'ARCHIVED';
  createdAt: string;
};
export const isOverdue = (task: Task, today: string) =>
  Boolean(
    task.dueDate &&
    task.status !== 'COMPLETED' &&
    task.status !== 'ARCHIVED' &&
    task.dueDate < today,
  );
