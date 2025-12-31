# 📊 Data Flow Documentation - Upgrade Skills Form

## Overview
This document explains how data flows from the "Upgrade Your Skills" form into the new database structure.

---

## 🔄 Current Data Flow (After Migration)

When a user submits the upgrade skills form at `/upgrade-skill`, data is distributed across **3 tables**:

```
User fills form → Submit →
  ├─ 1. user_profiles (upsert)
  ├─ 2. skill_requests (insert)
  └─ 3. user_skills (upsert)
```

---

## 📋 Form Fields → Database Mapping

### Form Section 1: Personal Information

| Form Field | Database Table | Column | Notes |
|------------|---------------|---------|-------|
| Full Name | user_profiles | full_name | Upserted on submit |
| Email | auth.users | email | Already exists (from signup) |
| Phone Number | user_profiles | phone_number | Upserted on submit |
| Company Name | user_profiles | company_name | Upserted on submit |

### Form Section 2: Professional Background

| Form Field | Database Table | Column | Notes |
|------------|---------------|---------|-------|
| Current Role | user_profiles | role | Upserted on submit |
| Years of Experience | user_profiles | experience_years | Direct column (0-50) |
| Months of Experience | user_profiles | experience_months | Direct column (0-11) |

### Form Section 3: Skills Assessment

| Form Field | Database Table | Column | Notes |
|------------|---------------|---------|-------|
| Current Skills | user_profiles | skills | Array of skill names |
| Current Skills | skill_requests | current_skills | JSONB array |
| Strong Skills | skill_requests | strong_skills | JSONB array |
| Strong Skills | user_skills | skill, level='intermediate' | One row per skill |
| Skills to Improve | skill_requests | weak_skills | JSONB array |

### Form Section 4: Learning Goals

| Form Field | Database Table | Column | Notes |
|------------|---------------|---------|-------|
| Target Skill | skill_requests | target_skill | Main skill to learn |
| Learning Goal | skill_requests | goal | Why they want to learn |

### Form Section 5: Learning Preferences

| Form Field | Database Table | Column | Notes |
|------------|---------------|---------|-------|
| Preferred Format | user_profiles | preferences.learning_format | Stored in JSONB |
| Preferred Format | skill_requests | preferred_format | Also saved here |
| Skill Level Improvement | skill_requests | current_level, target_level | Parsed to determine levels |

---

## 🔍 Detailed Data Flow

### STEP 1: Update User Profile

**Table:** `user_profiles`
**Operation:** UPSERT (update if exists, insert if new)

```typescript
{
  user_id: auth.uid(),                    // From authenticated user
  full_name: "John Doe",
  phone_number: "+1 555-1234",
  company_name: "Acme Corp",
  role: "Software Engineer",
  experience_years: 5,                    // Direct column
  experience_months: 6,                   // Direct column
  skills: ["JavaScript", "React"],        // Current skills array
  preferences: {
    learning_format: "Video"
  }
}
```

**Why:** Keeps user profile up-to-date with latest information

---

### STEP 2: Create Skill Request

**Table:** `skill_requests`
**Operation:** INSERT

```typescript
{
  user_id: auth.uid(),
  target_skill: "Advanced React Patterns",
  current_skills: ["JavaScript", "React"],
  strong_skills: ["JavaScript", "HTML"],
  weak_skills: ["TypeScript", "Testing"],
  goal: "I want to become a senior developer",
  preferred_format: "Video",
  current_level: "beginner",
  target_level: "intermediate",
  status: "pending"
}
```

**Why:** Creates a record of the learning request for tracking and AI processing

---

### STEP 3: Update User Skills

**Table:** `user_skills`
**Operation:** UPSERT (for each strong skill)

```typescript
// For each skill in strong_skills array:
{
  user_id: auth.uid(),
  skill: "JavaScript",
  level: "intermediate",
  proficiency_score: 75.0,
  last_assessed_at: "2025-01-13T..."
}
```

**Why:** Maintains a persistent record of user's skill levels

---

## 🎯 Example Complete Flow

