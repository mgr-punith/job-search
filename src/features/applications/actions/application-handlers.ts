import { applySchema } from "@/features/applications/schemas/application";
import { ApplicationError, type ApplicationErrorCode } from "@/features/applications/services/application-error";

export type ApplyResult =
  | { ok: true; data: { id: string } }
  | { ok: false; error: string; code?: ApplicationErrorCode; applicationId?: string; fieldErrors?: Record<string, string[] | undefined> };

export type ApplyDependencies = {
  getUserId(): Promise<string | null>;
  apply(userId: string, jobId: string): Promise<{ id: string }>;
};

export async function runApplyJob(formData: FormData, dependencies: ApplyDependencies): Promise<ApplyResult> {
  try {
    const userId = await dependencies.getUserId();
    if (!userId) return { ok: false, error: "Log in to apply to this job." };
    const input = applySchema.safeParse(Object.fromEntries(formData));
    if (!input.success) return { ok: false, error: "Choose a valid job.", fieldErrors: input.error.flatten().fieldErrors };
    return { ok: true, data: await dependencies.apply(userId, input.data.jobId) };
  } catch (error) {
    if (error instanceof ApplicationError) return { ok: false, error: error.message, code: error.code, applicationId: error.applicationId };
    return { ok: false, error: "We could not submit your application. Please try again." };
  }
}
