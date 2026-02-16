"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export function RedirectHandler() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (isLoaded && user?.publicMetadata?.workspaceId) {
            const invitedWorkspaceId = user.publicMetadata.workspaceId as string;

            // If the user is on the root or creation page, redirect them to their invited workspace
            const targetPath = `/project/${invitedWorkspaceId}`;

            if (pathname === "/" || pathname === "/workspace/create" || pathname === "/createProject") {
                router.push(targetPath);
            }
        }
    }, [isLoaded, user, pathname, router]);

    return null;
}
