export type ApplicationErrorCode = "RESUME_REQUIRED" | "JOB_CLOSED" | "ALREADY_APPLIED";

const messages: Record<ApplicationErrorCode, string> = {
  RESUME_REQUIRED: "Upload a resume to your profile before applying.",
  JOB_CLOSED: "This job is no longer accepting applications.",
  ALREADY_APPLIED: "You have already applied to this job.",
};

export class ApplicationError extends Error {
  constructor(public readonly code: ApplicationErrorCode, public readonly applicationId?: string) {
    super(messages[code]);
  }
}
