"use client";

import { useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Template } from "@/lib/templates";
import { cn } from "@/lib/utils";

type SidebarProps = {
  templates: Template[];
  selectedId?: string;
  search: string;
  onSearch: (value: string) => void;
  onSelect: (templateId: string) => void;
};

export default function Sidebar({
  templates,
  selectedId,
  search,
  onSearch,
  onSelect,
}: SidebarProps) {
  const grouped = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = templates.filter((template) => {
      if (!query) return true;
      return (
        template.title.toLowerCase().includes(query) ||
        template.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    });

    return filtered.reduce<Record<string, Template[]>>((acc, template) => {
      const key = template.category;
      acc[key] = acc[key] ? [...acc[key], template] : [template];
      return acc;
    }, {});
  }, [search, templates]);

  return (
    <aside className="hidden h-screen border-r bg-white/70 backdrop-blur dark:bg-background/70 md:flex md:w-80 lg:w-96">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="px-4 pb-3 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-muted-foreground">
              Template Library
            </h2>
            <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-100 dark:ring-emerald-800">
              Live
            </span>
          </div>
          <div className="relative mt-3">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Search by title or tag"
              className="pl-9 text-sm"
            />
          </div>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-3 pb-6">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="space-y-2">
              <div className="flex items-center justify-between px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                <span>{category}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                  {items.length}
                </span>
              </div>
              <div className="space-y-1">
                {items.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => onSelect(template.id)}
                    className={cn(
                      "group w-full rounded-xl border px-3 py-3 text-left transition-all duration-150",
                      "hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-sm",
                      selectedId === template.id
                        ? "border-primary/60 bg-primary/5 shadow-sm dark:bg-primary/10"
                        : "border-transparent bg-white dark:bg-background"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="text-xl">{template.emoji}</span>
                        <div className="space-y-1">
                          <div className="text-sm font-semibold leading-5 text-foreground">
                            {template.title}
                          </div>
                          <p className="line-clamp-2 text-xs text-muted-foreground">
                            {template.description}
                          </p>
                          <div className="flex flex-wrap gap-1 pt-1">
                            {template.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground ring-1 ring-border/70"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {template.views.toLocaleString()} views
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
