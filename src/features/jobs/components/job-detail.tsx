import { BriefcaseBusiness, Building2, CircleDollarSign, Clock3, MapPin } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { buttonVariants } from "@/components/ui/button";
import type { JobDetailData } from "@/features/jobs/queries/jobs";
import { companySizeLabels, experienceLabels, formatJobDate, formatJobLocation, formatSalary, jobTypeLabels, marketLabels, workplaceLabels } from "@/features/jobs/services/job-display";
import { ProfileAiModal } from "@/features/profile/components/profile-ai-modal";

function DetailSection({ title, items, standalone }: { title: string; items: string[]; standalone: boolean }) {
  if (!items.length) return null;
  const Heading = standalone ? "h2" : "h3";
  return <section className="mt-5"><Heading className="font-serif text-lg">{title}</Heading><ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6 text-muted-foreground marker:text-primary">{items.map((item) => <li key={item}>{item}</li>)}</ul></section>;
}

export function JobDetail({ job, standalone = false, applyPanel, matchScore, signedIn = false }: { job: JobDetailData; standalone?: boolean; applyPanel: ReactNode; matchScore?: number; signedIn?: boolean }) {
  const Heading = standalone ? "h1" : "h2";
  const SectionHeading = standalone ? "h2" : "h3";
  return (
    <article className="rounded-2xl border border-foreground/10 bg-card p-5 shadow-[0_16px_45px_rgb(18_61_50/0.06)] sm:p-6" aria-label={`${job.title} details`}>
      <div className="flex items-start gap-4">
        <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary font-serif text-xl text-primary">{job.company.name[0]}</span>
        <div className="min-w-0">
          <Heading className="font-serif text-2xl leading-tight tracking-[-0.025em] text-balance">{job.title}</Heading>
          <p className="mt-2 font-semibold">{job.company.name}</p>
        </div>
      </div>
      <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-muted-foreground"><MapPin aria-hidden="true" className="mt-1 size-4 shrink-0" />{formatJobLocation(job)} · {workplaceLabels[job.workplaceType]}</p>
      <p className="mt-2 text-xs text-muted-foreground">Posted {formatJobDate(job.publishedAt)} · Updated {formatJobDate(job.updatedAt)}</p>
      <dl className="mt-6 grid gap-3 rounded-xl bg-[#edf8f4] p-4 text-sm sm:grid-cols-2">
        <div className="flex gap-2.5"><dt className="shrink-0"><BriefcaseBusiness aria-hidden="true" className="size-4" /><span className="sr-only">Employment and experience</span></dt><dd>{jobTypeLabels[job.jobType]} · {experienceLabels[job.experienceLevel]}</dd></div>
        <div className="flex gap-2.5"><dt className="shrink-0"><Building2 aria-hidden="true" className="size-4" /><span className="sr-only">Company size and market</span></dt><dd>{companySizeLabels[job.company.size]} · {marketLabels[job.market]}</dd></div>
        <div className="flex gap-2.5"><dt className="shrink-0"><CircleDollarSign aria-hidden="true" className="size-4" /><span className="sr-only">Annual salary</span></dt><dd>{formatSalary(job)} {job.salaryCurrency} / year</dd></div>
        <div className="flex gap-2.5"><dt className="shrink-0"><Clock3 aria-hidden="true" className="size-4" /><span className="sr-only">Time zone</span></dt><dd>{job.timeZone}</dd></div>
      </dl>
      <section className="mt-4"><SectionHeading className="font-serif text-lg">Skills</SectionHeading><ul className="mt-2 flex flex-wrap gap-2">{job.skills.map(({ skill }) => <li key={skill.name} className="rounded-full bg-muted px-3 py-1 text-xs font-medium">{skill.name}</li>)}</ul></section>
      {matchScore !== undefined && <p className="mt-5 inline-flex rounded-full bg-secondary px-3 py-1.5 text-sm text-primary">Your profile match: <strong className="ml-1 tabular-nums">{matchScore}%</strong></p>}
      {signedIn ? <div className="mt-3"><ProfileAiModal key={job.id} jobId={job.id} /></div> : null}
      <div className="mt-4 rounded-xl border border-primary/20 bg-secondary/45 p-4">{applyPanel}</div>
      <section className="mt-8 border-t border-foreground/10 pt-7"><SectionHeading className="font-serif text-xl">About the job</SectionHeading><p className="mt-4 text-sm leading-7 text-muted-foreground">{job.about}</p></section>
      <DetailSection title="Responsibilities" items={job.responsibilities} standalone={standalone} />
      <DetailSection title="Ideal profile" items={job.idealProfile} standalone={standalone} />
      <DetailSection title="What’s on offer" items={job.whatsOnOffer} standalone={standalone} />
      {job.benefits.some(({ benefit }) => !job.whatsOnOffer.includes(benefit.name)) && <section className="mt-5"><SectionHeading className="font-serif text-lg">Benefits</SectionHeading><ul className="mt-3 flex flex-wrap gap-2">{job.benefits.filter(({ benefit }) => !job.whatsOnOffer.includes(benefit.name)).map(({ benefit }) => <li className="rounded-full bg-secondary px-3 py-1 text-xs text-primary" key={benefit.name}>{benefit.name}</li>)}</ul></section>}
      <section className="mt-8 border-t border-foreground/10 pt-7"><SectionHeading className="font-serif text-xl">About {job.company.name}</SectionHeading><p className="mt-4 text-sm leading-7 text-muted-foreground">{job.company.description}</p></section>
      <div className="mt-8 rounded-xl bg-[#dce3ff] p-5"><p className="mb-4 text-sm text-[#294c8c]">Keep your skills and resume ready for your next opportunity.</p><Link href="/profile" className={buttonVariants({ variant: "outline" })}>Manage my profile</Link></div>
    </article>
  );
}
