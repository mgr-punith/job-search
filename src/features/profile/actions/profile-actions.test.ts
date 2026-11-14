import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ userId: vi.fn(), detach: vi.fn(), cleanup: vi.fn(), revalidate: vi.fn() }));
vi.mock("@/features/auth/queries/session", () => ({ getSessionUserId: mocks.userId }));
vi.mock("@/features/profile/services/profile", () => ({ saveCandidateProfile: vi.fn() }));
vi.mock("@/features/profile/services/resume", () => ({ detachCandidateResume: mocks.detach }));
vi.mock("@/lib/uploadthing", () => ({ deleteUnusedUpload: mocks.cleanup }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));

import { removeResumeAction } from "@/features/profile/actions/profile-actions";

beforeEach(() => {
  vi.resetAllMocks();
  mocks.userId.mockResolvedValue("candidate-1");
  mocks.detach.mockResolvedValue("unused-key");
});

describe("resume removal cache freshness", () => {
  it("invalidates the profile and job application panels after removal", async () => {
    expect((await removeResumeAction()).ok).toBe(true);
    expect(mocks.detach).toHaveBeenCalledWith("candidate-1");
    expect(mocks.revalidate).toHaveBeenCalledWith("/profile");
    expect(mocks.revalidate).toHaveBeenCalledWith("/jobs", "layout");
  });

  it("does not invalidate pages when the candidate is signed out", async () => {
    mocks.userId.mockResolvedValue(null);
    expect((await removeResumeAction()).ok).toBe(false);
    expect(mocks.detach).not.toHaveBeenCalled();
    expect(mocks.revalidate).not.toHaveBeenCalled();
  });
});
