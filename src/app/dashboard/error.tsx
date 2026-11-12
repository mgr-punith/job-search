"use client";

import { Button } from "@/components/ui/button";

export default function DashboardError({ reset }: { reset: () => void }) {
  return <main className="mx-auto max-w-xl space-y-4 px-6 py-12"><h1 className="text-2xl font-semibold">We could not load your applications</h1><p className="text-muted-foreground">Please try again.</p><Button onClick={reset}>Try again</Button></main>;
}