### User Input:
```
Name: Sarah Chen
Email: sarah@tech.com
Phone: +1-555-9876
Company: TechStart Inc
Role: Junior Developer

Experience: 2 years, 3 months

Current Skills: [HTML, CSS, JavaScript]
Strong Skills: [HTML, CSS]
Skills to Improve: [React, TypeScript]

Target Skill: React
Goal: Build modern web applications
Format: Video
Level: Beginner → Intermediate
```

### Database Result:

**1. user_profiles:**
```sql
user_id: uuid-123
full_name: "Sarah Chen"
phone_number: "+1-555-9876"
company_name: "TechStart Inc"
role: "Junior Developer"
experience_years: 2
experience_months: 3
skills: ["HTML", "CSS", "JavaScript"]
preferences: {"learning_format": "Video"}
```

**2. skill_requests:**
```sql
id: 1
user_id: uuid-123
target_skill: "React"
current_skills: ["HTML", "CSS", "JavaScript"]
strong_skills: ["HTML", "CSS"]
weak_skills: ["React", "TypeScript"]
goal: "Build modern web applications"
preferred_format: "Video"
current_level: "beginner"
target_level: "intermediate"
status: "pending"
```

**3. user_skills (2 rows):**
```sql
Row 1:
  user_id: uuid-123
  skill: "HTML"
  level: "intermediate"
  proficiency_score: 75.0

Row 2:
  user_id: uuid-123
  skill: "CSS"
  level: "intermediate"
  proficiency_score: 75.0
```

---

## 🔗 Relationships

All three tables are connected via `user_id`:

```
auth.users (user_id)
    │
    ├─→ user_profiles (user_id FK)
    ├─→ skill_requests (user_id FK)
    └─→ user_skills (user_id FK)
```

**Queries by user_id:**
```sql
-- Get all data for a user
SELECT * FROM user_profiles WHERE user_id = 'uuid-123';
SELECT * FROM skill_requests WHERE user_id = 'uuid-123';
SELECT * FROM user_skills WHERE user_id = 'uuid-123';
```

---

## ✅ Data Validation

Before saving, the form validates:

- ✅ All required fields are filled
- ✅ Email format is valid
- ✅ At least one skill selected in each category
- ✅ Experience values are valid numbers
- ✅ User is authenticated (has valid user_id)

---

## 🔄 Update vs Insert Logic

### user_profiles
- **UPSERT**: Updates existing profile or creates new one
- **Conflict resolution**: On `user_id` (primary key)
- **Behavior**: Always latest data wins

### skill_requests
- **INSERT**: Creates new request each time
- **No conflict**: Each submission is a new request
- **Behavior**: Historical record of all requests

### user_skills
- **UPSERT**: Updates skill level or creates new skill
- **Conflict resolution**: On `user_id + skill` (composite unique)
- **Behavior**: Only latest proficiency is stored per skill

---

## 🚀 Future Enhancements

With this structure, you can easily add:

1. **AI Learning Path Generation**
   - Read from `skill_requests`
   - Generate roadmap → `learning_paths`
   - Break down by week → `learning_path_steps`

2. **Progress Tracking**
   - Update `user_skills.proficiency_score` as they learn
   - Track in `activity_logs`

3. **Assessments**
   - Create pre-assessment → `assessments`
   - Update after learning → `assessments` (type: 'post')

4. **Certificates**
   - On completion → `certificates`
   - Link to `learning_path_id`

---

## 📝 Code Location

**Form Component:** `app/upgrade-skill/page.tsx`

**Submit Handler:** Lines 150-233

**Tables Used:**
- `user_profiles` (line 160-176)
- `skill_requests` (line 180-196)
- `user_skills` (line 200-221)

---

## 🎓 Summary

✅ **One form submission** → **3 tables updated**
✅ **user_id** is the connection point
✅ **Profile stays current** (upsert)
✅ **Requests are tracked** (insert)
✅ **Skills are maintained** (upsert)

**Result:** Clean, normalized data ready for AI processing and analytics!
