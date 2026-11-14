import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CandidateFooter } from "@/components/shared/candidate-footer";
import { CandidateHeader } from "@/components/shared/candidate-header";
import { ApplicationDashboard } from "@/features/applications/components/application-dashboard";
import { parseApplicationPage } from "@/features/applications/schemas/application";
import { getLoginUrl } from "@/features/auth/services/auth-routing";
import { getSession } from "@/features/auth/queries/session";

export const metadata: Metadata = {
  title: "Dashboard | JobSearch",
};

export const instant = false;

export default async function DashboardPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [session, rawFilters] = await Promise.all([getSession(), searchParams]);

  if (!session) {
    redirect(getLoginUrl("/dashboard"));
  }

  // Signup and login already create the profile; browsing should not repeat that write.
  const page = parseApplicationPage(rawFilters.page);

  return (
    <div className="min-h-dvh bg-background">
      <CandidateHeader current="dashboard" />
      <main id="main-content">
      <section className="bg-[#c8f2e5]">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Candidate dashboard
          </p>
          <h1 className="font-serif text-4xl leading-tight tracking-[-0.035em] text-balance sm:text-5xl">
            Welcome back, {session.user.name}
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-foreground/70">
            Find your next role and follow your applications in one place.
          </p>
          <div className="flex flex-wrap gap-3 pt-1"><Link href="/jobs" className="inline-flex min-h-12 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-[#007d5b] focus-visible:outline-2 focus-visible:outline-offset-2">Browse jobs</Link><Link href="/profile" className="inline-flex min-h-12 items-center rounded-full border border-foreground/40 px-6 text-sm font-semibold hover:bg-card focus-visible:outline-2 focus-visible:outline-offset-2">Edit profile</Link></div>
        </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 pb-14 sm:px-6 lg:px-8">
          <ApplicationDashboard userId={session.user.id} page={page} />
      </section>
      </main>
      <CandidateFooter />
    </div>
  );
}
