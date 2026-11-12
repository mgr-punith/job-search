import { z } from "zod";

const authEnvironmentSchema = z.object({
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
  BETTER_AUTH_URL: z
    .string()
    .url()
    .refine((value) => ["http:", "https:"].includes(new URL(value).protocol), {
      message: "BETTER_AUTH_URL must use HTTP or HTTPS",
    }),
});

export type AuthEnvironment = z.infer<typeof authEnvironmentSchema>;

export function parseAuthEnvironment(
  environment: Record<string, string | undefined>,
): AuthEnvironment {
  return authEnvironmentSchema.parse(environment);
}
