import { Check } from "lucide-react";

import { STATUS_LABELS } from "@/features/applications/constants";
import type { StatusEvent } from "@/features/applications/services/status-engine";

export function formatApplicationDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(date);
}

export function ApplicationTimeline({ events }: { events: StatusEvent[] }) {
  return (
    <ol aria-label="Application status timeline" className="mt-5 space-y-4 border-l border-primary/25 pl-5">
      {events.map((event) => <li key={event.status} className="relative"><span aria-hidden="true" className="absolute -left-7 top-0.5 flex size-4 items-center justify-center rounded-full bg-secondary text-primary ring-4 ring-card"><Check className="size-3" /></span><p className="text-sm font-semibold">{STATUS_LABELS[event.status]}</p><time className="mt-1 block text-xs text-muted-foreground" dateTime={event.occurredAt.toISOString()}>{formatApplicationDate(event.occurredAt)} UTC</time></li>)}
    </ol>
  );
}
