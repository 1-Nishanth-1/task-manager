"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignTask = exports.deleteTask = exports.updateTask = exports.getTasksForUser = exports.createTask = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const logger_1 = require("../utils/logger");
const index_1 = require("../sockets/index");
const errors_1 = require("../utils/errors");
const createTask = async (input) => {
    let assignedToId = input.createdBy.id;
    const assigneeEmail = input.assigneeEmail?.trim();
    if (assigneeEmail && assigneeEmail !== input.createdBy.email) {
        const assignee = await client_1.default.user.findUnique({
            where: { email: assigneeEmail },
        });
        if (!assignee) {
            throw new errors_1.NotFoundError("Assignee not found");
        }
        assignedToId = assignee.id;
    }
    const task = await client_1.default.task.create({
        data: {
            title: input.title,
            description: input.description,
            status: (input.status ?? "TODO"),
            priority: (input.priority ?? "MEDIUM"),
            createdById: input.createdBy.id,
            assignedToId,
        },
        include: {
            createdBy: true,
            assignedTo: true,
        },
    });
    logger_1.logger.info("Task created", {
        taskId: task.id,
        createdById: input.createdBy.id,
    });
    const recipients = [task.createdById, task.assignedToId].filter(Boolean);
    (0, index_1.emitTaskEvent)("task:created", task, recipients);
    return task;
};
exports.createTask = createTask;
const getTasksForUser = async (input) => {
    const { userId, status, assigned, page, pageSize } = input;
    const whereBase = {
        OR: [{ createdById: userId }, { assignedToId: userId }],
    };
    if (status) {
        whereBase.status = status;
    }
    if (typeof assigned === "boolean") {
        if (assigned) {
            whereBase.assignedToId = userId;
        }
        else {
            whereBase.createdById = userId;
        }
    }
    const skip = (page - 1) * pageSize;
    const [tasks, total] = await Promise.all([
        client_1.default.task.findMany({
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
        client_1.default.task.count({ where: whereBase }),
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
exports.getTasksForUser = getTasksForUser;
const updateTask = async (input) => {
    const existing = await client_1.default.task.findUnique({
        where: { id: input.taskId },
    });
    if (!existing) {
        throw new errors_1.NotFoundError("Task not found");
    }
    const isCreator = existing.createdById === input.userId;
    const isAssignee = existing.assignedToId === input.userId;
    const dataKeys = Object.keys(input.data).filter(key => input.data[key] !== undefined);
    const isStatusOnlyUpdate = dataKeys.length === 1 && dataKeys[0] === "status";
    if (!isCreator && !(isAssignee && isStatusOnlyUpdate)) {
        throw new errors_1.UnauthorizedError("Only the creator or assignee can update this task");
    }
    const task = await client_1.default.task.update({
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
    logger_1.logger.info("Task updated", { taskId: task.id, userId: input.userId });
    const recipients = [task.createdById, task.assignedToId].filter(Boolean);
    (0, index_1.emitTaskEvent)("task:updated", task, recipients);
    return task;
};
exports.updateTask = updateTask;
const deleteTask = async (input) => {
    const existing = await client_1.default.task.findUnique({
        where: { id: input.taskId },
    });
    if (!existing) {
        throw new errors_1.NotFoundError("Task not found");
    }
    if (existing.createdById !== input.userId) {
        throw new errors_1.UnauthorizedError("Only the creator can delete this task");
    }
    await client_1.default.task.delete({
        where: { id: input.taskId },
    });
    logger_1.logger.info("Task deleted", { taskId: input.taskId, userId: input.userId });
};
exports.deleteTask = deleteTask;
const assignTask = async (input) => {
    const existing = await client_1.default.task.findUnique({
        where: { id: input.taskId },
        include: {
            createdBy: true,
            assignedTo: true,
        },
    });
    if (!existing) {
        throw new errors_1.NotFoundError("Task not found");
    }
    if (existing.createdById !== input.requestedById) {
        throw new errors_1.UnauthorizedError("Only the creator can assign this task");
    }
    const user = await client_1.default.user.findUnique({
        where: { email: input.assigneeEmail },
    });
    if (!user) {
        throw new errors_1.NotFoundError("Assignee not found");
    }
    const task = await client_1.default.task.update({
        where: { id: input.taskId },
        data: {
            assignedToId: user.id,
        },
        include: {
            createdBy: true,
            assignedTo: true,
        },
    });
    logger_1.logger.info("Task assigned", {
        taskId: task.id,
        requestedById: input.requestedById,
        assignedToId: user.id,
    });
    const recipients = [task.createdById, user.id].filter(Boolean);
    (0, index_1.emitTaskEvent)("task:assigned", task, recipients);
    return task;
};
exports.assignTask = assignTask;
//# sourceMappingURL=taskService.js.map