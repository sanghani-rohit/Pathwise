# 📊 Pre-Assessment Table - Migration Guide

## Overview

New dedicated table for storing pre and post assessment data, replacing the old `assessments` table.

---

## New Table Structure

### Table Name: `pre_assessment`

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NOT NULL | uuid_generate_v4() | Unique identifier |
| `user_id` | UUID | NOT NULL | - | Reference to auth.users |
| `assessment_type` | TEXT | NOT NULL | - | 'pre' or 'post' |
| `questions` | JSONB | NOT NULL | '[]' | Assessment questions data |
| `answers` | JSONB | YES | '[]' | User's submitted answers |
| `total_questions` | INTEGER | NOT NULL | 0 | Total number of questions |
| `max_score` | INTEGER | NOT NULL | 0 | Maximum achievable score |
| `score` | INTEGER | YES | 0 | User's achieved score |
| `correct_count` | INTEGER | YES | 0 | Number of correct answers |
| `wrong_count` | INTEGER | YES | 0 | Number of incorrect answers |
| `skipped_count` | INTEGER | YES | 0 | Number of skipped questions |
| `evaluated_results` | JSONB | YES | '{}' | Detailed evaluation results |
| `completed_at` | TIMESTAMPTZ | YES | NOW() | Assessment completion time |
| `created_at` | TIMESTAMPTZ | YES | NOW() | Record creation time |
| `updated_at` | TIMESTAMPTZ | YES | NOW() | Last update time |

---

## Constraints & Validations

### Check Constraints:
1. **`check_total_questions_positive`**: `total_questions >= 0`
2. **`check_max_score_positive`**: `max_score >= 0`
3. **`check_score_valid`**: `score >= 0 AND score <= max_score`
4. **`check_counts_sum`**: `correct_count + wrong_count + skipped_count = total_questions`
5. **`assessment_type`**: Must be 'pre' or 'post'

### Foreign Keys:
- `user_id` → `auth.users(id)` ON DELETE CASCADE

### Indexes:
1. `idx_pre_assessment_user_id` - On `user_id`
2. `idx_pre_assessment_type` - On `assessment_type`
3. `idx_pre_assessment_user_type` - On `(user_id, assessment_type)`
4. `idx_pre_assessment_completed` - On `completed_at DESC`

---

## Row Level Security (RLS)

✅ **RLS Enabled**

### Policies:

| Policy Name | Operation | Rule |
|-------------|-----------|------|
| Users can view own assessments | SELECT | `auth.uid() = user_id` |
| Users can insert own assessments | INSERT | `auth.uid() = user_id` |
| Users can update own assessments | UPDATE | `auth.uid() = user_id` |
| Users can delete own assessments | DELETE | `auth.uid() = user_id` |

---

## Migration Steps

### Step 1: Create the Table

Run migration: `017_create_pre_assessment_table.sql`

```bash
# In Supabase Dashboard → SQL Editor
# Copy and paste the contents of:
database/migrations/017_create_pre_assessment_table.sql
```

**Expected Output:**
```
✅ pre_assessment table created successfully!
Table includes RLS policies, indexes, and constraints
```

### Step 2: Migrate Existing Data (Optional)

If you have existing data in the `assessments` table:

Run migration: `018_migrate_assessment_data.sql`

```bash
# In Supabase Dashboard → SQL Editor
# Copy and paste the contents of:
database/migrations/018_migrate_assessment_data.sql
```

**What this does:**
- Copies all data from `assessments` → `pre_assessment`
- Avoids duplicates
- Verifies migration success
- Shows comparison counts

### Step 3: Verify Table Creation

```sql
-- Check table exists
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'pre_assessment';

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'pre_assessment';

-- View table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'pre_assessment'
ORDER BY ordinal_position;
```

### Step 4: Test Insert

```sql
-- Test insert (replace with your user_id)
INSERT INTO public.pre_assessment (
    user_id,
    assessment_type,
    questions,
    answers,
    total_questions,
    max_score,
    score,
    correct_count,
    wrong_count,
    skipped_count
) VALUES (
    (SELECT id FROM auth.users LIMIT 1),
    'pre',
    '[{"id": 1, "question": "Test question"}]'::jsonb,
    '[{"id": 1, "answer": "Test answer"}]'::jsonb,
    30,
    30,
    25,
    25,
    5,
    0
);

-- Verify insert
SELECT * FROM public.pre_assessment
ORDER BY created_at DESC
LIMIT 1;
```

