import { ArrowRight, BriefcaseBusiness, FileCheck2, UserRound } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CandidateFooter } from "@/components/shared/candidate-footer";
import { CandidateHeader } from "@/components/shared/candidate-header";
import { buttonVariants } from "@/components/ui/button";
import { getSessionUserId } from "@/features/auth/queries/session";
import { cn } from "@/lib/utils";

export const instant = false;

const steps = [
  {
    icon: UserRound,
    number: "01",
    title: "Build your profile",
    description: "Keep your experience, skills, preferences, and resume ready in one candidate profile.",
  },
  {
    icon: BriefcaseBusiness,
    number: "02",
    title: "Find the right work",
    description: "Search realistic openings by role, location, experience, salary, market, and benefits.",
  },
  {
    icon: FileCheck2,
    number: "03",
    title: "Track every step",
    description: "Apply once and follow a clear status timeline without wondering what happened next.",
  },
];

export default async function HomePage() {
  const userId = await getSessionUserId();
  if (userId) redirect("/dashboard");

  return (
    <div className="min-h-dvh">
      <CandidateHeader current="home" signedIn={false} />
      <main id="main-content">
        <section className="relative overflow-hidden bg-[#103f34] text-white">
          <div aria-hidden="true" className="absolute -right-24 -top-28 size-[28rem] rounded-full border-[5rem] border-[#7d91f5]/85 opacity-90" />
          <div aria-hidden="true" className="absolute -bottom-44 right-[16%] size-80 rounded-full border-[3.5rem] border-[#b9f3dc]/20" />
          <div className="relative mx-auto grid min-h-[36rem] max-w-7xl items-center gap-12 px-5 py-16 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1fr)_22rem] lg:px-8">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b9f3dc]">
                Your candidate workspace
              </p>
              <h1 className="mt-5 max-w-3xl font-serif text-5xl leading-[0.98] tracking-[-0.04em] text-balance sm:text-7xl">
                Your next role, without the guesswork.
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-7 text-white/78 sm:text-lg sm:leading-8">
                Find relevant jobs, apply with a complete profile, and follow every application from one clear place.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link className={cn(buttonVariants({ size: "lg" }), "bg-[#00a477] hover:bg-[#12b98b]")} href="/signup">
                  Create your profile <ArrowRight aria-hidden="true" />
                </Link>
                <Link className={cn(buttonVariants({ size: "lg", variant: "outline" }), "border-white/55 text-white hover:border-white hover:bg-white hover:text-foreground")} href="/jobs">
                  Browse jobs
                </Link>
              </div>
            </div>
            <div className="relative hidden aspect-[4/5] lg:block" aria-hidden="true">
              <div className="absolute inset-0 rotate-3 rounded-[2rem] bg-[#7d91f5]" />
              <div className="absolute inset-5 -rotate-2 rounded-[1.6rem] border border-white/40 bg-[#b9f3dc] p-7 text-foreground shadow-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Candidate progress</p>
                <p className="mt-5 font-serif text-3xl leading-tight">From search to interview, all in view.</p>
                <div className="mt-10 space-y-4">
                  {["Profile ready", "Application sent", "Under review"].map((label, index) => (
                    <div className="flex items-center gap-3 rounded-xl border border-foreground/15 bg-white/65 p-3" key={label}>
                      <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">{index + 1}</span>
                      <span className="text-sm font-semibold">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#c8f2e5]">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
            <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
              <h2 className="max-w-xl font-serif text-4xl leading-tight tracking-[-0.03em] text-balance sm:text-5xl">
                Everything you need to make your next move.
              </h2>
              <p className="max-w-xl text-base leading-7 text-foreground/75 lg:justify-self-end">
                JobSearch keeps the assignment’s 3 essential candidate workflows connected and easy to explain.
              </p>
            </div>
            <div className="mt-10 grid overflow-hidden rounded-2xl border border-foreground/15 bg-card md:grid-cols-3">
              {steps.map(({ icon: Icon, number, title, description }, index) => (
                <article className={cn("p-6 sm:p-8", index > 0 && "border-t border-foreground/15 md:border-l md:border-t-0")} key={title}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tabular-nums text-primary">{number}</span>
                    <span className="flex size-11 items-center justify-center rounded-full bg-secondary text-primary">
                      <Icon aria-hidden="true" className="size-5" />
                    </span>
                  </div>
                  <h3 className="mt-10 font-serif text-2xl leading-tight">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f8f7f1]">
          <div className="mx-auto grid max-w-7xl gap-0 px-5 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:px-8">
            <div className="bg-[#dce3ff] p-8 sm:p-12">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#294c8c]">Start with opportunity</p>
              <h2 className="mt-5 max-w-md font-serif text-4xl leading-tight tracking-[-0.03em]">Explore roles before you create an account.</h2>
              <Link className={cn(buttonVariants({ variant: "outline", size: "lg" }), "mt-8")} href="/jobs">Find jobs</Link>
            </div>
            <div className="bg-[#103f34] p-8 text-white sm:p-12">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b9f3dc]">Ready when you are</p>
              <h2 className="mt-5 max-w-md font-serif text-4xl leading-tight tracking-[-0.03em]">Create one profile and keep every application together.</h2>
              <Link className={cn(buttonVariants({ size: "lg" }), "mt-8")} href="/signup">Create account</Link>
            </div>
          </div>
        </section>
      </main>
      <CandidateFooter signedIn={false} />
    </div>
  );
}
