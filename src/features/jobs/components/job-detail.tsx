import { BriefcaseBusiness, Building2, CircleDollarSign, Clock3, MapPin } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { buttonVariants } from "@/components/ui/button";
import type { JobDetailData } from "@/features/jobs/queries/jobs";
import { companySizeLabels, experienceLabels, formatJobDate, formatJobLocation, formatSalary, jobTypeLabels, marketLabels, workplaceLabels } from "@/features/jobs/services/job-display";

function DetailSection({ title, items, standalone }: { title: string; items: string[]; standalone: boolean }) {
  if (!items.length) return null;
  const Heading = standalone ? "h2" : "h3";
  return <section className="mt-7"><Heading className="font-semibold">{title}</Heading><ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">{items.map((item) => <li key={item}>{item}</li>)}</ul></section>;
}

export function JobDetail({ job, standalone = false, applyPanel, matchScore }: { job: JobDetailData; standalone?: boolean; applyPanel: ReactNode; matchScore?: number }) {
  const Heading = standalone ? "h1" : "h2";
  const SectionHeading = standalone ? "h2" : "h3";
  return (
    <article className="rounded-xl border bg-card p-5 sm:p-7" aria-label={`${job.title} details`}>
      <Heading className="text-2xl font-semibold tracking-tight">{job.title}</Heading>
      <p className="mt-2 font-medium">{job.company.name}</p>
      <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-muted-foreground"><MapPin aria-hidden="true" className="mt-1 size-4 shrink-0" />{formatJobLocation(job)} · {workplaceLabels[job.workplaceType]}</p>
      <p className="mt-2 text-xs text-muted-foreground">Posted {formatJobDate(job.publishedAt)} · Updated {formatJobDate(job.updatedAt)}</p>
      <dl className="mt-6 space-y-3 text-sm">
        <div className="flex gap-2.5"><dt className="shrink-0"><BriefcaseBusiness aria-hidden="true" className="size-4" /><span className="sr-only">Employment and experience</span></dt><dd>{jobTypeLabels[job.jobType]} · {experienceLabels[job.experienceLevel]}</dd></div>
        <div className="flex gap-2.5"><dt className="shrink-0"><Building2 aria-hidden="true" className="size-4" /><span className="sr-only">Company size and market</span></dt><dd>{companySizeLabels[job.company.size]} · {marketLabels[job.market]}</dd></div>
        <div className="flex gap-2.5"><dt className="shrink-0"><CircleDollarSign aria-hidden="true" className="size-4" /><span className="sr-only">Annual salary</span></dt><dd>{formatSalary(job)} {job.salaryCurrency} / year</dd></div>
        <div className="flex gap-2.5"><dt className="shrink-0"><Clock3 aria-hidden="true" className="size-4" /><span className="sr-only">Time zone</span></dt><dd>{job.timeZone}</dd></div>
      </dl>
      <section className="mt-6"><SectionHeading className="text-sm font-semibold">Skills</SectionHeading><ul className="mt-2 flex flex-wrap gap-2">{job.skills.map(({ skill }) => <li key={skill.name} className="rounded-md bg-muted px-2.5 py-1 text-xs">{skill.name}</li>)}</ul></section>
      {matchScore !== undefined && <p className="mt-4 text-sm text-muted-foreground">Your profile match: <strong className="text-foreground">{matchScore}%</strong></p>}
      <div className="mt-6">{applyPanel}</div>
      <section className="mt-7 border-t pt-6"><SectionHeading className="font-semibold">About the job</SectionHeading><p className="mt-3 text-sm leading-7 text-muted-foreground">{job.about}</p></section>
      <DetailSection title="Responsibilities" items={job.responsibilities} standalone={standalone} />
      <DetailSection title="Ideal profile" items={job.idealProfile} standalone={standalone} />
      <DetailSection title="What’s on offer" items={job.whatsOnOffer} standalone={standalone} />
      {job.benefits.length > 0 && <section className="mt-7"><SectionHeading className="font-semibold">Benefits</SectionHeading><ul className="mt-3 flex flex-wrap gap-2">{job.benefits.map(({ benefit }) => <li className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs text-emerald-800" key={benefit.name}>{benefit.name}</li>)}</ul></section>}
      <section className="mt-7 border-t pt-6"><SectionHeading className="font-semibold">About {job.company.name}</SectionHeading><p className="mt-3 text-sm leading-7 text-muted-foreground">{job.company.description}</p></section>
      <div className="mt-7 rounded-lg bg-muted/70 p-4"><p className="mb-3 text-sm text-muted-foreground">Keep your skills and resume ready for your next opportunity.</p><Link href="/profile" className={buttonVariants({ variant: "outline" })}>Manage my profile</Link></div>
    </article>
  );
}
