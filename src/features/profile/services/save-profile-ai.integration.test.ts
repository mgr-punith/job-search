import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { getTestDatabaseUrl } from "@/lib/test-database";

process.env.DATABASE_URL = getTestDatabaseUrl(process.env.TEST_DATABASE_URL);
const [{ db }, { saveProfileAiDraft }] = await Promise.all([import("@/lib/db"), import("@/features/profile/services/save-profile-ai")]);
const userId = "profile-ai-test-user";
const otherId = "profile-ai-other-user";
const skillIds = ["profile-ai-known", "profile-ai-denied"];
const draft = { headline: "React frontend developer", bio: "I know React and am looking for a frontend role." };

async function cleanup() {
  await db.user.deleteMany({ where: { id: { in: [userId, otherId] } } });
  await db.skill.deleteMany({ where: { id: { in: skillIds } } });
}
beforeAll(async () => {
  await cleanup();
  await db.skill.createMany({ data: skillIds.map((id) => ({ id, slug: id, name: id })) });
  for (const id of [userId, otherId]) {
    await db.user.create({ data: { id, name: "AI QA", email: `${id}@example.test`, profile: { create: {
      headline: "Original headline", bio: "Original bio.", phone: "+1 555 010 2040", country: "India", yearsExperience: 3,
      preferredMarkets: ["TECHNOLOGY"], resumeKey: `ai-${id}`, resumeUrl: `https://test.ufs.sh/f/ai-${id}`, resumeName: "resume.pdf",
    } } } });
  }
});
afterAll(async () => { await cleanup(); await db.$disconnect(); });

describe("reviewed AI profile persistence", () => {
  it("updates only reviewed fields and confirmed skills on the owning profile", async () => {
    const profile = await db.candidateProfile.findUniqueOrThrow({ where: { userId } });
    await saveProfileAiDraft(userId, profile.updatedAt.toISOString(), draft, [{ id: skillIds[0], name: "React" }]);
    const result = await db.candidateProfile.findUniqueOrThrow({ where: { userId }, include: { skills: true } });
    expect(result).toMatchObject({ ...draft, yearsExperience: 3, phone: "+1 555 010 2040", preferredMarkets: ["TECHNOLOGY"], resumeKey: `ai-${userId}`, resumeName: "resume.pdf" });
    expect(result.skills.map(({ skillId }) => skillId)).toEqual([skillIds[0]]);
    expect(await db.candidateProfile.findUnique({ where: { userId: otherId } })).toMatchObject({ headline: "Original headline" });
  });
  it("rejects an old draft after concurrent manual profile edits", async () => {
    const profile = await db.candidateProfile.findUniqueOrThrow({ where: { userId } });
    await db.candidateProfile.update({ where: { userId }, data: { bio: "A newer manual edit.", updatedAt: new Date(profile.updatedAt.getTime() + 1000) } });
    await expect(saveProfileAiDraft(userId, profile.updatedAt.toISOString(), draft, [])).rejects.toThrow();
    expect(await db.candidateProfile.findUnique({ where: { userId }, include: { skills: true } })).toMatchObject({ bio: "A newer manual edit.", skills: [{ skillId: skillIds[0] }] });
  });
});
