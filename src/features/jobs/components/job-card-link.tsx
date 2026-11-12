"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useTransition } from "react";

import { cn } from "@/lib/utils";

export function JobCardLink({ href, selectionHref, selected, children }: {
  href: string;
  selectionHref: string;
  selected: boolean;
  children: ReactNode;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  return (
    <Link
      href={href}
      aria-current={selected ? "true" : undefined}
      aria-busy={isPending || undefined}
      className={cn("block rounded-xl border bg-card p-5 transition-colors hover:border-cyan-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary", selected && "lg:border-cyan-700 lg:ring-1 lg:ring-cyan-700", isPending && "opacity-60")}
      onClick={(event) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !window.matchMedia("(min-width: 1024px)").matches) return;
        event.preventDefault();
        startTransition(() => router.push(selectionHref, { scroll: false }));
      }}
    >
      {children}
    </Link>
  );
}
