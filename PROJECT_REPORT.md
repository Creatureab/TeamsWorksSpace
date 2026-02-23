# Softwelve Notion Clone - Project Report

Date: 2026-02-21  
Repository: `d:\Softwelve\softwelve-notion-clone`

## 1. Executive Summary

This project is a full-stack workspace and project collaboration app built with Next.js App Router, Clerk authentication, and MongoDB. It supports user onboarding, workspace creation and membership, invitations, project management, and editor block persistence.  

The product foundation is strong for MVP use. The main blockers before production hardening are lint-critical code quality issues, missing authorization checks in selected API flows, and stale docs after route refactoring.

## 2. Technology Stack

- Frontend: Next.js 16.1.6, React 19.2.3, TypeScript, Tailwind CSS 4, shadcn/ui
- Authentication: Clerk (`@clerk/nextjs`)
- Database: MongoDB with Mongoose
- Backend APIs: Next.js route handlers under `app/api`
- Webhooks: Clerk webhook + Svix verification
- Auxiliary server: Express server (`server/index.ts`) for health/basic backend route
- Tooling: ESLint 9, concurrently, bun integration for custom server dev mode

## 3. Architecture Overview

- Root app shell: `app/layout.tsx`
- Protected app shell: `app/(main)/layout.tsx` (runs `syncUser()` and mounts redirect handler)
- Auth middleware: `proxy.ts` (Clerk route protection)
- DB connection layer: `lib/mongodb.ts` (cached mongoose connection)
- Route constants: `lib/config/routes.ts`
- Domain models:
  - `lib/model/user.ts`
  - `lib/model/workspace.ts`
  - `lib/model/project.ts`
  - `lib/model/block.ts`

## 4. Functional Coverage

### 4.1 Authentication and Identity

- Sign-in, sign-up, logout pages under `app/(auth)/...`
- Clerk middleware protects non-public routes
- User synchronization into local DB via:
  - Request-time sync: `lib/sync-user.ts`
  - Webhook sync: `app/api/webhooks/clerk/route.ts`

### 4.2 Workspace Lifecycle

- Workspace create flow: `app/(main)/workspace/create/page.tsx`
- Duplicate owner workspace prevention: `app/api/workspaces/route.ts` returns `409`
- Workspace update endpoint: `app/api/workspaces/[workspaceId]/route.ts` (`PATCH`)
- Workspace index redirect to latest accessible workspace: `app/(main)/workspace/page.tsx`

### 4.3 Project and Task Management

- Create/list projects: `app/api/projects/route.ts`
- Project page and task view:
  - `app/(main)/project/[projectId]/page.tsx`
  - `app/(main)/project/[projectId]/task/page.tsx`
- Task creation API: `app/api/projects/[projectId]/tasks/route.ts`

### 4.4 Invitations and Membership

- Invite endpoint: `app/api/workspaces/[workspaceId]/invites/route.ts`
- Clerk invitation metadata stores `workspaceId` and `role`
- Webhook adds invited user to workspace members on `user.created`

### 4.5 Editor Persistence

- Server actions:
  - `lib/actions/blocks.ts` (`getBlocks`, `saveBlocks`)
- Block storage with ordering and metadata:
  - `lib/model/block.ts`

## 5. Route and API Inventory

Current code inventory:

- Pages: 15
- Layouts: 5
- API route files: 9

Key API routes:

- `POST /api/check-email`
- `GET /api/me`
- `GET /api/me/workspace`
- `GET|POST /api/projects`
- `POST /api/projects/[projectId]/tasks`
- `POST /api/workspaces`
- `PATCH /api/workspaces/[workspaceId]`
- `POST /api/workspaces/[workspaceId]/invites`
- `POST /api/webhooks/clerk`

## 6. Data Model Summary

### User

- Unique: `clerkId`, `email`
- Profile fields: `firstName`, `lastName`, `imageUrl`

### Workspace

- Core: `name`, `slug` (unique), `size`, `type`
- Owner relation: single `owner` user
- Members: array with role (`Admin`, `Member`, `Viewer`)
- `pendingInvites` tracked by email, role, Clerk invitation id

### Project

- Belongs to one workspace
- Creator relation: `createdBy`
- `slug` unique per workspace via compound index
- Sheets + embedded tasks

### Block

- Page/workspace scoped editor block storage
- Ordered block index for page rendering
- Metadata: favorite, locked, color, lastEditedBy

## 7. Configuration and Runtime Notes

- URL redirects in `next.config.ts`:
  - `/login -> /sign-in`
  - `/signup -> /sign-up`
- Image allowlist configured for Clerk, Google, GitHub, Cloudinary
- Public routes in middleware include auth pages and Clerk webhook endpoint
- Environment variables detected:
  - `CONVEX_DEPLOYMENT`
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
  - `MONGODB_URI`
  - `CLERK_WEBHOOK_SECRET`
  - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`

## 8. Code Quality and Health

Lint status (`npm run lint`):

- Total issues: 83
- Errors: 36
- Warnings: 47

Primary problem areas:

- Extensive `any` usage across editor and API types
- React rule violations:
  - setState in effect anti-pattern
  - component creation during render
  - ref access during render
  - purity warning using `Math.random()` in render path
- Unused imports and miscellaneous warning-level cleanup

## 9. Risks and Gaps

### Security and Authorization

- `POST /api/workspaces/[workspaceId]/invites` does not enforce owner/admin authorization before sending invites.
- `POST /api/check-email` can expose account existence and supports email enumeration patterns.

### Product Consistency

- Some docs reference legacy paths (e.g., older `signup` path shape) after route refactors.
- Mixed route naming remains (`/createProject` and `/project/create`) and should be normalized.

### Engineering Maintainability

- Lint debt is high enough to slow safe iteration and increase regression risk.
- Current git state shows active route refactoring; documentation and conventions need consolidation.

## 10. Prioritized Remediation Checklist

### P0: Immediate (Security and Stability)

- Add role-based authorization check to `POST /api/workspaces/[workspaceId]/invites`.
- Reduce email enumeration leakage in `POST /api/check-email`:
  - return neutral responses
  - rate-limit endpoint
  - add bot/abuse protections
- Fix React lint errors that can cause runtime instability in editor components:
  - `components/editor/BlockActionMenu.tsx`
  - `components/editor/Block.tsx`
  - `components/ui/sidebar.tsx`

### P1: Short-Term (Code Health and Reliability)

- Replace `any` with concrete types in API handlers and editor data structures.
- Resolve `react-hooks/set-state-in-effect` in `app/(landing)/components/HomeHeader.tsx`.
- Remove unused imports and warning-level dead code across app and components.
- Add regression tests for:
  - workspace creation conflict behavior (`409`)
  - invite membership flow
  - redirect handler decisions for new vs existing users

### P2: Medium-Term (Product and DX Improvements)

- Unify route naming conventions and canonical flow:
  - choose either `/createProject` or `/project/create` as primary
- Refresh and consolidate docs:
  - update `.agent/*.md` to current file paths
  - add one canonical architecture doc
- Introduce CI quality gates:
  - lint must pass
  - route-level API tests
  - basic auth/authorization smoke checks

## 11. Overall Assessment

The codebase is feature-rich and structurally well positioned for a collaborative workspace product. Core patterns are in place: auth, DB sync, access-scoped queries, and user/workspace/project relationships.  

The project is currently in a transition phase. Addressing P0 and P1 items will materially improve security posture, reliability, and release readiness.

