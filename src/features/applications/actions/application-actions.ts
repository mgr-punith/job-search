"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { runApplyJob, type ApplyResult } from "@/features/applications/actions/application-handlers";
import { createApplication } from "@/features/applications/services/applications";
import { getSessionUserId } from "@/features/auth/queries/session";

export async function applyJobAction(_state: ApplyResult | null, formData: FormData) {
  const result = await runApplyJob(formData, { getUserId: getSessionUserId, apply: createApplication });
  if (result.ok) {
    revalidatePath("/dashboard");
    revalidatePath("/jobs", "layout");
    redirect(`/applications/${result.data.id}`);
  }
  return result;
}
