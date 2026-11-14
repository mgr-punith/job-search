import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CandidateFooter } from "@/components/shared/candidate-footer";
import { CandidateHeader } from "@/components/shared/candidate-header";
import { getSessionUserId } from "@/features/auth/queries/session";
import { getLoginUrl } from "@/features/auth/services/auth-routing";
import { ProfileForm } from "@/features/profile/components/profile-form";
import { ResumeCard } from "@/features/profile/components/resume-card";
import { getAvailableSkills, getCandidateProfile } from "@/features/profile/queries/profile";
import { isResumeUploadConfigured } from "@/lib/env";
import { ProfileAiModal } from "@/features/profile/components/profile-ai-modal";
import { getProfileAiJobs } from "@/features/profile/queries/profile-ai";

export const metadata: Metadata = { title: "My profile | JobSearch" };
export const instant = false;

export default async function ProfilePage() {
  const userId = await getSessionUserId();
  if (!userId) redirect(getLoginUrl("/profile"));

  const [candidate, skills, aiJobs] = await Promise.all([getCandidateProfile(userId), getAvailableSkills(), getProfileAiJobs()]);
  const profile = candidate.profile;

  return (
    <div className="min-h-dvh bg-background">
      <CandidateHeader current="profile" />
      <main id="main-content">
        <section className="bg-[#c8f2e5]">
          <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Candidate profile</p>
            <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-tight tracking-[-0.035em] text-balance sm:text-5xl">Show the work only you can do.</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-foreground/70">Keep your experience, skills, preferences, and resume ready for your next application.</p>
          </div>
        </section>
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
          <ProfileForm key={profile?.updatedAt.toISOString()} email={candidate.email} availableSkills={skills} initialValues={{
            name: candidate.name,
            headline: profile?.headline ?? "", phone: profile?.phone ?? "", location: profile?.location ?? "",
            country: profile?.country ?? "", timeZone: profile?.timeZone ?? "",
            yearsExperience: profile?.yearsExperience ?? 0, experienceLevel: profile?.experienceLevel ?? "ENTRY",
            bio: profile?.bio ?? "", skillIds: profile?.skills.map(({ skillId }) => skillId) ?? [],
            preferredMarkets: profile?.preferredMarkets ?? [], preferredWorkplaceTypes: profile?.preferredWorkplaceTypes ?? [],
          }} />
          <aside className="space-y-5 lg:sticky lg:top-24"><section className="rounded-2xl border bg-card p-5"><h2 className="font-serif text-xl">Your next role</h2><p className="mb-4 mt-2 text-sm text-muted-foreground">Tailor your headline and bio to a job using skills you confirm.</p><ProfileAiModal jobs={aiJobs} /></section><ResumeCard name={profile?.resumeName ?? null} url={profile?.resumeUrl ?? null} uploadConfigured={isResumeUploadConfigured()} /></aside>
        </div>
      </div>
      </main>
      <CandidateFooter />
    </div>
  );
}
