import { APPLICATIONS_PER_PAGE, DEFAULT_STATUS_DELAY_SECONDS } from "@/features/applications/constants";
import { matchingCandidateSelect } from "@/features/applications/queries/selects";
import { refreshApplication } from "@/features/applications/services/applications";
import { db } from "@/lib/db";

export async function getMatchingCandidate(userId: string) {
  return db.candidateProfile.findUnique({ where: { userId }, select: matchingCandidateSelect });
}

export async function getApplicationContext(userId: string, jobId: string) {
  const [profile, application] = await Promise.all([
    db.candidateProfile.findUnique({ where: { userId }, select: { resumeName: true, resumeUrl: true, resumeKey: true } }),
    db.application.findUnique({ where: { userId_jobId: { userId, jobId } }, select: { id: true } }),
  ]);
  return { hasResume: Boolean(profile?.resumeKey && profile.resumeUrl), resumeName: profile?.resumeName ?? "Resume", applicationId: application?.id ?? null };
}

export async function getCandidateApplications(userId: string, requestedPage: number, now = new Date(), delaySeconds = DEFAULT_STATUS_DELAY_SECONDS) {
  const total = await db.application.count({ where: { userId } });
  const totalPages = Math.max(1, Math.ceil(total / APPLICATIONS_PER_PAGE));
  const page = Math.min(Math.max(1, requestedPage), totalPages);
  const selected = await db.application.findMany({
    where: { userId }, select: { id: true },
    orderBy: [{ appliedAt: "desc" }, { id: "asc" }], skip: (page - 1) * APPLICATIONS_PER_PAGE, take: APPLICATIONS_PER_PAGE,
  });
  const refreshed = await Promise.all(selected.map(({ id }) => refreshApplication(userId, id, now, delaySeconds)));
  return { applications: refreshed.filter((application) => application !== null), total, totalPages, page };
}
