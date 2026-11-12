"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  runLoginAction,
  runLogoutAction,
  runSignupAction,
  getAuthActionRedirect,
  type AuthActionResult,
} from "@/features/auth/actions/auth-handlers";
import { createAuthDependencies } from "@/features/auth/services/auth-dependencies";

async function getAuthDependencies() {
  const [requestHeaders, cookieStore] = await Promise.all([headers(), cookies()]);

  return createAuthDependencies(requestHeaders, (name, value, options) => {
    cookieStore.set(name, value, options);
  });
}

export async function signupAction(
  _previousState: AuthActionResult | null,
  formData: FormData,
) {
  const result = await runSignupAction(formData, await getAuthDependencies());
  const redirectTo = getAuthActionRedirect(result);

  if (redirectTo) {
    redirect(redirectTo);
  }

  return result;
}

export async function loginAction(
  _previousState: AuthActionResult | null,
  formData: FormData,
) {
  const result = await runLoginAction(formData, await getAuthDependencies());
  const redirectTo = getAuthActionRedirect(result);

  if (redirectTo) {
    redirect(redirectTo);
  }

  return result;
}

export async function logoutAction(
  ...actionArguments: [AuthActionResult | null, FormData]
) {
  void actionArguments;
  const result = await runLogoutAction(await getAuthDependencies());
  const redirectTo = getAuthActionRedirect(result);

  if (redirectTo) {
    redirect(redirectTo);
  }

  return result;
}
