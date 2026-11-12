import { describe, expect, it } from "vitest";

import { getSafeCallbackUrl } from "@/features/auth/services/callback-url";

describe("getSafeCallbackUrl", () => {
  it("keeps a local path with its query and fragment", () => {
    expect(getSafeCallbackUrl("/dashboard?view=active#latest")).toBe(
      "/dashboard?view=active#latest",
    );
  });

  it.each([
    "https://attacker.example/steal",
    "//attacker.example/steal",
    "/.//attacker.example/steal",
    "/foo/..//attacker.example/steal",
    "/%2e//attacker.example/steal",
    "javascript:alert(1)",
    String.raw`\attacker.example\steal`,
    "dashboard",
  ])("falls back for unsafe callback value %s", (callbackUrl) => {
    expect(getSafeCallbackUrl(callbackUrl)).toBe("/dashboard");
  });

  it("falls back when no callback value is supplied", () => {
    expect(getSafeCallbackUrl()).toBe("/dashboard");
  });
});
