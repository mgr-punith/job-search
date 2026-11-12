import { describe, expect, it, vi } from "vitest";

import { runSaveProfile, runRemoveResume, type ProfileActionDependencies } from "@/features/profile/actions/profile-handlers";

function dependencies(overrides: Partial<ProfileActionDependencies> = {}): ProfileActionDependencies {
  return {
    getUserId: vi.fn().mockResolvedValue("candidate-1"),
    saveProfile: vi.fn().mockResolvedValue(undefined),
    removeResume: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function validForm() {
  const form = new FormData();
  Object.entries({ name: "Jordan Lee", headline: "Engineer", phone: "", location: "London", country: "United Kingdom", timeZone: "Europe/London", yearsExperience: "3", experienceLevel: "MID", bio: "" }).forEach(([key, value]) => form.set(key, value));
  form.append("skillIds", "react");
  return form;
}

describe("profile actions", () => {
  it("requires login before saving or removing a resume", async () => {
    const deps = dependencies({ getUserId: vi.fn().mockResolvedValue(null) });
    expect(await runSaveProfile(validForm(), deps)).toMatchObject({ ok: false, error: "Log in to manage your profile." });
    expect(await runRemoveResume(deps)).toMatchObject({ ok: false });
    expect(deps.saveProfile).not.toHaveBeenCalled();
    expect(deps.removeResume).not.toHaveBeenCalled();
  });

  it("returns field errors and preserves values without writing invalid input", async () => {
    const deps = dependencies();
    const form = validForm();
    form.set("name", "J");
    expect(await runSaveProfile(form, deps)).toMatchObject({ ok: false, fieldErrors: { name: expect.any(Array) } });
    expect(deps.saveProfile).not.toHaveBeenCalled();
  });

  it("saves for the session user and ignores forged ownership fields", async () => {
    const deps = dependencies();
    const form = validForm();
    form.set("userId", "someone-else");
    expect(await runSaveProfile(form, deps)).toMatchObject({ ok: true });
    expect(deps.saveProfile).toHaveBeenCalledWith("candidate-1", expect.objectContaining({ yearsExperience: 3, skillIds: ["react"] }));
  });

  it("removes only the session user's resume", async () => {
    const deps = dependencies();
    expect(await runRemoveResume(deps)).toMatchObject({ ok: true });
    expect(deps.removeResume).toHaveBeenCalledWith("candidate-1");
  });

  it("returns a safe message for a failed save", async () => {
    const deps = dependencies({ saveProfile: vi.fn().mockRejectedValue(new Error("Database detail")) });
    expect(await runSaveProfile(validForm(), deps)).toEqual({ ok: false, error: "We could not save your profile. Please try again." });
  });
});
