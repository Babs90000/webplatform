import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z
    .string()
    .url("NEXT_PUBLIC_API_URL must be a valid URL")
    .describe("Backend API base URL"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development")
    .describe("Environment mode"),
  LOG_LEVEL: z
    .enum(["debug", "info", "warn", "error"])
    .optional()
    .describe("Logging level"),
});

export type Env = z.infer<typeof envSchema>;

export const validateEnv = (): Env => {
  const env = {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NODE_ENV: process.env.NODE_ENV,
    LOG_LEVEL: process.env.LOG_LEVEL,
  };

  const result = envSchema.safeParse(env);

  if (!result.success) {
    console.error("❌ Invalid environment variables:");
    result.error.issues.forEach((issue) => {
      console.error(`  ${issue.path.join(".")}: ${issue.message}`);
    });
    throw new Error("Environment validation failed");
  }

  return result.data;
};

// Validate on module load (only in browser/client)
if (typeof window !== "undefined") {
  validateEnv();
}
