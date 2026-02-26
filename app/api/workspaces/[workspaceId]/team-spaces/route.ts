import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import { Workspace } from "@/lib/model/workspace";
import { User } from "@/lib/model/user";
import { slugify } from "@/lib/utils";
import {
  canSeeTeamSpace,
  computePermissions,
  type TeamSpacePermission,
} from "@/lib/permissions/teamspace";

const allowedAccessTypes = ["open", "closed", "private"] as const;
type TeamSpaceAccessType = (typeof allowedAccessTypes)[number];

const defaultTeamSpace = (clerkId: string) => ({
  id: "general",
  name: "General",
  visibility: "open",
  accessType: "open" as TeamSpaceAccessType,
  description: "",
  icon: "",
  createdBy: clerkId,
  archived: false,
  archivedAt: null,
  members: [{ clerkId, role: "owner", joinedAt: new Date() }],
  createdAt: new Date(),
  updatedAt: new Date(),
});

async function resolveWorkspaceAccess(
  workspaceId: string,
  requireAdmin: boolean
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return { error: new NextResponse("Unauthorized", { status: 401 }) };
  }

  await dbConnect();

  const dbUser = await User.findOne({ clerkId });
  if (!dbUser) {
    return { error: new NextResponse("User not found", { status: 404 }) };
  }

  if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
    return { error: new NextResponse("Invalid workspace id", { status: 400 }) };
  }

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    return { error: new NextResponse("Workspace not found", { status: 404 }) };
  }

  const isOwner = workspace.owner.toString() === dbUser._id.toString();
  const memberRecord = workspace.members?.find(
    (m: { user: { toString(): string }; role: string }) =>
      m.user.toString() === dbUser._id.toString()
  );
  const isMember = Boolean(memberRecord);

  if (!isOwner && !isMember) {
    return { error: new NextResponse("Forbidden", { status: 403 }) };
  }

  if (requireAdmin) {
    const isAdminMember = memberRecord?.role === "Admin";
    if (!isOwner && !isAdminMember) {
      return {
        error: new NextResponse("Admin access required", { status: 403 }),
      };
    }
  }

  return { workspace, clerkId, isWorkspaceMember: isOwner || isMember };
}

function ensureTeamSpaces(
  workspace: { teamSpaces?: unknown[]; updatedAt?: Date; save(): Promise<unknown> },
  clerkId: string
) {
  if (!Array.isArray(workspace.teamSpaces) || workspace.teamSpaces.length === 0) {
    workspace.teamSpaces = [defaultTeamSpace(clerkId)];
    workspace.updatedAt = new Date();
    return workspace.save();
  }

  // Backfill missing owners on legacy General spaces
  const general = (workspace.teamSpaces as unknown[]).find(
    (ts) => (ts as { id?: string }).id === "general"
  ) as { members?: { clerkId: string; role: string; joinedAt?: Date }[] } | undefined;
  if (general && Array.isArray(general.members) && general.members.length === 0) {
    general.members.push({ clerkId, role: "owner", joinedAt: new Date() });
    workspace.updatedAt = new Date();
    return workspace.save();
  }
  return Promise.resolve();
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;
    const access = await resolveWorkspaceAccess(workspaceId, false);
    if (access.error) return access.error;

    const { workspace, clerkId, isWorkspaceMember } = access as {
      workspace: { teamSpaces: TeamSpacePermission[]; save(): Promise<unknown> };
      clerkId: string;
      isWorkspaceMember: boolean;
    };
    await ensureTeamSpaces(workspace as never, clerkId);

    // Filter: private spaces only visible to their members
    const visible = (workspace.teamSpaces as TeamSpacePermission[]).filter(
      (ts) => canSeeTeamSpace(clerkId, ts, isWorkspaceMember)
    );

    // Attach computed permission flags per space
    const teamSpaces = visible.map((ts) => {
      const base =
        typeof (ts as any)?.toObject === "function"
          ? (ts as any).toObject()
          : (ts as unknown as Record<string, unknown>);
      return {
        ...base,
        ...computePermissions(clerkId, ts, isWorkspaceMember),
      };
    });

    return NextResponse.json({ teamSpaces });
  } catch (error) {
    console.error("[TEAM_SPACES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;
    const access = await resolveWorkspaceAccess(workspaceId, true);
    if (access.error) return access.error;

    const { workspace, clerkId, isWorkspaceMember } = access as {
      workspace: { teamSpaces: TeamSpacePermission[]; updatedAt: Date; save(): Promise<unknown> };
      clerkId: string;
      isWorkspaceMember: boolean;
    };
    await ensureTeamSpaces(workspace as never, clerkId);

    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const accessType = (body.accessType ?? body.visibility) as TeamSpaceAccessType | undefined;

    if (!name) {
      return new NextResponse("Team Space name is required", { status: 400 });
    }
    if (accessType && !allowedAccessTypes.includes(accessType)) {
      return new NextResponse("Invalid access type", { status: 400 });
    }

    const baseId = slugify(name) || "team-space";
    let id = baseId;
    const existingIds = new Set(
      (workspace.teamSpaces as unknown as { id: string }[]).map((s) => s.id)
    );
    if (existingIds.has(id)) {
      id = `${baseId}-${Date.now().toString(36)}`;
    }

    const resolvedAccessType = accessType ?? "open";

    const teamSpace = {
      id,
      name,
      visibility: resolvedAccessType,
      accessType: resolvedAccessType,
      description: body.description ?? "",
      icon: body.icon ?? "",
      createdBy: clerkId,
      archived: false,
      archivedAt: null,
      // Creator is automatically added as owner
      members: [{ clerkId, role: "owner", joinedAt: new Date() }],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (workspace.teamSpaces as unknown as object[]).push(teamSpace);
    workspace.updatedAt = new Date();
    await workspace.save();

    const visible = (workspace.teamSpaces as TeamSpacePermission[]).filter((ts) =>
      canSeeTeamSpace(clerkId, ts, isWorkspaceMember)
    );
    const teamSpaces = visible.map((ts) => {
      const base =
        typeof (ts as any)?.toObject === "function"
          ? (ts as any).toObject()
          : (ts as unknown as Record<string, unknown>);
      return {
        ...base,
        ...computePermissions(clerkId, ts, isWorkspaceMember),
      };
    });

    return NextResponse.json({ teamSpace, teamSpaces });
  } catch (error) {
    console.error("[TEAM_SPACES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}



