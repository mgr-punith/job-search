"use client";

import { useActionState } from "react";

import { signupAction } from "@/features/auth/actions/auth-actions";
import { FormMessage, TextField, useAuthErrorFocus } from "@/features/auth/components/form-fields";
import { SubmitButton } from "@/features/auth/components/submit-button";

export function SignupForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, formAction] = useActionState(signupAction, null);
  const formRef = useAuthErrorFocus(state);
  const values = state && !state.ok ? state.values : undefined;

  const fieldError = (field: string) =>
    state && !state.ok ? state.fieldErrors?.[field]?.[0] : undefined;

  return (
    <form ref={formRef} action={formAction} className="space-y-3 sm:space-y-4">
      <input name="callbackUrl" type="hidden" value={callbackUrl} />
      <TextField
        autoComplete="name"
        defaultValue={values?.name}
        error={fieldError("name")}
        id="signup-name"
        label="Full name"
        name="name"
      />
      <TextField
        autoComplete="email"
        defaultValue={values?.email}
        error={fieldError("email")}
        id="signup-email"
        label="Email"
        name="email"
        type="email"
      />
      <TextField
        autoComplete="new-password"
        error={fieldError("password")}
        id="signup-password"
        label="Password"
        name="password"
        type="password"
      />
      <TextField
        autoComplete="new-password"
        error={fieldError("passwordConfirmation")}
        id="signup-password-confirmation"
        label="Confirm password"
        name="passwordConfirmation"
        type="password"
      />
      {state && !state.ok ? <FormMessage>{state.error}</FormMessage> : null}
      <SubmitButton idleLabel="Create account" pendingLabel="Creating account…" />
    </form>
  );
}
