import { describe, expect, it } from "vitest";

import { parseJobSearch } from "@/features/jobs/schemas/search";
import { buildJobWhere, buildJobsUrl, getPageNumbers } from "@/features/jobs/services/job-filters";

describe("job filters", () => {
  it("keeps keyword and location searches as separate AND conditions", () => {
    const where = buildJobWhere(parseJobSearch({ q: "React", location: "India", type: "FULL_TIME", experience: "MID", company: "nimbus-systems", market: "TECHNOLOGY", benefit: "health-insurance" }));
    expect(where).toMatchObject({ isActive: true, jobType: "FULL_TIME", experienceLevel: "MID", company: { slug: "nimbus-systems" }, market: "TECHNOLOGY", benefits: { some: { benefit: { slug: "health-insurance" } } } });
    expect(where.AND).toHaveLength(2);
    expect(JSON.stringify(where)).toContain('"skills"');
    expect(JSON.stringify(where)).toContain('"timeZone"');
  });

  it("finds salaries overlapping the selected annual USD range", () => {
    expect(buildJobWhere(parseJobSearch({ salary: "100-150" }))).toMatchObject({ salaryCurrency: "USD", salaryMax: { gte: 100000 }, salaryMin: { lte: 150000 } });
  });

  it("escapes SQL LIKE wildcards in literal keyword searches", () => {
    expect(JSON.stringify(buildJobWhere(parseJobSearch({ q: "50%_" })))).toContain("50\\\\%\\\\_");
  });

  it("keeps filters in pagination and selection links while omitting defaults", () => {
    const filters = parseJobSearch({ q: "UI & UX", type: "CONTRACT", page: "2", job: "old-job" });
    const url = new URL(buildJobsUrl(filters, { page: 3, job: "" }), "http://localhost");
    expect(url.pathname).toBe("/jobs");
    expect(url.searchParams.get("q")).toBe("UI & UX");
    expect(url.searchParams.get("type")).toBe("CONTRACT");
    expect(url.searchParams.get("page")).toBe("3");
    expect(url.searchParams.has("job")).toBe(false);
    expect(buildJobsUrl(parseJobSearch({}))).toBe("/jobs");
  });

  it("bounds pagination links around the current page", () => {
    expect(getPageNumbers(1, 4)).toEqual([1, 2, 3, 4]);
    expect(getPageNumbers(8, 10)).toEqual([6, 7, 8, 9, 10]);
  });
});
