import { loginSchema, signupSchema } from "@/features/auth/schemas/auth";
import { getSafeCallbackUrl } from "@/features/auth/services/callback-url";
import { AuthRequestError } from "@/features/auth/services/auth-request-error";

type FieldErrors = Record<string, string[] | undefined>;

export type AuthActionResult =
  | { ok: true; data: { redirectTo: string } }
  | { ok: false; error: string; fieldErrors?: FieldErrors };

export type AuthActionDependencies = {
  signUp(input: {
    name: string;
    email: string;
    password: string;
  }): Promise<{ userId: string }>;
  signIn(input: { email: string; password: string }): Promise<{ userId: string }>;
  ensureCandidateProfile(userId: string): Promise<void>;
  getSession(): Promise<{ userId: string } | null>;
  signOut(): Promise<void>;
};

export function getAuthActionRedirect(result: AuthActionResult) {
  return result.ok ? result.data.redirectTo : null;
}

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export async function runSignupAction(
  formData: FormData,
  dependencies: AuthActionDependencies,
): Promise<AuthActionResult> {
  const validation = signupSchema.safeParse({
    name: stringValue(formData, "name"),
    email: stringValue(formData, "email"),
    password: stringValue(formData, "password"),
    passwordConfirmation: stringValue(formData, "passwordConfirmation"),
  });

  if (!validation.success) {
    return {
      ok: false,
      error: "Check the highlighted fields.",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  let accountCreated = false;

  try {
    const { userId } = await dependencies.signUp({
      name: validation.data.name,
      email: validation.data.email,
      password: validation.data.password,
    });
    accountCreated = true;
    await dependencies.ensureCandidateProfile(userId);

    return {
      ok: true,
      data: {
        redirectTo: getSafeCallbackUrl(stringValue(formData, "callbackUrl")),
      },
    };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof AuthRequestError && error.status === 429
          ? "Too many attempts. Wait a moment and try again."
          : accountCreated
            ? "Your account was created, but profile setup failed. Log in to try again."
            : "We could not create your account. Check your details and try again.",
    };
  }
}

export async function runLoginAction(
  formData: FormData,
  dependencies: AuthActionDependencies,
): Promise<AuthActionResult> {
  const validation = loginSchema.safeParse({
    email: stringValue(formData, "email"),
    password: stringValue(formData, "password"),
  });

  if (!validation.success) {
    return {
      ok: false,
      error: "Check the highlighted fields.",
      fieldErrors: validation.error.flatten().fieldErrors,
    };
  }

  let authenticated = false;

  try {
    const { userId } = await dependencies.signIn(validation.data);
    authenticated = true;
    await dependencies.ensureCandidateProfile(userId);

    return {
      ok: true,
      data: {
        redirectTo: getSafeCallbackUrl(stringValue(formData, "callbackUrl")),
      },
    };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof AuthRequestError && error.status === 429
          ? "Too many attempts. Wait a moment and try again."
          : authenticated
            ? "We could not load your profile. Please try logging in again."
            : "Email or password is incorrect.",
    };
  }
}

export async function runLogoutAction(
  dependencies: AuthActionDependencies,
): Promise<AuthActionResult> {
  try {
    const session = await dependencies.getSession();

    if (session) {
      await dependencies.signOut();
    }

    return { ok: true, data: { redirectTo: "/login" } };
  } catch {
    return {
      ok: false,
      error: "We could not sign you out. Try again.",
    };
  }
}
