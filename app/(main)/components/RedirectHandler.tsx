"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";
import { ROUTES, REDIRECT_ROUTES } from "@/lib/config/routes";
import { getWorkspaceId, hasWorkspaceInvitation } from "@/lib/utils/clerk";
import type { ClerkUser } from "@/lib/types/clerk";

/**
 * RedirectHandler Component
 * 
 * Handles automatic redirection for authenticated users based on their workspace status.
 * - Users with workspace invitations are redirected to their workspace
 * - Users without workspaces are redirected to workspace creation
 * - Prevents unnecessary redirects when already on correct page
 */
export function RedirectHandler() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const pathname = usePathname();
    const [isRedirecting, setIsRedirecting] = useState(false);

    // Memoize the redirect routes to prevent unnecessary re-renders
    const redirectRoutes = useMemo(() => REDIRECT_ROUTES, []);

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
     * Get the target redirect path based on user state
     */
    const getTargetPath = useCallback((user: ClerkUser | null | undefined): string | null => {
        if (!user) return null;

        const workspaceId = getWorkspaceId(user);

        if (workspaceId) {
            return ROUTES.PROJECT(workspaceId);
        } else if (pathname === ROUTES.LANDING) {
            return ROUTES.WORKSPACE_CREATE;
        }

        return null;
    }, [pathname]);

    /**
     * Handle the redirect logic
     */
    const handleRedirect = useCallback(async () => {
        if (!isLoaded || isRedirecting) return;

        setIsRedirecting(true);

        try {
            const targetPath = getTargetPath(user as ClerkUser);

            if (targetPath && shouldRedirect(pathname, targetPath)) {
                router.push(targetPath);
            }
        } catch (error) {
            console.error("RedirectHandler error:", error);
            // In production, you might want to log to an error tracking service
            // or show a user-friendly error message
        } finally {
            setIsRedirecting(false);
        }
    }, [isLoaded, isRedirecting, user, pathname, router, getTargetPath, shouldRedirect]);

    useEffect(() => {
        handleRedirect();
    }, [handleRedirect]);

    return null;
}
