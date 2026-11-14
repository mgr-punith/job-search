# AI-assisted development workflow

## M0: Project tooling, 2026-11-11

### Tool and fit

Codex set up the project and checked the installed package versions against current framework documentation. A separate GPT-6.1-sol agent reviewed the finished milestone for version errors, missing requirements, and unnecessary generated content.

### Prompt

> [SUBMISSION EXAMPLE] Read AGENTS.md and the files in docs/. Follow Phase 0 and Phase 1 only: inspect the existing project, then give me the 7-item plan. Do not modify any files or write implementation code until I reply APPROVED.

The prompt supplied project context, a strict read-only constraint, the required output, and the exact stop condition. After plan approval, Codex implemented only M0 and stopped before the data milestone.

### Output

Codex created a Next.js App Router foundation with strict TypeScript, Tailwind CSS, shadcn/ui configuration, Prisma configured for PostgreSQL, Zod environment validation, Vitest, and the required package scripts. It also added a small landing page so the production build has a reviewable route.

Local development uses PostgreSQL 17 through Docker Compose. Database integration tests will use the separate local `jobsearch_test` database created during first startup. Production will read its Neon PostgreSQL URL from the deployment environment.

### Issues and debugging

The npm `prisma` latest tag pointed to an 8.0 release candidate, so Codex pinned the stable 7.10.1 line. Vitest 5 required newer Node type definitions than the Next.js scaffold supplied, so Codex aligned `@types/node` with the Node 24 runtime. Prisma 7 also required `prisma.config.ts`, a generated client output path, and a PostgreSQL driver adapter. An ESLint 10 trial produced invalid peer dependencies in the Next.js plugin chain, so the project retained the scaffold-supported ESLint 9.39.5 release. Turbopack could not bind the local port used by its CSS worker in the execution sandbox, so production builds use Next.js's supported webpack path. The first webpack build left Tailwind directives uncompiled; the review caught this, and Codex added Tailwind's PostCSS adapter before rebuilding.

### Review and testing

Codex removed the stock Next.js template content and reviewed the generated package tree. ESLint passed with zero warnings, TypeScript passed without emitting files, and the environment plus database tests passed. Prisma validated the schema, generated its client, and connected to local PostgreSQL. The production build passed, emitted compiled Tailwind utilities, and served the landing page with HTTP 200. The GPT-6.1-sol review found and prompted fixes for the missing webpack Tailwind compiler, database port binding, env-file ignore coverage, and PostgreSQL URL validation.

## M1: Database schema, migration, and seed, 2026-11-12

### Tool and fit

Codex designed the relational model, generated the initial Prisma migration, and built an idempotent seed for the assignment data. A separate GPT-6.1-sol reviewer checked Better Auth compatibility, Prisma 7 conventions, constraints, indexes, seed behavior, and milestone scope.

### Prompt

> continue now
>
> i want next phase to done fastly

These short instructions resumed the approved plan. The existing `AGENTS.md`, approved milestone boundary, and saved handoff supplied the context, fixed stack, M1 deliverables, verification requirements, and stop condition. Codex implemented only the schema, migration, and seed, then stopped before authentication work.

### Output

Codex added the complete PostgreSQL schema for Better Auth storage, candidate profiles, companies, skills, benefits, jobs, applications, and application status events. The schema includes filter and relation indexes, unique email and slug constraints, a unique `(userId, jobId)` application constraint, and an idempotent `(applicationId, status)` event constraint.

The initial migration applies to both local databases. The seed creates 10 companies, 40 coherent jobs across several markets, 42 skills, 10 benefits, and one demo candidate profile. The candidate does not have a password yet; M2 will create its credential account through Better Auth's supported password hasher.

### Issues and debugging

Node 24 could not load Prisma's generated client when its internal imports omitted file extensions. Codex first proposed `tsx`, then found Prisma 7's supported `importFileExtension` generator option. Explicit `.ts` imports let Node run `prisma/seed.ts` with built-in type stripping, so the project added no dependency.

