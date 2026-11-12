import { MapPin, Search } from "lucide-react";
import Form from "next/form";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { FilterSelect } from "@/features/jobs/components/filter-select";
import { type JobSearch, salaryRanges } from "@/features/jobs/schemas/search";
import { experienceLabels, jobTypeLabels, marketLabels } from "@/features/jobs/services/job-display";

function optionsFromLabels(labels: Record<string, string>) {
  return Object.entries(labels).map(([value, label]) => ({ value, label }));
}

export function JobSearchForm({ filters, companies, benefits }: {
  filters: JobSearch;
  companies: { slug: string; name: string }[];
  benefits: { slug: string; name: string }[];
}) {
  return (
    <Form action="/jobs" role="search">
      <section className="bg-[#07536a] text-white">
        <div className="mx-auto max-w-6xl px-5 pb-8 pt-10 sm:px-6 sm:pt-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">Your next chapter</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Find a role that fits you.</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-cyan-50/90 sm:text-base">Explore opportunities by skills, location, and what matters to you.</p>
          <div className="mt-7 grid gap-3 rounded-xl bg-card p-3 text-foreground shadow-sm sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:gap-0 sm:p-4">
            <label className="min-w-0 space-y-1.5 px-1 sm:border-r sm:pr-4">
              <span className="text-xs font-medium text-muted-foreground">Job title, company or skill</span>
              <span className="flex items-center gap-2"><Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" /><input name="q" defaultValue={filters.q} maxLength={120} placeholder="Try React or product designer" className="h-9 min-w-0 w-full rounded bg-transparent text-sm outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary" /></span>
            </label>
            <label className="min-w-0 space-y-1.5 px-1 sm:px-4">
              <span className="text-xs font-medium text-muted-foreground">Location or time zone</span>
              <span className="flex items-center gap-2"><MapPin className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" /><input name="location" defaultValue={filters.location} maxLength={120} placeholder="City, country or UTC+05:30" className="h-9 min-w-0 w-full rounded bg-transparent text-sm outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary" /></span>
            </label>
            <div className="flex items-center justify-end gap-3">
              <Link href="/jobs" className="rounded px-3 py-2 text-sm hover:underline focus-visible:outline-2">Clear</Link>
              <Button size="lg" type="submit">Search</Button>
            </div>
          </div>
        </div>
      </section>
      <div className="border-b bg-card">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-5 py-5 sm:grid-cols-3 sm:px-6 lg:grid-cols-6">
          <FilterSelect name="experience" label="Experience level" value={filters.experience} options={optionsFromLabels(experienceLabels)} />
          <FilterSelect name="company" label="Company" value={filters.company} options={companies.map(({ slug, name }) => ({ value: slug, label: name }))} />
          <FilterSelect name="type" label="Job type" value={filters.type} options={optionsFromLabels(jobTypeLabels)} />
          <FilterSelect name="salary" label="Annual salary (USD)" value={filters.salary} options={Object.entries(salaryRanges).map(([value, range]) => ({ value, label: range.label }))} />
          <FilterSelect name="market" label="Market" value={filters.market} options={optionsFromLabels(marketLabels)} />
          <FilterSelect name="benefit" label="Benefits" value={filters.benefit} options={benefits.map(({ slug, name }) => ({ value: slug, label: name }))} />
        </div>
      </div>
    </Form>
  );
}
