"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ResumeUploadForm } from "@/features/profile/components/resume-upload-form";

export function ResumeUploadModal({
  resumeName,
  uploadConfigured,
}: {
  resumeName?: string;
  uploadConfigured: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savedName, setSavedName] = useState("");

  return (
    <>
      <Button className={resumeName ? "h-auto p-0 font-semibold underline underline-offset-4" : undefined} onClick={() => {
        setSavedName("");
        setOpen(true);
      }} type="button" variant={resumeName ? "link" : "default"}>
        {resumeName ? "Update resume" : "Upload resume"}
      </Button>
      <Modal
        description="Upload a PDF, DOC or DOCX up to 4 MB. This saves to your profile and will be used for your next application."
        onClose={() => { if (!uploading) setOpen(false); }}
        open={open}
        title={savedName ? "Resume updated" : resumeName ? "Update your resume" : "Upload your resume"}
      >
        {savedName ? <div className="space-y-5">
          <p role="status" className="break-words rounded-xl bg-secondary p-4 text-sm"><strong>{savedName}</strong> is saved to your profile and ready to use.</p>
          <Button className="w-full" onClick={() => setOpen(false)} type="button">Done</Button>
        </div> : <div className="space-y-5">
          {resumeName ? <p className="break-words rounded-xl bg-secondary/40 p-4 text-sm text-muted-foreground">Current resume: <span className="font-semibold text-foreground">{resumeName}</span></p> : null}
          {open ? <ResumeUploadForm
            confirmReplacement={false}
            hasResume={Boolean(resumeName)}
            onUploaded={setSavedName}
            onUploadingChange={setUploading}
            uploadConfigured={uploadConfigured}
          /> : null}
          <p className="text-xs leading-5 text-muted-foreground">Applications already submitted keep their original resume.</p>
        </div>}
      </Modal>
    </>
  );
}
