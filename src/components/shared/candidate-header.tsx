import { Menu } from "lucide-react";
import { NavigationLink as Link } from "@/components/shared/navigation-link";

import { SiteBrand } from "@/components/shared/site-brand";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { cn } from "@/lib/utils";

export type CandidateNavCurrent = "home" | "dashboard" | "profile" | "jobs";

export function getCandidateHomeHref(signedIn: boolean) {
  return signedIn ? "/dashboard" : "/";
}

function NavigationLinks({
  current,
  signedIn,
  mobile = false,
}: {
  current: CandidateNavCurrent;
  signedIn: boolean;
  mobile?: boolean;
}) {
  const navClass = cn(
    "rounded-full text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
    mobile ? "block px-4 py-3" : "px-4 py-2",
  );

  return (
    <>
      <Link
        aria-current={current === "jobs" ? "page" : undefined}
        className={cn(navClass, current === "jobs" ? "bg-secondary text-foreground" : "text-foreground/75 hover:bg-muted hover:text-foreground")}
        href="/jobs"
        prefetch={true}
      >
        Find jobs
      </Link>
      {signedIn ? (
        <>
          <Link
            aria-current={current === "dashboard" ? "page" : undefined}
            className={cn(navClass, current === "dashboard" ? "bg-secondary text-foreground" : "text-foreground/75 hover:bg-muted hover:text-foreground")}
            href="/dashboard"
            prefetch={true}
          >
            Applications
          </Link>
          <Link
            aria-current={current === "profile" ? "page" : undefined}
            className={cn(navClass, current === "profile" ? "bg-secondary text-foreground" : "text-foreground/75 hover:bg-muted hover:text-foreground")}
            href="/profile"
            prefetch={true}
          >
            Profile
          </Link>
          <LogoutButton compact={mobile} />
        </>
      ) : (
        <>
          <Link className={cn(navClass, "text-foreground/75 hover:bg-muted hover:text-foreground")} href="/login">
            Log in
          </Link>
          <Link className="inline-flex min-h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#007d5b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary" href="/signup">
            Create account
          </Link>
        </>
      )}
    </>
  );
}

export function CandidateHeader({
  current,
  signedIn = true,
}: {
  current: CandidateNavCurrent;
  signedIn?: boolean;
}) {
  return (
    <>
      <a className="fixed left-4 top-3 z-[60] -translate-y-20 rounded-full bg-white px-4 py-2 text-sm font-semibold text-foreground shadow-lg transition-transform focus:translate-y-0" href="#main-content">
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-foreground/10 bg-card/95 backdrop-blur-md">
        <div className="mx-auto flex min-h-15 max-w-7xl items-center justify-between gap-5 px-5 sm:px-6 lg:px-8">
          <SiteBrand href={getCandidateHomeHref(signedIn)} />
          <nav aria-label="Candidate navigation" className="hidden items-center gap-1 md:flex">
            <NavigationLinks current={current} signedIn={signedIn} />
          </nav>
          <details className="group relative md:hidden">
            <summary className="flex min-h-10 list-none items-center gap-2 rounded-full border border-foreground/30 px-4 text-sm font-semibold marker:content-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
              <Menu aria-hidden="true" className="size-4" />
              Menu
            </summary>
            <nav aria-label="Mobile candidate navigation" className="absolute right-0 top-[calc(100%+0.75rem)] z-50 flex w-64 flex-col gap-1 rounded-2xl border bg-card p-3 shadow-xl">
              <NavigationLinks current={current} mobile signedIn={signedIn} />
            </nav>
          </details>
        </div>
      </header>
    </>
  );
}
