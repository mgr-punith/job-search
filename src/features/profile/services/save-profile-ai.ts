import type { AiDraft, AiSkill } from "@/features/profile/schemas/profile-ai";
import { db } from "@/lib/db";

export async function saveProfileAiDraft(userId: string, revision: string, draft: AiDraft, skills: AiSkill[]) {
  // The timestamp prevents a draft from replacing newer edits; the nested write is atomic.
  await db.candidateProfile.update({
    where: { userId, updatedAt: new Date(revision) },
    data: {
      headline: draft.headline, bio: draft.bio,
      skills: { deleteMany: {}, create: skills.map(({ id }) => ({ skill: { connect: { id } } })) },
    },
    select: { id: true },
  });
}
