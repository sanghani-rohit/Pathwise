-- SQL Schema for PathWise Skill Upgrade Requests
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)

CREATE TABLE IF NOT EXISTS employee_skill_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  company_name TEXT NOT NULL,
  job_role TEXT NOT NULL,
  experience_years INTEGER,
  experience_months INTEGER,
  current_skills TEXT[] NOT NULL,
  strong_skills TEXT[] NOT NULL,
  weak_skills TEXT[] NOT NULL,
  target_skill TEXT NOT NULL,
  learning_goal TEXT NOT NULL,
  preferred_format TEXT NOT NULL CHECK (preferred_format IN ('Video', 'Reading', 'Projects', 'Mixed')),
  weekly_hours INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_skill_requests_user_id ON employee_skill_requests(user_id);

-- Create an index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_skill_requests_created_at ON employee_skill_requests(created_at DESC);

-- Enable Row Level Security
ALTER TABLE employee_skill_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own requests
CREATE POLICY "Users can view own requests" ON employee_skill_requests
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own requests
CREATE POLICY "Users can insert own requests" ON employee_skill_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own requests
CREATE POLICY "Users can update own requests" ON employee_skill_requests
  FOR UPDATE USING (auth.uid() = user_id);

-- Add a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_employee_skill_requests_updated_at
  BEFORE UPDATE ON employee_skill_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
