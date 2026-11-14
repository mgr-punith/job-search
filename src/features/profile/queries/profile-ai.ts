import { cacheLife } from "next/cache";

import type { AiContext } from "@/features/profile/schemas/profile-ai";
import { db } from "@/lib/db";

export async function getProfileAiContext(userId: string, jobId: string): Promise<AiContext | null> {
  const [profile, job] = await Promise.all([
    db.candidateProfile.findUnique({ where: { userId }, select: {
      headline: true, bio: true, yearsExperience: true, experienceLevel: true, updatedAt: true,
      skills: { select: { skill: { select: { id: true, name: true } } }, take: 30 },
    } }),
    db.job.findUnique({ where: { id: jobId, isActive: true }, select: {
      id: true, title: true, skills: { select: { skill: { select: { id: true, name: true } } }, orderBy: { skill: { name: "asc" } }, take: 50 },
    } }),
  ]);
  if (!profile || !job) return null;
  return { revision: profile.updatedAt.toISOString(), headline: profile.headline ?? "", bio: profile.bio ?? "", yearsExperience: profile.yearsExperience, experienceLevel: profile.experienceLevel, skills: profile.skills.map(({ skill }) => skill), job: { id: job.id, title: job.title, skills: job.skills.map(({ skill }) => skill) } };
}

export async function getProfileAiJobs() {
  "use cache";
  cacheLife("minutes");

  return db.job.findMany({ where: { isActive: true }, select: { id: true, title: true, company: { select: { name: true } } }, orderBy: [{ updatedAt: "desc" }, { id: "asc" }], take: 50 });
}
