"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitTaskEvent = exports.createSocketServer = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
let internalEmitTaskEvent = null;
const createSocketServer = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"],
            credentials: true,
        },
    });
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) {
            return next(new Error("Authentication token missing"));
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
            socket.userId = decoded.sub;
            return next();
        }
        catch (error) {
            return next(new Error("Invalid token"));
        }
    });
    io.on("connection", (socket) => {
        const userId = socket.userId;
        if (userId) {
            const room = `user-${userId}`;
            socket.join(room);
            logger_1.logger.info("User joined socket room", { userId, room });
        }
        socket.on("disconnect", () => {
            logger_1.logger.info("User disconnected from socket", { userId });
        });
    });
    internalEmitTaskEvent = (event, payload, userIds) => {
        userIds.forEach((userId) => {
            const room = `user-${userId}`;
            io.to(room).emit(event, payload);
        });
    };
};
exports.createSocketServer = createSocketServer;
const emitTaskEvent = (event, payload, userIds) => {
    if (!internalEmitTaskEvent) {
        return;
    }
    internalEmitTaskEvent(event, payload, userIds);
};
exports.emitTaskEvent = emitTaskEvent;
//# sourceMappingURL=index.js.map