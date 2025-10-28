# Google OAuth Setup Guide

## Overview
MyDebugTools API Tester uses **Google OAuth** for authentication. Users can sign in with their Google account to save and sync API collections across devices.

## ✨ Why Google Only?

- **Simple & Secure**: Users already have Google accounts
- **Zero Password Management**: No need to store or manage passwords
- **Instant Sign-Up**: One click to create an account
- **Trusted**: Users trust Google authentication
- **No Demo Accounts Needed**: Real users with real email addresses

## 🔧 Setup Instructions

### Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project** (if you don't have one)
   - Click "Select a project" → "New Project"
   - Name: `MyDebugTools` (or your app name)
   - Click "Create"

3. **Enable Google+ API**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Select "External" (for public users)
   - Click "Create"
   
   **Fill in the required fields:**
   - App name: `MyDebugTools API Tester`
   - User support email: Your email
   - Developer contact: Your email
   - Click "Save and Continue"
   
   **Scopes** (click "Add or Remove Scopes"):
   - `email` - View your email address
   - `profile` - View your basic profile info
   - Click "Save and Continue"
   
   **Test users** (optional for development):
   - Add your email for testing
   - Click "Save and Continue"

5. **Create OAuth Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: **Web application**
   - Name: `MyDebugTools Web Client`
   
   **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   https://yourdomain.com
   ```
   
   **Authorized redirect URIs:**
   ```
   http://localhost:3000/api/auth/callback/google
   https://yourdomain.com/api/auth/callback/google
   ```
   
   - Click "Create"

6. **Copy Your Credentials**
   - You'll see a popup with:
     - **Client ID**: `xxx.apps.googleusercontent.com`
     - **Client Secret**: `GOCSPX-xxxxx`
   - Copy both values!

### Step 2: Configure Environment Variables

Update your `.env.local` file:

```bash
# Google OAuth (Required for sign-in)
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret-here
```

### Step 3: Restart Your Dev Server

```bash
# Stop the current server (Ctrl+C)
# Start again
npm run dev
```

## 🧪 Testing

1. **Open the app**:
   ```
   http://localhost:3000/tools/api
   ```

2. **Click "Sign In"** in the top right or collections sidebar

3. **Click "Sign in with Google"** button

4. **Select your Google account**

5. **Grant permissions** (first time only):
   - Allow access to email and profile
   - Click "Continue"

6. **You're signed in!**
   - Top bar shows your email
   - Collections sidebar shows create button
   - You can now save collections

## 🚀 Production Deployment

### Update OAuth Redirect URIs

Before deploying to production, add your production URL:

1. Go to Google Cloud Console → Credentials
2. Edit your OAuth client
3. Add redirect URIs:
   ```
   https://yourdomain.com/api/auth/callback/google
   ```
4. Add authorized origins:
   ```
   https://yourdomain.com
   ```

### Update Environment Variables

In your production environment (Vercel, Netlify, etc.):

```bash
NEXTAUTH_URL=https://yourdomain.com
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

### Publish OAuth Consent Screen

For production with real users:

1. Go to "OAuth consent screen"
2. Click "Publish App"
3. Google will review your app (may take a few days)
4. Once approved, any Google user can sign in

## 🔒 Security Best Practices

### Keep Secrets Safe
- ✅ Never commit `.env.local` to Git
- ✅ Use environment variables in production
- ✅ Rotate secrets if exposed

### Limit Scopes
- ✅ Only request `email` and `profile`
- ❌ Don't request unnecessary Google permissions

### Validate Sessions
- ✅ NextAuth handles JWT validation
- ✅ Supabase RLS protects user data
- ✅ Sessions expire automatically

## 🐛 Troubleshooting

### "Error: invalid_client"
**Cause**: Client ID or Secret is incorrect
**Fix**: Double-check credentials in `.env.local`

### "Redirect URI mismatch"
**Cause**: The redirect URI doesn't match Google Console
**Fix**: 
1. Check the error URL in browser
2. Add exact URL to authorized redirect URIs
3. Common format: `http://localhost:3000/api/auth/callback/google`

