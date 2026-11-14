# M6 QA Report

## Navigation and motion follow-up, 14 November 2026

- Local production Chrome QA verified pagination under 450ms added network latency: zero document reloads, no full-page loading flash, retained header and unchanged document scroll at 240px. Warm page changes used the client cache with zero RSC requests; Back worked.
- Keyword search and Frontend Developer filtering returned the expected roles. Warm Profile/Jobs routes avoided skeletons; first visits still show loading UI when data is unavailable.
- Saved QA profile text appeared after return navigation. A new application appeared on the dashboard and updated the job's application panel. Refresh status showed Under review and retained the submitted resume. Logout and protected-profile redirects passed.
- The resume dialog animated, retained its file input, closed with Escape and had no nested forms. The 390px viewport had no horizontal overflow; reduced-motion mode disabled the new animation and smooth scrolling.
- Verification: 195 tests in 35 files, lint, strict typecheck, production build and whitespace checks passed. No new dependency, commit or push. Local PostgreSQL served this QA; production will use Neon. Earlier real-upload and AI tests remain recorded below.

## Post-M6 follow-up, 13 November 2026

- Added 5 developer jobs for a total of 45, with a jobs-only seed that preserves the demo profile. Compact discovery renders search/filters and job content higher in the viewport.
- Profile match replaces the Benefits dropdown. Frontend, backend and web role choices returned relevant jobs in Chrome. The 70% profile option uses the same score before pagination; database tests verify counts/later pages and the no-match state.
- Real Groq testing in a visible Chrome window used a separate QA candidate. Yes to React/TypeScript and No to Next.js/Vitest produced a reviewed draft and saved only the confirmed skills. Profile reload retained the new text and existing resume; score rose from 10% to 50%.
- The first real draft invented graduation/projects. Prompt constraints, common-claim validation, one retry and a regression test address that finding. Candidate review remains required; semantic accuracy is not guaranteed by the checks.
- The profile popup fit actual 320px and 390px viewports, without horizontal overflow or nested forms. Discovery fit 390px. Console checks on the inspected discovery route were clean.
- Final verification: 190 tests in 33 files, lint, typecheck, production build and whitespace checks passed. `.env` remains ignored; no commit/push. This follow-up does not claim the separate paused redesign's entire QA checklist is complete.

Tested locally on 12 November 2026 with PostgreSQL, Next.js development and production builds, Chrome DevTools, Vitest, ESLint, TypeScript, and Lighthouse.

## Assignment flows

- Registration rejects invalid fields, retains the submitted name and email, clears passwords, and focuses the first error. Email normalization and duplicate-account handling remain covered by integration tests.
- Login retains the submitted email, clears the password, focuses the generic error, follows safe internal callbacks, and redirects protected routes. Logout and expired-session behavior have automated coverage.
- Profile validation retains values and focuses the first invalid field. Successful saves keep controlled selects and checkboxes visible, survive reload, and support skill search and deselection.
- Resume upload rejects missing files, unsupported extensions, and files over 4 MB. A real PDF upload, replacement, view link, and removal completed through UploadThing. Application resume snapshots survived profile replacement and removal.
- Job discovery passed keyword, location, all six filters, combined filters, empty results, pagination, invalid parameters, reload, and Back navigation. Desktop uses the detail pane; mobile uses the standalone detail route. Missing jobs show the unavailable state.
- Application testing covered missing-resume guidance, a successful 100% application, duplicate prevention, owner-only access, the saved score, the saved resume, dashboard/detail navigation, and simulated status progression through interview. Existing automated coverage tests the below-90% under-review path and concurrent submissions/status refreshes.

## Responsive, accessibility, and performance

- Checked 320, 390, 768, and 1280 pixel widths. The tested signup, jobs, profile, application, and detail pages had no horizontal overflow.
- Lighthouse snapshots scored 100 for accessibility, best practices, SEO, and agentic browsing on the public jobs page, mobile profile, and fixed mobile job detail page.
- Keyboard/native validation and error focus were checked on authentication and profile forms. The job detail heading hierarchy was corrected and covered by a component regression test.
- A cold local development trace on job detail measured LCP 1.31 seconds and CLS 0.00. Development timing includes compiler overhead and is not a production benchmark.
- Tested pages reported no application console errors or failed first-party network requests. Chrome reports an autocomplete advisory for the job search/filter form; these search controls do not contain identity or payment data.

## Automated verification

- `npm test`: 28 files, 156 tests passed.
- `npm run lint`: passed with zero warnings.
- `npm run typecheck`: passed after the build generated current Next.js route types.
- `npm run build`: passed using the local PostgreSQL URL.
- `npm audit --omit=dev`: 1 moderate and 3 high findings in the approved UploadThing/Effect dependency chain, with no critical findings. npm proposes an incompatible UploadThing downgrade, so M6 records the limitation instead of changing the dependency.

## CI

GitHub Actions now provisions PostgreSQL 17 with separate development and test databases, installs locked dependencies, generates Prisma, deploys migrations, seeds fixtures, then runs lint, typecheck, tests, and the production build. CI values are non-secret fixtures; production still requires Neon, a private auth secret, the deployed auth URL, and the UploadThing token.

## Limits

- Visual comparison is inconclusive because the repository has no committed screenshot baseline. Layouts were inspected directly at the listed viewports.
- Automated accessibility checks cover only part of WCAG. M6 also checked landmarks, labels, heading order, focus behavior, and keyboard/native form behavior, but did not run a full screen-reader certification pass.
- UploadThing free-tier file URLs remain accessible to anyone who has the URL, as previously approved for this assignment.
