# M6 QA Report

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