The first production-build attempt failed because the execution sandbox blocked Next.js from spawning its TypeScript subprocess. Direct inspection showed the child process returned `EPERM` and no output. Running the same build with local worker-process permission completed successfully; no application change was needed.

### Review and testing

Prisma formatted and validated the schema, generated the client, and reported the development database up to date. The migration applied cleanly to the empty `jobsearch_test` database. Codex ran the seed twice; both runs reported 10 companies, 40 jobs, 42 skills, 10 benefits, and one demo candidate, with no duplicate records.

ESLint passed with zero warnings, strict TypeScript passed, all six Vitest tests passed, and the webpack production build completed. The GPT-6.1-sol review found no actionable M1 issues. It confirmed one M2 follow-up: create the demo candidate's hashed credential account before documenting working login credentials.

## M2: Candidate authentication, 2026-11-12

### Tool and fit

Codex implemented email and password authentication with Better Auth because it supplies maintained password hashing, secure cookie sessions, CSRF and origin checks, and database-backed throttling while fitting the existing Prisma schema. Codex used test-driven development for schemas, action behavior, seeded credentials, and the full auth lifecycle. A separate GPT-6.1-sol reviewer checked security, milestone scope, and Next.js 16 integration.

### Prompt

> [SUBMISSION EXAMPLE] okay now pushed
> we can move to next phase

The prompt advanced the approved milestone plan after M0 and M1 reached GitHub. `AGENTS.md` supplied the M2 boundary: signup, login, logout, protected routes, local database testing, milestone verification, documentation, and a stop before profile editing.

### Output

Codex added candidate signup, login, logout, and a protected dashboard. Better Auth uses the existing Prisma client, database-backed rate limiting, an 8–128 character password policy, trusted-origin checks, and secure session cookies. Signup provisions the candidate profile using the authenticated user ID; login and dashboard loading repair a missing profile idempotently.

The signup and login forms share Zod validation with their Server Actions. Emails are trimmed and lowercased, login failures use one generic message, and callback URLs accept local paths only. The seed now gives the reviewer account a hashed Better Auth credential:

- Email: `demo.candidate@example.com`
- Password: `JobSearchDemo123!`

The authentication layout fits desktop, laptop, and mobile viewports without page overflow at the tested sizes. Successful Server Actions redirect on the server, so auth navigation does not depend on client-side effects.

### Issues and debugging

The test runner initially could not reach local PostgreSQL because the execution sandbox blocked port 5432. Codex reran the integration test with local database permission and kept the test pointed at `jobsearch_test`.

Next.js 16 reported instant-navigation validation warnings when auth routes read `searchParams` or request headers. These routes depend on request data by design, so Codex marked them as blocking routes with `export const instant = false`. During browser testing, a client-side post-auth redirect proved sensitive to a development-origin hydration warning; moving successful redirects into Server Actions fixed the flow and made it work without client JavaScript. Browser testing also found stale logout pending state after a later login, so the logout control now uses form-scoped pending state.

Review found that direct `auth.api` mutations bypass Better Auth's router rate limiter. Server Actions now invoke the HTTP handler in-process with the original request headers and forward its session cookies, including deletion attributes. Shared Zod validation also runs before the public signup/login endpoints. The original user-create hook ran after Better Auth committed its transaction; explicit provisioning and login repair now allow recovery from a profile write failure. Regression tests cover these paths, callbacks that become protocol-relative after URL normalization, and rejection of unsafe test database overrides.

### Review and testing

Unit tests cover normalized signup and login input, password confirmation, auth environment validation, safe callback URLs, typed action results, logout failure handling, seeded password hashing, accessible form markup, and test database isolation. Integration tests against `jobsearch_test` cover the actual action service: signup, candidate profile provisioning and recovery, credential hashing, generic failed-login behavior, correct login, session retrieval, cookie attributes, logout, untrusted origins, and throttling after repeated failed attempts. Public endpoint tests cover invalid names and normalization.

