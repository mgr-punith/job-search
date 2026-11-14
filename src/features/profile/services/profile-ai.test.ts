import { afterEach, describe, expect, it, vi } from "vitest";
import { aiRequestSchema, type AiContext } from "@/features/profile/schemas/profile-ai";
import { checkDeniedSkills, checkProfileClaims, generateProfileDraft, resolveConfirmedSkills } from "@/features/profile/services/profile-ai";

const context: AiContext = {
  revision: "2026-11-13T00:00:00.000Z", headline: "Developer", bio: "Learning to build websites.", yearsExperience: 0, experienceLevel: "ENTRY",
  skills: [{ id: "react", name: "React" }], job: { id: "job", title: "Frontend Developer", skills: [{ id: "react", name: "React" }, { id: "next", name: "Next.js" }, { id: "ts", name: "TypeScript" }] },
};
afterEach(() => vi.unstubAllGlobals());

describe("confirmed profile skills", () => {
  it("rejects invented graduation, projects and changed experience from the live QA finding", () => {
    expect(() => checkProfileClaims({ headline: "Frontend developer", bio: "I am a recent graduate with several personal projects." }, context)).toThrow("qualifications");
    expect(() => checkProfileClaims({ headline: "Frontend developer", bio: "I have 4 years of experience." }, context)).toThrow("years");
    expect(() => checkProfileClaims({ headline: "Frontend developer", bio: "I know React and am seeking an entry-level frontend role." }, context)).not.toThrow();
  });
  it("adds only skills answered Yes and keeps No answers as learning suggestions", () => {
    expect(resolveConfirmedSkills(context, [{ skillId: "next", known: false }, { skillId: "ts", known: true }])).toEqual({
      skills: [{ id: "react", name: "React" }, { id: "ts", name: "TypeScript" }], learningSkills: [{ id: "next", name: "Next.js" }],
    });
  });
  it.each([
    [], [{ skillId: "ts", known: true }], [{ skillId: "next", known: true }, { skillId: "next", known: true }],
    [{ skillId: "next", known: false }, { skillId: "invented", known: true }],
  ].map((answers) => ({ answers })))("rejects incomplete, duplicate or unrelated skill answers", ({ answers }) => {
    expect(() => resolveConfirmedSkills(context, answers)).toThrow("Confirm each skill");
  });
  it("enforces the total profile limit before adding confirmed skills", () => {
    const full = { ...context, skills: Array.from({ length: 30 }, (_, index) => ({ id: String(index), name: String(index) })) };
    expect(() => resolveConfirmedSkills(full, full.job.skills.map(({ id }) => ({ skillId: id, known: true })))).toThrow("30 skills");
  });
  it("rejects denied skills in headline and bio, including punctuation and case", () => {
    expect(() => checkDeniedSkills({ headline: "Developer", bio: "I know NEXT.JS." }, [{ id: "next", name: "Next.js" }])).toThrow("do not know");
    expect(() => checkDeniedSkills({ headline: "React developer", bio: "I build reactive interfaces." }, [{ id: "java", name: "Java" }])).not.toThrow();
  });
  it("requires boolean answers, a valid revision and bounded input", () => {
    expect(aiRequestSchema.safeParse({ jobId: "job", revision: context.revision, answers: [{ skillId: "next", known: "false" }] }).success).toBe(false);
    expect(aiRequestSchema.safeParse({ jobId: "job", revision: "bad", answers: [] }).success).toBe(false);
  });
});

describe("Groq profile draft", () => {
  it("sends only the confirmed skill names and validates the generated fields", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ headline: "React developer", bio: "Learning to build accessible React websites." }) } }] })));
    vi.stubGlobal("fetch", fetchMock);
    const result = await generateProfileDraft(context, context.skills, { GROQ_API_KEY: "fixture-key", GROQ_MODEL: "fixture-model" });
    expect(result.headline).toBe("React developer");
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    const data = JSON.parse(body.messages[1].content);
    expect(data.confirmedSkills).toEqual(["React"]);
    expect(data).not.toHaveProperty("email");
    expect(data).not.toHaveProperty("resumeUrl");
    expect(body.messages[0].content).toContain("Do not invent");
  });
  it("reports free quota exhaustion with a useful message", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 429 })));
    await expect(generateProfileDraft(context, [], { GROQ_API_KEY: "fixture-key", GROQ_MODEL: "fixture-model" })).rejects.toThrow("free AI limit");
  });
  it.each(["not json", '{"headline":"x","bio":"short"}', '{"headline":"Developer","bio":"A valid length bio","skills":["invented"]}'])("rejects malformed or invalid model output", async (content) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content } }] }))));
    await expect(generateProfileDraft(context, [], { GROQ_API_KEY: "fixture-key", GROQ_MODEL: "fixture-model" })).rejects.toThrow("invalid draft");
  });
});
