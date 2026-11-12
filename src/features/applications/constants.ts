import type { ApplicationStatus, ExperienceLevel } from "@/generated/prisma/enums";

export const MATCH_WEIGHTS = { skills: 70, experience: 20, location: 5, market: 5 } as const;
export const SHORTLIST_MATCH_SCORE = 90;
export const DEFAULT_STATUS_DELAY_SECONDS = 30;
export const APPLICATIONS_PER_PAGE = 6;

export const EXPERIENCE_RANK: Record<ExperienceLevel, number> = { ENTRY: 0, MID: 1, SENIOR: 2, LEAD: 3, EXECUTIVE: 4 };
export const STATUS_RANK: Record<ApplicationStatus, number> = { APPLIED: 0, UNDER_REVIEW: 1, SHORTLISTED: 2, INTERVIEW_SCHEDULED: 3, NOT_SELECTED: 3 };
export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  APPLIED: "Applied", UNDER_REVIEW: "Under review", SHORTLISTED: "Shortlisted", INTERVIEW_SCHEDULED: "Interview scheduled", NOT_SELECTED: "Not selected",
};
