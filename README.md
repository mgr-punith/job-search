# JobSearch

Candidate job portal built with Next.js App Router, TypeScript, Tailwind, shadcn/ui, Prisma, PostgreSQL, and Better Auth.

The three assignment flows are implemented: candidate accounts/profiles, searchable jobs, and applications with simulated status tracking.

## Local setup

Use Node.js 24 or newer and Docker Compose.

1. Run `npm ci`.
2. Copy `.env.example` to `.env` locally and replace the auth secret placeholder with a random value of at least 32 characters. Keep this file untracked.
3. Run `docker compose up -d`.
4. Run `npm run db:migrate` and `npm run db:seed`.
5. Run `npm run dev` and open `http://localhost:3000`.

`DATABASE_URL` connects to local PostgreSQL for development. `TEST_DATABASE_URL` must use the dedicated local `jobsearch_test` database. `BETTER_AUTH_SECRET` signs sessions; `BETTER_AUTH_URL` must match the browser's origin exactly, including the port. `UPLOADTHING_TOKEN` enables resume storage. `DEMO_STATUS_DELAY_SECONDS` controls the time between simulated application transitions (1–86,400 seconds; 30 if omitted).

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

Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`. The same checks run in GitHub Actions with PostgreSQL 17. Before the first database test run, apply migrations to the test database:

```sh
DATABASE_URL='postgresql://postgres:postgres@127.0.0.1:5432/jobsearch_test?schema=public' npx prisma migrate deploy
```

Development uses Turbopack. Production builds use Next.js's webpack option because of local worker restrictions. No end-to-end test dependency is required.

## Verify job discovery

Open `/jobs` without logging in. The seed supplies 45 roles across 10 companies, including Web Developer, Frontend Developer, Backend Developer, Software Engineer and Full Stack Developer. Search by title, company, or skill; combine that with a city, country, or time-zone offset such as `UTC+05:30`. Choose experience level, company, job type, salary, market, or a role under **Profile match** to narrow the results. Signed-in candidates can choose **Matches my profile (70%+)**, using the same score as job details. Salary filters match overlapping annual USD ranges. Existing Benefits URLs still work.

Searches and filters live in the URL. Dropdown changes submit the current search and reset pagination. Results show eight jobs per page, ordered by last update, with stable ties. Reload or use the browser's Back button to restore a search; **Clear** returns to all jobs.

On desktop, select a job card to change the detail panel. On mobile, the card opens a separate detail page with a **Back to jobs** link that retains your filters. Try `React` with `Senior level` for the Northstar Labs role, and a nonexistent keyword for the empty state. Direct links to missing or closed jobs show an unavailable message.

## AI profile suggestions (optional)

Create a key at [Groq Console](https://console.groq.com/keys). Set `GROQ_API_KEY` in your local `.env`; `GROQ_MODEL` defaults to `openai/gpt-oss-20b`. Restart the dev server after changing environment settings. Groq offers a quota-limited free tier; provider availability and limits can change. No SDK dependency is required.

Choose **Improve profile with AI** on a job, or open the same popup from Profile and choose a preferred job. Save manual profile changes first. The popup asks Yes/No for job skills missing from your saved profile. Only Yes answers add skills; No answers appear as skills to learn. Groq receives the saved headline, bio, experience and confirmed skill names, without contact details or resume files. Review/edit the generated headline and bio before choosing **Save profile improvements**. Validation rejects denied skill names and common unsupported education/project claims. Review remains necessary because model output can be inaccurate. Saving changes only the headline, bio and confirmed skills, and refuses an old draft if your profile changed. Existing application snapshots remain unchanged.

To refresh seeded jobs without resetting an edited demo profile:

```sh
node --experimental-strip-types prisma/seed.ts --jobs-only
```

## Apply and track progress

1. Log in, complete your profile, and upload a resume.
2. Open a job and choose **Apply now**. The server saves the current resume URL/key and computes the match score; you cannot apply to the same job twice.
3. The application page shows the submitted resume and a status timeline. **Dashboard** lists your applications, six per page.
4. Leave the page open to see scheduled status changes, or select **Refresh status**. Reloading after several steps records all missed transitions once. Profile changes later do not change an application's stored score or resume.

The matching function awards up to 70 points for the fraction of required skills matched; 20 for meeting/exceeding the experience level, 10 for being one level below, otherwise 0; 5 for the same country or explicitly worldwide remote work; and 5 for a matching preferred market. It rounds the total to a whole percentage. No listed job skills earns zero skill points. Both the job badge and application use this function.

Scores of 90% or more progress from **Applied → Under review → Shortlisted → Interview scheduled**, one configured delay per transition. Lower scores stay **Under review**, as chosen for this assignment. The demo interview date is deterministic from the application id, four to six days after submission. This is a simulation; no real recruiter or meeting is involved. The app advances status on page reads and refreshes, without a cron job or queue.

Navigation reuses recent pages for 30 seconds and caches public job/reference queries with one-minute server revalidation. Profile/resume/application mutations invalidate affected routes; status refresh bypasses the router cache. Pagination preserves scroll and shows a thin progress bar during slower transitions. First visits can still show a skeleton. Automatic prefetching works in production; development includes compilation delays. Motion respects reduced-motion preferences.

For a repeatable 100% example, use Senior experience, country United States, preferred market Healthcare, and skills TypeScript, React, Node.js, PostgreSQL, and Prisma. Apply to **MediSpring — Full Stack Engineer** after uploading a resume. Try **WellNest Health — Implementation Specialist** with that same profile to see the lower-score path. Use a fresh candidate for repeated demos because duplicate applications are blocked.

## Deployment

Deployment is planned for M7. Set the Neon PostgreSQL URL and a unique production auth secret in the hosting environment, with `BETTER_AUTH_URL` set to the HTTPS demo origin. Apply migrations before starting the app. Never commit real `.env` files. Verify the hosting proxy's client IP headers for database-backed authentication throttling.

AI prompts, decisions, and validation are recorded in [docs/AI_WORKFLOW.md](docs/AI_WORKFLOW.md).
The detailed local browser and automated results are recorded in [docs/QA_REPORT.md](docs/QA_REPORT.md).

Known dependency limitation: `uploadthing@7.7.4` brings Effect packages with published audit advisories (one moderate and three high package entries). npm proposes an incompatible downgrade to UploadThing 6, so M6 leaves the approved version in place and records the finding for a future compatible upstream fix.
