# JobSearch

Candidate job portal built with Next.js App Router, TypeScript, Tailwind, shadcn/ui, Prisma, PostgreSQL, and Better Auth.

M2 is complete: registration, login, logout, and a protected dashboard. Profile management, job discovery, and applications are the next milestones.

## Local setup

Use Node.js 24 or newer and Docker Compose.

1. Run `npm ci`.
2. Copy `.env.example` to `.env` locally and replace the auth secret placeholder with a random value of at least 32 characters. Keep this file untracked.
3. Run `docker compose up -d`.
4. Run `npm run db:migrate` and `npm run db:seed`.
5. Run `npm run dev` and open `http://localhost:3000`.

`DATABASE_URL` connects to local PostgreSQL for development. `TEST_DATABASE_URL` must use the dedicated local `jobsearch_test` database. `BETTER_AUTH_SECRET` signs sessions; `BETTER_AUTH_URL` must match the browser's origin exactly, including the port. `DEMO_STATUS_DELAY_SECONDS` configures the later simulated status engine.

## Demo account

The seed creates a public reviewer fixture:

- Email: `demo.candidate@example.com`
- Password: `JobSearchDemo123!`

The database stores only the password hash. The seed can be run again without duplicating jobs or the demo account.

## Verify authentication

Open `/dashboard` while logged out: it redirects to login. Create an account at `/signup`, confirm the welcome screen, log out, and log in again. Try an incorrect password and confirm the generic error. The demo account also works after seeding.

Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`. Before the first database test run, apply migrations to the test database:

```sh
DATABASE_URL='postgresql://postgres:postgres@127.0.0.1:5432/jobsearch_test?schema=public' npx prisma migrate deploy
```

Development uses Turbopack. Production builds use Next.js's webpack option because of local worker restrictions. No end-to-end test dependency is required.

## Deployment

Deployment is planned for M7. Set the Neon PostgreSQL URL and a unique production auth secret in the hosting environment, with `BETTER_AUTH_URL` set to the HTTPS demo origin. Apply migrations before starting the app. Never commit real `.env` files. Verify the hosting proxy's client IP headers for database-backed authentication throttling. CI is planned for M6.

AI prompts, decisions, and validation are recorded in [docs/AI_WORKFLOW.md](docs/AI_WORKFLOW.md).
