import Link from "next/link";
import type { ReactNode } from "react";

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
    <main className="grid min-h-svh overflow-x-hidden lg:h-dvh lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_minmax(28rem,0.8fr)]">
      <section className="hidden bg-primary p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <Link className="text-lg font-semibold tracking-tight" href="/">
          JobSearch
        </Link>
        <div className="max-w-xl space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-foreground/75">
            Candidate portal
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-balance xl:text-5xl">
            A clear path from discovery to application.
          </h2>
          <p className="text-lg leading-8 text-primary-foreground/80">
            Build your candidate profile, find relevant roles, and follow every
            application from one focused workspace.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/70">
          Built for the Jobs Territory technical assignment.
        </p>
      </section>

      <section className="flex items-center justify-center px-5 py-3 sm:px-8 sm:py-6 lg:px-10 lg:py-8">
        <div className="w-full max-w-md">
          <Link className="mb-3 inline-block font-semibold sm:mb-5 lg:hidden" href="/">
            JobSearch
          </Link>
          <div className="mb-3 space-y-2 sm:mb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              {eyebrow}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {title}
            </h1>
            <p className="leading-6 text-pretty text-muted-foreground">{description}</p>
          </div>
          {children}
          <p className="mt-3 text-center text-sm text-muted-foreground sm:mt-5">
            {alternateText}{" "}
            <Link className="font-semibold text-primary hover:underline" href={alternateHref}>
              {alternateLabel}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
