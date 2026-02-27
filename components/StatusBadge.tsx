"use client";

import clsx from "clsx";
import type { TemplateStatus } from "@/lib/templates";

type StatusBadgeProps = {
  status: TemplateStatus;
};

const statusStyles: Record<TemplateStatus, string> = {
  "Not Started": "bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900/60 dark:text-slate-100 dark:ring-slate-800",
  "In Progress": "bg-blue-100 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-900/50 dark:text-blue-100 dark:ring-blue-800",
  "Blocked": "bg-rose-100 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-900/50 dark:text-rose-100 dark:ring-rose-800",
  "In Review": "bg-amber-100 text-amber-800 ring-1 ring-amber-200 dark:bg-amber-900/50 dark:text-amber-100 dark:ring-amber-800",
  "Done": "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-100 dark:ring-emerald-800",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
        statusStyles[status]
      )}
    >
      <span className="h-2 w-2 rounded-full bg-current" />
      {status}
    </span>
  );
}
