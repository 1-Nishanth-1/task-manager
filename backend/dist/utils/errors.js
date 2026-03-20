"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadRequestError = exports.UnauthorizedError = exports.NotFoundError = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this);
    }
}
exports.AppError = AppError;
class NotFoundError extends AppError {
    constructor(message = "Not found") {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
class UnauthorizedError extends AppError {
    constructor(message = "Unauthorized") {
        super(message, 401);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class BadRequestError extends AppError {
    constructor(message = "Bad request") {
        super(message, 400);
    }
}
exports.BadRequestError = BadRequestError;
//# sourceMappingURL=errors.js.map