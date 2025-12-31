-- ============================================
-- PathWise Database Schema Documentation
-- ============================================
-- This file contains the complete current schema
-- DO NOT run this file directly - it's for documentation
-- Use migration files in database/migrations/ instead
-- ============================================

-- ============================================
-- Table: employee_skill_requests
-- Description: Stores skill upgrade requests from employees
-- ============================================

CREATE TABLE IF NOT EXISTS employee_skill_requests (
  -- Primary Key
  id BIGSERIAL PRIMARY KEY,

  -- User Reference
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Personal Information
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  company_name TEXT NOT NULL,

  -- Professional Background
  job_role TEXT NOT NULL,
  experience_years INTEGER DEFAULT 0,
  experience_months INTEGER DEFAULT 0,

  -- Skills Assessment (stored as JSON arrays)
  current_skills JSONB DEFAULT '[]'::jsonb,
  strong_skills JSONB DEFAULT '[]'::jsonb,
  weak_skills JSONB DEFAULT '[]'::jsonb,

  -- Learning Goals
  target_skill TEXT NOT NULL,
  learning_goal TEXT NOT NULL,

  -- Learning Preferences
  preferred_format TEXT CHECK (preferred_format IN ('Video', 'Reading', 'Projects', 'Mixed')),
  skill_level_improvement TEXT CHECK (skill_level_improvement IN ('Beginner → Intermediate', 'Intermediate → Advanced', 'Advanced → Expert')),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes for Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_employee_skill_requests_user_id
  ON employee_skill_requests(user_id);

CREATE INDEX IF NOT EXISTS idx_employee_skill_requests_created_at
  ON employee_skill_requests(created_at DESC);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS
ALTER TABLE employee_skill_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own requests
CREATE POLICY "Users can view their own skill requests"
  ON employee_skill_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own requests
CREATE POLICY "Users can create their own skill requests"
  ON employee_skill_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own requests
CREATE POLICY "Users can update their own skill requests"
  ON employee_skill_requests
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own requests
CREATE POLICY "Users can delete their own skill requests"
  ON employee_skill_requests
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Triggers
-- ============================================

-- Trigger: Auto-update updated_at timestamp
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

-- ============================================
-- Column Reference for Application Code
-- ============================================
/*
TypeScript Interface:

interface EmployeeSkillRequest {
  id: number
  user_id: string
  full_name: string
  email: string
  phone_number: string
  company_name: string
  job_role: string
  experience_years: number
  experience_months: number
  current_skills: string[]
  strong_skills: string[]
  weak_skills: string[]
  target_skill: string
  learning_goal: string
  preferred_format: 'Video' | 'Reading' | 'Projects' | 'Mixed'
  skill_level_improvement: 'Beginner → Intermediate' | 'Intermediate → Advanced' | 'Advanced → Expert'
  created_at: string
  updated_at: string
}

Note: The 'weekly_hours' column has been removed (Migration 003)
*/
