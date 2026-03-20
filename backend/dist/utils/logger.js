"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const log = (level, message, meta) => {
    const timestamp = new Date().toISOString();
    const payload = meta ? ` | ${JSON.stringify(meta)}` : "";
    // In production, this can be wired to a logging service
    // eslint-disable-next-line no-console
    console[level](`[${timestamp}] [${level.toUpperCase()}] ${message}${payload}`);
};
exports.logger = {
    info: (message, meta) => log("info", message, meta),
    warn: (message, meta) => log("warn", message, meta),
    error: (message, meta) => log("error", message, meta),
    debug: (message, meta) => log("debug", message, meta),
};
//# sourceMappingURL=logger.js.map