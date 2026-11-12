import { describe, expect, it } from "vitest";

import { applySchema, parseApplicationPage } from "@/features/applications/schemas/application";

describe("application input", () => {
  it("accepts a bounded job id and strips client-supplied owner, score, and resume", () => {
    expect(applySchema.parse({ jobId: " job-1 ", userId: "other", matchScore: 100, resumeUrl: "https://example.com/fake.pdf" })).toEqual({ jobId: "job-1" });
  });

  it.each(["", "   ", "../job", "a".repeat(129)])("rejects invalid job ids", (jobId) => {
    expect(applySchema.safeParse({ jobId }).success).toBe(false);
  });

  it("normalizes pagination and uses the first repeated value", () => {
    expect(parseApplicationPage(["2", "3"])).toBe(2);
    expect(parseApplicationPage("-1")).toBe(1);
    expect(parseApplicationPage("1.5")).toBe(1);
    expect(parseApplicationPage("10000000")).toBe(1);
    expect(parseApplicationPage(undefined)).toBe(1);
  });
});
