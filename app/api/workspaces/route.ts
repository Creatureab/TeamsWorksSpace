import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import { Workspace } from "@/lib/model/workspace";
import { User } from "@/lib/model/user";

export async function POST(req: Request) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        await dbConnect();

        // Get the user from our DB
        const dbUser = await User.findOne({ clerkId });
        if (!dbUser) {
            return new NextResponse("User not found in database", { status: 404 });
        }

        // Check if user already owns a workspace
        const existingWorkspace = await Workspace.findOne({ owner: dbUser._id });
        if (existingWorkspace) {
            return NextResponse.json({
                error: "You already have a workspace",
                workspaceId: existingWorkspace._id,
                workspaceName: existingWorkspace.name,
                workspaceSlug: existingWorkspace.slug,
                message: "You already have a workspace. Redirecting to your workspace..."
            }, { status: 409 }); // 409 Conflict
        }

        const { name, slug, size, type } = await req.json();

        if (!name || !slug || !size) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // Check if slug is unique
        const existingSlug = await Workspace.findOne({ slug });
        if (existingSlug) {
            return new NextResponse("Slug already exists", { status: 400 });
        }

        const workspace = await Workspace.create({
            name,
            slug,
            size,
            type: type || 'organization',
            owner: dbUser._id,
            members: [{ user: dbUser._id, role: 'Admin' }],
            teamSpaces: [{ id: 'general', name: 'General', visibility: 'open', archived: false }],
        });

        // Update Clerk user metadata with workspace ID
        try {
            const client = await clerkClient();
            await client.users.updateUserMetadata(clerkId, {
                publicMetadata: {
                    workspaceId: workspace._id.toString(),
                    role: 'Admin'
                }
            });
        } catch (clerkError) {
            console.error("[CLERK_UPDATE_ERROR]", clerkError);
            // Don't fail the request if Clerk update fails
        }

        return NextResponse.json(workspace);
    } catch (error) {
        console.error("[WORKSPACES_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

