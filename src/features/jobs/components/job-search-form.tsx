"use client";

import { LoaderCircle, MapPin, Search } from "lucide-react";
import Form from "next/form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { NavigationProgress } from "@/components/shared/navigation-link";
import { Button } from "@/components/ui/button";
import { FilterSelect } from "@/features/jobs/components/filter-select";
import { type JobSearch, salaryRanges } from "@/features/jobs/schemas/search";
import { experienceLabels, jobTypeLabels, marketLabels } from "@/features/jobs/services/job-display";
import { preferredRoles } from "@/features/jobs/services/preferred-roles";

function optionsFromLabels(labels: Record<string, string>) {
  return Object.entries(labels).map(([value, label]) => ({ value, label }));
}

export function JobSearchForm({ filters, companies, signedIn }: {
  filters: JobSearch;
  companies: { slug: string; name: string }[];
  signedIn: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Form action="/jobs" role="search" scroll={false} onSubmit={(event) => {
      event.preventDefault();
      const params = new URLSearchParams();
      for (const [name, value] of new FormData(event.currentTarget)) {
        if (typeof value === "string" && value) params.set(name, value);
      }
      startTransition(() => router.push(params.size ? `/jobs?${params}` : "/jobs", { scroll: false }));
    }}>
      {pending ? <NavigationProgress /> : null}
      <section className="relative overflow-hidden bg-[#103f34] text-white">
        <div aria-hidden="true" className="absolute -right-24 -top-32 size-80 rounded-full border-[3rem] border-[#7d91f5]/85" />
        <div aria-hidden="true" className="absolute -bottom-48 right-[20%] size-72 rounded-full border-[3rem] border-[#b9f3dc]/15" />
        <div className="relative mx-auto max-w-7xl px-5 py-6 sm:px-6 sm:py-7 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b9f3dc]">Open opportunities</p>
          <h1 className="mt-2 font-serif text-3xl leading-tight tracking-[-0.035em] text-balance sm:text-4xl">Find work that moves you forward.</h1>
          <p className="mt-2 text-sm leading-6 text-white/75">Find roles that fit your skills, location and next move.</p>
          <div className="mt-4 grid gap-3 rounded-xl bg-card p-3 text-foreground shadow-sm sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:gap-0">
            <label className="min-w-0 space-y-1.5 px-1 sm:border-r sm:border-foreground/15 sm:pr-4">
              <span className="text-xs font-medium text-muted-foreground">Job title, company or skill</span>
              <span className="flex items-center gap-2"><Search className="size-4 shrink-0 text-primary" aria-hidden="true" /><input autoComplete="off" name="q" type="search" defaultValue={filters.q} maxLength={120} placeholder="Try React or product designer…" className="h-10 min-w-0 w-full rounded bg-transparent text-sm outline-offset-2 placeholder:text-muted-foreground/75 focus-visible:outline-2 focus-visible:outline-primary" /></span>
            </label>
            <label className="min-w-0 space-y-1.5 px-1 sm:px-4">
              <span className="text-xs font-medium text-muted-foreground">Location or time zone</span>
              <span className="flex items-center gap-2"><MapPin className="size-4 shrink-0 text-primary" aria-hidden="true" /><input autoComplete="off" name="location" type="search" defaultValue={filters.location} maxLength={120} placeholder="City, country or UTC+05:30…" className="h-10 min-w-0 w-full rounded bg-transparent text-sm outline-offset-2 placeholder:text-muted-foreground/75 focus-visible:outline-2 focus-visible:outline-primary" /></span>
            </label>
            <div className="flex items-center justify-end gap-2 pt-1 sm:pt-0">
              <Link href="/jobs" className="rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2">Clear</Link>
              <Button className="min-w-28" disabled={pending} type="submit">{pending ? <LoaderCircle aria-hidden="true" className="size-4 motion-safe:animate-spin" /> : null}{pending ? "Searching…" : "Search"}</Button>
            </div>
          </div>
        </div>
      </section>
      <div className="border-b border-foreground/10 bg-[#c8f2e5]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-5 py-3 sm:grid-cols-3 sm:px-6 lg:grid-cols-6 lg:px-8">
          <FilterSelect name="experience" label="Experience level" value={filters.experience} options={optionsFromLabels(experienceLabels)} />
          <FilterSelect name="company" label="Company" value={filters.company} options={companies.map(({ slug, name }) => ({ value: slug, label: name }))} />
          <FilterSelect name="type" label="Job type" value={filters.type} options={optionsFromLabels(jobTypeLabels)} />
          <FilterSelect name="salary" label="Annual salary (USD)" value={filters.salary} options={Object.entries(salaryRanges).map(([value, range]) => ({ value, label: range.label }))} />
          <FilterSelect name="market" label="Market" value={filters.market} options={optionsFromLabels(marketLabels)} />
          <FilterSelect name="match" label="Profile match" value={filters.match} options={[
            ...(signedIn ? [{ value: "profile", label: "Matches my profile (70%+)" }] : []),
            ...Object.entries(preferredRoles).map(([value, role]) => ({ value, label: role.label })),
          ]} />
          {filters.benefit ? <input type="hidden" name="benefit" value={filters.benefit} /> : null}
        </div>
      </div>
    </Form>
  );
}
