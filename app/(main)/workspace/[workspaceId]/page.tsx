import Hero from "./components/Hero";
import ProjectHero from "../../project/[projectId]/components/ProjectHero";
import { getWorkspaceViewData } from "./lib/get-workspace-view-data";

export default async function WorkspacePage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceId: string }>;
  searchParams: Promise<{ project?: string }>;
}) {
  const { workspaceId } = await params;
  const { project: projectSlug } = await searchParams;
  const data = await getWorkspaceViewData({
    workspaceId,
    projectSlug,
  });

  return data.activeProject ? (
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
    />
  );
}
