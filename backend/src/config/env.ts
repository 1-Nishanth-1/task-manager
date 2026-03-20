import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(10),
  PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .or(z.number())
    .default(4000),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "Invalid environment variables",
    parsed.error.flatten().fieldErrors,
  );
  process.exit(1);
}

export const env = {
  DATABASE_URL: parsed.data.DATABASE_URL,
  JWT_SECRET: parsed.data.JWT_SECRET,
  PORT: typeof parsed.data.PORT === "number" ? parsed.data.PORT : 4000,
};
