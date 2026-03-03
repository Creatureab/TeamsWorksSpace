"use client";

import {
  Archive,
  ChevronDown,
  ChevronRight,
  Copy,
  Database,
  Globe,
  Home,
  Inbox,
  Lock,
  LogOut,
  MoreHorizontal,
  PanelLeft,
  Pencil,
  Plus,
  Search,
  Settings,
  Shield,
  Star,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClerk } from "@clerk/nextjs";
import { toast } from "sonner";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useEffect, useState, useCallback } from "react";
import CreateTeamSpaceDialog, { type TeamSpaceVisibility } from "./CreateTeamSpaceDialog";
import CustomizeWorkspaceDialog, {
  type WorkspaceCustomizationPayload,
} from "./CustomizeWorkspaceDialog";
import { useInboxWebSocket } from "@/hooks/useInboxWebSocket";

interface SidebarUser {
  _id?: string | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
}

interface SidebarWorkspace {
  _id: string;
  name: string;
  type?: "organization" | "personal";
  size?: "1-5" | "6-20" | "21-50" | "50+";
}

interface SidebarProject {
  _id: string;
  slug: string;
  title: string;
  privacy?: "workspace" | "private";
  teamSpaceId?: string | null;
  createdBy?: string | { _id?: string } | null;
}

interface SidebarProps {
  user: SidebarUser | null;
  workspaces: SidebarWorkspace[];
  currentWorkspace: SidebarWorkspace | null;
  projects?: SidebarProject[];
}

interface TeamSpace {
  id: string;
  name: string;
  visibility: TeamSpaceVisibility;
  accessType: "open" | "closed" | "private";
  archived?: boolean;
  isMember: boolean;
  canAccess: boolean;
  canEdit: boolean;
  description?: string;
}


const getInitial = (value?: string | null, fallback = "W") =>
  value?.trim().charAt(0).toUpperCase() || fallback;

const formatVisibility = (visibility: TeamSpaceVisibility) => {
  if (visibility === "open") return "Open";
  if (visibility === "closed") return "Closed";
  return "Private";
};

