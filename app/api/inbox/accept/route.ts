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

    const inviteIndex = workspace.pendingInvites.findIndex(
      (inv: { email: string }) => inv.email?.toLowerCase() === user.email.toLowerCase()
    );
    if (inviteIndex === -1) return new NextResponse("Invite not found", { status: 404 });

    const invite = workspace.pendingInvites[inviteIndex];

    // Avoid duplicates
    const alreadyMember = workspace.members.some(
      (m: { user?: { toString(): string } }) => m.user?.toString() === user._id.toString()
    );
    if (!alreadyMember) {
      workspace.members.push({ user: user._id, role: invite.role || "Member" });
    }

    workspace.pendingInvites.splice(inviteIndex, 1);
    await workspace.save();

    return NextResponse.json({ workspaceId, role: invite.role || "Member" });
  } catch (error) {
    console.error("[INBOX_ACCEPT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
