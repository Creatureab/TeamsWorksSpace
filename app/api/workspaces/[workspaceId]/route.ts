import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import { Workspace } from "@/lib/model/workspace";
import { User } from "@/lib/model/user";

const allowedTypes = ["organization", "personal"] as const;
const allowedSizes = ["1-5", "6-20", "21-50", "50+"] as const;

type WorkspaceType = (typeof allowedTypes)[number];
type WorkspaceSize = (typeof allowedSizes)[number];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { workspaceId } = await params;
    if (!workspaceId) {
      return new NextResponse("Workspace ID is required", { status: 400 });
    }

    await dbConnect();

    const dbUser = await User.findOne({ clerkId });
    if (!dbUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return new NextResponse("Workspace not found", { status: 404 });
    }

    const isOwner = workspace.owner.toString() === dbUser._id.toString();
    const isAdminMember = workspace.members?.some(
      (member: { user: { toString: () => string }; role: string }) =>
        member.user.toString() === dbUser._id.toString() && member.role === "Admin"
    );

    if (!isOwner && !isAdminMember) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await req.json();
    const incomingName = typeof body.name === "string" ? body.name.trim() : undefined;
    const incomingType = body.type as WorkspaceType | undefined;
    const incomingSize = body.size as WorkspaceSize | undefined;

    if (incomingName !== undefined && incomingName.length === 0) {
      return new NextResponse("Workspace name cannot be empty", { status: 400 });
    }

    if (incomingType !== undefined && !allowedTypes.includes(incomingType)) {
      return new NextResponse("Invalid workspace type", { status: 400 });
    }

    if (incomingSize !== undefined && !allowedSizes.includes(incomingSize)) {
      return new NextResponse("Invalid team size", { status: 400 });
    }

    if (incomingName !== undefined) workspace.name = incomingName;
    if (incomingType !== undefined) workspace.type = incomingType;
    if (incomingSize !== undefined) workspace.size = incomingSize;

    const incomingTeamSpaces = body.teamSpaces;
    if (Array.isArray(incomingTeamSpaces)) {
      workspace.teamSpaces = incomingTeamSpaces.map((ts: { id: string; name: string; visibility?: string }) => ({
        id: ts.id,
        name: ts.name,
        visibility: ts.visibility ?? 'open',
      }));
    }

    workspace.updatedAt = new Date();

    await workspace.save();

    const teamSpaces = (workspace.teamSpaces ?? []).map((ts: { id: string; name: string; visibility: string }) => ({
      id: ts.id,
      name: ts.name,
      visibility: ts.visibility,
    }));

    return NextResponse.json({
      _id: workspace._id,
      name: workspace.name,
      type: workspace.type,
      size: workspace.size,
      teamSpaces,
      updatedAt: workspace.updatedAt,
    });
  } catch (error) {
    console.error("[WORKSPACE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

