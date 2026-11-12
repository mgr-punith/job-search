# AGENTS.md - JobSearch (Candidate Job Portal)

Instructions for Codex. Read this whole file before doing anything.
The human's instructions in the current chat override this file only when they say so explicitly.

You are acting as a senior full-stack software architect and engineer.

---

## 1. Project

JobSearch is a candidate-facing job platform, built as a 48-hour technical assignment for Jobs Territory
(which already runs a CRM and ATS). Scope is intentionally small: **one role (Candidate)** and the three
requirements below. Clarity, correctness and explainability matter more than breadth.

### Assignment requirements (source of truth)

1. Candidate registration, login, and profile management.
2. Job listings with search and filters.
3. Job application and application status tracking.

### What the submission must include

- A working deployed demo link.
- 2-3 examples of AI prompts used during development.
- A short explanation of the AI-assisted approach: which tool and why, how prompts were structured,
  how the app was built and debugged with AI, how AI-generated code was reviewed and tested.

Because of the last two points, keep `docs/AI_WORKFLOW.md` up to date as you work (see section 10).

### Reference files (if present in the repo)

- `docs/assignment/Technical_Assignment.pdf` - the original brief.
- `docs/design/jobsearch-ui.png` - UI reference (summarised in section 5).

---

## 2. Fixed tech stack

Do not swap or add to this without asking.

- Next.js (App Router) + TypeScript (strict mode)
- Tailwind CSS + shadcn/ui
- Zod for all validation
- PostgreSQL + Prisma
- Vitest for tests
- UploadThing for resume uploads
- Email + password authentication (signup / login / logout). The auth library is **not decided yet**:
  propose one in the plan with trade-offs (for example Auth.js credentials, Better Auth, or a minimal
  hand-rolled session using a maintained hashing library). Prefer the option with the fewest dependencies
  that is still secure.

Before using any framework API, check the **installed** version of Next.js / Prisma / Tailwind / shadcn and
the current official docs. Do not assume older patterns (async `params`/`searchParams`, middleware vs proxy
file convention, Prisma client setup and driver adapters, and so on).

---

## 3. Working agreement (most important section)

### Phase 0 - Inspect (read-only)

Inspect the existing project first: file tree, `package.json`, configs, existing code, Prisma schema,
env files (names only, never values), `git status`. Report what exists and what is missing.

### Phase 1 - Plan (no code)

Deliver exactly these seven items, then **stop and wait** for the human to reply `APPROVED`:

1. Architecture overview
2. Folder structure
3. Database schema design (models, enums, relations, indexes, unique constraints)
4. API and server action requirements (inputs, outputs, auth rules, error cases)
5. Development milestones (with a rough time estimate against the 48h limit)
6. Potential security concerns and mitigations
7. Testing strategy

Also include: open questions with a recommended default for each, the auth library recommendation, and a
list of design items deliberately excluded (section 5).

**Until the plan is approved: do not modify, create or delete any file, and do not write implementation code.**

### Phase 2 - Build, one milestone at a time

- Build step by step. Never one-shot the application.
- After each milestone run `lint`, `typecheck` and `test`, then report: files changed, decisions made,
  how to verify manually, and anything left unresolved.
- Add the milestone entry to `docs/AI_WORKFLOW.md`.
- **Stop and wait** for the human to say to proceed to the next milestone.

### Hard rules

- No new dependency without asking first. State the package, why it is needed, and the alternative.
- No features outside the requirements (see section 11).
- Do not `git commit` or `git push` unless asked.
- Never read, print or write real secrets. Maintain `.env.example` with placeholder values only.
- Do not install skills yourself; the human installs them (section 9).
- If something is ambiguous, ask once, in a single message, with a recommended default.
- Prefer small, reviewable diffs. Do not refactor unrelated code.

---

## 4. Product behaviour

### Candidate account and profile

- Signup (name, email, password), login, logout. Protected routes redirect unauthenticated users to login.
- Profile management: headline, phone, location, years of experience, experience level, skills, short bio,
  resume upload (PDF/DOC/DOCX). The plan may propose a few more fields only if the matching logic needs them.
- Email is normalised (trim, lowercase) and unique.

### Job discovery

- Job list with keyword search (title, company, skills), location / time zone search, and filters:
  experience level, company, job type, salary range, market, benefits (mirrors the design).
- Server-side filtering and pagination, driven by URL search params (shareable, back-button friendly).
  Validate search params with Zod too.
- Sort by last updated. Job detail view with the sections shown in the design.
- Seed 30-50 realistic jobs with `prisma/seed.ts` (varied companies, types, levels, salaries, skills).
  Seed one demo candidate for reviewers; document its credentials in the README.

### Applications and status tracking (simulated ATS)

- A candidate can apply to a job once (enforced by a database unique constraint, not only in code).
- The application stores a snapshot of the resume URL/key at submission time.
- The candidate dashboard lists their applications with current status and a status timeline.
- Candidates can only ever see their own profile and applications.

### Dummy auto-tracking (explicit requirement)

