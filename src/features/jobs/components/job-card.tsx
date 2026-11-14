import { MapPin, Radio } from "lucide-react";

import { JobCardLink } from "@/features/jobs/components/job-card-link";
import { SHORTLIST_MATCH_SCORE } from "@/features/applications/constants";
import type { JobCardData } from "@/features/jobs/queries/jobs";
import type { JobSearch } from "@/features/jobs/schemas/search";
import { experienceLabels, formatJobDate, formatJobLocation, formatSalary, jobTypeLabels, workplaceLabels } from "@/features/jobs/services/job-display";
import { buildJobsUrl } from "@/features/jobs/services/job-filters";

export function JobCard({ job, filters, selected, matchScore }: { job: JobCardData; filters: JobSearch; selected: boolean; matchScore?: number }) {
  const selectionHref = buildJobsUrl(filters, { job: job.slug });
  return (
    <li>
      <JobCardLink href={`/jobs/${job.slug}${selectionHref.slice("/jobs".length)}`} selectionHref={selectionHref} selected={selected}>
        <div className="flex items-start gap-3">
          <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-secondary font-serif text-xl text-primary">{job.company.name[0]}</span>
          <div className="min-w-0">
            <h3 className="font-serif text-lg leading-6 text-foreground transition-colors group-hover:text-primary">{job.title}</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">{job.company.name}</p>
          </div>
        </div>
        <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="size-3.5 shrink-0" aria-hidden="true" />{formatJobLocation(job)}</p>
        <p className="mt-2 text-sm font-medium">{formatSalary(job)} <span className="text-xs font-normal text-muted-foreground">{job.salaryCurrency} / year</span></p>
        {matchScore !== undefined && matchScore >= SHORTLIST_MATCH_SCORE ? <p className="mt-3 inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">Strong profile match · {matchScore}%</p> : job.isActivelyRecruiting && <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-primary"><Radio className="size-3.5" aria-hidden="true" />Actively recruiting</p>}
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-[#fff0d9] px-2.5 py-1 text-[#714615]">{jobTypeLabels[job.jobType]}</span>
          <span className="rounded-full bg-[#dce3ff] px-2.5 py-1 text-[#294c8c]">{workplaceLabels[job.workplaceType]}</span>
          <span className="rounded-full bg-secondary px-2.5 py-1 text-primary">{experienceLabels[job.experienceLevel]}</span>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Posted <time dateTime={job.publishedAt.toISOString()}>{formatJobDate(job.publishedAt)}</time></p>
      </JobCardLink>
    </li>
  );
}
