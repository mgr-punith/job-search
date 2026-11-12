import { EXPERIENCE_RANK, MATCH_WEIGHTS } from "@/features/applications/constants";
import type { ExperienceLevel, Market, WorkplaceType } from "@/generated/prisma/enums";

export type MatchingCandidate = {
  experienceLevel: ExperienceLevel;
  country: string | null;
  preferredMarkets: Market[];
  skills: { skillId: string }[];
};

export type MatchingJob = {
  experienceLevel: ExperienceLevel;
  country: string;
  location: string;
  market: Market;
  workplaceType: WorkplaceType;
  skills: { skillId: string }[];
};

export function computeMatchScore(candidate: MatchingCandidate, job: MatchingJob): number {
  const required = new Set(job.skills.map(({ skillId }) => skillId));
  const available = new Set(candidate.skills.map(({ skillId }) => skillId));
  const overlap = [...required].filter((id) => available.has(id)).length;
  const skills = required.size ? MATCH_WEIGHTS.skills * overlap / required.size : 0;

  const levelGap = EXPERIENCE_RANK[job.experienceLevel] - EXPERIENCE_RANK[candidate.experienceLevel];
  const experience = levelGap <= 0 ? MATCH_WEIGHTS.experience : levelGap === 1 ? MATCH_WEIGHTS.experience / 2 : 0;
  const sameCountry = Boolean(candidate.country?.trim()) && candidate.country?.trim().toLowerCase() === job.country.trim().toLowerCase();
  const worldwide = job.workplaceType === "REMOTE" && /\b(worldwide|global|anywhere)\b/i.test(`${job.country} ${job.location}`);
  const location = sameCountry || worldwide ? MATCH_WEIGHTS.location : 0;
  const market = candidate.preferredMarkets.includes(job.market) ? MATCH_WEIGHTS.market : 0;

  return Math.round(skills + experience + location + market);
}
