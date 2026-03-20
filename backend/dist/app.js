"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const xss_clean_1 = __importDefault(require("xss-clean"));
const env_1 = require("./config/env");
const logger_1 = require("./utils/logger");
const index_1 = __importDefault(require("./routes/index"));
const errorHandler_1 = require("./middleware/errorHandler");
const index_2 = require("./sockets/index");
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, xss_clean_1.default)());
app.get("/health", (_req, res) => {
    res.json({ success: true, message: "OK" });
});
app.use("/api", index_1.default);
app.use(errorHandler_1.errorHandler);
const server = http_1.default.createServer(app);
(0, index_2.createSocketServer)(server);
server.listen(env_1.env.PORT, () => {
    logger_1.logger.info(`Server listening on port ${env_1.env.PORT}`);
});
exports.default = app;
//# sourceMappingURL=app.js.map