import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import { Workspace } from "@/lib/model/workspace";
import { User } from "@/lib/model/user";

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ workspaceId: string }> }
) {
    try {
        const { workspaceId } = await params;
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        await dbConnect();

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return new NextResponse("Workspace not found", { status: 404 });
        }

        // Check if caller is in workspace
        const dbUser = await User.findOne({ clerkId });
        if (!dbUser) {
            return new NextResponse("User not found", { status: 404 });
        }
        const isCallerInWorkspace = workspace.owner.toString() === dbUser._id.toString() ||
            workspace.members?.some((m: any) => m.user.toString() === dbUser._id.toString());

        if (!isCallerInWorkspace) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // Get all member user IDs
        const memberUserIds = [workspace.owner, ...(workspace.members?.map((m: any) => m.user) || [])];

        // Fetch all users
        const users = await User.find({ _id: { $in: memberUserIds } });

        const enrichedMembers = users.map(user => ({
            clerkId: user.clerkId,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            imageUrl: user.imageUrl,
            // Check workspace role
            role: workspace.owner.toString() === user._id.toString() ? 'Owner' :
                workspace.members.find((m: any) => m.user.toString() === user._id.toString())?.role || 'Member'
        }));

        return NextResponse.json({ members: enrichedMembers });
    } catch (error) {
        console.error("[WORKSPACE_MEMBERS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
