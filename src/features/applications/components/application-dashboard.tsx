import Link from "next/link";
import { redirect } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { ApplicationCard } from "@/features/applications/components/application-card";
import { StatusRefresh } from "@/features/applications/components/status-refresh";
import { getCandidateApplications } from "@/features/applications/queries/applications";
import { deriveStatus } from "@/features/applications/services/status-engine";
import { getPageNumbers } from "@/features/jobs/services/job-filters";
import { parseSimulationEnvironment } from "@/lib/env";

export async function ApplicationDashboard({ userId, page }: { userId: string; page: number }) {
  const { DEMO_STATUS_DELAY_SECONDS: delay } = parseSimulationEnvironment(process.env);
  const now = new Date();
  const result = await getCandidateApplications(userId, page, now, delay);
  if (page !== result.page) redirect(result.page === 1 ? "/dashboard" : `/dashboard?page=${result.page}`);
  const upcoming = result.applications.flatMap((application) => {
    const next = deriveStatus(application, now, delay).nextTransitionAt;
    return next ? [next.getTime()] : [];
  });

  return (
    <section className="mt-9" aria-label="My applications">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold">My applications <span className="ml-1 text-base font-normal text-muted-foreground">({result.total})</span></h2><StatusRefresh nextRefreshAt={upcoming.length ? Math.min(...upcoming) : null} /></div>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">Status updates are simulated for this demo. Matches of 90% or more progress toward a demo interview, one step every {delay} seconds. Other applications stay under review.</p>
      {result.applications.length ? <div className="mt-6 grid items-start gap-4 lg:grid-cols-2">{result.applications.map((application) => <ApplicationCard key={application.id} application={application} />)}</div> : <div className="mt-6 rounded-xl border bg-card px-6 py-12 text-center"><h3 className="text-xl font-semibold">Your next opportunity starts here.</h3><p className="mb-6 mt-3 text-sm text-muted-foreground">Apply to a job to see its progress and status timeline here.</p><Link href="/jobs" className={buttonVariants()}>Find a job</Link></div>}
      {result.totalPages > 1 && <nav aria-label="Application pages" className="mt-6 flex flex-wrap justify-center gap-2">{getPageNumbers(result.page, result.totalPages).map((number) => <Link key={number} prefetch={false} href={number === 1 ? "/dashboard" : `/dashboard?page=${number}`} aria-label={`Page ${number}`} aria-current={number === result.page ? "page" : undefined} className={buttonVariants({ variant: number === result.page ? "default" : "outline", size: "sm" })}>{number}</Link>)}</nav>}
    </section>
  );
}
