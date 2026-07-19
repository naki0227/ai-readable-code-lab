export type Status = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export const taskHistoryActions = [
  'CREATED',
  'UPDATED',
  'ASSIGNEE_CHANGED',
  'COMPLETED',
  'ARCHIVED',
] as const;
export type TaskHistoryAction = (typeof taskHistoryActions)[number];
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
export type TaskHistoryItem = {
  id: string;
  taskId: string;
  action: TaskHistoryAction;
  createdAt: string;
};
export const isOverdue = (task: Task, today: string) =>
  Boolean(task.dueDate && task.dueDate < today);
