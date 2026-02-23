import { syncUser } from "@/lib/sync-user";
import { Workspace } from "@/lib/model/workspace";
import { Project } from "@/lib/model/project";
import dbConnect from "@/lib/mongodb";
import ProjectHero from "./components/ProjectHero";
import Task from "./components/Task";
import Sidebar from "../../workspace/[[...id]]/components/Sidebar";
import { redirect, notFound } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";

export default async function ProjectPage({ params }: { params: Promise<{ id?: string[] }> }) {
    const { id } = await params;
    const user = await syncUser();
    if (!user) redirect("/login");

    const projectId = id?.[0];
    if (!projectId) redirect("/workspace");
    const view = id?.[1];
    const isTaskView = view === "task";

    if (view && !isTaskView) {
        return notFound();
    }

    await dbConnect();

    // 1. Fetch the project
    const project = await Project.findById(projectId).lean();
    if (!project) return notFound();

    // 2. Fetch the workspace this project belongs to
    const workspace = await Workspace.findById(project.workspace).lean();
    if (!workspace) return notFound();

    // 3. Verify user has access to this workspace
    const isOwner = workspace.owner.toString() === user._id.toString();
    const members = workspace.members as Array<{ user: { toString: () => string } }>;
    const isMember = members.some((member) => member.user.toString() === user._id.toString());

    if (!isOwner && !isMember) {
        redirect("/workspace");
    }

    // 4. Fetch all workspaces for the sidebar
    const workspaces = await Workspace.find({
        $or: [
            { owner: user._id },
            { "members.user": user._id }
        ]
    }).lean();

    // 5. Fetch all projects in the current workspace for the sidebar (sorted for PageTree)
    const projects = await Project.find({ workspace: workspace._id })
        .sort({ order: 1, createdAt: 1 })
        .lean();

    // Sanitize data for Client Components
    const serializedUser = JSON.parse(JSON.stringify(user));
    const serializedWorkspaces = JSON.parse(JSON.stringify(workspaces));
    const serializedCurrentWorkspace = JSON.parse(JSON.stringify(workspace));
    const serializedProject = JSON.parse(JSON.stringify(project));
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
                {isTaskView ? (
                    <Task
                        user={serializedUser}
                        project={serializedProject}
                        currentWorkspace={serializedCurrentWorkspace}
                    />
                ) : (
                    <ProjectHero
                        user={serializedUser}
                        project={serializedProject}
                        currentWorkspace={serializedCurrentWorkspace}
                    />
                )}
            </div>
        </SidebarProvider>
    );
}
