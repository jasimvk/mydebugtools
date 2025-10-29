# 🚀 mydebugtools.com Deployment Checklist

## Google OAuth Setup for mydebugtools.com

### Step 1: Configure Google Cloud Console
Go to: https://console.cloud.google.com/apis/credentials

Add **ALL THREE** redirect URIs to your OAuth client:
- ✅ Development: `http://localhost:3000/api/auth/callback/google`
- ✅ Production (non-www): `https://mydebugtools.com/api/auth/callback/google`
- ✅ Production (www): `https://www.mydebugtools.com/api/auth/callback/google`

**Important**: You need BOTH www and non-www versions because users can access your site either way!

### Step 2: Environment Variables

#### Development (.env.local)
```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret-here
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

#### Production (Vercel/Hosting Dashboard)
```bash
NEXTAUTH_URL=https://mydebugtools.com
NEXTAUTH_SECRET=your-generated-secret-here
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
NEXT_PUBLIC_SUPABASE_URL=https://caknnnfulqwqfuyjfaaz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-X21C1DLPKK
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-0798000003597387
```

---

## Pre-Deployment Checklist

### 🔐 Authentication
- [ ] Google OAuth client created
- [ ] Both redirect URIs added (localhost + mydebugtools.com)
- [ ] OAuth consent screen configured
- [ ] Test users added (if app not published)
- [ ] Credentials copied to both .env.local and hosting platform

### 🗄️ Database
- [ ] Supabase project created
- [ ] All 9 tables created (run schema.sql)
- [ ] Row Level Security policies enabled
- [ ] Service role key secured
- [ ] Connection tested locally

### 🌐 Domain & DNS
- [ ] Domain registered: mydebugtools.com
- [ ] DNS configured (pointing to hosting)
- [ ] SSL certificate active (HTTPS working)
- [ ] www redirect configured (optional)

### 📊 Analytics & Ads
- [ ] Google Analytics configured (G-X21C1DLPKK)
- [ ] AdSense account linked (ca-pub-0798000003597387)
- [ ] ads.txt file in public folder
- [ ] Cookie consent implemented

### 🔒 Security
- [ ] NEXTAUTH_SECRET generated (unique, 32+ characters)
- [ ] Environment variables secured (not committed to git)
- [ ] CORS properly configured
- [ ] Rate limiting enabled (API routes)

---

## Vercel Deployment Steps

### 1. Connect Repository
```bash
# Push to GitHub first
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### 2. Import to Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure project:
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Build Command: `npm run build`

### 3. Add Environment Variables
Copy all production variables from `.env.production`:
```
NEXTAUTH_URL=https://mydebugtools.com
NEXTAUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_GA_MEASUREMENT_ID=...
NEXT_PUBLIC_ADSENSE_CLIENT=...
```

### 4. Configure Domain
1. Go to Project Settings → Domains
2. Add domain: `mydebugtools.com`
3. Add www redirect: `www.mydebugtools.com` → `mydebugtools.com`
4. Configure DNS (follow Vercel instructions)

### 5. Deploy
Click **"Deploy"** and wait for build to complete!

---

## Post-Deployment Testing

### Test Authentication
1. Visit: https://mydebugtools.com/tools/api
2. Click "Save My Workspace"
3. Sign in with Google
4. Verify:
   - [ ] Modal appears
   - [ ] Google OAuth redirect works
   - [ ] Redirected back to mydebugtools.com
   - [ ] Email shows in header
   - [ ] Can create collections
   - [ ] Collections save to Supabase

### Test Collections
1. Create a new collection
2. Save a request
3. Refresh page - data should persist
4. Open in incognito - verify local storage works
5. Sign in - verify cloud sync works

### Test Performance
- [ ] Page loads in < 3 seconds
- [ ] API responses < 500ms
- [ ] No console errors
- [ ] Mobile responsive
- [ ] All tools working

---

## Monitoring & Maintenance

### Check Regularly
- [ ] Google Analytics traffic
- [ ] Supabase usage/limits
- [ ] Error logs (Vercel dashboard)
- [ ] SSL certificate expiry
- [ ] DNS health

### Update When Needed
- [ ] Dependencies (`npm update`)
- [ ] Node.js version
- [ ] Next.js version
- [ ] OAuth credentials rotation

---

## Troubleshooting Production

### 400 Error on Google Sign-In
**Cause**: Redirect URI not configured
**Fix**: Add `https://mydebugtools.com/api/auth/callback/google` to Google Console

### "Configuration" Error
**Cause**: Environment variables missing
**Fix**: Check all env vars are set in Vercel dashboard

### Collections Not Saving
**Cause**: Supabase credentials wrong or RLS blocking
**Fix**: 
1. Check SUPABASE_SERVICE_ROLE_KEY
2. Verify RLS policies allow authenticated users

### Slow Performance
**Cause**: Cold starts or large bundle
**Fix**:
1. Enable Vercel Analytics
2. Optimize images
3. Enable caching headers

---

## Support Links

- **Google Cloud Console**: https://console.cloud.google.com/
- **Supabase Dashboard**: https://app.supabase.com/
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Domain Registrar**: Your DNS provider
- **GitHub Repo**: https://github.com/jasimvk/mydebugtools

---

## 🎉 Success!

Your app should now be live at:
- 🌐 **https://mydebugtools.com**
- 🔐 Google authentication working
- 💾 Collections syncing to cloud
- 📊 Analytics tracking
- 🚀 Fast and secure

---

## Quick Commands

```bash
# Local development
npm run dev

# Build for production
npm run build

# Start production server locally
npm start

# Deploy to Vercel (automatic on git push)
git push origin main

# Generate new secret
openssl rand -base64 32
```

---

Last Updated: October 28, 2025
