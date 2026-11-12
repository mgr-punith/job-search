"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { applyJobAction } from "@/features/applications/actions/application-actions";

export function ApplyForm({ jobId, resumeName }: { jobId: string; resumeName: string }) {
  const [state, action, pending] = useActionState(applyJobAction, null);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="jobId" value={jobId} />
      <p className="text-sm text-muted-foreground">Your application will include <span className="font-medium text-foreground">{resumeName}</span>.</p>
      <div className="flex flex-wrap items-center gap-3"><Button type="submit" size="lg" disabled={pending}>{pending ? "Submitting…" : "Apply now"}</Button><Link href="/profile" className="rounded text-sm text-primary underline underline-offset-4 focus-visible:outline-2">Update resume</Link></div>
      {state && !state.ok && <div role="alert" className="space-y-2 text-sm text-destructive"><p>{state.error}</p>{state.applicationId && <Link className="rounded underline focus-visible:outline-2" href={`/applications/${state.applicationId}`}>View your application</Link>}</div>}
    </form>
  );
}
