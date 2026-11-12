import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CandidateHeader } from "@/components/shared/candidate-header";
import { getSessionUserId } from "@/features/auth/queries/session";
import { getLoginUrl } from "@/features/auth/services/auth-routing";
import { ProfileForm } from "@/features/profile/components/profile-form";
import { ResumeCard } from "@/features/profile/components/resume-card";
import { getAvailableSkills, getCandidateProfile } from "@/features/profile/queries/profile";
import { isResumeUploadConfigured } from "@/lib/env";

export const metadata: Metadata = { title: "My profile | JobSearch" };
export const instant = false;

export default async function ProfilePage() {
  const userId = await getSessionUserId();
  if (!userId) redirect(getLoginUrl("/profile"));

  const [candidate, skills] = await Promise.all([getCandidateProfile(userId), getAvailableSkills()]);
  const profile = candidate.profile;

  return (
    <main className="min-h-dvh bg-muted/35">
      <CandidateHeader current="profile" />
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-6 sm:py-10">
        <h1 className="text-3xl font-semibold tracking-tight">My profile</h1>
        <p className="mt-2 text-muted-foreground">Keep your experience, skills and resume ready for your next application.</p>
        <div className="mt-7 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <ProfileForm email={candidate.email} availableSkills={skills} initialValues={{
            name: candidate.name,
            headline: profile?.headline ?? "", phone: profile?.phone ?? "", location: profile?.location ?? "",
            country: profile?.country ?? "", timeZone: profile?.timeZone ?? "",
            yearsExperience: profile?.yearsExperience ?? 0, experienceLevel: profile?.experienceLevel ?? "ENTRY",
            bio: profile?.bio ?? "", skillIds: profile?.skills.map(({ skillId }) => skillId) ?? [],
            preferredMarkets: profile?.preferredMarkets ?? [], preferredWorkplaceTypes: profile?.preferredWorkplaceTypes ?? [],
          }} />
          <aside className="lg:sticky lg:top-6"><ResumeCard name={profile?.resumeName ?? null} url={profile?.resumeUrl ?? null} uploadConfigured={isResumeUploadConfigured()} /></aside>
        </div>
      </div>
    </main>
  );
}
