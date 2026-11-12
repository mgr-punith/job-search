import { describe, expect, it } from "vitest";

import { parseJobSearch } from "@/features/jobs/schemas/search";

describe("job search parameters", () => {
  it("normalizes search text and repeated URL params", () => {
    expect(parseJobSearch({ q: ["  React  ", "ignored"], location: " India ", page: "2", experience: "SENIOR" })).toMatchObject({ q: "React", location: "India", page: 2, experience: "SENIOR" });
  });

  it("uses safe defaults for invalid URL values without dropping valid filters", () => {
    expect(parseJobSearch({ q: "engineer", page: "-2", experience: "expert", salary: "invalid", company: "../company", type: "FULL_TIME" })).toMatchObject({ q: "engineer", page: 1, experience: "", salary: "", company: "", type: "FULL_TIME" });
  });

  it.each(["0", "1.5", "100000000000", "invalid", ""])("bounds pagination for %s", (page) => {
    expect(parseJobSearch({ page }).page).toBe(1);
  });

  it("bounds search text and selected job slugs", () => {
    expect(parseJobSearch({ q: "a".repeat(121), job: "a".repeat(161) })).toMatchObject({ q: "", job: "" });
  });
});
