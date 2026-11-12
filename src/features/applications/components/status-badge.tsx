import { STATUS_LABELS } from "@/features/applications/constants";
import type { ApplicationStatus } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";

const colours: Record<ApplicationStatus, string> = {
  APPLIED: "bg-slate-100 text-slate-700", UNDER_REVIEW: "bg-amber-50 text-amber-800",
  SHORTLISTED: "bg-cyan-50 text-cyan-800", INTERVIEW_SCHEDULED: "bg-emerald-50 text-emerald-800", NOT_SELECTED: "bg-rose-50 text-rose-800",
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-medium", colours[status])}>{STATUS_LABELS[status]}</span>;
}
