-- Drop the old complex roadmaps table
DROP TABLE IF EXISTS roadmaps CASCADE;
DROP FUNCTION IF EXISTS get_latest_roadmap CASCADE;
DROP FUNCTION IF EXISTS get_roadmap_history CASCADE;
DROP FUNCTION IF EXISTS roadmap_exists_by_hash CASCADE;

-- Create simplified roadmaps table for new implementation
CREATE TABLE roadmaps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_role TEXT NOT NULL,
  target_skill TEXT NOT NULL,
  skill_level TEXT NOT NULL,
  total_modules INTEGER NOT NULL CHECK (total_modules >= 5 AND total_modules <= 10),
  roadmap_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_roadmaps_user_id ON roadmaps(user_id);
CREATE INDEX idx_roadmaps_created_at ON roadmaps(created_at DESC);
CREATE INDEX idx_roadmaps_user_created ON roadmaps(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own roadmaps"
  ON roadmaps FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own roadmaps"
  ON roadmaps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own roadmaps"
  ON roadmaps FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own roadmaps"
  ON roadmaps FOR DELETE
  USING (auth.uid() = user_id);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_roadmap_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER roadmaps_updated_at
  BEFORE UPDATE ON roadmaps
  FOR EACH ROW
  EXECUTE FUNCTION update_roadmap_updated_at();
