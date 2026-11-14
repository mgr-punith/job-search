import { STATUS_LABELS } from "@/features/applications/constants";
import type { ApplicationStatus } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";

const colours: Record<ApplicationStatus, string> = {
  APPLIED: "bg-muted text-foreground", UNDER_REVIEW: "bg-[#fff0d9] text-[#714615]",
  SHORTLISTED: "bg-[#dce3ff] text-[#294c8c]", INTERVIEW_SCHEDULED: "bg-secondary text-primary", NOT_SELECTED: "bg-red-50 text-red-800",
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-medium", colours[status])}>{STATUS_LABELS[status]}</span>;
}
