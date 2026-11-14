"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useTransition } from "react";

import { NavigationProgress } from "@/components/shared/navigation-link";
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
      className={cn("group block rounded-xl border border-foreground/10 bg-card p-4 shadow-sm transition-[border-color,box-shadow,opacity] hover:border-primary/55 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary", selected && "lg:border-primary lg:ring-1 lg:ring-primary/35", isPending && "opacity-60")}
      onClick={(event) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !window.matchMedia("(min-width: 1024px)").matches) return;
        event.preventDefault();
        startTransition(() => router.push(selectionHref, { scroll: false }));
      }}
    >
      {children}
      {isPending ? <NavigationProgress /> : null}
    </Link>
  );
}
