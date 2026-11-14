import Link from "next/link";

export default function JobNotFound() {
  return <main className="mx-auto max-w-xl space-y-4 px-6 py-16"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Unavailable</p><h1 className="font-serif text-4xl">This job is not available</h1><p className="text-muted-foreground">It may have closed, or the link may be incorrect.</p><Link href="/jobs" className="inline-block rounded font-semibold text-primary underline focus-visible:outline-2">Browse open jobs</Link></main>;
}
