import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/lib/model/user';
import { Workspace } from '@/lib/model/workspace';

export async function POST(req: Request) {
    // Get the headers
    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response('Error occured -- no svix headers', {
            status: 400
        });
    }

    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Create a new Svix instance with your secret.
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env.local');
    }

    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: WebhookEvent;

    // Verify the payload with the headers
    try {
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        }) as WebhookEvent;
    } catch (err) {
        console.error('Error verifying webhook:', err);
        return new Response('Error occured', {
            status: 400
        });
    }

    // Connect to the database
    await dbConnect();

    const eventType = evt.type;

    if (eventType === 'user.created' || eventType === 'user.updated') {
        const { id, email_addresses, first_name, last_name, image_url, public_metadata } = evt.data;

        const email = email_addresses[0]?.email_address;

        if (!email) {
            return new Response('Error occured -- no email address', {
                status: 400
            });
        }

        try {
            // Create or update user in MongoDB
            const user = await User.findOneAndUpdate(
                { clerkId: id },
                {
                    clerkId: id,
                    email: email,
                    firstName: first_name,
                    lastName: last_name,
                    imageUrl: image_url,
                    updatedAt: new Date(),
                },
                { upsert: true, new: true }
            );

            // Handle workspace invitation if metadata exists
            if (eventType === 'user.created' && public_metadata?.workspaceId) {
                const workspaceId = public_metadata.workspaceId as string;
                const role = (public_metadata.role as string) || 'Member';

                await Workspace.findByIdAndUpdate(workspaceId, {
                    $push: { members: { user: user._id, role } },
                    $pull: { pendingInvites: { email: email } }
                });

                console.log(`User ${id} added to workspace ${workspaceId} via invitation`);
            }

            console.log(`User ${id} ${eventType === 'user.created' ? 'created' : 'updated'}`);
        } catch (error) {
            console.error('Error handling user event:', error);
            return new Response('Error occured during DB operation', {
                status: 500
            });
        }
    }

    if (eventType === 'user.deleted') {
        const { id } = evt.data;

        try {
            await User.findOneAndDelete({ clerkId: id });
            console.log(`User ${id} deleted`);
        } catch (error) {
            console.error('Error deleting user:', error);
            return new Response('Error occured during DB operation', {
                status: 500
            });
        }
    }

    return new Response('', { status: 200 });
}
