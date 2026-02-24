import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/lib/model/user';
import { Workspace } from '@/lib/model/workspace';
import type { ClerkUserMetadata } from '@/lib/types/clerk';

// ── Helpers ────────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Fetches fresh Clerk user metadata with up to `maxRetries` attempts,
 * waiting `delayMs` between each attempt.
 * Returns the workspaceId (from `workspaceIds[0]` or legacy `workspaceId`)
 * once it becomes available, or null if all retries are exhausted.
 */
async function fetchWorkspaceIdWithRetry(
    clerkUserId: string,
    maxRetries = 3,
    delayMs = 500
): Promise<string | null> {
    const client = await clerkClient();

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const freshUser = await client.users.getUser(clerkUserId);
        const meta = (freshUser.publicMetadata ?? {}) as ClerkUserMetadata;

        // Support both new array shape and legacy single id
        const workspaceId =
            meta.primaryWorkspaceId ??
            meta.workspaceIds?.[0];

        if (workspaceId) {
            console.log(
                `[Webhook] workspaceId found on attempt ${attempt} for user ${clerkUserId}`
            );
            return workspaceId;
        }

        if (attempt < maxRetries) {
            console.warn(
                `[Webhook] workspaceId missing (attempt ${attempt}/${maxRetries}), ` +
                `retrying in ${delayMs}ms…`
            );
            await sleep(delayMs);
        }
    }

    return null;
}

// ── Route handler ──────────────────────────────────────────────────────────

export async function POST(req: Request) {
    // ── Svix verification ──────────────────────────────────────────────────
    const headerPayload = await headers();
    const svix_id = headerPayload.get('svix-id');
    const svix_timestamp = headerPayload.get('svix-timestamp');
    const svix_signature = headerPayload.get('svix-signature');

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response('Error occurred -- no svix headers', { status: 400 });
    }

    const payload = await req.json();
    const body = JSON.stringify(payload);

    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
        throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env.local');
    }

    const wh = new Webhook(WEBHOOK_SECRET);
    let evt: WebhookEvent;

    try {
        evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        }) as WebhookEvent;
    } catch (err) {
        console.error('Error verifying webhook:', err);
        return new Response('Error occurred', { status: 400 });
    }

    // ── DB ─────────────────────────────────────────────────────────────────
    await dbConnect();

    const eventType = evt.type;

    // ── user.created / user.updated ────────────────────────────────────────
    if (eventType === 'user.created' || eventType === 'user.updated') {
        const { id, email_addresses, first_name, last_name, image_url, public_metadata } =
            evt.data;

        const email = email_addresses[0]?.email_address;
        if (!email) {
            return new Response('Error occurred -- no email address', { status: 400 });
        }

        try {
            // Upsert user in MongoDB
            const user = await User.findOneAndUpdate(
                { clerkId: id },
                {
                    clerkId: id,
                    email,
                    firstName: first_name,
                    lastName: last_name,
                    imageUrl: image_url,
                    updatedAt: new Date(),
                },
                { upsert: true, new: true }
            );

            // ── Invitation workspace assignment (user.created only) ────────
            if (eventType === 'user.created') {
                // Read workspaceId from the event payload first (fast path)
                const payloadMeta = (public_metadata ?? {}) as ClerkUserMetadata;
                let workspaceId =
                    payloadMeta.primaryWorkspaceId ??
                    payloadMeta.workspaceIds?.[0];

                // If missing, retry-fetch from Clerk API to handle the race condition
                if (!workspaceId) {
                    console.warn(
                        `[Webhook] workspaceId missing in payload for new user ${id}. ` +
                        'Starting retry fetch…'
                    );
                    workspaceId = (await fetchWorkspaceIdWithRetry(id)) ?? undefined;
                }

                if (workspaceId) {
                    const payloadRole = payloadMeta.role || 'Member';
                    await Workspace.findByIdAndUpdate(workspaceId, {
                        $push: { members: { user: user._id, role: payloadRole } },
                        $pull: { pendingInvites: { email } },
                    });
                    console.log(`[Webhook] User ${id} added to workspace ${workspaceId}`);
                } else {
                    // All retries exhausted — save user without workspace
                    console.error(
                        `[Webhook] FAILED to resolve workspaceId for user ${id} after ` +
                        '3 retries. User saved to DB without workspace assignment. ' +
                        `Use POST /api/workspaces/join to recover with clerkId="${id}".`
                    );
                }
            }

            console.log(`[Webhook] User ${id} ${eventType === 'user.created' ? 'created' : 'updated'}`);
        } catch (error) {
            console.error('Error handling user event:', error);
            return new Response('Error occurred during DB operation', { status: 500 });
        }
    }

    // ── user.deleted ───────────────────────────────────────────────────────
    if (eventType === 'user.deleted') {
        const { id } = evt.data;
        try {
            await User.findOneAndDelete({ clerkId: id });
            console.log(`[Webhook] User ${id} deleted`);
        } catch (error) {
            console.error('Error deleting user:', error);
            return new Response('Error occurred during DB operation', { status: 500 });
        }
    }

    return new Response('', { status: 200 });
}
