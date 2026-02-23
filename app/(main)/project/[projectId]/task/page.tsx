import { SidebarProvider } from "@/components/ui/sidebar";
import { getProjectViewData } from "../lib/get-project-view-data";
import Sidebar from "../../../workspace/[workspaceId]/components/Sidebar";
import Task from "../components/Task";

export default async function ProjectTaskPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const data = await getProjectViewData(projectId);

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-[#f6f6f8] text-slate-900 dark:bg-[#101622] dark:text-slate-100">
        <Sidebar
          user={data.user}
          workspaces={data.workspaces}
          currentWorkspace={data.currentWorkspace}
          projects={data.projects}
        />
        <Task
          user={data.user}
          project={data.project}
          currentWorkspace={data.currentWorkspace}
        />
      </div>
    </SidebarProvider>
  );
}
