import WorkspacePage from "../../../page";

export default async function TeamSpaceMembersPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceId: string; teamSpaceId: string }>;
  searchParams: Promise<{ project?: string }>;
}) {
  const { workspaceId } = await params;
  return WorkspacePage({
    params: Promise.resolve({ workspaceId }),
    searchParams,
  });
}
