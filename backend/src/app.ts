import "dotenv/config";
import express from "express";
import http from "http";
import helmet from "helmet";
import cors from "cors";
import xss from "xss-clean";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import routes from "./routes/index";
import { errorHandler } from "./middleware/errorHandler";
import { createSocketServer } from "./sockets/index";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:3000", "https://task-manger-topaz.vercel.app"],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(xss());

app.get("/health", (_req, res) => {
  res.json({ success: true, message: "OK" });
});

app.use("/api", routes);

app.use(errorHandler);

const server = http.createServer(app);

createSocketServer(server);

server.listen(env.PORT, () => {
  logger.info(`Server listening on port ${env.PORT}`);
});

export default app;
