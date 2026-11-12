import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { CandidateHeader } from "@/components/shared/candidate-header";
import { ApplicationTimeline, formatApplicationDate } from "@/features/applications/components/application-timeline";
import { StatusBadge } from "@/features/applications/components/status-badge";
import { StatusRefresh } from "@/features/applications/components/status-refresh";
import { applicationIdSchema } from "@/features/applications/schemas/application";
import { refreshApplication } from "@/features/applications/services/applications";
import { deriveStatus } from "@/features/applications/services/status-engine";
import { getSessionUserId } from "@/features/auth/queries/session";
import { getLoginUrl } from "@/features/auth/services/auth-routing";
import { formatJobLocation } from "@/features/jobs/services/job-display";
import { parseSimulationEnvironment } from "@/lib/env";

export const metadata: Metadata = { title: "Application progress | JobSearch" };
export const instant = false;

export default async function ApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = applicationIdSchema.safeParse(id);
  if (!parsed.success) notFound();
  const userId = await getSessionUserId();
  if (!userId) redirect(getLoginUrl(`/applications/${parsed.data}`));
  const { DEMO_STATUS_DELAY_SECONDS: delay } = parseSimulationEnvironment(process.env);
  const now = new Date();
  const application = await refreshApplication(userId, parsed.data, now, delay);
  if (!application) notFound();
  const next = deriveStatus(application, now, delay).nextTransitionAt;

  return (
    <div className="min-h-dvh bg-muted/35"><CandidateHeader current="dashboard" /><main className="mx-auto max-w-3xl px-5 py-8 sm:px-6">
      <Link href="/dashboard" prefetch={false} className="mb-5 inline-block rounded text-sm font-medium text-primary hover:underline focus-visible:outline-2">← My applications</Link>
      <article className="rounded-xl border bg-card p-5 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Application progress</p><StatusBadge status={application.status} /></div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">{application.job.title}</h1>
        <p className="mt-2 text-muted-foreground">{application.job.company.name} · {formatJobLocation(application.job)}</p>
        <div className="mt-6 rounded-lg bg-muted/60 p-4"><p className="text-sm">Profile match at submission: <strong>{application.matchScore}%</strong></p><p className="mt-2 text-xs leading-6 text-muted-foreground">Skills count for 70 points, experience for 20, location for 5, and market for 5. Editing your profile later keeps this application’s score and resume unchanged.</p></div>
        {application.interviewAt && <section className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4"><h2 className="font-semibold text-emerald-900">Demo interview scheduled</h2><p className="mt-2 text-sm text-emerald-900"><time dateTime={application.interviewAt.toISOString()}>{formatApplicationDate(application.interviewAt)} UTC</time></p><p className="mt-2 text-xs text-emerald-900">This is a simulated appointment. No recruiter meeting has been booked.</p></section>}
        <div className="mt-7 flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">Status timeline</h2><StatusRefresh nextRefreshAt={next?.getTime() ?? null} /></div>
        <ApplicationTimeline events={application.events} />
        <p className="mt-5 text-xs leading-6 text-muted-foreground">Status updates are simulated for this demo, with a {delay}-second delay between steps. Matches of 90% or more progress to an interview. Other applications stay under review.</p>
        <div className="mt-7 flex flex-wrap gap-5 border-t pt-6 text-sm"><a className="rounded font-medium text-primary underline underline-offset-4 focus-visible:outline-2" href={application.resumeUrl} target="_blank" rel="noopener noreferrer">View submitted resume{application.resumeName ? ` (${application.resumeName})` : ""}</a>{application.job.isActive && <Link href={`/jobs/${application.job.slug}`} className="rounded text-primary underline underline-offset-4 focus-visible:outline-2">View job</Link>}</div>
      </article>
    </main></div>
  );
}
