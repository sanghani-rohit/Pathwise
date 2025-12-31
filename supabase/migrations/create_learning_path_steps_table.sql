-- Create learning_path_steps table to track user progress through roadmap topics
CREATE TABLE IF NOT EXISTS learning_path_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  roadmap_id UUID NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,

  -- Topic details
  topic_id TEXT NOT NULL,
  topic_title TEXT NOT NULL,
  skill TEXT DEFAULT '',

  -- Progress tracking
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent_minutes INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure unique combination of user, roadmap, and topic
  CONSTRAINT unique_user_roadmap_topic UNIQUE (user_id, roadmap_id, topic_id)
);

-- Create index on user_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_learning_path_steps_user_id ON learning_path_steps(user_id);

-- Create index on roadmap_id
CREATE INDEX IF NOT EXISTS idx_learning_path_steps_roadmap_id ON learning_path_steps(roadmap_id);

-- Create index on completed status
CREATE INDEX IF NOT EXISTS idx_learning_path_steps_completed ON learning_path_steps(completed);

-- Create composite index for user + roadmap queries
CREATE INDEX IF NOT EXISTS idx_learning_path_steps_user_roadmap ON learning_path_steps(user_id, roadmap_id);

-- Enable Row Level Security
ALTER TABLE learning_path_steps ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own progress
CREATE POLICY "Users can view their own progress"
ON learning_path_steps
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own progress
CREATE POLICY "Users can insert their own progress"
ON learning_path_steps
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own progress
CREATE POLICY "Users can update their own progress"
ON learning_path_steps
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own progress
CREATE POLICY "Users can delete their own progress"
ON learning_path_steps
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Add comment to table
COMMENT ON TABLE learning_path_steps IS 'Tracks user progress through roadmap topics - which topics have been completed';

-- Add comments to columns
COMMENT ON COLUMN learning_path_steps.topic_id IS 'Unique identifier for the topic within the roadmap';
COMMENT ON COLUMN learning_path_steps.time_spent_minutes IS 'Time spent on this topic in minutes';
COMMENT ON COLUMN learning_path_steps.completed_at IS 'Timestamp when the user marked this topic as complete';
