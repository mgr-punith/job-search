import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import type { JobSearch } from "@/features/jobs/schemas/search";
import { buildJobsUrl, getPageNumbers } from "@/features/jobs/services/job-filters";

export function JobPagination({ filters, totalPages }: { filters: JobSearch; totalPages: number }) {
  if (totalPages <= 1) return null;
  const href = (page: number) => buildJobsUrl(filters, { page, job: "" });
  return (
    <nav aria-label="Job results pages" className="mt-5 flex flex-wrap items-center justify-center gap-1.5">
      {filters.page > 1 && <Link href={href(filters.page - 1)} className={buttonVariants({ variant: "outline", size: "sm" })} aria-label="Previous page">‹</Link>}
      {getPageNumbers(filters.page, totalPages).map((page) => <Link key={page} href={href(page)} aria-label={`Page ${page}`} aria-current={page === filters.page ? "page" : undefined} className={buttonVariants({ variant: page === filters.page ? "default" : "outline", size: "sm" })}>{page}</Link>)}
      {filters.page < totalPages && <Link href={href(filters.page + 1)} className={buttonVariants({ variant: "outline", size: "sm" })} aria-label="Next page">›</Link>}
    </nav>
  );
}
