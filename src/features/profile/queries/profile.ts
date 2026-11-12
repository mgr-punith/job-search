import { db } from "@/lib/db";

export async function getCandidateProfile(userId: string) {
  return db.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      profile: {
        select: {
          headline: true, phone: true, location: true, country: true, timeZone: true,
          yearsExperience: true, experienceLevel: true, bio: true,
          preferredMarkets: true, preferredWorkplaceTypes: true,
          resumeName: true, resumeUrl: true,
          skills: { select: { skillId: true }, take: 30, orderBy: { skillId: "asc" } },
        },
      },
    },
  });
}

export async function getAvailableSkills() {
  return db.skill.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" }, take: 100 });
}
