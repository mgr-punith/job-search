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