export default function Sidebar({
  user,
  workspaces,
  currentWorkspace,
  projects = [],
}: SidebarProps) {
  const { toggleSidebar } = useSidebar();
  const { signOut } = useClerk();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const workspaceId = currentWorkspace?._id ?? "";
  const workspaceNameFromProps = currentWorkspace?.name ?? "Workspace";
  const workspaceTypeFromProps = currentWorkspace?.type ?? "organization";
  const workspaceSizeFromProps = currentWorkspace?.size ?? "6-20";
  const activeProjectSlug = searchParams.get("project");
  const pathnameParts = pathname.split("/").filter(Boolean);
  const isMySpaceRoute = pathnameParts[0] === "workspace" && pathnameParts[2] === "my-space";
  const isInboxRoute = pathnameParts[0] === "workspace" && pathnameParts[2] === "inbox";
  const isCompanySpaceRoute = pathnameParts[0] === "workspace" && pathnameParts[2] === "company-space";
  const isTemplatesRoute = pathnameParts[0] === "workspace" && pathnameParts[2] === "templates";
  const isTrashRoute = pathnameParts[0] === "workspace" && pathnameParts[2] === "trash";
  const activeTeamSpaceId =
    pathnameParts[0] === "workspace" && pathnameParts[2] === "team-space" && pathnameParts[3]
      ? decodeURIComponent(pathnameParts[3])
      : null;

  const [activeItem, setActiveItem] = useState("home");
  const [isTeamExpanded, setIsTeamExpanded] = useState(true);
  const [isFavoritesExpanded, setIsFavoritesExpanded] = useState(true);
  const [isCreateTeamSpaceOpen, setIsCreateTeamSpaceOpen] = useState(false);
  const [isCustomizeWorkspaceOpen, setIsCustomizeWorkspaceOpen] = useState(false);
  const [teamSpaces, setTeamSpaces] = useState<TeamSpace[]>([]);
  const [isLoadingTeamSpaces, setIsLoadingTeamSpaces] = useState(false);
  const [workspaceDisplayName, setWorkspaceDisplayName] = useState(workspaceNameFromProps);
  const [workspaceType, setWorkspaceType] = useState<"organization" | "personal">(workspaceTypeFromProps);
  const [workspaceSize, setWorkspaceSize] = useState<"1-5" | "6-20" | "21-50" | "50+">(workspaceSizeFromProps);
  const [isCompanySpaceEnabled, setIsCompanySpaceEnabled] = useState(true);
  const [inboxCount, setInboxCount] = useState<number | null>(null);
  const [quickFindValue, setQuickFindValue] = useState("");
  const [favoriteSlugs, setFavoriteSlugs] = useState<string[]>([]);
  const [pageHierarchy, setPageHierarchy] = useState<any[]>([]);
  const [isLoadingPages, setIsLoadingPages] = useState(false);

  const refreshPages = useCallback(async () => {
    if (!workspaceId) {
      setPageHierarchy([]);
      return;
    }

    setIsLoadingPages(true);
    try {
      const params = new URLSearchParams({ workspaceId });
      if (activeTeamSpaceId) params.set("teamSpaceId", activeTeamSpaceId);

      const response = await fetch(`/api/pages?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to load pages");
      const data = await response.json();
      setPageHierarchy(Array.isArray(data.hierarchy) ? data.hierarchy : []);
    } catch (error) {
      console.error("Failed to load pages:", error);
      setPageHierarchy([]);
    } finally {
      setIsLoadingPages(false);
    }
  }, [workspaceId, activeTeamSpaceId]);

  useEffect(() => {
    setWorkspaceDisplayName(workspaceNameFromProps);
    setWorkspaceType(workspaceTypeFromProps);
    setWorkspaceSize(workspaceSizeFromProps);
  }, [workspaceId, workspaceNameFromProps, workspaceSizeFromProps, workspaceTypeFromProps]);

  useEffect(() => {
    if (!workspaceId) {
      setTeamSpaces([]);
      return;
    }

    let cancelled = false;

    const loadTeamSpaces = async () => {
      setIsLoadingTeamSpaces(true);
      try {
        const response = await fetch(`/api/workspaces/${workspaceId}/team-spaces`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error("Failed to load Team Spaces");
        }

        const data = await response.json();
        if (!cancelled) {
          setTeamSpaces(Array.isArray(data.teamSpaces) ? data.teamSpaces : []);
        }
      } catch (error) {
        console.error("Failed to load Team Spaces:", error);
        if (!cancelled) {
          setTeamSpaces([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingTeamSpaces(false);
        }
      }
    };

    loadTeamSpaces();

    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      await refreshPages();
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshPages]);

  // Load inbox badge count
  useEffect(() => {
    let cancelled = false;
    const loadInbox = async () => {
      if (!workspaceId) {
        setInboxCount(0);
        return;
      }
      try {
        const res = await fetch(`/api/inbox?workspaceId=${workspaceId}`);
        if (!res.ok) throw new Error("Failed to load inbox");
        const data = await res.json();
        if (!cancelled) setInboxCount(Array.isArray(data.invites) ? data.invites.length : 0);
      } catch (err) {
        console.error("Failed to load inbox count", err);
        if (!cancelled) setInboxCount(null);
      }
    };
    loadInbox();
    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  // Listen for inbox updates from InboxView
  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ count?: number }>).detail;
      if (detail && typeof detail.count === "number") {
        setInboxCount(detail.count);
      }
    };
    window.addEventListener("inbox:updated", handler);
    return () => window.removeEventListener("inbox:updated", handler);
  }, []);

  const handleWsCount = useCallback(
    (count: number) => {
      setInboxCount((prev) => (typeof count === "number" ? count : prev));
    },
    [setInboxCount]
  );

  useInboxWebSocket({
    email: user?.email,
    workspaceId,
    onCount: handleWsCount,
  });

  const initials = getInitial(workspaceDisplayName);

  const workspaceHomePath = workspaceId ? `/workspace/${workspaceId}` : "/workspace";
  const mySpacePath = `${workspaceHomePath}/my-space`;
  const companySpacePath = `${workspaceHomePath}/company-space`;
  const visibleTeamSpaces = teamSpaces.filter((space) => !space.archived);
  const favoriteProjects = projects.filter((project) => favoriteSlugs.includes(project.slug));
  const projectsForTeamSpace = (spaceId: string) => {
    if (spaceId === "general") {
      return projects.filter((project) => !project.teamSpaceId || project.teamSpaceId === "general");
    }
    return projects.filter((project) => project.teamSpaceId === spaceId);
  };

  const isHomeActive =
    (pathname === workspaceHomePath || pathname === "/workspace" || pathname === "/") &&
    !activeProjectSlug &&
    !activeTeamSpaceId &&
    !isMySpaceRoute;
  const resolvedActiveItem = activeTeamSpaceId
    ? `team-${activeTeamSpaceId}`
    : isMySpaceRoute
      ? "my-space"
      : isCompanySpaceRoute
        ? "company-space"
        : isInboxRoute
          ? "inbox"
          : isTemplatesRoute
            ? "templates"
            : isTrashRoute
              ? "trash"
          : activeProjectSlug
            ? "favorites"
            : isHomeActive
              ? "home"
              : activeItem;
  const isTeamSectionActive =
    Boolean(activeTeamSpaceId) ||
    resolvedActiveItem === "team-spaces" ||
    visibleTeamSpaces.some((space) => resolvedActiveItem === `team-${space.id}`);
  const showFavoritesSection = isFavoritesExpanded || Boolean(activeProjectSlug);

  const getPageUrl = (pathSegments: string[]) => {
    const basePath = activeTeamSpaceId ? getTeamSpacePath(activeTeamSpaceId) : workspaceHomePath;
    const cleanBase = basePath.replace(/\/$/, "");
    const path = Array.isArray(pathSegments) ? pathSegments.join("/") : "";
    return path ? `${cleanBase}/page/${path}` : cleanBase;
  };

  const getProjectsDbUrl = () => {
    if (!workspaceId) return "/workspace";
    if (activeTeamSpaceId) {
      return `${getTeamSpacePath(activeTeamSpaceId)}/database/projects`;
    }
    return `${workspaceHomePath}/database/projects`;
  };

  const getTeamSpacePath = (
    spaceId: string,
    section?: "settings" | "members" | "permissions"
  ) => {
    const basePath = `${workspaceHomePath}/team-space/${encodeURIComponent(spaceId)}`;
    return section ? `${basePath}/${section}` : basePath;
  };

  interface SidebarPageNode {
    page: {
      _id?: string;
      id?: string;
      title?: string | null;
      path?: string[];
    };
    children: SidebarPageNode[];
  }

  interface SidebarPageTreeItemProps {
    node: SidebarPageNode;
    level: number;
    getPageUrl: (pathSegments: string[]) => string;
    currentPathname: string;
    onNavigate: (href: string) => void;
    onCreateChild: (parentId: string) => void;
    onRename: (pageId: string, currentTitle?: string | null) => void;
    onDelete: (pageId: string) => void;
  }

  const SidebarPageTreeItem = ({
    node,
    level,
    getPageUrl,
    currentPathname,
    onNavigate,
    onCreateChild,
    onRename,
    onDelete,
  }: SidebarPageTreeItemProps) => {
    const [isExpanded, setIsExpanded] = useState(level < 1);
    const [isHovered, setIsHovered] = useState(false);
    const hasChildren = Array.isArray(node.children) && node.children.length > 0;
    const pathSegments = Array.isArray(node.page.path) ? node.page.path : [];
    const pageId = node.page._id ?? node.page.id ?? "";
    const href = getPageUrl(pathSegments);
    const isActive = currentPathname === href || currentPathname.startsWith(`${href}/`);

    return (
      <div>
        <div
          className={cn(
            "group flex cursor-pointer items-center rounded-md px-2 py-1 pr-1 text-[12px] text-slate-600 hover:bg-slate-200/60 hover:text-slate-900",
            isActive ? "bg-slate-300 text-slate-900" : ""
          )}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => onNavigate(href)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {hasChildren ? (
            <button
              type="button"
              className="mr-1 inline-flex h-4 w-4 items-center justify-center rounded text-slate-400 hover:bg-slate-200"
              onClick={(event) => {
                event.stopPropagation();
                setIsExpanded((open) => !open);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
          ) : (
            <span className="mr-1 inline-block h-4 w-4" />
          )}

          <span className="truncate">{node.page.title || "Untitled"}</span>

          <div
            className={cn(
              "ml-auto flex items-center gap-1",
              isHovered ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
          >
            <button
              type="button"
              className="inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              aria-label="Create sub-page"
              onClick={(event) => {
                event.stopPropagation();
                if (!pageId) return;
                onCreateChild(pageId);
              }}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                  aria-label="Page actions"
                  onClick={(event) => event.stopPropagation()}
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                side="right"
                sideOffset={8}
                className="w-48 rounded-xl border-slate-200/90 bg-white p-1.5 shadow-lg"
              >
                <DropdownMenuItem
                  onClick={() => {
                    if (!pageId) return;
                    onRename(pageId, node.page.title);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    if (!pageId) return;
                    onCreateChild(pageId);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  New sub-page
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => {
                    if (!pageId) return;
                    onDelete(pageId);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-0.5">
            {node.children.map((child) => (
              <SidebarPageTreeItem
                key={child.page._id ?? child.page.id}
                node={child}
                level={level + 1}
                getPageUrl={getPageUrl}
                currentPathname={currentPathname}
                onNavigate={onNavigate}
                onCreateChild={onCreateChild}
                onRename={onRename}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const getProjectContextPath = () => {
    if (activeTeamSpaceId) return getTeamSpacePath(activeTeamSpaceId);
    if (isMySpaceRoute) return mySpacePath;
    return workspaceHomePath;
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  const handleCreateTeamSpace = ({
    name,
    visibility,
  }: {
    name: string;
    visibility: TeamSpaceVisibility;
  }) => {
    if (!workspaceId) return;

    (async () => {
      try {
        const response = await fetch(`/api/workspaces/${workspaceId}/team-spaces`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, visibility }),
        });

        if (!response.ok) {
          throw new Error("Failed to create Team Space");
        }

        const data = await response.json();
        const createdTeamSpace = data.teamSpace as TeamSpace | undefined;
        const updatedTeamSpaces = Array.isArray(data.teamSpaces) ? (data.teamSpaces as TeamSpace[]) : null;
        if (updatedTeamSpaces) {
          setTeamSpaces(updatedTeamSpaces);
        } else if (createdTeamSpace) {
          setTeamSpaces((previous) => [...previous, createdTeamSpace]);
        }

        if (createdTeamSpace?.id) {
          setIsTeamExpanded(true);
          setActiveItem(`team-${createdTeamSpace.id}`);
          router.push(getTeamSpacePath(createdTeamSpace.id));
        }
      } catch (error) {
        console.error("Failed to create Team Space:", error);
        window.alert("Could not create Team Space. Please try again.");
      }
    })();
  };

  const handleRenameTeamSpace = (spaceId: string) => {
    const target = teamSpaces.find((space) => space.id === spaceId);
    if (!target) return;

    const nextName = window.prompt("Rename Team Space", target.name);
    const normalizedName = nextName?.trim();
    if (!normalizedName) return;

    (async () => {
      try {
        const response = await fetch(`/api/workspaces/${workspaceId}/team-spaces/${encodeURIComponent(spaceId)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: normalizedName }),
        });
        if (!response.ok) {
          throw new Error("Failed to rename Team Space");
        }
        const data = await response.json();
        if (Array.isArray(data.teamSpaces)) {
          setTeamSpaces(data.teamSpaces);
          return;
        }
        if (data.teamSpace) {
          setTeamSpaces((previous) =>
            previous.map((space) => (space.id === spaceId ? data.teamSpace : space))
          );
        }
      } catch (error) {
        console.error("Failed to rename Team Space:", error);
        window.alert("Could not rename Team Space. Please try again.");
      }
    })();
  };

  const handleDeleteTeamSpace = (spaceId: string) => {
    if (!window.confirm("Delete this team space permanently?")) return;

    (async () => {
      try {
        const response = await fetch(`/api/workspaces/${workspaceId}/team-spaces/${encodeURIComponent(spaceId)}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Failed to delete Team Space");
        }
        const data = await response.json();
        if (Array.isArray(data.teamSpaces)) {
          setTeamSpaces(data.teamSpaces);
        } else {
          setTeamSpaces((previous) => previous.filter((space) => space.id !== spaceId));
        }
        setActiveItem((previous) => (previous === `team-${spaceId}` ? "team-spaces" : previous));
        if (activeTeamSpaceId === spaceId) {
          router.push(workspaceHomePath);
        }
      } catch (error) {
        console.error("Failed to delete Team Space:", error);
        window.alert("Could not delete Team Space. Please try again.");
      }
    })();
  };

  const handleArchiveTeamSpace = (spaceId: string) => {
    (async () => {
      try {
        const response = await fetch(`/api/workspaces/${workspaceId}/team-spaces/${encodeURIComponent(spaceId)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ archived: true }),
        });
        if (!response.ok) {
          throw new Error("Failed to archive Team Space");
        }
        const data = await response.json();
        if (Array.isArray(data.teamSpaces)) {
          setTeamSpaces(data.teamSpaces);
        } else if (data.teamSpace) {
          setTeamSpaces((previous) =>
            previous.map((space) => (space.id === spaceId ? data.teamSpace : space))
          );
        }
        setActiveItem((previous) => (previous === `team-${spaceId}` ? "team-spaces" : previous));
        if (activeTeamSpaceId === spaceId) {
          router.push(workspaceHomePath);
        }
      } catch (error) {
        console.error("Failed to archive Team Space:", error);
        window.alert("Could not archive Team Space. Please try again.");
      }
    })();
  };

  const handleLeaveTeamSpace = (spaceId: string) => {
    if (!window.confirm("Leave this team space?")) return;

    (async () => {
      try {
        const response = await fetch(`/api/workspaces/${workspaceId}/team-spaces/${encodeURIComponent(spaceId)}/members/${user?._id || 'me'}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to leave");

        // Refresh
        router.refresh();
        const res = await fetch(`/api/workspaces/${workspaceId}/team-spaces`);
        const data = await res.json();
        setTeamSpaces(data.teamSpaces);
      } catch (error) {
        console.error("Failed to leave:", error);
      }
    })();
  };

  const handleJoinTeamSpace = (spaceId: string) => {
    (async () => {
      try {
        const response = await fetch(`/api/workspaces/${workspaceId}/team-spaces/${encodeURIComponent(spaceId)}/join`, {
          method: "POST"
        });
        if (!response.ok) throw new Error("Failed to join");

        const data = await response.json();
        toast.success(`Joined ${data.teamSpace.name}`);

        // Refresh
        router.refresh();
        const res = await fetch(`/api/workspaces/${workspaceId}/team-spaces`);
        const resData = await res.json();
        setTeamSpaces(resData.teamSpaces);
      } catch (error) {
        console.error("Failed to join:", error);
      }
    })();
  };


  const handleTeamSpaceVisibilityChange = (
    spaceId: string,
    visibility: TeamSpaceVisibility
  ) => {
    (async () => {
      try {
        const response = await fetch(`/api/workspaces/${workspaceId}/team-spaces/${encodeURIComponent(spaceId)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visibility }),
        });
        if (!response.ok) {
          throw new Error("Failed to update Team Space visibility");
        }
        const data = await response.json();
        if (Array.isArray(data.teamSpaces)) {
          setTeamSpaces(data.teamSpaces);
          return;
        }
        if (data.teamSpace) {
          setTeamSpaces((previous) =>
            previous.map((space) => (space.id === spaceId ? data.teamSpace : space))
          );
        }
      } catch (error) {
        console.error("Failed to update Team Space visibility:", error);
        window.alert("Could not update Team Space visibility. Please try again.");
      }
    })();
  };

  const handleCopyTeamSpaceLink = async (spaceId: string) => {
    const link = `${window.location.origin}${getTeamSpacePath(spaceId)}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
        return;
      }
      window.prompt("Copy this Team Space link", link);
    } catch (error) {
      console.error("Failed to copy Team Space link:", error);
      window.prompt("Copy this Team Space link", link);
    }
  };

  const handleCustomizeWorkspace = async (payload: WorkspaceCustomizationPayload) => {
    const previousState = {
      name: workspaceDisplayName,
      type: workspaceType,
      size: workspaceSize,
      companySpaceEnabled: isCompanySpaceEnabled,
    };

    setWorkspaceDisplayName(payload.name);
    setWorkspaceType(payload.type);
    setWorkspaceSize(payload.size);
    setIsCompanySpaceEnabled(payload.companySpaceEnabled);

    if (!workspaceId) return;

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: payload.name,
          type: payload.type,
          size: payload.size,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update workspace");
      }
    } catch (error) {
      console.error("Failed to customize workspace:", error);
      setWorkspaceDisplayName(previousState.name);
      setWorkspaceType(previousState.type);
      setWorkspaceSize(previousState.size);
      setIsCompanySpaceEnabled(previousState.companySpaceEnabled);
      window.alert("Could not save workspace customization. Please try again.");
    }
  };

  useEffect(() => {
    if (!workspaceId) {
      setFavoriteSlugs([]);
      return;
    }
    const key = `favorite-projects:${workspaceId}`;
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setFavoriteSlugs(parsed.filter((item) => typeof item === "string"));
          return;
        }
      }
    } catch (error) {
      console.error("Failed to read favorites", error);
    }
    setFavoriteSlugs([]);
  }, [workspaceId]);

  const persistFavorites = (next: string[]) => {
    setFavoriteSlugs(next);
    if (!workspaceId) return;
    const key = `favorite-projects:${workspaceId}`;
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch (error) {
      console.error("Failed to store favorites", error);
    }
  };

  const toggleFavorite = (slug: string) => {
    setFavoriteSlugs((previous) => {
      const exists = previous.includes(slug);
      const next = exists ? previous.filter((item) => item !== slug) : [...previous, slug];
      persistFavorites(next);
      return next;
    });
  };

  const isFavorite = (slug: string) => favoriteSlugs.includes(slug);

  const handleGlobalNewPage = async () => {
    if (!workspaceId) return;

    const title = window.prompt("Page title");
    const normalizedTitle = title?.trim();
    if (!normalizedTitle) return;

    try {
      const response = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: normalizedTitle,
          workspaceId,
          teamSpaceId: activeTeamSpaceId ?? undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create page");
      }

      const { page } = await response.json();
      const basePath = activeTeamSpaceId
        ? `/workspace/${workspaceId}/team-space/${encodeURIComponent(activeTeamSpaceId)}`
        : workspaceHomePath;
      const pagePath = Array.isArray(page.path) ? page.path.join("/") : "";

      if (pagePath) {
        router.push(
          activeTeamSpaceId
            ? `${basePath}/page/${pagePath}`
            : `${basePath.replace(/\/$/, "")}/page/${pagePath}`
        );
      } else {
        router.push(basePath);
      }

      router.refresh();
    } catch (error) {
      console.error("Failed to create page:", error);
      window.alert("Could not create page. Please try again.");
    }
  };

  const handleQuickFindSubmit = () => {
    const query = quickFindValue.trim();
    if (!query) return;
    setActiveItem("search");
    router.push(`${workspaceHomePath}?search=${encodeURIComponent(query)}`);
  };

  const navItemClassName =
    "h-9 rounded-lg px-2.5 text-[13px] font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-200/60 data-[active=true]:bg-slate-300 data-[active=true]:text-slate-900";
  const iconClassName = "h-3.5 w-3.5 text-slate-500";

  const handleCreatePageAt = async (parentId?: string) => {
    if (!workspaceId) return;
    const title = window.prompt("Page title");
    const normalizedTitle = title?.trim();
    if (!normalizedTitle) return;

    try {
      const response = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: normalizedTitle,
          workspaceId,
          teamSpaceId: activeTeamSpaceId ?? undefined,
          parentId: parentId ?? undefined,
        }),
      });

      if (!response.ok) throw new Error("Failed to create page");
      const { page } = await response.json();
      const pathSegments = Array.isArray(page?.path) ? page.path : [];
      if (pathSegments.length) {
        router.push(getPageUrl(pathSegments));
      }
      toast.success("Page created");
      await refreshPages();
    } catch (error) {
      console.error("Failed to create page:", error);
      toast.error("Failed to create page");
    }
  };

  const handleRenamePage = async (pageId: string, currentTitle?: string | null) => {
    const nextTitle = window.prompt("Rename page", currentTitle ?? "");
    const normalizedTitle = nextTitle?.trim();
    if (!normalizedTitle) return;

    try {
      const response = await fetch(`/api/pages/${encodeURIComponent(pageId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: normalizedTitle }),
      });
      if (!response.ok) throw new Error("Failed to rename page");
      const data = await response.json();
      toast.success("Renamed");
      await refreshPages();

      const updated = data?.page;
      if (updated?.path && Array.isArray(updated.path)) {
        const updatedHref = getPageUrl(updated.path);
        const current = pathname;
        if (current === getPageUrl((updated as any).path) || current.includes(pageId)) {
          router.replace(updatedHref);
        }
      }
    } catch (error) {
      console.error("Failed to rename page:", error);
      toast.error("Failed to rename");
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (!window.confirm("Delete this page and all its children?")) return;

    try {
      const response = await fetch(`/api/pages/${encodeURIComponent(pageId)}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete page");
      toast.success("Deleted");
      await refreshPages();
      router.push(activeTeamSpaceId ? getTeamSpacePath(activeTeamSpaceId) : workspaceHomePath);
    } catch (error) {
      console.error("Failed to delete page:", error);
      toast.error("Failed to delete");
    }
  };

  return (
    <ShadcnSidebar
      collapsible="icon"
      className="border-r border-slate-200/80 bg-[#F7F7F8] text-slate-800 [font-family:Inter,ui-sans-serif,system-ui,sans-serif]"
    >
      <SidebarHeader className="border-b border-slate-200/80 px-3 py-3">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="group flex h-10 flex-1 items-center gap-2 rounded-lg border border-slate-200/90 bg-white px-2.5 transition-colors hover:bg-slate-50 group-data-[collapsible=icon]:size-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-600 text-[10px] font-bold uppercase text-white">
                  {initials}
                </div>
                <div className="min-w-0 text-left group-data-[collapsible=icon]:hidden">
                  <p className="truncate text-sm font-semibold text-slate-800">{workspaceDisplayName}</p>
                  <p className="truncate text-[11px] text-slate-500">Workspace</p>
                </div>
                <ChevronDown className="ml-auto h-3.5 w-3.5 text-slate-400 group-data-[collapsible=icon]:hidden" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 rounded-lg border-slate-200 bg-white" align="start" side="bottom">
              <DropdownMenuLabel className="text-xs text-slate-500">{user?.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {workspaces.map((ws) => (
                <DropdownMenuItem key={ws._id} onClick={() => router.push(`/workspace/${ws._id}`)}>
                  <div className="flex w-full items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-100 text-[9px] font-semibold uppercase text-slate-700">
                      {getInitial(ws.name)}
                    </div>
                    <span className="flex-1 truncate text-slate-700">
                      {ws._id === currentWorkspace?._id ? workspaceDisplayName : ws.name}
                    </span>
                    {ws._id === currentWorkspace?._id ? (
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                    ) : null}
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsCustomizeWorkspaceOpen(true)}>
                <Settings className="h-4 w-4" />
                Customize Workspace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-9 w-9 rounded-lg border border-transparent text-slate-500 hover:border-slate-200 hover:bg-white hover:text-slate-800"
          >
            <PanelLeft className="h-4 w-4" />
            <span className="sr-only">Collapse sidebar</span>
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-0 px-3 py-3">
        <div className="mb-3 flex h-11 items-center gap-2 rounded-lg border border-slate-200/80 bg-white px-3 shadow-sm">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={quickFindValue}
            onChange={(event) => setQuickFindValue(event.target.value)}
            onFocus={() => setActiveItem("search")}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleQuickFindSubmit();
              }
            }}
            placeholder="Quick Find"
            className="flex-1 border-none bg-transparent text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none"
          />
          <span className="text-[11px] font-medium text-slate-400 group-data-[collapsible=icon]:hidden">Ctrl/Cmd+P</span>
        </div>

        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Updates"
                  isActive={resolvedActiveItem === "inbox"}
                  className={navItemClassName}
                  onClick={() => {
                    setActiveItem("inbox");
                    router.push(`${workspaceHomePath}/inbox`);
                  }}
                >
                  <Inbox className={iconClassName} />
                  <span>Updates</span>
                </SidebarMenuButton>
                {typeof inboxCount === "number" && inboxCount > 0 ? (
                  <SidebarMenuBadge className="right-2 rounded-full bg-slate-200 px-1.5 text-[10px] font-semibold text-slate-800">
                    {inboxCount}
                  </SidebarMenuBadge>
                ) : null}
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Favorites"
                  isActive={resolvedActiveItem === "favorites"}
                  className={navItemClassName}
                  onClick={() => {
                    setActiveItem("favorites");
                    setIsFavoritesExpanded((open) => !open);
                  }}
                >
                  <Star className={iconClassName} />
                  <span>Favorites</span>
                  {isFavoritesExpanded ? (
                    <ChevronDown className="ml-auto h-3.5 w-3.5 text-slate-400 group-data-[collapsible=icon]:hidden" />
                  ) : (
                    <ChevronRight className="ml-auto h-3.5 w-3.5 text-slate-400 group-data-[collapsible=icon]:hidden" />
                  )}
                </SidebarMenuButton>
                {showFavoritesSection && (
                  <SidebarMenuSub className="mt-1 border-slate-200">
                    {favoriteProjects.length > 0 ? (
                      favoriteProjects.map((project) => (
                        <SidebarMenuSubItem key={project._id}>
                          <SidebarMenuSubButton
                            isActive={activeProjectSlug === project.slug}
                            onClick={() =>
                              router.push(
                                `${getProjectContextPath()}?project=${encodeURIComponent(project.slug)}`
                              )
                            }
                            className="relative h-8 rounded-lg pr-10 text-[12px] text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 data-[active=true]:bg-slate-300 data-[active=true]:text-slate-900"
                          >
                            <Star
                              className="h-3.5 w-3.5 text-amber-500"
                              fill="currentColor"
                            />
                            <span className="truncate">{project.title}</span>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                toggleFavorite(project.slug);
                              }}
                              className="absolute right-2 inline-flex h-5 w-5 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
                              aria-label="Remove from favorites"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))
                    ) : (
                      <div className="px-2 py-1.5 text-xs text-slate-400">No favorites yet</div>
                    )}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Home"
                  isActive={resolvedActiveItem === "home"}
                  className={navItemClassName}
                  onClick={() => {
                    setActiveItem("home");
                    router.push(workspaceHomePath);
                  }}
                >
                  <Home className={iconClassName} />
                  <span>Home</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="My Space"
                  isActive={resolvedActiveItem === "my-space"}
                  className={navItemClassName}
                  onClick={() => {
                    setActiveItem("my-space");
                    router.push(mySpacePath);
                  }}
                >
                  <Lock className={iconClassName} />
                  <span>My Space</span>
                </SidebarMenuButton>
                <p className="px-3 pt-1 text-[11px] text-slate-400 group-data-[collapsible=icon]:hidden">
                  Private space, cannot be deleted
                </p>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Team Spaces"
                  isActive={isTeamSectionActive}
                  className={navItemClassName}
                  onClick={() => {
                    setActiveItem("team-spaces");
                    setIsTeamExpanded((open) => !open);
                  }}
                >
                  <Users className={iconClassName} />
                  <span>Team Spaces</span>
                  <div className="ml-auto flex items-center gap-1 group-data-[collapsible=icon]:hidden">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <span
                          role="button"
                          tabIndex={0}
                          aria-label="Create"
                          onClick={(event) => event.stopPropagation()}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              event.stopPropagation();
                              // Radix will handle the actual open on click/keyboard activation
                              (event.currentTarget as HTMLElement).click();
                            }
                          }}
                          className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        side="right"
                        sideOffset={8}
                        className="w-56 rounded-xl border-slate-200/90 bg-white p-1.5 shadow-lg"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {activeTeamSpaceId ? (
                          <DropdownMenuItem
                            onClick={() => {
                              handleCreatePageAt();
                            }}
                          >
                            <Plus className="h-4 w-4" />
                            New page in this team space
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuItem onClick={() => setIsCreateTeamSpaceOpen(true)}>
                          <Users className="h-4 w-4" />
                          New team space
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {isTeamExpanded ? (
                      <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    )}
                  </div>
                </SidebarMenuButton>

                {isTeamExpanded && (
                  <SidebarMenuSub className="mt-1 border-slate-200">
                    {isLoadingTeamSpaces ? (
                      <div className="px-2 py-1.5 text-xs text-slate-400">Loading team spaces...</div>
                    ) : visibleTeamSpaces.length === 0 ? (
                      <div className="px-2 py-1.5 text-xs text-slate-400">No team spaces</div>
                    ) : (
                      visibleTeamSpaces.map((space) => (
                        <SidebarMenuSubItem key={space.id} className="group/team relative">
                          <SidebarMenuSubButton
                            isActive={resolvedActiveItem === `team-${space.id}`}
                            onClick={() => {
                              if (!space.canAccess) {
                                toast.error("This team space is invite-only");
                                return;
                              }
                              setActiveItem(`team-${space.id}`);
                              router.push(getTeamSpacePath(space.id));
                            }}
                            className={cn(
                              "h-8 rounded-lg pr-9 text-[12px] font-medium text-slate-700 transition-colors hover:bg-slate-200/60 hover:text-slate-900",
                              resolvedActiveItem === `team-${space.id}` ? "bg-slate-300 text-slate-900" : "",
                              !space.isMember && space.accessType === "closed" ? "opacity-60 grayscale-[0.5]" : ""
                            )}
                          >
                            <Users className="h-3.5 w-3.5 text-slate-500" />
                            <span className="truncate flex items-center gap-1.5">
                              {space.name}
                              {!space.isMember && space.accessType === "closed" && (
                                <Lock className="h-2.5 w-2.5 text-slate-400" />
                              )}
                            </span>
                          </SidebarMenuSubButton>

                          {!space.isMember && space.accessType === 'open' && (
                            <button
                              onClick={() => handleJoinTeamSpace(space.id)}
                              className="absolute right-9 top-1.5 hidden group-hover/team:flex h-5 items-center rounded bg-slate-800 px-1.5 text-[10px] font-bold text-white hover:bg-slate-700"
                            >
                              Join
                            </button>
                          )}


                          {space.canAccess && null}

                          {space.canAccess && space.id === activeTeamSpaceId && (
                            <div className="ml-4 mt-2 space-y-0.5 pr-8">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveItem(`team-${space.id}`);
                                  router.push(getProjectsDbUrl());
                                }}
                                className="flex h-7 w-full items-center gap-2 rounded-md px-2 text-left text-[12px] font-medium text-slate-600 transition-colors hover:bg-slate-200/60 hover:text-slate-900"
                              >
                                <Database className="h-3.5 w-3.5 text-slate-500" />
                                <span className="truncate">Projects</span>
                              </button>
                              <div className="flex items-center justify-between px-2">
                                <p className="text-[10px] font-semibold text-slate-500">Pages</p>
                                <button
                                  type="button"
                                  aria-label="Create page in this team space"
                                  onClick={() => handleCreatePageAt()}
                                  className="inline-flex h-5 w-5 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              {isLoadingPages ? (
                                <p className="px-2 py-1 text-[11px] text-slate-400">Loading pages...</p>
                              ) : pageHierarchy.length === 0 ? (
                                <p className="px-2 py-1 text-[11px] text-slate-400">No pages yet</p>
                              ) : (
                                <div className="space-y-0.5">
                                  {pageHierarchy.map((node: SidebarPageNode) => (
                                    <SidebarPageTreeItem
                                      key={node.page._id ?? node.page.id}
                                      node={node}
                                      level={0}
                                      getPageUrl={getPageUrl}
                                      currentPathname={pathname}
                                      onNavigate={(href) => {
                                        setActiveItem(`team-${space.id}`);
                                        router.push(href);
                                      }}
                                      onCreateChild={(parentId) => handleCreatePageAt(parentId)}
                                      onRename={(pageId, title) => handleRenamePage(pageId, title)}
                                      onDelete={(pageId) => handleDeletePage(pageId)}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          )}


                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                aria-label={`${space.name} options`}
                                className={cn(
                                  "absolute top-1.5 right-1 inline-flex h-5 w-5 items-center justify-center rounded-md text-slate-400 opacity-0 transition-all hover:bg-slate-200 hover:text-slate-700",
                                  "group-hover/team:opacity-100 group-focus-within/team:opacity-100"
                                )}
                              >
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              side="right"
                              sideOffset={8}
                              className="w-56 rounded-xl border-slate-200/90 bg-white p-1.5 shadow-lg"
                            >
                              <DropdownMenuLabel className="text-xs text-slate-500">
                                {space.name} - {formatVisibility(space.visibility)}
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {space.canEdit && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setActiveItem(`team-${space.id}`);
                                    router.push(getTeamSpacePath(space.id, "settings"));
                                  }}
                                >
                                  <Settings className="h-4 w-4" />
                                  Teamspace settings
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuItem
                                onClick={() => {
                                  setActiveItem(`team-${space.id}`);
                                  router.push(getTeamSpacePath(space.id, "members"));
                                }}
                              >
                                <UserPlus className="h-4 w-4" />
                                Manage members
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRenameTeamSpace(space.id)}>
                                <Pencil className="h-4 w-4" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                  <Shield className="h-4 w-4" />
                                  Permissions / visibility
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent className="w-44 rounded-lg border-slate-200 bg-white">
                                  <DropdownMenuItem
                                    onClick={() => handleTeamSpaceVisibilityChange(space.id, "open")}
                                  >
                                    Open {space.visibility === "open" ? "(current)" : ""}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleTeamSpaceVisibilityChange(space.id, "closed")}
                                  >
                                    Closed {space.visibility === "closed" ? "(current)" : ""}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleTeamSpaceVisibilityChange(space.id, "private")}
                                  >
                                    Private {space.visibility === "private" ? "(current)" : ""}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setActiveItem(`team-${space.id}`);
                                      router.push(getTeamSpacePath(space.id, "permissions"));
                                    }}
                                  >
                                    Open permissions page
                                  </DropdownMenuItem>
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                              <DropdownMenuItem onClick={() => handleCopyTeamSpaceLink(space.id)}>
                                <Copy className="h-4 w-4" />
                                Copy link
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleLeaveTeamSpace(space.id)}>
                                <LogOut className="h-4 w-4" />
                                Leave teamspace
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleArchiveTeamSpace(space.id)}>
                                <Archive className="h-4 w-4" />
                                Archive
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => handleDeleteTeamSpace(space.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </SidebarMenuSubItem>
                      ))
                    )}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>

              {isCompanySpaceEnabled ? (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="Company Space"
                    isActive={resolvedActiveItem === "company-space"}
                    className={navItemClassName}
                    onClick={() => {
                      setActiveItem("company-space");
                      router.push(companySpacePath);
                    }}
                  >
                    <Globe className={iconClassName} />
                    <span>Company Space</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : null}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!activeTeamSpaceId && (
          <SidebarGroup className="mt-3 p-0">
            <SidebarGroupLabel className="h-6 px-2 text-[11px] font-semibold text-slate-500">
              Pages
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="mb-2 px-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setActiveItem("home");
                    router.push(getProjectsDbUrl());
                  }}
                  className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-200/60 hover:text-slate-900"
                >
                  <Database className="h-3.5 w-3.5 text-slate-500" />
                  <span className="truncate">Projects</span>
                </button>
              </div>
              <div className="space-y-0.5 rounded-lg bg-slate-50/80 px-1.5 py-1.5">
                {isLoadingPages ? (
                  <p className="px-2 py-1 text-[11px] text-slate-400">Loading pages...</p>
                ) : pageHierarchy.length === 0 ? (
                  <p className="px-2 py-1 text-[11px] text-slate-400">No pages yet</p>
                ) : (
                  pageHierarchy.map((node: SidebarPageNode) => (
                    <SidebarPageTreeItem
                      key={node.page._id ?? node.page.id}
                      node={node}
                      level={0}
                      getPageUrl={getPageUrl}
                      currentPathname={pathname}
                      onNavigate={(href) => {
                        setActiveItem("home");
                        router.push(href);
                      }}
                      onCreateChild={(parentId) => handleCreatePageAt(parentId)}
                      onRename={(pageId, title) => handleRenamePage(pageId, title)}
                      onDelete={(pageId) => handleDeletePage(pageId)}
                    />
                  ))
                )}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarSeparator className="my-3 bg-slate-200/80" />

        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="h-6 px-2 text-[11px] font-semibold text-slate-500">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Search"
                  isActive={resolvedActiveItem === "search"}
                  className={navItemClassName}
                  onClick={() => setActiveItem("search")}
                >
                  <Search className={iconClassName} />
                  <span>Search</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Templates"
                  isActive={resolvedActiveItem === "templates"}
                  className={navItemClassName}
                  onClick={() => {
                    setActiveItem("templates");
                    router.push(`${workspaceHomePath}/templates`);
                  }}
                >
                  <Copy className={iconClassName} />
                  <span>Templates</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Trash"
                  isActive={resolvedActiveItem === "trash"}
                  className={navItemClassName}
                  onClick={() => {
                    setActiveItem("trash");
                    router.push(`${workspaceHomePath}/trash`);
                  }}
                >
                  <Trash2 className={iconClassName} />
                  <span>Trash</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Settings & members"
                  isActive={false}
                  className={navItemClassName}
                  onClick={() => setIsCustomizeWorkspaceOpen(true)}
                >
                  <Settings className={iconClassName} />
                  <span>Settings & members</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Button
                  type="button"
                  className="h-9 w-full justify-start rounded-lg bg-slate-800 px-3 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-slate-700"
                  onClick={handleGlobalNewPage}
                >
                  <Plus className="mr-2 h-3.5 w-3.5" />
                  New page
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200/80 bg-[#F7F7F8] px-3 py-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 border border-slate-200 bg-white">
            <AvatarImage src={user?.imageUrl ?? undefined} />
            <AvatarFallback className="bg-slate-700 text-[10px] font-semibold text-white">
              {getInitial(user?.firstName, "U")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-xs font-semibold text-slate-800">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="truncate text-[11px] text-slate-500">{user?.email}</p>
          </div>
        </div>

        <div className="mt-2 flex gap-1 group-data-[collapsible=icon]:mt-1 group-data-[collapsible=icon]:justify-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 flex-1 justify-start rounded-lg text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:flex-none group-data-[collapsible=icon]:justify-center"
            onClick={() => setIsCustomizeWorkspaceOpen(true)}
          >
            <Settings className="h-3.5 w-3.5" />
            <span className="group-data-[collapsible=icon]:hidden">Settings</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 flex-1 justify-start rounded-lg text-xs text-slate-600 hover:bg-red-50 hover:text-red-600 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:flex-none group-data-[collapsible=icon]:justify-center"
            onClick={handleLogout}
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="group-data-[collapsible=icon]:hidden">Logout</span>
          </Button>
        </div>
      </SidebarFooter>

      <SidebarRail />

      <CreateTeamSpaceDialog
        open={isCreateTeamSpaceOpen}
        onOpenChange={setIsCreateTeamSpaceOpen}
        onCreate={handleCreateTeamSpace}
      />
      <CustomizeWorkspaceDialog
        open={isCustomizeWorkspaceOpen}
        onOpenChange={setIsCustomizeWorkspaceOpen}
        initialValues={{
          name: workspaceDisplayName,
          type: workspaceType,
          size: workspaceSize,
          companySpaceEnabled: isCompanySpaceEnabled,
        }}
        onSave={handleCustomizeWorkspace}
      />
    </ShadcnSidebar>
  );
}
