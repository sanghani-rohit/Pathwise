-- ============================================
-- Schema Validation Query
-- ============================================
-- Run this query in Supabase SQL Editor to check if all
-- required columns exist in your database
-- ============================================

-- Check employee_skill_requests table structure
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default,
  CASE
    WHEN column_name = 'id' THEN '✓ Primary Key'
    WHEN column_name = 'user_id' THEN '✓ Foreign Key to auth.users'
    WHEN column_name IN ('full_name', 'email', 'phone_number', 'company_name', 'job_role', 'target_skill', 'learning_goal') THEN '✓ Required Text Field'
    WHEN column_name IN ('experience_years', 'experience_months') THEN '✓ Experience Field'
    WHEN column_name IN ('current_skills', 'strong_skills', 'weak_skills') THEN '✓ Skills Array (JSONB)'
    WHEN column_name IN ('preferred_format', 'skill_level_improvement') THEN '✓ Learning Preference'
    WHEN column_name IN ('created_at', 'updated_at') THEN '✓ Timestamp'
    ELSE '⚠ Unknown Column'
  END AS description
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'employee_skill_requests'
ORDER BY ordinal_position;

-- ============================================
-- Expected Columns Checklist
-- ============================================
/*
The following columns should exist:

✓ id (bigint)
✓ user_id (uuid)
✓ full_name (text)
✓ email (text)
✓ phone_number (text)
✓ company_name (text)
✓ job_role (text)
✓ experience_years (integer)
✓ experience_months (integer)
✓ current_skills (jsonb)
✓ strong_skills (jsonb)
✓ weak_skills (jsonb)
✓ target_skill (text)
✓ learning_goal (text)
✓ preferred_format (text)
✓ skill_level_improvement (text)  ← IMPORTANT: This column is required!
✓ created_at (timestamp with time zone)
✓ updated_at (timestamp with time zone)

Total: 18 columns
*/

-- ============================================
-- Quick Check: Does skill_level_improvement exist?
-- ============================================

SELECT
  CASE
    WHEN EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'employee_skill_requests'
        AND column_name = 'skill_level_improvement'
    )
    THEN '✓ Column exists - You are good to go!'
    ELSE '✗ Column missing - Run migration 002_add_skill_level_improvement.sql'
  END AS status;
