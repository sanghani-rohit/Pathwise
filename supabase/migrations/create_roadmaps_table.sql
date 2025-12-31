-- Create roadmaps table to store AI-generated learning roadmaps
CREATE TABLE IF NOT EXISTS roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES assessments(id) ON DELETE SET NULL,

  -- Target skill for this roadmap
  target_skill TEXT NOT NULL,

  -- AI analysis
  analysis_summary TEXT NOT NULL,
  strengths TEXT[] DEFAULT '{}',
  weaknesses TEXT[] DEFAULT '{}',
  recommended_order TEXT[] DEFAULT '{}',

  -- Roadmap data (JSONB array of roadmaps)
  roadmap_data JSONB NOT NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Indexes for fast queries
  CONSTRAINT valid_roadmap_data CHECK (jsonb_typeof(roadmap_data) = 'array')
);

-- Create index on user_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id ON roadmaps(user_id);

-- Create index on assessment_id
CREATE INDEX IF NOT EXISTS idx_roadmaps_assessment_id ON roadmaps(assessment_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_roadmaps_created_at ON roadmaps(created_at DESC);

-- Enable Row Level Security
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own roadmaps
CREATE POLICY "Users can view their own roadmaps"
ON roadmaps
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own roadmaps
CREATE POLICY "Users can insert their own roadmaps"
ON roadmaps
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own roadmaps
CREATE POLICY "Users can update their own roadmaps"
ON roadmaps
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own roadmaps
CREATE POLICY "Users can delete their own roadmaps"
ON roadmaps
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Add comment to table
COMMENT ON TABLE roadmaps IS 'Stores AI-generated personalized learning roadmaps for users based on their assessment results';

-- Add comments to columns
COMMENT ON COLUMN roadmaps.roadmap_data IS 'JSONB array containing roadmap objects with topics, difficulty, and learning paths';
COMMENT ON COLUMN roadmaps.analysis_summary IS 'AI-generated summary analyzing user strengths and weaknesses';
COMMENT ON COLUMN roadmaps.recommended_order IS 'Ordered list of skills/roadmaps to complete in sequence';