Codex seeded the development database twice with unchanged counts, then verified anonymous dashboard redirects, new-account signup, logout, and seeded demo login in a browser. The signup page had no horizontal or vertical overflow at 1280×720, 1440×900, 390×844, and 390×667. All 53 Vitest tests, lint, strict TypeScript, and the production build pass. The focused GPT-6.1-sol re-review found no remaining critical or important blockers. The production dependency audit reported zero vulnerabilities. The sandbox blocked the build's TypeScript worker; the same build completed with the required process permission. Local browser checks use a consistent `localhost` origin so trusted-origin validation stays enabled.

### Scope and deployment notes

The user prioritised the three assignment flows and authorised commits and branch pushes through M6, with no real env files included. Profile editing and uploads remain M3, job discovery M4, and applications/status tracking M5. CI is planned for M6; Vercel deployment with Neon is M7. Database-backed throttling depends on the production proxy supplying trustworthy client IP headers; confirm that configuration during deployment.

## M3: Candidate profile and resume upload, 2026-11-12

### Tool and fit

Codex implemented the profile form, owner-scoped Prisma services, and UploadThing integration using the existing Next.js, Zod, and Vitest setup. The focus was the assignment's candidate flow. The user approved `uploadthing@7.7.4` and free-tier file storage after learning that file URLs are accessible to anyone holding them.

### Prompt

> [SUBMISSION EXAMPLE] okay move to next phase
> tell me what i need to paste in env

The prompt advanced the approved plan to M3 and requested setup guidance. Earlier instructions limited work to the three assignment requirements, local PostgreSQL for testing, Neon for production, and no real env files in Git. Codex supplied an env template with placeholders and step-by-step UploadThing setup guidance without requesting token values in chat.

### Output

The new `/profile` route edits name, headline, phone, location, country/time zone, experience, skills, bio, preferred markets, and work arrangements. A nested Prisma write saves name, profile fields, and skill selections together. Login identity determines which candidate can be read or changed; no client-supplied owner ID is used. Forms share Zod validation and retain entered values when validation fails.

The resume section accepts one PDF/DOC/DOCX up to 4 MB and supports viewing, replacement, and removal. UploadThing middleware authenticates and validates before upload, and its verified callback stores metadata. Existing application resume snapshots survive later profile changes. Uploading uses the browser SDK from the single approved package, avoiding server request-size limits and a separate React package. Profile editing remains available without an upload token.

### Issues and debugging

The existing seed uses UTC offsets such as `UTC-05:00`. A browser check exposed that a validator accepting only IANA time zones would block saving an otherwise valid demo profile. A regression test now covers the seed format alongside IANA zones. Focused review also caught a missing browser MIME type reaching UploadThing as `blob`; the client now supplies the validated document MIME type while preserving file content. The npm sandbox could not resolve the registry; the approved installation succeeded with network permission. Its audit reports one moderate and three high production package entries in the Effect dependency chain; M3 records this limitation without forcing an incompatible downgrade.

### Review and testing

All 88 tests, lint, strict TypeScript, and the production build pass. M3 tests cover profile constraints, invalid skills, owner-scoped mutations, database persistence, resume validation, upload middleware/callback behavior, and preservation of submitted resume snapshots. Browser verification confirmed editing and saving the demo profile, skills surviving reload, no horizontal overflow at 390px and 1280px, and anonymous profile access redirecting to login. Generated sample PDFs uploaded through the real UploadThing service, opened with HTTP 200 and the correct PDF content, and were replaced and removed through the profile controls. The focused reviewer found one MIME issue that Codex fixed with regression coverage; no other flow-blocking issues were reported.

## M4: Job discovery, 2026-11-12

### Tool and fit

Codex built and verified job discovery using the existing Next.js, Prisma, Zod, Tailwind, shadcn, and Vitest setup. GPT-6.1-sol provided a focused independent review. No dependencies or schema changes were needed.

### Prompt and constraints

> okay commit , push and move to next phase

The prompt authorised committing M3 and advancing the approved plan to M4. Context came from AGENTS.md, the design reference, and the existing 40-job seed. Earlier instructions prioritised assignment logic, local PostgreSQL, short feedback cycles, and keeping real environment files out of Git. The expected output was working search and filters with a responsive detail view; the stop condition was verified M4 completion before applications in M5.

