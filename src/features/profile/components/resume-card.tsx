"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { removeResumeAction } from "@/features/profile/actions/profile-actions";
import { ResumeUploadForm } from "@/features/profile/components/resume-upload-form";

export function ResumeCard({ name, url, uploadConfigured }: { name: string | null; url: string | null; uploadConfigured: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const busy = pending || uploading;

  return (
    <section className="rounded-2xl border border-foreground/10 bg-card p-5 shadow-[0_12px_40px_rgb(18_61_50/0.06)] sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Application document</p>
      <h2 className="mt-2 font-serif text-2xl">Resume</h2>
      <p className="mt-1 text-sm text-muted-foreground">PDF, DOC or DOCX. Up to 4 MB.</p>
      <div className="mt-5 rounded-xl border border-dashed border-primary/35 bg-secondary/35 p-4">
        {url ? <><p className="break-words text-sm font-medium">{name ?? "Your resume"}</p><a className="mt-2 inline-block rounded text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2" href={url} target="_blank" rel="noopener noreferrer">View resume</a></> : <p className="text-sm text-muted-foreground">No resume uploaded yet.</p>}
      </div>
      <div className="mt-5"><ResumeUploadForm disabled={pending} hasResume={Boolean(url)} onUploadingChange={setUploading} onUploaded={() => { setMessage(""); setFailed(false); }} uploadConfigured={uploadConfigured} /></div>
      {url ? <Button type="button" variant="ghost" className="mt-2 w-full text-destructive hover:bg-red-50 hover:text-destructive" disabled={busy} onClick={() => setRemoveOpen(true)}>{pending ? "Removing…" : "Remove resume"}</Button> : null}
      {message ? <p role="status" className={`mt-3 text-sm ${failed ? "text-destructive" : "text-muted-foreground"}`}>{message}</p> : null}
      <p className="mt-4 text-xs leading-5 text-muted-foreground">Replacing or removing your resume does not change files already attached to applications.</p>
      <Modal
        description="Your profile will no longer have a resume, so you cannot submit new applications until you upload another one. Existing applications keep their submitted file."
        onClose={() => setRemoveOpen(false)}
        open={removeOpen}
        title="Remove this resume?"
      >
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button onClick={() => setRemoveOpen(false)} type="button" variant="ghost">Keep resume</Button>
          <Button
            disabled={pending}
            onClick={() => {
              setRemoveOpen(false);
              startTransition(async () => {
                const result = await removeResumeAction();
                setFailed(!result.ok);
                setMessage(result.ok ? result.data.message : result.error);
                if (result.ok) router.refresh();
              });
            }}
            type="button"
            variant="destructive"
          >
            Remove resume
          </Button>
        </div>
      </Modal>
    </section>
  );
}
