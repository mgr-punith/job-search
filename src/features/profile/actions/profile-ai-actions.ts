"use server";

import { revalidatePath } from "next/cache";
import { getSessionUserId } from "@/features/auth/queries/session";
import { runGenerateProfileAi, runPrepareProfileAi, runSaveProfileAi, type ProfileAiDependencies } from "@/features/profile/actions/profile-ai-handlers";
import { getProfileAiContext } from "@/features/profile/queries/profile-ai";
import { generateProfileDraft } from "@/features/profile/services/profile-ai";
import { saveProfileAiDraft } from "@/features/profile/services/save-profile-ai";
import { isProfileAiConfigured, parseProfileAiEnvironment } from "@/lib/env";

function dependencies(): ProfileAiDependencies {
  return { getUserId: getSessionUserId, getContext: getProfileAiContext, isConfigured: isProfileAiConfigured,
    generate: (context, skills) => generateProfileDraft(context, skills, parseProfileAiEnvironment(process.env)),
    save: saveProfileAiDraft,
  };
}

export async function prepareProfileAiAction(input: unknown) { return runPrepareProfileAi(input, dependencies()); }
export async function generateProfileAiAction(input: unknown) { return runGenerateProfileAi(input, dependencies()); }
export async function saveProfileAiAction(input: unknown) {
  const result = await runSaveProfileAi(input, dependencies());
  if (result.ok) {
    revalidatePath("/profile");
    revalidatePath("/jobs", "layout");
    revalidatePath("/dashboard");
  }
  return result;
}
