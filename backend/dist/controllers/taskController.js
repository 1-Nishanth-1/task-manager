"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignTask = exports.deleteTask = exports.updateTask = exports.getTasks = exports.createTask = void 0;
const zod_1 = require("zod");
const taskService = __importStar(require("../services/taskService"));
const response_1 = require("../utils/response");
const createTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Title is required"),
    description: zod_1.z.string().optional(),
    status: zod_1.z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
    priority: zod_1.z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    assigneeEmail: zod_1.z
        .string()
        .trim()
        .email("Valid assignee email is required")
        .or(zod_1.z.literal(""))
        .optional(),
});
const getTasksQuerySchema = zod_1.z.object({
    status: zod_1.z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
    assigned: zod_1.z
        .string()
        .transform((val) => val === "true")
        .optional(),
    page: zod_1.z
        .string()
        .transform((val) => parseInt(val, 10))
        .optional()
        .default("1")
        .transform((val) => (Number.isNaN(val) || val < 1 ? 1 : val)),
    pageSize: zod_1.z
        .string()
        .transform((val) => parseInt(val, 10))
        .optional()
        .default("10")
        .transform((val) => Number.isNaN(val) || val < 1 || val > 100 ? 10 : val),
});
const updateTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().nullable().optional(),
    status: zod_1.z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
    priority: zod_1.z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
});
const assignTaskSchema = zod_1.z.object({
    email: zod_1.z.string().email("Valid email is required"),
});
const createTask = async (req, res) => {
    const user = req.user;
    const parseResult = createTaskSchema.safeParse(req.body);
    if (!parseResult.success) {
        const message = parseResult.error.errors
            .map((e) => e.message)
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
    return (0, response_1.sendSuccess)(res, "Task created", task, 201);
};
exports.createTask = createTask;
const getTasks = async (req, res) => {
    const user = req.user;
    const parseResult = getTasksQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
        const message = parseResult.error.errors
            .map((e) => e.message)
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
    return (0, response_1.sendSuccess)(res, "Tasks fetched", result);
};
exports.getTasks = getTasks;
const updateTask = async (req, res) => {
    const user = req.user;
    const { id } = req.params;
    const parseResult = updateTaskSchema.safeParse(req.body);
    if (!parseResult.success) {
        const message = parseResult.error.errors
            .map((e) => e.message)
            .join(", ");
        return res.status(400).json({ success: false, message });
    }
    const task = await taskService.updateTask({
        taskId: id,
        userId: user.id,
        data: parseResult.data,
    });
    return (0, response_1.sendSuccess)(res, "Task updated", task);
};
exports.updateTask = updateTask;
const deleteTask = async (req, res) => {
    const user = req.user;
    const { id } = req.params;
    await taskService.deleteTask({
        taskId: id,
        userId: user.id,
    });
    return (0, response_1.sendSuccess)(res, "Task deleted");
};
exports.deleteTask = deleteTask;
const assignTask = async (req, res) => {
    const user = req.user;
    const { id } = req.params;
    const parseResult = assignTaskSchema.safeParse(req.body);
    if (!parseResult.success) {
        const message = parseResult.error.errors
            .map((e) => e.message)
            .join(", ");
        return res.status(400).json({ success: false, message });
    }
    const task = await taskService.assignTask({
        taskId: id,
        requestedById: user.id,
        assigneeEmail: parseResult.data.email,
    });
    return (0, response_1.sendSuccess)(res, "Task assigned", task);
};
exports.assignTask = assignTask;
//# sourceMappingURL=taskController.js.map