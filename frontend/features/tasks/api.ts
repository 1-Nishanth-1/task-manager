import { api } from "@/lib/axios";
import type {
  Task,
  TaskStatus,
  TaskPriority,
  CreateTaskInput,
  UpdateTaskInput,
  AssignTaskInput,
} from "./types";

type BackendUser = {
  email: string;
};

type BackendTask = {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
  createdBy: BackendUser;
  assignedTo?: BackendUser | null;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export function mapBackendTask(task: BackendTask): Task {
  return {
    id: task.id,
    title: task.title,
    description: task.description ?? null,
    status: task.status,
    priority: task.priority,
    createdBy: task.createdBy.email,
    assignedTo: task.assignedTo?.email ?? null,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

export async function fetchTasks() {
  const res = await api.get<ApiResponse<{ items: BackendTask[] }>>("/tasks");
  const items = res.data.data?.items ?? [];
  return items.map(mapBackendTask);
}

export async function createTask(input: CreateTaskInput) {
  const res = await api.post<ApiResponse<BackendTask>>("/tasks", input);
  return mapBackendTask(res.data.data);
}

export async function updateTask(id: string, input: UpdateTaskInput) {
  const res = await api.patch<ApiResponse<BackendTask>>(`/tasks/${id}`, input);
  return mapBackendTask(res.data.data);
}

export async function deleteTask(id: string) {
  await api.delete(`/tasks/${id}`);
  return id;
}

export async function assignTask(input: AssignTaskInput) {
  const res = await api.post<ApiResponse<BackendTask>>(
    `/tasks/${input.taskId}/assign`,
    { email: input.email },
  );
  return mapBackendTask(res.data.data);
}
