import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import { Workspace } from "@/lib/model/workspace";
import { User } from "@/lib/model/user";
import { slugify } from "@/lib/utils";

const allowedVisibilities = ["open", "closed", "private"] as const;
type TeamSpaceVisibility = (typeof allowedVisibilities)[number];

type TeamSpaceInput = {
  id: string;
  name: string;
  visibility: TeamSpaceVisibility;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const defaultTeamSpace = (): TeamSpaceInput => ({
  id: "general",
  name: "General",
  visibility: "open",
  archived: false,
  createdAt: new Date(),
  updatedAt: new Date(),
});

async function resolveWorkspaceAccess(workspaceId: string, requireAdmin: boolean) {
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
    (member: { user: { toString: () => string } }) =>
      member.user.toString() === dbUser._id.toString()
  );

  if (!isOwner && !isMember) {
    return { error: new NextResponse("Forbidden", { status: 403 }) };
  }

  if (requireAdmin) {
    const isAdminMember = workspace.members?.some(
      (member: { user: { toString: () => string }; role: string }) =>
        member.user.toString() === dbUser._id.toString() && member.role === "Admin"
    );

    if (!isOwner && !isAdminMember) {
      return { error: new NextResponse("Admin access required", { status: 403 }) };
    }
  }

  return { workspace };
}

function ensureTeamSpaces(workspace: {
  teamSpaces?: TeamSpaceInput[];
  updatedAt?: Date;
  save: () => Promise<unknown>;
}) {
  if (!Array.isArray(workspace.teamSpaces) || workspace.teamSpaces.length === 0) {
    workspace.teamSpaces = [defaultTeamSpace()];
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

    const workspace = access.workspace!;
    await ensureTeamSpaces(workspace);

    return NextResponse.json({
      teamSpaces: workspace.teamSpaces,
    });
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

    const workspace = access.workspace!;
    await ensureTeamSpaces(workspace);

    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const visibility = body.visibility as TeamSpaceVisibility | undefined;

    if (!name) {
      return new NextResponse("Team Space name is required", { status: 400 });
    }

    if (visibility && !allowedVisibilities.includes(visibility)) {
      return new NextResponse("Invalid visibility", { status: 400 });
    }

    const baseId = slugify(name) || "team-space";
    let id = baseId;
    const existingIds = new Set(workspace.teamSpaces.map((space: TeamSpaceInput) => space.id));
    if (existingIds.has(id)) {
      id = `${baseId}-${Date.now().toString(36)}`;
    }

    const teamSpace: TeamSpaceInput = {
      id,
      name,
      visibility: visibility ?? "open",
      archived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    workspace.teamSpaces.push(teamSpace);
    workspace.updatedAt = new Date();
    await workspace.save();

    return NextResponse.json({
      teamSpace,
      teamSpaces: workspace.teamSpaces,
    });
  } catch (error) {
    console.error("[TEAM_SPACES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

