import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { User } from "@/lib/model/user";

/**
 * POST /api/check-email
 * Checks if an email already exists in the database
 * Returns: { exists: boolean, hasWorkspace: boolean }
 */
export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return new NextResponse("Email is required", { status: 400 });
        }

        await dbConnect();

        // Check if user exists with this email
        const existingUser = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (!existingUser) {
            return NextResponse.json({
                exists: false,
                hasWorkspace: false
            });
        }

        // Check if user has any workspaces
        const { Workspace } = await import("@/lib/model/workspace");

        const ownedWorkspace = await Workspace.findOne({
            owner: existingUser._id
        });

        const memberWorkspace = await Workspace.findOne({
            'members.user': existingUser._id
        });

        const hasWorkspace = !!(ownedWorkspace || memberWorkspace);

        return NextResponse.json({
            exists: true,
            hasWorkspace,
            message: "Account already exists. Please log in."
        });

    } catch (error) {
        console.error("[CHECK_EMAIL_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
