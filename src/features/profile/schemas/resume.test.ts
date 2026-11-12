import { describe, expect, it } from "vitest";

import { MAX_RESUME_BYTES, normalizeResumeUpload, resumeFileSchema } from "@/features/profile/schemas/resume";

describe("resumeFileSchema", () => {
  it.each([
    ["resume.pdf", "application/pdf"],
    ["resume.doc", "application/msword"],
    ["resume.DOCX", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  ])("accepts supported resumes", (name, type) => {
    expect(resumeFileSchema.safeParse({ name, type, size: 512 }).success).toBe(true);
  });

  it.each([
    { name: "resume.exe", type: "application/octet-stream", size: 512 },
    { name: "resume.pdf", type: "text/html", size: 512 },
    { name: "resume.pdf", type: "application/pdf", size: 0 },
    { name: "resume.pdf", type: "application/pdf", size: 4 * 1024 * 1024 + 1 },
  ])("rejects unsupported, empty or oversized files", (file) => {
    expect(resumeFileSchema.safeParse(file).success).toBe(false);
  });

  it("accepts a 4 MB file and a browser without MIME metadata", () => {
    expect(resumeFileSchema.parse({ name: "resume.pdf", type: "", size: MAX_RESUME_BYTES }).type).toBe("application/pdf");
  });

  it("supplies the missing MIME type to the uploader without changing file content", async () => {
    const original = new File(["%PDF-1.4 fixture"], "resume.pdf", { lastModified: 100 });
    const upload = normalizeResumeUpload(original);

    expect(upload.type).toBe("application/pdf");
    expect(upload.name).toBe(original.name);
    expect(upload.lastModified).toBe(100);
    expect(await upload.text()).toBe(await original.text());
  });
});
