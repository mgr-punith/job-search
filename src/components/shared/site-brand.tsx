import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function SiteBrand({
  href,
  inverse = false,
  className,
}: {
  href: string;
  inverse?: boolean;
  className?: string;
}) {
  return (
    <Link
      aria-label="JobSearch home"
      className={cn(
        "inline-flex items-center gap-2.5 rounded-sm font-semibold tracking-[-0.025em] focus-visible:outline-2 focus-visible:outline-offset-4",
        inverse ? "text-white focus-visible:outline-white" : "text-foreground focus-visible:outline-primary",
        className,
      )}
      data-brand-link
      href={href}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex size-8 items-center justify-center rounded-full",
          inverse ? "bg-[#b9f3dc] text-[#113d32]" : "bg-secondary text-primary",
        )}
      >
        <ArrowUpRight className="size-4 stroke-[2.4]" />
      </span>
      <span className="text-lg">JobSearch</span>
    </Link>
  );
}