### Output

Public `/jobs` and `/jobs/[slug]` routes provide keyword search across titles, companies and skills, plus location/country/time-zone search. Experience, company, job type, salary, market and benefit filters compose on the server. Zod normalises each URL parameter independently; invalid values fall back safely. Salary ranges overlap the job's advertised annual USD range. Pagination shows eight jobs per page, ordered by last update with a stable id tie-break, and redirects requests beyond the final page.

The UI follows the reference's teal hero, search bar, dropdown row, job cards, desktop detail panel and simple CTA/footer. Mobile cards open their own detail page. URLs preserve filters during selection, pagination, reload and Back navigation. Only filter and navigation controls are client components. Active-job queries select only display fields; database access remains outside components. Loading, empty, error and missing-job states are present. Home, dashboard and candidate navigation now link to discovery.

### Issues and debugging

Browser inspection found that seeded locations already included their country, producing repeated text such as “Sydney, Australia, Australia.” A shared formatter fixes this, with regression coverage for full locations, city-only locations and remote regions. Visual review also found inherited white text on the light logout button; its wrapper now restores the foreground colour.

The first production build exposed an undersized local auth secret. At the user's explicit request, Codex ran a local script to generate a random replacement and update only that setting in `.env`, preserving other settings without displaying values. Git ignore checks confirmed that `.env` stayed untracked. The build then passed with the local configuration.

### Review and testing

All 112 Vitest tests, lint, strict TypeScript and the production build pass. M4 coverage includes URL validation, combined filter mapping, literal wildcard searches, salary overlap, URL preservation, pagination bounds and location formatting. Real PostgreSQL tests in the dedicated `jobsearch_test` database verify combined filters, title/company/skill and time-zone searches, stable pagination, out-of-range pages, active-only details and filter choices. Tests clean up their own fixtures.

Browser checks confirmed anonymous discovery, React skill search, the React + Senior combination, empty results, filter persistence after reload, desktop selection and browser Back, pagination with a retained job-type filter, and mobile detail/back navigation. The 390px and 1280px layouts had no horizontal overflow. The focused review found no remaining functional blockers, and the checked browser route reported no console warnings or errors.

### Milestone boundary

M4 completes discovery. Applying, match scoring, the shared match badge and simulated status timelines remain M5. CI remains M6; deployment with Neon remains M7. Existing UploadThing dependency advisories remain documented rather than expanding M4 into unrelated changes.

## M5: Applications, matching, and simulated tracking, 2026-11-12

### Tool and fit

Codex implemented the application service, pure matching/status rules, Server Action, and candidate dashboard. The existing TypeScript, Prisma, and Vitest setup let Codex test business rules and actual PostgreSQL transactions without adding packages. GPT-6.1-sol reviewed the implementation and its concurrency fix.

### Prompt and constraints

> okay continue next part

This prompt advanced the approved milestone plan from M4 to M5. AGENTS.md supplied the application requirements; earlier instructions authorised branch commits and pushes through M6, prioritised the three assignment flows, and required local PostgreSQL for testing. The expected output was an end-to-end application flow with honest simulated tracking. The stop condition was a verified, pushed M5 before M6.

Codex proposed keeping scores below 90% under review and a 70/20/5/5 weighting. The user confirmed: “Keep below 90% under review (Recommended).”

### Output and decisions

Candidates can apply from a job detail panel or page. The server authenticates the candidate, validates the job id, checks that the job is active and a resume exists, then stores a resume snapshot, computed score and initial event in one transaction. The existing database unique constraint blocks repeated applications, including concurrent submissions. A profile-row lock coordinates submission with resume replacement/removal. Job pages show login, missing-resume, pending, error and already-applied states.

The pure match function gives 70 points times the fraction of required skills matched, 20 for meeting/exceeding the required experience or 10 for one level below, 5 for the same country or explicitly worldwide remote work, and 5 for a preferred market match. It rounds the sum to a whole percentage and gives no skill points when no required skills are listed. Job badges and submitted applications use this same function; submitted scores remain fixed after profile changes.

