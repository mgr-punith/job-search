import { LoaderCircle } from "lucide-react";

export function PageLoading({ label, columns = 1 }: { label: string; columns?: 1 | 2 }) {
  return (
    <main className="mx-auto min-h-[70dvh] max-w-7xl px-5 py-12 sm:px-6 lg:px-8" role="status" aria-busy="true">
      <p className="flex items-center gap-2 text-sm text-muted-foreground"><LoaderCircle aria-hidden="true" className="size-4 motion-safe:animate-spin" />{label}</p>
      <div aria-hidden="true" className={`mt-6 grid gap-5 ${columns === 2 ? "sm:grid-cols-2" : ""}`}>
        {Array.from({ length: columns }, (_, index) => <div key={index} className="rounded-2xl border bg-card p-6"><div className="h-6 w-2/3 rounded bg-muted motion-safe:animate-pulse" /><div className="mt-4 h-3 w-1/3 rounded bg-muted motion-safe:animate-pulse" /><div className="mt-8 h-40 rounded-xl bg-muted motion-safe:animate-pulse" /></div>)}
      </div>
    </main>
  );
}
