import { describe, expect, it } from "vitest";
import { parseProfileAiEnvironment } from "@/lib/env";

describe("optional profile AI configuration", () => {
  it("defaults the model when a provider key is configured", () => {
    expect(parseProfileAiEnvironment({ GROQ_API_KEY: "fixture-key" }).GROQ_MODEL).toBe("openai/gpt-oss-20b");
  });
  it.each([undefined, "", "replace-with-groq-api-key", "YOUR_KEY"])("rejects missing or placeholder keys", (GROQ_API_KEY) => {
    expect(() => parseProfileAiEnvironment({ GROQ_API_KEY })).toThrow();
  });
});
