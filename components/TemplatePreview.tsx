"use client";

import { CalendarDays, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import type { Template } from "@/lib/templates";
import { cn } from "@/lib/utils";

type TemplatePreviewProps = {
  template?: Template | null;
};

export default function TemplatePreview({ template }: TemplatePreviewProps) {
  if (!template) {
    return (
      <div className="rounded-2xl border border-dashed bg-muted/40 p-10 text-center text-sm text-muted-foreground">
        Select a template from the left to preview its structure.
      </div>
    );
  }

  const { preview } = template;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-2xl">
            {template.emoji}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold leading-6">
                {template.title}
              </h1>
              <Badge variant="outline" className="border-primary/40 text-xs">
                {template.category}
              </Badge>
            </div>
            <p className="max-w-3xl text-sm text-muted-foreground">
              {template.description}
            </p>
            <div className="flex flex-wrap gap-1">
              {template.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[11px]">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs text-muted-foreground ring-1 ring-border dark:bg-background">
          <Eye className="h-4 w-4" />
          <span className="font-semibold text-foreground">
            {template.views.toLocaleString()}
          </span>
          <span>lifetime views</span>
        </div>
      </div>

      <div className="rounded-2xl border bg-white/80 p-4 shadow-sm ring-1 ring-border/60 transition-colors dark:bg-background">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
              Snapshot
            </p>
            <p className="text-base font-semibold">{preview.summary}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {preview.metrics.map((metric) => (
              <div
                key={metric.label}
                className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm font-medium text-foreground ring-1 ring-border"
              >
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col leading-tight">
                  <span className="text-[11px] uppercase tracking-[0.05em] text-muted-foreground">
                    {metric.label}
                  </span>
                  <span>{metric.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Table className="rounded-xl">
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead className="text-right">Due</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {preview.rows.map((row) => (
              <TableRow key={`${template.id}-${row.item}`}>
                <TableCell className="font-medium">{row.item}</TableCell>
                <TableCell className="text-muted-foreground">
                  {row.owner}
                </TableCell>
                <TableCell>
                  <StatusBadge status={row.status} />
                </TableCell>
                <TableCell>
                  <PriorityBadge priority={row.priority} />
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {row.due}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {preview.highlights.map((highlight) => (
          <div
            key={highlight}
            className={cn(
              "rounded-xl border bg-muted/60 p-4 text-sm text-foreground",
              "ring-1 ring-border/70 transition-shadow hover:shadow-sm"
            )}
          >
            {highlight}
          </div>
        ))}
      </div>
    </div>
  );
}
