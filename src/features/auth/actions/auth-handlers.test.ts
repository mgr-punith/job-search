import { describe, expect, it, vi } from "vitest";

import {
  getAuthActionRedirect,
  runLoginAction,
  runLogoutAction,
  runSignupAction,
  type AuthActionDependencies,
} from "@/features/auth/actions/auth-handlers";

function createDependencies(
  overrides: Partial<AuthActionDependencies> = {},
): AuthActionDependencies {
  return {
    signUp: vi.fn().mockResolvedValue({ userId: "candidate-id" }),
    signIn: vi.fn().mockResolvedValue({ userId: "candidate-id" }),
    ensureCandidateProfile: vi.fn().mockResolvedValue(undefined),
    getSession: vi.fn().mockResolvedValue({ userId: "candidate-id" }),
    signOut: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("runSignupAction", () => {
  it("returns field errors without calling Better Auth for invalid input", async () => {
    const dependencies = createDependencies();
    const formData = new FormData();
    formData.set("name", "J");
    formData.set("email", "invalid-email");
    formData.set("password", "short");
    formData.set("passwordConfirmation", "different");

    const result = await runSignupAction(formData, dependencies);

    expect(result.ok).toBe(false);
    expect(result).toMatchObject({
      fieldErrors: {
        name: expect.any(Array),
        email: expect.any(Array),
        password: expect.any(Array),
        passwordConfirmation: expect.any(Array),
      },
    });
    expect(dependencies.signUp).not.toHaveBeenCalled();
  });

  it("normalizes credentials and returns a safe callback", async () => {
    const dependencies = createDependencies();
    const formData = new FormData();
    formData.set("name", "  Jordan Lee ");
    formData.set("email", " JORDAN@EXAMPLE.COM ");
    formData.set("password", "SecurePass123!");
    formData.set("passwordConfirmation", "SecurePass123!");
    formData.set("callbackUrl", "/dashboard?from=signup");

    const result = await runSignupAction(formData, dependencies);

    expect(dependencies.signUp).toHaveBeenCalledWith({
      name: "Jordan Lee",
      email: "jordan@example.com",
      password: "SecurePass123!",
    });
    expect(dependencies.ensureCandidateProfile).toHaveBeenCalledWith("candidate-id");
    expect(result).toEqual({
      ok: true,
      data: { redirectTo: "/dashboard?from=signup" },
    });
  });

  it("does not expose a Better Auth signup error", async () => {
    const dependencies = createDependencies({
      signUp: vi.fn().mockRejectedValue(new Error("User already exists")),
    });
    const formData = new FormData();
    formData.set("name", "Jordan Lee");
    formData.set("email", "jordan@example.com");
    formData.set("password", "SecurePass123!");
    formData.set("passwordConfirmation", "SecurePass123!");

    const result = await runSignupAction(formData, dependencies);

    expect(result).toEqual({
      ok: false,
      error: "We could not create your account. Check your details and try again.",
    });
  });

  it("returns a safe error when profile provisioning fails after signup", async () => {
    const dependencies = createDependencies({
      ensureCandidateProfile: vi
        .fn()
        .mockRejectedValue(new Error("Profile write failed")),
    });
    const formData = new FormData();
    formData.set("name", "Jordan Lee");
    formData.set("email", "jordan@example.com");
    formData.set("password", "SecurePass123!");
    formData.set("passwordConfirmation", "SecurePass123!");

    const result = await runSignupAction(formData, dependencies);

    expect(result).toEqual({
      ok: false,
      error: "Your account was created, but profile setup failed. Log in to try again.",
    });
  });
});

describe("runLoginAction", () => {
  it("returns a generic error for failed credentials", async () => {
    const dependencies = createDependencies({
      signIn: vi.fn().mockRejectedValue(new Error("Invalid password")),
    });
    const formData = new FormData();
    formData.set("email", "candidate@example.com");
    formData.set("password", "WrongPass123!");

    const result = await runLoginAction(formData, dependencies);

    expect(result).toEqual({
      ok: false,
      error: "Email or password is incorrect.",
    });
  });

  it("replaces an external callback with the dashboard", async () => {
    const dependencies = createDependencies();
    const formData = new FormData();
    formData.set("email", " CANDIDATE@EXAMPLE.COM ");
    formData.set("password", "SecurePass123!");
    formData.set("callbackUrl", "https://attacker.example/steal");

    const result = await runLoginAction(formData, dependencies);

    expect(dependencies.signIn).toHaveBeenCalledWith({
      email: "candidate@example.com",
      password: "SecurePass123!",
    });
    expect(dependencies.ensureCandidateProfile).toHaveBeenCalledWith("candidate-id");
    expect(result).toEqual({
      ok: true,
      data: { redirectTo: "/dashboard" },
    });
  });
});

describe("runLogoutAction", () => {
  it("signs out an authenticated candidate", async () => {
    const dependencies = createDependencies();

    const result = await runLogoutAction(dependencies);

    expect(dependencies.getSession).toHaveBeenCalledOnce();
    expect(dependencies.signOut).toHaveBeenCalledOnce();
    expect(result).toEqual({
      ok: true,
      data: { redirectTo: "/login" },
    });
  });

  it("does not call sign out when the session has expired", async () => {
    const dependencies = createDependencies({
      getSession: vi.fn().mockResolvedValue(null),
    });

    const result = await runLogoutAction(dependencies);

    expect(dependencies.signOut).not.toHaveBeenCalled();
    expect(result).toEqual({
      ok: true,
      data: { redirectTo: "/login" },
    });
  });

  it("returns a generic error when logout fails", async () => {
    const dependencies = createDependencies({
      signOut: vi.fn().mockRejectedValue(new Error("Database unavailable")),
    });

    const result = await runLogoutAction(dependencies);

    expect(result).toEqual({
      ok: false,
      error: "We could not sign you out. Try again.",
    });
  });
});

describe("getAuthActionRedirect", () => {
  it("returns the destination only for successful actions", () => {
    expect(
      getAuthActionRedirect({
        ok: true,
        data: { redirectTo: "/dashboard" },
      }),
    ).toBe("/dashboard");
    expect(
      getAuthActionRedirect({
        ok: false,
        error: "Email or password is incorrect.",
      }),
    ).toBeNull();
  });
});
