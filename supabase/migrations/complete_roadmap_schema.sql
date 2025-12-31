-- ============================================
-- COMPLETE ROADMAP SCHEMA MIGRATION
-- Safe incremental approach
-- ============================================

-- STEP 1: Drop dependent table first (to avoid foreign key conflicts)
-- ============================================
DROP TABLE IF EXISTS public.learning_path_steps CASCADE;

-- STEP 2: Drop and recreate roadmaps table
-- ============================================
DROP TABLE IF EXISTS public.roadmaps CASCADE;

CREATE TABLE public.roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE SET NULL,
  target_skill TEXT NOT NULL,
  analysis_summary TEXT NOT NULL,
  strengths TEXT[] DEFAULT '{}',
  weaknesses TEXT[] DEFAULT '{}',
  recommended_order TEXT[] DEFAULT '{}',
  roadmap_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 3: Create indexes on roadmaps table
-- ============================================
CREATE INDEX idx_roadmaps_user_id ON public.roadmaps(user_id);
CREATE INDEX idx_roadmaps_assessment_id ON public.roadmaps(assessment_id);
CREATE INDEX idx_roadmaps_created_at ON public.roadmaps(created_at DESC);

-- STEP 4: Enable RLS on roadmaps table
-- ============================================
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;

-- STEP 5: Drop existing policies and create new ones for roadmaps
-- ============================================
DROP POLICY IF EXISTS "Users can view their own roadmaps" ON public.roadmaps;
DROP POLICY IF EXISTS "Users can create their own roadmaps" ON public.roadmaps;
DROP POLICY IF EXISTS "Users can update their own roadmaps" ON public.roadmaps;
DROP POLICY IF EXISTS "Users can delete their own roadmaps" ON public.roadmaps;

CREATE POLICY "Users can view their own roadmaps"
  ON public.roadmaps FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own roadmaps"
  ON public.roadmaps FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own roadmaps"
  ON public.roadmaps FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own roadmaps"
  ON public.roadmaps FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- STEP 6: Now create learning_path_steps table (after roadmaps exists)
-- ============================================
CREATE TABLE public.learning_path_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  roadmap_id UUID NOT NULL REFERENCES public.roadmaps(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL,
  topic_title TEXT NOT NULL,
  skill TEXT DEFAULT '',
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_roadmap_topic UNIQUE (user_id, roadmap_id, topic_id)
);

-- STEP 7: Create indexes on learning_path_steps table
-- ============================================
CREATE INDEX idx_learning_path_steps_user_id ON public.learning_path_steps(user_id);
CREATE INDEX idx_learning_path_steps_roadmap_id ON public.learning_path_steps(roadmap_id);
CREATE INDEX idx_learning_path_steps_completed ON public.learning_path_steps(completed);
CREATE INDEX idx_learning_path_steps_completed_at ON public.learning_path_steps(completed_at DESC);

-- STEP 8: Enable RLS on learning_path_steps table
-- ============================================
ALTER TABLE public.learning_path_steps ENABLE ROW LEVEL SECURITY;

-- STEP 9: Drop existing policies and create new ones for learning_path_steps
-- ============================================
DROP POLICY IF EXISTS "Users can view their own learning steps" ON public.learning_path_steps;
DROP POLICY IF EXISTS "Users can create their own learning steps" ON public.learning_path_steps;
DROP POLICY IF EXISTS "Users can update their own learning steps" ON public.learning_path_steps;
DROP POLICY IF EXISTS "Users can delete their own learning steps" ON public.learning_path_steps;

CREATE POLICY "Users can view their own learning steps"
  ON public.learning_path_steps FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own learning steps"
  ON public.learning_path_steps FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning steps"
  ON public.learning_path_steps FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own learning steps"
  ON public.learning_path_steps FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- STEP 10: Add missing columns to assessments table (if not exist)
-- ============================================
DO $$
BEGIN
  -- Add completed_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'assessments'
    AND column_name = 'completed_at'
  ) THEN
    ALTER TABLE public.assessments ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Add total_questions column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'assessments'
    AND column_name = 'total_questions'
  ) THEN
    ALTER TABLE public.assessments ADD COLUMN total_questions INTEGER DEFAULT 30;
  END IF;

  -- Add correct_count column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'assessments'
    AND column_name = 'correct_count'
  ) THEN
    ALTER TABLE public.assessments ADD COLUMN correct_count INTEGER DEFAULT 0;
  END IF;

  -- Add wrong_count column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'assessments'
    AND column_name = 'wrong_count'
  ) THEN
    ALTER TABLE public.assessments ADD COLUMN wrong_count INTEGER DEFAULT 0;
  END IF;

  -- Add skipped_count column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'assessments'
    AND column_name = 'skipped_count'
  ) THEN
    ALTER TABLE public.assessments ADD COLUMN skipped_count INTEGER DEFAULT 0;
  END IF;

  -- Add max_score column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'assessments'
    AND column_name = 'max_score'
  ) THEN
    ALTER TABLE public.assessments ADD COLUMN max_score INTEGER DEFAULT 30;
  END IF;

  -- Add evaluation_results column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'assessments'
    AND column_name = 'evaluation_results'
  ) THEN
    ALTER TABLE public.assessments ADD COLUMN evaluation_results JSONB;
  END IF;
END $$;

-- STEP 11: Create index on assessments.completed_at
-- ============================================
CREATE INDEX IF NOT EXISTS idx_assessments_completed_at ON public.assessments(completed_at);

-- STEP 12: Update existing assessments with completed_at if NULL
-- ============================================
UPDATE public.assessments
SET completed_at = created_at
WHERE completed_at IS NULL
  AND score IS NOT NULL;

-- STEP 13: Add comments for documentation
-- ============================================
COMMENT ON TABLE public.roadmaps IS 'Stores AI-generated personalized learning roadmaps based on assessment results';
COMMENT ON TABLE public.learning_path_steps IS 'Tracks user progress through roadmap topics';

COMMENT ON COLUMN public.assessments.completed_at IS 'Timestamp when the assessment was completed and submitted';
COMMENT ON COLUMN public.assessments.evaluation_results IS 'JSONB containing detailed evaluation results including wrong/skipped answers with explanations';
COMMENT ON COLUMN public.roadmaps.roadmap_data IS 'JSONB array containing 1-4 roadmaps with 8-12 topics each';
COMMENT ON COLUMN public.roadmaps.analysis_summary IS 'AI-generated summary analyzing user strengths and weaknesses';

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Verify tables were created
SELECT
  tablename,
  schemaname
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('roadmaps', 'learning_path_steps', 'assessments')
ORDER BY tablename;
