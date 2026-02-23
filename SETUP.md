# Environment Setup Guide

## 1. Clerk Authentication Setup

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application or use existing one
3. Get your keys from the Clerk dashboard

## 2. Environment Variables

Create a `.env.local` file in your project root with the following:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk Webhook (optional, for syncing users)
CLERK_WEBHOOK_SECRET=whsec_...

# Database
MONGODB_URL=mongodb://localhost:27017/teamsworks

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

## 3. Clerk Configuration

### In your Clerk Dashboard:

1. **Configure Sessions**:
   - Go to User & Authentication → Sessions
   - Set session duration as needed

2. **Configure Social Login** (Optional):
   - Go to User & Authentication → Social Connections
   - Enable Google, GitHub, etc.

3. **Configure Webhooks** (Optional):
   - Go to Webhooks
   - Add endpoint: `https://your-domain.com/api/webhooks/clerk`
   - Select events: `user.created`, `user.updated`

## 4. Redirect URLs

Add these URLs to your Clerk configuration:

**Development:**
- http://localhost:3000
- http://localhost:3000/sign-in/*
- http://localhost:3000/sign-up/*
- http://localhost:3000/workspace

**Production:**
- https://your-domain.com
- https://your-domain.com/sign-in/*
- https://your-domain.com/sign-up/*
- https://your-domain.com/workspace

## 5. Testing

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Click "Get started free" to test sign up
4. Test sign in with your created account

## 6. Customization

### Customize Clerk Appearance
The sign-in and sign-up pages are already styled to match your app theme. You can further customize them in the component files:

- `/app/(auth)/sign-in/[[...sign-in]]/page.tsx`
- `/app/(auth)/signup/[[...signup]]/page.tsx`

### Add Social Providers
To add social login providers, update the Clerk components with the `socialButtonsVariant` prop.

## 7. User Management

After authentication, users are automatically available in your components via:

```tsx
import { useUser } from "@clerk/nextjs";

const { user, isSignedIn } = useUser();
```

The user data is also passed to server components via the `auth()` function.
