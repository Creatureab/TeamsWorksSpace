"use client";

import { ChevronRight, FileText, MoreHorizontal, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface PageTreeProject {
  _id: string;
  slug: string;
  title: string;
  parentId?: string | null;
  order?: number;
}

interface PageTreeItemProps {
  project: PageTreeProject;
  allProjects: PageTreeProject[];
  depth: number;
  workspaceId: string;
  workspaceHomePath: string;
  activeProjectId: string | null;
  onCreateChild: (parentId: string) => void;
  onProjectCreated: () => void;
}

function PageTreeItem({
  project,
  allProjects,
  depth,
  workspaceId,
  workspaceHomePath,
  activeProjectId,
  onCreateChild,
  onProjectCreated,
}: PageTreeItemProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(true);
  const [hovered, setHovered] = useState(false);

  const children = allProjects
    .filter((p) => String(p.parentId ?? "") === String(project._id))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const hasChildren = children.length > 0;

  const projectUrl = `/project/${project._id}`;
  const isActive = activeProjectId === project._id;

  const handleAddChild = async (e: React.MouseEvent) => {
    e.stopPropagation();
    onCreateChild(project._id);
  };

  const handleOpenInNewTab = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(projectUrl, "_blank", "noopener,noreferrer");
  };

  const handleClick = () => {
    router.push(projectUrl);
  };

  return (
    <div className="group/item relative">
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
        {/* Expand chevron */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((prev) => !prev);
          }}
          className="flex h-5 w-5 shrink-0 items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          {hasChildren ? (
            <ChevronRight
              size={14}
              className={cn("transition-transform duration-150", expanded && "rotate-90")}
            />
          ) : (
            <span className="w-4" />
          )}
        </button>

        {/* Icon */}
        <FileText className="mr-1.5 h-3.5 w-3.5 shrink-0 text-slate-500 dark:text-slate-400" />

        {/* Title */}
        <span className="flex-1 truncate text-[13px]">
          {project.title || "Untitled"}
        </span>

        {/* Hover actions */}
        {hovered && (
          <div className="flex items-center gap-0.5 shrink-0 mr-1" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={handleAddChild}
              className="flex h-6 w-6 items-center justify-center rounded hover:bg-slate-300/80 dark:hover:bg-slate-600 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              aria-label="Add subpage"
            >
              <Plus size={14} />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-6 w-6 items-center justify-center rounded hover:bg-slate-300/80 dark:hover:bg-slate-600 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  aria-label="More options"
                >
                  <MoreHorizontal size={14} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                side="right"
                className="w-44 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <DropdownMenuItem onClick={handleAddChild}>
                  <Plus className="mr-2 h-3.5 w-3.5" />
                  Add subpage
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleOpenInNewTab}>
                  Open in new tab
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Children */}
      {expanded && hasChildren && (
        <div className="mt-0">
          {children.map((child) => (
            <PageTreeItem
              key={child._id}
              project={child}
              allProjects={allProjects}
              depth={depth + 1}
              workspaceId={workspaceId}
              workspaceHomePath={workspaceHomePath}
              activeProjectId={activeProjectId}
              onCreateChild={onCreateChild}
              onProjectCreated={onProjectCreated}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface PageTreeProps {
  projects: PageTreeProject[];
  workspaceId: string;
  workspaceHomePath: string;
  activeProjectId: string | null;
  onCreateChild: (parentId?: string | null) => void;
  onProjectCreated: () => void;
}

export function PageTree({
  projects,
  workspaceId,
  workspaceHomePath,
  activeProjectId,
  onCreateChild,
  onProjectCreated,
}: PageTreeProps) {
  const rootProjects = projects
    .filter((p) => p.parentId == null || String(p.parentId).trim() === "")
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (rootProjects.length === 0) {
    return (
      <div className="px-2 py-3 text-xs text-slate-400 dark:text-slate-500">
        No pages yet. Create a project to get started.
      </div>
    );
  }

  return (
    <div className="py-0.5">
      {rootProjects.map((project) => (
        <PageTreeItem
          key={project._id}
          project={project}
          allProjects={projects}
          depth={0}
          workspaceId={workspaceId}
          workspaceHomePath={workspaceHomePath}
          activeProjectId={activeProjectId}
          onCreateChild={(parentId) => onCreateChild(parentId)}
          onProjectCreated={onProjectCreated}
        />
      ))}
    </div>
  );
}
