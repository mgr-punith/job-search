import Link from "next/link";

import { ApplicationTimeline, formatApplicationDate } from "@/features/applications/components/application-timeline";
import { StatusBadge } from "@/features/applications/components/status-badge";
import type { ApplicationData } from "@/features/applications/queries/selects";
import { formatJobLocation } from "@/features/jobs/services/job-display";

export function ApplicationCard({ application }: { application: ApplicationData }) {
  return (
    <article className="rounded-xl border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-semibold"><Link className="rounded hover:text-primary focus-visible:outline-2" href={`/applications/${application.id}`} prefetch={false}>{application.job.title}</Link></h2><p className="mt-1 text-sm text-muted-foreground">{application.job.company.name} · {formatJobLocation(application.job)}</p></div><StatusBadge status={application.status} /></div>
      <p className="mt-4 text-sm text-muted-foreground">Profile match at submission: <span className="font-semibold text-foreground">{application.matchScore}%</span></p>
      {application.interviewAt && <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">Demo interview: {formatApplicationDate(application.interviewAt)} UTC</p>}
      <ApplicationTimeline events={application.events} />
      <Link href={`/applications/${application.id}`} prefetch={false} className="mt-5 inline-block rounded text-sm font-medium text-primary underline underline-offset-4 focus-visible:outline-2">View application details</Link>
    </article>
  );
}
