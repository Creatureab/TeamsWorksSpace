import { redirect } from "next/navigation";
import { syncUser } from "@/lib/sync-user";
import { Workspace } from "@/lib/model/workspace";
import { Project } from "@/lib/model/project";
import dbConnect from "@/lib/mongodb";

type WorkspaceViewOptions = {
  workspaceId: string;
  projectSlug?: string | null;
  teamSpaceId?: string | null;
  mySpace?: boolean;
};

export async function getWorkspaceViewData({
  workspaceId,
  projectSlug,
  teamSpaceId,
  mySpace = false,
}: WorkspaceViewOptions) {
  const user = await syncUser();
  if (!user) redirect("/sign-in");

  await dbConnect();

  const workspaces = await Workspace.find({
    $or: [{ owner: user._id }, { "members.user": user._id }],
  }).lean();

  const currentWorkspace =
    workspaces.find((workspace) => workspace._id.toString() === workspaceId) ?? workspaces[0];

  if (!currentWorkspace && workspaces.length === 0) {
    redirect("/workspace/create");
  }

  const projectQuery: {
    workspace: unknown;
    createdBy?: unknown;
    privacy?: string;
    teamSpaceId?: string;
    $or?: Array<Record<string, unknown>>;
  } = {
    workspace: currentWorkspace._id,
  };

  if (mySpace) {
    projectQuery.createdBy = user._id;
    projectQuery.privacy = "private";
  } else if (teamSpaceId) {
    if (teamSpaceId === "general") {
      projectQuery.$or = [
        { teamSpaceId: { $exists: false } },
        { teamSpaceId: null },
        { teamSpaceId: "general" },
      ];
    } else {
      const hasTeamSpace = currentWorkspace.teamSpaces?.some(
        (space: { id: string; archived?: boolean }) => space.id === teamSpaceId && !space.archived
      );
      if (!hasTeamSpace) {
        redirect(`/workspace/${currentWorkspace._id.toString()}`);
      }
      projectQuery.teamSpaceId = teamSpaceId;
    }
  }

  const projects = await Project.find(projectQuery).lean();

  let activeProject = null;
  if (projectSlug) {
    activeProject = projects.find((project: { slug?: string }) => project.slug === projectSlug) ?? null;
  }

  const serializedWorkspaceId = currentWorkspace._id.toString();

  return {
    user: JSON.parse(JSON.stringify(user)),
    workspaces: JSON.parse(JSON.stringify(workspaces)),
    currentWorkspace: JSON.parse(JSON.stringify(currentWorkspace)),
    projects: JSON.parse(JSON.stringify(projects)),
    activeProject: activeProject ? JSON.parse(JSON.stringify(activeProject)) : null,
    context: {
      teamSpaceId: teamSpaceId ?? null,
      mySpace,
      workspaceId: serializedWorkspaceId,
    },
  };
}

