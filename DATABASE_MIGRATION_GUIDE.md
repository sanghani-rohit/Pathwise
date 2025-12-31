# Database Migration Guide: user_profile & user_skills Tables

## Overview
This migration creates two new properly structured tables (`user_profile` and `user_skills`) to replace the less organized existing tables. The existing tables will remain unchanged.

## New Tables

### 1. `user_profile`
Stores basic user information:
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → auth.users)
- `full_name` (TEXT, NOT NULL)
- `email` (TEXT, NOT NULL)
- `phone_number` (TEXT, nullable)
- `company_name` (TEXT, nullable)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### 2. `user_skills`
Stores skill-related information:
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → auth.users)
- `current_role` (TEXT, NOT NULL)
- `years_of_experience` (INTEGER, 0-50)
- `months_of_experience` (INTEGER, 0-11)
- `current_skills` (TEXT[], array)
- `strong_skills` (TEXT[], array)
- `skills_to_improve` (TEXT[], array)
- `learning_goals` (TEXT, nullable)
- `skill_level` (TEXT, CHECK constraint for valid values)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

## Migration Steps

### Step 1: Run the SQL Migration

#### Option A: Using Supabase Dashboard (Recommended)

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the contents of `database/migrations/009_create_user_profile_and_skills.sql`
5. Paste into the SQL editor
6. Click **Run** (or press Ctrl+Enter)
7. Verify success message: "Migration completed successfully!"

#### Option B: Using Supabase CLI

```bash
# Make sure you're logged in to Supabase CLI
supabase login

# Link your project (if not already linked)
supabase link --project-ref your-project-ref

# Run the migration
supabase db push

# Or manually apply the SQL file
psql postgresql://[connection-string] -f database/migrations/009_create_user_profile_and_skills.sql
```

### Step 2: Verify Tables Were Created

Run this query in Supabase SQL Editor to verify:

```sql
-- Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('user_profile', 'user_skills');

-- Verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('user_profile', 'user_skills');

-- Check indexes
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('user_profile', 'user_skills');
```

### Step 3: Test the New Tables

```sql
-- Test insert (replace 'your-user-id' with actual UUID from auth.users)
INSERT INTO user_profile (user_id, full_name, email)
VALUES ('your-user-id', 'Test User', 'test@example.com')
RETURNING *;

INSERT INTO user_skills (
  user_id,
  current_role,
  years_of_experience,
  months_of_experience,
  current_skills,
  skill_level
)
VALUES (
  'your-user-id',
  'Software Engineer',
  3,
  6,
  ARRAY['JavaScript', 'React', 'Node.js'],
  'intermediate'
)
RETURNING *;

-- Test retrieval
SELECT * FROM user_profile WHERE user_id = 'your-user-id';
SELECT * FROM user_skills WHERE user_id = 'your-user-id';

-- Clean up test data
DELETE FROM user_profile WHERE user_id = 'your-user-id';
DELETE FROM user_skills WHERE user_id = 'your-user-id';
```

## Using the New Tables in Code

### 1. Import Types and Services

```typescript
import { OnboardingFormData } from '@/lib/types/database'
import {
  createCompleteUserProfile,
  getCompleteUserProfile,
  updateCompleteUserProfile
} from '@/lib/userProfileService'
```

### 2. Save Onboarding Data (Client-Side)

```typescript
// Example: After user fills onboarding form
const formData: OnboardingFormData = {
  full_name: 'John Doe',
  email: 'john@example.com',
  phone_number: '+1234567890',
  company_name: 'Acme Corp',
  current_role: 'Software Engineer',
  years_of_experience: 3,
  months_of_experience: 6,
  current_skills: ['JavaScript', 'React', 'Node.js'],
  strong_skills: ['React', 'TypeScript'],
  skills_to_improve: ['System Design', 'AWS'],
  learning_goals: 'Master cloud architecture',
  skill_level: 'intermediate'
}

// Get auth token
const { data: { session } } = await supabase.auth.getSession()

// Call API endpoint
const response = await fetch('/api/save-onboarding', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`
  },
  body: JSON.stringify(formData)
})

const result = await response.json()

if (result.success) {
  console.log('Profile created:', result.profile)
  console.log('Skills created:', result.skills)
  // Redirect to dashboard
  router.push('/personal-dashboard')
}
```

### 3. Retrieve User Profile

```typescript
// Client-side
const { data: { session } } = await supabase.auth.getSession()

const response = await fetch('/api/save-onboarding', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${session.access_token}`
  }
})

const { profile, skills, hasCompletedOnboarding } = await response.json()
```

### 4. Update User Profile

```typescript
// Partial update
const updates = {
  full_name: 'Jane Doe',
  skills_to_improve: ['Kubernetes', 'Docker', 'CI/CD']
}

const response = await fetch('/api/save-onboarding', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`
  },
  body: JSON.stringify(updates)
})
```

## API Endpoints

### POST /api/save-onboarding
**Create or update user profile and skills**

**Request:**
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone_number": "+1234567890",
  "company_name": "Acme Corp",
  "current_role": "Software Engineer",
  "years_of_experience": 3,
  "months_of_experience": 6,
  "current_skills": ["JavaScript", "React"],
  "strong_skills": ["React"],
  "skills_to_improve": ["AWS"],
  "learning_goals": "Master cloud",
  "skill_level": "intermediate"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile created successfully",
  "profile": {
    "id": "uuid",
    "user_id": "uuid",
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone_number": "+1234567890",
    "company_name": "Acme Corp",
    "created_at": "2025-12-15T...",
    "updated_at": "2025-12-15T..."
  },
  "skills": {
    "id": "uuid",
    "user_id": "uuid",
    "current_role": "Software Engineer",
    "years_of_experience": 3,
    "months_of_experience": 6,
    "current_skills": ["JavaScript", "React"],
    "strong_skills": ["React"],
    "skills_to_improve": ["AWS"],
    "learning_goals": "Master cloud",
    "skill_level": "intermediate",
    "created_at": "2025-12-15T...",
    "updated_at": "2025-12-15T..."
  }
}
```

