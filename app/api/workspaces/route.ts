import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
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

        // Check if slug is unique
        const existingWorkspace = await Workspace.findOne({ slug });
        if (existingWorkspace) {
            return new NextResponse("Slug already exists", { status: 400 });
        }

        const workspace = await Workspace.create({
            name,
            slug,
            size,
            type: type || 'organization',
            owner: dbUser._id,
            members: [{ user: dbUser._id, role: 'Admin' }],
        });

        return NextResponse.json(workspace);
    } catch (error) {
        console.error("[WORKSPACES_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
