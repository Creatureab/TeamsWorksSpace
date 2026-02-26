import { SidebarProvider } from "@/components/ui/sidebar";
import Sidebar from "../components/Sidebar";
import { getWorkspaceViewData } from "../lib/get-workspace-view-data";
import CompanySpace from "../components/CompanySpace";
import { buildLiveUpdates } from "@/lib/live-updates";

export default async function CompanySpacePage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const data = await getWorkspaceViewData({ workspaceId });
  const clerkId = (data.user as any)?.clerkId as string;

  const updates = buildLiveUpdates({
    workspaceId,
    workspace: data.currentWorkspace as any,
    projects: data.projects as any,
    clerkId,
    isWorkspaceMember: true,
  });

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-[#0b1020] text-slate-50">
        <Sidebar
          user={data.user}
          workspaces={data.workspaces}
          currentWorkspace={data.currentWorkspace}
          projects={data.projects}
        />
        <CompanySpace
          workspaceId={workspaceId}
          workspaceName={data.currentWorkspace?.name ?? "Workspace"}
          initialUpdates={updates}
          teamSpaces={(data.currentWorkspace as any)?.teamSpaces ?? []}
          projectCount={data.projects?.length ?? 0}
        />
      </div>
    </SidebarProvider>
  );
}