The pure status function advances qualifying applications through Applied, Under review, Shortlisted and Interview scheduled. Scores below 90 stay under review. `DEMO_STATUS_DELAY_SECONDS` sets each delay; the code defaults to 30 seconds. The appointment is fixed from the application id at four to six days after submission. Page reads persist due transitions and missing events atomically; a conditional update prevents older requests from moving status backwards, and a unique event constraint prevents duplicates. A small client timer refreshes at the next due transition. No queue, cron job, external ATS, or real meeting is involved.

The dashboard lists six owned applications per page with timelines. The application detail page shows the submitted resume and simulation notes. Reads and mutations scope ownership to the session user. The implementation adds loading, empty, unavailable and error states, plus profile-match badges on job cards.

### Issues and debugging

The focused review found a race between refreshes targeting different stages: if an earlier request advanced to Under review after a later request had read Applied, an exact-status conditional update could leave the later request behind. Codex reproduced this with a PostgreSQL integration test that interleaves the earlier transaction between the later read and write. The test failed with Under review instead of Interview scheduled. The fix accepts any earlier status in the derived timeline while still preventing regression; the test then passed and the reviewer confirmed the fix.

Type checking also caught an environment-parser test signature that unnecessarily required `NODE_ENV`. The simulation parser now accepts a record of environment names and values, validating only its own setting.

### Review and testing

All 154 tests, lint, strict TypeScript and the production build pass. Coverage includes score weighting and the exact 90% boundary, configurable timing, deterministic interviews, skipped transitions, invalid input, session ownership, missing resumes, closed jobs, duplicate/concurrent application submissions, resume snapshot retention, concurrent refreshes, and pagination. Database tests use `jobsearch_test` and remove their own fixtures.

Browser verification used a separate test candidate and a generated sample PDF, leaving the user's demo profile and resume intact. Signup, profile save, missing-resume guidance, actual UploadThing upload, and application submission worked. A 100% MediSpring application progressed automatically through all four stages with the local 60-second delay; a 25% WellNest application stayed under review. The submitted PDF returned HTTP 200 with valid PDF content. Returning to the job showed View application, and the list displayed the same 100% match badge. Anonymous application access redirected to login; another candidate saw Application not found without a timeline or resume. The dashboard showed both applications, and the application/dashboard pages had no horizontal overflow at 390px. Desktop rendering at 1280px and browser console checks also passed.

### Milestone boundary

The three assignment flows now work locally. M6 remains the final review, accessibility/responsive checks, remaining test gaps, README polish and CI. M7 covers deployment to Vercel with Neon and the deployed demo check.

## M6: Verification, accessibility, and CI, 2026-11-12

### Tool and fit

Codex used Chrome DevTools for real browser flows, responsive checks, Lighthouse snapshots, network/console inspection, and a performance trace. Vitest, ESLint, TypeScript, the Next.js production build, and PostgreSQL supplied repeatable code and data checks. GPT-6.1-sol performed the final focused review.

### Prompt and constraints

> [SUBMISSION EXAMPLE] okay do the testing in all way with chrome devtool and dont ask permission for dev testing

The prompt authorised broad local development testing. Earlier instructions limited scope to registration/login/profile, job discovery, and applications/status tracking; authorised commit and push through M6; required local PostgreSQL for tests and Neon only for production; and prohibited secrets in Git. The stop condition was a reviewed, documented, verified, pushed M6 before deployment.

### Output and decisions

GitHub Actions now starts PostgreSQL 17, creates isolated development and test databases, installs the locked dependency tree, generates Prisma, deploys migrations, seeds fixtures, and runs lint, typecheck, all tests, and the production build. The workflow uses fixture-only environment values and grants read-only repository permissions.

The app now sends basic browser security headers. Authentication failures retain non-secret form values and move focus to the first field error or generic alert. Profile saves prevent React's native Action reset from clearing controlled selects and checkboxes. Standalone job details use a sequential h1/h2 heading structure, while the desktop detail pane keeps its h2/h3 structure. Regression tests cover the authentication result values and both job-detail heading modes.

### Issues and debugging

