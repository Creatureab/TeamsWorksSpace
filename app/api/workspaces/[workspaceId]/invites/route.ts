import { NextResponse } from "next/server";
import { auth, createClerkClient } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import { Workspace } from "@/lib/model/workspace";

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function POST(
    req: Request,
    { params }: { params: { workspaceId: string } }
) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { workspaceId } = await params;

        await dbConnect();

        const { emails, role } = await req.json();

        if (!emails || !Array.isArray(emails)) {
            return new NextResponse("Invalid emails format", { status: 400 });
        }

        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
            return new NextResponse("Workspace not found", { status: 404 });
        }

        // Send real invitation emails via Clerk and track in DB
        const invitationPromises = emails.map(async (email: string) => {
            try {
                const invitation = await clerk.invitations.createInvitation({
                    emailAddress: email,
                    redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/sign-up`,
                    publicMetadata: {
                        workspaceId,
                        role: role || 'Member',
                    },
                });

                return {
                    email,
                    role: role || 'Member',
                    clerkInvitationId: invitation.id,
                    invitedAt: new Date(),
                };
            } catch (err: any) {
                console.error(`Failed to invite ${email} via Clerk:`, err?.errors || err);
                return null;
            }
        });

        const results = (await Promise.all(invitationPromises)).filter((res): res is NonNullable<typeof res> => res !== null);

        if (results.length > 0) {
            workspace.pendingInvites.push(...results);
            await workspace.save();
        }

        return NextResponse.json(workspace);
    } catch (error) {
        console.error("[INVITES_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
