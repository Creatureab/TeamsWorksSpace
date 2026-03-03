import type { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import Sidebar from "./components/Sidebar";
import { getWorkspaceViewData } from "./lib/get-workspace-view-data";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const data = await getWorkspaceViewData({ workspaceId });

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-[#f6f6f8] text-slate-900 dark:bg-[#101622] dark:text-slate-100">
        <Sidebar
          user={data.user}
          workspaces={data.workspaces}
          currentWorkspace={data.currentWorkspace}
          projects={data.projects}
        />
        <div className="min-w-0 flex-1 overflow-auto">{children}</div>
      </div>
    </SidebarProvider>
  );
}

