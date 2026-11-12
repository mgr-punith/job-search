import Link from "next/link";

import { LogoutButton } from "@/features/auth/components/logout-button";

export function CandidateHeader({ current }: { current: "dashboard" | "profile" }) {
  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-6">
        <Link className="text-lg font-semibold tracking-tight" href="/">JobSearch</Link>
        <nav aria-label="Candidate navigation" className="flex items-center gap-4 text-sm sm:gap-6">
          <Link aria-current={current === "dashboard" ? "page" : undefined} className="rounded py-2 text-muted-foreground hover:text-foreground aria-[current=page]:font-semibold aria-[current=page]:text-primary focus-visible:outline-2" href="/dashboard">Dashboard</Link>
          <Link aria-current={current === "profile" ? "page" : undefined} className="rounded py-2 text-muted-foreground hover:text-foreground aria-[current=page]:font-semibold aria-[current=page]:text-primary focus-visible:outline-2" href="/profile">My profile</Link>
          <LogoutButton />
        </nav>
      </div>
    </header>
  );
}
