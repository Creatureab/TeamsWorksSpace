"use client";

import {
  ChevronDown,
  ChevronRight,
  Globe,
  Home,
  Lock,
  LogOut,
  MoreHorizontal,
  PanelLeft,
  Plus,
  Settings,
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClerk } from "@clerk/nextjs";
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
import { useEffect, useState } from "react";
import { useSidebarStore } from "@/stores/sidebar-store";
import CreateTeamSpaceDialog, { type TeamSpaceVisibility } from "./CreateTeamSpaceDialog";
import { SpaceSection } from "./SpaceSection";
import { projectToPage } from "@/lib/utils/page";
import type { Page } from "@/lib/types/page";
import CustomizeWorkspaceDialog, {
  type WorkspaceCustomizationPayload,
} from "./CustomizeWorkspaceDialog";

interface SidebarUser {
  _id?: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
}

interface TeamSpaceItem {
  id: string;
  name: string;
  visibility?: TeamSpaceVisibility;
}

interface SidebarWorkspace {
  _id: string;
  name: string;
  type?: "organization" | "personal";
  size?: "1-5" | "6-20" | "21-50" | "50+";
  teamSpaces?: TeamSpaceItem[];
}

interface SidebarProject {
  _id: string;
  slug: string;
  title: string;
  parentId?: string | null;
  order?: number;
  spaceId?: string | null;
  spaceType?: string;
  icon?: string | null;
  createdAt?: string;
  updatedAt?: string;
  workspace?: string;
}

interface SidebarProps {
  user: SidebarUser | null;
  workspaces: SidebarWorkspace[];
  currentWorkspace: SidebarWorkspace | null;
  projects?: SidebarProject[];
}

const initialTeamSpaces: TeamSpaceItem[] = [
  { id: "general", name: "General", visibility: "open" },
  { id: "marketing", name: "Marketing", visibility: "closed" },
  { id: "engineering", name: "Engineering", visibility: "private" },
];

const getInitial = (value?: string | null, fallback = "W") =>
  value?.trim().charAt(0).toUpperCase() || fallback;

