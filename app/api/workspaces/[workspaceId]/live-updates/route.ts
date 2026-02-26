import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Workspace } from "@/lib/model/workspace";
import { Project } from "@/lib/model/project";
import { syncUser } from "@/lib/sync-user";
import { buildLiveUpdates } from "@/lib/live-updates";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;
    const user = await syncUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await dbConnect();

    const workspace = await Workspace.findById(workspaceId).lean();
    if (!workspace) {
      return new NextResponse("Workspace not found", { status: 404 });
    }

    const userId = user._id?.toString();
    const isOwner = workspace.owner?.toString?.() === userId;
    const isMember = Array.isArray(workspace.members)
      ? workspace.members.some((m: { user?: { toString(): string } }) => m.user?.toString?.() === userId)
      : false;

    if (!isOwner && !isMember) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const projects = await Project.find({ workspace: workspace._id }).lean();

    const updates = buildLiveUpdates({
      workspaceId,
      workspace: workspace as any,
      projects: projects as any,
      clerkId: user.clerkId,
      isWorkspaceMember: true,
    });

    return NextResponse.json({ updates });
  } catch (error) {
    console.error("[LIVE_UPDATES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
