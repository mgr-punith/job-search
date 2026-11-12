import { afterAll, beforeAll, expect, it, vi } from "vitest";

import { getTestDatabaseUrl } from "@/lib/test-database";

process.env.DATABASE_URL = getTestDatabaseUrl(process.env.TEST_DATABASE_URL);

const interleave = vi.hoisted(() => ({ beforeLaterUpdate: null as (() => Promise<void>) | null }));
vi.mock("@/lib/db", async (importOriginal) => {
  const { db } = await importOriginal<typeof import("@/lib/db")>();
  return { db: db.$extends({ query: { application: { async updateMany({ args, query }) {
    if (args.data.status === "INTERVIEW_SCHEDULED" && interleave.beforeLaterUpdate) {
      const beforeUpdate = interleave.beforeLaterUpdate;
      interleave.beforeLaterUpdate = null;
      await beforeUpdate();
    }
    return query(args);
  } } } }) };
});

const [{ db }, { refreshApplication }] = await Promise.all([import("@/lib/db"), import("@/features/applications/services/applications")]);
const userId = "m5-race-candidate";
const companyId = "m5-race-company";
const jobId = "m5-race-job";
const applicationId = "m5-race-application";
const appliedAt = new Date("2026-11-12T09:00:00Z");

async function cleanup() {
  await db.user.deleteMany({ where: { id: userId } });
  await db.job.deleteMany({ where: { id: jobId } });
  await db.company.deleteMany({ where: { id: companyId } });
}

beforeAll(async () => {
  await cleanup();
  await db.user.create({ data: { id: userId, name: "Race fixture", email: "m5-race@example.com" } });
  await db.company.create({ data: { id: companyId, slug: companyId, name: "M5 Race Company", description: "Fixture", size: "SMALL", location: "Remote" } });
  await db.job.create({ data: {
    id: jobId, slug: jobId, title: "Race fixture", companyId, summary: "Fixture", about: "Fixture",
    responsibilities: [], idealProfile: [], whatsOnOffer: [], location: "Remote", country: "Worldwide", timeZone: "UTC",
    workplaceType: "REMOTE", jobType: "FULL_TIME", experienceLevel: "MID", market: "TECHNOLOGY", salaryMin: 1, salaryMax: 2,
  } });
  await db.application.create({ data: {
    id: applicationId, userId, jobId, appliedAt, matchScore: 90, resumeUrl: "https://test.ufs.sh/f/race", resumeKey: "race",
    events: { create: { status: "APPLIED", occurredAt: appliedAt } },
  } });
});
afterAll(async () => { await cleanup(); await db.$disconnect(); });

it("persists the newer target when an earlier refresh commits after its initial read", async () => {
  // Force the real earlier transaction to commit between the later request's read and update.
  interleave.beforeLaterUpdate = async () => {
    await refreshApplication(userId, applicationId, new Date(appliedAt.getTime() + 30_000), 30);
  };
  const result = await refreshApplication(userId, applicationId, new Date(appliedAt.getTime() + 90_000), 30);
  expect(result?.status).toBe("INTERVIEW_SCHEDULED");
  expect(result?.events.map(({ status }) => status)).toEqual(["APPLIED", "UNDER_REVIEW", "SHORTLISTED", "INTERVIEW_SCHEDULED"]);
  expect(await db.applicationStatusEvent.count({ where: { applicationId } })).toBe(4);
});