const getTeamSpaceId = (name: string) =>
  `${name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`;

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
  const activeTeamSpaceId =
    pathnameParts[0] === "workspace" && pathnameParts[2] === "team-space" && pathnameParts[3]
      ? decodeURIComponent(pathnameParts[3])
      : null;

  const [activeItem, setActiveItem] = useState("home");
  const [isTeamExpanded, setIsTeamExpanded] = useState(true);
  const [isCreatingPage, setIsCreatingPage] = useState(false);
  const [isCreateTeamSpaceOpen, setIsCreateTeamSpaceOpen] = useState(false);
  const [isCustomizeWorkspaceOpen, setIsCustomizeWorkspaceOpen] = useState(false);
  const workspaceTeamSpaces = (currentWorkspace?.teamSpaces?.length ? currentWorkspace.teamSpaces : initialTeamSpaces) as TeamSpaceItem[];
  const [teamSpaces, setTeamSpaces] = useState<TeamSpaceItem[]>(workspaceTeamSpaces);
  const [workspaceDisplayName, setWorkspaceDisplayName] = useState(workspaceNameFromProps);
  const [workspaceType, setWorkspaceType] = useState<"organization" | "personal">(workspaceTypeFromProps);
  const [workspaceSize, setWorkspaceSize] = useState<"1-5" | "6-20" | "21-50" | "50+">(workspaceSizeFromProps);
  const [isCompanySpaceEnabled, setIsCompanySpaceEnabled] = useState(true);

  useEffect(() => {
    setWorkspaceDisplayName(workspaceNameFromProps);
    setWorkspaceType(workspaceTypeFromProps);
    setWorkspaceSize(workspaceSizeFromProps);
  }, [workspaceId, workspaceNameFromProps, workspaceSizeFromProps, workspaceTypeFromProps]);

  useEffect(() => {
    if (currentWorkspace?.teamSpaces?.length) {
      setTeamSpaces(currentWorkspace.teamSpaces as TeamSpaceItem[]);
    }
  }, [currentWorkspace?.teamSpaces]);

  const userId = (user as { _id?: string })?._id ?? "";
  const mySpaceId = userId ? `my-space-${userId}` : null;
  const companySpaceId = workspaceId ? `company-space-${workspaceId}` : null;

  const pages: Page[] = projects.map((p) =>
    projectToPage(
      {
        ...p,
        _id: p._id.toString(),
        workspace: p.workspace?.toString() || workspaceId || "unknown",
        spaceId: p.spaceId ?? (workspaceId ? `company-space-${workspaceId}` : "unknown"),
        spaceType: p.spaceType ?? "company-space",
      },
      workspaceId || "unknown"
    )
  );

  const { setExpandedSpaceIds, expandedSpaceIds, setPages } = useSidebarStore();
  useEffect(() => {
    setPages(pages);
  }, [pages, setPages]);
  useEffect(() => {
    const spaceIds: string[] = [
      mySpaceId,
      companySpaceId,
      ...teamSpaces.map((t) => `team-space-${t.id}`),
    ].filter((id): id is string => id !== null);
    const current = new Set(expandedSpaceIds);
    const toAdd = spaceIds.filter((id) => !current.has(id));
    if (toAdd.length > 0) {
      setExpandedSpaceIds(new Set([...current, ...toAdd]));
    }
  }, [mySpaceId, companySpaceId, teamSpaces, expandedSpaceIds, setExpandedSpaceIds]);

  const initials = getInitial(workspaceDisplayName);

  const workspaceHomePath = workspaceId ? `/workspace/${workspaceId}` : "/workspace";

  const isHomeActive =
    (pathname === workspaceHomePath || pathname === "/workspace" || pathname === "/") &&
    !activeProjectSlug &&
    !activeTeamSpaceId;
  const resolvedActiveItem = pathname.startsWith("/project/")
    ? "pages"
    : activeTeamSpaceId
      ? `team-${activeTeamSpaceId}`
      : isHomeActive
        ? "home"
        : activeItem;
  const isTeamSectionActive =
    Boolean(activeTeamSpaceId) ||
    resolvedActiveItem === "team-spaces" ||
    teamSpaces.some((space) => resolvedActiveItem === `team-${space.id}`);

  // Resolve active project ID (for /project/[id] or ?project=slug)
  const activeProjectId =
    pathname.startsWith("/project/") && pathnameParts[1]
      ? pathnameParts[1]
      : activeProjectSlug
        ? projects.find((p) => p.slug === activeProjectSlug)?._id ?? null
        : null;


  
  const handleCreatePage = async (parentId: string | null, spaceId: string) => {
    if (!workspaceId || isCreatingPage) return;
    setIsCreatingPage(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          parentId: parentId || undefined,
          title: "Untitled",
          spaceId,
          spaceType: spaceId.startsWith("my-space") ? "my-space" : spaceId.startsWith("team-space") ? "team-space" : "company-space",
        }),
      });
      if (!res.ok) throw new Error("Failed to create");
      const data = await res.json();
      router.push(`/project/${data._id}`);
      router.refresh();
    } catch (err) {
      console.error("Failed to create page:", err);
    } finally {
      setIsCreatingPage(false);
    }
  };

  const handleRenamePage = async (id: string, title: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Failed to rename");
      router.refresh();
    } catch (err) {
      console.error("Failed to rename:", err);
    }
  };

  const handleDeletePage = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      if (activeProjectId === id) router.push(workspaceHomePath);
      router.refresh();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  const handleCreateTeamSpace = async ({
    name,
    visibility,
  }: {
    name: string;
    visibility: TeamSpaceVisibility;
  }) => {
    const id = getTeamSpaceId(name);
    const newTeam = { id, name, visibility };
    setTeamSpaces((previous) => [...previous, newTeam]);
    setIsTeamExpanded(true);
    setActiveItem(`team-${id}`);
    if (workspaceId) {
      try {
        const updated = [...teamSpaces, newTeam];
        await fetch(`/api/workspaces/${workspaceId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: workspaceDisplayName,
            type: workspaceType,
            size: workspaceSize,
            teamSpaces: updated,
          }),
        });
      } catch (err) {
        console.error("Failed to persist team space:", err);
      }
    }
    router.push(`${workspaceHomePath}/team-space/${encodeURIComponent(id)}`);
  };

  const handleRenameTeamSpace = (spaceId: string) => {
    const target = teamSpaces.find((space) => space.id === spaceId);
    if (!target) return;

    const nextName = window.prompt("Rename Team Space", target.name);
    const normalizedName = nextName?.trim();
    if (!normalizedName) return;

    setTeamSpaces((previous) =>
      previous.map((space) => (space.id === spaceId ? { ...space, name: normalizedName } : space))
    );
  };

  const handleDeleteTeamSpace = (spaceId: string) => {
    setTeamSpaces((previous) => previous.filter((space) => space.id !== spaceId));
    setActiveItem((previous) => (previous === `team-${spaceId}` ? "team-spaces" : previous));
    if (activeTeamSpaceId === spaceId) {
      router.push(workspaceHomePath);
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
                  onClick={() => setActiveItem("my-space")}
                >
                  <Lock className={iconClassName} />
                  <span>My Space</span>
                </SidebarMenuButton>
                <p className="px-3 pt-1 text-[11px] text-slate-400 group-data-[collapsible=icon]:hidden">
                  Private space, cannot be deleted
                </p>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <div className="relative">
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
                      {isTeamExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                      )}
                    </div>
                  </SidebarMenuButton>
                  <button
                    type="button"
                    aria-label="Create Team Space"
                    onClick={(event) => {
                      event.stopPropagation();
                      setIsCreateTeamSpaceOpen(true);
                    }}
                    className="absolute top-2.5 right-2 inline-flex h-5 w-5 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700 group-data-[collapsible=icon]:top-1.5 group-data-[collapsible=icon]:right-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {isTeamExpanded && (
                  <SidebarMenuSub className="mt-1 border-slate-200">
                    {teamSpaces.map((space) => (
                      <SidebarMenuSubItem key={space.id} className="group/team relative">
                        <SidebarMenuSubButton
                          isActive={resolvedActiveItem === `team-${space.id}`}
                          onClick={() => {
                            setActiveItem(`team-${space.id}`);
                            router.push(`${workspaceHomePath}/team-space/${encodeURIComponent(space.id)}`);
                          }}
                          className="h-8 rounded-lg pr-9 text-[12px] text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 data-[active=true]:bg-blue-50 data-[active=true]:text-blue-700"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                          <span className="truncate">{space.name}</span>
                        </SidebarMenuSubButton>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <span
                              role="button"
                              tabIndex={0}
                              aria-label={`${space.name} options`}
                              className={cn(
                                "absolute top-1.5 right-1 inline-flex h-5 w-5 items-center justify-center rounded-md text-slate-400 opacity-0 transition-all hover:bg-slate-200 hover:text-slate-700 cursor-pointer",
                                "group-hover/team:opacity-100 group-focus-within/team:opacity-100"
                              )}
                            >
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </span>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            side="right"
                            className="w-40 rounded-lg border-slate-200 bg-white"
                          >
                            <DropdownMenuLabel className="text-xs text-slate-500">
                              {formatVisibility(space.visibility || "private")}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleRenameTeamSpace(space.id)}>
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setActiveItem(`team-${space.id}`);
                                router.push(`${workspaceHomePath}/team-space/${encodeURIComponent(space.id)}`);
                              }}
                            >
                              Settings
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => handleDeleteTeamSpace(space.id)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>

              {isCompanySpaceEnabled ? (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="Company Space"
                    isActive={resolvedActiveItem === "company-space"}
                    className={navItemClassName}
                    onClick={() => setActiveItem("company-space")}
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
            Pages
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-0">
            {mySpaceId && (
              <SpaceSection
                spaceId={mySpaceId}
                spaceName="My Space"
                spaceType="my-space"
                pages={pages}
                workspaceId={workspaceId}
                activePageId={activeProjectId}
                onCreatePage={handleCreatePage}
                onRename={handleRenamePage}
                onDelete={handleDeletePage}
              />
            )}
            {teamSpaces.map((team) => {
              const teamSpaceId = `team-space-${team.id}`;
              return (
                <SpaceSection
                  key={team.id}
                  spaceId={teamSpaceId}
                  spaceName={team.name}
                  spaceType="team-space"
                  pages={pages}
                  workspaceId={workspaceId}
                  activePageId={activeProjectId}
                  onCreatePage={handleCreatePage}
                  onRename={handleRenamePage}
                  onDelete={handleDeletePage}
                />
              );
            })}
            {companySpaceId && (
              <SpaceSection
                spaceId={companySpaceId}
                spaceName="Company Space"
                spaceType="company-space"
                pages={pages}
                workspaceId={workspaceId}
                activePageId={activeProjectId}
                onCreatePage={handleCreatePage}
                onRename={handleRenamePage}
                onDelete={handleDeletePage}
              />
            )}
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
