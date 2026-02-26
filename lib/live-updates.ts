import { canSeeTeamSpace } from "@/lib/permissions/teamspace";

type TeamSpaceShape = {
  id: string;
  name: string;
  description?: string;
  accessType?: "open" | "closed" | "private";
  archived?: boolean;
  updatedAt?: Date | string;
  createdAt?: Date | string;
  members?: Array<{ clerkId: string; role: string; joinedAt?: Date | string }>;
};

type ProjectShape = {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  updatedAt?: Date | string;
  createdAt?: Date | string;
  teamSpaceId?: string | null;
};

type WorkspaceShape = {
  _id: string;
  name: string;
  updatedAt?: Date | string;
  createdAt?: Date | string;
  teamSpaces?: TeamSpaceShape[];
  members?: Array<{ user?: string | { toString(): string } }>;
  owner?: string | { toString(): string };
};

export type LiveUpdateItem = {
  id: string;
  type: "project" | "team-space" | "workspace";
  title: string;
  description?: string;
  timestamp: string;
  href?: string;
  badge?: string;
  meta?: Record<string, unknown>;
};

type BuildLiveUpdatesInput = {
  workspaceId: string;
  workspace: WorkspaceShape;
  projects: ProjectShape[];
  clerkId: string;
  isWorkspaceMember: boolean;
};

const toIso = (value?: Date | string) => {
  if (!value) return new Date().toISOString();
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return new Date().toISOString();
  return date.toISOString();
};

export function buildLiveUpdates({
  workspaceId,
  workspace,
  projects,
  clerkId,
  isWorkspaceMember,
}: BuildLiveUpdatesInput): LiveUpdateItem[] {
  const updates: LiveUpdateItem[] = [];

  const teamSpaces = Array.isArray(workspace.teamSpaces) ? workspace.teamSpaces : [];
  const visibleTeamSpaces = teamSpaces.filter(
    (space) => space && !space.archived && canSeeTeamSpace(clerkId, space as any, isWorkspaceMember)
  );

  visibleTeamSpaces.forEach((space) => {
    updates.push({
      id: `team-space-${space.id}`,
      type: "team-space",
      title: `${space.name} team space`,
      description: space.description || `Access: ${space.accessType ?? "open"}`,
      timestamp: toIso(space.updatedAt ?? space.createdAt),
      href: `/workspace/${workspaceId}/team-space/${encodeURIComponent(space.id)}`,
      badge: "Team space",
      meta: {
        accessType: space.accessType ?? "open",
        memberCount: space.members?.length ?? 0,
      },
    });
  });

  projects.forEach((project) => {
    if (!project?._id) return;
    updates.push({
      id: `project-${project._id.toString()}`,
      type: "project",
      title: project.title,
      description: project.description || (project.teamSpaceId ? "Team project update" : "Workspace project"),
      timestamp: toIso(project.updatedAt ?? project.createdAt),
      href: `/workspace/${workspaceId}?project=${encodeURIComponent(project.slug)}`,
      badge: project.teamSpaceId ? "Team project" : "Workspace project",
      meta: {
        teamSpaceId: project.teamSpaceId ?? "general",
      },
    });
  });

  updates.push({
    id: `workspace-${workspace._id.toString()}`,
    type: "workspace",
    title: `${workspace.name} workspace`,
    description: `${visibleTeamSpaces.length} team spaces / ${projects.length} projects`,
    timestamp: toIso(workspace.updatedAt ?? workspace.createdAt),
    href: `/workspace/${workspaceId}`,
    badge: "Workspace",
  });

  updates.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return updates;
}
