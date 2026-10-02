import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(3000),
  AGENT_URL: z.url().default("http://localhost:8000"),
  GATEWAY_TOKEN: z.string().default(""),
  AUTH_DIR: z.string().min(1).default("auth_info_baileys"),
});

export const env = envSchema.parse(process.env);
