import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ userId: vi.fn(), replace: vi.fn(), cleanup: vi.fn(), revalidate: vi.fn() }));
vi.mock("@/features/auth/queries/session", () => ({ getSessionUserId: mocks.userId }));
vi.mock("@/features/profile/services/resume", () => ({ replaceCandidateResume: mocks.replace }));
vi.mock("@/lib/uploadthing", () => ({ deleteUnusedUpload: mocks.cleanup }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));

import { resumeRouter } from "@/features/profile/services/upload-router";

const req = new NextRequest("http://localhost:3000/api/uploadthing");
const file = { name: "resume.pdf", type: "application/pdf", size: 256 };

beforeEach(() => {
  vi.resetAllMocks();
  mocks.userId.mockResolvedValue("candidate-1");
  mocks.replace.mockResolvedValue("old-key");
});

describe("UploadThing resume route", () => {
  it("requires an authenticated candidate before accepting an upload", async () => {
    mocks.userId.mockResolvedValue(null);
    await expect(resumeRouter.resume.middleware({ req, files: [file], input: {} })).rejects.toThrow("Log in to upload a resume.");
  });

  it("rejects invalid files and multiple uploads", async () => {
    await expect(resumeRouter.resume.middleware({ req, files: [{ ...file, name: "file.exe" }], input: {} })).rejects.toThrow("Choose one PDF");
    await expect(resumeRouter.resume.middleware({ req, files: [file, file], input: {} })).rejects.toThrow("Choose one PDF");
  });

  it("binds upload metadata to the session user", async () => {
    expect(await resumeRouter.resume.middleware({ req, files: [file], input: {} })).toEqual({ userId: "candidate-1" });
  });

  it("persists the completed upload before cleaning up the unused previous file", async () => {
    const uploaded = { ...file, key: "new-key", ufsUrl: "https://test.ufs.sh/f/new-key", url: "https://test.ufs.sh/f/new-key", appUrl: "https://test.ufs.sh/f/new-key", customId: null, fileHash: "fixture-hash" };
    expect(await resumeRouter.resume.onUploadComplete({ req, metadata: { userId: "candidate-1" }, file: uploaded })).toEqual({ name: "resume.pdf" });
    expect(mocks.replace).toHaveBeenCalledWith("candidate-1", uploaded);
    expect(mocks.cleanup).toHaveBeenCalledWith("old-key");
    expect(mocks.revalidate).toHaveBeenCalledWith("/profile");
    expect(mocks.revalidate).toHaveBeenCalledWith("/jobs", "layout");
  });
});
