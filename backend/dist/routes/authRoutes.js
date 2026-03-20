"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const asyncHandler_1 = require("../utils/asyncHandler");
const router = (0, express_1.Router)();
router.post("/sync", auth_1.authMiddleware, (0, asyncHandler_1.asyncHandler)(authController_1.syncUser));
exports.default = router;
//# sourceMappingURL=authRoutes.js.map