### "Access blocked: This app's request is invalid"
**Cause**: OAuth consent screen not configured
**Fix**: Complete the OAuth consent screen setup

### User can't sign in
**Cause**: App is in "Testing" mode
**Fix**: 
- Add user email to "Test users" list, OR
- Publish the app to production

### Session not persisting
**Cause**: NEXTAUTH_SECRET not set
**Fix**: Generate a secret and add to `.env.local`:
```bash
# Generate secret
openssl rand -base64 32

# Add to .env.local
NEXTAUTH_SECRET=generated-secret-here
```

## 📊 User Flow

```
User clicks "Sign in with Google"
  ↓
Redirects to Google OAuth
  ↓
User selects Google account
  ↓
Grants permissions (first time)
  ↓
Redirects back to /api/auth/callback/google
  ↓
NextAuth creates session
  ↓
User record created/updated in Supabase
  ↓
Redirects to /tools/api
  ↓
User sees email in header
Collections sidebar shows create button
  ↓
User can save collections ✅
```

## 🎯 Benefits for Users

✅ **No password to remember** - Use existing Google account
✅ **Instant sign-up** - One click to create account  
✅ **Secure** - OAuth 2.0 industry standard
✅ **Sync across devices** - Collections saved to cloud
✅ **No email verification** - Google handles that

## 💡 For Developers

### How It Works

1. **User clicks "Sign in with Google"**
   - Redirects to Google OAuth consent screen

2. **Google authenticates user**
   - Returns authorization code

3. **NextAuth exchanges code for tokens**
   - Gets access token and user info

4. **Our backend (NextAuth callbacks)**
   - Checks if user exists in Supabase
   - Creates new user if first time
   - Creates account record linking Google account
   - Generates JWT session token

5. **User is authenticated**
   - Session stored in encrypted cookie
   - User ID and role in JWT payload
   - Session validated on each API request

### Database Schema

When user signs in with Google:

**users table**:
```sql
{
  id: uuid,
  email: user@gmail.com,
  name: "John Doe",
  image: "https://lh3.googleusercontent.com/...",
  role: "free",
  email_verified: "2025-10-28T10:30:00Z",
  created_at: "2025-10-28T10:30:00Z"
}
```

**accounts table**:
```sql
{
  user_id: uuid (foreign key to users),
  provider: "google",
  provider_account_id: "1234567890",
  access_token: "ya29.xxx",
  refresh_token: "1//xxx",
  expires_at: 1730123456,
  token_type: "Bearer"
}
```

### Customization

#### Change Sign-In Button Style

Edit `/src/app/auth/signin/page.tsx`:

```tsx
<button
  onClick={handleGoogleSignIn}
  className="your-custom-classes"
>
  <GoogleIcon />
  Your Custom Text
</button>
```

#### Add Sign-Out Confirmation

```tsx
const handleSignOut = () => {
  if (confirm('Are you sure you want to sign out?')) {
    signOut({ callbackUrl: '/tools/api' });
  }
};
```

#### Customize Callback URL

```tsx
// Sign in and redirect to specific page
signIn('google', { callbackUrl: '/dashboard' });
```

## 📚 Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Google Cloud Console](https://console.cloud.google.com/)

## ✅ Checklist

### Development Setup
- [ ] Created Google Cloud project
- [ ] Enabled Google+ API
- [ ] Configured OAuth consent screen
- [ ] Created OAuth credentials
- [ ] Added localhost redirect URIs
- [ ] Updated .env.local with credentials
- [ ] Generated NEXTAUTH_SECRET
- [ ] Tested sign-in flow

### Production Setup
- [ ] Updated redirect URIs with production URL
- [ ] Set environment variables in hosting platform
- [ ] Published OAuth consent screen
- [ ] Tested sign-in on production
- [ ] Verified Supabase user creation
- [ ] Confirmed collections sync

## 🎉 You're Done!

Your API Tester now has Google OAuth authentication! Users can:
- Sign in with one click
- Save collections to the cloud
- Sync across all their devices
- Never worry about passwords

**Test it now:** `http://localhost:3000/tools/api` → Click "Sign In"
