import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { parseJobSearch } from "@/features/jobs/schemas/search";
import { getTestDatabaseUrl } from "@/lib/test-database";

process.env.DATABASE_URL = getTestDatabaseUrl(process.env.TEST_DATABASE_URL);

const [{ db }, { getJobs, getJobDetail, getJobFilterOptions }] = await Promise.all([
  import("@/lib/db"), import("@/features/jobs/queries/jobs"),
]);
const companyId = "m4-search-company";
const skillId = "m4-search-skill";
const benefitId = "m4-search-benefit";

async function cleanup() {
  await db.job.deleteMany({ where: { companyId } });
  await db.company.deleteMany({ where: { id: companyId } });
  await db.skill.deleteMany({ where: { id: skillId } });
  await db.benefit.deleteMany({ where: { id: benefitId } });
}

beforeAll(async () => {
  await cleanup();
  await db.company.create({ data: { id: companyId, slug: companyId, name: "M4 Search Studio", description: "Search test fixture", size: "SMALL", location: "India" } });
  await db.skill.create({ data: { id: skillId, slug: skillId, name: "M4 TypeScript" } });
  await db.benefit.create({ data: { id: benefitId, slug: benefitId, name: "M4 Health insurance" } });
  for (let index = 0; index < 11; index++) {
    await db.job.create({ data: {
      id: `m4-search-${index}`, slug: `m4-search-${index}`, companyId,
      title: index === 0 ? "Engineer 50%_\\" : "Frontend engineer",
      summary: "Build accessible interfaces.", about: "Search test fixture.",
      responsibilities: ["Build interfaces"], idealProfile: ["TypeScript experience"], whatsOnOffer: ["Flexible hours"],
      location: index === 0 ? "Bengaluru" : "London", country: index === 0 ? "India" : "United Kingdom",
      timeZone: index === 0 ? "UTC+05:30" : "UTC+00:00", workplaceType: "REMOTE", jobType: "FULL_TIME",
      experienceLevel: "SENIOR", market: "TECHNOLOGY", salaryMin: 90_000, salaryMax: 120_000,
      updatedAt: new Date("2026-11-01T12:00:00Z"), isActive: index !== 10,
      skills: { create: { skillId } }, benefits: { create: { benefitId } },
    } });
  }
});

afterAll(async () => { await cleanup(); await db.$disconnect(); });

describe("job discovery database queries", () => {
  it("combines skill, location, company and every dropdown filter", async () => {
    const result = await getJobs(parseJobSearch({
      q: "typescript", location: "india", company: companyId, experience: "SENIOR", type: "FULL_TIME",
      salary: "100-150", market: "TECHNOLOGY", benefit: benefitId,
    }));
    expect(result.total).toBe(1);
    expect(result.jobs.map(({ slug }) => slug)).toEqual(["m4-search-0"]);
    expect((await getJobs(parseJobSearch({ q: "typescript", location: "Canada", company: companyId }))).total).toBe(0);
  });

  it("searches company names and literal time-zone offsets", async () => {
    expect((await getJobs(parseJobSearch({ q: "search studio", location: "UTC+05:30" }))).total).toBe(1);
  });

  it("treats percent, underscore and backslash as literal search text", async () => {
    expect((await getJobs(parseJobSearch({ q: "50%_\\", company: companyId }))).total).toBe(1);
    expect((await getJobs(parseJobSearch({ q: "%", company: companyId }))).total).toBe(1);
  });

  it("paginates active jobs with stable ties and clamps pages beyond the results", async () => {
    const first = await getJobs(parseJobSearch({ company: companyId }));
    const last = await getJobs(parseJobSearch({ company: companyId, page: "999" }));
    expect(first).toMatchObject({ total: 10, page: 1, totalPages: 2 });
    expect(first.jobs).toHaveLength(8);
    expect(last).toMatchObject({ page: 2, totalPages: 2 });
    expect(last.jobs).toHaveLength(2);
    expect(new Set([...first.jobs, ...last.jobs].map(({ id }) => id)).size).toBe(10);
    expect(first.jobs.map(({ id }) => id)).toEqual((await getJobs(parseJobSearch({ company: companyId }))).jobs.map(({ id }) => id));
  });

  it("returns full active job details and hides inactive or missing jobs", async () => {
    expect(await getJobDetail("m4-search-0")).toMatchObject({ responsibilities: ["Build interfaces"], skills: [{ skill: { name: "M4 TypeScript" } }], company: { name: "M4 Search Studio" } });
    expect(await getJobDetail("m4-search-10")).toBeNull();
    expect(await getJobDetail("missing-job")).toBeNull();
    expect(await getJobDetail("../unsafe")).toBeNull();
  });

  it("provides named company and benefit choices", async () => {
    const options = await getJobFilterOptions();
    expect(options.companies).toContainEqual({ slug: companyId, name: "M4 Search Studio" });
    expect(options.benefits).toContainEqual({ slug: benefitId, name: "M4 Health insurance" });
  });
});
