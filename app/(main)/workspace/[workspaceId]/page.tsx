import Hero from "./components/Hero";
import Sidebar from "./components/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import ProjectHero from "../../project/[projectId]/components/ProjectHero";
import { getWorkspaceViewData } from "./lib/get-workspace-view-data";

export default async function WorkspacePage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceId: string }>;
  searchParams: Promise<{ project?: string; search?: string }>;
}) {
  const { workspaceId } = await params;
  const { project: projectSlug, search: searchQuery } = await searchParams;
  const data = await getWorkspaceViewData({
    workspaceId,
    projectSlug,
    searchQuery,
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
        {data.activeProject ? (
          <ProjectHero
            user={data.user}
            project={data.activeProject}
            currentWorkspace={data.currentWorkspace}
          />
        ) : (
          <Hero
            user={data.user}
            currentWorkspace={data.currentWorkspace}
            projects={data.projects}
            projectBasePath={`/workspace/${workspaceId}`}
            searchQuery={data.searchQuery}
          />
        )}
      </div>
    </SidebarProvider>
  );
}
