import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getWorkspaceViewData } from "../../../lib/get-workspace-view-data";
import { TeamSpaceSettingsPanel } from "@/components/TeamSpaceSettingsPanel";
import { SidebarProvider } from "@/components/ui/sidebar";
import Sidebar from "../../../components/Sidebar";
import { User } from "@/lib/model/user";
import { canEditTeamSpace, type TeamSpacePermission } from "@/lib/permissions/teamspace";

export default async function TeamSpaceSettingsPage({
  params,
}: {
  params: Promise<{ workspaceId: string; teamSpaceId: string }>;
}) {
  const { workspaceId, teamSpaceId } = await params;
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    redirect("/sign-in");
  }

  const data = await getWorkspaceViewData({
    workspaceId,
    teamSpaceId,
  });

  const teamSpace = data.currentWorkspace.teamSpaces.find(
    (ts: any) => ts.id === teamSpaceId
  ) as TeamSpacePermission | undefined;

  if (!teamSpace) {
    redirect(`/workspace/${workspaceId}`);
  }

  // Permission Check: Must be owner to edit settings
  const currentUserClerkId = clerkId;
  if (!canEditTeamSpace(currentUserClerkId, teamSpace)) {
    redirect(`/workspace/${workspaceId}/team-space/${teamSpaceId}`);
  }

  // Fetch enriched members
  const memberClerkIds = teamSpace.members.map((m) => m.clerkId);
  const users = await User.find({ clerkId: { $in: memberClerkIds } });

  const enrichedMembers = teamSpace.members.map((m) => {
    const user = users.find((u) => u.clerkId === m.clerkId);
    return {
      clerkId: m.clerkId,
      role: m.role,
      joinedAt: m.joinedAt.toISOString(),
      name: user ? `${user.firstName} ${user.lastName}` : "Unknown User",
      email: user?.email ?? "",
      imageUrl: user?.imageUrl ?? "",
    };
  });

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-[#f6f6f8] text-slate-900 dark:bg-[#101622] dark:text-slate-100">
        <Sidebar
          user={data.user}
          workspaces={data.workspaces}
          currentWorkspace={data.currentWorkspace}
          projects={data.projects}
        />
        <TeamSpaceSettingsPanel
          workspaceId={workspaceId}
          teamSpace={{
            id: teamSpace.id,
            name: teamSpace.name,
            description: teamSpace.description,
            icon: teamSpace.icon,
            accessType: teamSpace.accessType,
            archived: teamSpace.archived,
          }}
          initialMembers={enrichedMembers as any}
          currentUserClerkId={currentUserClerkId}
        />
      </div>
    </SidebarProvider>
  );
}
