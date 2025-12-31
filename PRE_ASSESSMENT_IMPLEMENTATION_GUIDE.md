# 📝 Pre-Assessment Implementation Guide

## Overview

Complete implementation of the pre-assessment generation system with 10-10-10 question distribution based on user skills profile.

---

## ✅ What's Implemented

### 1. Updated API Endpoint
**File:** `app/api/generate-pre-assessment/route.ts`

**Changes:**
- ✅ Fetches data from NEW `user_skills` table (instead of old tables)
- ✅ Implements 10-10-10 question distribution
- ✅ Saves generated assessment to `pre_assessment` table
- ✅ Returns assessment ID and metadata

### 2. New Database Table
**File:** `database/migrations/017_create_pre_assessment_table.sql`

**Structure:**
- `pre_assessment` table with RLS, indexes, and constraints
- Stores questions, answers, scores, and evaluation results
- User-specific access control via RLS policies

### 3. TypeScript Types
**File:** `lib/types/database.ts`

**Added Types:**
- `PreAssessment` - Main assessment record
- `AssessmentQuestion` - Question structure
- `AssessmentAnswer` - Answer structure
- `AssessmentMetadata` - Metadata response
- `GenerateAssessmentResponse` - API response type

---

## 📊 Question Distribution System

### 10-10-10 Distribution

The system generates **exactly 30 questions** following this distribution:

| Category | Question IDs | Count | Based On | Focus |
|----------|--------------|-------|----------|-------|
| **Current Skills** | 1-10 | 10 | `current_skills` field | Understanding & practical application |
| **Strong Skills** | 11-20 | 10 | `strong_skills` field | Advanced knowledge & best practices |
| **Weak Skills** | 21-30 | 10 | `skills_to_improve` field | Foundational concepts & common pitfalls |

---

## 🤖 AI Agent System Prompt

### Complete System Prompt Template

The agent uses a comprehensive prompt that:

**Input Data:**
- Job Role
- Years & Months of Experience
- Skill Level (beginner/intermediate/advanced)
- Learning Goals
- Current Skills array
- Strong Skills array
- Skills to Improve array

**Output Format:**
```json
[
  {
    "id": 1,
    "category": "current_skills",
    "skill": "JavaScript",
    "question": "What is the difference between let and const?",
    "marks": 1
  },
  {
    "id": 11,
    "category": "strong_skills",
    "skill": "Python",
    "question": "Explain decorators and when to use them.",
    "marks": 1
  },
  {
    "id": 21,
    "category": "weak_skills",
    "skill": "React",
    "question": "What is the purpose of useState hook?",
    "marks": 1
  }
]
```

**Key Instructions in Prompt:**
1. Generate EXACTLY 30 questions
2. Follow 10-10-10 distribution strictly
3. Include `category` and `skill` fields
4. Keep questions concise (2-3 lines max)
5. Mix theory, practical, and scenario-based questions
6. Align difficulty with user's skill level
7. Make questions relevant to job role

---

## 🔄 Data Flow

### Step-by-Step Process

```
1. User Request
   ↓
2. Authenticate User (JWT token)
   ↓
3. Fetch user_skills from database
   ↓ (user_id → user_skills table)
4. Validate user has completed onboarding
   ↓
5. Extract skills data:
   - current_skills[]
   - strong_skills[]
   - skills_to_improve[]
   - job_role, experience, skill_level
   ↓
6. Build AI prompt with 10-10-10 instructions
   ↓
7. Call Groq AI (Llama 3.1-8B-Instant)
   ↓ (with retry logic)
8. Parse JSON response
   ↓
9. Validate 30 questions & distribution
   ↓
10. Save to pre_assessment table
    ↓ (user_id, questions, metadata)
11. Return questions + assessment_id
```

---

## 📥 API Request/Response

### Request

**Endpoint:** `POST /api/generate-pre-assessment`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:** None (uses authenticated user)

### Response

