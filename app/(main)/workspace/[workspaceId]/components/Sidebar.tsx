"use client";

import {
  Archive,
  ChevronDown,
  ChevronRight,
  Copy,
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
  const favoriteProjects = projects.slice(0, 4);
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

  const getTeamSpacePath = (
    spaceId: string,
    section?: "settings" | "members" | "permissions"
  ) => {
    const basePath = `${workspaceHomePath}/team-space/${encodeURIComponent(spaceId)}`;
    return section ? `${basePath}/${section}` : basePath;
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

  const navItemClassName =
    "h-9 rounded-lg px-2.5 text-[13px] font-medium text-slate-600 transition-colors duration-200 hover:bg-slate-200/75 hover:text-slate-900 data-[active=true]:bg-blue-50 data-[active=true]:text-blue-700 data-[active=true]:shadow-[inset_0_0_0_1px_rgba(37,99,235,0.2)]";
  const iconClassName = "h-4 w-4 text-slate-500";

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
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
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
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
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
                    <button
                      type="button"
                      aria-label="Create Team Space"
                      onClick={(event) => {
                        event.stopPropagation();
                        setIsCreateTeamSpaceOpen(true);
                      }}
                      className="inline-flex h-5 w-5 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
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
                              "h-8 rounded-lg pr-9 text-[12px] text-slate-600 transition-colors hover:bg-slate-200/60 hover:text-slate-900",
                              resolvedActiveItem === `team-${space.id}` ? "bg-blue-50 text-blue-700" : "",
                              !space.isMember && space.accessType === 'closed' ? "opacity-60 grayscale-[0.5]" : ""
                            )}
                          >
                            <span className={cn(
                              "h-1.5 w-1.5 rounded-full transition-colors",
                              space.isMember ? "bg-blue-500" : "bg-slate-400"
                            )} />
                            <span className="truncate flex items-center gap-1.5">
                              {space.name}
                              {!space.isMember && space.accessType === 'closed' && (
                                <Lock className="h-2.5 w-2.5 text-slate-400" />
                              )}
                            </span>
                          </SidebarMenuSubButton>

                          {!space.isMember && space.accessType === 'open' && (
                            <button
                              onClick={() => handleJoinTeamSpace(space.id)}
                              className="absolute right-9 top-1.5 hidden group-hover/team:flex h-5 items-center rounded bg-blue-600 px-1.5 text-[10px] font-bold text-white hover:bg-blue-700"
                            >
                              Join
                            </button>
                          )}


                          {space.canAccess && (
                            <div className="ml-4 mt-1 space-y-0.5 pr-8">
                              <p className="px-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                Projects
                              </p>
                              {projectsForTeamSpace(space.id).length > 0 ? (
                                projectsForTeamSpace(space.id).map((project) => (
                                  <button
                                    key={project._id}
                                    type="button"
                                    onClick={() => {
                                      setActiveItem(`team-${space.id}`);
                                      router.push(
                                        `${getTeamSpacePath(space.id)}?project=${encodeURIComponent(project.slug)}`
                                      );
                                    }}
                                    className={cn(
                                      "flex h-7 w-full items-center gap-2 rounded-md px-2 text-left text-[12px] text-slate-500 transition-colors hover:bg-slate-200/60 hover:text-slate-900",
                                      activeTeamSpaceId === space.id && activeProjectSlug === project.slug
                                        ? "bg-blue-50 text-blue-700"
                                        : ""
                                    )}
                                  >
                                    <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                                    <span className="truncate">{project.title}</span>
                                  </button>
                                ))
                              ) : (
                                <p className="px-2 py-1 text-[11px] text-slate-400">No projects assigned</p>
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

        <SidebarSeparator className="my-3 bg-slate-200/80" />

        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="h-6 px-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
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
                            className="h-8 rounded-lg text-[12px] text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 data-[active=true]:bg-blue-50 data-[active=true]:text-blue-700"
                          >
                            <Star className="h-3.5 w-3.5 text-slate-400" />
                            <span className="truncate">{project.title}</span>
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
                  tooltip="Inbox"
                  isActive={resolvedActiveItem === "inbox"}
                  className={navItemClassName}
                  onClick={() => {
                    setActiveItem("inbox");
                    router.push(`${workspaceHomePath}/inbox`);
                  }}
                >
                  <Inbox className={iconClassName} />
                  <span>Inbox</span>
                </SidebarMenuButton>
                {typeof inboxCount === "number" && inboxCount > 0 ? (
                  <SidebarMenuBadge className="right-2 rounded-full bg-blue-100 px-1.5 text-[10px] font-semibold text-blue-700">
                    {inboxCount}
                  </SidebarMenuBadge>
                ) : null}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200/80 bg-[#F7F7F8] px-3 py-3">
        <div className="rounded-lg border border-slate-200/90 bg-white p-2">
          <div className="flex items-center gap-2 rounded-md p-1">
            <Avatar className="h-8 w-8 border border-slate-200">
              <AvatarImage src={user?.imageUrl ?? undefined} />
              <AvatarFallback className="bg-slate-800 text-[10px] font-semibold text-white">
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
