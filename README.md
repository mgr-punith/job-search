# JobSearch

Candidate job portal built with Next.js App Router, TypeScript, Tailwind, shadcn/ui, Prisma, PostgreSQL, and Better Auth.

Registration, login, logout, profile editing, skill selection, resume uploads, and job discovery are implemented. Applications and simulated status tracking are next in M5.

## Local setup

Use Node.js 24 or newer and Docker Compose.

1. Run `npm ci`.
2. Copy `.env.example` to `.env` locally and replace the auth secret placeholder with a random value of at least 32 characters. Keep this file untracked.
3. Run `docker compose up -d`.
4. Run `npm run db:migrate` and `npm run db:seed`.
5. Run `npm run dev` and open `http://localhost:3000`.

`DATABASE_URL` connects to local PostgreSQL for development. `TEST_DATABASE_URL` must use the dedicated local `jobsearch_test` database. `BETTER_AUTH_SECRET` signs sessions; `BETTER_AUTH_URL` must match the browser's origin exactly, including the port. `UPLOADTHING_TOKEN` enables resume storage. `DEMO_STATUS_DELAY_SECONDS` configures the later simulated status engine.

## Resume upload setup

1. Sign in at [UploadThing](https://uploadthing.com/dashboard) and create a JobSearch app on the free plan.
2. Open the app's **API Keys** page and copy its `UPLOADTHING_TOKEN`.
3. Set `UPLOADTHING_TOKEN` in your local `.env` and restart `npm run dev`. Keep `.env.example` as placeholders.
4. Log in, open **My profile**, and upload a PDF, DOC or DOCX up to 4 MB.

Uploads run directly from the browser to UploadThing. The authenticated upload callback saves the file metadata against the candidate. Profile editing also works when uploads are not configured. Replacing/removing a resume keeps copies already attached to applications.

The assignment uses UploadThing's free tier by explicit choice: the app restricts resume controls to the owner, but anyone holding a file URL can open it. Private file storage requires a paid UploadThing plan. Storage cleanup is best effort if UploadThing is unavailable.

## Demo account

The seed creates a public reviewer fixture:

- Email: `demo.candidate@example.com`
- Password: `JobSearchDemo123!`

The database stores only the password hash. The seed can be run again without duplicating jobs or the demo account.

## Verify authentication

Open `/dashboard` while logged out: it redirects to login. Create an account at `/signup`, confirm the welcome screen, log out, and log in again. Try an incorrect password and confirm the generic error. The demo account also works after seeding.

Open **My profile**, edit your headline/experience, select skills, and save. Reload to confirm the changes remain. Upload a resume, open it, replace it, and remove it. An anonymous visit to `/profile` redirects to login.

Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`. Before the first database test run, apply migrations to the test database:

```sh
DATABASE_URL='postgresql://postgres:postgres@127.0.0.1:5432/jobsearch_test?schema=public' npx prisma migrate deploy
```

Development uses Turbopack. Production builds use Next.js's webpack option because of local worker restrictions. No end-to-end test dependency is required.

## Verify job discovery

Open `/jobs` without logging in. The seed supplies 40 roles across 10 companies. Search by title, company, or skill; combine that with a city, country, or time-zone offset such as `UTC+05:30`. Choose experience level, company, job type, salary, market, or benefits to narrow the results. Salary filters match overlapping annual USD ranges.

Searches and filters live in the URL. Dropdown changes submit the current search and reset pagination. Results show eight jobs per page, ordered by last update, with stable ties. Reload or use the browser's Back button to restore a search; **Clear** returns to all jobs.

On desktop, select a job card to change the detail panel. On mobile, the card opens a separate detail page with a **Back to jobs** link that retains your filters. Try `React` with `Senior level` for the Northstar Labs role, and a nonexistent keyword for the empty state. Direct links to missing or closed jobs show an unavailable message.

Applying, match badges, and application timelines belong to M5; job details currently link to profile preparation.

## Deployment

Deployment is planned for M7. Set the Neon PostgreSQL URL and a unique production auth secret in the hosting environment, with `BETTER_AUTH_URL` set to the HTTPS demo origin. Apply migrations before starting the app. Never commit real `.env` files. Verify the hosting proxy's client IP headers for database-backed authentication throttling. CI is planned for M6.

AI prompts, decisions, and validation are recorded in [docs/AI_WORKFLOW.md](docs/AI_WORKFLOW.md).

Known dependency limitation: `uploadthing@7.7.4` brings Effect packages with published audit advisories (one moderate and three high package entries). No forced downgrade or unrelated dependency changes were made in M3; revisit compatible upstream fixes in M6.
