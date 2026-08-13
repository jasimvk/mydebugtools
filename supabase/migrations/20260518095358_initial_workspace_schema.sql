-- Supabase Database Schema for debugtools API Tester
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends NextAuth default users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  email_verified TIMESTAMPTZ,
  image TEXT,
  role TEXT DEFAULT 'free' CHECK (role IN ('free', 'pro', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- NextAuth accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, provider_account_id)
);

-- NextAuth sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_token TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NextAuth verification tokens table
CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- API Collections table
CREATE TABLE IF NOT EXISTS api_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#FF6C37',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Requests table (saved requests in collections)
CREATE TABLE IF NOT EXISTS api_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES api_collections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS')),
  url TEXT NOT NULL,
  headers JSONB DEFAULT '[]'::jsonb,
  body TEXT,
  auth_config JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Environments table
CREATE TABLE IF NOT EXISTS api_environments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- API Request History table
CREATE TABLE IF NOT EXISTS api_request_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  method TEXT NOT NULL,
  url TEXT NOT NULL,
  headers JSONB DEFAULT '[]'::jsonb,
  body TEXT,
  status_code INT,
  response_time INT,
  response_size INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light',
  auto_save BOOLEAN DEFAULT true,
  auto_format BOOLEAN DEFAULT true,
  rate_limit INT DEFAULT 60,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workspaces table. Personal workspaces are created automatically; team workspaces can be added later.
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'team', 'enterprise')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workspace members and roles
CREATE TABLE IF NOT EXISTS workspace_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'developer' CHECK (role IN ('owner', 'admin', 'developer', 'viewer')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'disabled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

-- Workspace-owned debug reports for future AI/debugging flows
CREATE TABLE IF NOT EXISTS debug_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  source_type TEXT DEFAULT 'api' CHECK (source_type IN ('api', 'log', 'trace', 'crash', 'build', 'manual')),
  summary TEXT,
  context JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backward-compatible workspace linkage for existing API collections.
ALTER TABLE api_collections ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
ALTER TABLE api_requests ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_api_collections_user_id ON api_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_api_requests_collection_id ON api_requests(collection_id);
CREATE INDEX IF NOT EXISTS idx_api_requests_user_id ON api_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_api_environments_user_id ON api_environments(user_id);
CREATE INDEX IF NOT EXISTS idx_api_request_history_user_id ON api_request_history(user_id);
CREATE INDEX IF NOT EXISTS idx_api_request_history_created_at ON api_request_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workspaces_owner_id ON workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_api_collections_workspace_id ON api_collections(workspace_id);
CREATE INDEX IF NOT EXISTS idx_debug_reports_workspace_id ON debug_reports(workspace_id);

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_environments ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_request_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE debug_reports ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid()::uuid = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid()::uuid = id);

-- Collections policies
CREATE POLICY "Users can view own collections"
  ON api_collections FOR SELECT
  USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can create own collections"
  ON api_collections FOR INSERT
  WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "Users can update own collections"
  ON api_collections FOR UPDATE
  USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can delete own collections"
  ON api_collections FOR DELETE
  USING (auth.uid()::uuid = user_id);

-- Requests policies
CREATE POLICY "Users can view own requests"
  ON api_requests FOR SELECT
  USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can create own requests"
  ON api_requests FOR INSERT
  WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "Users can update own requests"
  ON api_requests FOR UPDATE
  USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can delete own requests"
  ON api_requests FOR DELETE
  USING (auth.uid()::uuid = user_id);

-- Environments policies
CREATE POLICY "Users can view own environments"
  ON api_environments FOR SELECT
  USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can create own environments"
  ON api_environments FOR INSERT
  WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "Users can update own environments"
  ON api_environments FOR UPDATE
  USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can delete own environments"
  ON api_environments FOR DELETE
  USING (auth.uid()::uuid = user_id);

-- History policies
CREATE POLICY "Users can view own history"
  ON api_request_history FOR SELECT
  USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can create own history"
  ON api_request_history FOR INSERT
  WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "Users can delete own history"
  ON api_request_history FOR DELETE
  USING (auth.uid()::uuid = user_id);

-- Preferences policies
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can create own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid()::uuid = user_id);

-- Workspace policies
CREATE POLICY "Members can view their workspaces"
  ON workspaces FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = workspaces.id
        AND workspace_members.user_id = auth.uid()::uuid
        AND workspace_members.status = 'active'
    )
  );

CREATE POLICY "Users can create owned workspaces"
  ON workspaces FOR INSERT
  WITH CHECK (auth.uid()::uuid = owner_id);

CREATE POLICY "Owners can update workspaces"
  ON workspaces FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = workspaces.id
        AND workspace_members.user_id = auth.uid()::uuid
        AND workspace_members.role IN ('owner', 'admin')
        AND workspace_members.status = 'active'
    )
  );

CREATE POLICY "Members can view workspace members"
  ON workspace_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members viewer
      WHERE viewer.workspace_id = workspace_members.workspace_id
        AND viewer.user_id = auth.uid()::uuid
        AND viewer.status = 'active'
    )
  );

CREATE POLICY "Owners and admins can manage workspace members"
  ON workspace_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members manager
      WHERE manager.workspace_id = workspace_members.workspace_id
        AND manager.user_id = auth.uid()::uuid
        AND manager.role IN ('owner', 'admin')
        AND manager.status = 'active'
    )
  );

CREATE POLICY "Members can view debug reports"
  ON debug_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = debug_reports.workspace_id
        AND workspace_members.user_id = auth.uid()::uuid
        AND workspace_members.status = 'active'
    )
  );

CREATE POLICY "Contributors can create debug reports"
  ON debug_reports FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = debug_reports.workspace_id
        AND workspace_members.user_id = auth.uid()::uuid
        AND workspace_members.role IN ('owner', 'admin', 'developer')
        AND workspace_members.status = 'active'
    )
  );

-- Functions for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_collections_updated_at BEFORE UPDATE ON api_collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_requests_updated_at BEFORE UPDATE ON api_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_environments_updated_at BEFORE UPDATE ON api_environments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspace_members_updated_at BEFORE UPDATE ON workspace_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_debug_reports_updated_at BEFORE UPDATE ON debug_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
