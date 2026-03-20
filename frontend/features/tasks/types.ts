export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string | null; // email
  createdBy: string; // email
  createdAt: string;
  updatedAt: string;
};

export type CreateTaskInput = {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeEmail?: string;
};

export type UpdateTaskInput = Partial<Omit<CreateTaskInput, "status">> & {
  status?: TaskStatus;
};

export type AssignTaskInput = {
  taskId: string;
  email: string;
};
