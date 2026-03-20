"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const response_1 = require("../utils/response");
const env_1 = require("../config/env");
const errors_1 = require("../utils/errors");
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return (0, response_1.sendError)(res, "Authentication token missing", 401);
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        if (!decoded.sub || !decoded.email) {
            throw new errors_1.UnauthorizedError("Invalid token payload");
        }
        req.user = {
            id: decoded.sub,
            email: decoded.email,
            name: decoded.name ?? "",
            image: decoded.picture ?? null,
        };
        return next();
    }
    catch (error) {
        return (0, response_1.sendError)(res, "Invalid or expired token", 401);
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=auth.js.map