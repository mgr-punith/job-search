"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { genUploader } from "uploadthing/client";

import { Button } from "@/components/ui/button";
import { removeResumeAction } from "@/features/profile/actions/profile-actions";
import { RESUME_ACCEPT, normalizeResumeUpload, resumeFileSchema } from "@/features/profile/schemas/resume";
import type { ResumeRouter } from "@/features/profile/services/upload-router";

const { uploadFiles } = genUploader<ResumeRouter>();

export function ResumeCard({ name, url, uploadConfigured }: { name: string | null; url: string | null; uploadConfigured: boolean }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const busy = pending || uploading;

  return (
    <section className="rounded-xl border bg-card p-5 sm:p-6">
      <h2 className="text-lg font-semibold">Resume</h2>
      <p className="mt-1 text-sm text-muted-foreground">PDF, DOC or DOCX. Up to 4 MB.</p>
      <div className="mt-5 rounded-lg border border-dashed bg-muted/30 p-4">
        {url ? <><p className="break-words text-sm font-medium">{name ?? "Your resume"}</p><a className="mt-2 inline-block rounded text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2" href={url} target="_blank" rel="noopener noreferrer">View resume</a></> : <p className="text-sm text-muted-foreground">No resume uploaded yet.</p>}
      </div>
      <form className="mt-5 space-y-3" onSubmit={async (event) => {
        event.preventDefault();
        if (busy) return;
        const file = inputRef.current?.files?.[0];
        if (!file) { setFailed(true); setMessage("Choose a resume first."); return; }
        const validation = resumeFileSchema.safeParse(file);
        if (!validation.success) { setFailed(true); setMessage(validation.error.issues[0]?.message ?? "Check your file."); return; }
        setFailed(false); setMessage(""); setProgress(0); setUploading(true);
        try {
          await uploadFiles("resume", { files: [normalizeResumeUpload(file)], input: {}, onUploadProgress: ({ progress }) => setProgress(progress) });
          setMessage("Resume uploaded.");
          if (inputRef.current) inputRef.current.value = "";
          router.refresh();
        } catch {
          setFailed(true); setMessage("We could not upload your resume. Please try again.");
        } finally { setUploading(false); }
      }}>
        <label htmlFor="resume-file" className="text-sm font-medium">{url ? "Replace resume" : "Choose a resume"}</label>
        <input ref={inputRef} id="resume-file" name="resume" type="file" accept={RESUME_ACCEPT} disabled={busy || !uploadConfigured} className="block w-full min-w-0 rounded-lg border text-sm text-muted-foreground file:mr-3 file:cursor-pointer file:border-0 file:bg-secondary file:px-3 file:py-2 file:font-medium file:text-foreground focus-visible:outline-2 focus-visible:outline-ring" />
        <Button className="w-full" type="submit" disabled={busy || !uploadConfigured}>{uploading ? `Uploading… ${progress}%` : url ? "Upload replacement" : "Upload resume"}</Button>
      </form>
      {url ? <Button type="button" variant="ghost" className="mt-2 w-full" disabled={busy} onClick={() => startTransition(async () => {
        const result = await removeResumeAction();
        setFailed(!result.ok);
        setMessage(result.ok ? result.data.message : result.error);
        if (result.ok) router.refresh();
      })}>{pending ? "Removing…" : "Remove resume"}</Button> : null}
      {!uploadConfigured ? <p className="mt-3 text-sm text-muted-foreground">Resume uploads are temporarily unavailable. You can still save your profile.</p> : null}
      {message ? <p role="status" className={`mt-3 text-sm ${failed ? "text-destructive" : "text-muted-foreground"}`}>{message}</p> : null}
      <p className="mt-4 text-xs leading-5 text-muted-foreground">Replacing or removing your resume does not change files already attached to applications.</p>
    </section>
  );
}
