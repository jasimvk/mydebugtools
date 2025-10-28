# NextAuth Authentication Setup

## Overview
The API Tester tool is now protected with NextAuth authentication. Only authenticated users can access the tool.

## Features Implemented

### 1. **Authentication Providers**
- **Credentials**: Email/Password login (demo account available)
- **Google OAuth**: Sign in with Google (requires configuration)
- **GitHub OAuth**: Sign in with GitHub (requires configuration)

### 2. **Protected Routes**
- `/tools/api` - API Tester (requires authentication)
- Unauthenticated users are automatically redirected to `/auth/signin`

### 3. **User Roles**
- `pro`: Full access to all features
- `free`: Can be used for future tier restrictions

## Quick Start

### Demo Login
Use these credentials to test the authentication:
- **Email**: `demo@example.com`
- **Password**: `demo123`

### Environment Setup

1. **Generate a Secret Key**
```bash
openssl rand -base64 32
```

2. **Update `.env.local`**
```env
# Required
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret-key

# Optional - For OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_ID=your-github-id
GITHUB_SECRET=your-github-secret
```

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts          # NextAuth API route
│   ├── auth/
│   │   └── signin/
│   │       └── page.tsx              # Custom sign-in page
│   ├── components/
│   │   ├── AuthProvider.tsx          # Session provider wrapper
│   │   └── ProtectedRoute.tsx        # Route protection component
│   ├── tools/
│   │   └── api/
│   │       └── page.tsx              # Protected API Tester
│   └── layout.tsx                    # Root layout with AuthProvider
```

## OAuth Provider Setup

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env.local`

### GitHub OAuth
1. Go to [GitHub Settings > Developer settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Secret to `.env.local`

## Customizing Authentication

### Adding Custom User Logic
Edit `/src/app/api/auth/[...nextauth]/route.ts`:

```typescript
async authorize(credentials) {
  // Replace with your database lookup
  const user = await db.user.findUnique({
    where: { email: credentials?.email }
  });
  
  if (user && verifyPassword(credentials?.password, user.password)) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.isPro ? "pro" : "free",
    };
  }
  return null;
}
```

### Checking User Role
```typescript
'use client';
import { useSession } from 'next-auth/react';

function MyComponent() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;
  
  if (userRole === 'pro') {
    // Show pro features
  }
}
```

## User Interface

### Sign In Page Features
- Email/password form with validation
- OAuth provider buttons (Google, GitHub)
- Demo credentials display
- Error handling
- Redirect to original page after login

### Loading States
- Spinner while checking authentication status
- Smooth transitions between states
- User-friendly messages

## Security Considerations

1. **Never commit** `.env.local` with real credentials
2. **Use HTTPS** in production
3. **Set secure NEXTAUTH_SECRET** (different for each environment)
4. **Configure NEXTAUTH_URL** correctly for production
5. **Enable CORS** properly for OAuth callbacks

## Testing

1. Start the development server:
```bash
npm run dev
```

2. Navigate to `/tools/api`
3. You'll be redirected to `/auth/signin`
4. Log in with demo credentials or OAuth
5. You'll be redirected back to the API Tester

## Troubleshooting

### "Invalid credentials" error
- Check that you're using the correct demo credentials
- Verify `.env.local` is loaded (check terminal output)

### OAuth not working
- Verify callback URLs match exactly
- Check that Client ID and Secret are correct
- Ensure OAuth app is not in development mode (for Google)

### Session not persisting
- Clear browser cookies
- Regenerate NEXTAUTH_SECRET
- Check browser console for errors

## Next Steps

- [ ] Connect to a real database (PostgreSQL, MongoDB, etc.)
- [ ] Implement user registration
- [ ] Add password reset functionality
- [ ] Implement pro tier restrictions
- [ ] Add user profile page
- [ ] Set up email verification

## Resources

- [NextAuth Documentation](https://next-auth.js.org/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [OAuth 2.0 Guide](https://oauth.net/2/)
