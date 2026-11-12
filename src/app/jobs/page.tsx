import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CandidateHeader } from "@/components/shared/candidate-header";
import { buttonVariants } from "@/components/ui/button";
import { getSessionUserId } from "@/features/auth/queries/session";
import { ApplyPanel } from "@/features/applications/components/apply-panel";
import { getMatchingCandidate } from "@/features/applications/queries/applications";
import { computeMatchScore } from "@/features/applications/services/match-score";
import { JobCard } from "@/features/jobs/components/job-card";
import { JobDetail } from "@/features/jobs/components/job-detail";
import { JobPagination } from "@/features/jobs/components/job-pagination";
import { JobSearchForm } from "@/features/jobs/components/job-search-form";
import { getJobDetail, getJobFilterOptions, getJobs } from "@/features/jobs/queries/jobs";
import { parseJobSearch, type JobSearchParams } from "@/features/jobs/schemas/search";
import { buildJobsUrl, JOBS_PER_PAGE } from "@/features/jobs/services/job-filters";

export const metadata: Metadata = { title: "Find jobs | JobSearch", description: "Explore jobs by skills, location, experience, salary, and benefits." };
export const instant = false;

export default async function JobsPage({ searchParams }: { searchParams: Promise<JobSearchParams> }) {
  const filters = parseJobSearch(await searchParams);
  const [results, options, userId] = await Promise.all([getJobs(filters), getJobFilterOptions(), getSessionUserId()]);
  if (results.page !== filters.page) redirect(buildJobsUrl(filters, { page: results.page, job: "" }));
  const selectedJob = results.jobs.find(({ slug }) => slug === filters.job) ?? results.jobs[0];
  const [detail, candidate] = await Promise.all([
    selectedJob ? getJobDetail(selectedJob.slug) : null,
    userId ? getMatchingCandidate(userId) : null,
  ]);

  return (
    <div className="min-h-dvh">
      <CandidateHeader current="jobs" signedIn={Boolean(userId)} />
      <main>
        <JobSearchForm key={buildJobsUrl(filters)} filters={filters} {...options} />
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10">
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)]">
            <section aria-label="Job results" className="min-w-0">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold">{results.total} {results.total === 1 ? "job" : "jobs"} found</h2>
                <p className="text-xs text-muted-foreground">Sort: Last updated</p>
              </div>
              {results.total ? <>
                <p className="mb-4 text-xs text-muted-foreground">Showing {(results.page - 1) * JOBS_PER_PAGE + 1}–{Math.min(results.page * JOBS_PER_PAGE, results.total)} of {results.total}</p>
                <ul className="space-y-3 lg:max-h-[calc(100dvh-10rem)] lg:overflow-y-auto lg:p-1">{results.jobs.map((job) => <JobCard key={job.id} job={job} filters={filters} selected={job.id === selectedJob?.id} matchScore={candidate ? computeMatchScore(candidate, job) : undefined} />)}</ul>
                <JobPagination filters={filters} totalPages={results.totalPages} />
              </> : <div className="rounded-xl border bg-card px-6 py-12"><h3 className="text-xl font-semibold">No jobs match these filters</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">Try a broader keyword or location, or clear your filters to see all open roles.</p><Link className="mt-5 inline-block rounded text-sm font-medium text-primary underline underline-offset-4 focus-visible:outline-2" href="/jobs">Clear all filters</Link></div>}
            </section>
            {detail && <aside className="hidden min-w-0 lg:sticky lg:top-6 lg:block"><JobDetail job={detail} matchScore={candidate ? computeMatchScore(candidate, detail) : undefined} applyPanel={<ApplyPanel userId={userId} jobId={detail.id} jobSlug={detail.slug} />} /></aside>}
          </div>
          <section className="mt-12 flex flex-col items-start justify-between gap-6 rounded-2xl bg-[#143553] px-6 py-9 text-white sm:flex-row sm:items-center sm:px-9">
            <div><h2 className="text-2xl font-semibold tracking-tight">Make your next move.</h2><p className="mt-3 max-w-lg text-sm leading-6 text-slate-200">Bring your experience, skills, and resume together in one candidate profile.</p></div>
            <Link href={userId ? "/profile" : "/signup"} className={buttonVariants({ size: "lg" })}>{userId ? "Update my profile" : "Create a profile"}</Link>
          </section>
        </div>
      </main>
      <footer className="border-t bg-card"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-7 text-sm sm:px-6"><Link href="/" className="rounded font-semibold focus-visible:outline-2">JobSearch</Link><p className="text-muted-foreground">A candidate portal demo for Jobs Territory.</p><Link href="/jobs" className="rounded hover:underline focus-visible:outline-2">Browse jobs</Link></div></footer>
    </div>
  );
}
