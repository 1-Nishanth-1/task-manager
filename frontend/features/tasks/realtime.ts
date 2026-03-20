"use client";

import { useQueryClient } from "@tanstack/react-query";
import type { Task } from "@/features/tasks/types";
import { useSocket } from "@/hooks/useSocket";
import { mapBackendTask } from "./api";

const TASKS_QUERY_KEY = ["tasks"] as const;

export function useTaskRealtime() {
  const queryClient = useQueryClient();

  useSocket(
    [
      {
        event: "task:created",
        handler: (_socket, payload: any) => {
          const task = mapBackendTask(payload);
          queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, (old = []) => [
            task,
            ...old.filter((t) => t.id !== task.id),
          ]);
        },
      },
      {
        event: "task:updated",
        handler: (_socket, payload: any) => {
          const task = mapBackendTask(payload);
          queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, (old = []) => {
            const exists = old.some((t) => t.id === task.id);
            return exists
              ? old.map((t) => (t.id === task.id ? task : t))
              : [task, ...old];
          });
        },
      },
      {
        event: "task:assigned",
        handler: (_socket, payload: any) => {
          const task = mapBackendTask(payload);
          queryClient.setQueryData<Task[]>(TASKS_QUERY_KEY, (old = []) => {
            const exists = old.some((t) => t.id === task.id);
            return exists
              ? old.map((t) => (t.id === task.id ? task : t))
              : [task, ...old];
          });
        },
      },
    ],
    [],
  );
}
