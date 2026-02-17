/**
 * User Validation Utilities
 * Helper functions for validating user accounts and workspaces
 */

/**
 * Check if an email already exists in the database
 */
export async function checkEmailExists(email: string): Promise<{
    exists: boolean;
    hasWorkspace: boolean;
    message?: string;
}> {
    try {
        const response = await fetch("/api/check-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email.toLowerCase().trim() }),
        });

        if (response.ok) {
            return await response.json();
        }

        return { exists: false, hasWorkspace: false };
    } catch (error) {
        console.error("Error checking email:", error);
        return { exists: false, hasWorkspace: false };
    }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Check if user has workspace access
 */
export async function checkUserWorkspace(): Promise<{
    hasWorkspace: boolean;
    primaryWorkspaceId: string | null;
    ownedWorkspaces: any[];
    memberWorkspaces: any[];
}> {
    try {
        const response = await fetch("/api/me/workspace");

        if (response.ok) {
            return await response.json();
        }

        return {
            hasWorkspace: false,
            primaryWorkspaceId: null,
            ownedWorkspaces: [],
            memberWorkspaces: [],
        };
    } catch (error) {
        console.error("Error checking workspace:", error);
        return {
            hasWorkspace: false,
            primaryWorkspaceId: null,
            ownedWorkspaces: [],
            memberWorkspaces: [],
        };
    }
}

/**
 * Redirect to workspace or workspace creation
 */
export function redirectToWorkspace(workspaceId?: string | null) {
    if (workspaceId) {
        window.location.href = `/project/${workspaceId}`;
    } else {
        window.location.href = `/workspace/create`;
    }
}

/**
 * Redirect to login with optional email parameter
 */
export function redirectToLogin(email?: string) {
    const url = email
        ? `/login?email=${encodeURIComponent(email)}`
        : `/login`;
    window.location.href = url;
}

/**
 * Redirect to signup with optional email parameter
 */
export function redirectToSignup(email?: string) {
    const url = email
        ? `/signup?email=${encodeURIComponent(email)}`
        : `/signup`;
    window.location.href = url;
}
