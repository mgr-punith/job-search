import { beforeEach, describe, expect, it, vi } from "vitest";
import { runGenerateProfileAi, runPrepareProfileAi, runSaveProfileAi, type ProfileAiDependencies } from "@/features/profile/actions/profile-ai-handlers";
import type { AiContext } from "@/features/profile/schemas/profile-ai";

const context: AiContext = { revision: "2026-11-13T00:00:00.000Z", headline: "Developer", bio: "I build React interfaces.", yearsExperience: 2, experienceLevel: "MID",
  skills: [{ id: "react", name: "React" }], job: { id: "job", title: "Frontend developer", skills: [{ id: "react", name: "React" }, { id: "next", name: "Next.js" }] } };
const draft = { headline: "React frontend developer", bio: "I build React interfaces with two years of experience." };
const request = { jobId: "job", revision: context.revision, answers: [{ skillId: "next", known: false }] };
const deps: ProfileAiDependencies = { getUserId: vi.fn(), getContext: vi.fn(), isConfigured: vi.fn(), generate: vi.fn(), save: vi.fn() };
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(deps.getUserId).mockResolvedValue("owner");
  vi.mocked(deps.getContext).mockResolvedValue(context);
  vi.mocked(deps.isConfigured).mockReturnValue(true);
  vi.mocked(deps.generate).mockResolvedValue(draft);
});
describe("profile AI actions", () => {
  it("authenticates all actions before fetching private context", async () => {
    vi.mocked(deps.getUserId).mockResolvedValue(null);
    for (const run of [runPrepareProfileAi, runGenerateProfileAi, runSaveProfileAi]) expect((await run(request, deps)).ok).toBe(false);
    expect(deps.getContext).not.toHaveBeenCalled();
  });
  it("scopes preparation to the session candidate and returns missing skills", async () => {
    const result = await runPrepareProfileAi({ jobId: "job" }, deps);
    expect(deps.getContext).toHaveBeenCalledWith("owner", "job");
    expect(result).toMatchObject({ ok: true, data: { missingSkills: [{ id: "next", name: "Next.js" }] } });
  });
  it("rejects invalid input and stale revisions before calling the provider", async () => {
    expect((await runGenerateProfileAi({ ...request, userId: "other" }, deps)).ok).toBe(false);
    expect((await runGenerateProfileAi({ ...request, revision: "2026-11-12T00:00:00.000Z" }, deps)).ok).toBe(false);
    expect(deps.generate).not.toHaveBeenCalled();
  });
  it("keeps generation separate from saving and excludes denied skills", async () => {
    expect(await runGenerateProfileAi(request, deps)).toMatchObject({ ok: true, data: { ...draft, skills: context.skills } });
    expect(deps.generate).toHaveBeenCalledWith(context, context.skills);
    expect(deps.save).not.toHaveBeenCalled();
  });
  it("handles an unconfigured provider without blocking normal profile editing", async () => {
    vi.mocked(deps.isConfigured).mockReturnValue(false);
    expect(await runGenerateProfileAi(request, deps)).toMatchObject({ ok: false, error: expect.stringContaining("manually") });
    expect(deps.generate).not.toHaveBeenCalled();
  });
  it("rejects a generated or edited claim about a denied skill", async () => {
    vi.mocked(deps.generate).mockResolvedValue({ ...draft, bio: "I know Next.js." });
    expect((await runGenerateProfileAi(request, deps)).ok).toBe(false);
    expect((await runSaveProfileAi({ ...request, ...draft, bio: "I know Next.js." }, deps)).ok).toBe(false);
    expect(deps.save).not.toHaveBeenCalled();
  });
  it("saves the reviewed fields and server-resolved skills for the owner only", async () => {
    expect((await runSaveProfileAi({ ...request, ...draft }, deps)).ok).toBe(true);
    expect(deps.save).toHaveBeenCalledWith("owner", context.revision, draft, context.skills);
  });
  it("returns generic errors rather than leaking provider errors or credentials", async () => {
    vi.mocked(deps.generate).mockRejectedValue(new Error("secret-provider-error"));
    const result = await runGenerateProfileAi(request, deps);
    expect(result).toMatchObject({ ok: false });
    expect(JSON.stringify(result)).not.toContain("secret-provider-error");
  });
});
