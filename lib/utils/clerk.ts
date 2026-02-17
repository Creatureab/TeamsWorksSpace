// lib/utils/clerk.ts
import type { ClerkUser, ClerkUserMetadata } from '@/lib/types/clerk';

/**
 * Clerk User Utilities
 * Helper functions for working with Clerk user objects
 */

/**
 * Extracts workspace ID from Clerk user metadata
 */
export function getWorkspaceId(user: ClerkUser | null | undefined): string | undefined {
    return user?.publicMetadata?.workspaceId;
}

/**
 * Extracts role from Clerk user metadata
 */
export function getUserRole(user: ClerkUser | null | undefined): string | undefined {
    return user?.publicMetadata?.role;
}

/**
 * Checks if user has a workspace invitation
 */
export function hasWorkspaceInvitation(user: ClerkUser | null | undefined): boolean {
    return !!getWorkspaceId(user);
}

/**
 * Creates Clerk user metadata for workspace invitations
 */
export function createWorkspaceInvitationMetadata(
    workspaceId: string,
    role: 'Admin' | 'Member' | 'Viewer' = 'Member'
): ClerkUserMetadata {
    return {
        workspaceId,
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