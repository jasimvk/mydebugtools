-- Route-level history for every DebugTools utility.
-- This stores tool visits only. Do not store pasted payloads, tokens, logs, request bodies, or headers here.

CREATE TABLE IF NOT EXISTS tool_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tool_slug TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  tool_path TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'visit' CHECK (event_type IN ('visit', 'open', 'run')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tool_history_user_id ON tool_history(user_id);
CREATE INDEX IF NOT EXISTS idx_tool_history_created_at ON tool_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tool_history_tool_slug ON tool_history(tool_slug);

ALTER TABLE tool_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own tool history" ON tool_history;
CREATE POLICY "Users can view own tool history"
  ON tool_history FOR SELECT
  USING (auth.uid()::uuid = user_id);

DROP POLICY IF EXISTS "Users can create own tool history" ON tool_history;
CREATE POLICY "Users can create own tool history"
  ON tool_history FOR INSERT
  WITH CHECK (auth.uid()::uuid = user_id);

DROP POLICY IF EXISTS "Users can delete own tool history" ON tool_history;
CREATE POLICY "Users can delete own tool history"
  ON tool_history FOR DELETE
  USING (auth.uid()::uuid = user_id);