Chrome reproduced an authentication bug: a failed Action submission cleared the name and email because React resets uncontrolled fields after a resolved form Action. The Action now returns bounded name/email values without passwords, the inputs use those values as defaults, and an effect restores useful error focus.

Profile saves had a related visual reset. PostgreSQL stored the selected experience, skills, and market, but React reset the native controls immediately after the successful Action. Preventing the form reset keeps the controlled state on screen; reload confirmed that the saved database state matches it.

Lighthouse found skipped heading levels on standalone job detail pages. The shared detail component now chooses section heading levels from its page context. The fixed mobile page scores 100 in the Lighthouse accessibility snapshot.

The first local production upload test reported client completion without a saved profile file because UploadThing's production callback cannot reach localhost. Codex reran the journey on Next.js development mode, which uses UploadThing's supported development callback relay. Real upload, replacement, removal, and application snapshot retention then completed successfully.

### Review and testing

All 156 tests in 28 files pass. ESLint reports zero warnings, strict TypeScript passes, and the production build completes. Browser testing covered invalid and valid authentication, protected redirects, profile validation/save/reload, skill search/deselection, file validation, real UploadThing operations, combined and empty job searches, pagination and Back behavior, missing jobs, successful and duplicate applications, ownership, snapshot retention, and lazy status progression through interview.

The tested pages had no horizontal overflow at 320, 390, 768, or 1280 pixels. Lighthouse snapshots scored 100 across accessibility, best practices, SEO, and agentic browsing on jobs, profile, and the fixed detail page. A cold local development trace measured 1.31-second LCP and 0.00 CLS. Console and first-party network checks were clean on the critical journey. `docs/QA_REPORT.md` records evidence and limits, including the lack of a committed screenshot baseline and the existing UploadThing/Effect audit advisories.

### Milestone boundary

M6 completes local hardening and CI. M7 remains deployment with Neon and production environment variables, followed by the deployed demo check and final submission links.

## Post-M6: Resume upload modal on job pages, 2026-11-13

### Tool and fit

Codex reused the existing UploadThing flow and native dialog component. Chrome DevTools checked real uploads and profile persistence; Vitest, ESLint, TypeScript and the production build checked the code. The installed React best-practices, web-design-guidelines and stop-slop skills guided the component and copy review.

### Prompt and constraints

> when the upload resume clicked , the pop up should come and then it will be easy to upload, updated resume make that modal to upload the resume and it should updated in profile as well

> http://localhost:3000/jobs/learnly-frontend-engineer in this type of pages

The user supplied the job-detail context, requested an upload/update dialog, and required the same file to update the profile. Earlier instructions authorised local browser testing, required local PostgreSQL for testing and Neon for production, and prohibited secrets in Git. The stop condition was a verified resume dialog; this follow-up did not authorise a commit or push.

### Output and decisions

The shared application panel now opens Upload resume or Update resume in a dialog on job pages. The dialog shows the current file, accepts PDF/DOC/DOCX up to 4 MB, displays validation and upload progress, and confirms a saved upload. A shared upload form serves both this dialog and the profile page. The authenticated UploadThing callback still saves the profile file and retains resumes referenced by existing applications; it now invalidates job pages alongside the profile. A router refresh displays the new resume for the next application.

### Issues and review

The uploader sits outside the application form to avoid nested forms. Each uploader uses a unique input id; invalid submissions focus the file input. Success requires UploadThing's server response so the client cannot report completion before the callback saves the profile. The dialog prevents dismissal during upload. First uploads refresh the missing-resume panel into the application form; replacements retain the dialog's confirmation until Done. Review found no remaining blockers for this request. The earlier Greenhouse-inspired redesign remains a separate paused work item with its broader QA unfinished.

### Verification and manual check

All 158 tests in 29 files pass; lint, strict typecheck, the production build and Git whitespace checks pass. The UploadThing route test now asserts invalidation of both profile and job routes. Existing integration tests continue to verify ownership and submitted-resume snapshot retention.

