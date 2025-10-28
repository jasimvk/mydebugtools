# 🔄 Collection Sync Feature

## Overview
Collections are now automatically synced between your local browser storage and the cloud (Supabase) when you sign in!

---

## How It Works

### 📱 **Without Sign-In (Local Mode)**
- Collections stored in browser's localStorage
- Data persists on your device only
- Works completely offline
- No account needed

### ☁️ **With Sign-In (Cloud Sync)**
- Collections automatically synced to cloud
- Accessible from any device
- Data backed up securely
- **Local collections automatically uploaded on first sign-in**

---

## Automatic Sync Behavior

### 🔐 When You Sign In
1. System checks for local collections with `local-*` IDs
2. Automatically uploads them to your cloud account
3. Creates all collections and their requests in Supabase
4. Replaces local IDs with permanent cloud IDs
5. Shows console message: `"✅ Local collections synced successfully!"`

### 📥 Loading Collections
- **Not signed in**: Loads from localStorage
- **Signed in**: 
  1. Fetches cloud collections
  2. Checks for unsynced local collections
  3. Syncs any local-only collections to cloud
  4. Merges everything together

---

## Manual Sync Button

### 🔄 **Sync Icon in Collections Sidebar**
Located in the collections header (only visible when signed in):
- Click the refresh icon to force a sync
- Icon spins during sync
- Useful if you suspect data is out of sync
- Uploads any new local collections
- Downloads latest from cloud

---

## Collection ID System

### Local Collections
```
ID Format: local-1730123456789-abc123def
```
- Created when not signed in
- Stored only in browser
- Automatically synced when you sign in

### Cloud Collections  
```
ID Format: e7f8a9b0-1234-5678-90ab-cdef12345678
```
- UUID from Supabase
- Persistent across devices
- Created when signed in or after sync

---

## Sync Process Example

### Before Sign-In
```
localStorage:
[
  {
    id: "local-1730123456789-abc123",
    name: "My API Tests",
    requests: [...]
  }
]
```

### After Sign-In & Sync
```
Cloud (Supabase):
[
  {
    id: "e7f8a9b0-1234-5678-90ab-cdef12345678",
    name: "My API Tests",  // ✅ Synced!
    requests: [...]        // ✅ All requests synced!
  }
]

localStorage updated with cloud IDs
```

---

## Troubleshooting

### ❌ Collections Not Syncing?

**Check Console Logs:**
```
🔄 Syncing X local collection(s) to cloud...
✅ Local collections synced successfully!
```

**Common Issues:**

1. **Not Signed In**
   - Solution: Click "Save My Workspace" and sign in with Google

2. **Network Error**
   - Solution: Check internet connection
   - Check browser console for errors
   - Try manual sync button

3. **Supabase Connection Issue**
   - Check `.env.local` has correct credentials
   - Verify Supabase project is active
   - Check API limits (free tier has limits)

4. **Authentication Issue**
   - Sign out and sign back in
   - Clear browser cache
   - Check NextAuth configuration

---

## Testing Sync

### Test Scenario 1: Local to Cloud
1. Open API Tester (not signed in)
2. Create collection "Test Collection"
3. Add some requests
4. Click "Save My Workspace" → Sign in
5. Check console: Should see sync messages
6. Refresh page: Collections still there with cloud IDs
7. ✅ Success!

### Test Scenario 2: Cloud to Local
1. Sign in on Device A
2. Create collection "Device A Collection"
3. Sign in on Device B
4. Collections from Device A should appear
5. ✅ Success!

### Test Scenario 3: Manual Sync
1. Sign in
2. Create collection offline (disconnect wifi)
3. Reconnect wifi
4. Click sync button (🔄) in sidebar
5. Collection should upload
6. ✅ Success!

---

## Data Flow Diagram

```
┌─────────────────┐
│  User Creates   │
│   Collection    │
└────────┬────────┘
         │
         ▼
    ┌────────┐
    │ Signed │
    │  In?   │
    └───┬────┘
        │
    ┌───┴───┐
    │       │
   NO      YES
    │       │
    ▼       ▼
┌────────┐ ┌──────────┐
│ Local  │ │ Cloud +  │
│ Only   │ │ Local    │
└────────┘ └──────────┘
    │           │
    │           ▼
    │      ┌────────────┐
    │      │ Auto-sync  │
    │      │ to Supabase│
    │      └────────────┘
    │           │
    └───────────┴─────────┐
                          │
                          ▼
                    ┌──────────┐
                    │ Available│
                    │   Now    │
                    └──────────┘
```

---

## API Endpoints Used

### GET `/api/collections`
- Fetches user's collections from Supabase
- Includes all nested requests
- Requires authentication

### POST `/api/collections`
- Creates new collection in cloud
- Returns cloud ID
- Used during sync

### POST `/api/requests`
- Saves request to collection
- Used during sync to upload local requests
- Requires collection ID

---

## Performance

- **Initial Sync**: ~100-500ms per collection
- **Manual Sync**: Checks and uploads only new items
- **Background**: No performance impact
- **Offline**: Works perfectly, syncs when online

---

## Security

- ✅ Collections tied to authenticated user
- ✅ Row Level Security (RLS) in Supabase
- ✅ No access to other users' data
- ✅ Secure HTTPS connections
- ✅ OAuth 2.0 authentication

---

## Future Enhancements

### Planned Features:
- [ ] Conflict resolution (if edited on multiple devices)
- [ ] Sync status indicator in UI
- [ ] Selective sync (choose which collections to sync)
- [ ] Export/import with cloud backup
- [ ] Sync history and versioning
- [ ] Real-time sync (websockets)

---

## Quick Reference

| Action | Result |
|--------|--------|
| Create collection (no auth) | Saved locally only |
| Create collection (authenticated) | Saved to cloud + local |
| Sign in with local collections | Auto-syncs to cloud |
| Sign in without local collections | Downloads cloud collections |
| Click sync button | Forces sync check |
| Sign out | Collections remain in localStorage |
| Clear browser data | Loses local collections (cloud unaffected) |

---

## Console Messages

Look for these in browser console (F12):

```javascript
// When syncing
"Syncing 3 local collection(s) to cloud..."

// After successful sync
"✅ Local collections synced successfully!"

// On errors
"Error loading collections: [error message]"
"Error syncing collection: [error message]"
```

---

## Need Help?

1. Check browser console for error messages
2. Verify you're signed in (email shows in header)
3. Try the manual sync button
4. Check Supabase dashboard for data
5. Verify environment variables are set

---

**Last Updated**: October 28, 2025
**Version**: 1.0.0
