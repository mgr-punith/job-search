export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-16">
      <section className="max-w-2xl space-y-5">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          JobSearch
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
          Find your next role with a clear application trail.
        </h1>
        <p className="max-w-xl text-lg leading-8 text-muted-foreground">
          The project foundation is ready. Candidate accounts, searchable jobs,
          and application tracking will arrive in the approved milestones.
        </p>
      </section>
    </main>
  );
}
