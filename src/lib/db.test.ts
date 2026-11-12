import { afterAll, describe, expect, it } from "vitest";
import { getTestDatabaseUrl } from "@/lib/test-database";

const testDatabaseUrl = getTestDatabaseUrl(process.env.TEST_DATABASE_URL);

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
