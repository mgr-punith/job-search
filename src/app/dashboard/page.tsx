import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CandidateHeader } from "@/components/shared/candidate-header";
import { getLoginUrl } from "@/features/auth/services/auth-routing";
import { ensureCandidateProfile } from "@/features/auth/services/candidate-profile";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Dashboard | JobSearch",
};

export const instant = false;

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect(getLoginUrl("/dashboard"));
  }

  await ensureCandidateProfile(session.user.id);

  return (
    <main className="min-h-screen bg-muted/35">
      <CandidateHeader current="dashboard" />
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="max-w-3xl space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Candidate dashboard
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">
            Welcome, {session.user.name}
          </h1>
          <p className="text-lg leading-8 text-muted-foreground">
            Your candidate account is ready. This is where you will manage your
            profile and follow your applications.
          </p>
          <div className="flex flex-wrap gap-3"><Link href="/jobs" className="inline-flex rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2">Browse jobs</Link><Link href="/profile" className="inline-flex rounded-lg border bg-card px-5 py-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2">Edit my profile</Link></div>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            ["Profile", "Account created"],
            ["Applications", "No applications yet"],
            ["Jobs", "Explore open roles with search and filters"],
          ].map(([label, value]) => (
            <article className="rounded-xl border bg-card p-5 shadow-sm" key={label}>
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-semibold">{label}</h2>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{value}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