**Success (200):**
```json
{
  "questions": [
    {
      "id": 1,
      "category": "current_skills",
      "skill": "JavaScript",
      "question": "Explain closures in JavaScript",
      "marks": 1
    },
    // ... 29 more questions
  ],
  "assessmentId": "uuid-here",
  "metadata": {
    "skillLevel": "intermediate",
    "jobRole": "Frontend Developer",
    "distribution": {
      "current": 10,
      "strong": 10,
      "weak": 10
    },
    "totalExperience": "2.5"
  }
}
```

**Error (400):**
```json
{
  "error": "Please complete the skill upgrade form first before generating an assessment"
}
```

**Error (401):**
```json
{
  "error": "Unauthorized"
}
```

**Error (503):**
```json
{
  "error": "The AI service is currently experiencing high demand. Please try again in a few minutes.",
  "technicalDetails": "503 Service Unavailable",
  "retryable": true
}
```

---

## 💾 Database Schema

### user_skills Table (Source Data)

```sql
CREATE TABLE user_skills (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  job_role TEXT NOT NULL,
  years_of_experience INTEGER NOT NULL,
  months_of_experience INTEGER NOT NULL,
  current_skills TEXT[] NOT NULL,
  strong_skills TEXT[] NOT NULL,
  skills_to_improve TEXT[] NOT NULL,
  learning_goals TEXT,
  skill_level TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### pre_assessment Table (Output Data)

```sql
CREATE TABLE pre_assessment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  assessment_type TEXT CHECK (assessment_type IN ('pre', 'post')),
  questions JSONB NOT NULL DEFAULT '[]',
  answers JSONB DEFAULT '[]',
  total_questions INTEGER NOT NULL DEFAULT 0,
  max_score INTEGER NOT NULL DEFAULT 0,
  score INTEGER,
  correct_count INTEGER,
  wrong_count INTEGER,
  skipped_count INTEGER,
  evaluated_results JSONB DEFAULT '{}',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
```

---

## 🔧 Implementation Details

### Field Mapping (Old → New Tables)

| Old Table | Old Field | New Table | New Field |
|-----------|-----------|-----------|-----------|
| `user_profiles` | `current_role` | `user_skills` | `job_role` |
| `user_profiles` | `experience_years` | `user_skills` | `years_of_experience` |
| `user_profiles` | `experience_months` | `user_skills` | `months_of_experience` |
| `skill_requests` | `current_skills` | `user_skills` | `current_skills` |
| `skill_requests` | `weak_skills` | `user_skills` | `skills_to_improve` |
| `skill_requests` | `strong_skills` | `user_skills` | `strong_skills` |
| `skill_requests` | `target_skill` | `user_skills` | `learning_goals` |

### Skill Level Mapping

```typescript
const skillLevelMapping = {
  'beginner': 'beginner',
  'intermediate': 'intermediate',
  'advanced': 'advanced',
  'expert': 'advanced'
}
```

### Error Handling

1. **Retry Logic:** 3 attempts with exponential backoff (2s, 4s, 8s)
2. **Fallback Questions:** If AI fails, generates simple template questions
3. **Partial Save:** Returns questions even if database save fails
4. **User-Friendly Messages:** Translates technical errors to user messages

---

## 🧪 Testing

### Test Cases

1. **Valid User with Complete Profile**
   - ✅ Should generate 30 questions
   - ✅ Should follow 10-10-10 distribution
   - ✅ Should save to database
   - ✅ Should return assessment ID

2. **User Without Onboarding Data**
   - ✅ Should return 400 error
   - ✅ Error message: "Please complete the skill upgrade form first"

3. **Unauthenticated Request**
   - ✅ Should return 401 error

4. **AI Service Unavailable**
   - ✅ Should retry 3 times
   - ✅ Should use fallback questions if all retries fail
   - ✅ Should return user-friendly error message

### Manual Testing

```bash
# 1. Login and get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'

# 2. Generate assessment
curl -X POST http://localhost:3000/api/generate-pre-assessment \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 3. Check response
# Should return 30 questions with categories and assessment ID
```

---

## 📚 Code Examples

### Using the API in Frontend

```typescript
import { GenerateAssessmentResponse } from '@/lib/types/database'