---

## Usage Examples

### Insert Pre-Assessment

```typescript
const { data, error } = await supabase
  .from('pre_assessment')
  .insert({
    user_id: userId,
    assessment_type: 'pre',
    questions: questionsArray,
    answers: answersArray,
    total_questions: 30,
    max_score: 30,
    score: 25,
    correct_count: 25,
    wrong_count: 5,
    skipped_count: 0,
    evaluated_results: evaluationData,
    completed_at: new Date().toISOString()
  })
  .select()
  .single();
```

### Get User's Latest Pre-Assessment

```typescript
const { data, error } = await supabase
  .from('pre_assessment')
  .select('*')
  .eq('user_id', userId)
  .eq('assessment_type', 'pre')
  .order('completed_at', { ascending: false })
  .limit(1)
  .maybeSingle();
```

### Get All Assessments for User

```typescript
const { data, error } = await supabase
  .from('pre_assessment')
  .select('*')
  .eq('user_id', userId)
  .order('completed_at', { ascending: false });
```

### Update Assessment Results

```typescript
const { data, error } = await supabase
  .from('pre_assessment')
  .update({
    score: 28,
    correct_count: 28,
    wrong_count: 2,
    evaluated_results: updatedResults
  })
  .eq('id', assessmentId)
  .select()
  .single();
```

---

## Data Migration from Old Table

### If you have existing `assessments` table:

**Column Mapping:**

| Old Column (assessments) | New Column (pre_assessment) |
|-------------------------|----------------------------|
| `user_id` | `user_id` |
| `assessment_type` | `assessment_type` |
| `questions` | `questions` |
| `answers` | `answers` |
| `total_questions` | `total_questions` |
| `max_score` | `max_score` |
| `score` | `score` |
| `correct_count` | `correct_count` |
| `wrong_count` | `wrong_count` |
| `skipped_count` | `skipped_count` |
| `evaluated_results` | `evaluated_results` |
| `completed_at` | `completed_at` |
| `created_at` | `created_at` |
| `updated_at` | `updated_at` |

---

## Post-Migration Cleanup

### After verifying data migration:

```sql
-- 1. Create backup (RECOMMENDED)
CREATE TABLE _backup_assessments_20251215 AS
SELECT * FROM public.assessments;

-- 2. Verify backup
SELECT COUNT(*) as backup_count
FROM _backup_assessments_20251215;

-- 3. Drop old table (ONLY after verification!)
DROP TABLE IF EXISTS public.assessments CASCADE;

-- 4. Refresh schema cache
NOTIFY pgrst, 'reload schema';
```

---

## Troubleshooting

### Issue: Table already exists
```sql
-- Check if table exists
SELECT * FROM information_schema.tables
WHERE table_name = 'pre_assessment';

-- If it exists and you want to recreate it:
DROP TABLE IF EXISTS public.pre_assessment CASCADE;
-- Then run migration 017 again
```

### Issue: RLS blocking inserts
```sql
-- Check RLS policies
SELECT * FROM pg_policies
WHERE tablename = 'pre_assessment';

-- Verify user is authenticated
SELECT auth.uid(); -- Should return user ID, not null
```

### Issue: Constraint violations
```sql
-- Check constraint details
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.pre_assessment'::regclass;
```

---

## Summary

✅ **New Table:** `pre_assessment`
✅ **RLS:** Enabled with user-specific policies
✅ **Indexes:** Optimized for common queries
✅ **Constraints:** Data validation built-in
✅ **Migration:** Script provided for existing data

**Next Steps:**
1. Run migration 017 to create table
2. (Optional) Run migration 018 to migrate data
3. Update API endpoints to use new table
4. Test thoroughly
5. Drop old `assessments` table

---

**Files:**
- **Migration:** `database/migrations/017_create_pre_assessment_table.sql`
- **Data Migration:** `database/migrations/018_migrate_assessment_data.sql`
- **Guide:** `PRE_ASSESSMENT_TABLE_GUIDE.md` (this file)

**Created:** 2025-12-15
**Status:** Ready for deployment