Status tracking is **simulated** - there is no real recruiter. Rules (thresholds live in one constants file):

- On apply, compute `matchScore` (0-100) with a pure function `computeMatchScore(candidate, job)`
  (skills overlap carries most of the weight; experience level and location/market fit carry the rest).
  The plan must propose the exact formula and weights.
- `matchScore >= 90` -> `APPLIED` -> `UNDER_REVIEW` -> `SHORTLISTED` -> `INTERVIEW_SCHEDULED`,
  with an `interviewAt` date a few days in the future (deterministic from the application id).
- `matchScore < 90` -> stays in `UNDER_REVIEW`, or ends in a "not selected" status below a lower
  threshold. The plan should recommend which and ask the human to confirm.
- **No cron jobs, queues or extra infrastructure.** Advance status lazily: a pure function
  `deriveStatus(application, now)` maps elapsed time since `appliedAt` to a status; when the dashboard or
  application page is loaded, persist any new transitions idempotently and write an
  `ApplicationStatusEvent` row for each.
- Delays are configurable (for example `DEMO_STATUS_DELAY_SECONDS`) so a reviewer sees progress within
  minutes instead of days.
- The UI shows a small note that status updates are simulated for this demo.
- The same `computeMatchScore` powers the "Your profile matches this job" badge in the job list.

---

## 5. Design reference