async function generateAssessment() {
  const response = await fetch('/api/generate-pre-assessment', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${sessionToken}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to generate assessment')
  }

  const data: GenerateAssessmentResponse = await response.json()

  console.log('Assessment ID:', data.assessmentId)
  console.log('Questions:', data.questions)
  console.log('Distribution:', data.metadata.distribution)

  return data
}
```

### Fetching Saved Assessment

```typescript
import { PreAssessment } from '@/lib/types/database'

async function getLatestAssessment(userId: string) {
  const { data, error } = await supabase
    .from('pre_assessment')
    .select('*')
    .eq('user_id', userId)
    .eq('assessment_type', 'pre')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data as PreAssessment | null
}
```

### Updating Assessment with Answers

```typescript
import { AssessmentAnswer, PreAssessmentUpdate } from '@/lib/types/database'

async function submitAssessment(
  assessmentId: string,
  answers: AssessmentAnswer[],
  score: number,
  correctCount: number,
  wrongCount: number,
  skippedCount: number
) {
  const update: PreAssessmentUpdate = {
    answers,
    score,
    correct_count: correctCount,
    wrong_count: wrongCount,
    skipped_count: skippedCount,
    completed_at: new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('pre_assessment')
    .update(update)
    .eq('id', assessmentId)
    .select()
    .single()

  if (error) throw error
  return data
}
```

---

## 🚀 Deployment Checklist

- [x] Migration 017 run in production Supabase
- [x] Schema cache refreshed in Supabase Dashboard
- [x] Environment variables configured:
  - `GROQ_API_KEY` - Groq AI API key
  - `NEXT_PUBLIC_SUPABASE_URL` - Supabase URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- [x] TypeScript types exported from `lib/types/database.ts`
- [x] API endpoint tested with real user data
- [x] Error handling verified for all edge cases

---

## 📊 Monitoring & Logs

### Console Logs

The API logs detailed information:

```
=== User Skills Data ===
Job Role: Frontend Developer
Experience: 2y 6m
Skill Level: intermediate
Current Skills: ['JavaScript', 'React', 'TypeScript']
Strong Skills: ['CSS', 'HTML']
Weak Skills: ['Node.js', 'GraphQL']
Learning Goals: Learn backend development

=== Starting Groq Llama AI Generation ===
User ID: uuid-here
Difficulty Level: intermediate
Distribution: 10 Current + 10 Strong + 10 Weak = 30 total
Prompt length: 2847

Successfully generated 30 questions for user: uuid-here
Distribution - Current: 10, Strong: 10, Weak: 10
Expected - Current: 10, Strong: 10, Weak: 10

Assessment saved to pre_assessment table with ID: assessment-uuid
```

---

## 🔒 Security

1. **Authentication:** JWT token required
2. **RLS Policies:** Users can only access their own assessments
3. **Input Validation:** All user data sanitized
4. **API Rate Limiting:** Retry logic prevents API abuse
5. **Error Messages:** No sensitive data exposed in errors

---

## 📝 Summary

✅ **API Endpoint:** Updated to use new `user_skills` table
✅ **System Prompt:** Implements 10-10-10 distribution
✅ **Database:** Saves to `pre_assessment` table
✅ **TypeScript:** Complete type definitions
✅ **Error Handling:** Retry logic + fallback questions
✅ **Documentation:** Comprehensive guide created

**Status:** ✅ Ready for production
**Last Updated:** 2025-12-15

---

## 🔗 Related Files

- **API Route:** `app/api/generate-pre-assessment/route.ts`
- **Database Types:** `lib/types/database.ts`
- **Migration:** `database/migrations/017_create_pre_assessment_table.sql`
- **Table Guide:** `PRE_ASSESSMENT_TABLE_GUIDE.md`
- **Quick Start:** `QUICK_START_PRE_ASSESSMENT.md`
