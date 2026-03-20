"use client";

import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  AssignTaskInput,
} from "./types";
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  assignTask,
} from "./api";
import { useToast } from "@/hooks/useToast";

const TASKS_QUERY_KEY = ["tasks"] as const;

export function useTasks() {
  const { data: session } = useSession();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: TASKS_QUERY_KEY,
    queryFn: fetchTasks,
  });

  const userEmail = session?.user?.email ?? "";

  const createdByUser = (data ?? []).filter(
    (task) => task.createdBy === userEmail,
  );
  const assignedToUser = (data ?? []).filter(
    (task) => task.assignedTo && task.assignedTo === userEmail,
  );

  return {
    tasks: data ?? [],
    createdByUser,
    assignedToUser,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createTask,
    onMutate: async (input: CreateTaskInput) => {
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });
      const previous = queryClient.getQueryData<Task[]>(TASKS_QUERY_KEY);

      const optimistic: Task = {
        id: `temp-${Date.now()}`,
        title: input.title,
        description: input.description ?? null,
        status: input.status ?? "TODO",
        priority: input.priority ?? "MEDIUM",
        assignedTo:
          input.assigneeEmail && input.assigneeEmail.trim()
            ? input.assigneeEmail.trim()
            : "you",
        createdBy: "you",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, (old = []) => [
        optimistic,
        ...old,
      ]);

      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(TASKS_QUERY_KEY, context.previous);
      }
      toast({
        title: "Failed to create task",
        description: error.message ?? "Something went wrong.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({ title: "Task created" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) =>
      updateTask(id, input),
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });
      const previous = queryClient.getQueryData<Task[]>(TASKS_QUERY_KEY);

      queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, (old = []) =>
        old.map((task) => (task.id === id ? { ...task, ...input } : task)),
      );

      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(TASKS_QUERY_KEY, context.previous);
      }
      toast({
        title: "Failed to update task",
        description: error.message ?? "Something went wrong.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({ title: "Task updated" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: deleteTask,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });
      const previous = queryClient.getQueryData<Task[]>(TASKS_QUERY_KEY);

      queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, (old = []) =>
        old.filter((task) => task.id !== id),
      );

      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(TASKS_QUERY_KEY, context.previous);
      }
      toast({
        title: "Failed to delete task",
        description: error.message ?? "Something went wrong.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({ title: "Task deleted" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });
}

export function useAssignTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (input: AssignTaskInput) => assignTask(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: TASKS_QUERY_KEY });
      const previous = queryClient.getQueryData<Task[]>(TASKS_QUERY_KEY);

      queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, (old = []) =>
        old.map((task) =>
          task.id === input.taskId
            ? { ...task, assignedTo: input.email }
            : task,
        ),
      );

      return { previous };
    },
    onError: (error: unknown, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(TASKS_QUERY_KEY, context.previous);
      }
      type AxiosErrorLike = { response?: { status?: number } };
      const axiosError = error as AxiosErrorLike;
      const status = axiosError.response?.status;
      const fallbackMessage =
        error instanceof Error ? error.message : "Failed to assign task";

      const message = status === 404 ? "User not found" : fallbackMessage;

      toast({
        title: "Assignment failed",
        description: message,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({ title: "Task assigned" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY });
    },
  });
}
