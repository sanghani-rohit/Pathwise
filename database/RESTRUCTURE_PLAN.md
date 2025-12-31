# 🏗️ Database Restructure Plan

## Overview
Transform from a simple skill request system to a comprehensive Learning Management System (LMS) with 15 tables.

## 📊 Current State
**Existing Table:**
- `employee_skill_requests` (18 columns) - Simple skill request form

## 🎯 Proposed New Structure
**15 Tables** organized into logical domains:

### 1. Identity & Access (2 tables)
- **users** - Core user profiles with skills and preferences
- **user_skills** - Persistent skill level tracking

### 2. Skill Taxonomy (2 tables)
- **skill_categories** - Domain grouping (Web Dev, Data Science, etc.)
- **skills** - Individual skills with category relationships

### 3. Course Management (2 tables)
- **courses** - Course catalog with metadata
- **course_transcripts** - RAG-enabled course content search

### 4. Learning Paths (3 tables)
- **skill_requests** - User-initiated learning requests
- **learning_paths** - AI-generated roadmaps
- **learning_path_steps** - Week-by-week course breakdown

### 5. Assessment & Progress (2 tables)
- **assessments** - Pre/post skill evaluations
- **certificates** - Completion certificates

### 6. Engagement & Analytics (4 tables)
- **activity_logs** - User event tracking
- **feedback** - Course/skill ratings
- **notifications** - Alerts and reminders
- **analytics_snapshots** - Monthly aggregated metrics

## ⚠️ Critical Questions Before Proceeding

### 1. Existing Data
**Question:** Do you have existing data in `employee_skill_requests` that needs to be preserved?

- ✅ **Yes** → I'll create a data migration script to map old data to new structure
- ✅ **No** → We can do a clean slate migration

### 2. Migration Strategy
**Option A: Clean Slate (Recommended for Development)**
- Drop old table
- Create all new tables fresh
- Start with empty database
- Fastest and cleanest

**Option B: Data Preservation**
- Keep old table temporarily
- Migrate data to new structure
- Verify migration
- Drop old table
- More complex but preserves history

**Which option do you prefer?** ___________

### 3. Supabase Auth Integration
**Question:** Do you want to use Supabase's built-in `auth.users` table or create a custom `users` table?

- ✅ **Use auth.users** → Users table references `auth.users(id)`
- ✅ **Custom users table** → Full control, separate from auth

**Recommendation:** Use `auth.users` and extend with a `user_profiles` table

### 4. Rollout Approach
**Question:** How should we roll this out?

- ✅ **All at once** → Run all migrations in one session
- ✅ **Incremental** → Add tables gradually, test each step
- ✅ **Development first** → Test in dev environment before production

## 📋 Migration Sequence

If approved, migrations will be created in this order:

```
004_create_skill_taxonomy.sql          (skill_categories, skills)
005_create_user_profiles.sql           (extend auth.users)
006_create_courses.sql                 (courses, course_transcripts)
007_create_learning_paths.sql          (skill_requests, learning_paths, learning_path_steps)
008_create_assessments.sql             (assessments, user_skills)
009_create_engagement.sql              (activity_logs, feedback, notifications)
010_create_analytics.sql               (analytics_snapshots, certificates)
011_add_indexes_and_constraints.sql    (Performance optimization)
012_seed_initial_data.sql              (Sample categories and skills)
013_migrate_old_data.sql               (If preserving data)
```

## 🔄 Impact on Application Code

### Files That Will Need Updates:
1. **app/upgrade-skill/page.tsx** - Form submission logic
2. **components/SkillUpgradeModal.tsx** - If still used
3. **New files needed:**
   - API routes for new tables
   - TypeScript interfaces for all tables
   - Helper functions for skill taxonomy
   - Course recommendation logic
   - Learning path generation

### Estimated Development Time:
- Database migrations: 1-2 hours
- API routes: 3-4 hours
- Frontend updates: 4-6 hours
- Testing: 2-3 hours
**Total: ~2 days of development**

## 📝 Sample Schema Preview

### users (extends auth.users)
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  department TEXT,
  role TEXT,
  skills JSONB DEFAULT '[]',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### skill_categories
```sql
CREATE TABLE skill_categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### skills
```sql
CREATE TABLE skills (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES skill_categories(id),
  name TEXT NOT NULL,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## ✅ Approval Checklist

Before I proceed, please confirm:

- [ ] I understand this is a major database restructure
- [ ] I've decided on migration strategy (Clean Slate / Data Preservation)
- [ ] I've decided on user table approach (auth.users / custom)
- [ ] I've decided on rollout approach (All at once / Incremental)
- [ ] I'm ready to update application code after migration
- [ ] I have a backup of current database (if production)

## 🚀 Next Steps

1. **You confirm the approach above**
2. **I create all migration files** (004-013)
3. **You review the migrations**
4. **I create a master migration runner script**
5. **You run migrations in Supabase SQL Editor**
6. **I help update application code**
7. **We test the new structure**

---

**Ready to proceed?** Please answer the questions above and I'll create the comprehensive migration files.
