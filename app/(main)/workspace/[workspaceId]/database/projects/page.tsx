import { getWorkspaceViewData } from "../../lib/get-workspace-view-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function ProjectsDatabasePage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const data = await getWorkspaceViewData({ workspaceId });

  return (
    <div className="h-full w-full p-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Projects</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Workspace database view (Notion-style table).
            </p>
          </div>
          <Badge variant="secondary">{data.projects?.length ?? 0} items</Badge>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[45%]">Name</TableHead>
                <TableHead>Team space</TableHead>
                <TableHead>Privacy</TableHead>
                <TableHead className="text-right">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data.projects ?? []).map((project: any) => (
                <TableRow key={project._id}>
                  <TableCell className="font-medium">{project.title}</TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300">
                    {project.teamSpaceId ?? "general"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{project.privacy ?? "workspace"}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-slate-500 dark:text-slate-400">
                    {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : "—"}
                  </TableCell>
                </TableRow>
              ))}

              {(!data.projects || data.projects.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-sm text-slate-500">
                    No projects yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

