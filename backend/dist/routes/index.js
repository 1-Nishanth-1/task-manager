"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const taskRoutes_1 = __importDefault(require("./taskRoutes"));
const authRoutes_1 = __importDefault(require("./authRoutes"));
const router = (0, express_1.Router)();
router.use("/tasks", taskRoutes_1.default);
router.use("/auth", authRoutes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map