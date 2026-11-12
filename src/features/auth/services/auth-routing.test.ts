import { describe, expect, it } from "vitest";

import { getLoginUrl } from "@/features/auth/services/auth-routing";

describe("getLoginUrl", () => {
  it("encodes the protected route as a local callback", () => {
    expect(getLoginUrl("/dashboard?view=active")).toBe(
      "/login?callbackUrl=%2Fdashboard%3Fview%3Dactive",
    );
  });
});
