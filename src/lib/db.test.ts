import { afterAll, describe, expect, it } from "vitest";

const testDatabaseUrl =
  process.env.TEST_DATABASE_URL ??
  "postgresql://postgres:postgres@127.0.0.1:5432/jobsearch_test?schema=public";

process.env.DATABASE_URL = testDatabaseUrl;

const { db } = await import("@/lib/db");

afterAll(async () => {
  await db.$disconnect();
});

describe("Prisma database connection", () => {
  it("connects to the configured test database", async () => {
    const [{ database }] = await db.$queryRaw<Array<{ database: string }>>`
      SELECT current_database() AS database
    `;
    const expectedDatabase = new URL(testDatabaseUrl).pathname.slice(1);

    expect(database).toBe(expectedDatabase);
  });
});
