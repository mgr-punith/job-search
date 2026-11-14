"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

export function LogoutSubmitButton({ compact = false }: { compact?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button className={compact ? "w-full justify-start border-0 px-4" : undefined} disabled={pending} type="submit" variant="outline">
      {pending ? "Logging out…" : "Log out"}
    </Button>
  );
}
