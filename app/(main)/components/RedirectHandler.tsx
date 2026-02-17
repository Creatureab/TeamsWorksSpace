"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";
import { ROUTES, REDIRECT_ROUTES } from "@/lib/config/routes";
import { getWorkspaceId } from "@/lib/utils/clerk";
import type { ClerkUser } from "@/lib/types/clerk";

interface WorkspaceData {
    ownedWorkspaces: Array<{
        _id: string;
        name: string;
        slug: string;
        userRole: string;
        hasInvitedMembers?: boolean;
        memberCount?: number;
    }>;
    memberWorkspaces: Array<{
        _id: string;
        name: string;
        slug: string;
        userRole: string;
    }>;
    hasWorkspace: boolean;
    primaryWorkspaceId: string | null;
}

/**
 * RedirectHandler Component
 * 
 * Handles automatic redirection for authenticated users based on their workspace status.
 * - Users with existing workspaces are redirected to their primary workspace
 * - Users without workspaces are redirected to workspace creation
 * - Prevents unnecessary redirects when already on correct page
 */
export function RedirectHandler() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const pathname = usePathname();
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [workspaceData, setWorkspaceData] = useState<WorkspaceData | null>(null);
    const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(false);

    // Memoize the redirect routes to prevent unnecessary re-renders
    const redirectRoutes = useMemo(() => REDIRECT_ROUTES, []);

    /**
     * Fetch workspace data from the API
     */
    const fetchWorkspaceData = useCallback(async () => {
        if (!user || isLoadingWorkspace) return;

        setIsLoadingWorkspace(true);
        try {
            const response = await fetch('/api/me/workspace', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include cookies for authentication
            });

            if (response.ok) {
                const data = await response.json();
                setWorkspaceData(data);
            } else if (response.status === 401) {
                // User not authenticated - this is expected on initial load
                console.log("User not authenticated yet, skipping workspace fetch");
                setWorkspaceData(null);
            } else if (response.status === 404) {
                // User not found in database yet - might be newly created
                console.log("User not found in database, may need to wait for webhook");
                setWorkspaceData(null);
            } else {
                console.warn("Failed to fetch workspace data:", response.status, response.statusText);
                setWorkspaceData(null);
            }
        } catch (error) {
            // Network error or fetch failed - don't break the app
            console.warn("Error fetching workspace data (this is non-critical):", error);
            setWorkspaceData(null);
        } finally {
            setIsLoadingWorkspace(false);
        }
    }, [user, isLoadingWorkspace]);

    /**
     * Determine if a redirect should occur
     */
    const shouldRedirect = useCallback((
        currentPath: string,
        targetPath: string | null
    ): boolean => {
        if (!targetPath) return false;
        return currentPath !== targetPath && redirectRoutes.includes(currentPath as any);
    }, [redirectRoutes]);

    /**
     * Get the target redirect path based on user state and workspace data
     */
    const getTargetPath = useCallback((): string | null => {
        if (!user) return null;

        // First, check Clerk metadata for workspaceId (for invited users)
        const clerkWorkspaceId = getWorkspaceId(user);
        if (clerkWorkspaceId) {
            return ROUTES.PROJECT(clerkWorkspaceId);
        }

        // Then, check database workspace data
        if (workspaceData) {
            // If user has a workspace (owned or member), redirect to it
            if (workspaceData.hasWorkspace && workspaceData.primaryWorkspaceId) {
                return ROUTES.PROJECT(workspaceData.primaryWorkspaceId);
            }
        }

        // If on landing page and no workspace, redirect to workspace creation
        if (pathname === ROUTES.LANDING) {
            return ROUTES.WORKSPACE_CREATE;
        }

        return null;
    }, [user, workspaceData, pathname]);

    /**
     * Handle the redirect logic
     */
    const handleRedirect = useCallback(async () => {
        if (!isLoaded || isRedirecting || isLoadingWorkspace) return;

        setIsRedirecting(true);

        try {
            const targetPath = getTargetPath();

            if (targetPath && shouldRedirect(pathname, targetPath)) {
                router.push(targetPath);
            }
        } catch (error) {
            console.error("RedirectHandler error:", error);
        } finally {
            setIsRedirecting(false);
        }
    }, [isLoaded, isRedirecting, isLoadingWorkspace, pathname, router, getTargetPath, shouldRedirect]);

    // Fetch workspace data when user is loaded
    useEffect(() => {
        if (isLoaded && user && !workspaceData && !isLoadingWorkspace) {
            fetchWorkspaceData();
        }
    }, [isLoaded, user, workspaceData, isLoadingWorkspace, fetchWorkspaceData]);

    // Handle redirect when workspace data is available
    useEffect(() => {
        if (isLoaded && user && (workspaceData !== null || getWorkspaceId(user))) {
            handleRedirect();
        }
    }, [isLoaded, user, workspaceData, handleRedirect]);

    return null;
}
