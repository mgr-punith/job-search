import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CandidateHeader } from "@/components/shared/candidate-header";
import { ApplicationDashboard } from "@/features/applications/components/application-dashboard";
import { parseApplicationPage } from "@/features/applications/schemas/application";
import { getLoginUrl } from "@/features/auth/services/auth-routing";
import { ensureCandidateProfile } from "@/features/auth/services/candidate-profile";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Dashboard | JobSearch",
};

export const instant = false;

export default async function DashboardPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect(getLoginUrl("/dashboard"));
  }

  await ensureCandidateProfile(session.user.id);
  const page = parseApplicationPage((await searchParams).page);

  return (
    <main className="min-h-screen bg-muted/35">
      <CandidateHeader current="dashboard" />
      <section className="mx-auto max-w-6xl px-5 py-9 sm:px-6">
        <div className="max-w-3xl space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Candidate dashboard
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">
            Welcome, {session.user.name}
          </h1>
          <p className="text-lg leading-8 text-muted-foreground">
            Find your next role and follow your applications in one place.
          </p>
          <div className="flex flex-wrap gap-3"><Link href="/jobs" className="inline-flex rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2">Browse jobs</Link><Link href="/profile" className="inline-flex rounded-lg border bg-card px-5 py-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2">Edit my profile</Link></div>
        </div>
        <ApplicationDashboard userId={session.user.id} page={page} />
      </section>
    </main>
  );
}
