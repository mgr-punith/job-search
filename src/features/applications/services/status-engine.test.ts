import { describe, expect, it } from "vitest";

import { deriveStatus } from "@/features/applications/services/status-engine";

const appliedAt = new Date("2026-11-12T09:00:00Z");
const application = { id: "application-one", appliedAt, matchScore: 90 };
const at = (seconds: number) => new Date(appliedAt.getTime() + seconds * 1000);

describe("simulated application timeline", () => {
  it.each([
    [-1, "APPLIED"], [0, "APPLIED"], [29, "APPLIED"], [30, "UNDER_REVIEW"],
    [59, "UNDER_REVIEW"], [60, "SHORTLISTED"], [89, "SHORTLISTED"], [90, "INTERVIEW_SCHEDULED"],
  ])("at %s seconds derives %s for the exact 90-point threshold", (seconds, status) => {
    expect(deriveStatus(application, at(seconds), 30).status).toBe(status);
  });

  it("records every skipped transition at its scheduled time", () => {
    expect(deriveStatus(application, at(500), 30).events).toEqual([
      { status: "APPLIED", occurredAt: at(0) },
      { status: "UNDER_REVIEW", occurredAt: at(30) },
      { status: "SHORTLISTED", occurredAt: at(60) },
      { status: "INTERVIEW_SCHEDULED", occurredAt: at(90) },
    ]);
  });

  it("gives an 89-point application no shortlist or interview", () => {
    const result = deriveStatus({ ...application, matchScore: 89 }, at(10_000), 30);
    expect(result.status).toBe("UNDER_REVIEW");
    expect(result.interviewAt).toBeNull();
    expect(result.events.map(({ status }) => status)).toEqual(["APPLIED", "UNDER_REVIEW"]);
  });

  it("honors configurable delays", () => {
    expect(deriveStatus(application, at(14), 5).status).toBe("SHORTLISTED");
    expect(deriveStatus(application, at(15), 5).status).toBe("INTERVIEW_SCHEDULED");
  });

  it("keeps the interview time deterministic and a few days after submission", () => {
    const first = deriveStatus(application, at(90), 30);
    expect(first.interviewAt).toEqual(deriveStatus(application, at(200), 30).interviewAt);
    expect(first.interviewAt?.getTime()).toBeGreaterThanOrEqual(at(3 * 86400).getTime());
    expect(first.interviewAt?.getTime()).toBeLessThanOrEqual(at(6 * 86400).getTime());
    expect(deriveStatus(application, at(89), 30).interviewAt).toBeNull();
  });
});
