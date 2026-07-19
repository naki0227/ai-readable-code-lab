export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  category?: string;
  assigneeId?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateTaskInput = Omit<Task, 'id'>;
export const asResponse = (task: Task) => ({
  ...task,
  isOverdue:
    Boolean(task.dueDate) && (task.dueDate as string) < new Date().toISOString().slice(0, 10),
  warnings:
    task.dueDate && task.dueDate < new Date().toISOString().slice(0, 10)
      ? ['due date is in the past']
      : [],
});
