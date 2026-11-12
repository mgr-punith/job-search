import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    replace: vi.fn(),
  }),
}));

vi.mock("@/features/auth/actions/auth-actions", () => ({
  loginAction: vi.fn(),
  logoutAction: vi.fn(),
  signupAction: vi.fn(),
}));

import { LoginForm } from "@/features/auth/components/login-form";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { SignupForm } from "@/features/auth/components/signup-form";

describe("auth forms", () => {
  it("renders an accessible login form with a safe callback field", () => {
    const html = renderToStaticMarkup(
      <LoginForm callbackUrl="/dashboard?from=login" />,
    );

    expect(html).toContain('for="login-email"');
    expect(html).toContain('type="email"');
    expect(html).toContain('autoComplete="email"');
    expect(html).toContain('for="login-password"');
    expect(html).toContain('autoComplete="current-password"');
    expect(html).toContain('name="callbackUrl"');
    expect(html).toContain('value="/dashboard?from=login"');
    expect(html).toContain("Log in");
  });

  it("renders signup password confirmation and autocomplete hints", () => {
    const html = renderToStaticMarkup(<SignupForm callbackUrl="/dashboard" />);

    expect(html).toContain('for="signup-name"');
    expect(html).toContain('autoComplete="name"');
    expect(html).toContain('for="signup-password-confirmation"');
    expect(html).toContain('autoComplete="new-password"');
    expect(html).toContain("Create account");
  });

  it("renders a logout control", () => {
    const html = renderToStaticMarkup(<LogoutButton />);

    expect(html).toContain("<form");
    expect(html).toContain("Log out");
  });
});
