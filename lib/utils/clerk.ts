// lib/utils/clerk.ts
import type { ClerkUser, ClerkUserMetadata } from '@/lib/types/clerk';

/**
 * Clerk User Utilities
 * Helper functions for working with Clerk user objects
 */

/**
 * Returns all workspace IDs the user owns.
 * Handles both the new array shape and the legacy single-id shape.
 */
export function getWorkspaceIds(user: ClerkUser | null | undefined): string[] {
    const meta = user?.publicMetadata;
    if (!meta) return [];
    if (meta.workspaceIds?.length) return meta.workspaceIds;
    if (meta.primaryWorkspaceId) return [meta.primaryWorkspaceId];
    return [];
}

/**
 * Returns the primary (most recently created) workspace ID.
 * Backwards-compatible: reads primaryWorkspaceId, falls back to first in array.
 */
export function getWorkspaceId(user: ClerkUser | null | undefined): string | undefined {
    const meta = user?.publicMetadata;
    return meta?.primaryWorkspaceId ?? meta?.workspaceIds?.[0];
}

/**
 * Extracts role from Clerk user metadata
 */
export function getUserRole(user: ClerkUser | null | undefined): string | undefined {
    return user?.publicMetadata?.role;
}

/**
 * Checks if user has at least one workspace
 */
export function hasWorkspaceInvitation(user: ClerkUser | null | undefined): boolean {
    return getWorkspaceIds(user).length > 0;
}

/**
 * Creates Clerk user metadata for workspace invitations
 */
export function createWorkspaceInvitationMetadata(
    workspaceId: string,
    role: 'Admin' | 'Member' | 'Viewer' = 'Member'
): ClerkUserMetadata {
    return {
        workspaceIds: [workspaceId],
        primaryWorkspaceId: workspaceId,
        role,
        invitationStatus: 'pending'
    };
}

/**
 * Validates Clerk user metadata structure
 */
export function isValidClerkMetadata(metadata: any): metadata is ClerkUserMetadata {
    return (
        metadata &&
        (typeof metadata.workspaceId === 'string' || metadata.workspaceId === undefined) &&
        (typeof metadata.role === 'string' || metadata.role === undefined) &&
        (typeof metadata.invitationStatus === 'string' || metadata.invitationStatus === undefined)
    );
}

/**
 * Gets user display name from Clerk user object
 */
export function getUserDisplayName(user: ClerkUser | null | undefined): string {
    if (!user) return 'User';

    if (user.fullName) return user.fullName;
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.firstName) return user.firstName;
    if (user.username) return user.username;

    return 'User';
}

/**
 * Gets user email from Clerk user object
 */
export function getUserEmail(user: ClerkUser | null | undefined): string | undefined {
    if (!user) return undefined;

    if (user.primaryEmailAddress?.emailAddress) {
        return user.primaryEmailAddress.emailAddress;
    }

    return undefined;
}

/**
 * Gets user avatar URL from Clerk user object
 */
export function getUserAvatarUrl(user: ClerkUser | null | undefined): string | undefined {
    return user?.imageUrl;
}