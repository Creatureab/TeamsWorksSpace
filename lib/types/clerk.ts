// lib/types/clerk.ts
/**
 * Clerk User Metadata Interface
 * Defines the structure of metadata stored in Clerk user objects
 */
export interface ClerkUserMetadata {
    /** All workspace IDs this user owns (as Admin) */
    workspaceIds?: string[];
    /** The most recently created workspace — used as primary redirect target */
    primaryWorkspaceId?: string;
    role?: 'Admin' | 'Member' | 'Viewer';
    invitationStatus?: 'pending' | 'accepted' | 'declined';
}

/**
 * Extended Clerk User Interface
 * Provides type safety for Clerk user objects with custom metadata
 */
export interface ClerkUser {
    id: string;
    publicMetadata?: ClerkUserMetadata;
    primaryEmailAddress?: {
        emailAddress: string;
    } | null;
    fullName?: string | null;
    username?: string | null;
    imageUrl?: string;
    firstName?: string | null;
    lastName?: string | null;
    // Add other Clerk user properties as needed
}

/**
 * Clerk Webhook Event Types
 */
export interface ClerkWebhookEvent {
    type: string;
    data: {
        id: string;
        email_addresses: Array<{ email_address: string }>;
        first_name?: string;
        last_name?: string;
        image_url?: string;
        public_metadata?: ClerkUserMetadata;
    };
}

/**
 * Clerk Authentication State
 */
export interface ClerkAuthState {
    isLoaded: boolean;
    isSignedIn: boolean;
    user: ClerkUser | null;
}