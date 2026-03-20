import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { sendError } from "../utils/response";
import { env } from "../config/env";
import { UnauthorizedError } from "../utils/errors";
import prisma from "../prisma/client";
import { logger } from "../utils/logger";

interface JwtPayload {
  sub: string; // user id
  email: string;
  name?: string;
  picture?: string;
  iat?: number;
  exp?: number;
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, "Authentication token missing", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    if (!decoded.sub || !decoded.email) {
      throw new UnauthorizedError("Invalid token payload");
    }

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name ?? "",
      image: decoded.picture ?? null,
    };

    const displayName = decoded.name || decoded.email;

    try {
      await prisma.user.upsert({
        where: { email: decoded.email },
        update: {
          name: displayName,
          image: decoded.picture ?? null,
        },
        create: {
          id: decoded.sub,
          email: decoded.email,
          name: displayName,
          image: decoded.picture ?? null,
        },
      });
    } catch (err) {
      logger.error("Failed to sync user from auth token", {
        error: err,
        email: decoded.email,
        sub: decoded.sub,
      });
    }

    return next();
  } catch (error) {
    return sendError(res, "Invalid or expired token", 401);
  }
};
