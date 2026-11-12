"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

export function SubmitButton({
  idleLabel,
  pendingLabel,
}: {
  idleLabel: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button className="h-10 w-full" disabled={pending} type="submit">
      {pending ? pendingLabel : idleLabel}
    </Button>
  );
}
