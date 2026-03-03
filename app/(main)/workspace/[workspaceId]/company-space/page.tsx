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
    <div className="h-full w-full bg-[#0b1020] text-slate-50">
      <CompanySpace
        workspaceId={workspaceId}
        workspaceName={data.currentWorkspace?.name ?? "Workspace"}
        initialUpdates={updates}
        teamSpaces={(data.currentWorkspace as any)?.teamSpaces ?? []}
        projectCount={data.projects?.length ?? 0}
      />
    </div>
  );
}
