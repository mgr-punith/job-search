import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";

import { loginSchema, signupCredentialsSchema } from "@/features/auth/schemas/auth";
import { parseAuthEnvironment } from "@/lib/auth-env";
import { db } from "@/lib/db";

const environment = parseAuthEnvironment(process.env);

export const auth = betterAuth({
  appName: "JobSearch",
  baseURL: environment.BETTER_AUTH_URL,
  secret: environment.BETTER_AUTH_SECRET,
  trustedOrigins: [environment.BETTER_AUTH_URL],
  advanced: {
    disableCSRFCheck: false,
    disableOriginCheck: false,
  },
  database: prismaAdapter(db, {
    provider: "postgresql",
    transaction: true,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  rateLimit: {
    enabled: true,
    storage: "database",
  },
  hooks: {
    before: createAuthMiddleware(async (context) => {
      const schema =
        context.path === "/sign-up/email"
          ? signupCredentialsSchema
          : context.path === "/sign-in/email"
            ? loginSchema
            : null;

      if (!schema) return;

      const validation = schema.safeParse(context.body);

      if (!validation.success) {
        throw new APIError("BAD_REQUEST", {
          message: "Check your details and try again.",
        });
      }

      return { context: { body: validation.data } };
    }),
  },
  logger: {
    disabled: process.env.NODE_ENV === "test",
  },
  telemetry: { enabled: false },
  plugins: [nextCookies()],
});
