import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import { Workspace } from "@/lib/model/workspace";
import { User } from "@/lib/model/user";
import { Project } from "@/lib/model/project";

const allowedVisibilities = ["open", "closed", "private"] as const;
type TeamSpaceVisibility = (typeof allowedVisibilities)[number];

type TeamSpaceItem = {
  id: string;
  name: string;
  visibility: TeamSpaceVisibility;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
};

async function resolveWorkspaceAdminAccess(workspaceId: string) {
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
  const isAdminMember = workspace.members?.some(
    (member: { user: { toString: () => string }; role: string }) =>
      member.user.toString() === dbUser._id.toString() && member.role === "Admin"
  );

  if (!isOwner && !isAdminMember) {
    return { error: new NextResponse("Admin access required", { status: 403 }) };
  }

  return { workspace };
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ workspaceId: string; teamSpaceId: string }> }
) {
  try {
    const { workspaceId, teamSpaceId } = await params;
    const access = await resolveWorkspaceAdminAccess(workspaceId);
    if (access.error) return access.error;

    const workspace = access.workspace!;
    const index = workspace.teamSpaces?.findIndex(
      (space: TeamSpaceItem) => space.id === teamSpaceId
    );

    if (index === undefined || index < 0) {
      return new NextResponse("Team Space not found", { status: 404 });
    }

    const body = await req.json();
    const incomingName = typeof body.name === "string" ? body.name.trim() : undefined;
    const incomingVisibility = body.visibility as TeamSpaceVisibility | undefined;
    const incomingArchived =
      typeof body.archived === "boolean" ? body.archived : undefined;

    if (incomingName !== undefined && incomingName.length === 0) {
      return new NextResponse("Team Space name cannot be empty", { status: 400 });
    }

    if (
      incomingVisibility !== undefined &&
      !allowedVisibilities.includes(incomingVisibility)
    ) {
      return new NextResponse("Invalid visibility", { status: 400 });
    }

    if (incomingName !== undefined) workspace.teamSpaces[index].name = incomingName;
    if (incomingVisibility !== undefined) {
      workspace.teamSpaces[index].visibility = incomingVisibility;
    }
    if (incomingArchived !== undefined) {
      workspace.teamSpaces[index].archived = incomingArchived;
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
      return new NextResponse("General Team Space cannot be deleted", { status: 400 });
    }

    const access = await resolveWorkspaceAdminAccess(workspaceId);
    if (access.error) return access.error;

    const workspace = access.workspace!;
    const exists = workspace.teamSpaces?.some(
      (space: TeamSpaceItem) => space.id === teamSpaceId
    );
    if (!exists) {
      return new NextResponse("Team Space not found", { status: 404 });
    }

    workspace.teamSpaces = workspace.teamSpaces.filter(
      (space: TeamSpaceItem) => space.id !== teamSpaceId
    );
    workspace.updatedAt = new Date();
    await workspace.save();

    await Project.updateMany(
      { workspace: workspace._id, teamSpaceId },
      { $set: { teamSpaceId: null, updatedAt: new Date() } }
    );

    return NextResponse.json({
      teamSpaces: workspace.teamSpaces,
    });
  } catch (error) {
    console.error("[TEAM_SPACE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

