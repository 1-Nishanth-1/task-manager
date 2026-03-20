import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import type { TaskSocketEvent } from "../types/socketEvents";

interface JwtPayload {
  sub: string;
  email: string;
}

let internalEmitTaskEvent:
  | ((event: TaskSocketEvent, payload: unknown, userIds: string[]) => void)
  | null = null;

export const createSocketServer = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use((socket: Socket, next: (err?: Error) => void) => {
    const token = socket.handshake.auth?.token as string | undefined;

    if (!token) {
      return next(new Error("Authentication token missing"));
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      (socket as any).userId = decoded.sub;
      return next();
    } catch (error) {
      return next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = (socket as any).userId as string;

    if (userId) {
      const room = `user-${userId}`;
      socket.join(room);
      logger.info("User joined socket room", { userId, room });
    }

    socket.on("disconnect", () => {
      logger.info("User disconnected from socket", { userId });
    });
  });

  internalEmitTaskEvent = (
    event: TaskSocketEvent,
    payload: unknown,
    userIds: string[],
  ) => {
    userIds.forEach((userId) => {
      const room = `user-${userId}`;
      io.to(room).emit(event, payload);
    });
  };
};

export const emitTaskEvent = (
  event: TaskSocketEvent,
  payload: unknown,
  userIds: string[],
) => {
  if (!internalEmitTaskEvent) {
    return;
  }

  internalEmitTaskEvent(event, payload, userIds);
};
