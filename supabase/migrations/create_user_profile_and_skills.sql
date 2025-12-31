-- Create user_profile table
CREATE TABLE IF NOT EXISTS user_profile (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT,
  company_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_skills table
CREATE TABLE IF NOT EXISTS user_skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  job_role TEXT NOT NULL,
  years_of_experience INTEGER DEFAULT 0,
  months_of_experience INTEGER DEFAULT 0,
  current_skills TEXT[] DEFAULT '{}',
  strong_skills TEXT[] DEFAULT '{}',
  skills_to_improve TEXT[] DEFAULT '{}',
  learning_goals TEXT,
  skill_level TEXT NOT NULL CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'beginner-to-intermediate', 'intermediate-to-advanced')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profile_user_id ON user_profile(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);

-- Enable Row Level Security
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profile
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profile;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profile;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profile;
DROP POLICY IF EXISTS "Users can delete their own profile" ON user_profile;

CREATE POLICY "Users can view their own profile"
  ON user_profile FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON user_profile FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON user_profile FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile"
  ON user_profile FOR DELETE
  USING (auth.uid() = user_id);

-- Create RLS policies for user_skills
DROP POLICY IF EXISTS "Users can view their own skills" ON user_skills;
DROP POLICY IF EXISTS "Users can insert their own skills" ON user_skills;
DROP POLICY IF EXISTS "Users can update their own skills" ON user_skills;
DROP POLICY IF EXISTS "Users can delete their own skills" ON user_skills;

CREATE POLICY "Users can view their own skills"
  ON user_skills FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own skills"
  ON user_skills FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skills"
  ON user_skills FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own skills"
  ON user_skills FOR DELETE
  USING (auth.uid() = user_id);
