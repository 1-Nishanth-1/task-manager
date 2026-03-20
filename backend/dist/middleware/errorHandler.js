"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_1 = require("../utils/logger");
const errors_1 = require("../utils/errors");
const errorHandler = (err, _req, res, _next) => {
    logger_1.logger.error("Unhandled error", err);
    if (err instanceof errors_1.AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
    }
    const message = err instanceof Error ? err.message : "Internal server error";
    return res.status(500).json({
        success: false,
        message,
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map