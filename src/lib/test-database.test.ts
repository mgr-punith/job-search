import { describe, expect, it } from "vitest";

import { getTestDatabaseUrl } from "@/lib/test-database";

describe("test database isolation", () => {
  it("defaults to the dedicated local test database", () => {
    const url = new URL(getTestDatabaseUrl());

    expect(url.hostname).toBe("127.0.0.1");
    expect(url.pathname).toBe("/jobsearch_test");
  });

  it.each([
    "postgresql://localhost/jobsearch",
    "postgresql://db.example.com/jobsearch_test",
    "postgresql://localhost/jobsearch_test?host=db.example.com",
    "postgresql://localhost/jobsearch_test?schema=production",
    "https://localhost/jobsearch_test",
    "invalid",
  ])("rejects an unsafe test database target", (value) => {
    expect(() => getTestDatabaseUrl(value)).toThrow(
      "Tests require a local jobsearch_test PostgreSQL database.",
    );
  });
});
