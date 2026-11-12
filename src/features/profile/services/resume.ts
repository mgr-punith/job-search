import { uploadedResumeSchema } from "@/features/profile/schemas/resume";
import { db } from "@/lib/db";

const emptyResume = {
  resumeKey: null, resumeUrl: null, resumeName: null, resumeMimeType: null, resumeUploadedAt: null,
};

export async function replaceCandidateResume(userId: string, file: unknown) {
  const resume = uploadedResumeSchema.parse(file);

  return db.$transaction(async (transaction) => {
    const previous = await transaction.candidateProfile.findUnique({ where: { userId }, select: { resumeKey: true } });
    const data = {
      resumeKey: resume.key, resumeUrl: resume.ufsUrl, resumeName: resume.name,
      resumeMimeType: resume.type, resumeUploadedAt: new Date(),
    };

    await transaction.candidateProfile.upsert({
      where: { userId }, create: { userId, ...data }, update: data, select: { id: true },
    });

    if (!previous?.resumeKey || previous.resumeKey === resume.key) return null;
    const usedByApplication = await transaction.application.count({ where: { userId, resumeKey: previous.resumeKey } });
    return usedByApplication ? null : previous.resumeKey;
  });
}

export async function detachCandidateResume(userId: string) {
  return db.$transaction(async (transaction) => {
    const profile = await transaction.candidateProfile.findUnique({ where: { userId }, select: { resumeKey: true } });
    if (!profile?.resumeKey) return null;

    await transaction.candidateProfile.update({ where: { userId }, data: emptyResume, select: { id: true } });
    // Submitted applications keep the resume that was used when applying.
    const usedByApplication = await transaction.application.count({ where: { userId, resumeKey: profile.resumeKey } });
    return usedByApplication ? null : profile.resumeKey;
  });
}
