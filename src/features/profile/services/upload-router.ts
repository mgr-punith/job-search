import { revalidatePath } from "next/cache";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { z } from "zod";

import { getSessionUserId } from "@/features/auth/queries/session";
import { resumeFileSchema } from "@/features/profile/schemas/resume";
import { replaceCandidateResume } from "@/features/profile/services/resume";
import { deleteUnusedUpload } from "@/lib/uploadthing";

const upload = createUploadthing();

export const resumeRouter = {
  resume: upload({ blob: { maxFileSize: "4MB", maxFileCount: 1, minFileCount: 1, contentDisposition: "attachment" } })
    .input(z.object({}).strict())
    .middleware(async ({ req, files }) => {
      const userId = await getSessionUserId(req.headers);
      if (!userId) throw new UploadThingError("Log in to upload a resume.");

      const validation = resumeFileSchema.safeParse(files[0]);
      if (files.length !== 1 || !validation.success) {
        throw new UploadThingError("Choose one PDF, DOC or DOCX file up to 4 MB.");
      }
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const unusedKey = await replaceCandidateResume(metadata.userId, file);
      await deleteUnusedUpload(unusedKey);
      revalidatePath("/profile");
      revalidatePath("/jobs", "layout");
      return { name: file.name };
    }),
} satisfies FileRouter;

export type ResumeRouter = typeof resumeRouter;
