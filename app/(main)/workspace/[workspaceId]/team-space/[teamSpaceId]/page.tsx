import ProjectHero from "../../../../project/[projectId]/components/ProjectHero";
import Hero from "../../components/Hero";
import { getWorkspaceViewData } from "../../lib/get-workspace-view-data";
import { pageService } from "@/lib/page-service";
import { redirect } from "next/navigation";

export default async function TeamSpacePage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceId: string; teamSpaceId: string }>;
  searchParams: Promise<{ project?: string }>;
}) {
  const { workspaceId, teamSpaceId } = await params;
  const { project: projectSlug } = await searchParams;

  const data = await getWorkspaceViewData({
    workspaceId,
    teamSpaceId,
    projectSlug,
  });

  // If this team space already has pages, behave like Notion:
  // open the first root page in the hierarchical tree by default.
  const hierarchy = await pageService.getPageHierarchy(workspaceId, teamSpaceId);

  if (hierarchy.length > 0 && hierarchy[0]?.page?.path?.length) {
    const firstRoot = hierarchy[0];
    const pagePath = Array.isArray(firstRoot.page.path)
      ? firstRoot.page.path.join("/")
      : "";

    if (pagePath) {
      redirect(
        `/workspace/${workspaceId}/team-space/${encodeURIComponent(
          teamSpaceId
        )}/page/${pagePath}`
      );
    }
  }

  const teamSpacePath = `/workspace/${workspaceId}/team-space/${encodeURIComponent(teamSpaceId)}`;

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
      teamSpaceId={teamSpaceId}
      projectBasePath={teamSpacePath}
    />
  );
}
