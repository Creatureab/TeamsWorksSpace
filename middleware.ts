import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/webhooks(.*)",
]);

// Auth routes (sign-in / sign-up) – redirect away if already logged in
const isAuthRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, req: NextRequest) => {
    const { userId, sessionClaims } = await auth();
    const { pathname } = req.nextUrl;

    // ── 1. Unauthenticated user hitting a protected route ──────────────────────
    if (!userId && !isPublicRoute(req)) {
        const signInUrl = new URL("/sign-in", req.url);
        signInUrl.searchParams.set("redirect_url", pathname);
        return NextResponse.redirect(signInUrl);
    }

    // ── 2. Authenticated user ──────────────────────────────────────────────────
    if (userId) {
        // Read workspace info from Clerk public_metadata (embedded in JWT)
        const publicMetadata = (sessionClaims?.publicMetadata ?? {}) as {
            workspaceIds?: string[];
            primaryWorkspaceId?: string;
            workspaceId?: string; // legacy fallback
        };
        // Resolve: prefer primaryWorkspaceId, then first in array, then legacy field
        const workspaceId =
            publicMetadata.primaryWorkspaceId ??
            publicMetadata.workspaceIds?.[0] ??
            publicMetadata.workspaceId;

        // If the user lands on an auth page, redirect them to the right place
        if (isAuthRoute(req)) {
            if (workspaceId) {
                return NextResponse.redirect(new URL(`/workspace/${workspaceId}`, req.url));
            }
            return NextResponse.redirect(new URL("/workspace/create", req.url));
        }

        // If user hits the root "/" and is authenticated, redirect appropriately
        if (pathname === "/") {
            if (workspaceId) {
                return NextResponse.redirect(new URL(`/workspace/${workspaceId}`, req.url));
            }
            return NextResponse.redirect(new URL("/workspace/create", req.url));
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        // Skip Next.js internals and static files
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};
