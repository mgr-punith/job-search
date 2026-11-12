import { z } from "zod";

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
