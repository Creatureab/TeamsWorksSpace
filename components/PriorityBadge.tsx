"use client";

import clsx from "clsx";
import type { TemplatePriority } from "@/lib/templates";

type PriorityBadgeProps = {
  priority: TemplatePriority;
};

const priorityStyles: Record<TemplatePriority, string> = {
  High: "bg-rose-100 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-900/50 dark:text-rose-100 dark:ring-rose-800",
  Medium: "bg-amber-100 text-amber-800 ring-1 ring-amber-200 dark:bg-amber-900/50 dark:text-amber-100 dark:ring-amber-800",
  Low: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-100 dark:ring-emerald-800",
};

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide transition-colors",
        priorityStyles[priority]
      )}
    >
      {priority}
    </span>
  );
}
