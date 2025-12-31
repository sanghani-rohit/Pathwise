# 🔧 Add Experience Columns to user_profiles

## Issue
Experience data was stored in JSONB `preferences` field, making it hard to query and analyze.

## Solution
Add dedicated columns: `experience_years` and `experience_months`

---

## 🚀 Quick Fix (Run This SQL)

**Copy and paste this into Supabase SQL Editor:**

```sql
-- Add experience columns to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS experience_years INTEGER DEFAULT 0;

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS experience_months INTEGER DEFAULT 0;

-- Add constraints
ALTER TABLE user_profiles
ADD CONSTRAINT user_profiles_experience_years_range
CHECK (experience_years >= 0 AND experience_years <= 50);

ALTER TABLE user_profiles
ADD CONSTRAINT user_profiles_experience_months_range
CHECK (experience_months >= 0 AND experience_months <= 11);

-- Migrate existing data from preferences JSONB (if any)
UPDATE user_profiles
SET
  experience_years = COALESCE((preferences->>'experience_years')::INTEGER, 0),
  experience_months = COALESCE((preferences->>'experience_months')::INTEGER, 0)
WHERE preferences IS NOT NULL
  AND (preferences->>'experience_years' IS NOT NULL OR preferences->>'experience_months' IS NOT NULL);

-- Create index for queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_experience
  ON user_profiles(experience_years, experience_months);
```

**Expected result:**
```
Success. No rows returned (or number of rows migrated)
```

---

## ✅ What This Does

1. **Adds 2 new columns** to `user_profiles`:
   - `experience_years` (INTEGER, 0-50)
   - `experience_months` (INTEGER, 0-11)

2. **Migrates existing data** from JSONB to new columns

3. **Adds constraints** to ensure valid values

4. **Creates index** for better query performance

---

## 📊 Before vs After

### Before:
```sql
SELECT preferences FROM user_profiles WHERE user_id = 'abc-123';
-- Result: {"learning_format": "Video", "experience_years": 5, "experience_months": 6}
-- Hard to query!
```

### After:
```sql
SELECT experience_years, experience_months FROM user_profiles WHERE user_id = 'abc-123';
-- Result: experience_years: 5, experience_months: 6
-- Easy to query!
```

---

## 🎯 Benefits

✅ **Easy querying**: `WHERE experience_years >= 5`
✅ **Better sorting**: `ORDER BY experience_years DESC`
✅ **Analytics ready**: `AVG(experience_years)`
✅ **Type safety**: Integer validation
✅ **Indexed**: Fast searches

---

## 🔍 Verify It Worked

Run this query after migration:

```sql
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles'
  AND column_name LIKE 'experience%';
```

**Expected output:**
```
experience_years   | integer | YES
experience_months  | integer | YES
```

---

## 📝 Updated Schema

**user_profiles table now has:**
```sql
user_id UUID PRIMARY KEY
full_name TEXT
department TEXT
role TEXT
phone_number TEXT
company_name TEXT
experience_years INTEGER        ← NEW!
experience_months INTEGER       ← NEW!
skills JSONB
preferences JSONB
avatar_url TEXT
bio TEXT
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

---

## 🎓 Example Queries You Can Now Run

```sql
-- Find users with 3-5 years experience
SELECT full_name, experience_years
FROM user_profiles
WHERE experience_years BETWEEN 3 AND 5;

-- Average experience of users
SELECT AVG(experience_years + (experience_months / 12.0)) AS avg_experience
FROM user_profiles;

-- Users sorted by total experience
SELECT full_name, experience_years, experience_months
FROM user_profiles
ORDER BY experience_years DESC, experience_months DESC;

-- Count users by experience level
SELECT
  CASE
    WHEN experience_years < 2 THEN 'Junior'
    WHEN experience_years BETWEEN 2 AND 5 THEN 'Mid-Level'
    ELSE 'Senior'
  END AS level,
  COUNT(*) AS user_count
FROM user_profiles
GROUP BY level;
```

---

## ✅ Status

- [x] Migration file created: `014_add_experience_to_user_profiles.sql`
- [x] Form updated: `app/upgrade-skill/page.tsx`
- [x] Documentation updated: `DATA_FLOW_DOCUMENTATION.md`
- [ ] **Run migration in Supabase** ← Do this now!

---

**File location:** `database/migrations/014_add_experience_to_user_profiles.sql`
