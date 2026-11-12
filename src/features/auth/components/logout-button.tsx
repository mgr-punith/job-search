"use client";

import { useActionState } from "react";

import { logoutAction } from "@/features/auth/actions/auth-actions";
import { LogoutSubmitButton } from "@/features/auth/components/logout-submit-button";

export function LogoutButton() {
  const [state, formAction] = useActionState(logoutAction, null);

  return (
    <form action={formAction} className="flex flex-col items-end gap-2">
      <LogoutSubmitButton />
      {state && !state.ok ? (
        <p aria-live="polite" className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
