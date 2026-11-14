import { aiJobSchema, aiRequestSchema, aiSaveSchema, type AiContext, type AiDraft, type AiPreparation, type AiResult, type AiSkill, type AiSuggestion } from "@/features/profile/schemas/profile-ai";
import { checkDeniedSkills, checkProfileClaims, getMissingSkills, ProfileAiError, resolveConfirmedSkills } from "@/features/profile/services/profile-ai";

export type ProfileAiDependencies = {
  getUserId(): Promise<string | null>;
  getContext(userId: string, jobId: string): Promise<AiContext | null>;
  isConfigured(): boolean;
  generate(context: AiContext, skills: AiSkill[]): Promise<AiDraft>;
  save(userId: string, revision: string, draft: AiDraft, skills: AiSkill[]): Promise<void>;
};

function failure(error: unknown): { ok: false; error: string } {
  return { ok: false, error: error instanceof ProfileAiError ? error.message : "We could not complete that request. Please try again." };
}

export async function runPrepareProfileAi(input: unknown, deps: ProfileAiDependencies): Promise<AiResult<AiPreparation>> {
  try {
    const userId = await deps.getUserId();
    if (!userId) return { ok: false, error: "Log in to improve your profile." };
    const parsed = aiJobSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Choose a job to tailor your profile." };
    const context = await deps.getContext(userId, parsed.data.jobId);
    if (!context) return { ok: false, error: "Complete your profile and choose an open job first." };
    return { ok: true, data: { revision: context.revision, jobTitle: context.job.title, missingSkills: getMissingSkills(context), currentHeadline: context.headline, currentBio: context.bio } };
  } catch (error) { return failure(error); }
}

export async function runGenerateProfileAi(input: unknown, deps: ProfileAiDependencies): Promise<AiResult<AiSuggestion>> {
  try {
    const userId = await deps.getUserId();
    if (!userId) return { ok: false, error: "Log in to improve your profile." };
    const parsed = aiRequestSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Confirm each skill before continuing." };
    const context = await deps.getContext(userId, parsed.data.jobId);
    if (!context) return { ok: false, error: "Complete your profile and choose an open job first." };
    if (context.revision !== parsed.data.revision) return { ok: false, error: "Your profile changed. Reopen the dialog to use your latest profile." };
    const confirmed = resolveConfirmedSkills(context, parsed.data.answers);
    if (!deps.isConfigured()) return { ok: false, error: "AI suggestions are unavailable. You can still edit your profile manually." };
    const draft = await deps.generate(context, confirmed.skills);
    checkDeniedSkills(draft, confirmed.learningSkills);
    checkProfileClaims(draft, context);
    return { ok: true, data: { ...draft, ...confirmed } };
  } catch (error) { return failure(error); }
}

export async function runSaveProfileAi(input: unknown, deps: ProfileAiDependencies): Promise<AiResult<{ message: string }>> {
  try {
    const userId = await deps.getUserId();
    if (!userId) return { ok: false, error: "Log in to improve your profile." };
    const parsed = aiSaveSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Check the headline, bio and skill answers before saving." };
    const context = await deps.getContext(userId, parsed.data.jobId);
    if (!context) return { ok: false, error: "Complete your profile and choose an open job first." };
    if (context.revision !== parsed.data.revision) return { ok: false, error: "Your profile changed. Reopen the dialog to use your latest profile." };
    const confirmed = resolveConfirmedSkills(context, parsed.data.answers);
    const draft = { headline: parsed.data.headline, bio: parsed.data.bio };
    checkDeniedSkills(draft, confirmed.learningSkills);
    checkProfileClaims(draft, context);
    await deps.save(userId, parsed.data.revision, draft, confirmed.skills);
    return { ok: true, data: { message: "Profile updated." } };
  } catch (error) { return failure(error); }
}
