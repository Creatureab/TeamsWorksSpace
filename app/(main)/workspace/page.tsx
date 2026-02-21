import { redirect } from "next/navigation";
import { syncUser } from "@/lib/sync-user";
import { Workspace } from "@/lib/model/workspace";
import dbConnect from "@/lib/mongodb";

export default async function WorkspaceIndexPage() {
  const user = await syncUser();
  if (!user) redirect("/sign-in");

  await dbConnect();

  const workspaces = await Workspace.find({
    $or: [{ owner: user._id }, { "members.user": user._id }],
  })
    .sort({ updatedAt: -1 })
    .lean();

  if (!workspaces.length) {
    redirect("/workspace/create");
  }

  redirect(`/workspace/${workspaces[0]._id.toString()}`);
}

