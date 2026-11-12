import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { getTestDatabaseUrl } from "@/lib/test-database";

process.env.DATABASE_URL = getTestDatabaseUrl(process.env.TEST_DATABASE_URL);

const [{ db }, { createApplication, refreshApplication }, { getCandidateApplications }, { replaceCandidateResume }] = await Promise.all([
  import("@/lib/db"), import("@/features/applications/services/applications"), import("@/features/applications/queries/applications"), import("@/features/profile/services/resume"),
]);
const userId = "m5-candidate";
const otherId = "m5-other-candidate";
const companyId = "m5-company";
const skillId = "m5-skill";
const appliedAt = new Date("2026-11-12T09:00:00Z");
const at = (seconds: number) => new Date(appliedAt.getTime() + seconds * 1000);
let applicationId = "";

async function cleanup() {
  await db.user.deleteMany({ where: { id: { in: [userId, otherId] } } });
  await db.job.deleteMany({ where: { companyId } });
  await db.company.deleteMany({ where: { id: companyId } });
  await db.skill.deleteMany({ where: { id: skillId } });
}

beforeAll(async () => {
  await cleanup();
  await db.skill.create({ data: { id: skillId, slug: skillId, name: "M5 fixture skill" } });
  await db.user.create({ data: { id: userId, name: "M5 Candidate", email: "m5-candidate@example.com", profile: { create: {
    experienceLevel: "SENIOR", country: "United States", preferredMarkets: ["TECHNOLOGY"],
    resumeKey: "m5-resume-original", resumeUrl: "https://test.ufs.sh/f/m5-resume-original", resumeName: "original.pdf",
    skills: { create: { skillId } },
  } } } });
  await db.user.create({ data: { id: otherId, name: "M5 Other", email: "m5-other@example.com", profile: { create: {} } } });
  await db.company.create({ data: { id: companyId, slug: companyId, name: "M5 Company", description: "Fixture", size: "SMALL", location: "New York" } });
  for (let index = 0; index < 9; index++) {
    await db.job.create({ data: {
      id: `m5-job-${index}`, slug: `m5-job-${index}`, title: `Engineer ${index}`, companyId,
      summary: "Fixture", about: "Fixture", responsibilities: [], idealProfile: [], whatsOnOffer: [],
      location: "New York", country: "United States", timeZone: "UTC-05:00", workplaceType: "HYBRID",
      jobType: "FULL_TIME", experienceLevel: "MID", market: "TECHNOLOGY", salaryMin: 100_000, salaryMax: 150_000,
      isActive: index !== 8, skills: { create: { skillId } },
    } });
  }
});
afterAll(async () => { await cleanup(); await db.$disconnect(); });

describe("application persistence", () => {
  it("stores the server-computed match and resume snapshot with its initial event", async () => {
    const result = await createApplication(userId, "m5-job-0", appliedAt);
    applicationId = result.id;
    expect(await db.application.findUnique({ where: { id: result.id }, select: { userId: true, matchScore: true, resumeKey: true, status: true, events: { select: { status: true, occurredAt: true } } } })).toEqual({
      userId, matchScore: 100, resumeKey: "m5-resume-original", status: "APPLIED", events: [{ status: "APPLIED", occurredAt: appliedAt }],
    });
  });

  it("requires a resume and an active job", async () => {
    await expect(createApplication(otherId, "m5-job-1", appliedAt)).rejects.toMatchObject({ code: "RESUME_REQUIRED" });
    await expect(createApplication(userId, "m5-job-8", appliedAt)).rejects.toMatchObject({ code: "JOB_CLOSED" });
    await expect(createApplication(userId, "missing-job", appliedAt)).rejects.toMatchObject({ code: "JOB_CLOSED" });
  });

  it("rejects duplicate applications including concurrent submissions", async () => {
    await expect(createApplication(userId, "m5-job-0", appliedAt)).rejects.toMatchObject({ code: "ALREADY_APPLIED", applicationId });
    const attempts = await Promise.allSettled([createApplication(userId, "m5-job-1", appliedAt), createApplication(userId, "m5-job-1", appliedAt)]);
    expect(attempts.filter(({ status }) => status === "fulfilled")).toHaveLength(1);
    expect(attempts.filter(({ status }) => status === "rejected")).toHaveLength(1);
    expect(await db.application.count({ where: { userId, jobId: "m5-job-1" } })).toBe(1);
  });

  it("retains the submitted resume when the profile resume is replaced", async () => {
    expect(await replaceCandidateResume(userId, { key: "m5-new-resume", ufsUrl: "https://test.ufs.sh/f/m5-new-resume", name: "updated.pdf", type: "application/pdf", size: 123 })).toBeNull();
    expect(await db.application.findUnique({ where: { id: applicationId }, select: { resumeName: true, resumeKey: true } })).toEqual({ resumeName: "original.pdf", resumeKey: "m5-resume-original" });
  });

  it("advances every missed transition once, even with concurrent refreshes", async () => {
    await Promise.all([refreshApplication(userId, applicationId, at(90), 30), refreshApplication(userId, applicationId, at(90), 30)]);
    const first = await refreshApplication(userId, applicationId, at(90), 30);
    expect(first?.status).toBe("INTERVIEW_SCHEDULED");
    expect(first?.events.map(({ status }) => status)).toEqual(["APPLIED", "UNDER_REVIEW", "SHORTLISTED", "INTERVIEW_SCHEDULED"]);
    expect(first?.events.map(({ occurredAt }) => occurredAt)).toEqual([at(0), at(30), at(60), at(90)]);
    expect((await refreshApplication(userId, applicationId, at(45), 30))?.status).toBe("INTERVIEW_SCHEDULED");
    expect(await db.applicationStatusEvent.count({ where: { applicationId } })).toBe(4);
  });

  it("never reads or advances another candidate's application", async () => {
    const before = await db.application.findUnique({ where: { id: applicationId }, select: { updatedAt: true } });
    expect(await refreshApplication(otherId, applicationId, at(1000), 30)).toBeNull();
    expect(await db.application.findUnique({ where: { id: applicationId }, select: { updatedAt: true } })).toEqual(before);
    expect((await getCandidateApplications(otherId, 1, at(90), 30)).total).toBe(0);
  });

  it("paginates only the signed-in candidate's applications and returns current persisted timelines", async () => {
    for (let index = 2; index < 8; index++) await createApplication(userId, `m5-job-${index}`, appliedAt);
    const first = await getCandidateApplications(userId, 1, at(90), 30);
    const last = await getCandidateApplications(userId, 999, at(90), 30);
    expect(first).toMatchObject({ total: 8, page: 1, totalPages: 2 });
    expect(first.applications).toHaveLength(6);
    expect(last).toMatchObject({ page: 2 });
    expect(last.applications).toHaveLength(2);
    expect([...first.applications, ...last.applications].every(({ status }) => status === "INTERVIEW_SCHEDULED")).toBe(true);
    expect(new Set([...first.applications, ...last.applications].map(({ id }) => id)).size).toBe(8);
  });
});
