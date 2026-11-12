import type { Prisma } from "@/generated/prisma/client";

export const matchingCandidateSelect = {
  experienceLevel: true, country: true, preferredMarkets: true,
  skills: { select: { skillId: true }, take: 30, orderBy: { skillId: "asc" } },
} satisfies Prisma.CandidateProfileSelect;

export const applicationSelect = {
  id: true, status: true, appliedAt: true, matchScore: true, interviewAt: true,
  resumeUrl: true, resumeName: true,
  job: { select: { slug: true, title: true, location: true, country: true, isActive: true, company: { select: { name: true } } } },
  events: { select: { status: true, occurredAt: true }, orderBy: { occurredAt: "asc" }, take: 5 },
} satisfies Prisma.ApplicationSelect;

export type ApplicationData = Prisma.ApplicationGetPayload<{ select: typeof applicationSelect }>;
