# 🚨 QUICK FIX: Column Not Found Error

## Error Message
```
Could not find the 'skill_level_improvement' column of 'employee_skill_requests' in the schema cache
```

## 3-Step Fix (Takes 2 minutes)

### Step 1: Open Supabase
Go to: https://supabase.com/dashboard
- Select your PathWise project
- Click **SQL Editor** in left sidebar
- Click **New Query**

### Step 2: Run This SQL
Copy and paste this into the SQL Editor:

```sql
-- Add the missing column
ALTER TABLE employee_skill_requests
ADD COLUMN IF NOT EXISTS skill_level_improvement TEXT
CHECK (skill_level_improvement IN (
  'Beginner → Intermediate',
  'Intermediate → Advanced',
  'Advanced → Expert'
));
```

Click **Run** (or press Ctrl+Enter)

### Step 3: Verify
You should see:
```
Success. No rows returned
```

## ✅ Test
1. Go back to http://localhost:3000
2. Try the "Upgrade Your Skills" form
3. Submit a request
4. Error should be gone!

## 📚 For Future Reference
- Full migration file: `database/migrations/002_add_skill_level_improvement.sql`
- Validation query: `database/validate-schema.sql`
- Complete guide: `database/README.md`

---

**Questions?** Check `database/README.md` for detailed documentation.
