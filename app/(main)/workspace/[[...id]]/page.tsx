import { syncUser } from "@/lib/sync-user";
import { Workspace } from "@/lib/model/workspace";
import { Project } from "@/lib/model/project";
import dbConnect from "@/lib/mongodb";
import Hero from "./components/Hero";
import Sidebar from "./components/Sidebar";
import { redirect } from "next/navigation";

import { SidebarProvider } from "@/components/ui/sidebar";

export default async function WorkspacePage({ params }: { params: Promise<{ id?: string[] }> }) {
  const { id } = await params;
  const user = await syncUser();
  if (!user) redirect("/sign-in");

  await dbConnect();

  const workspaces = await Workspace.find({
    $or: [
      { owner: user._id },
      { "members.user": user._id }
    ]
  }).lean();

  const workspaceId = id?.[0];
  const currentWorkspace = workspaces.find(w => w._id.toString() === workspaceId) || workspaces[0];

  if (!currentWorkspace && workspaces.length === 0) {
    redirect("/workspace/create");
  }

  const projects = await Project.find({ workspace: currentWorkspace._id }).lean();

  // Sanitize data for Client Components (converts ObjectIds to strings)
  const serializedUser = JSON.parse(JSON.stringify(user));
  const serializedWorkspaces = JSON.parse(JSON.stringify(workspaces));
  const serializedCurrentWorkspace = JSON.parse(JSON.stringify(currentWorkspace));
  const serializedProjects = JSON.parse(JSON.stringify(projects));

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-[#f6f6f8] text-slate-900 dark:bg-[#101622] dark:text-slate-100">
        <Sidebar
          user={serializedUser}
          workspaces={serializedWorkspaces}
          currentWorkspace={serializedCurrentWorkspace}
          projects={serializedProjects}
        />
        <Hero
          user={serializedUser}
          currentWorkspace={serializedCurrentWorkspace}
        />
      </div>
    </SidebarProvider>
  );
}
