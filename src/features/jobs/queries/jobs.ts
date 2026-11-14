import { cacheLife } from "next/cache";

import { jobSlugSchema, type JobSearch } from "@/features/jobs/schemas/search";
import { buildJobWhere, JOBS_PER_PAGE } from "@/features/jobs/services/job-filters";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { computeMatchScore, type MatchingCandidate } from "@/features/applications/services/match-score";
import { PROFILE_MATCH_MINIMUM } from "@/features/jobs/services/preferred-roles";

const jobCardSelect = {
  id: true, slug: true, title: true, location: true, country: true,
  workplaceType: true, jobType: true, experienceLevel: true,
  salaryMin: true, salaryMax: true, salaryCurrency: true,
  isActivelyRecruiting: true, publishedAt: true, updatedAt: true,
  market: true,
  skills: { select: { skillId: true }, take: 50, orderBy: { skillId: "asc" } },
  company: { select: { name: true, slug: true } },
} satisfies Prisma.JobSelect;

const jobDetailSelect = {
  ...jobCardSelect,
  summary: true, about: true, responsibilities: true, idealProfile: true, whatsOnOffer: true,
  timeZone: true, market: true,
  company: { select: { name: true, slug: true, size: true, description: true } },
  skills: { select: { skillId: true, skill: { select: { name: true } } }, orderBy: { skill: { name: "asc" } }, take: 50 },
  benefits: { select: { benefit: { select: { name: true } } }, orderBy: { benefit: { name: "asc" } }, take: 30 },
} satisfies Prisma.JobSelect;

export type JobCardData = Prisma.JobGetPayload<{ select: typeof jobCardSelect }>;
export type JobDetailData = Prisma.JobGetPayload<{ select: typeof jobDetailSelect }>;

export async function getJobs(filters: JobSearch, candidate: MatchingCandidate | null = null) {
  const where = buildJobWhere(filters);
  let matchedIds: string[] | null = null;
  if (filters.match === "profile") {
    matchedIds = [];
    if (candidate) {
      // Score before pagination so counts and later pages use the same matching rule as badges.
      for (let skip = 0; ; skip += 100) {
        const batch = await db.job.findMany({ where, select: jobCardSelect, orderBy: { id: "asc" }, skip, take: 100 });
        matchedIds.push(...batch.filter((job) => computeMatchScore(candidate, job) >= PROFILE_MATCH_MINIMUM).map(({ id }) => id));
        if (batch.length < 100) break;
      }
    }
  }
  return getJobPage({ ...filters, job: "" }, matchedIds);
}

async function getJobPage(filters: JobSearch, matchedIds: string[] | null) {
  "use cache";
  cacheLife("minutes");

  // Only public filters and job IDs enter this cache; candidate data stays request-scoped.
  const where = buildJobWhere(filters);
  if (matchedIds !== null) where.id = { in: matchedIds };
  const total = await db.job.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / JOBS_PER_PAGE));
  const page = Math.min(filters.page, totalPages);
  const jobs = await db.job.findMany({
    where, select: jobCardSelect,
    orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
    skip: (page - 1) * JOBS_PER_PAGE, take: JOBS_PER_PAGE,
  });
  return { jobs, total, totalPages, page };
}

export async function getJobDetail(slug: string) {
  "use cache";
  cacheLife("minutes");

  const parsed = jobSlugSchema.safeParse(slug);
  if (!parsed.success) return null;
  return db.job.findUnique({ where: { slug: parsed.data, isActive: true }, select: jobDetailSelect });
}

export async function getJobFilterOptions() {
  "use cache";
  cacheLife("minutes");

  const [companies, benefits] = await Promise.all([
    db.company.findMany({ where: { jobs: { some: { isActive: true } } }, select: { slug: true, name: true }, orderBy: { name: "asc" }, take: 100 }),
    db.benefit.findMany({ where: { jobs: { some: { job: { isActive: true } } } }, select: { slug: true, name: true }, orderBy: { name: "asc" }, take: 100 }),
  ]);
  return { companies, benefits };
}
