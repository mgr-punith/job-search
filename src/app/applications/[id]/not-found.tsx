import Link from "next/link";

export default function ApplicationNotFound() {
  return <main className="mx-auto max-w-xl space-y-4 px-6 py-16"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Unavailable</p><h1 className="font-serif text-4xl">Application not found</h1><p className="text-muted-foreground">This application is not available in your account.</p><Link href="/dashboard" className="inline-block rounded font-semibold text-primary underline focus-visible:outline-2">My applications</Link></main>;
}
