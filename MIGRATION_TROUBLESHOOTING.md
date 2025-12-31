# Migration Troubleshooting Guide

## Error: "syntax error at or near current_role"

This error typically occurs due to:
1. UUID extension not being enabled
2. Conflicting table names
3. Reserved word conflicts
4. SQL parser issues in Supabase Dashboard

## Solution: Use the Fixed Migration

I've created **3 versions** of the migration for you:

### ✅ Option 1: Use the Fixed Version (RECOMMENDED)
**File:** `database/migrations/009_create_user_profile_and_skills_fixed.sql`

This version:
- Uses `uuid_generate_v4()` instead of `gen_random_uuid()`
- Enables UUID extension explicitly
- Uses named constraints
- Separates foreign key constraints
- Better error handling

**Steps:**
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `009_create_user_profile_and_skills_fixed.sql`
3. Paste and click **Run**
4. Check for success message: "✅ Migration completed successfully!"

---

### ✅ Option 2: Use the Minimal Version (EASIER)
**File:** `database/migrations/009_minimal_version.sql`

This is a simplified version with:
- Minimal syntax
- Step-by-step execution
- Easier to debug

**Steps:**
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `009_minimal_version.sql`
3. Paste and click **Run**
4. Look for: "Migration completed successfully!"

---

### ✅ Option 3: Run Step-by-Step (SAFEST)

Copy and run each section separately in Supabase SQL Editor:

#### Step 1: Enable UUID Extension
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

#### Step 2: Create user_profile Table
```sql
CREATE TABLE public.user_profile (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_number TEXT,
    company_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Step 3: Create user_skills Table
```sql
CREATE TABLE public.user_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    current_role TEXT NOT NULL,
    years_of_experience INTEGER DEFAULT 0,
    months_of_experience INTEGER DEFAULT 0,
    current_skills TEXT[] DEFAULT '{}',
    strong_skills TEXT[] DEFAULT '{}',
    skills_to_improve TEXT[] DEFAULT '{}',
    learning_goals TEXT,
    skill_level TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Step 4: Add Foreign Keys
```sql
ALTER TABLE public.user_profile
ADD CONSTRAINT fk_user_profile_user_id
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_skills
ADD CONSTRAINT fk_user_skills_user_id
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
```

#### Step 5: Enable RLS
```sql
ALTER TABLE public.user_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
```

#### Step 6: Create RLS Policies
```sql
-- user_profile policies
CREATE POLICY "Users can view own profile" ON public.user_profile
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profile
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profile
    FOR UPDATE USING (auth.uid() = user_id);

-- user_skills policies
CREATE POLICY "Users can view own skills" ON public.user_skills
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own skills" ON public.user_skills
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own skills" ON public.user_skills
    FOR UPDATE USING (auth.uid() = user_id);
```

#### Step 7: Grant Permissions
```sql
GRANT ALL ON public.user_profile TO authenticated;
GRANT ALL ON public.user_skills TO authenticated;
```

---

## Verify Tables Were Created

After running the migration, verify with this query:

```sql
-- Check if tables exist
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('user_profile', 'user_skills');

-- Check columns
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('user_profile', 'user_skills')
ORDER BY table_name, ordinal_position;

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('user_profile', 'user_skills');
```

**Expected Output:**
```
table_name    | table_type
--------------|-----------
user_profile  | BASE TABLE
user_skills   | BASE TABLE
```

---

## If Tables Already Exist

If you get an error saying the tables already exist, you have two options:

### Option A: Drop and Recreate (⚠️ DELETES DATA!)
```sql
DROP TABLE IF EXISTS public.user_skills CASCADE;
DROP TABLE IF EXISTS public.user_profile CASCADE;

-- Then run the migration again
```

### Option B: Check What Exists
```sql
-- See what's in the tables
SELECT * FROM public.user_profile LIMIT 5;
SELECT * FROM public.user_skills LIMIT 5;

-- If they look correct, you're done! No need to run migration again.
```

---

## Common Issues

### Issue: "relation auth.users does not exist"
**Solution:** Supabase should have this by default. Try:
```sql
SELECT * FROM auth.users LIMIT 1;
```
If this fails, contact Supabase support.

### Issue: "extension uuid-ossp does not exist"
**Solution:** Enable it manually:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Issue: "permission denied"
**Solution:** Make sure you're using the Supabase Dashboard (which has owner privileges), not a client connection.

### Issue: Policy already exists
**Solution:** The tables might already be created. Check with:
```sql
\d user_profile
\d user_skills
```

---

## Test the Tables

After successful migration, test with:

```sql
-- Insert test profile (replace with your user_id from auth.users)
INSERT INTO user_profile (user_id, full_name, email)
VALUES (
    (SELECT id FROM auth.users LIMIT 1),
    'Test User',
    'test@example.com'
)
RETURNING *;

-- Insert test skills
INSERT INTO user_skills (
    user_id,
    current_role,
    years_of_experience,
    months_of_experience,
    current_skills,
    skill_level
)
VALUES (
    (SELECT id FROM auth.users LIMIT 1),
    'Developer',
    2,
    6,
    ARRAY['JavaScript', 'React'],
    'intermediate'
)
RETURNING *;

-- Clean up test data
DELETE FROM user_profile WHERE email = 'test@example.com';
```

---

## Next Steps After Successful Migration

1. ✅ Tables created successfully
2. Test the API endpoint: `/api/save-onboarding`
3. Update your onboarding form to use the new endpoint
4. Gradually migrate data from old tables (optional)

---

## Need More Help?

**Check Supabase Logs:**
- Dashboard → Database → Logs
- Look for detailed error messages

**Get Table Structure:**
```sql
\d+ user_profile
\d+ user_skills
```

**Check Existing Policies:**
```sql
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN ('user_profile', 'user_skills');
```
