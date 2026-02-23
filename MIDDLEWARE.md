# Middleware & Authentication Configuration

## Overview
The `middleware.ts` file serves as the central point for all authentication and route protection logic in your TeamsWorks application.

## Features

### 🔐 Authentication
- **Clerk Integration**: Uses Clerk for user authentication
- **Session Management**: Automatic session validation
- **User Context**: Provides user context throughout the app

### 🛡️ Route Protection
- **Public Routes**: Accessible without authentication
- **Protected Routes**: Require valid user session
- **API Security**: All API endpoints protected by default

### 🔄 Redirect Handling
- **Smart Redirects**: Unauthenticated users redirected to login
- **Return URLs**: Users returned to original page after login
- **Graceful Fallbacks**: Proper error handling for edge cases

## Configuration Options

### Public Routes
These routes are accessible without authentication:
```typescript
const publicRoutes = [
  '/',           // Landing page
  '/login(.*)',  // Login pages
  '/signup(.*)', // Signup pages
  '/api/webhooks(.*)', // Clerk webhooks
  '/landing(.*)',      // Landing pages
  '/api/health',       // Health check endpoint
  '/favicon.ico',      // Favicon
  '/_next(.*)',        // Next.js assets
];
```

### Protected Routes
These routes require authentication:
```typescript
const protectedRoutes = [
  '/workspace(.*)',     // Workspace pages
  '/project(.*)',       // Project pages
  '/api/me(.*)',        // User profile APIs
  '/api/workspaces(.*)', // Workspace APIs
  '/api/projects(.*)',  // Project APIs
  '/api/user(.*)',      // User APIs
];
```

## How It Works

### 1. Request Processing
```typescript
export default clerkMiddleware((auth, req) => {
  const { userId } = auth();
  // ... authentication logic
});
```

### 2. Route Classification
- **Public Routes**: Immediately allowed through
- **Protected Routes**: Check for valid user session
- **API Routes**: Additional security validation

### 3. Authentication Flow
1. User requests protected route
2. Middleware checks for valid session
3. If authenticated → Continue to destination
4. If not authenticated → Redirect to login with return URL

### 4. Redirect Logic
```typescript
if (isProtectedRoute(req) && !userId) {
  const loginUrl = new URL('/login', req.url);
  loginUrl.searchParams.set('redirect_url', req.url);
  return Response.redirect(loginUrl);
}
```

## Security Features

### 🚫 API Protection
All API routes automatically require authentication:
```typescript
if (req.url.includes('/api/') && !userId) {
  return new Response('Unauthorized', { status: 401 });
}
```

### 🔍 Pattern Matching
Advanced pattern matching excludes static assets:
```typescript
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

## Customization

### Adding New Public Routes
```typescript
const publicRoutes = [
  // ... existing routes
  '/new-public-route(.*)',
  '/blog(.*)',
];
```

### Adding New Protected Routes
```typescript
const protectedRoutes = [
  // ... existing routes
  '/admin(.*)',
  '/settings(.*)',
];
```

### Custom Redirect Logic
```typescript
if (isProtectedRoute(req) && !userId) {
  // Custom redirect logic
  if (req.url.includes('/admin')) {
    return Response.redirect(new URL('/admin-login', req.url));
  }
  // Default redirect
  return Response.redirect(new URL('/login', req.url));
}
```

## Environment Variables

Required environment variables:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

## Testing

### Test Authentication Flow
1. Try accessing `/workspace` without authentication
2. Should redirect to `/login?redirect_url=/workspace`
3. After login, should redirect back to `/workspace`

### Test API Protection
1. Try accessing `/api/me` without authentication
2. Should return `401 Unauthorized`

### Test Public Routes
1. Access `/` or `/login` without authentication
2. Should load successfully

## Troubleshooting

### Common Issues

#### 1. Redirect Loops
**Cause**: Incorrect route patterns or missing public routes
**Solution**: Ensure login/signup pages are in public routes

#### 2. API 401 Errors
**Cause**: Missing authentication headers or invalid session
**Solution**: Check Clerk configuration and environment variables

#### 3. Static Asset Issues
**Cause**: Overly restrictive matcher patterns
**Solution**: Ensure static assets are excluded from middleware

### Debug Tips

#### Enable Debug Logging
```typescript
export default clerkMiddleware((auth, req) => {
  console.log('Request URL:', req.url);
  console.log('User ID:', auth().userId);
  // ... rest of logic
});
```

#### Check Route Matching
```typescript
console.log('Is Public:', isPublicRoute(req));
console.log('Is Protected:', isProtectedRoute(req));
```

## Production Considerations

### Performance
- Middleware runs on every request
- Keep logic minimal and fast
- Use efficient pattern matching

### Security
- Always validate environment variables
- Use HTTPS in production
- Regularly update Clerk dependencies

### Monitoring
- Monitor authentication failures
- Track redirect patterns
- Set up alerts for unusual activity

## Best Practices

1. **Keep it Simple**: Minimal logic in middleware
2. **Clear Separation**: Distinct public vs protected routes
3. **Consistent Patterns**: Use consistent URL patterns
4. **Error Handling**: Graceful failure modes
5. **Documentation**: Keep route documentation updated

This middleware configuration provides a robust, secure foundation for your TeamsWorks application's authentication system.
