import { describe, expect, it } from "vitest";

import { computeMatchScore, type MatchingCandidate, type MatchingJob } from "@/features/applications/services/match-score";

const candidate: MatchingCandidate = {
  experienceLevel: "SENIOR", country: " United States ", preferredMarkets: ["TECHNOLOGY"],
  skills: [{ skillId: "react" }, { skillId: "typescript" }],
};
const job: MatchingJob = {
  experienceLevel: "SENIOR", country: "United States", location: "New York", market: "TECHNOLOGY", workplaceType: "HYBRID",
  skills: [{ skillId: "react" }, { skillId: "typescript" }],
};

describe("profile matching", () => {
  it("awards 100 for all required skills, sufficient experience, country and market", () => {
    expect(computeMatchScore(candidate, job)).toBe(100);
  });

  it("weights skills at 70 points and ignores duplicate and extra skills", () => {
    expect(computeMatchScore({ ...candidate, skills: [{ skillId: "react" }, { skillId: "react" }, { skillId: "unrelated" }] }, job)).toBe(65);
    expect(computeMatchScore(candidate, { ...job, skills: [...job.skills, { skillId: "react" }] })).toBe(100);
  });

  it("awards 20 for meeting experience, 10 for one level below, zero further below", () => {
    expect(computeMatchScore({ ...candidate, experienceLevel: "LEAD" }, job)).toBe(100);
    expect(computeMatchScore({ ...candidate, experienceLevel: "MID" }, job)).toBe(90);
    expect(computeMatchScore({ ...candidate, experienceLevel: "ENTRY" }, job)).toBe(80);
  });

  it("does not award skills points when the job has no required skills", () => {
    expect(computeMatchScore(candidate, { ...job, skills: [] })).toBe(30);
    expect(computeMatchScore({ ...candidate, skills: [], country: null, preferredMarkets: [], experienceLevel: "ENTRY" }, job)).toBe(0);
  });

  it("awards country and market independently and recognizes explicitly worldwide remote work", () => {
    expect(computeMatchScore({ ...candidate, country: "India", preferredMarkets: [] }, job)).toBe(90);
    expect(computeMatchScore({ ...candidate, country: "India", preferredMarkets: [] }, { ...job, country: "Worldwide", location: "Remote, worldwide", workplaceType: "REMOTE" })).toBe(95);
    expect(computeMatchScore({ ...candidate, country: "India", preferredMarkets: [] }, { ...job, country: "Remote", location: "Remote, Europe", workplaceType: "REMOTE" })).toBe(90);
  });
});
