// lib/types/clerk.ts
/**
 * Clerk User Metadata Interface
 * Defines the structure of metadata stored in Clerk user objects
 */
export interface ClerkUserMetadata {
    workspaceId?: string;
    role?: 'Admin' | 'Member' | 'Viewer';
    invitationStatus?: 'pending' | 'accepted' | 'declined';
    // Add other metadata fields as needed for your application
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
    };
    fullName?: string;
    username?: string;
    imageUrl?: string;
    firstName?: string;
    lastName?: string;
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