import type { Metadata } from "next";
import { navigation } from "next/cache";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { CandidateFooter } from "@/components/shared/candidate-footer";
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
  await navigation();
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
    <div className="min-h-dvh bg-background"><CandidateHeader current="dashboard" /><main id="main-content" className="mx-auto max-w-4xl px-5 py-8 sm:px-6 sm:py-10">
      <Link href="/dashboard" prefetch={false} className="mb-6 inline-flex rounded-full border border-foreground/30 px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">← My applications</Link>
      <article className="rounded-2xl border border-foreground/10 bg-card p-5 shadow-[0_16px_45px_rgb(18_61_50/0.06)] sm:p-9">
        <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Application progress</p><StatusBadge status={application.status} /></div>
        <h1 className="mt-5 font-serif text-4xl leading-tight tracking-[-0.035em] text-balance">{application.job.title}</h1>
        <p className="mt-2 text-muted-foreground">{application.job.company.name} · {formatJobLocation(application.job)}</p>
        <div className="mt-7 rounded-xl bg-[#dce3ff] p-5"><p className="text-sm text-[#294c8c]">Profile match at submission: <strong className="tabular-nums">{application.matchScore}%</strong></p><p className="mt-2 text-xs leading-6 text-[#294c8c]/80">Skills count for 70 points, experience for 20, location for 5, and market for 5. Editing your profile later keeps this application’s score and resume unchanged.</p></div>
        {application.interviewAt && <section className="mt-6 rounded-xl border border-primary/25 bg-secondary p-5"><h2 className="font-serif text-xl text-foreground">Demo interview scheduled</h2><p className="mt-2 text-sm text-foreground"><time dateTime={application.interviewAt.toISOString()}>{formatApplicationDate(application.interviewAt)} UTC</time></p><p className="mt-2 text-xs text-foreground/70">This is a simulated appointment. No recruiter meeting has been booked.</p></section>}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-foreground/10 pt-7"><h2 className="font-serif text-2xl">Status timeline</h2><StatusRefresh nextRefreshAt={next?.getTime() ?? null} /></div>
        <ApplicationTimeline events={application.events} />
        <p className="mt-5 text-xs leading-6 text-muted-foreground">Status updates are simulated for this demo, with a {delay}-second delay between steps. Matches of 90% or more progress to an interview. Other applications stay under review.</p>
        <div className="mt-7 flex flex-wrap gap-5 border-t border-foreground/10 pt-6 text-sm"><a className="rounded font-semibold text-primary underline underline-offset-4 focus-visible:outline-2" href={application.resumeUrl} target="_blank" rel="noopener noreferrer">View submitted resume{application.resumeName ? ` (${application.resumeName})` : ""}</a>{application.job.isActive && <Link href={`/jobs/${application.job.slug}`} className="rounded font-semibold text-primary underline underline-offset-4 focus-visible:outline-2">View job</Link>}</div>
      </article>
    </main><CandidateFooter /></div>
  );
}
