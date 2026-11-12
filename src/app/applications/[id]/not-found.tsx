import Link from "next/link";

export default function ApplicationNotFound() {
  return <main className="mx-auto max-w-xl space-y-4 px-6 py-12"><h1 className="text-2xl font-semibold">Application not found</h1><p className="text-muted-foreground">This application is not available in your account.</p><Link href="/dashboard" className="inline-block rounded text-primary underline focus-visible:outline-2">My applications</Link></main>;
}
