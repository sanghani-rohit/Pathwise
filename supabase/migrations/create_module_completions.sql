-- Create module_completions table
CREATE TABLE IF NOT EXISTS module_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  roadmap_id TEXT NOT NULL,
  module_number INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure a user can only complete a module once per roadmap
  UNIQUE(user_id, roadmap_id, module_number)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_module_completions_user_id ON module_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_module_completions_roadmap_id ON module_completions(roadmap_id);

-- Enable Row Level Security
ALTER TABLE module_completions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own module completions"
  ON module_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own module completions"
  ON module_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own module completions"
  ON module_completions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own module completions"
  ON module_completions FOR DELETE
  USING (auth.uid() = user_id);
