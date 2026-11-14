import Link from "next/link";
import { redirect } from "next/navigation";

import { CandidateFooter } from "@/components/shared/candidate-footer";
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

export async function JobsBrowser({ searchParams }: { searchParams: Promise<JobSearchParams> }) {
  const [rawFilters, options, userId] = await Promise.all([searchParams, getJobFilterOptions(), getSessionUserId()]);
  const filters = parseJobSearch(rawFilters);
  const candidatePromise = userId ? getMatchingCandidate(userId) : Promise.resolve(null);
  const [candidate, results] = await Promise.all([
    candidatePromise,
    filters.match === "profile" ? candidatePromise.then((candidate) => getJobs(filters, candidate)) : getJobs(filters),
  ]);
  if (results.page !== filters.page) redirect(buildJobsUrl(filters, { page: results.page, job: "" }));
  const selectedJob = results.jobs.find(({ slug }) => slug === filters.job) ?? results.jobs[0];
  const detail = selectedJob ? await getJobDetail(selectedJob.slug) : null;

  return (
    <div className="min-h-dvh bg-background">
      <CandidateHeader current="jobs" signedIn={Boolean(userId)} />
      <main id="main-content">
        <JobSearchForm key={buildJobsUrl(filters, { page: 1, job: "" })} filters={filters} companies={options.companies} signedIn={Boolean(userId)} />
        <div className="mx-auto max-w-7xl px-5 py-5 sm:px-6 lg:px-8">
          {filters.match === "profile" ? <p className="mb-4 text-sm text-muted-foreground">{userId ? "Showing jobs with a profile match of 70% or higher. Update your skills and preferences to improve your matches." : "Log in and complete your profile to find matching jobs."}</p> : null}
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)]">
            <section aria-label="Job results" className="min-w-0">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-serif text-2xl">{results.total} {results.total === 1 ? "job" : "jobs"} found</h2>
                <p className="text-xs text-muted-foreground">Sort: Last updated</p>
              </div>
              {results.total ? <>
                <p aria-live="polite" aria-atomic="true" className="mb-4 text-xs text-muted-foreground">Showing {(results.page - 1) * JOBS_PER_PAGE + 1}–{Math.min(results.page * JOBS_PER_PAGE, results.total)} of {results.total}</p>
                <ul key={buildJobsUrl(filters, { job: "" })} className="content-enter space-y-2 lg:max-h-[calc(100dvh-9rem)] lg:overflow-y-auto lg:p-1">{results.jobs.map((job) => <JobCard key={job.id} job={job} filters={filters} selected={job.id === selectedJob?.id} matchScore={candidate ? computeMatchScore(candidate, job) : undefined} />)}</ul>
                <JobPagination filters={filters} totalPages={results.totalPages} />
              </> : <div className="rounded-2xl border border-foreground/10 bg-card px-6 py-12"><h3 className="font-serif text-2xl">No jobs match these filters</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">Try a broader keyword or location, or clear your filters to see all open roles.</p><Link className="mt-5 inline-block rounded text-sm font-semibold text-primary underline underline-offset-4 focus-visible:outline-2" href="/jobs">Clear all filters</Link></div>}
            </section>
            {detail && <aside key={detail.id} className="content-enter hidden min-w-0 lg:sticky lg:top-20 lg:block lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto"><JobDetail job={detail} signedIn={Boolean(userId)} matchScore={candidate ? computeMatchScore(candidate, detail) : undefined} applyPanel={<ApplyPanel userId={userId} jobId={detail.id} jobSlug={detail.slug} />} /></aside>}
          </div>
          <section className="relative mt-14 flex flex-col items-start justify-between gap-6 overflow-hidden rounded-2xl bg-[#103f34] px-6 py-10 text-white sm:flex-row sm:items-center sm:px-10">
            <div aria-hidden="true" className="absolute -right-16 -top-20 size-56 rounded-full border-[2.5rem] border-[#7d91f5]/70" />
            <div className="relative"><h2 className="font-serif text-3xl tracking-[-0.025em]">Make your next move.</h2><p className="mt-3 max-w-lg text-sm leading-6 text-white/70">Bring your experience, skills, and resume together in one candidate profile.</p></div>
            <Link href={userId ? "/profile" : "/signup"} className={buttonVariants({ size: "lg" })}>{userId ? "Update my profile" : "Create a profile"}</Link>
          </section>
        </div>
      </main>
      <CandidateFooter signedIn={Boolean(userId)} />
    </div>
  );
}
