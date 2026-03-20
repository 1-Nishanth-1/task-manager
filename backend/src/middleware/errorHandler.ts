import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  logger.error("Unhandled error", err);

  const message = err instanceof Error ? err.message : "Internal server error";

  return res.status(500).json({
    success: false,
    message,
  });
};
