import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { JobPagination } from "@/features/jobs/components/job-pagination";
import { parseJobSearch } from "@/features/jobs/schemas/search";

const linkState = vi.hoisted(() => ({ pending: false }));
vi.mock("next/link", async (importOriginal) => ({
  ...await importOriginal<typeof import("next/link")>(),
  useLinkStatus: () => linkState,
}));

beforeEach(() => { linkState.pending = false; });

describe("job pagination navigation", () => {
  it("preserves filters and clears the previous job selection", () => {
    const filters = parseJobSearch({ q: "React", location: "India", match: "frontend-developer", page: "2", job: "old-selection" });
    const html = renderToStaticMarkup(<JobPagination filters={filters} totalPages={5} />);
    expect(html).toContain('href="/jobs?q=React&amp;location=India&amp;match=frontend-developer&amp;page=3"');
    expect(html).not.toContain("old-selection");
    expect(html).toContain('aria-current="page"');
    expect(html).not.toContain("navigation-progress");
  });

  it("shows navigation feedback only while a page change is pending", () => {
    linkState.pending = true;
    const html = renderToStaticMarkup(<JobPagination filters={parseJobSearch({})} totalPages={2} />);
    expect(html).toContain('class="navigation-progress" role="status"');
    expect(html).toContain("Loading…");
  });

  it("omits pagination for a single result page", () => {
    expect(renderToStaticMarkup(<JobPagination filters={parseJobSearch({})} totalPages={1} />)).toBe("");
  });
});
