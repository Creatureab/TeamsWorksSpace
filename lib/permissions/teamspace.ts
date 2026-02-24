// lib/permissions/teamspace.ts
// Pure functions — no DB calls. Used in API routes and sidebar filtering.

export type TeamSpaceRole = 'owner' | 'member' | 'guest';

export interface TeamSpaceMemberPermission {
    clerkId: string;
    role: TeamSpaceRole;
    joinedAt: Date;
}

export interface TeamSpacePermission {
    id: string;
    name: string;
    description: string;
    icon: string;
    accessType: 'open' | 'closed' | 'private';
    archived: boolean;
    members: TeamSpaceMemberPermission[];
    createdBy: string | null;
}


// ── Membership ────────────────────────────────────────────────────────────────

/** Returns true if the clerkId is in the team space's members array */
export function isMemberOf(
    clerkId: string,
    teamSpace: TeamSpacePermission
): boolean {
    return teamSpace.members.some((m) => m.clerkId === clerkId);
}

/** Returns the member's role, or null if not a member */
export function getMemberRole(
    clerkId: string,
    teamSpace: TeamSpacePermission
): TeamSpaceRole | null {
    return teamSpace.members.find((m) => m.clerkId === clerkId)?.role ?? null;
}

/** Count how many owners this team space has */
export function ownerCount(teamSpace: TeamSpacePermission): number {
    return teamSpace.members.filter((m) => m.role === 'owner').length;
}

// ── Visibility ────────────────────────────────────────────────────────────────

/**
 * Can this user SEE the team space name in the sidebar?
 * - open    → all workspace members
 * - closed  → all workspace members
 * - private → only members[]
 */
export function canSeeTeamSpace(
    clerkId: string,
    teamSpace: TeamSpacePermission,
    isWorkspaceMember: boolean
): boolean {
    if (teamSpace.accessType === 'private') {
        return isMemberOf(clerkId, teamSpace);
    }
    return isWorkspaceMember;
}

/**
 * Can this user ACCESS content inside the team space?
 * - open    → all workspace members
 * - closed  → only members[]
 * - private → only members[]
 */
export function canAccessContent(
    clerkId: string,
    teamSpace: TeamSpacePermission,
    isWorkspaceMember: boolean
): boolean {
    if (teamSpace.accessType === 'open') {
        return isWorkspaceMember;
    }
    return isMemberOf(clerkId, teamSpace);
}

// ── Edit / Admin ──────────────────────────────────────────────────────────────

/**
 * Can this user edit settings, invite others, change roles?
 * Only owners can do this.
 */
export function canEditTeamSpace(
    clerkId: string,
    teamSpace: TeamSpacePermission
): boolean {
    return teamSpace.members.some(
        (m) => m.clerkId === clerkId && m.role === 'owner'
    );
}

// ── Joining ───────────────────────────────────────────────────────────────────

/**
 * Can this user self-join without an invite?
 * Only for open spaces where the user is not already a member.
 */
export function canSelfJoin(
    clerkId: string,
    teamSpace: TeamSpacePermission
): boolean {
    return teamSpace.accessType === 'open' && !isMemberOf(clerkId, teamSpace);
}

// ── Removal ───────────────────────────────────────────────────────────────────

/**
 * Can this member be removed from the team space?
 * Blocks only if the member is the last remaining owner.
 */
export function canRemoveMember(
    clerkId: string,
    teamSpace: TeamSpacePermission
): boolean {
    const member = teamSpace.members.find((m) => m.clerkId === clerkId);
    if (!member) return false;
    if (member.role === 'owner' && ownerCount(teamSpace) === 1) {
        return false; // last owner cannot be removed
    }
    return true;
}

// ── Computed summary (for API responses) ─────────────────────────────────────

/**
 * Returns a set of computed permission flags for a given user on a team space.
 * Attach this to every team space in API responses.
 */
export function computePermissions(
    clerkId: string,
    teamSpace: TeamSpacePermission,
    isWorkspaceMember: boolean
) {
    return {
        isMember: isMemberOf(clerkId, teamSpace),
        canSee: canSeeTeamSpace(clerkId, teamSpace, isWorkspaceMember),
        canAccess: canAccessContent(clerkId, teamSpace, isWorkspaceMember),
        canEdit: canEditTeamSpace(clerkId, teamSpace),
        canSelfJoin: canSelfJoin(clerkId, teamSpace),
        role: getMemberRole(clerkId, teamSpace),
    };
}
