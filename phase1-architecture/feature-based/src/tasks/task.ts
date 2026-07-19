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
export const asResponse = (task: Task) => {
  const isOverdue =
    (task.status === 'TODO' || task.status === 'IN_PROGRESS') &&
    Boolean(task.dueDate) &&
    (task.dueDate as string) < new Date().toISOString().slice(0, 10);

  return {
    ...task,
    isOverdue,
    warnings: isOverdue ? ['due date is in the past'] : [],
  };
};
