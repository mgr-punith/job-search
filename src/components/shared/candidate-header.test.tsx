import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/auth/actions/auth-actions", () => ({
  logoutAction: vi.fn(),
}));

import {
  CandidateHeader,
  getCandidateHomeHref,
} from "@/components/shared/candidate-header";

describe("CandidateHeader", () => {
  it("keeps signed-in candidates inside their workspace when they use the brand link", () => {
    const html = renderToStaticMarkup(
      <CandidateHeader current="dashboard" signedIn />,
    );

    expect(getCandidateHomeHref(true)).toBe("/dashboard");
    expect(html).toContain('data-brand-link="true" href="/dashboard"');
  });

  it("keeps the public brand link on the public home page", () => {
    const html = renderToStaticMarkup(
      <CandidateHeader current="jobs" signedIn={false} />,
    );

    expect(getCandidateHomeHref(false)).toBe("/");
    expect(html).toContain('data-brand-link="true" href="/"');
  });
});
