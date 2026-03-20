"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncUser = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const response_1 = require("../utils/response");
const logger_1 = require("../utils/logger");
const syncUser = async (req, res) => {
    const user = req.user;
    try {
        await client_1.default.user.upsert({
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
        logger_1.logger.info("User synced successfully", { userId: user.id, email: user.email });
        return (0, response_1.sendSuccess)(res, "User synced");
    }
    catch (error) {
        logger_1.logger.error("Failed to sync user", { error, userId: user.id });
        throw error;
    }
};
exports.syncUser = syncUser;
//# sourceMappingURL=authController.js.map