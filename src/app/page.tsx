import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-16">
      <section className="max-w-2xl space-y-5">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          JobSearch
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
          Find your next role with a clear application trail.
        </h1>
        <p className="max-w-xl text-lg leading-8 text-muted-foreground">
          Create your candidate account and use one clear workspace for your
          profile, job search, and application progress.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link className={cn(buttonVariants({ size: "lg" }))} href="/jobs">
            Find jobs
          </Link>
          <Link
            className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
            href="/login"
          >
            Log in
          </Link>
          <Link className={cn(buttonVariants({ size: "lg", variant: "ghost" }))} href="/signup">Create account</Link>
        </div>
      </section>
    </main>
  );
}
