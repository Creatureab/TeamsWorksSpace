import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import { Workspace } from "@/lib/model/workspace";
import { User } from "@/lib/model/user";
import {
    canEditTeamSpace,
    ownerCount,
    canRemoveMember,
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

    return { workspace, teamSpace, clerkId };
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ workspaceId: string; teamSpaceId: string; clerkId: string }> }
) {
    try {
        const { workspaceId, teamSpaceId, clerkId: targetClerkId } = await params;
        const access = await resolveAccess(workspaceId, teamSpaceId);
        if ("error" in access) return access.error;

        const { workspace, teamSpace, clerkId } = access;

        if (!canEditTeamSpace(clerkId, teamSpace)) {
            return NextResponse.json({ error: "Only owners can change roles" }, { status: 403 });
        }

        if (clerkId === targetClerkId) {
            return NextResponse.json({ error: "Cannot change your own role. Transfer ownership or leave instead." }, { status: 400 });
        }

        const body = await req.json();
        const { role } = body;

        if (!['owner', 'member', 'guest'].includes(role)) {
            return NextResponse.json({ error: "Invalid role" }, { status: 400 });
        }

        const teamSpaceIndex = workspace.teamSpaces.findIndex((ts: any) => ts.id === teamSpaceId);
        const memberIndex = workspace.teamSpaces[teamSpaceIndex].members.findIndex((m: any) => m.clerkId === targetClerkId);

        if (memberIndex === -1) {
            return NextResponse.json({ error: "Member not found in team space" }, { status: 404 });
        }

        // If demoting current owner
        const currentRole = workspace.teamSpaces[teamSpaceIndex].members[memberIndex].role;
        if (currentRole === 'owner' && role !== 'owner') {
            if (ownerCount(teamSpace) === 1) {
                return NextResponse.json({ error: "Cannot demote the only owner. Transfer ownership first." }, { status: 400 });
            }
        }

        workspace.teamSpaces[teamSpaceIndex].members[memberIndex].role = role;
        workspace.updatedAt = new Date();
        await workspace.save();

        return NextResponse.json({ members: workspace.teamSpaces[teamSpaceIndex].members });
    } catch (error) {
        console.error("[TEAM_SPACE_MEMBER_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ workspaceId: string; teamSpaceId: string; clerkId: string }> }
) {
    try {
        const { workspaceId, teamSpaceId, clerkId: targetClerkId } = await params;
        const access = await resolveAccess(workspaceId, teamSpaceId);
        if ("error" in access) return access.error;

        const { workspace, teamSpace, clerkId } = access;

        const isSelfRemoval = clerkId === targetClerkId;

        if (!isSelfRemoval && !canEditTeamSpace(clerkId, teamSpace)) {
            return NextResponse.json({ error: "Only owners can remove members" }, { status: 403 });
        }

        if (!canRemoveMember(targetClerkId, teamSpace)) {
            return NextResponse.json({ error: "Cannot remove the only owner of a team space." }, { status: 400 });
        }

        const teamSpaceIndex = workspace.teamSpaces.findIndex((ts: any) => ts.id === teamSpaceId);
        workspace.teamSpaces[teamSpaceIndex].members = workspace.teamSpaces[teamSpaceIndex].members.filter((m: any) => m.clerkId !== targetClerkId);

        workspace.updatedAt = new Date();
        await workspace.save();

        return NextResponse.json({ members: workspace.teamSpaces[teamSpaceIndex].members });
    } catch (error) {
        console.error("[TEAM_SPACE_MEMBER_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
