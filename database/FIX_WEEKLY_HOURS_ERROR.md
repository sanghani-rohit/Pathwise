# 🚨 QUICK FIX: weekly_hours NOT NULL Constraint Error

## Error Message
```
null value in column "weekly_hours" of relation "employee_skill_requests" violates not-null constraint
```

## What Happened?
Your database has an old `weekly_hours` column that your application no longer uses, but it has a NOT NULL constraint causing errors when you try to submit the form.

## 1-Step Fix (Takes 30 seconds)

### Copy This SQL:

```sql
ALTER TABLE employee_skill_requests
DROP COLUMN IF EXISTS weekly_hours;
```

### Run It:

1. **Open Supabase Dashboard** → https://supabase.com/dashboard
2. **Click "SQL Editor"** in the left sidebar
3. **Click "New query"**
4. **Paste the SQL above**
5. **Click "Run"** (or press Ctrl+Enter)

### You Should See:
```
Success. No rows returned
```

## ✅ Done!

The `weekly_hours` column is now removed. Go back to your app and try submitting the form again.

---

**Full migration file:** `database/migrations/003_remove_weekly_hours.sql`
