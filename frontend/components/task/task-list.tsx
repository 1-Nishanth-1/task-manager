"use client";

import { AnimatePresence } from "framer-motion";
import type { Task } from "@/features/tasks/types";
import { EmptyState } from "@/components/common/empty-state";
import { TaskCard } from "@/components/task/task-card";

interface TaskListProps {
  tasks: Task[];
  onToggleStatus: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onAssign: (task: Task) => void;
  emptyTitle: string;
  emptyDescription?: string;
  onEmptyAction?: () => void;
}

export function TaskList({
  tasks,
  onToggleStatus,
  onEdit,
  onDelete,
  onAssign,
  emptyTitle,
  emptyDescription,
  onEmptyAction,
}: TaskListProps) {
  if (!tasks.length) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={onEmptyAction ? "Create task" : undefined}
        onAction={onEmptyAction}
      />
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence>
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onToggleStatus={() => onToggleStatus(task)}
            onEdit={() => onEdit(task)}
            onDelete={() => onDelete(task)}
            onAssign={() => onAssign(task)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
