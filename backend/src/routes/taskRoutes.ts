import { Router } from "express";
import * as taskController from "../controllers/taskController";
import { authMiddleware } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(authMiddleware);

router.post("/", asyncHandler(taskController.createTask));
router.get("/", asyncHandler(taskController.getTasks));
router.patch("/:id", asyncHandler(taskController.updateTask));
router.delete("/:id", asyncHandler(taskController.deleteTask));
router.post("/:id/assign", asyncHandler(taskController.assignTask));

export default router;
