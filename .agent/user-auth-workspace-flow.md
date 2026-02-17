# User Authentication & Workspace Management Flow

## Overview
This document explains how the application handles user authentication, workspace creation, and prevents duplicate accounts/workspaces.

---

## 🔐 Authentication Flow

### **New User Signup**

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User visits /signup                                           │
│    - Enters email and password                                   │
│    - Clerk handles authentication                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Clerk Webhook (user.created event)                           │
│    Location: app/api/webhooks/clerk/route.ts                    │
│                                                                  │
│    - Creates User in MongoDB                                     │
│    - Saves: clerkId, email, firstName, lastName, imageUrl       │
│    - If invited: Adds to workspace automatically                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Redirect to /project/create (workspace creation)             │
│    - User fills workspace form                                   │
│    - Creates workspace with user as owner & admin                │
└─────────────────────────────────────────────────────────────────┘
```

### **Existing User Login**

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User visits /login                                            │
│    - Enters email and password                                   │
│    - Clerk authenticates                                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. RedirectHandler Component                                    │
│    Location: app/(main)/components/RedirectHandler.tsx          │
│                                                                  │
│    - Checks Clerk metadata for workspaceId                       │
│    - Fetches workspace data from /api/me/workspace               │
│    - Redirects to /project/{workspaceId}                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚫 Preventing Duplicate Accounts & Workspaces

### **1. Email Already Exists Check**

**API Endpoint:** `POST /api/check-email`

```typescript
// Request
{
  "email": "user@example.com"
}

// Response (if exists)
{
  "exists": true,
  "hasWorkspace": true,
  "message": "Account already exists. Please log in."
}

// Response (if new)
{
  "exists": false,
  "hasWorkspace": false
}
```

**Usage:**
- Called from signup page when email is entered
- Shows warning message if account exists
- Redirects to login page

---

### **2. Prevent Duplicate Workspace Creation**

**API Endpoint:** `POST /api/workspaces`

**Validation Logic:**
```typescript
// Check if user already owns a workspace
const existingWorkspace = await Workspace.findOne({ owner: dbUser._id });

if (existingWorkspace) {
    return NextResponse.json({
        error: "You already have a workspace",
        workspaceId: existingWorkspace._id,
        message: "You already have a workspace. Redirecting..."
    }, { status: 409 }); // 409 Conflict
}
```

**Frontend Handling:**
```typescript
// In WorkSpaceInfo.tsx
if (response.status === 409) {
    const data = await response.json();
    alert(data.message);
    window.location.href = `/project/${data.workspaceId}`;
}
```

---

## 📊 Database Relationships

### **User Model**
```typescript
{
  _id: ObjectId,
  clerkId: String (unique),
  email: String (unique),
  firstName: String,
  lastName: String,
  imageUrl: String,
  createdAt: Date,
  updatedAt: Date
}
```

### **Workspace Model**
```typescript
{
  _id: ObjectId,
  name: String,
  slug: String (unique),
  size: String,
  type: String ("personal" | "organization"),
  
  // Owner relationship
  owner: ObjectId → References User._id,
  
  // Members array
  members: [{
    user: ObjectId → References User._id,
    role: String ("Admin" | "Member" | "Viewer")
  }],
  
  // Pending invitations
  pendingInvites: [{
    email: String,
    role: String,
    clerkInvitationId: String,
    invitedAt: Date
  }],
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔄 Complete User Journey Scenarios

### **Scenario 1: Brand New User**

1. ✅ User visits `/signup`
2. ✅ Enters email (e.g., `john@example.com`)
3. ✅ Email check: `exists: false`
4. ✅ Clerk creates account
5. ✅ Webhook creates User in MongoDB
6. ✅ Redirects to `/project/create`
7. ✅ User creates workspace
8. ✅ Workspace saved with user as owner
9. ✅ Redirects to `/project/{workspaceId}`

### **Scenario 2: Existing User Tries to Signup Again**

1. ❌ User visits `/signup`
2. ❌ Enters existing email (e.g., `john@example.com`)
3. ⚠️ Email check: `exists: true`
4. 🛑 Shows message: "Account already exists. Please log in."
5. ➡️ Redirects to `/login`
6. ✅ User logs in
7. ✅ RedirectHandler checks workspace
8. ✅ Redirects to existing workspace

### **Scenario 3: Existing User Tries to Create Another Workspace**

1. ✅ User is logged in
2. ✅ User navigates to `/workspace/create`
3. ✅ Fills workspace form
4. ❌ API checks: User already owns workspace
5. 🛑 Returns 409 Conflict with existing workspace ID
6. ⚠️ Shows message: "You already have a workspace. Redirecting..."
7. ➡️ Redirects to `/project/{existingWorkspaceId}`

### **Scenario 4: Invited User (No Workspace)**

1. ✅ Admin sends invitation to `jane@example.com`
2. ✅ Jane receives invitation email
3. ✅ Jane clicks invitation link
4. ✅ Clerk creates account with metadata:
   ```json
   {
     "workspaceId": "workspace123",
     "role": "Member"
   }
   ```
5. ✅ Webhook adds Jane to workspace members
6. ✅ RedirectHandler reads Clerk metadata
7. ✅ Redirects to `/project/workspace123`
8. ✅ Jane is now a member (not owner)

---

## 🎯 Key Protection Points

| Protection | Location | Method |
|------------|----------|--------|
| **Duplicate Email** | `/api/check-email` | Check User collection |
| **Duplicate Workspace** | `/api/workspaces` | Check owner field |
| **Unauthorized Access** | All API routes | Clerk `auth()` |
| **Invalid Invitations** | Webhook | Verify workspace exists |

---

## 🔧 API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/check-email` | POST | Check if email exists |
| `/api/workspaces` | POST | Create workspace (with duplicate check) |
| `/api/me/workspace` | GET | Get user's workspaces |
| `/api/webhooks/clerk` | POST | Handle Clerk events |

---

## 🚀 Testing Scenarios

### Test 1: New User Flow
```bash
1. Clear database
2. Visit /signup
3. Create account: test@example.com
4. Verify redirected to /project/create
5. Create workspace "Test Workspace"
6. Verify redirected to /project/{id}
```

### Test 2: Duplicate Signup Prevention
```bash
1. Use existing account: test@example.com
2. Visit /signup
3. Enter test@example.com
4. Verify "Account exists" message
5. Click "Go to Login"
6. Verify redirected to /login
```

### Test 3: Duplicate Workspace Prevention
```bash
1. Login as test@example.com (with workspace)
2. Visit /workspace/create
3. Try to create another workspace
4. Verify 409 error
5. Verify redirected to existing workspace
```

---

## 📝 Notes

- **One Workspace Per User (Owner)**: Currently, users can only own ONE workspace
- **Multiple Memberships**: Users can be members of multiple workspaces
- **Clerk Metadata**: Used for quick workspace access without DB queries
- **Webhook Reliability**: Clerk webhooks are the source of truth for user creation
