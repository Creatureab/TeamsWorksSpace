/**
 * Authentication & Route Protection Configuration
 * 
 * This file handles:
 * - Clerk authentication middleware
 * - Route protection rules
 * - Public route definitions
 * - API route security
 */

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/signup(.*)',
  '/api/webhooks(.*)',
  '/landing(.*)',
  '/api/health',
  '/favicon.ico',
  '/_next(.*)',
]);

// Define routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/workspace(.*)',
  '/project(.*)',
  '/api/me(.*)',
  '/api/workspaces(.*)',
  '/api/projects(.*)',
  '/api/user(.*)',
]);

export default clerkMiddleware(
  async (auth, req) => {
    // Allow public routes without authentication
    if (isPublicRoute(req)) {
      return;
    }
    
    // Protect routes that require authentication
    if (isProtectedRoute(req)) {
      await auth.protect();
    }
    
    // Additional security checks for API routes
    if (req.nextUrl.pathname.startsWith('/api/') && !isPublicRoute(req)) {
      await auth.protect();
    }
  },
  {
    signInUrl: "/login",
    signUpUrl: "/signup",
  }
);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
