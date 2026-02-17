import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { User } from "@/lib/model/user";
import { Workspace } from "@/lib/model/workspace";

/**
 * GET /api/me/workspace
 * Returns the user's workspace information including:
 * - Workspaces they own
 * - Workspaces they are a member of
 * - Their role in each workspace
 */
export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        await dbConnect();

        // Find the user in the database
        const user = await User.findOne({ clerkId: userId });

        if (!user) {
            return new NextResponse("User not found in database", { status: 404 });
        }

        // Find workspaces where user is the owner
        const ownedWorkspaces = await Workspace.find({ owner: user._id })
            .select('_id name slug type members pendingInvites createdAt')
            .lean();

        // Find workspaces where user is a member
        const memberWorkspaces = await Workspace.find({
            'members.user': user._id,
            owner: { $ne: user._id } // Exclude owned workspaces
        })
            .select('_id name slug type members createdAt')
            .lean();

        // Get user's role in member workspaces
        const memberWorkspacesWithRole = memberWorkspaces.map(workspace => {
            const member = workspace.members.find(
                (m: any) => m.user.toString() === user._id.toString()
            );
            return {
                ...workspace,
                userRole: member?.role || 'Member'
            };
        });

        // Get user's role in owned workspaces (always Admin)
        const ownedWorkspacesWithRole = ownedWorkspaces.map(workspace => ({
            ...workspace,
            userRole: 'Admin',
            hasInvitedMembers: workspace.pendingInvites && workspace.pendingInvites.length > 0,
            memberCount: workspace.members ? workspace.members.length : 0
        }));

        return NextResponse.json({
            ownedWorkspaces: ownedWorkspacesWithRole,
            memberWorkspaces: memberWorkspacesWithRole,
            hasWorkspace: ownedWorkspaces.length > 0 || memberWorkspaces.length > 0,
            primaryWorkspaceId: ownedWorkspaces[0]?._id || memberWorkspaces[0]?._id || null
        });
    } catch (error) {
        console.error("[USER_WORKSPACE_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