Chrome testing used a separate QA candidate and synthetic files. Empty selection and an unsupported file showed errors. A real first upload enabled Apply now on the Learnly job page; a replacement updated the displayed application filename and persisted after opening the profile. The modal fit 320px and 390px viewports without horizontal overflow. Escape closed the dialog and returned focus to Update resume. The page contained no nested forms, and console checks reported no warnings or errors. The user's demo candidate and resume were preserved.

To check manually, log in, open a job you have not applied to, choose Upload resume or Update resume, upload a supported file, and open Profile. Both pages should show that file; existing applications should retain their submitted resume.

## Post-M6: Developer jobs, compact discovery and AI profile suggestions, 2026-11-13

### Tool and prompt

Codex used Next.js Server Actions, Prisma, Zod and Vitest without a new dependency. Groq's free API drafts profile text through server-side `fetch`. The user watched the live flow in a visible Chrome debugging window. The installed React best-practices, web-design-guidelines and stop-slop skills guided review.

> first we will add like Web Developer, Front end Developer, Backend developer, job at least 5

> the ai should ask do you know this skill, if said no, then we will not add that skill and make the better profile for the user

> website looks very large

The user confirmed “Replace Benefits with Profile match” and asked to include software-engineering and other related roles. These requests authorised optional AI profile suggestions beyond the original assignment. The expected output was five developer jobs, a smaller layout, role/profile filtering and a reviewed AI draft. Testing stayed on local PostgreSQL, and no commit or push was requested.

### Output and decisions

The seed provides 45 jobs, adding Web Developer, Frontend Developer, Backend Developer, Software Engineer and Full Stack Developer. The `--jobs-only` option preserves the demo candidate's edited profile. The jobs hero, header, card and detail spacing are smaller. Profile match offers developer, design, data and product roles, plus Matches my profile (70%+) for signed-in candidates. URL filters use the existing pure score before pagination so counts and later pages agree. Existing Benefits URLs still work.

Candidates open Improve profile with AI from a job or select a preferred job on Profile. The server asks Yes/No for required skills missing from the session candidate's saved profile, then sends the headline, bio, experience and confirmed skill names to Groq. It omits contact data and resume files. No answers remain learning suggestions. The candidate edits/reviews the draft and chooses Save profile improvements; the server changes only headline, bio and confirmed skills. Revision checks reject stale drafts, and existing application scores/resumes stay unchanged.

### Issues and review

The first real Groq response for an empty QA profile invented graduation and personal projects. Codex strengthened the prompt, added checks for common unsupported education, project, certification and leadership claims, and retries once on generated validation failures. The next response used only the confirmed skills and interest in an entry-level role. Denied skill names are checked in generated/edited text and excluded from saved skills. A regression test covers the live finding. These checks reduce errors; candidates must still review model text because the checks cannot prove every statement.

Codex completed the paused detail-component integration and isolated Server Actions in component tests. The review checked validation, session ownership, errors, unique labels, native radio/button semantics, atomic writes and preservation of other profile fields. Browser checks measured actual mobile dimensions.

### Verification

All 190 tests in 33 files, lint, strict typecheck and the final production build pass. New coverage includes complete/duplicate/forged skill answers, denied skills, quota/invalid output, authentication, stale revisions, owner-scoped atomic saves, retained resume/profile fields, role filtering and matches before pagination. The jobs-only seed created 45 local jobs; the user's demo profile and resume were preserved. `.env` remains ignored by Git.

Visible Chrome testing used a separate QA candidate. For Learnly Frontend Developer, Yes answers covered React/TypeScript and No answers covered Next.js/Vitest. Groq produced a corrected draft; saving and reloading Profile retained only the confirmed skills and the existing resume. The job score rose from 10% to 50%; the 70% filter correctly showed an empty result. Backend Developer returned two roles; Web Developer returned its new job. The preferred-job picker listed 45 jobs. The popup fit 320px/390px without horizontal overflow, and mobile discovery fit 390px. Console checks on the inspected discovery route were clean.

Manual check: choose a developer role, open its job, choose Improve profile with AI, answer each skill question, review/edit and save. Open Profile to confirm the text and Yes skills; use Matches my profile to see the updated scores. Free API quota and model availability remain provider limits; manual editing works without AI setup.

