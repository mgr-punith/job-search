import { type JobSearch, salaryRanges } from "@/features/jobs/schemas/search";
import type { Prisma } from "@/generated/prisma/client";
import { preferredRoles } from "@/features/jobs/services/preferred-roles";

export const JOBS_PER_PAGE = 8;

function literalContains(value: string) {
  // PostgreSQL treats these characters as LIKE patterns unless escaped.
  return { contains: value.replace(/[\\%_]/g, "\\$&"), mode: "insensitive" as const };
}

export function buildJobWhere(filters: JobSearch): Prisma.JobWhereInput {
  const where: Prisma.JobWhereInput = { isActive: true };
  const and: Prisma.JobWhereInput[] = [];

  if (filters.q) {
    const contains = literalContains(filters.q);
    and.push({ OR: [
      { title: contains },
      { company: { name: contains } },
      { skills: { some: { skill: { name: contains } } } },
    ] });
  }
  if (filters.location) {
    const contains = literalContains(filters.location);
    and.push({ OR: [{ location: contains }, { country: contains }, { timeZone: contains }] });
  }
  const role = preferredRoles[filters.match as keyof typeof preferredRoles];
  if (role) and.push({ OR: role.titles.map((title) => ({ title: literalContains(title) })) });
  if (and.length) where.AND = and;
  if (filters.experience) where.experienceLevel = filters.experience;
  if (filters.company) where.company = { slug: filters.company };
  if (filters.type) where.jobType = filters.type;
  if (filters.market) where.market = filters.market;
  if (filters.benefit) where.benefits = { some: { benefit: { slug: filters.benefit } } };
  if (filters.salary) {
    const range = salaryRanges[filters.salary];
    where.salaryCurrency = "USD";
    where.salaryMax = { gte: range.min };
    if ("max" in range) where.salaryMin = { lte: range.max };
  }
  return where;
}

export function buildJobsUrl(filters: JobSearch, overrides: Partial<JobSearch> = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...filters, ...overrides })) {
    if (value !== "" && !(key === "page" && value === 1)) params.set(key, String(value));
  }
  const query = params.toString();
  return query ? `/jobs?${query}` : "/jobs";
}

export function getPageNumbers(current: number, total: number) {
  const start = Math.max(1, Math.min(current - 2, total - 4));
  return Array.from({ length: Math.min(5, total) }, (_, index) => start + index);
}