Layout seen in `docs/design/jobsearch-ui.png`: hero with title and a search bar (keyword + country/time
zone, Clear and Search buttons), a row of filter dropdowns (Experience Level, Company, Job types, Salary,
Markets, Benefits), then a two-pane layout: left, a scrollable list of job cards (logo, title, company,
badge such as "Your profile matches this job" or "Actively recruiting", tags such as Full Time / Remote /
Senior Level, posted time); right, a sticky job detail panel (title, company, location, posted time,
employment type, company size, salary range, skills, Apply now, About the job, Responsibilities, Ideal
Profile, What's on Offer). Below: a call-to-action banner and a footer.

Rules:

- Match the visual style closely using shadcn/ui and Tailwind. Make it responsive: on mobile, the job
  detail becomes its own page or sheet instead of a side pane.
- The design contains placeholder inconsistencies (for example a "Senior Product Manager" post whose text
  describes a UI/UX Designer at a different company, "1 hour age posted", "aboutits"). Do not copy that
  text. Use coherent seeded data and correct copy.
- **Excluded by default (not in requirements):** Save job, Repost jobs, Company reviews, Find Salaries and
  Community navigation, notification bell, newsletter email input, social links. List them in the plan
  under "Design items deliberately excluded" so the human can opt in to any of them.
- Keep the footer and CTA banner simple and honest: no links to pages that do not exist.

---

## 6. Architecture conventions

- Server Components by default. Add `"use client"` only to interactive leaf components (filter controls,
  forms, upload button).
- Mutations use Server Actions. Route Handlers only where a library requires them (UploadThing, and the
  auth library if needed). Search and filters need no API: read `searchParams` in Server Components.
- Feature-based structure (final layout is proposed in the plan):

  ```
  src/
    app/                      routes only; thin pages that compose feature components
    components/ui/            shadcn primitives
    components/shared/        reusable app components (JobCard, StatusBadge, FormField, EmptyState, ...)
    features/
      auth/ profile/ jobs/ applications/
        components/ actions/ queries/ schemas/ services/   (+ colocated *.test.ts)
    lib/                      db (Prisma singleton), env validation, auth helpers, utils
  prisma/                     schema.prisma, migrations, seed.ts
  docs/
  ```

- Every server action follows the same pipeline: **authenticate -> authorize (ownership) -> Zod
  `safeParse` -> service call -> typed result**. Return a discriminated result such as
  `{ ok: true, data } | { ok: false, error, fieldErrors? }`. Never leak raw errors or stack traces to the client.
- Zod schemas are shared by client forms and server actions. Validate environment variables in `lib/env.ts`.
- Database access lives in feature `queries/` or `services/`, never inside components. Use `select` for only
  the fields needed, paginate every list, and index columns used by filters and joins.
- Business rules (match score, status derivation, filter-to-Prisma mapping) are pure functions so they are
  trivially unit-testable.
- TypeScript strict. No `any`. No unexplained non-null assertions. No dead code or commented-out blocks.
- Reuse components; do not duplicate markup. Every data view has loading, empty and error states.
- Accessibility basics: labels on all inputs, keyboard navigable filters, visible focus, sensible contrast.
- Comments explain *why*, not *what*.

---

## 7. Security baseline

- Passwords: hash with a maintained algorithm (argon2id or bcrypt) or via the chosen auth library. Never
  log or return password data. Use generic login error messages (no account enumeration).
- Sessions: httpOnly, secure, sameSite cookies. Validate any post-login redirect target (no open redirects).
- Authorisation on every mutation and every read of user data (prevent IDOR): scope queries by the
  session user id.
- Validate all input with Zod: forms, actions, URL search params, and upload metadata.
- Prisma only; no raw SQL built from user input.
- Uploads: UploadThing middleware must require an authenticated session; restrict to PDF/DOC/DOCX and a
  max size (propose, for example 4 MB); store the file key alongside the URL; verify ownership before
  delete/replace.
- Duplicate applications prevented by a DB unique constraint on (userId, jobId).
- Secrets only in env vars, never exposed to client bundles; no PII in logs.
- Auth endpoints need brute-force protection. Propose a solution in the plan and be honest about limits
  (in-memory rate limiting is unreliable on serverless).
- Add sensible security headers. Keep dependencies minimal and note any audit findings.

---

## 8. Testing strategy (Vitest)

Priorities, in order:

1. Pure business logic: `computeMatchScore`, `deriveStatus` (including thresholds and the 90% rule),
   filter-to-query mapping.
2. Zod schemas: valid input, invalid input, edge cases (empty strings, whitespace, oversized values).
3. Server actions / services: auth required, ownership enforced, duplicate application rejected,
   validation errors returned in the expected shape. Use a mocked Prisma client or a dedicated test
   database; the plan chooses and justifies one.
4. A small number of component tests only where there is real logic (for example filter state).

Rules:

- Tests live next to the code they cover.
- Every bug fix gets a regression test.
- No end-to-end framework unless the human approves the extra dependency. Provide a manual verification
  checklist per milestone instead.
- Expected scripts in `package.json`: `dev`, `build`, `lint`, `typecheck`, `test`, `db:migrate`, `db:seed`.
- Review your own generated code before reporting: remove unused code, check error paths, confirm
  validation and authorisation are present.

---

## 9. Skills (from https://www.skills.sh/)

The human installs these with `npx skills add <owner/repo>`. Read the matching skill **before** working in
that area. If a skill conflicts with this file or with the human's instructions, this file and the human win.

| Area | Skill (repo) |
| --- | --- |
| Planning phase | `writing-plans` (obra/superpowers) |
| Next.js / React quality | `vercel-react-best-practices`, `vercel-composition-patterns` (vercel-labs/agent-skills) |
| UI components | `shadcn` (shadcn/ui) |
| UI review (accessibility, UX) | `web-design-guidelines` (vercel-labs/agent-skills) |
| Prisma schema, client, migrations | `prisma-client-api`, `prisma-database-setup`, `prisma-cli` (prisma/skills) |
| Writing tests | `test-driven-development` (obra/superpowers) |
| Debugging | `systematic-debugging` (obra/superpowers) |
| Before reporting a milestone done | `verification-before-completion` (obra/superpowers) |
| Self-review before handoff | `requesting-code-review` (obra/superpowers) |

---

## 10. Documentation to maintain

### `docs/AI_WORKFLOW.md`

After every milestone, append an entry with:

- Milestone and date
- AI tool used (Codex) and why it fit this task
- The prompt used (verbatim; shorten only if very long) and how it was structured (context, constraints,
  expected output, stop condition)
- What the AI produced
- Issues or bugs found, and how they were debugged and fixed with AI
- How the output was reviewed and how it was tested

Mark the 2-3 best prompts with `[SUBMISSION EXAMPLE]` so they are easy to copy into the submission email.

### `README.md` (finalise in the last milestone)

Setup steps, env vars (names and purpose), database and seed commands, demo credentials, a short demo
script, deployment notes, key decisions and known limitations.

---

## 11. Out of scope (do not build unless the human explicitly approves)

Employer / recruiter / admin roles, saved jobs, reposting jobs, company reviews, salary explorer, community
features, notifications, email sending, email verification, password reset, OAuth / social login,
real ATS or CRM integration, real AI-powered matching, chat, payments, job-alert subscriptions,
internationalisation, dark mode, analytics.

---

## 12. Milestones (default proposal; refine in the plan)

| # | Milestone | Done when |
| --- | --- | --- |
| M0 | Tooling: Next.js, strict TS, Tailwind, shadcn init, Prisma + Postgres connection, env validation, Vitest, scripts | `lint`, `typecheck`, `test`, `build` all pass on an empty app |
| M1 | Schema, migration, seed | Migration applies cleanly; seed creates jobs and a demo candidate |
| M2 | Auth: signup, login, logout, route protection | Auth flows work; schemas and actions tested |
| M3 | Profile management and resume upload | Profile saves with validation; resume uploads and is retrievable by its owner only |
| M4 | Job listings: search, filters, pagination, detail | Filters are URL-driven and tested; matches the design |
| M5 | Applications, match score, simulated status engine, dashboard with timeline | 90% rule verified by tests; duplicate apply blocked |
| M6 | Hardening: security review, accessibility and responsive pass, test gaps, README | Checklist in section 7 reviewed item by item |
| M7 | Deploy, demo link, finalise `docs/AI_WORKFLOW.md` | Demo works end to end on the deployed URL |

Definition of done for every milestone: it builds, lints, type-checks, tests pass, it was manually
verified, `docs/AI_WORKFLOW.md` is updated, and the human has been told how to verify it.
