"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { applyJobAction } from "@/features/applications/actions/application-actions";
import { ResumeUploadModal } from "@/features/profile/components/resume-upload-modal";

export function ApplyForm({ jobId, resumeName, uploadConfigured }: { jobId: string; resumeName: string; uploadConfigured: boolean }) {
  const [state, action, pending] = useActionState(applyJobAction, null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const confirmedRef = useRef(false);

  return (
    <>
      <p className="mb-3 text-sm text-muted-foreground">Your application will include <span className="font-semibold text-foreground">{resumeName}</span>.</p>
      <div className="flex flex-wrap items-center gap-3">
      <form
        action={action}
        className="space-y-3"
        onSubmit={(event) => {
          if (confirmedRef.current) {
            confirmedRef.current = false;
            return;
          }
          event.preventDefault();
          setConfirmOpen(true);
        }}
        ref={formRef}
      >
        <input type="hidden" name="jobId" value={jobId} />
        <Button type="submit" size="lg" disabled={pending}>{pending ? "Submitting…" : "Apply now"}</Button>
      </form>
      <ResumeUploadModal resumeName={resumeName} uploadConfigured={uploadConfigured} />
      </div>
      {state && !state.ok && <div role="alert" className="mt-3 space-y-2 text-sm text-destructive"><p>{state.error}</p>{state.applicationId && <Link className="rounded underline focus-visible:outline-2" href={`/applications/${state.applicationId}`}>View your application</Link>}</div>}
      <Modal
        description={`We’ll attach ${resumeName} and create one application for this role. Your submitted resume and match score will stay unchanged if you edit your profile later.`}
        onClose={() => setConfirmOpen(false)}
        open={confirmOpen}
        title="Submit your application?"
      >
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button onClick={() => setConfirmOpen(false)} type="button" variant="ghost">Keep reviewing</Button>
          <Button
            onClick={() => {
              confirmedRef.current = true;
              setConfirmOpen(false);
              formRef.current?.requestSubmit();
            }}
            type="button"
          >
            Submit application
          </Button>
        </div>
      </Modal>
    </>
  );
}