## Post-M6: Navigation caching, pagination and motion, 2026-11-14

### Tool and prompt

Codex used the installed Next.js 16.4.6 documentation, Vercel React performance guidance, web interface guidelines and stop-slop. Vitest checked regressions; a Chrome debugging script tested the production build in a visible window without an additional browser-testing dependency.

> can you add cache or some optimization for this so that i cant see that loading each time when i change route

> when i click on next page from pagination i am getting this whole page reload, fix this as well

> add some loading and little animation for the site , so looks real smooth

The user required smoother route changes, pagination without a page flash, and modest loading feedback. Existing constraints kept testing on local PostgreSQL, preserved candidate/application freshness, and required approval for dependencies and publication. The stop condition was a verified navigation fix.

### Output and decisions

Recent dynamic page visits remain in the browser router cache for 30 seconds. Public job pages/details, filter options, skills and AI job choices use Next.js's minutes cache profile: a one-minute server revalidation interval and five-minute cached-content stale time. Session reads deduplicate within a request; profile, resume and application data retain their existing ownership checks and request-time queries. Removing a resume also invalidates job application panels. Status persistence waits for navigation, so link prefetches do not advance applications.

The jobs route now places its browser component behind an unkeyed Suspense boundary. Pagination preserves the document scroll position and prefetches linked pages. The search form retains its identity across pagination; keyword/filter changes use a transition with a Searching… state. A delayed thin progress bar indicates navigation that takes time. Page skeletons, brief content fades and a dialog entrance use CSS; reduced-motion preferences disable the new motion. No dependency was added.

### Review and verification

All 195 tests in 35 files pass, along with lint, strict typecheck, the production build and Git whitespace checks. Regression tests cover pagination filters, cleared job selection, pending feedback and resume-removal invalidation. Existing suites cover authentication, profile ownership, duplicate applications, resume snapshots, job filtering, matching and the 90% status rule.

Visible Chrome tested the local production build at port 3002 with a separate QA candidate. Under 450ms network latency, pagination retained the header node and scroll position at 240px, displayed progress and showed no page skeleton or document request. Returning to visited pages produced no RSC requests. Browser Back, React keyword search and Frontend Developer filtering worked. Warm Profile and Jobs navigation avoided the loading screen; a first visit can still show its skeleton.

A profile headline save appeared after navigating away and back. Applying created a QA application, updated the dashboard and replaced Apply now with View application. The below-90% timeline refreshed to Under review and retained its submitted resume. Logout returned to login, and a protected profile visit required authentication. The resume modal retained its upload input, animated on opening, closed with Escape and contained no nested forms. At 390px there was no horizontal overflow; reduced motion yielded no main animation and normal scrolling. The user's candidate/resume and env secrets were preserved. No commit or push was requested.

Manual check: open Jobs, scroll to pagination, choose Next and Previous, then use Back. The page should keep its position and update the cards/detail. Search or change a filter to see pending feedback. Save Profile, return through Jobs, and confirm the edit; apply and check Applications. Cold visits and expired caches can still load, and development mode includes compiler overhead with less prefetching than production.

## Post-M6: GitHub publication verification, 2026-11-14

Codex reviewed the accumulated interface, resume upload, developer job, AI profile and navigation updates for publication. The user's initial prompt was “push all the things to github and i wanna see deployed version of this project.” The user then narrowed the task: “no need i will do it / you just push to github.” The final scope is to commit and push the existing work; the user will handle deployment.

Fresh verification passed: lint with zero warnings, strict TypeScript, all 195 tests in 35 files, the production build, and Git whitespace checks. Review covered session caching, candidate ownership, AI draft validation and atomic saves, resume invalidation, and job filtering. A credential-pattern scan of publishable files found no matches; `.env.example` is the only environment file eligible for Git. Existing browser verification is recorded in the preceding entries and `docs/QA_REPORT.md`.

No application code or dependencies were added during publication verification. No hosted application or database was created. M7 deployment remains with the user; this entry does not claim a live demo is available.
