import type { Metadata } from "next";
import { Suspense } from "react";

import JobsLoading from "@/app/jobs/loading";
import { JobsBrowser } from "@/features/jobs/components/jobs-browser";
import type { JobSearchParams } from "@/features/jobs/schemas/search";

export const metadata: Metadata = { title: "Find jobs | JobSearch", description: "Explore jobs by role, profile match, location, experience, and salary." };
export const instant = false;

export default function JobsPage({ searchParams }: { searchParams: Promise<JobSearchParams> }) {
  // Keep this boundary unkeyed so URL changes retain the current view until results are ready.
  return <Suspense fallback={<JobsLoading />}><JobsBrowser searchParams={searchParams} /></Suspense>;
}
