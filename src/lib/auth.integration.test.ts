import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { setRequestCookie } from "better-auth/cookies";

import { runLoginAction, runLogoutAction, runSignupAction } from "@/features/auth/actions/auth-handlers";
import { getTestDatabaseUrl } from "@/lib/test-database";

const testDatabaseUrl = getTestDatabaseUrl(process.env.TEST_DATABASE_URL);
const testEmail = "m2.auth.candidate@example.com";
const testPassword = "SecurePass123!";
const authBaseUrl = "http://localhost:3000";

process.env.DATABASE_URL = testDatabaseUrl;
process.env.BETTER_AUTH_SECRET = "jobsearch-m2-test-secret-at-least-32-characters";
process.env.BETTER_AUTH_URL = authBaseUrl;

const [{ auth }, { db }, { createAuthDependencies }] = await Promise.all([
  import("@/lib/auth"),
  import("@/lib/db"),
  import("@/features/auth/services/auth-dependencies"),
]);

const fixtureEmails = [testEmail, "invalid.m2.candidate@example.com", "direct.m2.candidate@example.com"];
let requestNumber = 10;

function createAuthRequest(
  path: string,
  init: RequestInit & { body?: string } = {},
) {
  return new Request(`${authBaseUrl}/api/auth${path}`, {
    ...init,
    headers: {
      origin: authBaseUrl,
      "x-forwarded-for": `203.0.113.${requestNumber++}`,
      ...init.headers,
    },
  });
}

async function post(path: string, body: object, cookie?: string) {
  return auth.handler(
    createAuthRequest(path, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(cookie ? { cookie } : {}),
      },
      body: JSON.stringify(body),
    }),
  );
}

beforeAll(async () => {
  await db.user.deleteMany({ where: { email: { in: fixtureEmails } } });
  await db.rateLimit.deleteMany({ where: { key: { startsWith: "203.0.113." } } });
});

afterAll(async () => {
  await db.user.deleteMany({ where: { email: { in: fixtureEmails } } });
  await db.rateLimit.deleteMany({ where: { key: { startsWith: "203.0.113." } } });
  await db.$disconnect();
});

