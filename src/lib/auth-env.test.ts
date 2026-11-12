import { describe, expect, it } from "vitest";

import { parseAuthEnvironment } from "@/lib/auth-env";

describe("parseAuthEnvironment", () => {
  it("accepts a strong secret and valid base URL", () => {
    expect(
      parseAuthEnvironment({
        BETTER_AUTH_SECRET: "a-secure-test-secret-that-is-32-chars-long",
        BETTER_AUTH_URL: "http://localhost:3000",
      }),
    ).toEqual({
      BETTER_AUTH_SECRET: "a-secure-test-secret-that-is-32-chars-long",
      BETTER_AUTH_URL: "http://localhost:3000",
    });
  });

  it("rejects secrets shorter than 32 characters", () => {
    expect(() =>
      parseAuthEnvironment({
        BETTER_AUTH_SECRET: "too-short",
        BETTER_AUTH_URL: "http://localhost:3000",
      }),
    ).toThrow();
  });

  it("rejects an invalid auth URL", () => {
    expect(() =>
      parseAuthEnvironment({
        BETTER_AUTH_SECRET: "a-secure-test-secret-that-is-32-chars-long",
        BETTER_AUTH_URL: "not-a-url",
      }),
    ).toThrow();
  });
});
