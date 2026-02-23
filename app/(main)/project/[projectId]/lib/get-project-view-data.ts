import { syncUser } from "@/lib/sync-user";
import { Workspace } from "@/lib/model/workspace";
import { Project } from "@/lib/model/project";
import dbConnect from "@/lib/mongodb";
import { notFound, redirect } from "next/navigation";

export async function getProjectViewData(projectId: string) {
  const user = await syncUser();
  if (!user) redirect("/sign-in");

  if (!projectId) redirect("/workspace");

  await dbConnect();

  const project = await Project.findById(projectId).lean();
  if (!project) notFound();

  const workspace = await Workspace.findById(project.workspace).lean();
  if (!workspace) notFound();

  const isOwner = workspace.owner.toString() === user._id.toString();
  const members = workspace.members as Array<{ user: { toString: () => string } }>;
  const isMember = members.some((member) => member.user.toString() === user._id.toString());

  if (!isOwner && !isMember) {
    redirect("/workspace");
  }

  const workspaces = await Workspace.find({
    $or: [{ owner: user._id }, { "members.user": user._id }],
  }).lean();
  const projects = await Project.find({ workspace: workspace._id }).lean();

  return {
    user: JSON.parse(JSON.stringify(user)),
    workspaces: JSON.parse(JSON.stringify(workspaces)),
    currentWorkspace: JSON.parse(JSON.stringify(workspace)),
    project: JSON.parse(JSON.stringify(project)),
    projects: JSON.parse(JSON.stringify(projects)),
  };
}

