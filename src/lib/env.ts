import { z } from "zod";

import { DEFAULT_STATUS_DELAY_SECONDS } from "@/features/applications/constants";

const postgresUrlSchema = z.string().url().refine(
  (value) => {
    if (!URL.canParse(value)) {
      return false;
    }

    const protocol = new URL(value).protocol;

    return protocol === "postgres:" || protocol === "postgresql:";
  },
  { message: "Must be a PostgreSQL connection URL" },
);

const serverEnvironmentSchema = z.object({
  DATABASE_URL: postgresUrlSchema,
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;

export function parseServerEnvironment(
  environment: NodeJS.ProcessEnv,
): ServerEnvironment {
  return serverEnvironmentSchema.parse(environment);
}

const uploadEnvironmentSchema = z.object({
  UPLOADTHING_TOKEN: z.string().trim().min(1).refine(
    (value) => !value.startsWith("replace-") && !value.startsWith("YOUR_"),
    "Configure UPLOADTHING_TOKEN to enable resume uploads",
  ),
});

export function parseUploadEnvironment(environment: NodeJS.ProcessEnv) {
  return uploadEnvironmentSchema.parse(environment);
}

export function isResumeUploadConfigured() {
  return uploadEnvironmentSchema.safeParse(process.env).success;
}

const simulationEnvironmentSchema = z.object({
  DEMO_STATUS_DELAY_SECONDS: z.coerce.number().int().min(1).max(86_400).default(DEFAULT_STATUS_DELAY_SECONDS),
});

export function parseSimulationEnvironment(environment: Record<string, string | undefined>) {
  return simulationEnvironmentSchema.parse(environment);
}

const profileAiEnvironmentSchema = z.object({
  GROQ_API_KEY: z.string().trim().min(1).refine((value) => !value.startsWith("replace-") && !value.startsWith("YOUR_")),
  GROQ_MODEL: z.string().trim().min(1).max(120).default("openai/gpt-oss-20b"),
});

export function parseProfileAiEnvironment(environment: Record<string, string | undefined>) {
  return profileAiEnvironmentSchema.parse(environment);
}

export function isProfileAiConfigured() {
  return profileAiEnvironmentSchema.safeParse(process.env).success;
}
