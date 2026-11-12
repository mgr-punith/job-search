import type { Metadata } from "next";

import { AuthShell } from "@/features/auth/components/auth-shell";
import { LoginForm } from "@/features/auth/components/login-form";
import { getSafeCallbackUrl } from "@/features/auth/services/callback-url";

export const metadata: Metadata = {
  title: "Log in | JobSearch",
};

export const instant = false;

export default async function LoginPage({
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
      alternateHref={`/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`}
      alternateLabel="Create an account"
      alternateText="New to JobSearch?"
      description="Use your candidate account to manage your profile and applications."
      eyebrow="Welcome back"
      title="Log in to continue"
    >
      <LoginForm callbackUrl={callbackUrl} />
    </AuthShell>
  );
}
