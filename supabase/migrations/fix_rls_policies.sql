-- ============================================================================
-- Fix Supabase RLS Policies for Roadmap Generation
-- ============================================================================
-- This migration fixes 403 Forbidden errors by creating proper Row Level Security policies

-- Enable RLS on all tables (if not already enabled)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to make migration idempotent)
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;

DROP POLICY IF EXISTS "Users can view their own skill requests" ON skill_requests;
DROP POLICY IF EXISTS "Users can insert their own skill requests" ON skill_requests;
DROP POLICY IF EXISTS "Users can update their own skill requests" ON skill_requests;

DROP POLICY IF EXISTS "Users can view their own assessments" ON assessments;
DROP POLICY IF EXISTS "Users can insert their own assessments" ON assessments;
DROP POLICY IF EXISTS "Users can update their own assessments" ON assessments;

DROP POLICY IF EXISTS "Users can view their own roadmaps" ON roadmaps;
DROP POLICY IF EXISTS "Users can insert their own roadmaps" ON roadmaps;
DROP POLICY IF EXISTS "Users can update their own roadmaps" ON roadmaps;

DROP POLICY IF EXISTS "Users can view their own roadmap sections" ON roadmap_sections;
DROP POLICY IF EXISTS "Users can insert their own roadmap sections" ON roadmap_sections;

DROP POLICY IF EXISTS "Users can view their own roadmap progress" ON roadmap_progress;
DROP POLICY IF EXISTS "Users can insert their own roadmap progress" ON roadmap_progress;
DROP POLICY IF EXISTS "Users can update their own roadmap progress" ON roadmap_progress;

DROP POLICY IF EXISTS "Anyone can read roadmap templates" ON roadmap_templates;

-- ============================================================================
-- USER_PROFILES Policies
-- ============================================================================

CREATE POLICY "Users can view their own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- SKILL_REQUESTS Policies
-- ============================================================================

CREATE POLICY "Users can view their own skill requests"
  ON skill_requests
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own skill requests"
  ON skill_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skill requests"
  ON skill_requests
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- ASSESSMENTS Policies
-- ============================================================================

CREATE POLICY "Users can view their own assessments"
  ON assessments
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assessments"
  ON assessments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments"
  ON assessments
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- ROADMAPS Policies
-- ============================================================================

CREATE POLICY "Users can view their own roadmaps"
  ON roadmaps
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own roadmaps"
  ON roadmaps
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own roadmaps"
  ON roadmaps
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- ROADMAP_SECTIONS Policies
-- ============================================================================

CREATE POLICY "Users can view their own roadmap sections"
  ON roadmap_sections
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own roadmap sections"
  ON roadmap_sections
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- ROADMAP_PROGRESS Policies
-- ============================================================================

CREATE POLICY "Users can view their own roadmap progress"
  ON roadmap_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own roadmap progress"
  ON roadmap_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own roadmap progress"
  ON roadmap_progress
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- ROADMAP_TEMPLATES Policies (Read-only for all authenticated users)
-- ============================================================================

CREATE POLICY "Anyone can read roadmap templates"
  ON roadmap_templates
  FOR SELECT
  USING (true);

-- ============================================================================
-- Success Message
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'RLS policies created successfully!';
  RAISE NOTICE 'All users can now:';
  RAISE NOTICE '  - View/update their own profiles';
  RAISE NOTICE '  - View/insert/update their own skill requests';
  RAISE NOTICE '  - View/insert/update their own assessments';
  RAISE NOTICE '  - View/insert/update their own roadmaps';
  RAISE NOTICE '  - View/insert their own roadmap sections';
  RAISE NOTICE '  - View/insert/update their own progress';
  RAISE NOTICE '  - Read all roadmap templates';
END $$;