describe("Better Auth integration", () => {
  it.each([" ", "J", "J".repeat(101)])(
    "rejects invalid names through the public signup endpoint",
    async (name) => {
      const response = await post("/sign-up/email", {
        name,
        email: "invalid.m2.candidate@example.com",
        password: testPassword,
      });

      expect(response.status).toBe(400);
      expect(
        await db.user.count({
          where: { email: "invalid.m2.candidate@example.com" },
        }),
      ).toBe(0);
    },
  );

  it("supports the complete email and password session lifecycle", async () => {
    const requestHeaders = new Headers({
      origin: authBaseUrl,
      "x-forwarded-for": "203.0.113.100",
    });
    const setCookie = vi.fn((name, value) => {
      setRequestCookie(requestHeaders, name, value);
    });
    const dependencies = createAuthDependencies(requestHeaders, setCookie);
    const formData = new FormData();
    formData.set("name", "M2 Candidate");
    formData.set("email", testEmail);
    formData.set("password", testPassword);
    formData.set("passwordConfirmation", testPassword);

    expect(await runSignupAction(formData, dependencies)).toMatchObject({ ok: true });
    expect(setCookie).toHaveBeenCalledWith(
      "better-auth.session_token",
      expect.any(String),
      expect.objectContaining({ httpOnly: true, sameSite: "lax", path: "/" }),
    );

    const createdUser = await db.user.findUniqueOrThrow({
      where: { email: testEmail },
      select: {
        id: true,
        email: true,
        profile: { select: { id: true } },
        accounts: {
          where: { providerId: "credential" },
          select: { password: true },
        },
      },
    });

    expect(createdUser?.email).toBe(testEmail);
    expect(createdUser?.profile).not.toBeNull();
    expect(createdUser?.accounts).toHaveLength(1);
    expect(createdUser?.accounts[0]?.password).not.toBe(testPassword);

    const wrongPasswordResponse = await post("/sign-in/email", {
      email: testEmail,
      password: "WrongPass123!",
    });
    const missingUserResponse = await post("/sign-in/email", {
      email: "missing.m2.candidate@example.com",
      password: "WrongPass123!",
    });

    expect(wrongPasswordResponse.status).toBe(401);
    expect(missingUserResponse.status).toBe(401);
    expect(await wrongPasswordResponse.json()).toEqual(
      await missingUserResponse.json(),
    );

    expect(await runLogoutAction(dependencies)).toMatchObject({ ok: true });
    expect(setCookie).toHaveBeenCalledWith(
      "better-auth.session_token",
      "",
      expect.objectContaining({ maxAge: 0 }),
    );

    // A partial signup can recover its missing profile on the next login.
    await db.candidateProfile.deleteMany({ where: { userId: createdUser.id } });
    formData.set("email", testEmail.toUpperCase());
    expect(await runLoginAction(formData, dependencies)).toMatchObject({ ok: true });
    expect(await db.candidateProfile.count({ where: { userId: createdUser.id } })).toBe(1);
    const sessionCookie = requestHeaders.get("cookie") ?? "";

    const sessionResponse = await auth.handler(
      createAuthRequest("/get-session", {
        headers: { cookie: sessionCookie },
      }),
    );
    const session = await sessionResponse.json();

    expect(sessionResponse.status).toBe(200);
    expect(session.user).toMatchObject({
      email: testEmail,
      name: "M2 Candidate",
    });

    expect(await runLogoutAction(dependencies)).toMatchObject({ ok: true });

    const endedSessionResponse = await auth.handler(
      createAuthRequest("/get-session", {
        headers: { cookie: sessionCookie },
      }),
    );

    expect(await endedSessionResponse.json()).toBeNull();
  });

  it("normalizes credentials on direct signup and repairs the profile on login", async () => {
    const response = await post("/sign-up/email", {
      name: "  Direct Candidate  ",
      email: " DIRECT.M2.CANDIDATE@EXAMPLE.COM ",
      password: testPassword,
    });

    expect(response.status).toBe(200);
    const candidate = await db.user.findUniqueOrThrow({
      where: { email: "direct.m2.candidate@example.com" },
      select: { id: true, name: true },
    });
    expect(candidate.name).toBe("Direct Candidate");

    const dependencies = createAuthDependencies(new Headers({
      origin: authBaseUrl,
      "x-forwarded-for": "203.0.113.101",
    }), vi.fn());
    const formData = new FormData();
    formData.set("email", "direct.m2.candidate@example.com");
    formData.set("password", testPassword);

    expect(await runLoginAction(formData, dependencies)).toMatchObject({ ok: true });
    expect(await db.candidateProfile.count({ where: { userId: candidate.id } })).toBe(1);
  });

  it("preserves origin checks through the Server Action service", async () => {
    const dependencies = createAuthDependencies(new Headers({
      origin: "https://attacker.example",
      "x-forwarded-for": "203.0.113.102",
    }), vi.fn());

    await expect(dependencies.signIn({ email: testEmail, password: testPassword })).rejects.toMatchObject({ status: 403 });
  });

  it("rate limits failed logins through the actual Server Action service", async () => {
    const dependencies = createAuthDependencies(new Headers({
      origin: authBaseUrl,
      "x-forwarded-for": "203.0.113.103",
    }), vi.fn());
    const formData = new FormData();
    formData.set("email", "rate-limit-test@example.com");
    formData.set("password", "WrongPass123!");

    for (let attempt = 0; attempt < 3; attempt += 1) {
      expect(await runLoginAction(formData, dependencies)).toEqual({
        ok: false,
        error: "Email or password is incorrect.",
      });
    }

    expect(await runLoginAction(formData, dependencies)).toEqual({
      ok: false,
      error: "Too many attempts. Wait a moment and try again.",
    });
  });

  it("rate limits repeated failed login attempts through the HTTP handler", async () => {
    const responses = [];

    for (let attempt = 0; attempt < 4; attempt += 1) {
      responses.push(
        await auth.handler(
          createAuthRequest("/sign-in/email", {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "x-forwarded-for": "203.0.113.42",
            },
            body: JSON.stringify({
              email: "rate-limit-test@example.com",
              password: "WrongPass123!",
            }),
          }),
        ),
      );
    }

    expect(responses.slice(0, 3).map(({ status }) => status)).toEqual([
      401, 401, 401,
    ]);
    expect(responses[3]?.status).toBe(429);
  });
});
