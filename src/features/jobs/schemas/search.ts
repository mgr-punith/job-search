import { z } from "zod";

import { ExperienceLevel, JobType, Market } from "@/generated/prisma/enums";
import { preferredRoles } from "@/features/jobs/services/preferred-roles";

export const salaryRanges = {
  "0-50": { label: "Up to $50,000", min: 0, max: 50_000 },
  "50-100": { label: "$50,000–$100,000", min: 50_000, max: 100_000 },
  "100-150": { label: "$100,000–$150,000", min: 100_000, max: 150_000 },
  "150-plus": { label: "$150,000+", min: 150_000 },
} as const;

export const jobSlugSchema = z.string().trim().max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const optionalSlug = jobSlugSchema.or(z.literal("")).catch("");

const jobSearchSchema = z.object({
  q: z.string().trim().max(120).catch(""),
  location: z.string().trim().max(120).catch(""),
  experience: z.enum(ExperienceLevel).or(z.literal("")).catch(""),
  company: optionalSlug,
  type: z.enum(JobType).or(z.literal("")).catch(""),
  salary: z.enum(["0-50", "50-100", "100-150", "150-plus"]).or(z.literal("")).catch(""),
  market: z.enum(Market).or(z.literal("")).catch(""),
  benefit: optionalSlug,
  match: z.enum(["profile", ...Object.keys(preferredRoles)]).or(z.literal("")).catch(""),
  page: z.coerce.number().int().min(1).max(10_000).catch(1),
  job: optionalSlug,
});

export type JobSearch = z.infer<typeof jobSearchSchema>;
export type JobSearchParams = Record<string, string | string[] | undefined>;

export function parseJobSearch(params: JobSearchParams): JobSearch {
  return jobSearchSchema.parse(Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  ));
}
