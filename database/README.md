# PathWise Database Management

This directory contains all database schema documentation, migrations, and validation scripts to help you manage your Supabase database effectively and prevent "column not found" errors.

## 📁 Directory Structure

```
database/
├── README.md                           # This file
├── schema.sql                          # Complete current schema documentation
├── validate-schema.sql                 # Schema validation query
├── QUICK_FIX.md                        # Fix skill_level_improvement error
├── FIX_WEEKLY_HOURS_ERROR.md          # Fix weekly_hours NOT NULL error
└── migrations/
    ├── 001_initial_schema.sql          # Initial database setup
    ├── 002_add_skill_level_improvement.sql  # Add skill_level_improvement column
    └── 003_remove_weekly_hours.sql     # Remove old weekly_hours column
```

## 🚨 FIXING CURRENT ERRORS

### Error 1: `Could not find the 'skill_level_improvement' column`

**Solution:** Run migration 002 in Supabase SQL Editor

### Error 2: `null value in column "weekly_hours" violates not-null constraint`

**Solution:** Run migration 003 in Supabase SQL Editor (See `FIX_WEEKLY_HOURS_ERROR.md`)

### Steps to Fix Both:

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run Migration 002** (Add skill_level_improvement)
   - Copy this SQL:
   ```sql
   ALTER TABLE employee_skill_requests
   ADD COLUMN IF NOT EXISTS skill_level_improvement TEXT
   CHECK (skill_level_improvement IN (
     'Beginner → Intermediate',
     'Intermediate → Advanced',
     'Advanced → Expert'
   ));
   ```
   - Paste and click "Run"

4. **Run Migration 003** (Remove weekly_hours)
   - Copy this SQL:
   ```sql
   ALTER TABLE employee_skill_requests
   DROP COLUMN IF EXISTS weekly_hours;
   ```
   - Paste and click "Run"

5. **Verify Success**
   - You should see: "Success. No rows returned" for both
   - Both issues are now fixed

6. **Test Your Application**
   - Refresh your application at http://localhost:3000
   - Try submitting the "Upgrade Skills" form
   - All errors should be resolved

## 📋 How to Prevent Future Errors

### Before Adding New Features:

1. **Check if Database Changes are Needed**
   - Review what data you're saving
   - Check if columns exist in `schema.sql`

2. **Create a New Migration**
   ```
   database/migrations/00X_description.sql
   ```

3. **Ask for Confirmation**
   - I will always ask before making database changes
   - You review the migration file
   - You approve before running

4. **Run the Migration**
   - Execute the SQL in Supabase SQL Editor
   - Validate using `validate-schema.sql`

5. **Update Documentation**
   - Update `schema.sql` to reflect current state
   - Document changes in migration file

## 🔍 Validating Your Schema

**Before deploying or when troubleshooting:**

1. Open `database/validate-schema.sql`
2. Copy the content
3. Run it in Supabase SQL Editor
4. Check the results:
   - ✓ All columns should be listed
   - ✓ `skill_level_improvement` should exist
   - ✓ Total: 18 columns

## 📝 Current Schema Overview

### Table: `employee_skill_requests`

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| id | bigint | Yes | Primary key |
| user_id | uuid | Yes | References auth.users |
| full_name | text | Yes | Employee name |
| email | text | Yes | Contact email |
| phone_number | text | Yes | Contact phone |
| company_name | text | Yes | Company name |
| job_role | text | Yes | Current position |
| experience_years | integer | No | Years of experience |
| experience_months | integer | No | Additional months |
| current_skills | jsonb | No | Array of current skills |
| strong_skills | jsonb | No | Array of strong skills |
| weak_skills | jsonb | No | Array of skills to improve |
| target_skill | text | Yes | Skill to learn |
| learning_goal | text | Yes | Learning motivation |
| preferred_format | text | No | Video/Reading/Projects/Mixed |
| skill_level_improvement | text | No | Beginner→Intermediate, etc. |
| created_at | timestamptz | Yes | Record creation time |
| updated_at | timestamptz | Yes | Last update time |

**Total Columns:** 18

## 🔐 Security Features

- ✓ Row Level Security (RLS) enabled
- ✓ Users can only access their own records
- ✓ CASCADE delete on user deletion
- ✓ Automatic timestamp updates

## 📚 Migration Workflow

### When Adding a New Column:

```sql
-- database/migrations/00X_add_column_name.sql

-- Description of what this migration does
ALTER TABLE employee_skill_requests
ADD COLUMN IF NOT EXISTS column_name DATA_TYPE;

-- Add constraints if needed
ALTER TABLE employee_skill_requests
ADD CONSTRAINT constraint_name CHECK (condition);

-- Rollback command (commented)
-- ALTER TABLE employee_skill_requests DROP COLUMN IF EXISTS column_name;
```

### Naming Convention:

- `001_initial_schema.sql` - Initial setup
- `002_add_skill_level_improvement.sql` - Add skill_level_improvement
- `003_add_new_feature.sql` - Add new feature columns
- `00X_descriptive_name.sql` - Future migrations

## ⚠️ Important Rules

1. **NEVER delete migration files** - They are history
2. **ALWAYS use IF NOT EXISTS** - Prevents errors on re-runs
3. **ALWAYS test locally first** - Use Supabase local dev if possible
4. **ALWAYS ask before running** - Get confirmation for production
5. **ALWAYS document changes** - Update schema.sql and README

## 🛠 Troubleshooting

### "Column not found" Error

1. Check which column is missing
2. Search for it in `schema.sql`
3. If missing, create a new migration
4. If exists in schema.sql, run `validate-schema.sql`
5. Find the migration that adds it
6. Run that migration in Supabase

### Migration Already Run

- Migrations use `IF NOT EXISTS` - safe to re-run
- Check validation query to confirm

### Need to Rollback

- Each migration has commented rollback SQL
- Use with caution in production
- Always backup data first

## 📞 Getting Help

If you encounter database issues:

1. Run `validate-schema.sql` and share results
2. Check `schema.sql` for expected columns
3. Review migration files for history
4. I can help create new migrations when needed

## 🎯 Next Steps After Fixing Current Error

1. ✓ Run migration 002
2. ✓ Verify with validate-schema.sql
3. ✓ Test the application
4. ✓ Keep this directory for future reference

---

**Remember:** Always ask before making database changes. I will create migration files for your review before execution.
