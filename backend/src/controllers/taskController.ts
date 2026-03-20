import { Request, Response } from "express";
import { z } from "zod";
import * as taskService from "../services/taskService";
import { sendSuccess } from "../utils/response";

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  assigneeEmail: z
    .string()
    .trim()
    .email("Valid assignee email is required")
    .or(z.literal(""))
    .optional(),
});

const getTasksQuerySchema = z.object({
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  assigned: z
    .string()
    .transform((val: string) => val === "true")
    .optional(),
  page: z
    .string()
    .transform((val: string) => parseInt(val, 10))
    .optional()
    .default("1")
    .transform((val: number) => (Number.isNaN(val) || val < 1 ? 1 : val)),
  pageSize: z
    .string()
    .transform((val: string) => parseInt(val, 10))
    .optional()
    .default("10")
    .transform((val: number) =>
      Number.isNaN(val) || val < 1 || val > 100 ? 10 : val,
    ),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
});

const assignTaskSchema = z.object({
  email: z.string().email("Valid email is required"),
});

export const createTask = async (req: Request, res: Response) => {
  const user = req.user!;
  const parseResult = createTaskSchema.safeParse(req.body);

  if (!parseResult.success) {
    const message = parseResult.error.errors
      .map((e: z.ZodIssue) => e.message)
      .join(", ");
    return res.status(400).json({ success: false, message });
  }

  const task = await taskService.createTask({
    ...parseResult.data,
    createdBy: {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
    },
  });

  return sendSuccess(res, "Task created", task, 201);
};

export const getTasks = async (req: Request, res: Response) => {
  const user = req.user!;
  const parseResult = getTasksQuerySchema.safeParse(req.query);

  if (!parseResult.success) {
    const message = parseResult.error.errors
      .map((e: z.ZodIssue) => e.message)
      .join(", ");
    return res.status(400).json({ success: false, message });
  }

  const { status, assigned, page, pageSize } = parseResult.data;

  const result = await taskService.getTasksForUser({
    userId: user.id,
    status,
    assigned,
    page,
    pageSize,
  });

  return sendSuccess(res, "Tasks fetched", result);
};

export const updateTask = async (req: Request, res: Response) => {
  const user = req.user!;
  const { id } = req.params;
  const parseResult = updateTaskSchema.safeParse(req.body);

  if (!parseResult.success) {
    const message = parseResult.error.errors
      .map((e: z.ZodIssue) => e.message)
      .join(", ");
    return res.status(400).json({ success: false, message });
  }

  const task = await taskService.updateTask({
    taskId: id,
    userId: user.id,
    data: parseResult.data,
  });

  return sendSuccess(res, "Task updated", task);
};

export const deleteTask = async (req: Request, res: Response) => {
  const user = req.user!;
  const { id } = req.params;

  await taskService.deleteTask({
    taskId: id,
    userId: user.id,
  });

  return sendSuccess(res, "Task deleted");
};

export const assignTask = async (req: Request, res: Response) => {
  const user = req.user!;
  const { id } = req.params;
  const parseResult = assignTaskSchema.safeParse(req.body);

  if (!parseResult.success) {
    const message = parseResult.error.errors
      .map((e: z.ZodIssue) => e.message)
      .join(", ");
    return res.status(400).json({ success: false, message });
  }

  const task = await taskService.assignTask({
    taskId: id,
    requestedById: user.id,
    assigneeEmail: parseResult.data.email,
  });

  return sendSuccess(res, "Task assigned", task);
};
