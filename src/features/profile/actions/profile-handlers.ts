import { profileSchema, type ProfileInput } from "@/features/profile/schemas/profile";

export type ProfileActionResult =
  | { ok: true; data: { message: string } }
  | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> };

export type ProfileActionDependencies = {
  getUserId(): Promise<string | null>;
  saveProfile(userId: string, input: ProfileInput): Promise<void>;
  removeResume(userId: string): Promise<void>;
};

export async function runSaveProfile(
  formData: FormData,
  dependencies: ProfileActionDependencies,
): Promise<ProfileActionResult> {
  try {
    const userId = await dependencies.getUserId();
    if (!userId) return { ok: false, error: "Log in to manage your profile." };

    const validation = profileSchema.safeParse({
      ...Object.fromEntries(formData),
      skillIds: formData.getAll("skillIds"),
      preferredMarkets: formData.getAll("preferredMarkets"),
      preferredWorkplaceTypes: formData.getAll("preferredWorkplaceTypes"),
    });

    if (!validation.success) {
      return { ok: false, error: "Check the highlighted fields.", fieldErrors: validation.error.flatten().fieldErrors };
    }

    await dependencies.saveProfile(userId, validation.data);
    return { ok: true, data: { message: "Profile saved." } };
  } catch {
    return { ok: false, error: "We could not save your profile. Please try again." };
  }
}

export async function runRemoveResume(dependencies: ProfileActionDependencies): Promise<ProfileActionResult> {
  try {
    const userId = await dependencies.getUserId();
    if (!userId) return { ok: false, error: "Log in to manage your profile." };

    await dependencies.removeResume(userId);
    return { ok: true, data: { message: "Resume removed from your profile." } };
  } catch {
    return { ok: false, error: "We could not remove your resume. Please try again." };
  }
}
