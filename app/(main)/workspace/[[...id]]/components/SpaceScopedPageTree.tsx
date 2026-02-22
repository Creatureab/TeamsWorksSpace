"use client";

import { ChevronRight, MoreHorizontal, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Page } from "@/lib/types/page";
import { buildTree } from "@/lib/utils/page-tree";
import { useSidebarStore } from "@/stores/sidebar-store";

interface SpaceScopedPageTreeProps {
  pages: Page[];
  spaceId: string;
  workspaceId: string;
  activePageId: string | null;
  onCreatePage: (parentId: string | null, spaceId: string) => void;
  onRename: (id: string, title: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onDuplicate?: (id: string) => Promise<void>;
  spaceIds?: string[];
}

function PageTreeItem({
  page,
  depth,
  workspaceId,
  activePageId,
  onCreatePage,
  onRename,
  onDelete,
  spaceIds,
}: {
  page: Page;
  depth: number;
  workspaceId: string;
  activePageId: string | null;
  onCreatePage: (parentId: string | null, spaceId: string) => void;
  onRename: (id: string, title: string) => Promise<void>;
  onDelete: (id: string) => void;
  spaceIds?: string[];
}) {
  const router = useRouter();
  const { toggleExpand, expandedPageIds, setActivePage } = useSidebarStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [hovered, setHovered] = useState(false);

  const isExpanded = expandedPageIds.has(page.id);
  const hasChildren = (page.children?.length ?? 0) > 0;
  const isActive = activePageId === page.id;
  const isEditing = editingId === page.id;

  const handleClick = useCallback(() => {
    if (isEditing) return;
    setActivePage(page.id);
    router.push(`/project/${page.id}`);
  }, [page.id, isEditing, setActivePage, router]);

  const handleAddChild = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCreatePage(page.id, page.spaceId);
  };

  const startRename = () => {
    setEditingId(page.id);
    setEditValue(page.title || "Untitled");
  };

  const saveRename = async () => {
    if (editValue.trim() && editValue !== page.title) {
      await onRename(page.id, editValue.trim());
    }
    setEditingId(null);
  };

  const cancelRename = () => {
    setEditValue(page.title || "Untitled");
    setEditingId(null);
  };

  return (
    <div className="group/item">
      <div
        className={cn(
          "flex items-center h-8 rounded-lg cursor-pointer transition-colors min-w-0",
          "hover:bg-slate-200/75 hover:text-slate-900 dark:hover:bg-slate-700/50 dark:hover:text-slate-100",
          isActive && "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
        )}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={handleClick}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleExpand(page.id);
          }}
          className="flex h-5 w-5 shrink-0 items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          {hasChildren ? (
            <ChevronRight
              size={14}
              className={cn("transition-transform duration-150", isExpanded && "rotate-90")}
            />
          ) : (
            <span className="w-4" />
          )}
        </button>

        <span className="mr-1.5 text-sm shrink-0">
          {page.icon || "📄"}
        </span>

        {isEditing ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveRename();
              if (e.key === "Escape") cancelRename();
            }}
            onBlur={saveRename}
            autoFocus
            className="flex-1 min-w-0 text-[13px] bg-transparent border-none outline-none focus:ring-0"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1 truncate text-[13px]">
            {page.title || "Untitled"}
          </span>
        )}

        {hovered && !isEditing && (
          <div className="flex items-center gap-0.5 shrink-0 mr-1" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={handleAddChild}
              className="flex h-6 w-6 items-center justify-center rounded hover:bg-slate-300/80 dark:hover:bg-slate-600 text-slate-500"
              aria-label="Add subpage"
            >
              <Plus size={14} />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-6 w-6 items-center justify-center rounded hover:bg-slate-300/80 dark:hover:bg-slate-600 text-slate-500"
                  aria-label="More options"
                >
                  <MoreHorizontal size={14} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                side="right"
                className="w-48 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <DropdownMenuItem onClick={startRename}>Rename</DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.open(`/project/${page.id}`, "_blank")}>
                  Open in new tab
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete(page.id)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {isExpanded && hasChildren && (
        <div className="mt-0">
          {(page.children ?? []).map((child) => (
            <PageTreeItem
              key={child.id}
              page={child}
              depth={depth + 1}
              workspaceId={workspaceId}
              activePageId={activePageId}
              onCreatePage={onCreatePage}
              onRename={onRename}
              onDelete={onDelete}
              spaceIds={spaceIds}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function SpaceScopedPageTree({
  pages,
  spaceId,
  workspaceId,
  activePageId,
  onCreatePage,
  onRename,
  onDelete,
}: SpaceScopedPageTreeProps) {
  const tree = buildTree(pages, spaceId);

  if (tree.length === 0) {
    return (
      <div className="px-2 py-3 text-xs text-slate-400 dark:text-slate-500">
        No pages yet. Click + to add one.
      </div>
    );
  }

  return (
    <div className="py-0.5">
      {tree.map((page) => (
        <PageTreeItem
          key={page.id}
          page={page}
          depth={0}
          workspaceId={workspaceId}
          activePageId={activePageId}
          onCreatePage={onCreatePage}
          onRename={onRename}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
