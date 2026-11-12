import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";
import { parseServerEnvironment } from "@/lib/env";

function createPrismaClient() {
  const environment = parseServerEnvironment(process.env);
  const adapter = new PrismaPg({ connectionString: environment.DATABASE_URL });

  return new PrismaClient({
    adapter,
    log: environment.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrismaClient>;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
