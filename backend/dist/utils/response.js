"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, message, data, statusCode = 200) => {
    const payload = { success: true, message, data };
    return res.status(statusCode).json(payload);
};
exports.sendSuccess = sendSuccess;
const sendError = (res, message, statusCode = 400) => {
    const payload = { success: false, message };
    return res.status(statusCode).json(payload);
};
exports.sendError = sendError;
//# sourceMappingURL=response.js.map