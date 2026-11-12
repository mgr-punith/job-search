import { describe, expect, it } from "vitest";

import { loginSchema, signupSchema } from "@/features/auth/schemas/auth";

describe("signupSchema", () => {
  it("trims the name and normalizes the email", () => {
    const result = signupSchema.parse({
      name: "  Jordan Lee  ",
      email: "  DEMO.CANDIDATE@EXAMPLE.COM  ",
      password: "SecurePass123!",
      passwordConfirmation: "SecurePass123!",
    });

    expect(result).toEqual({
      name: "Jordan Lee",
      email: "demo.candidate@example.com",
      password: "SecurePass123!",
      passwordConfirmation: "SecurePass123!",
    });
  });

  it("reports the confirmation field when passwords do not match", () => {
    const result = signupSchema.safeParse({
      name: "Jordan Lee",
      email: "jordan@example.com",
      password: "SecurePass123!",
      passwordConfirmation: "DifferentPass123!",
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.passwordConfirmation).toEqual([
      "Passwords do not match",
    ]);
  });

  it("rejects a password shorter than eight characters", () => {
    const result = signupSchema.safeParse({
      name: "Jordan Lee",
      email: "jordan@example.com",
      password: "short",
      passwordConfirmation: "short",
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.password).toBeDefined();
  });
});

describe("loginSchema", () => {
  it("normalizes email without changing the password", () => {
    expect(
      loginSchema.parse({
        email: "  JORDAN@EXAMPLE.COM ",
        password: " password with spaces ",
      }),
    ).toEqual({
      email: "jordan@example.com",
      password: " password with spaces ",
    });
  });
});
