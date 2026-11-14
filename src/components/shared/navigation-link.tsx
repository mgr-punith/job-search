"use client";

import Link, { useLinkStatus } from "next/link";
import type { ComponentProps } from "react";

export function NavigationProgress() {
  return <span className="navigation-progress" role="status"><span className="sr-only">Loading…</span><span aria-hidden="true" className="navigation-progress-bar" /></span>;
}

function LinkProgress() {
  const { pending } = useLinkStatus();
  return pending ? <NavigationProgress /> : null;
}

export function NavigationLink({ children, prefetch = true, ...props }: ComponentProps<typeof Link>) {
  return <Link prefetch={prefetch} {...props}>{children}<LinkProgress /></Link>;
}
