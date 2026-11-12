import { DEFAULT_STATUS_DELAY_SECONDS, SHORTLIST_MATCH_SCORE } from "@/features/applications/constants";
import type { ApplicationStatus } from "@/generated/prisma/enums";

type StatusSource = { id: string; matchScore: number; appliedAt: Date };
export type StatusEvent = { status: ApplicationStatus; occurredAt: Date };

export function deriveStatus(application: StatusSource, now: Date, delaySeconds = DEFAULT_STATUS_DELAY_SECONDS) {
  const stages: ApplicationStatus[] = application.matchScore >= SHORTLIST_MATCH_SCORE
    ? ["APPLIED", "UNDER_REVIEW", "SHORTLISTED", "INTERVIEW_SCHEDULED"]
    : ["APPLIED", "UNDER_REVIEW"];
  const elapsed = Math.max(0, now.getTime() - application.appliedAt.getTime());
  const stage = Math.min(stages.length - 1, Math.floor(elapsed / (delaySeconds * 1000)));
  const status = stages[stage] ?? "APPLIED";
  const events: StatusEvent[] = stages.slice(0, stage + 1).map((status, index) => ({
    status, occurredAt: new Date(application.appliedAt.getTime() + index * delaySeconds * 1000),
  }));
  // The id fixes the appointment so reloads never move the interview date.
  const idHash = [...application.id].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 0);
  const interviewAt = status === "INTERVIEW_SCHEDULED"
    ? new Date(application.appliedAt.getTime() + (4 + idHash % 3) * 86_400_000)
    : null;
  const nextTransitionAt = stage < stages.length - 1
    ? new Date(application.appliedAt.getTime() + (stage + 1) * delaySeconds * 1000)
    : null;
  return { status, events, interviewAt, nextTransitionAt };
}
