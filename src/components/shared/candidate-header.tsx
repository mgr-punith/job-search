import Link from "next/link";

import { LogoutButton } from "@/features/auth/components/logout-button";
import { cn } from "@/lib/utils";

export function CandidateHeader({ current, signedIn = true }: { current: "dashboard" | "profile" | "jobs"; signedIn?: boolean }) {
  const navClass = "rounded py-2 opacity-80 hover:opacity-100 aria-[current=page]:font-semibold aria-[current=page]:opacity-100 focus-visible:outline-2";
  return (
    <header className={cn("border-b bg-card", current === "jobs" && "border-white/15 bg-[#07536a] text-white")}>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-6">
        <Link className="text-lg font-semibold tracking-tight" href="/">JobSearch</Link>
        <nav aria-label="Candidate navigation" className="flex flex-wrap items-center gap-4 text-sm sm:gap-6">
          <Link aria-current={current === "jobs" ? "page" : undefined} className={navClass} href="/jobs">Find jobs</Link>
          {signedIn ? <>
            <Link aria-current={current === "dashboard" ? "page" : undefined} className={navClass} href="/dashboard">Dashboard</Link>
            <Link aria-current={current === "profile" ? "page" : undefined} className={navClass} href="/profile">My profile</Link>
            <div className="text-foreground"><LogoutButton /></div>
          </> : <><Link className={navClass} href="/login">Log in</Link><Link className="rounded-lg bg-white px-3 py-2 font-medium text-[#07536a] focus-visible:outline-2 focus-visible:outline-offset-2" href="/signup">Create account</Link></>}
        </nav>
      </div>
    </header>
  );
}
