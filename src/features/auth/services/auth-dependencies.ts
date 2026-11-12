import { parseSetCookieHeader, toCookieOptions } from "better-auth/cookies";
import { z } from "zod";

import type { AuthActionDependencies } from "@/features/auth/actions/auth-handlers";
import { AuthRequestError } from "@/features/auth/services/auth-request-error";
import { ensureCandidateProfile } from "@/features/auth/services/candidate-profile";
import { auth } from "@/lib/auth";
import { parseAuthEnvironment } from "@/lib/auth-env";

type CookieWriter = (
  name: string,
  value: string,
  options: ReturnType<typeof toCookieOptions>,
) => void;

const authenticatedUserSchema = z.object({
  user: z.object({ id: z.string().min(1) }),
});

export function createAuthDependencies(
  requestHeaders: Headers,
  setCookie: CookieWriter,
): AuthActionDependencies {
  const environment = parseAuthEnvironment(process.env);

  async function post(
    path: "/sign-up/email" | "/sign-in/email" | "/sign-out",
    body: object,
  ) {
    const forwardedHeaders = new Headers(requestHeaders);
    forwardedHeaders.set("content-type", "application/json");
    forwardedHeaders.delete("content-length");

    // The router runs rate limiting and origin checks that auth.api mutations skip.
    const response = await auth.handler(
      new Request(new URL(`/api/auth${path}`, environment.BETTER_AUTH_URL), {
        method: "POST",
        headers: forwardedHeaders,
        body: JSON.stringify(body),
      }),
    );

    // nextCookies skips router requests, so Server Actions must forward these.
    for (const header of response.headers.getSetCookie()) {
      for (const [name, attributes] of parseSetCookieHeader(header)) {
        setCookie(name, attributes.value, toCookieOptions(attributes));
      }
    }

    if (!response.ok) throw new AuthRequestError(response.status);

    return response;
  }

  async function authenticate(
    path: "/sign-up/email" | "/sign-in/email",
    body: object,
  ) {
    const response = await post(path, body);
    const result = authenticatedUserSchema.parse(await response.json());

    return { userId: result.user.id };
  }

  return {
    signUp: (input) => authenticate("/sign-up/email", input),
    signIn: (input) => authenticate("/sign-in/email", input),
    ensureCandidateProfile,
    async getSession() {
      const session = await auth.api.getSession({ headers: requestHeaders });

      return session ? { userId: session.user.id } : null;
    },
    async signOut() {
      await post("/sign-out", {});
    },
  };
}
