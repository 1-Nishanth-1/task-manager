"use client";

import { useState } from "react";
import { useAuthGuard } from "@/features/auth/hooks";
import { useTasks, useUpdateTask } from "@/features/tasks/hooks";
import type { Task } from "@/features/tasks/types";
import { AppShell } from "@/components/common/app-shell";
import { Loader } from "@/components/common/loader";
import { TaskCard } from "@/components/task/task-card";
import { useTaskRealtime } from "@/features/tasks/realtime";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

export default function TasksPage() {
  const { status } = useAuthGuard();
  const { tasks: allTasks, assignedToUser, isLoading } = useTasks();
  const updateTask = useUpdateTask();

  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [filterAssigned, setFilterAssigned] = useState(false);

  const tasks = filterAssigned ? assignedToUser : allTasks;

  useTaskRealtime();

  if (status === "loading") {
    return (
      <AppShell>
        <Loader />
      </AppShell>
    );
  }

  const grouped: Record<string, Task[]> = {
    TODO: [],
    IN_PROGRESS: [],
    DONE: [],
  };

  for (const task of tasks) {
    grouped[task.status]?.push(task);
  }

  const columnStyles: Record<Task["status"], string> = {
    TODO: "bg-red-100/40 border-red-200/50 dark:bg-red-900/40 dark:border-red-800/50",
    IN_PROGRESS:
      "bg-yellow-100/40 border-yellow-200/50 dark:bg-yellow-900/20 dark:border-yellow-800/50",
    DONE: "bg-lime-50/40 border-lime-200/50 dark:bg-green-300/20 dark:border-green-800/50",
  };

  const handleDropOnColumn = async (status: Task["status"]) => {
    if (!draggingTaskId) return;
    const task = tasks.find((t) => t.id === draggingTaskId);
    if (!task || task.status === status) return;

    await updateTask.mutateAsync({
      id: task.id,
      input: { status },
    });
  };

  const handleToggleStatus = async (task: Task) => {
    const nextStatus: Task["status"] =
      task.status === "DONE"
        ? "TODO"
        : task.status === "TODO"
          ? "IN_PROGRESS"
          : "DONE";
    await updateTask.mutateAsync({
      id: task.id,
      input: { status: nextStatus },
    });
  };

  return (
    <AppShell>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Board
          </h1>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Glide across statuses with a lightweight kanban-style view.
          </p>
        </div>
        <Button
          variant={filterAssigned ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterAssigned((prev) => !prev)}
          className="gap-2 rounded-xl text-xs text-white"
        >
          <Filter className="h-3.5 w-3.5" />
          {filterAssigned ? "Assigned to me" : "All tasks"}
        </Button>
      </div>

      {isLoading ? (
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex min-h-[500px] flex-col rounded-3xl border border-zinc-200/50 bg-zinc-100/40 p-3 dark:border-zinc-800/50 dark:bg-zinc-900/40"
            >
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-8 rounded-full" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-28 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {(
            [
              ["TODO", "Backlog"],
              ["IN_PROGRESS", "In progress"],
              ["DONE", "Done"],
            ] as const
          ).map(([status, label]) => (
            <section
              key={status}
              className={`flex min-h-50 flex-col rounded-3xl border p-3 text-xs shadow-sm ${columnStyles[status]}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDropOnColumn(status)}
            >
              <header className="mb-2 flex items-center justify-between">
                <span className="font-medium text-zinc-700 dark:text-zinc-200">
                  {label}
                </span>
                <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-medium text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900">
                  {grouped[status].length}
                </span>
              </header>
              <div className="space-y-2">
                {grouped[status].map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleStatus={() => handleToggleStatus(task)}
                    onEdit={() => {}}
                    onDelete={() => {}}
                    onAssign={() => {}}
                    draggableProps={{
                      draggable: true,
                      onDragStart: () => setDraggingTaskId(task.id),
                      onDragEnd: () => setDraggingTaskId(null),
                    }}
                    compact
                  />
                ))}
                {!grouped[status].length && (
                  <p className="mt-6 text-[11px] text-zinc-400 dark:text-zinc-500">
                    Nothing here yet.
                  </p>
                )}
              </div>
            </section>
          ))}
        </div>
      )}
    </AppShell>
  );
}
