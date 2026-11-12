import type { Metadata } from "next";

import { AuthShell } from "@/features/auth/components/auth-shell";
import { SignupForm } from "@/features/auth/components/signup-form";
import { getSafeCallbackUrl } from "@/features/auth/services/callback-url";

export const metadata: Metadata = {
  title: "Create account | JobSearch",
};

export const instant = false;

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string | string[] }>;
}) {
  const parameters = await searchParams;
  const callbackValue = Array.isArray(parameters.callbackUrl)
    ? parameters.callbackUrl[0]
    : parameters.callbackUrl;
  const callbackUrl = getSafeCallbackUrl(callbackValue);

  return (
    <AuthShell
      alternateHref={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
      alternateLabel="Log in"
      alternateText="Already have an account?"
      description="Create your candidate account. You can complete your profile in the next step."
      eyebrow="Start your search"
      title="Create a candidate account"
    >
      <SignupForm callbackUrl={callbackUrl} />
    </AuthShell>
  );
}
