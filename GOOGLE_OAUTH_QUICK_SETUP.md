# 🚀 Quick Google OAuth Setup Guide

## The 400 Error Fix

The "400 - malformed request" error happens because Google OAuth isn't configured yet. Follow these steps to fix it:

---

## Step 1: Go to Google Cloud Console
Visit: **https://console.cloud.google.com/**

---

## Step 2: Create/Select Project
1. Click the project dropdown at the top
2. Click **"New Project"**
3. Name: `MyDebugTools` (or any name you prefer)
4. Click **"Create"**
5. Wait for the project to be created (10-30 seconds)

---

## Step 3: Enable Google+ API
1. Go to **"APIs & Services"** → **"Library"**
2. Search for: `Google+ API`
3. Click on it
4. Click **"Enable"**

---

## Step 4: Configure OAuth Consent Screen
1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Choose **"External"** (unless you have a Google Workspace)
3. Click **"Create"**
4. Fill in:
   - **App name**: MyDebugTools
   - **User support email**: Your email
   - **Developer contact email**: Your email
5. Click **"Save and Continue"**
6. Skip **"Scopes"** (click "Save and Continue")
7. Add **test users** (your Gmail for testing)
8. Click **"Save and Continue"**

---

## Step 5: Create OAuth Client ID
1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ Create Credentials"** → **"OAuth client ID"**
3. Application type: **"Web application"**
4. Name: `MyDebugTools Web Client`
5. Under **"Authorized redirect URIs"**, click **"+ Add URI"**
6. Add BOTH URLs (for development and production):
   ```
   http://localhost:3000/api/auth/callback/google
   https://mydebugtools.com/api/auth/callback/google
   ```
7. Click **"Create"**

---

## Step 6: Copy Your Credentials
After creation, you'll see a popup with:
- **Client ID** (looks like: `123456789-abc123xyz.apps.googleusercontent.com`)
- **Client Secret** (looks like: `GOCSPX-abc123xyz789`)

**Copy both** - you'll need them next!

---

## Step 7: Update .env.local File
1. Open your `.env.local` file
2. Replace the placeholder values:

```bash
# Replace these lines:
GOOGLE_CLIENT_ID=your-actual-client-id-from-google-console
GOOGLE_CLIENT_SECRET=your-actual-client-secret-from-google-console

# With your actual credentials:
GOOGLE_CLIENT_ID=123456789-abc123xyz.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz789
```

3. Also generate a secure NEXTAUTH_SECRET:
```bash
# Run this in terminal:
openssl rand -base64 32

# Copy the output and replace:
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32
```

---

## Step 8: Restart Your Dev Server
```bash
# Stop the server (Ctrl+C)
# Start again:
npm run dev
```

---

## Step 9: Test It!
1. Go to: **http://localhost:3000/tools/api**
2. Click **"Save My Workspace"** button
3. You should see the auth modal
4. Click **"Continue with Google"**
5. Select your Google account
6. Grant permissions
7. You should be redirected back and see your email in the header!

---

## ✅ Success Checklist
- [ ] Project created in Google Cloud Console
- [ ] Google+ API enabled
- [ ] OAuth consent screen configured
- [ ] OAuth client created with correct redirect URI
- [ ] Credentials copied to .env.local
- [ ] NEXTAUTH_SECRET generated and added
- [ ] Dev server restarted
- [ ] Google sign-in working!

---

## 🐛 Troubleshooting

### Still getting 400 error?
**Check:**
1. Redirect URI is EXACTLY: `http://localhost:3000/api/auth/callback/google`
2. No trailing slash
3. No typos
4. Dev server restarted after changing .env.local

### "Access blocked" error?
**Add yourself as a test user:**
1. Go to OAuth consent screen
2. Scroll to "Test users"
3. Click "+ Add Users"
4. Add your Gmail address

### "App not verified" warning?
**This is normal for development!**
- Click "Advanced"
- Click "Go to MyDebugTools (unsafe)" - it's safe, it's your app!

---

## 📝 Production Deployment

When deploying to production at **mydebugtools.com**:

### ✅ Already Done (if you added both URIs in Step 5):
- Production redirect URI: `https://mydebugtools.com/api/auth/callback/google`

### If You Need to Add Production URI Later:
1. Go to Google Cloud Console → Credentials
2. Click your OAuth client
3. Add redirect URI:
   ```
   https://mydebugtools.com/api/auth/callback/google
   ```

### Add Environment Variables in Vercel/Hosting:
1. Go to your hosting platform dashboard
2. Add these environment variables:
   ```
   NEXTAUTH_URL=https://mydebugtools.com
   NEXTAUTH_SECRET=your-generated-secret
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   NEXT_PUBLIC_SUPABASE_URL=https://caknnnfulqwqfuyjfaaz.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

### Publish OAuth Consent Screen:
1. Go to OAuth consent screen
2. Click "Publish App"
3. Submit for verification (optional, but removes "unverified" warning)

---

## 🎉 Done!

You should now be able to:
- ✅ Click "Save My Workspace"
- ✅ See the auth modal
- ✅ Sign in with Google
- ✅ Sync collections to cloud
- ✅ Access from any device

---

## Need Help?

- **Google OAuth Docs**: https://developers.google.com/identity/protocols/oauth2
- **NextAuth Docs**: https://next-auth.js.org/providers/google
- **Your Credentials**: https://console.cloud.google.com/apis/credentials
