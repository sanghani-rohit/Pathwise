# 🚀 Quick Start - Pre-Assessment Table Setup

## Step-by-Step Guide (5 Minutes)

### Step 1: Create the Table (2 minutes)

1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy the contents of `database/migrations/017_create_pre_assessment_table.sql`
3. Paste into SQL Editor
4. Click **Run**
5. ✅ Look for: "pre_assessment table created successfully!"

---

### Step 2: Verify Table Creation (30 seconds)

Run this to verify:

```sql
-- Quick verification
SELECT
    'Table exists: ' ||
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'pre_assessment'
    ) THEN '✅' ELSE '❌' END as status;

-- Check RLS
SELECT tablename, rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'pre_assessment';
```

**Expected:**
- Table exists: ✅
- rls_enabled: true

---

### Step 3: Test Insert (1 minute)

```sql
-- Test insert
INSERT INTO public.pre_assessment (
    user_id,
    assessment_type,
    questions,
    total_questions,
    max_score
) VALUES (
    (SELECT id FROM auth.users LIMIT 1), -- Uses first user
    'pre',
    '[{"id": 1, "question": "Sample question"}]'::jsonb,
    30,
    30
) RETURNING *;
```

**Expected:** Returns the inserted record ✅

---

### Step 4: (Optional) Migrate Existing Data

**Only if you have data in old `assessments` table:**

1. Copy contents of `database/migrations/018_migrate_assessment_data.sql`
2. Paste into SQL Editor
3. Click **Run**
4. Check migration count

---

## That's It! ✅

Your `pre_assessment` table is now ready to use.

### Table Structure:

**Core Fields:**
- `id` - Unique ID
- `user_id` - User reference
- `assessment_type` - 'pre' or 'post'

**Question Data:**
- `questions` - JSONB array
- `answers` - JSONB array
- `total_questions` - Integer

**Scoring:**
- `score` - User's score
- `max_score` - Maximum score
- `correct_count` - Correct answers
- `wrong_count` - Wrong answers
- `skipped_count` - Skipped questions

**Results:**
- `evaluated_results` - JSONB detailed results
- `completed_at` - Timestamp

---

## Using in Code

### TypeScript Interface:

```typescript
interface PreAssessment {
  id: string
  user_id: string
  assessment_type: 'pre' | 'post'
  questions: any[]
  answers?: any[]
  total_questions: number
  max_score: number
  score?: number
  correct_count?: number
  wrong_count?: number
  skipped_count?: number
  evaluated_results?: any
  completed_at?: string
  created_at?: string
  updated_at?: string
}
```

### Insert Assessment:

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
    score: userScore,
    correct_count: correctCount,
    wrong_count: wrongCount,
    skipped_count: skippedCount,
    evaluated_results: results,
  })
  .select()
  .single();
```

### Get Latest Assessment:

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

---

## Files

- **Migration:** `database/migrations/017_create_pre_assessment_table.sql`
- **Data Migration:** `database/migrations/018_migrate_assessment_data.sql`
- **Full Guide:** `PRE_ASSESSMENT_TABLE_GUIDE.md`
- **Quick Start:** `QUICK_START_PRE_ASSESSMENT.md` (this file)

---

**Status:** ✅ Ready to use
**Time to setup:** ~5 minutes
**Last Updated:** 2025-12-15
