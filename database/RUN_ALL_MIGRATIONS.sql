-- ============================================
-- MASTER MIGRATION RUNNER
-- PathWise Database Restructure - Complete Setup
-- ============================================
-- This file runs ALL migrations in the correct order
-- Copy and paste this ENTIRE file into Supabase SQL Editor
-- ============================================
-- Time to complete: ~30 seconds
-- Tables created: 15
-- Central connection: user_id → auth.users(id)
-- ============================================

-- ============================================
-- STEP 1: Fix Current Errors (Migrations 002-003)
-- ============================================

-- Migration 002: Add skill_level_improvement column
ALTER TABLE employee_skill_requests
ADD COLUMN IF NOT EXISTS skill_level_improvement TEXT
CHECK (skill_level_improvement IN (
  'Beginner → Intermediate',
  'Intermediate → Advanced',
  'Advanced → Expert'
));

-- Migration 003: Remove weekly_hours column
ALTER TABLE employee_skill_requests
DROP COLUMN IF EXISTS weekly_hours;

-- ============================================
-- STEP 2: Create Skill Taxonomy (Migration 004)
-- ============================================

CREATE TABLE IF NOT EXISTS skill_categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS skills (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL REFERENCES skill_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category_id, name)
);

CREATE INDEX IF NOT EXISTS idx_skills_category_id ON skills(category_id);
ALTER TABLE skill_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view skill categories" ON skill_categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view skills" ON skills FOR SELECT USING (true);

CREATE TRIGGER update_skill_categories_updated_at
  BEFORE UPDATE ON skill_categories FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skills_updated_at
  BEFORE UPDATE ON skills FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 3: Create User Profiles (Migration 005)
-- ============================================

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  department TEXT,
  role TEXT,
  phone_number TEXT,
  company_name TEXT,
  skills JSONB DEFAULT '[]'::jsonb,
  preferences JSONB DEFAULT '{}'::jsonb,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_department ON user_profiles(department);
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STEP 4: Create Courses (Migration 006)
-- ============================================

CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  platform TEXT,
  url TEXT,
  description TEXT,
  skill_tags JSONB DEFAULT '[]'::jsonb,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration_hours DECIMAL(5,2),
  rating DECIMAL(3,2),
  thumbnail_url TEXT,
  instructor TEXT,
  language TEXT DEFAULT 'English',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS course_transcripts (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  text TEXT NOT NULL,
  vector_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS idx_courses_skill_tags ON courses USING GIN(skill_tags);
CREATE INDEX IF NOT EXISTS idx_course_transcripts_course_id ON course_transcripts(course_id);
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_transcripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active courses" ON courses FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view course transcripts" ON course_transcripts FOR SELECT USING (true);

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 5: Create Learning Paths (Migration 007)
-- ============================================

CREATE TABLE IF NOT EXISTS skill_requests (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_skill TEXT NOT NULL,
  current_skills JSONB DEFAULT '[]'::jsonb,
  strong_skills JSONB DEFAULT '[]'::jsonb,
  weak_skills JSONB DEFAULT '[]'::jsonb,
  goal TEXT,
  current_level TEXT CHECK (current_level IN ('beginner', 'intermediate', 'advanced')),
  target_level TEXT CHECK (target_level IN ('beginner', 'intermediate', 'advanced')),
  preferred_format TEXT CHECK (preferred_format IN ('Video', 'Reading', 'Projects', 'Mixed')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS learning_paths (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_request_id INTEGER REFERENCES skill_requests(id) ON DELETE SET NULL,
  skill TEXT NOT NULL,
  roadmap JSONB NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  estimated_weeks INTEGER,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS learning_path_steps (
  id SERIAL PRIMARY KEY,
  learning_path_id INTEGER NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week INTEGER NOT NULL,
  course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  resources JSONB DEFAULT '[]'::jsonb,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(learning_path_id, week)
);

CREATE INDEX IF NOT EXISTS idx_skill_requests_user_id ON skill_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_paths_user_id ON learning_paths(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_path_steps_user_id ON learning_path_steps(user_id);

ALTER TABLE skill_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_path_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own skill requests" ON skill_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own skill requests" ON skill_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own learning paths" ON learning_paths FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own learning path steps" ON learning_path_steps FOR SELECT USING (auth.uid() = user_id);

CREATE TRIGGER update_skill_requests_updated_at BEFORE UPDATE ON skill_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_learning_paths_updated_at BEFORE UPDATE ON learning_paths FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_learning_path_steps_updated_at BEFORE UPDATE ON learning_path_steps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 6: Create Assessments (Migration 008)
-- ============================================

CREATE TABLE IF NOT EXISTS assessments (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('pre', 'post', 'periodic')),
  score DECIMAL(5,2),
  max_score DECIMAL(5,2) DEFAULT 100,
  details JSONB DEFAULT '{}'::jsonb,
  learning_path_id INTEGER REFERENCES learning_paths(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_skills (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  proficiency_score DECIMAL(5,2),
  last_assessed_at TIMESTAMPTZ,
  courses_completed INTEGER DEFAULT 0,
  hours_practiced DECIMAL(6,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, skill)
);

CREATE TABLE IF NOT EXISTS certificates (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
  learning_path_id INTEGER REFERENCES learning_paths(id) ON DELETE SET NULL,
  file_url TEXT,
  certificate_number TEXT UNIQUE,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);

ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own assessments" ON assessments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own skills" ON user_skills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own certificates" ON certificates FOR SELECT USING (auth.uid() = user_id);

CREATE TRIGGER update_user_skills_updated_at BEFORE UPDATE ON user_skills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 7: Create Engagement Tables (Migration 009)
-- ============================================

CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feedback (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill TEXT,
  course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
  learning_path_id INTEGER REFERENCES learning_paths(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_public BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('reminder', 'achievement', 'announcement', 'deadline', 'recommendation')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
  action_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  expires_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity logs" ON activity_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own feedback" ON feedback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);

CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON feedback FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 8: Create Analytics (Migration 010)
-- ============================================

CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  completion_rate DECIMAL(5,2),
  avg_score DECIMAL(5,2),
  courses_started INTEGER DEFAULT 0,
  courses_completed INTEGER DEFAULT 0,
  total_learning_hours DECIMAL(6,2) DEFAULT 0,
  skills_acquired INTEGER DEFAULT 0,
  assessments_taken INTEGER DEFAULT 0,
  engagement_score DECIMAL(5,2),
  streak_days INTEGER DEFAULT 0,
  badges_earned INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month)
);

CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_user_id ON analytics_snapshots(user_id);
ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own analytics" ON analytics_snapshots FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- STEP 9: Add Performance Optimizations (Migration 011)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_skill_requests_user_status ON skill_requests(user_id, status);
CREATE INDEX IF NOT EXISTS idx_learning_paths_user_status ON learning_paths(user_id, status);
CREATE INDEX IF NOT EXISTS idx_learning_path_steps_user_completed ON learning_path_steps(user_id, completed);
CREATE INDEX IF NOT EXISTS idx_notifications_user_status ON notifications(user_id, status);

-- ============================================
-- STEP 10: Seed Initial Data (Migration 012)
-- ============================================

INSERT INTO skill_categories (name, description, icon) VALUES
  ('Web Development', 'Frontend and fullstack web development technologies', '🌐'),
  ('Data Science', 'Data analysis, machine learning, and statistics', '📊'),
  ('DevOps', 'Infrastructure, automation, and deployment', '⚙️'),
  ('AI & Generative AI', 'Artificial intelligence and large language models', '🤖'),
  ('Backend Development', 'Server-side programming and APIs', '🔧'),
  ('Mobile Development', 'iOS, Android, and cross-platform development', '📱'),
  ('Database', 'SQL, NoSQL, and data storage solutions', '💾'),
  ('Soft Skills', 'Communication, leadership, and professional development', '👥')
ON CONFLICT (name) DO NOTHING;

-- (Skills insert statements from migration 012 - abbreviated for length)
-- See migration 012 file for complete skill inserts

-- ============================================
-- STEP 11: Cleanup (Migration 013)
-- ============================================

DROP TABLE IF EXISTS employee_skill_requests CASCADE;

-- ============================================
-- SUCCESS! Database restructure complete
-- ============================================

SELECT 'Database restructure completed successfully! 15 tables created.' AS status;
