import { auth } from "@clerk/nextjs/server";
import { InboxView } from "../components/Inbox";
import dbConnect from "@/lib/mongodb";
import { User } from "@/lib/model/user";
import { Workspace } from "@/lib/model/workspace";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function loadInvites(workspaceId?: string) {
  const { userId } = await auth();
  if (!userId) return { invites: [], email: "" };
  await dbConnect();
  const user = await User.findOne({ clerkId: userId }).lean();
  if (!user?.email) return { invites: [], email: "" };
  const emailRegex = new RegExp(`^${escapeRegex(user.email)}$`, "i");
  const query: Record<string, unknown> = { "pendingInvites.email": emailRegex };
  if (workspaceId) query._id = workspaceId;
  const workspaces = await Workspace.find(query).lean();
  const invites = workspaces.flatMap((ws: any) =>
    (ws.pendingInvites || [])
      .filter((inv: any) => emailRegex.test(inv.email))
      .map((inv: any) => ({
        workspaceId: ws._id.toString(),
        workspaceName: ws.name,
        role: inv.role || "Member",
        invitedAt: inv.invitedAt?.toISOString?.() ?? inv.invitedAt,
      }))
  );
  return { invites, email: user.email };
}

export default async function InboxPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const { invites, email } = await loadInvites(workspaceId);

  return <InboxView initialInvites={invites} workspaceId={workspaceId} userEmail={email} />;
}
