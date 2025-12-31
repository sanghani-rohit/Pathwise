-- =====================================================
-- Roadmap Persistence & History
-- Step 4: Database Schema
-- =====================================================

-- Create roadmaps table (immutable, append-only)
CREATE TABLE IF NOT EXISTS roadmaps (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign key to users
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Roadmap metadata (extracted from roadmap_data.metadata)
  roadmap_id TEXT NOT NULL,  -- Generated roadmap ID (e.g., "ml-eng-6mo-abc123")
  roadmap_version TEXT NOT NULL DEFAULT '1.0',  -- Schema version
  generation_reason TEXT CHECK (generation_reason IN ('initial', 'regeneration', 'assessment_update')),

  -- Determinism tracking
  input_hash TEXT NOT NULL,  -- SHA-256 hash of input
  generation_seed BIGINT,  -- Seed used for generation

  -- LLM metadata
  llm_provider TEXT NOT NULL CHECK (llm_provider IN ('openai', 'groq')),
  model_used TEXT NOT NULL,
  generation_time_seconds NUMERIC,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,

  -- Validation status
  validation_passed BOOLEAN NOT NULL DEFAULT true,

  -- Complete roadmap data (JSONB)
  roadmap_data JSONB NOT NULL,

  -- Timestamps (immutable - never updated)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id ON roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_created_at ON roadmaps(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_roadmaps_user_created ON roadmaps(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_roadmaps_input_hash ON roadmaps(input_hash);
CREATE INDEX IF NOT EXISTS idx_roadmaps_roadmap_id ON roadmaps(roadmap_id);

-- Create index on JSONB for fast lookups
CREATE INDEX IF NOT EXISTS idx_roadmaps_data_metadata ON roadmaps USING gin ((roadmap_data->'metadata'));

-- Add comment to table
COMMENT ON TABLE roadmaps IS 'Immutable roadmap storage (append-only, never update or delete)';
COMMENT ON COLUMN roadmaps.id IS 'Internal UUID for this roadmap record';
COMMENT ON COLUMN roadmaps.user_id IS 'User who owns this roadmap';
COMMENT ON COLUMN roadmaps.roadmap_id IS 'Generated roadmap ID from metadata';
COMMENT ON COLUMN roadmaps.roadmap_version IS 'Roadmap schema version (default 1.0)';
COMMENT ON COLUMN roadmaps.generation_reason IS 'Why roadmap was generated';
COMMENT ON COLUMN roadmaps.input_hash IS 'SHA-256 hash of normalized input';
COMMENT ON COLUMN roadmaps.generation_seed IS 'Seed used for deterministic generation';
COMMENT ON COLUMN roadmaps.roadmap_data IS 'Complete roadmap JSON (Schema v1.0)';
COMMENT ON COLUMN roadmaps.created_at IS 'When roadmap was generated (immutable)';
COMMENT ON COLUMN roadmaps.validation_passed IS 'Whether roadmap passed validation';

-- Row Level Security (RLS)
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own roadmaps
CREATE POLICY "Users can read own roadmaps"
  ON roadmaps
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service role can insert roadmaps (backend only)
CREATE POLICY "Service role can insert roadmaps"
  ON roadmaps
  FOR INSERT
  WITH CHECK (true);  -- Service role bypasses this, but we define it for clarity

-- Policy: No updates allowed (immutable)
-- (No UPDATE policy = no one can update)

-- Policy: No deletes allowed (immutable)
-- (No DELETE policy = no one can delete, except CASCADE from user deletion)

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to get latest roadmap for a user
CREATE OR REPLACE FUNCTION get_latest_roadmap(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  roadmap_id TEXT,
  roadmap_version TEXT,
  generation_reason TEXT,
  input_hash TEXT,
  roadmap_data JSONB,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.roadmap_id,
    r.roadmap_version,
    r.generation_reason,
    r.input_hash,
    r.roadmap_data,
    r.created_at
  FROM roadmaps r
  WHERE r.user_id = p_user_id
    AND r.validation_passed = true
  ORDER BY r.created_at DESC
  LIMIT 1;
END;
$$;

-- Function to get roadmap history for a user
CREATE OR REPLACE FUNCTION get_roadmap_history(p_user_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  roadmap_id TEXT,
  roadmap_version TEXT,
  generation_reason TEXT,
  input_hash TEXT,
  created_at TIMESTAMPTZ,
  total_modules INTEGER,
  total_hours INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.roadmap_id,
    r.roadmap_version,
    r.generation_reason,
    r.input_hash,
    r.created_at,
    (r.roadmap_data->'learning_path_summary'->>'total_modules')::INTEGER as total_modules,
    (r.roadmap_data->'user_profile_summary'->>'total_estimated_hours')::INTEGER as total_hours
  FROM roadmaps r
  WHERE r.user_id = p_user_id
    AND r.validation_passed = true
  ORDER BY r.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Function to check if roadmap exists by input hash (deduplication)
CREATE OR REPLACE FUNCTION roadmap_exists_by_hash(p_user_id UUID, p_input_hash TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1
    FROM roadmaps
    WHERE user_id = p_user_id
      AND input_hash = p_input_hash
      AND validation_passed = true
  ) INTO v_exists;

  RETURN v_exists;
END;
$$;

COMMENT ON FUNCTION get_latest_roadmap IS 'Get the most recent validated roadmap for a user';
COMMENT ON FUNCTION get_roadmap_history IS 'Get roadmap history for a user (metadata only)';
COMMENT ON FUNCTION roadmap_exists_by_hash IS 'Check if roadmap with same input hash exists';
