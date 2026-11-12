import { z } from "zod";

export const MAX_RESUME_BYTES = 4 * 1024 * 1024;
export const RESUME_ACCEPT = ".pdf,.doc,.docx";

const mimeTypes: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

function expectedMimeType(name: string) {
  return mimeTypes[name.split(".").at(-1)?.toLowerCase() ?? ""];
}

const metadataSchema = z.object({
  name: z.string().min(1).max(255),
  size: z.number().int().positive("Choose a non-empty file").max(MAX_RESUME_BYTES, "Resume must be 4 MB or smaller"),
  type: z.string(),
}).superRefine((file, context) => {
  const expectedType = expectedMimeType(file.name);
  if (!expectedType || (file.type && file.type !== "application/octet-stream" && file.type !== expectedType)) {
    context.addIssue({ code: "custom", message: "Choose a PDF, DOC or DOCX resume", path: ["name"] });
  }
});

export const resumeFileSchema = metadataSchema.transform((file) => ({
  ...file,
  type: expectedMimeType(file.name) ?? file.type,
}));

export function normalizeResumeUpload(file: File) {
  const metadata = resumeFileSchema.parse(file);
  return file.type === metadata.type
    ? file
    : new File([file], file.name, { type: metadata.type, lastModified: file.lastModified });
}

export const uploadedResumeSchema = metadataSchema.safeExtend({
  key: z.string().min(1).max(255),
  ufsUrl: z.url().refine((value) => {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(".ufs.sh") && url.pathname.startsWith("/f/");
  }, "Invalid uploaded file URL"),
}).transform((file) => ({ ...file, type: expectedMimeType(file.name) ?? file.type }));

export type UploadedResume = z.infer<typeof uploadedResumeSchema>;
