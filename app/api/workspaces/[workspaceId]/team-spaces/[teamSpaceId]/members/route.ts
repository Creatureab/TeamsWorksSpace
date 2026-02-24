import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import { Workspace } from "@/lib/model/workspace";
import { User } from "@/lib/model/user";
import {
    canSeeTeamSpace,
    canEditTeamSpace,
    isMemberOf,
    type TeamSpacePermission,
} from "@/lib/permissions/teamspace";

async function resolveAccess(workspaceId: string, teamSpaceId: string) {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
        return { error: new NextResponse("Unauthorized", { status: 401 }) };
    }

    await dbConnect();

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
        return { error: new NextResponse("Workspace not found", { status: 404 }) };
    }

    const teamSpace = workspace.teamSpaces?.find((ts: { id: string }) => ts.id === teamSpaceId) as TeamSpacePermission | undefined;
    if (!teamSpace) {
        return { error: new NextResponse("Team Space not found", { status: 404 }) };
    }

    const isOwner = workspace.owner.toString() === clerkId || workspace.members?.some((m: any) => m.user.toString() === clerkId && m.role === "Admin");
    // Actually we need to check if clerkId is in the workspace
    const dbUser = await User.findOne({ clerkId });
    if (!dbUser) {
        return { error: new NextResponse("User not found", { status: 404 }) };
    }
    const isMemberOfWorkspace = workspace.owner.toString() === dbUser._id.toString() || workspace.members?.some((m: any) => m.user.toString() === dbUser._id.toString());

    if (!isMemberOfWorkspace) {
        return { error: new NextResponse("Forbidden", { status: 403 }) };
    }

    return { workspace, teamSpace, clerkId, dbUser, isWorkspaceMember: isMemberOfWorkspace };
}

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ workspaceId: string; teamSpaceId: string }> }
) {
    try {
        const { workspaceId, teamSpaceId } = await params;
        const access = await resolveAccess(workspaceId, teamSpaceId);
        if ("error" in access) return access.error;

        const { teamSpace, clerkId, isWorkspaceMember } = access;

        // Requires canSeeTeamSpace permission
        if (!canSeeTeamSpace(clerkId, teamSpace, isWorkspaceMember)) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // Fetch user details for each member
        const memberClerkIds = teamSpace.members.map((m) => m.clerkId);
        const users = await User.find({ clerkId: { $in: memberClerkIds } });

        const enrichedMembers = teamSpace.members.map((m) => {
            const user = users.find((u) => u.clerkId === m.clerkId);
            return {
                clerkId: m.clerkId,
                role: m.role,
                joinedAt: m.joinedAt,
                name: user ? `${user.firstName} ${user.lastName}` : "Unknown User",
                email: user?.email ?? "",
                imageUrl: user?.imageUrl ?? "",
            };
        });

        return NextResponse.json({ members: enrichedMembers });
    } catch (error) {
        console.error("[TEAM_SPACE_MEMBERS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ workspaceId: string; teamSpaceId: string }> }
) {
    try {
        const { workspaceId, teamSpaceId } = await params;
        const access = await resolveAccess(workspaceId, teamSpaceId);
        if ("error" in access) return access.error;

        const { workspace, teamSpace, clerkId } = access;

        // Validations:
        // 1. Requires canEditTeamSpace (Owner only)
        if (!canEditTeamSpace(clerkId, teamSpace)) {
            return NextResponse.json({ error: "Only owners can invite users" }, { status: 403 });
        }

        const body = await req.json();
        const { clerkId: targetClerkId, role } = body;

        if (!targetClerkId) {
            return NextResponse.json({ error: "clerkId is required" }, { status: 400 });
        }
        if (role === 'owner') {
            return NextResponse.json({ error: "Cannot invite as owner. Transfer ownership instead." }, { status: 400 });
        }

        // 2. Check user exists in workspace
        const targetUser = await User.findOne({ clerkId: targetClerkId });
        if (!targetUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        const isTargetInWorkspace = workspace.owner.toString() === targetUser._id.toString() || workspace.members?.some((m: any) => m.user.toString() === targetUser._id.toString());
        if (!isTargetInWorkspace) {
            return NextResponse.json({ error: "User is not a member of this workspace" }, { status: 400 });
        }

        // 3. Check user not already a member of team space
        if (isMemberOf(targetClerkId, teamSpace)) {
            return NextResponse.json({ error: "User is already a member of this team space" }, { status: 409 });
        }

        // Success: push to members array
        const teamSpaceIndex = workspace.teamSpaces.findIndex((ts: any) => ts.id === teamSpaceId);
        workspace.teamSpaces[teamSpaceIndex].members.push({
            clerkId: targetClerkId,
            role: role ?? 'member',
            joinedAt: new Date()
        });

        workspace.updatedAt = new Date();
        await workspace.save();

        // TODO: Notification flow

        return NextResponse.json({ members: workspace.teamSpaces[teamSpaceIndex].members });
    } catch (error) {
        console.error("[TEAM_SPACE_MEMBERS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
