export type Task = {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
};
export const asResponse = (task: Task) => ({
  ...task,
  isOverdue:
    Boolean(task.dueDate) &&
    task.status !== 'COMPLETED' &&
    task.status !== 'ARCHIVED' &&
    (task.dueDate as string) < new Date().toISOString().slice(0, 10),
});
