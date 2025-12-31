-- Drop existing table and all dependencies if exists
DROP TABLE IF EXISTS public.assessments CASCADE;

-- Create assessments table
CREATE TABLE public.assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_type TEXT NOT NULL,
  questions JSONB NOT NULL,
  answers JSONB,
  score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT assessment_type_check CHECK (assessment_type IN ('pre', 'post'))
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON public.assessments(user_id);

-- Create index on assessment_type
CREATE INDEX IF NOT EXISTS idx_assessments_type ON public.assessments(assessment_type);

-- Create composite index for user_id and assessment_type
CREATE INDEX IF NOT EXISTS idx_assessments_user_type ON public.assessments(user_id, assessment_type);

-- Enable Row Level Security (RLS)
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only view their own assessments
CREATE POLICY "Users can view own assessments"
  ON public.assessments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own assessments
CREATE POLICY "Users can insert own assessments"
  ON public.assessments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own assessments
CREATE POLICY "Users can update own assessments"
  ON public.assessments
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy: Users can delete their own assessments
CREATE POLICY "Users can delete own assessments"
  ON public.assessments
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function before update
CREATE TRIGGER update_assessments_updated_at
  BEFORE UPDATE ON public.assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
