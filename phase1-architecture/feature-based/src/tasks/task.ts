export type Task = {
  id: string;
  title: string;
  status: 'TODO' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  updatedAt: string;
};
export const asResponse = (task: Task) => ({ ...task, isOverdue: false });
