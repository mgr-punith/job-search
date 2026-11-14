"use server";

import { revalidatePath } from "next/cache";

import { getSessionUserId } from "@/features/auth/queries/session";
import { runRemoveResume, runSaveProfile, type ProfileActionResult } from "@/features/profile/actions/profile-handlers";
import { saveCandidateProfile } from "@/features/profile/services/profile";
import { detachCandidateResume } from "@/features/profile/services/resume";
import { deleteUnusedUpload } from "@/lib/uploadthing";

function dependencies() {
  return {
    getUserId: getSessionUserId,
    saveProfile: saveCandidateProfile,
    async removeResume(userId: string) {
      const unusedKey = await detachCandidateResume(userId);
      await deleteUnusedUpload(unusedKey);
    },
  };
}

export async function saveProfileAction(_state: ProfileActionResult | null, formData: FormData) {
  const result = await runSaveProfile(formData, dependencies());
  if (result.ok) {
    revalidatePath("/profile");
    revalidatePath("/dashboard");
    revalidatePath("/jobs", "layout");
  }
  return result;
}

export async function removeResumeAction() {
  const result = await runRemoveResume(dependencies());
  if (result.ok) {
    revalidatePath("/profile");
    revalidatePath("/jobs", "layout");
  }
  return result;
}
