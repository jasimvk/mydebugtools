# Supabase Database Setup Guide

## Overview
This guide will help you set up Supabase as the database backend for MyDebugTools API Tester, enabling persistent storage of user data, collections, and requests.

## Step 1: Create a Supabase Project

1. **Sign up for Supabase**
   - Go to [https://supabase.com](https://supabase.com)
   - Click "Start your project"
   - Sign in with GitHub or create an account

2. **Create a new project**
   - Click "New Project"
   - Choose your organization (or create one)
   - Set project details:
     - **Name**: `mydebugtools` (or your preferred name)
     - **Database Password**: Generate a strong password (save this!)
     - **Region**: Choose closest to your users
     - **Pricing Plan**: Free tier is sufficient for development

3. **Wait for project setup** (takes 1-2 minutes)

## Step 2: Configure Environment Variables

1. **Get your Supabase credentials**
   - In your Supabase project dashboard, go to **Settings → API**
   - Copy the following values:
     - **Project URL** (looks like: `https://xxxxx.supabase.co`)
     - **anon/public** key (starts with `eyJ...`)
     - **service_role** key (also starts with `eyJ...`)

2. **Update `.env.local`**
   ```bash
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

   ⚠️ **Important**: 
   - Never commit `.env.local` to version control
   - The `service_role` key has admin privileges - keep it secret!

## Step 3: Run the Database Schema

1. **Open Supabase SQL Editor**
   - In your Supabase dashboard, click **SQL Editor** in the left sidebar
   - Click **New Query**

2. **Execute the schema**
   - Copy the entire contents of `supabase/schema.sql`
   - Paste into the SQL Editor
   - Click **Run** (or press Cmd/Ctrl + Enter)

3. **Verify tables were created**
   - Go to **Table Editor** in the left sidebar
   - You should see these tables:
     - `users`
     - `accounts`
     - `sessions`
     - `verification_tokens`
     - `api_collections`
     - `api_requests`
     - `api_environments`
     - `api_request_history`
     - `user_preferences`

## Step 4: Configure Row Level Security (RLS)

The schema automatically sets up RLS policies, but verify:

1. **Check RLS status**
   - Go to **Authentication → Policies**
   - Ensure all tables have RLS enabled
   - Verify policies exist for each table

2. **Test policies**
   - Policies ensure users can only access their own data
   - Demo user will work automatically

## Step 5: Test the Integration

1. **Restart your development server**
   ```bash
   npm run dev
   ```

2. **Sign in with demo account**
   - Email: `demo@example.com`
   - Password: `demo123`

3. **Create a test collection**
   - The collection should be saved to Supabase
   - Refresh the page - collection should persist

4. **Check Supabase dashboard**
   - Go to **Table Editor → api_collections**
   - You should see your test collection

## Database Schema Overview

### Users Table
Stores user accounts with role-based access:
- `id`: UUID primary key
- `email`: Unique user email
- `name`: Display name
- `role`: `free`, `pro`, or `admin`
- `created_at`, `updated_at`: Timestamps

### Collections Table
Organizes API requests:
- `id`: UUID primary key
- `user_id`: Foreign key to users
- `name`: Collection name
- `description`: Optional description
- `color`: Hex color code (default: #FF6C37)

### Requests Table
Stores saved API requests:
- `id`: UUID primary key
- `collection_id`: Foreign key to collections
- `user_id`: Foreign key to users
- `name`: Request name
- `method`: HTTP method (GET, POST, etc.)
- `url`: Request URL
- `headers`: JSONB array of headers
- `body`: Request body (text)
- `auth_config`: JSONB auth configuration

### Other Tables
- **accounts**: OAuth provider accounts
- **sessions**: NextAuth sessions
- **api_environments**: Environment variables
- **api_request_history**: Request execution history
- **user_preferences**: User settings

## API Endpoints

### Collections
- `GET /api/collections` - Get all collections
- `POST /api/collections` - Create collection
- `DELETE /api/collections?id=xxx` - Delete collection

### Requests
- `POST /api/requests` - Create request
- `DELETE /api/requests?id=xxx` - Delete request

## Features Enabled

✅ **User Authentication**
- OAuth (Google, GitHub)
- Credentials (email/password)
- Session management

✅ **Data Persistence**
- Collections sync across devices
- Requests saved to cloud
- Environment variables stored

✅ **Security**
- Row Level Security (RLS)
- Users can only access their own data
- Service role key for admin operations

✅ **Multi-user Support**
- Each user has isolated data
- Role-based access (free/pro/admin)
- Ready for tier restrictions

## Migrating from LocalStorage

To migrate existing data from LocalStorage to Supabase:

1. **Export your collections**
   - Use the export button in the UI
   - Save the JSON file

2. **Sign in to your account**

3. **Import collections**
   - Use the import button
   - Select your saved JSON file
   - Collections will be saved to Supabase

## Troubleshooting

### "Failed to fetch collections"
- Check that Supabase URL and keys are correct in `.env.local`
- Restart your dev server after updating env vars
- Verify RLS policies are set up correctly

### "Unauthorized" error
- Make sure you're signed in
- Check that `getServerSession` is working
- Verify NextAuth is configured correctly

### Tables not created
- Re-run the schema.sql script
- Check for SQL errors in Supabase logs
- Ensure you have correct permissions

### Collections not saving
- Open browser console for errors
- Check Network tab for API call failures
- Verify user_id is being set correctly

## Advanced Features

### Backup Strategy
```sql
-- Backup all user data
SELECT * FROM api_collections WHERE user_id = 'your-user-id';
SELECT * FROM api_requests WHERE user_id = 'your-user-id';
```

### Bulk Operations
Use Supabase SQL Editor for bulk updates:
```sql
-- Update all requests in a collection
UPDATE api_requests 
SET headers = jsonb_set(headers, '{Authorization}', '"Bearer token"')
WHERE collection_id = 'collection-id';
```

### Analytics Queries
```sql
-- Most used HTTP methods
SELECT method, COUNT(*) as count
FROM api_request_history
WHERE user_id = 'your-user-id'
GROUP BY method
ORDER BY count DESC;
```

## Production Deployment

1. **Environment Variables**
   - Set all Supabase vars in production
   - Use different projects for dev/staging/prod

2. **Database Backups**
   - Supabase Pro includes daily backups
   - Manual exports via SQL Editor

3. **Monitoring**
   - Check Supabase Dashboard for usage
   - Set up alerts for errors
   - Monitor API response times

4. **Scaling**
   - Free tier: 500MB database, 2GB bandwidth
   - Pro tier: Unlimited projects, better performance
   - Enterprise: Dedicated infrastructure

## Next Steps

- [ ] Implement user registration page
- [ ] Add password reset functionality
- [ ] Create user profile page
- [ ] Implement pro tier restrictions
- [ ] Add request history view
- [ ] Create shared collections feature
- [ ] Set up real-time collaboration

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [NextAuth + Supabase](https://next-auth.js.org/adapters/supabase)
