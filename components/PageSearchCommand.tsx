"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useSidebarStore } from "@/stores/sidebar-store";
import type { Page } from "@/lib/types/page";

export function PageSearchCommand() {
  const router = useRouter();
  const { pages } = useSidebarStore();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const getSpaceName = (p: Page) => {
    if (p.spaceType === "my-space") return "My Space";
    if (p.spaceType === "team-space") return p.spaceId.replace("team-space-", "") || "Team";
    return "Company Space";
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Search pages" description="Jump to a page">
      <CommandInput placeholder="Search pages..." />
      <CommandList>
        <CommandEmpty>No pages found.</CommandEmpty>
        <CommandGroup heading="Pages">
          {pages
            .filter((p) => p.title)
            .slice(0, 50)
            .map((page) => (
              <CommandItem
                key={page.id}
                value={`${page.title} ${getSpaceName(page)}`}
                onSelect={() => {
                  router.push(`/project/${page.id}`);
                  setOpen(false);
                }}
              >
                <span className="truncate">{page.title || "Untitled"}</span>
                <span className="ml-auto text-xs text-slate-400 truncate max-w-[120px]">
                  {getSpaceName(page)}
                </span>
              </CommandItem>
            ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
