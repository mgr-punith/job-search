import Link from "next/link";
import type { ReactNode } from "react";

import { SiteBrand } from "@/components/shared/site-brand";

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  alternateText,
  alternateHref,
  alternateLabel,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  alternateText: string;
  alternateHref: string;
  alternateLabel: string;
}) {
  return (
    <main id="main-content" className="grid min-h-svh overflow-x-hidden bg-card lg:h-dvh lg:min-h-0 lg:grid-cols-[minmax(0,1.08fr)_minmax(28rem,0.92fr)]">
      <section className="relative hidden overflow-hidden bg-[#103f34] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div aria-hidden="true" className="absolute -right-40 top-20 size-[32rem] rounded-full border-[5rem] border-[#7d91f5]" />
        <div aria-hidden="true" className="absolute -bottom-24 -left-20 size-72 rounded-full border-[3rem] border-[#b9f3dc]/25" />
        <SiteBrand className="relative z-10" href="/" inverse />
        <div className="max-w-xl space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b9f3dc]">
            Candidate portal
          </p>
          <p className="font-serif text-5xl leading-[1.02] tracking-[-0.04em] text-balance xl:text-6xl">
            Make your next move with clarity.
          </p>
          <p className="max-w-lg text-lg leading-8 text-white/75">
            Build your candidate profile, find relevant roles, and follow every
            application from one focused workspace.
          </p>
        </div>
        <p className="relative z-10 text-sm text-white/60">
          Profile. Search. Apply. Track.
        </p>
      </section>

      <section className="flex items-center justify-center bg-[#f8f7f1] px-5 py-5 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
        <div className="w-full max-w-md">
          <SiteBrand className="mb-8 lg:hidden" href="/" />
          <div className="mb-6 space-y-3 sm:mb-7">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              {eyebrow}
            </p>
            <h1 className="font-serif text-4xl leading-tight tracking-[-0.035em] text-balance sm:text-5xl">
              {title}
            </h1>
            <p className="leading-6 text-pretty text-muted-foreground">{description}</p>
          </div>
          <div className="rounded-2xl border border-foreground/10 bg-card p-5 shadow-[0_18px_50px_rgb(18_61_50/0.08)] sm:p-7">
            {children}
          </div>
          <p className="mt-5 text-center text-sm text-muted-foreground sm:mt-6">
            {alternateText}{" "}
            <Link className="rounded-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2" href={alternateHref}>
              {alternateLabel}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
