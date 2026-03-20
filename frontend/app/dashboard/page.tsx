"use client";

import { useState } from "react";
import type { Task } from "@/features/tasks/types";
import {
  useAssignTask,
  useCreateTask,
  useDeleteTask,
  useTasks,
  useUpdateTask,
} from "@/features/tasks/hooks";
import { useAuthGuard } from "@/features/auth/hooks";
import { AppShell } from "@/components/common/app-shell";
import { Loader } from "@/components/common/loader";
import { TaskFilters, type TaskView } from "@/components/task/task-filters";
import { TaskForm, type TaskFormValues } from "@/components/task/task-form";
import { TaskList } from "@/components/task/task-list";
import { AssignModal } from "@/components/task/assign-modal";
import { useTaskRealtime } from "@/features/tasks/realtime";

export default function DashboardPage() {
  const { status } = useAuthGuard();
  const { tasks, createdByUser, assignedToUser, isLoading } = useTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const assignTask = useAssignTask();

  const [view, setView] = useState<TaskView>("created");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [assigningTask, setAssigningTask] = useState<Task | null>(null);

  useTaskRealtime();

  if (status === "loading") {
    return (
      <AppShell>
        <Loader />
      </AppShell>
    );
  }

  const visibleTasks =
    view === "created"
      ? createdByUser
      : view === "assigned"
        ? assignedToUser
        : tasks;

  const handleCreate = async (values: TaskFormValues) => {
    await createTask.mutateAsync(values);
    setCreateOpen(false);
  };

  const handleUpdate = async (values: TaskFormValues) => {
    if (!editingTask) return;
    await updateTask.mutateAsync({
      id: editingTask.id,
      input: {
        title: values.title,
        description: values.description,
        status: values.status,
      },
    });
    setEditingTask(null);
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

  const handleAssign = async (email: string) => {
    if (!assigningTask) return;
    await assignTask.mutateAsync({ taskId: assigningTask.id, email });
    setAssigningTask(null);
  };

  return (
    <AppShell>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Tasks
          </h1>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            View what you own, what is on your plate, and everything in between.
          </p>
        </div>
        <button
          type="button"
          className="rounded-2xl bg-zinc-900 px-4 py-2 text-xs font-medium text-zinc-50 shadow-sm transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          onClick={() => setCreateOpen(true)}
        >
          New task
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <TaskFilters value={view} onChange={setView} />
      </div>

      <div className="mt-4">
        {isLoading ? (
          <Loader />
        ) : (
          <TaskList
            tasks={visibleTasks}
            onToggleStatus={handleToggleStatus}
            onEdit={(task) => setEditingTask(task)}
            onDelete={(task) => deleteTask.mutate(task.id)}
            onAssign={(task) => setAssigningTask(task)}
            emptyTitle="No tasks yet"
            emptyDescription="Create a task to capture the next thing your team should ship."
            onEmptyAction={() => setCreateOpen(true)}
          />
        )}
      </div>

      <TaskForm
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
        isSubmitting={createTask.isPending}
      />

      <TaskForm
        mode="edit"
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
        initialTask={editingTask ?? undefined}
        onSubmit={handleUpdate}
        isSubmitting={updateTask.isPending}
      />

      <AssignModal
        open={!!assigningTask}
        onOpenChange={(open) => !open && setAssigningTask(null)}
        onAssign={handleAssign}
        isSubmitting={assignTask.isPending}
        serverError={null}
      />
    </AppShell>
  );
}
