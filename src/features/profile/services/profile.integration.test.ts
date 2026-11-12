import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { profileSchema } from "@/features/profile/schemas/profile";
import { getTestDatabaseUrl } from "@/lib/test-database";

process.env.DATABASE_URL = getTestDatabaseUrl(process.env.TEST_DATABASE_URL);

const [{ db }, { saveCandidateProfile }, { getCandidateProfile }, { replaceCandidateResume, detachCandidateResume }] = await Promise.all([
  import("@/lib/db"),
  import("@/features/profile/services/profile"),
  import("@/features/profile/queries/profile"),
  import("@/features/profile/services/resume"),
]);

const candidateId = "m3-profile-candidate";
const otherId = "m3-profile-other";
const skillId = "m3-profile-skill";
const jobId = "m3-profile-job";
const companyId = "m3-profile-company";
const candidateIds = [candidateId, otherId];

async function cleanup() {
  await db.user.deleteMany({ where: { id: { in: candidateIds } } });
  await db.job.deleteMany({ where: { id: jobId } });
  await db.company.deleteMany({ where: { id: companyId } });
  await db.skill.deleteMany({ where: { id: skillId } });
}

beforeAll(async () => {
  await cleanup();
  await db.user.createMany({ data: [
    { id: candidateId, name: "Candidate One", email: "m3-profile@example.com" },
    { id: otherId, name: "Candidate Two", email: "m3-other@example.com" },
  ] });
  await db.skill.create({ data: { id: skillId, slug: "m3-test-skill", name: "M3 test skill" } });
});

afterAll(async () => { await cleanup(); await db.$disconnect(); });

function resume(key: string) {
  return { key, ufsUrl: `https://test.ufs.sh/f/${key}`, name: "resume.pdf", type: "application/pdf", size: 256 };
}

describe("candidate profile and resume persistence", () => {
  it("saves the profile and skills, then reloads only the requested candidate", async () => {
    const input = profileSchema.parse({
      name: "Updated Candidate", headline: "Frontend developer", yearsExperience: 4,
      experienceLevel: "MID", location: "Bengaluru", skillIds: [skillId],
      preferredMarkets: ["TECHNOLOGY"], preferredWorkplaceTypes: ["REMOTE"],
    });
    await saveCandidateProfile(candidateId, input);
    expect(await getCandidateProfile(candidateId)).toMatchObject({
      name: "Updated Candidate", profile: { headline: "Frontend developer", yearsExperience: 4, skills: [{ skillId }] },
    });
    expect(await getCandidateProfile(otherId)).toMatchObject({ name: "Candidate Two", profile: null });

    await saveCandidateProfile(candidateId, { ...input, skillIds: [] });
    expect((await getCandidateProfile(candidateId)).profile?.skills).toEqual([]);
  });

  it("rejects unknown skills before changing the candidate", async () => {
    const input = profileSchema.parse({ name: "Should not save", yearsExperience: 0, experienceLevel: "ENTRY", skillIds: ["missing-skill"] });
    await expect(saveCandidateProfile(candidateId, input)).rejects.toThrow("Invalid skill selection");
    expect((await getCandidateProfile(candidateId)).name).toBe("Updated Candidate");
  });

  it("replaces the candidate's resume and returns only their unused storage key", async () => {
    expect(await replaceCandidateResume(candidateId, resume("m3-first"))).toBeNull();
    expect(await replaceCandidateResume(candidateId, resume("m3-second"))).toBe("m3-first");
    expect(await detachCandidateResume(otherId)).toBeNull();
    expect((await getCandidateProfile(candidateId)).profile?.resumeUrl).toBe("https://test.ufs.sh/f/m3-second");
    expect(await detachCandidateResume(candidateId)).toBe("m3-second");
    expect((await getCandidateProfile(candidateId)).profile?.resumeUrl).toBeNull();
  });

  it("keeps resume snapshots referenced by submitted applications", async () => {
    await db.company.create({ data: { id: companyId, slug: "m3-test-company", name: "M3 Test Company", description: "Test fixture", size: "SMALL", location: "London" } });
    await db.job.create({ data: {
      id: jobId, companyId, slug: "m3-test-job", title: "Test role", summary: "Test fixture", about: "Test fixture",
      responsibilities: [], idealProfile: [], whatsOnOffer: [], location: "London", country: "United Kingdom", timeZone: "Europe/London",
      workplaceType: "REMOTE", jobType: "FULL_TIME", experienceLevel: "MID", market: "TECHNOLOGY", salaryMin: 1, salaryMax: 2,
    } });
    await replaceCandidateResume(candidateId, resume("m3-submitted"));
    await db.application.create({ data: { userId: candidateId, jobId, resumeKey: "m3-submitted", resumeUrl: resume("m3-submitted").ufsUrl, matchScore: 95 } });
    expect(await replaceCandidateResume(candidateId, resume("m3-latest"))).toBeNull();
    expect(await detachCandidateResume(candidateId)).toBe("m3-latest");
    expect(await db.application.findUnique({ where: { userId_jobId: { userId: candidateId, jobId } }, select: { resumeKey: true } })).toEqual({ resumeKey: "m3-submitted" });
  });
});
