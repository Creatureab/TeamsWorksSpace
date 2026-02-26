import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import { User } from "@/lib/model/user";
import { Workspace } from "@/lib/model/workspace";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function findInvites(email: string, workspaceId?: string) {
  await dbConnect();
  const emailRegex = new RegExp(`^${escapeRegex(email)}$`, "i");
  const query: Record<string, unknown> = { "pendingInvites.email": emailRegex };
  if (workspaceId) {
    query._id = workspaceId;
  }

  const workspaces = await Workspace.find(query).lean();

  return workspaces.flatMap((ws: any) =>
    (ws.pendingInvites || [])
      .filter((inv: any) => emailRegex.test(inv.email))
      .map((inv: any) => ({
        workspaceId: ws._id.toString(),
        workspaceName: ws.name,
        role: inv.role || "Member",
        invitedAt: inv.invitedAt,
      }))
  );
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId") || undefined;

    const user = await User.findOne({ clerkId: userId }).lean();
    if (!user?.email) return new NextResponse("User email not found", { status: 404 });

    const invites = await findInvites(user.email, workspaceId);
    return NextResponse.json({ invites });
  } catch (error) {
    console.error("[INBOX_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
