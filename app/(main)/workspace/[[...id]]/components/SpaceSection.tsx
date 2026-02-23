"use client";

import { ChevronDown, ChevronRight, Lock, Plus, Users, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { SpaceScopedPageTree } from "./SpaceScopedPageTree";
import type { Page } from "@/lib/types/page";
import { useSidebarStore } from "@/stores/sidebar-store";

interface SpaceSectionProps {
  spaceId: string;
  spaceName: string;
  spaceType: "my-space" | "team-space" | "company-space";
  pages: Page[];
  workspaceId: string;
  activePageId: string | null;
  onCreatePage: (parentId: string | null, spaceId: string) => void;
  onRename: (id: string, title: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const SpaceIcon = ({ type }: { type: SpaceSectionProps["spaceType"] }) => {
  if (type === "my-space") return <Lock className="h-4 w-4 text-slate-500 shrink-0" />;
  if (type === "team-space") return <Users className="h-4 w-4 text-slate-500 shrink-0" />;
  return <Globe className="h-4 w-4 text-slate-500 shrink-0" />;
};

export function SpaceSection({
  spaceId,
  spaceName,
  spaceType,
  pages,
  workspaceId,
  activePageId,
  onCreatePage,
  onRename,
  onDelete,
}: SpaceSectionProps) {
  const { expandedSpaceIds, toggleSpaceExpand } = useSidebarStore();
  const isExpanded = expandedSpaceIds.has(spaceId);

  return (
    <div className="mb-2">
      <button
        type="button"
        onClick={() => toggleSpaceExpand(spaceId)}
        className={cn(
          "flex w-full items-center gap-2 h-9 rounded-lg px-2.5 text-[13px] font-medium",
          "text-slate-600 hover:bg-slate-200/75 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700/50 dark:hover:text-slate-100",
          "transition-colors duration-200"
        )}
      >
        <SpaceIcon type={spaceType} />
        <span className="flex-1 text-left truncate">{spaceName}</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onCreatePage(null, spaceId);
          }}
          className="flex h-5 w-5 items-center justify-center rounded hover:bg-slate-300/80 dark:hover:bg-slate-600 text-slate-400 hover:text-slate-600"
          aria-label={`Add page to ${spaceName}`}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        {isExpanded ? (
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-0.5 overflow-hidden transition-all duration-200">
          <SpaceScopedPageTree
            pages={pages}
            spaceId={spaceId}
            workspaceId={workspaceId}
            activePageId={activePageId}
            onCreatePage={onCreatePage}
            onRename={onRename}
            onDelete={onDelete}
          />
        </div>
      )}
    </div>
  );
}
