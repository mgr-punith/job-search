"use client";

import { useActionState } from "react";

import { loginAction } from "@/features/auth/actions/auth-actions";
import { FormMessage, TextField, useAuthErrorFocus } from "@/features/auth/components/form-fields";
import { SubmitButton } from "@/features/auth/components/submit-button";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, formAction] = useActionState(loginAction, null);
  const formRef = useAuthErrorFocus(state);

  const emailError = state && !state.ok ? state.fieldErrors?.email?.[0] : undefined;
  const passwordError =
    state && !state.ok ? state.fieldErrors?.password?.[0] : undefined;

  return (
    <form ref={formRef} action={formAction} className="space-y-3 sm:space-y-4">
      <input name="callbackUrl" type="hidden" value={callbackUrl} />
      <TextField
        autoComplete="email"
        defaultValue={state && !state.ok ? state.values?.email : undefined}
        error={emailError}
        id="login-email"
        label="Email"
        name="email"
        type="email"
      />
      <TextField
        autoComplete="current-password"
        error={passwordError}
        id="login-password"
        label="Password"
        name="password"
        type="password"
      />
      {state && !state.ok ? <FormMessage>{state.error}</FormMessage> : null}
      <SubmitButton idleLabel="Log in" pendingLabel="Logging in…" />
    </form>
  );
}
