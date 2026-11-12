import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { ApplyForm } from "@/features/applications/components/apply-form";
import { getApplicationContext } from "@/features/applications/queries/applications";
import { getLoginUrl } from "@/features/auth/services/auth-routing";

export async function ApplyPanel({ userId, jobId, jobSlug }: { userId: string | null; jobId: string; jobSlug: string }) {
  if (!userId) return <Link className={buttonVariants({ size: "lg" })} href={getLoginUrl(`/jobs/${jobSlug}`)}>Log in to apply</Link>;
  const context = await getApplicationContext(userId, jobId);
  if (context.applicationId) return <div className="space-y-3"><p className="text-sm font-medium text-emerald-700">You’ve applied to this job.</p><Link className={buttonVariants()} href={`/applications/${context.applicationId}`}>View application</Link></div>;
  if (!context.hasResume) return <div className="space-y-3"><p className="text-sm text-muted-foreground">Add a resume to your profile before applying.</p><Link className={buttonVariants()} href="/profile">Upload resume</Link></div>;
  return <ApplyForm jobId={jobId} resumeName={context.resumeName} />;
}
