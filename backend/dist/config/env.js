"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    DATABASE_URL: zod_1.z.string().url(),
    JWT_SECRET: zod_1.z.string().min(10),
    PORT: zod_1.z
        .string()
        .transform((val) => parseInt(val, 10))
        .or(zod_1.z.number())
        .default(4000),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error("Invalid environment variables", parsed.error.flatten().fieldErrors);
    process.exit(1);
}
exports.env = {
    DATABASE_URL: parsed.data.DATABASE_URL,
    JWT_SECRET: parsed.data.JWT_SECRET,
    PORT: typeof parsed.data.PORT === "number" ? parsed.data.PORT : 4000,
};
//# sourceMappingURL=env.js.map