import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import { Workspace } from "@/lib/model/workspace";
import { User } from "@/lib/model/user";
import {
    canSelfJoin,
    isMemberOf,
    type TeamSpacePermission,
} from "@/lib/permissions/teamspace";

export async function POST(
    _req: Request,
    { params }: { params: Promise<{ workspaceId: string; teamSpaceId: string }> }
) {
    try {
        const { workspaceId, teamSpaceId } = await params;
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        await dbConnect();

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return new NextResponse("Workspace not found", { status: 404 });
        }

        const teamSpace = workspace.teamSpaces?.find((ts: { id: string }) => ts.id === teamSpaceId) as TeamSpacePermission | undefined;
        if (!teamSpace) {
            return new NextResponse("Team Space not found", { status: 404 });
        }

        // Validation 1: Already a member
        if (isMemberOf(clerkId, teamSpace)) {
            return NextResponse.json({ error: "You are already a member" }, { status: 400 });
        }

        // Validation 2: Can self join (must be 'open' space)
        if (!canSelfJoin(clerkId, teamSpace)) {
            return NextResponse.json({ error: "This space requires an invitation to join" }, { status: 403 });
        }

        const teamSpaceIndex = workspace.teamSpaces.findIndex((ts: any) => ts.id === teamSpaceId);
        workspace.teamSpaces[teamSpaceIndex].members.push({
            clerkId,
            role: 'member',
            joinedAt: new Date()
        });

        workspace.updatedAt = new Date();
        await workspace.save();

        return NextResponse.json({
            teamSpace: workspace.teamSpaces[teamSpaceIndex],
            isMember: true
        });
    } catch (error) {
        console.error("[TEAM_SPACE_JOIN_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
