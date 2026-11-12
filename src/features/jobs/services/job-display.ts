import type { CompanySize, ExperienceLevel, JobType, Market, WorkplaceType } from "@/generated/prisma/enums";

export const experienceLabels: Record<ExperienceLevel, string> = {
  ENTRY: "Entry level", MID: "Mid level", SENIOR: "Senior level", LEAD: "Lead", EXECUTIVE: "Executive",
};
export const jobTypeLabels: Record<JobType, string> = {
  FULL_TIME: "Full time", PART_TIME: "Part time", CONTRACT: "Contract", TEMPORARY: "Temporary", INTERNSHIP: "Internship",
};
export const marketLabels: Record<Market, string> = {
  TECHNOLOGY: "Technology", FINTECH: "Fintech", HEALTHCARE: "Healthcare", ECOMMERCE: "E-commerce",
  EDUCATION: "Education", MEDIA: "Media", PROFESSIONAL_SERVICES: "Professional services",
};
export const workplaceLabels: Record<WorkplaceType, string> = { REMOTE: "Remote", HYBRID: "Hybrid", ON_SITE: "On site" };
export const companySizeLabels: Record<CompanySize, string> = {
  STARTUP: "1–10 employees", SMALL: "11–50 employees", MEDIUM: "51–200 employees", LARGE: "201–1,000 employees", ENTERPRISE: "1,001+ employees",
};

export function formatJobLocation(job: { location: string; country: string }) {
  const countryIncluded = job.location.split(",").some((part) => part.trim().toLowerCase() === job.country.toLowerCase());
  return countryIncluded ? job.location : `${job.location}, ${job.country}`;
}

export function formatSalary(job: { salaryMin: number; salaryMax: number; salaryCurrency: string }) {
  const formatter = new Intl.NumberFormat("en-US", { style: "currency", currency: job.salaryCurrency, maximumFractionDigits: 0 });
  return `${formatter.format(job.salaryMin)}–${formatter.format(job.salaryMax)}`;
}

export function formatJobDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(date);
}
