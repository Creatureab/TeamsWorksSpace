import { syncUser } from "@/lib/sync-user";
import { Workspace } from "@/lib/model/workspace";
import { Project } from "@/lib/model/project";
import dbConnect from "@/lib/mongodb";
import Hero from "./components/Hero";
import Sidebar from "./components/Sidebar";
import { redirect } from "next/navigation";

import { SidebarProvider } from "@/components/ui/sidebar";
import ProjectHero from "../../project/[[...id]]/components/ProjectHero";

export default async function WorkspacePage({
  params,
  searchParams
}: {
  params: Promise<{ id?: string[] }>,
  searchParams: Promise<{ project?: string }>
}) {
  const { id } = await params;
  const { project: projectSlug } = await searchParams;
  const user = await syncUser();
  
  // Require authentication (handled by proxy.ts)
  if (!user) {
    redirect("/login");
  }

  await dbConnect();

  // Get user's workspaces
  const workspaces = await Workspace.find({
    $or: [
      { owner: user._id },
      { "members.user": user._id }
    ]
  }).lean();

  const workspaceId = id?.[0];
  const currentWorkspace = workspaces.find(w => w._id.toString() === workspaceId) || workspaces[0];

  if (!currentWorkspace && workspaces.length === 0) {
    redirect("/onboarding");
  }

  const projects = await Project.find({ workspace: currentWorkspace._id })
    .sort({ order: 1, createdAt: 1 })
    .lean();

  // 3. Find active project if slug is present
  let activeProject = null;
  if (projectSlug) {
    activeProject = projects.find((p: any) => p.slug === projectSlug);
  }

  // Sanitize data for Client Components (converts ObjectIds to strings)
  const serializedUser = JSON.parse(JSON.stringify(user));
  const serializedWorkspaces = JSON.parse(JSON.stringify(workspaces));
  const serializedCurrentWorkspace = JSON.parse(JSON.stringify(currentWorkspace));
  const serializedProjects = JSON.parse(JSON.stringify(projects));
  const serializedActiveProject = activeProject ? JSON.parse(JSON.stringify(activeProject)) : null;

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-[#f6f6f8] text-slate-900 dark:bg-[#101622] dark:text-slate-100">
        <Sidebar
          user={serializedUser}
          workspaces={serializedWorkspaces}
          currentWorkspace={serializedCurrentWorkspace}
          projects={serializedProjects}
        />
        {serializedActiveProject ? (
          <ProjectHero
            user={serializedUser}
            project={serializedActiveProject}
            currentWorkspace={serializedCurrentWorkspace}
          />
        ) : (
          <Hero
            user={serializedUser}
            currentWorkspace={serializedCurrentWorkspace}
            projects={serializedProjects}
          />
        )}
      </div>
    </SidebarProvider>
  );
}
