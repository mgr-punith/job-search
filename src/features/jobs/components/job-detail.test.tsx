import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/profile/actions/profile-ai-actions", () => ({
  prepareProfileAiAction: vi.fn(), generateProfileAiAction: vi.fn(), saveProfileAiAction: vi.fn(),
}));

import { JobDetail } from "@/features/jobs/components/job-detail";
import type { JobDetailData } from "@/features/jobs/queries/jobs";

const job = {
  id: "job-id",
  slug: "test-job",
  title: "Test engineer",
  location: "Remote",
  country: "Worldwide",
  workplaceType: "REMOTE",
  jobType: "FULL_TIME",
  experienceLevel: "MID",
  salaryMin: 100_000,
  salaryMax: 130_000,
  salaryCurrency: "USD",
  isActivelyRecruiting: true,
  publishedAt: new Date("2026-11-01T00:00:00Z"),
  updatedAt: new Date("2026-11-02T00:00:00Z"),
  market: "TECHNOLOGY",
  summary: "A test role.",
  about: "Build useful software.",
  responsibilities: ["Ship tested work."],
  idealProfile: ["Explain decisions."],
  whatsOnOffer: ["Learning budget."],
  timeZone: "UTC",
  company: { name: "Test Company", slug: "test-company", size: "SMALL", description: "A test company." },
  skills: [{ skillId: "skill-id", skill: { name: "TypeScript" } }],
  benefits: [{ benefit: { name: "Health insurance" } }],
} satisfies JobDetailData;

describe("JobDetail headings", () => {
  it("uses h2 section headings on the standalone h1 page", () => {
    const html = renderToStaticMarkup(<JobDetail job={job} standalone applyPanel={null} />);

    expect(html).toContain("<h1");
    expect(html).toContain("<h2");
    expect(html).not.toContain("<h3");
  });

  it("uses h3 sections beneath the list page h2 heading", () => {
    const html = renderToStaticMarkup(<JobDetail job={job} applyPanel={null} />);

    expect(html).toContain("<h2");
    expect(html).toContain("<h3");
  });
});