### GET /api/save-onboarding
**Retrieve user profile and skills**

**Response:**
```json
{
  "success": true,
  "profile": { /* UserProfile object */ },
  "skills": { /* UserSkills object */ },
  "hasCompletedOnboarding": true
}
```

## Data Migration from Old Tables (Optional)

If you want to migrate data from `user_profiles` and `skill_requests` to the new tables:

```sql
-- Migrate user_profiles → user_profile
INSERT INTO user_profile (user_id, full_name, email, phone_number, company_name)
SELECT
  user_id,
  COALESCE(full_name, name, 'Unknown') as full_name,
  COALESCE(email, user_id || '@temp.com') as email,
  phone as phone_number,
  company as company_name
FROM user_profiles
ON CONFLICT (user_id) DO NOTHING;

-- Migrate skill_requests → user_skills
INSERT INTO user_skills (
  user_id,
  current_role,
  years_of_experience,
  months_of_experience,
  current_skills,
  strong_skills,
  skills_to_improve,
  learning_goals,
  skill_level
)
SELECT
  sr.user_id,
  COALESCE(up.current_role, 'Not Specified') as current_role,
  COALESCE(up.experience_years, 0) as years_of_experience,
  COALESCE(up.experience_months, 0) as months_of_experience,
  COALESCE(sr.current_skills, '{}') as current_skills,
  '{}' as strong_skills, -- Extract from current_skills if needed
  COALESCE(sr.weak_skills, '{}') as skills_to_improve,
  sr.target_skill as learning_goals,
  CASE
    WHEN COALESCE(up.experience_years, 0) + COALESCE(up.experience_months, 0)/12.0 < 1 THEN 'beginner'
    WHEN COALESCE(up.experience_years, 0) + COALESCE(up.experience_months, 0)/12.0 < 3 THEN 'intermediate'
    ELSE 'advanced'
  END as skill_level
FROM skill_requests sr
LEFT JOIN user_profiles up ON sr.user_id = up.user_id
ON CONFLICT (user_id) DO NOTHING;
```

## Security Features

✅ **Row Level Security (RLS)** enabled on both tables
✅ **Policies configured:** Users can only access their own data
✅ **Email validation:** CHECK constraint for valid email format
✅ **Phone validation:** Optional but validated if provided
✅ **Experience validation:** Years (0-50), Months (0-11)
✅ **Skill level validation:** Enum constraint for valid values
✅ **At least one skill required:** Check constraint ensures data quality

## Performance Optimizations

✅ **Indexes created** on frequently queried columns:
- `user_id` (both tables)
- `email` (user_profile)
- `skill_level` (user_skills)
- GIN indexes on skill arrays for fast array operations

✅ **Auto-updating timestamps:** Triggers update `updated_at` automatically

## Helper Functions

### Get Complete Profile
```sql
SELECT * FROM get_complete_user_profile('user-id-here');
```

Returns combined profile and skills as JSON.

## Rollback (If Needed)

If you need to rollback this migration:

```sql
-- Drop tables (this will delete all data!)
DROP TABLE IF EXISTS public.user_skills CASCADE;
DROP TABLE IF EXISTS public.user_profile CASCADE;

-- Drop helper function
DROP FUNCTION IF EXISTS public.get_complete_user_profile(UUID);

-- Drop trigger function
DROP FUNCTION IF EXISTS public.update_updated_at_column();
```

⚠️ **Warning:** This will permanently delete all data in these tables!

## Troubleshooting

### Problem: Migration fails with "permission denied"
**Solution:** Ensure you're running the migration with database owner privileges or use the Supabase Dashboard.

### Problem: RLS policies block inserts
**Solution:** Make sure the `user_id` in your insert matches `auth.uid()` (the authenticated user).

### Problem: Email validation fails
**Solution:** Ensure email follows standard format: `name@domain.com`

### Problem: Array insert fails
**Solution:** Use PostgreSQL array syntax: `ARRAY['item1', 'item2']` or `'{"item1", "item2"}'`

## Next Steps

1. ✅ Run the migration
2. ✅ Verify tables are created
3. ✅ Test with sample data
4. Update your onboarding form to use `/api/save-onboarding`
5. Migrate existing data (optional)
6. Gradually transition from old tables to new tables

## Support

For issues or questions:
- Check Supabase logs in Dashboard → Database → Logs
- Review RLS policies if queries fail
- Use correlation IDs in API logs for debugging
- Check `created_at` and `updated_at` for data freshness

---

**Migration File:** `database/migrations/009_create_user_profile_and_skills.sql`
**Created:** 2025-12-15
**Status:** Ready for deployment ✅
