import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import { Workspace } from "@/lib/model/workspace";
import { User } from "@/lib/model/user";
import { Project } from "@/lib/model/project";
import {
  canEditTeamSpace,
  canSeeTeamSpace,
  type TeamSpacePermission,
} from "@/lib/permissions/teamspace";

const allowedAccessTypes = ["open", "closed", "private"] as const;
type TeamSpaceAccessType = (typeof allowedAccessTypes)[number];

async function resolveAccess(workspaceId: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return { error: new NextResponse("Unauthorized", { status: 401 }) };
  }

  await dbConnect();

  const dbUser = await User.findOne({ clerkId });
  if (!dbUser) {
    return { error: new NextResponse("User not found", { status: 404 }) };
  }

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    return { error: new NextResponse("Workspace not found", { status: 404 }) };
  }

  const isOwner = workspace.owner.toString() === dbUser._id.toString();
  const isMember = workspace.members?.some(
    (m: { user: { toString(): string } }) =>
      m.user.toString() === dbUser._id.toString()
  );
  const isWorkspaceMember = isOwner || Boolean(isMember);

  return { workspace, clerkId, isWorkspaceMember };
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ workspaceId: string; teamSpaceId: string }> }
) {
  try {
    const { workspaceId, teamSpaceId } = await params;
    const access = await resolveAccess(workspaceId);
    if ("error" in access) return access.error;

    const { workspace, clerkId } = access;

    const index: number = workspace.teamSpaces?.findIndex(
      (space: { id: string }) => space.id === teamSpaceId
    );
    if (index === undefined || index < 0) {
      return new NextResponse("Team Space not found", { status: 404 });
    }

    const teamSpace = workspace.teamSpaces[index] as TeamSpacePermission;

    // Permission: must be owner of the team space
    if (!canEditTeamSpace(clerkId, teamSpace)) {
      return NextResponse.json(
        { error: "Only owners can edit team space settings" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const incomingName =
      typeof body.name === "string" ? body.name.trim() : undefined;
    const incomingAccessType = (
      body.accessType ?? body.visibility
    ) as TeamSpaceAccessType | undefined;
    const incomingArchived =
      typeof body.archived === "boolean" ? body.archived : undefined;
    const incomingDescription =
      typeof body.description === "string" ? body.description : undefined;
    const incomingIcon =
      typeof body.icon === "string" ? body.icon : undefined;

    if (incomingName !== undefined && incomingName.length === 0) {
      return new NextResponse("Team Space name cannot be empty", { status: 400 });
    }
    if (
      incomingAccessType !== undefined &&
      !allowedAccessTypes.includes(incomingAccessType)
    ) {
      return new NextResponse("Invalid access type", { status: 400 });
    }

    if (incomingName !== undefined) workspace.teamSpaces[index].name = incomingName;
    if (incomingAccessType !== undefined) {
      // Keep both fields in sync
      workspace.teamSpaces[index].accessType = incomingAccessType;
      workspace.teamSpaces[index].visibility = incomingAccessType;
    }
    if (incomingArchived !== undefined) {
      workspace.teamSpaces[index].archived = incomingArchived;
      workspace.teamSpaces[index].archivedAt = incomingArchived
        ? new Date()
        : null;
    }
    if (incomingDescription !== undefined) {
      workspace.teamSpaces[index].description = incomingDescription;
    }
    if (incomingIcon !== undefined) {
      workspace.teamSpaces[index].icon = incomingIcon;
    }
    workspace.teamSpaces[index].updatedAt = new Date();
    workspace.updatedAt = new Date();

    await workspace.save();

    return NextResponse.json({
      teamSpace: workspace.teamSpaces[index],
      teamSpaces: workspace.teamSpaces,
    });
  } catch (error) {
    console.error("[TEAM_SPACE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ workspaceId: string; teamSpaceId: string }> }
) {
  try {
    const { workspaceId, teamSpaceId } = await params;
    if (teamSpaceId === "general") {
      return new NextResponse("General Team Space cannot be deleted", {
        status: 400,
      });
    }

    const access = await resolveAccess(workspaceId);
    if ("error" in access) return access.error;

    const { workspace, clerkId } = access;

    const teamSpace = workspace.teamSpaces?.find(
      (s: { id: string }) => s.id === teamSpaceId
    ) as TeamSpacePermission | undefined;

    if (!teamSpace) {
      return new NextResponse("Team Space not found", { status: 404 });
    }

    // Permission: must be owner of the team space
    if (!canEditTeamSpace(clerkId, teamSpace)) {
      return NextResponse.json(
        { error: "Only owners can delete a team space" },
        { status: 403 }
      );
    }

    workspace.teamSpaces = workspace.teamSpaces.filter(
      (s: { id: string }) => s.id !== teamSpaceId
    );
    workspace.updatedAt = new Date();
    await workspace.save();

    await Project.updateMany(
      { workspace: workspace._id, teamSpaceId },
      { $set: { teamSpaceId: null, updatedAt: new Date() } }
    );

    return NextResponse.json({ teamSpaces: workspace.teamSpaces });
  } catch (error) {
    console.error("[TEAM_SPACE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}



