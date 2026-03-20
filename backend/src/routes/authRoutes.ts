import { Router } from "express";
import { syncUser } from "../controllers/authController";
import { authMiddleware } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/sync", authMiddleware, asyncHandler(syncUser));

export default router;
