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
