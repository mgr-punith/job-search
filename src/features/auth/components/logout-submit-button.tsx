"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

export function LogoutSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit" variant="outline">
      {pending ? "Logging out…" : "Log out"}
    </Button>
  );
}
