import { DEFAULT_STATUS_DELAY_SECONDS, STATUS_RANK } from "@/features/applications/constants";
import { applicationSelect, matchingCandidateSelect } from "@/features/applications/queries/selects";
import { ApplicationError } from "@/features/applications/services/application-error";
import { computeMatchScore } from "@/features/applications/services/match-score";
import { deriveStatus } from "@/features/applications/services/status-engine";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";

export async function createApplication(userId: string, jobId: string, now = new Date()) {
  try {
    return await db.$transaction(async (transaction) => {
      const existing = await transaction.application.findUnique({ where: { userId_jobId: { userId, jobId } }, select: { id: true } });
      if (existing) throw new ApplicationError("ALREADY_APPLIED", existing.id);

      const job = await transaction.job.findUnique({ where: { id: jobId, isActive: true }, select: {
        id: true, experienceLevel: true, country: true, location: true, market: true, workplaceType: true,
        skills: { select: { skillId: true }, take: 50, orderBy: { skillId: "asc" } },
      } });
      if (!job) throw new ApplicationError("JOB_CLOSED");

      // Lock this profile against resume replacement/removal until the snapshot is stored.
      const locked = await transaction.candidateProfile.updateMany({ where: { userId }, data: { updatedAt: now } });
      if (!locked.count) throw new ApplicationError("RESUME_REQUIRED");
      const profile = await transaction.candidateProfile.findUnique({ where: { userId }, select: {
        ...matchingCandidateSelect, resumeUrl: true, resumeKey: true, resumeName: true,
      } });
      if (!profile?.resumeKey || !profile.resumeUrl) throw new ApplicationError("RESUME_REQUIRED");

      return transaction.application.create({ data: {
        userId, jobId, resumeUrl: profile.resumeUrl, resumeKey: profile.resumeKey, resumeName: profile.resumeName,
        matchScore: computeMatchScore(profile, job), appliedAt: now,
        events: { create: { status: "APPLIED", occurredAt: now } },
      }, select: { id: true } });
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const existing = await db.application.findUnique({ where: { userId_jobId: { userId, jobId } }, select: { id: true } });
      if (existing) throw new ApplicationError("ALREADY_APPLIED", existing.id);
    }
    throw error;
  }
}

export async function refreshApplication(userId: string, applicationId: string, now = new Date(), delaySeconds = DEFAULT_STATUS_DELAY_SECONDS) {
  return db.$transaction(async (transaction) => {
    const application = await transaction.application.findUnique({
      where: { id: applicationId, userId }, select: { id: true, status: true, matchScore: true, appliedAt: true },
    });
    if (!application) return null;
    const derived = deriveStatus(application, now, delaySeconds);

    if (STATUS_RANK[derived.status] > STATUS_RANK[application.status]) {
      // PostgreSQL rechecks this predicate after concurrent writes: accept any earlier stage,
      // while preventing an older request from overwriting a newer stage.
      const changed = await transaction.application.updateMany({
        where: { id: applicationId, userId, status: { in: derived.events.filter((event) => STATUS_RANK[event.status] < STATUS_RANK[derived.status]).map(({ status }) => status) } },
        data: { status: derived.status, interviewAt: derived.interviewAt, updatedAt: now },
      });
      if (changed.count) {
        await transaction.applicationStatusEvent.createMany({
          data: derived.events.map((event) => ({ ...event, applicationId })), skipDuplicates: true,
        });
      }
    }
    return transaction.application.findUnique({ where: { id: applicationId, userId }, select: applicationSelect });
  });
}
