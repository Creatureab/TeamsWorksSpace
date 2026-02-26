import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import { Workspace } from "@/lib/model/workspace";
import { User } from "@/lib/model/user";
import {
    canManageSecurity,
    validateSecuritySettings,
    type TeamSpacePermission,
} from "@/lib/permissions/teamspace";

async function resolveAccess(workspaceId: string) {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
        return { error: new NextResponse("Unauthorized", { status: 401 }) };
    }

    await dbConnect();

    const dbUser = await User.findOne({ clerkId });
    if (!dbUser) {
        return { error: new NextResponse("User not found", { status: 404 }) };
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
        return { error: new NextResponse("Workspace not found", { status: 404 }) };
    }

    return { workspace, clerkId };
}

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ workspaceId: string; teamSpaceId: string }> }
) {
    try {
        const { workspaceId, teamSpaceId } = await context.params;
        const access = await resolveAccess(workspaceId);
        if ("error" in access) return access.error;

        const { workspace, clerkId } = access;

        const index = workspace.teamSpaces?.findIndex(
            (space: { id: string }) => space.id === teamSpaceId
        );
        if (index === undefined || index < 0) {
            return new NextResponse("Team Space not found", { status: 404 });
        }

        const teamSpace = workspace.teamSpaces[index] as TeamSpacePermission;

        // Permission: Only owners can manage security settings
        if (!canManageSecurity(clerkId, teamSpace)) {
            return NextResponse.json(
                { error: "Only owners can manage security settings" },
                { status: 403 }
            );
        }

        const body = validateSecuritySettings(await req.json());

        // Ensure securitySettings exists on the document
        if (!workspace.teamSpaces[index].securitySettings) {
            workspace.teamSpaces[index].securitySettings = {
                allowMemberInvites: false,
                requireApprovalForJoin: false,
                restrictContentAccess: false,
                enableAuditLog: false
            };
        }

        // Update individual settings if they are provided
        if (body.allowMemberInvites !== undefined) workspace.teamSpaces[index].securitySettings.allowMemberInvites = body.allowMemberInvites;
        if (body.requireApprovalForJoin !== undefined) workspace.teamSpaces[index].securitySettings.requireApprovalForJoin = body.requireApprovalForJoin;
        if (body.restrictContentAccess !== undefined) workspace.teamSpaces[index].securitySettings.restrictContentAccess = body.restrictContentAccess;
        if (body.enableAuditLog !== undefined) workspace.teamSpaces[index].securitySettings.enableAuditLog = body.enableAuditLog;

        workspace.teamSpaces[index].updatedAt = new Date();
        workspace.updatedAt = new Date();

        await workspace.save();

        return NextResponse.json({
            securitySettings: workspace.teamSpaces[index].securitySettings,
        });
    } catch (error) {
        console.error("[TEAM_SPACE_SECURITY_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
