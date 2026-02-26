import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import { User } from "@/lib/model/user";
import { Workspace } from "@/lib/model/workspace";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { workspaceId } = await req.json();
    if (!workspaceId) return new NextResponse("workspaceId is required", { status: 400 });

    await dbConnect();
    const user = await User.findOne({ clerkId: userId });
    if (!user) return new NextResponse("User not found", { status: 404 });

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return new NextResponse("Workspace not found", { status: 404 });

    const beforeCount = workspace.pendingInvites.length;
    workspace.pendingInvites = workspace.pendingInvites.filter(
      (inv: { email: string }) => inv.email?.toLowerCase() !== user.email.toLowerCase()
    );

    if (workspace.pendingInvites.length === beforeCount) {
      return new NextResponse("Invite not found", { status: 404 });
    }

    await workspace.save();
    return NextResponse.json({ workspaceId });
  } catch (error) {
    console.error("[INBOX_DECLINE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
