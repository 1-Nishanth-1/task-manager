"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import type { TaskStatus, Task } from "@/features/tasks/types";

const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"] satisfies TaskStatus[]),
  assigneeEmail: z
    .string()
    .trim()
    .email("Enter a valid email")
    .or(z.literal(""))
    .optional(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTask?: Task;
  onSubmit: (values: TaskFormValues) => Promise<void> | void;
  isSubmitting: boolean;
}

export function TaskForm({
  mode,
  open,
  onOpenChange,
  initialTask,
  onSubmit,
  isSubmitting,
}: TaskFormProps) {
  const [values, setValues] = useState<TaskFormValues>(() => ({
    title: initialTask?.title ?? "",
    description: initialTask?.description ?? "",
    status: initialTask?.status ?? "TODO",
    assigneeEmail: "",
  }));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "edit" && initialTask && open) {
      setValues({
        title: initialTask.title,
        description: initialTask.description ?? "",
        status: initialTask.status,
        assigneeEmail: "",
      });
      setError(null);
    }
  }, [mode, initialTask, open]);

  const handleChange = <K extends keyof TaskFormValues>(
    key: K,
    value: TaskFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const parsed = taskFormSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setError(null);
    await onSubmit(parsed.data);

    if (mode === "create") {
      setValues({
        title: "",
        description: "",
        status: "TODO",
        assigneeEmail: "",
      });
    }
  };

  const title = mode === "create" ? "Create task" : "Edit task";

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={
        mode === "create"
          ? "Capture just enough detail to keep your team aligned."
          : "Update the task details and status."
      }
    >
      <div className="space-y-4 text-sm">
        <div className="space-y-1.5">
          <Label htmlFor="task-title">Title</Label>
          <Input
            id="task-title"
            placeholder="Craft a clear, actionable title"
            value={values.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="task-description">Description (optional)</Label>
          <Textarea
            id="task-description"
            placeholder="Add context, edge cases, or acceptance criteria"
            value={values.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="task-status">Status</Label>
          <select
            id="task-status"
            className="flex h-10 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:focus-visible:ring-zinc-100"
            value={values.status}
            onChange={(e) =>
              handleChange("status", e.target.value as TaskStatus)
            }
          >
            <option value="TODO">Todo</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="DONE">Done</option>
          </select>
        </div>
        {mode === "create" && (
          <div className="space-y-1.5">
            <Label htmlFor="task-assignee">Assign to (optional)</Label>
            <Input
              id="task-assignee"
              type="email"
              placeholder="teammate@company.com (leave blank to assign to you)"
              value={values.assigneeEmail ?? ""}
              onChange={(e) =>
                handleChange(
                  "assigneeEmail",
                  e.target.value as TaskFormValues["assigneeEmail"],
                )
              }
            />
          </div>
        )}
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="mt-2 flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : mode === "create" ? "Create" : "Save"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
