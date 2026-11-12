import { describe, expect, it, vi } from "vitest";

import { runApplyJob, type ApplyDependencies } from "@/features/applications/actions/application-handlers";
import { ApplicationError } from "@/features/applications/services/application-error";

function form(jobId = "job-1") { const data = new FormData(); data.set("jobId", jobId); return data; }
function dependencies(overrides: Partial<ApplyDependencies> = {}): ApplyDependencies {
  return { getUserId: async () => "candidate-1", apply: async () => ({ id: "application-1" }), ...overrides };
}

describe("apply action", () => {
  it("requires a session before validating input or calling the service", async () => {
    const apply = vi.fn();
    expect(await runApplyJob(form(""), dependencies({ getUserId: async () => null, apply }))).toEqual({ ok: false, error: "Log in to apply to this job." });
    expect(apply).not.toHaveBeenCalled();
  });

  it("returns validation errors without creating an application", async () => {
    const apply = vi.fn();
    expect(await runApplyJob(form("../invalid"), dependencies({ apply }))).toMatchObject({ ok: false, fieldErrors: { jobId: expect.any(Array) } });
    expect(apply).not.toHaveBeenCalled();
  });

  it("takes ownership from the session and ignores forged scores/resume fields", async () => {
    const data = form();
    data.set("userId", "other-user"); data.set("matchScore", "100"); data.set("resumeKey", "forged");
    const apply = vi.fn(async (userId: string, jobId: string) => ({ id: `${userId}:${jobId}` }));
    expect(await runApplyJob(data, dependencies({ apply }))).toEqual({ ok: true, data: { id: "candidate-1:job-1" } });
  });

  it("returns a recoverable duplicate result with the existing application link", async () => {
    const result = await runApplyJob(form(), dependencies({ apply: async () => { throw new ApplicationError("ALREADY_APPLIED", "existing-id"); } }));
    expect(result).toMatchObject({ ok: false, code: "ALREADY_APPLIED", applicationId: "existing-id" });
  });

  it("does not expose internal service errors", async () => {
    expect(await runApplyJob(form(), dependencies({ apply: async () => { throw new Error("Internal database detail"); } }))).toEqual({ ok: false, error: "We could not submit your application. Please try again." });
  });
});
