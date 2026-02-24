import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import { User } from "@/lib/model/user";
import { Workspace } from "@/lib/model/workspace";

/**
 * POST /api/workspaces/join
 *
 * Recovery endpoint for cases where the Clerk webhook fired before
 * public_metadata.workspaceId was set (race condition on invitation signup).
 *
 * Body: { clerkId: string, workspaceId: string, role?: "Admin" | "Member" | "Viewer" }
 *
 * Auth: Requires an authenticated Clerk session. Only an Admin of the target
 * workspace OR the user themselves (to join via a pending invite) can call this.
 */
export async function POST(req: Request) {
    try {
        const { userId: callerClerkId } = await auth();
        if (!callerClerkId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const {
            clerkId,
            workspaceId,
            role = "Member",
        } = body as { clerkId?: string; workspaceId?: string; role?: string };

        if (!clerkId || !workspaceId) {
            return new NextResponse(
                "Missing required fields: clerkId and workspaceId",
                { status: 400 }
            );
        }

        await dbConnect();

        // ── Resolve the target user ──────────────────────────────────────────
        const targetUser = await User.findOne({ clerkId });
        if (!targetUser) {
            return new NextResponse(
                `User with clerkId "${clerkId}" not found in database`,
                { status: 404 }
            );
        }

        // ── Resolve the workspace ────────────────────────────────────────────
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return new NextResponse(
                `Workspace "${workspaceId}" not found`,
                { status: 404 }
            );
        }

        // ── Permission check ─────────────────────────────────────────────────
        // Allow if: caller is joining themselves OR caller is an Admin of the workspace
        const callerUser = await User.findOne({ clerkId: callerClerkId });
        const isSelf = callerClerkId === clerkId;
        const isAdmin = workspace.members.some(
            (m: { user: { toString(): string }; role: string }) =>
                m.user.toString() === callerUser?._id?.toString() &&
                m.role === "Admin"
        );

        if (!isSelf && !isAdmin) {
            return new NextResponse(
                "Forbidden: must be an Admin of the workspace or joining yourself",
                { status: 403 }
            );
        }

        // ── Check if user is already a member ────────────────────────────────
        const alreadyMember = workspace.members.some(
            (m: { user: { toString(): string } }) =>
                m.user.toString() === targetUser._id.toString()
        );
        if (alreadyMember) {
            return NextResponse.json(
                { message: "User is already a member of this workspace", workspaceId },
                { status: 200 }
            );
        }

        // ── Add member + remove pending invite ───────────────────────────────
        await Workspace.findByIdAndUpdate(workspaceId, {
            $push: { members: { user: targetUser._id, role } },
            $pull: { pendingInvites: { email: targetUser.email } },
        });

        console.log(
            `[Join] User ${clerkId} manually added to workspace ${workspaceId} as ${role}`
        );

        return NextResponse.json(
            { message: "User successfully added to workspace", workspaceId, role },
            { status: 200 }
        );
    } catch (error) {
        console.error("[WORKSPACE_JOIN_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
