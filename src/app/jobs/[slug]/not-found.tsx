import Link from "next/link";

export default function JobNotFound() {
  return <main className="mx-auto max-w-xl space-y-4 px-6 py-12"><h1 className="text-2xl font-semibold">This job is not available</h1><p className="text-muted-foreground">It may have closed, or the link may be incorrect.</p><Link href="/jobs" className="inline-block rounded text-primary underline focus-visible:outline-2">Browse open jobs</Link></main>;
}
