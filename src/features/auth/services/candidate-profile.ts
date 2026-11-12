import { db } from "@/lib/db";

export async function ensureCandidateProfile(userId: string) {
  await db.candidateProfile.upsert({
    where: { userId },
    create: { userId },
    update: {},
    select: { id: true },
  });
}
