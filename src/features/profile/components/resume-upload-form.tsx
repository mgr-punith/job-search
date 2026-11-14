"use client";

import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import { genUploader } from "uploadthing/client";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { RESUME_ACCEPT, normalizeResumeUpload, resumeFileSchema } from "@/features/profile/schemas/resume";
import type { ResumeRouter } from "@/features/profile/services/upload-router";

const { uploadFiles } = genUploader<ResumeRouter>();

export function ResumeUploadForm({
  hasResume,
  uploadConfigured,
  disabled = false,
  confirmReplacement = true,
  onUploaded,
  onUploadingChange,
}: {
  hasResume: boolean;
  uploadConfigured: boolean;
  disabled?: boolean;
  confirmReplacement?: boolean;
  onUploaded?(name: string): void;
  onUploadingChange?(uploading: boolean): void;
}) {
  const router = useRouter();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const replacementConfirmedRef = useRef(false);
  const uploadingRef = useRef(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const [replacementOpen, setReplacementOpen] = useState(false);

  return (
    <>
      <form ref={formRef} className="space-y-3" onSubmit={async (event) => {
        event.preventDefault();
        if (disabled || !uploadConfigured || uploadingRef.current) return;
        const file = inputRef.current?.files?.[0];
        if (!file) { setFailed(true); setMessage("Choose a resume first."); inputRef.current?.focus(); return; }
        const validation = resumeFileSchema.safeParse(file);
        if (!validation.success) { setFailed(true); setMessage(validation.error.issues[0]?.message ?? "Check your file."); inputRef.current?.focus(); return; }
        if (hasResume && confirmReplacement && !replacementConfirmedRef.current) {
          setReplacementOpen(true);
          return;
        }
        replacementConfirmedRef.current = false;
        uploadingRef.current = true;
        setFailed(false); setMessage(""); setProgress(0); setUploading(true);
        onUploadingChange?.(true);
        try {
          const [uploaded] = await uploadFiles("resume", {
            files: [normalizeResumeUpload(file)],
            input: {},
            onUploadProgress: ({ progress }) => setProgress(progress),
          });
          if (!uploaded?.serverData?.name) throw new Error("Resume was not saved.");
          setMessage("Resume saved to your profile.");
          if (inputRef.current) inputRef.current.value = "";
          router.refresh();
          onUploaded?.(uploaded.serverData.name);
        } catch {
          setFailed(true); setMessage("We could not upload your resume. Please try again.");
        } finally {
          uploadingRef.current = false;
          setUploading(false);
          onUploadingChange?.(false);
        }
      }}>
        <label htmlFor={inputId} className="text-sm font-medium">{hasResume ? "Choose a replacement resume" : "Choose a resume"}</label>
        <input ref={inputRef} id={inputId} name="resume" type="file" accept={RESUME_ACCEPT} aria-describedby={message ? `${inputId}-message` : undefined} aria-invalid={failed || undefined} disabled={disabled || uploading || !uploadConfigured} className="block w-full min-w-0 rounded-xl border bg-white text-sm text-muted-foreground file:mr-3 file:cursor-pointer file:border-0 file:bg-secondary file:px-3 file:py-2.5 file:font-semibold file:text-foreground focus-visible:outline-2 focus-visible:outline-ring" />
        <Button className="w-full" type="submit" disabled={disabled || uploading || !uploadConfigured}>{uploading ? progress === 100 ? "Saving resume…" : `Uploading… ${progress}%` : hasResume ? "Upload replacement" : "Upload resume"}</Button>
        {!uploadConfigured ? <p className="text-sm text-muted-foreground">Resume uploads are temporarily unavailable. Please try again later.</p> : null}
        {message ? <p id={`${inputId}-message`} role="status" className={`text-sm ${failed ? "text-destructive" : "text-primary"}`}>{message}</p> : null}
      </form>
      {confirmReplacement ? <Modal
        description="This replaces the resume on your profile. Applications you already submitted will keep their original file."
        onClose={() => setReplacementOpen(false)}
        open={replacementOpen}
        title="Replace your current resume?"
      >
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button onClick={() => setReplacementOpen(false)} type="button" variant="ghost">Cancel</Button>
          <Button onClick={() => {
            replacementConfirmedRef.current = true;
            setReplacementOpen(false);
            formRef.current?.requestSubmit();
          }} type="button">Replace resume</Button>
        </div>
      </Modal> : null}
    </>
  );
}
