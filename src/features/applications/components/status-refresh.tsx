"use client";

import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";

import { Button } from "@/components/ui/button";

export function StatusRefresh({ nextRefreshAt }: { nextRefreshAt: number | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (nextRefreshAt === null) return;
    const timer = window.setTimeout(() => startTransition(() => router.refresh()), Math.max(1000, nextRefreshAt - Date.now() + 500));
    return () => window.clearTimeout(timer);
  }, [nextRefreshAt, router]);

  return <Button size="sm" variant="outline" disabled={pending} onClick={() => startTransition(() => router.refresh())}>{pending ? "Refreshing…" : "Refresh status"}</Button>;
}
