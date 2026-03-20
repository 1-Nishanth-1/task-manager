import prisma from "../prisma/client";
import type { Prisma } from "@prisma/client";
import { logger } from "../utils/logger";
import { emitTaskEvent } from "../sockets/index";
import { NotFoundError, UnauthorizedError, BadRequestError } from "../utils/errors";

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeEmail?: string;
  createdBy: {
    id: string;
    email: string;
    name?: string;
    image?: string | null;
  };
}

interface GetTasksInput {
  userId: string;
  status?: TaskStatus;
  assigned?: boolean;
  page: number;
  pageSize: number;
}

interface UpdateTaskInput {
  taskId: string;
  userId: string;
  data: Partial<{
    title: string;
    description?: string | null;
    status: TaskStatus;
    priority: TaskPriority;
  }>;
}

interface DeleteTaskInput {
  taskId: string;
  userId: string;
}

interface AssignTaskInput {
  taskId: string;
  requestedById: string;
  assigneeEmail: string;
}

export const createTask = async (input: CreateTaskInput) => {
  const displayName = input.createdBy.name || input.createdBy.email;

  await prisma.user.upsert({
    where: { id: input.createdBy.id },
    update: {
      name: displayName,
      email: input.createdBy.email,
      image: input.createdBy.image ?? null,
    },
    create: {
      id: input.createdBy.id,
      name: displayName,
      email: input.createdBy.email,
      image: input.createdBy.image ?? null,
    },
  });

  let assignedToId: string | null = input.createdBy.id;

  const assigneeEmail = input.assigneeEmail?.trim();
  if (assigneeEmail && assigneeEmail !== input.createdBy.email) {
    const assignee = await prisma.user.findUnique({
      where: { email: assigneeEmail },
    });

    if (!assignee) {
      throw new NotFoundError("Assignee not found");
    }

    assignedToId = assignee.id;
  }

  const task = await prisma.task.create({
    data: {
      title: input.title,
      description: input.description,
      status: (input.status ?? "TODO") as TaskStatus,
      priority: (input.priority ?? "MEDIUM") as TaskPriority,
      createdById: input.createdBy.id,
      assignedToId,
    },
    include: {
      createdBy: true,
      assignedTo: true,
    },
  });

  logger.info("Task created", {
    taskId: task.id,
    createdById: input.createdBy.id,
  });

  const recipients = [task.createdById, task.assignedToId].filter(
    Boolean,
  ) as string[];
  emitTaskEvent("task:created", task, recipients);

  return task;
};

export const getTasksForUser = async (input: GetTasksInput) => {
  const { userId, status, assigned, page, pageSize } = input;

  const whereBase: Prisma.TaskWhereInput = {
    OR: [{ createdById: userId }, { assignedToId: userId }],
  };

  if (status) {
    whereBase.status = status;
  }

  if (typeof assigned === "boolean") {
    if (assigned) {
      whereBase.assignedToId = userId;
    } else {
      whereBase.createdById = userId;
    }
  }

  const skip = (page - 1) * pageSize;

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where: whereBase,
      include: {
        createdBy: true,
        assignedTo: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: pageSize,
    }),
    prisma.task.count({ where: whereBase }),
  ]);

  const totalPages = Math.ceil(total / pageSize) || 1;

  return {
    items: tasks,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
  };
};

export const updateTask = async (input: UpdateTaskInput) => {
  const existing = await prisma.task.findUnique({
    where: { id: input.taskId },
  });

  if (!existing) {
    throw new NotFoundError("Task not found");
  }

  const isCreator = existing.createdById === input.userId;
  const isAssignee = existing.assignedToId === input.userId;
  const dataKeys = Object.keys(input.data).filter(key => input.data[key as keyof typeof input.data] !== undefined);
  const isStatusOnlyUpdate = dataKeys.length === 1 && dataKeys[0] === "status";

  if (!isCreator && !(isAssignee && isStatusOnlyUpdate)) {
    throw new UnauthorizedError("Only the creator or assignee can update this task");
  }

  const task = await prisma.task.update({
    where: { id: input.taskId },
    data: {
      title: input.data.title ?? existing.title,
      description: input.data.description ?? existing.description,
      status: input.data.status ?? existing.status,
      priority: input.data.priority ?? existing.priority,
    },
    include: {
      createdBy: true,
      assignedTo: true,
    },
  });

  logger.info("Task updated", { taskId: task.id, userId: input.userId });

  const recipients = [task.createdById, task.assignedToId].filter(
    Boolean,
  ) as string[];
  emitTaskEvent("task:updated", task, recipients);

  return task;
};

export const deleteTask = async (input: DeleteTaskInput) => {
  const existing = await prisma.task.findUnique({
    where: { id: input.taskId },
  });

  if (!existing) {
    throw new NotFoundError("Task not found");
  }

  if (existing.createdById !== input.userId) {
    throw new UnauthorizedError("Only the creator can delete this task");
  }

  await prisma.task.delete({
    where: { id: input.taskId },
  });

  logger.info("Task deleted", { taskId: input.taskId, userId: input.userId });
};

export const assignTask = async (input: AssignTaskInput) => {
  const existing = await prisma.task.findUnique({
    where: { id: input.taskId },
    include: {
      createdBy: true,
      assignedTo: true,
    },
  });

  if (!existing) {
    throw new NotFoundError("Task not found");
  }

  if (existing.createdById !== input.requestedById) {
    throw new UnauthorizedError("Only the creator can assign this task");
  }

  const user = await prisma.user.findUnique({
    where: { email: input.assigneeEmail },
  });

  if (!user) {
    throw new NotFoundError("Assignee not found");
  }

  const task = await prisma.task.update({
    where: { id: input.taskId },
    data: {
      assignedToId: user.id,
    },
    include: {
      createdBy: true,
      assignedTo: true,
    },
  });

  logger.info("Task assigned", {
    taskId: task.id,
    requestedById: input.requestedById,
    assignedToId: user.id,
  });
  const recipients = [task.createdById, user.id].filter(Boolean) as string[];
  emitTaskEvent("task:assigned", task, recipients);

  return task;
};
