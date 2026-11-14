import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CandidateHeader } from "@/components/shared/candidate-header";
import { CandidateFooter } from "@/components/shared/candidate-footer";
import { getSessionUserId } from "@/features/auth/queries/session";
import { ApplyPanel } from "@/features/applications/components/apply-panel";
import { getMatchingCandidate } from "@/features/applications/queries/applications";
import { computeMatchScore } from "@/features/applications/services/match-score";
import { JobDetail } from "@/features/jobs/components/job-detail";
import { getJobDetail } from "@/features/jobs/queries/jobs";
import { parseJobSearch, type JobSearchParams } from "@/features/jobs/schemas/search";
import { buildJobsUrl } from "@/features/jobs/services/job-filters";

export const metadata: Metadata = { title: "Job details | JobSearch" };
export const instant = false;

export default async function JobPage({ params, searchParams }: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<JobSearchParams>;
}) {
  const [{ slug }, rawFilters] = await Promise.all([params, searchParams]);
  const [job, userId] = await Promise.all([getJobDetail(slug), getSessionUserId()]);
  if (!job) notFound();
  const candidate = userId ? await getMatchingCandidate(userId) : null;
  const filters = parseJobSearch(rawFilters);
  return <div className="min-h-dvh"><CandidateHeader current="jobs" signedIn={Boolean(userId)} /><main id="main-content" className="mx-auto max-w-4xl px-5 py-8 sm:px-6 sm:py-10"><Link className="mb-6 inline-flex rounded-full border border-foreground/30 px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" href={buildJobsUrl(filters)}>← Back to jobs</Link><JobDetail job={job} standalone signedIn={Boolean(userId)} matchScore={candidate ? computeMatchScore(candidate, job) : undefined} applyPanel={<ApplyPanel userId={userId} jobId={job.id} jobSlug={job.slug} />} /></main><CandidateFooter signedIn={Boolean(userId)} /></div>;
}
