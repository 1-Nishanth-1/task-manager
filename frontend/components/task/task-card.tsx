"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  MoreHorizontal,
  Pencil,
  Trash2,
  UserPlus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Task } from "@/features/tasks/types";
import { formatDate } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onToggleStatus: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAssign: () => void;
  draggableProps?: {
    draggable?: boolean;
    onDragStart?: () => void;
    onDragEnd?: () => void;
  };
  compact?: boolean;
}

function statusLabel(status: Task["status"]) {
  switch (status) {
    case "TODO":
      return "Todo";
    case "IN_PROGRESS":
      return "In progress";
    case "DONE":
      return "Done";
    default:
      return status;
  }
}

function statusVariant(status: Task["status"]) {
  switch (status) {
    case "TODO":
      return "outline" as const;
    case "IN_PROGRESS":
      return "warning" as const;
    case "DONE":
      return "success" as const;
  }
}

function priorityVariant(priority: Task["priority"]) {
  switch (priority) {
    case "LOW":
      return "outline" as const;
    case "MEDIUM":
      return "secondary" as const;
    case "HIGH":
      return "destructive" as const;
    default:
      return "default" as const;
  }
}

export function TaskCard({
  task,
  onToggleStatus,
  onEdit,
  onDelete,
  onAssign,
  draggableProps,
  compact,
}: TaskCardProps) {
  return (
    <motion.div
      layout
      layoutId={task.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <Card
        className="group flex h-full flex-col transition-all hover:border-zinc-300 hover:shadow-md dark:hover:border-zinc-700 cursor-grab active:cursor-grabbing"
        draggable={draggableProps?.draggable}
        onDragStart={draggableProps?.onDragStart}
        onDragEnd={draggableProps?.onDragEnd}
      >
        <CardHeader>
          <div>
            <CardTitle className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {task.title}
            </CardTitle>
            {task.description && (
              <p className="mt-1 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
                {task.description}
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
            <Badge variant={statusVariant(task.status)}>
              {statusLabel(task.status)}
            </Badge>
            {/* {task.priority && (
              // <Badge
              //   variant={priorityVariant(task.priority)}
              //   className="capitalize"
              // >
              //   {task.priority.toLowerCase()}
              // </Badge>
            )} */}
            <span>Created by {task.createdBy}</span>
            {task.assignedTo && <span>Assigned to {task.assignedTo}</span>}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500">
            <p>Updated {formatDate(task.updatedAt)}</p>
            {!compact && (
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Edit task"
                  onClick={onEdit}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Delete task"
                  onClick={onDelete}
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={task.status === "DONE" ? "subtle" : "default"}
              onClick={onToggleStatus}
              className="gap-1 rounded-full px-3 text-[11px]"
            >
              <CheckCircle2 className="h-3 w-3" />
              {task.status === "TODO"
                ? "Mark in progress"
                : task.status === "IN_PROGRESS"
                  ? "Mark done"
                  : "Mark todo"}
            </Button>
            {!compact && (
              <Button
                size="sm"
                variant="outline"
                onClick={onAssign}
                className=" rounded-full px-3 text-[11px] text-white"
              >
                <UserPlus className="h-3 w-3" />
                Assign
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
