import { Request, Response } from "express";
import prisma from "../prisma/client";
import { sendSuccess } from "../utils/response";
import { logger } from "../utils/logger";

export const syncUser = async (req: Request, res: Response) => {
  const user = req.user!;
  
  try {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name || user.email,
        image: user.image ?? null,
      },
      create: {
        id: user.id,
        email: user.email,
        name: user.name || user.email,
        image: user.image ?? null,
      },
    });

    logger.info("User synced successfully", { userId: user.id, email: user.email });
    return sendSuccess(res, "User synced");
  } catch (error) {
    logger.error("Failed to sync user", { error, userId: user.id });
    throw error;
  }
};
