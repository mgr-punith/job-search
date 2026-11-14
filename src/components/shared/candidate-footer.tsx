import Link from "next/link";

import { SiteBrand } from "@/components/shared/site-brand";

export function CandidateFooter({ signedIn = true }: { signedIn?: boolean }) {
  return (
    <footer className="bg-[#103f34] text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-9 sm:px-6 md:grid-cols-[1fr_auto] md:items-end lg:px-8">
        <div>
          <SiteBrand href={signedIn ? "/dashboard" : "/"} inverse />
          <p className="mt-4 max-w-md text-sm leading-6 text-white/70">
            A focused candidate workspace for discovering roles, applying once,
            and following every step.
          </p>
        </div>
        <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium">
          <Link className="rounded-sm text-white/80 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4" href="/jobs">
            Find jobs
          </Link>
          {signedIn ? (
            <>
              <Link className="rounded-sm text-white/80 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4" href="/dashboard">
                Applications
              </Link>
              <Link className="rounded-sm text-white/80 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4" href="/profile">
                Profile
              </Link>
            </>
          ) : (
            <>
              <Link className="rounded-sm text-white/80 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4" href="/login">
                Log in
              </Link>
              <Link className="rounded-sm text-white/80 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4" href="/signup">
                Create account
              </Link>
            </>
          )}
        </nav>
      </div>
      <div className="border-t border-white/15 px-5 py-4 text-center text-xs text-white/55">
        Candidate portal demo for Jobs Territory.
      </div>
    </footer>
  );
}
