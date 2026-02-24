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

        const { name, slug, size, type } = await req.json();

        if (!name || !slug || !size) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // Slug uniqueness is enforced by the MongoDB unique index on the slug field.
        // We catch error code 11000 (duplicate key) instead of doing a separate pre-check
        // to avoid the race condition where two concurrent requests could both pass the check.
        let workspace;
        try {
            workspace = await Workspace.create({
                name,
                slug,
                size,
                type: type || 'organization',
                owner: dbUser._id,
                members: [{ user: dbUser._id, role: 'Admin' }],
                teamSpaces: [{ id: 'general', name: 'General', visibility: 'open', archived: false }],
            });
        } catch (createError: any) {
            if (createError?.code === 11000) {
                return NextResponse.json(
                    { error: 'Slug already taken' },
                    { status: 409 }
                );
            }
            throw createError; // re-throw for the outer catch to handle
        }

        // Update Clerk user metadata — append new workspaceId to the existing array
        try {
            const client = await clerkClient();
            const clerkUser = await client.users.getUser(clerkId);

            // Read existing workspaceIds array (or fall back to legacy single workspaceId)
            const existingMeta = (clerkUser.publicMetadata ?? {}) as {
                workspaceIds?: string[];
                workspaceId?: string;
            };

            const previousIds: string[] = existingMeta.workspaceIds
                ?? (existingMeta.workspaceId ? [existingMeta.workspaceId] : []);

            const newWorkspaceId = workspace._id.toString();
            const updatedIds = [...previousIds, newWorkspaceId];

            await client.users.updateUserMetadata(clerkId, {
                publicMetadata: {
                    workspaceIds: updatedIds,
                    primaryWorkspaceId: newWorkspaceId, // most recent = primary
                    role: 'Admin',
                },
            });
        } catch (clerkError) {
            console.error("[CLERK_UPDATE_ERROR]", clerkError);
            // Don't fail the whole request if Clerk update fails
        }

        return NextResponse.json(workspace);
    } catch (error) {
        console.error("[WORKSPACES_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
