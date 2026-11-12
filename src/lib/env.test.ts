import { describe, expect, it } from "vitest";
import { ZodError } from "zod";

import { parseServerEnvironment } from "@/lib/env";

describe("parseServerEnvironment", () => {
  it("accepts a PostgreSQL connection URL", () => {
    expect(
      parseServerEnvironment({
        DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/jobsearch",
        NODE_ENV: "test",
      }),
    ).toEqual({
      DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/jobsearch",
      NODE_ENV: "test",
    });
  });

  it("accepts the postgres protocol alias", () => {
    expect(
      parseServerEnvironment({
        DATABASE_URL: "postgres://postgres:postgres@localhost:5432/jobsearch",
        NODE_ENV: "test",
      }).DATABASE_URL,
    ).toBe("postgres://postgres:postgres@localhost:5432/jobsearch");
  });

  it("rejects a non-PostgreSQL URL", () => {
    expect(() =>
      parseServerEnvironment({
        DATABASE_URL: "https://database.example.com/jobsearch",
        NODE_ENV: "test",
      }),
    ).toThrow();
  });

  it("returns a validation error for a malformed URL", () => {
    expect(() =>
      parseServerEnvironment({
        DATABASE_URL: "not a URL",
        NODE_ENV: "test",
      }),
    ).toThrow(ZodError);
  });

  it("rejects a missing database URL", () => {
    expect(() => parseServerEnvironment({ NODE_ENV: "test" })).toThrow();
  });
});
