# 📝 Assessment Submission & Evaluation Guide

## Overview

Complete implementation guide for submitting and evaluating pre-assessments with automatic database updates to the `pre_assessment` table.

---

## ✅ What's Implemented

### 1. **Submit Assessment Endpoint**
**File:** `app/api/submit-assessment/route.ts`

**Purpose:** Handles complete assessment submission flow
- Accepts user answers
- Calls AI evaluation agent
- Updates `pre_assessment` table with results
- Returns evaluation data

### 2. **Evaluate Assessment Endpoint**
**File:** `app/api/evaluate-assessment/route.ts`

**Purpose:** AI-powered answer evaluation
- Evaluates each answer as correct/wrong/skipped
- Provides correct answers and explanations
- Returns detailed evaluation results

### 3. **Assessment Results Component**
**File:** `components/AssessmentResults.tsx`

**Purpose:** Display evaluation results
- Shows score and percentage
- Statistics breakdown (correct/wrong/skipped)
- Detailed question-by-question results
- Correct answers and explanations

### 4. **TypeScript Types**
**File:** `lib/types/database.ts`

**Added Types:**
- `EvaluationResult` - Individual question result
- `EvaluationSummary` - Overall statistics
- `SubmitAssessmentRequest` - API request
- `SubmitAssessmentResponse` - API response

---

## 🔄 Complete Workflow

### Step-by-Step Flow

```
1. User Takes Assessment
   ↓
2. User Clicks "Submit"
   ↓
3. Frontend calls POST /api/submit-assessment
   - Body: { assessmentId, answers }
   ↓
4. API validates request
   - Check authentication
   - Fetch assessment from pre_assessment table
   - Verify not already completed
   ↓
5. API calls /api/evaluate-assessment
   - Sends questions + answers to AI
   - Groq Llama 3.1-8B evaluates each answer
   - Returns evaluation results
   ↓
6. API updates pre_assessment table
   - Sets: answers, score, correct_count, wrong_count, skipped_count
   - Sets: evaluated_results (full details)
   - Sets: completed_at (timestamp)
   ↓
7. API returns results to frontend
   ↓
8. Frontend displays results using AssessmentResults component
```

---

## 📥 API Endpoints

### 1. Submit Assessment

**Endpoint:** `POST /api/submit-assessment`

**Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "assessmentId": "uuid-of-assessment",
  "answers": {
    "1": "User's answer to question 1",
    "2": "User's answer to question 2",
    "3": "",  // Empty = skipped
    ...
    "30": "User's answer to question 30"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "score": 25,
  "maxScore": 30,
  "percentage": 83,
  "assessment_id": "uuid",
  "completedAt": "2025-12-15T10:30:00Z",
  "evaluation": {
    "totalQuestions": 30,
    "correctCount": 25,
    "wrongCount": 5,
    "skippedCount": 0,
    "results": [
      {
        "questionId": 1,
        "question": "What is JavaScript?",
        "skill": "JavaScript",
        "category": "current_skills",
        "userAnswer": "A programming language",
        "status": "correct",
        "marksAwarded": 1
      },
      {
        "questionId": 2,
        "question": "Explain closures",
        "skill": "JavaScript",
        "category": "current_skills",
        "userAnswer": "Functions inside functions",
        "status": "wrong",
        "correctAnswer": "A closure is a function that has access to variables in its outer scope...",
        "explanation": "Your answer is partially correct but incomplete. Closures specifically retain access to outer scope variables even after the outer function has returned.",
        "marksAwarded": 0
      }
    ]
  }
}
```

**Error Responses:**

```json
// 401 Unauthorized
{
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token"
}

// 404 Not Found
{
  "error": "Assessment not found",
  "message": "Assessment not found or you do not have access"
}

// 400 Already Completed
{
  "error": "Assessment already completed",
  "message": "This assessment has already been submitted",
  "completedAt": "2025-12-15T10:30:00Z"
}

// 400 Missing Fields
{
  "error": "Missing required fields",
  "missing": ["assessmentId"]
}

// 500 Server Error
{
  "error": "Failed to submit assessment",
  "message": "Error details..."
}
```

### 2. Evaluate Assessment (Internal)

**Endpoint:** `POST /api/evaluate-assessment`

**Note:** This endpoint is called internally by submit-assessment. Can also be used standalone for testing.

**Request Body:**
```json
{
  "questions": [
    {
      "id": 1,
      "question": "What is JavaScript?",
      "marks": 1
    }
  ],
  "answers": {
    "1": "A programming language"
  }
}
```

**Response:**
```json
{
  "success": true,
  "evaluation": {
    "totalQuestions": 30,
    "correctCount": 25,
    "wrongCount": 5,
    "skippedCount": 0,
    "score": 25,
    "maxScore": 30,
    "results": [...]
  }
}
```

---

## 💾 Database Updates

### Fields Updated in `pre_assessment` Table

When assessment is submitted, these NULL fields are populated:

| Field | Type | Description | Example Value |
|-------|------|-------------|---------------|
| `answers` | JSONB[] | User's submitted answers | `[{"question_id": 1, "answer": "...", "is_correct": true, "marks_awarded": 1}]` |
| `score` | INTEGER | Total score achieved | `25` |
| `correct_count` | INTEGER | Number of correct answers | `25` |
| `wrong_count` | INTEGER | Number of wrong answers | `5` |
| `skipped_count` | INTEGER | Number of skipped questions | `0` |
| `evaluated_results` | JSONB | Full evaluation details | See structure below |
| `completed_at` | TIMESTAMPTZ | Submission timestamp | `2025-12-15T10:30:00Z` |

### `evaluated_results` Structure

```json
{
  "results": [
    {
      "questionId": 1,
      "question": "What is JavaScript?",
      "skill": "JavaScript",
      "category": "current_skills",
      "userAnswer": "A programming language",
      "status": "correct",
      "marksAwarded": 1
    },
    {
      "questionId": 2,
      "question": "Explain closures",
      "skill": "JavaScript",
      "category": "current_skills",
      "userAnswer": "Partial answer",
      "status": "wrong",
      "correctAnswer": "Full explanation...",
      "explanation": "Your answer needs...",
      "marksAwarded": 0
    }
  ],
  "summary": {
    "totalQuestions": 30,
    "correctCount": 25,
    "wrongCount": 5,
    "skippedCount": 0,
    "score": 25,
    "maxScore": 30,
    "percentage": 83
  },
  "evaluatedAt": "2025-12-15T10:30:00Z"
}
```

### Database Query Example

```sql
-- Check assessment status
SELECT
  id,
  user_id,
  assessment_type,
  score,
  correct_count,
  wrong_count,
  skipped_count,
  completed_at,
  created_at
FROM pre_assessment
WHERE user_id = 'user-uuid'
  AND assessment_type = 'pre'
ORDER BY created_at DESC
LIMIT 1;

-- Get detailed results
SELECT evaluated_results
FROM pre_assessment
WHERE id = 'assessment-uuid';
```

---

## 🤖 AI Evaluation Process

### How AI Evaluates Answers

The Groq AI (Llama 3.1-8B-Instant) evaluates each answer using:

**Context Provided:**
- User's job role
- Experience level (beginner/intermediate/advanced)
- Current skills, strong skills, weak skills
- Learning goals

**Evaluation Criteria:**
1. **Correctness** - Is the core concept correct?
2. **Completeness** - Is the answer sufficiently detailed?
3. **Context-Awareness** - Adjusted for user's experience level
4. **Flexibility** - Accepts variations if concept is understood

**Output for Each Question:**
```json
{
  "questionId": 1,
  "status": "correct" | "wrong" | "skipped",
  "correctAnswer": "string (if wrong/skipped)",
  "explanation": "string (if wrong/skipped)",
  "marksAwarded": 0 | 1
}
```

### AI Prompt Structure

```
You are an expert assessment evaluator.

**User Context:**
- Job Role: Frontend Developer
- Experience: 2.5 years
- Skill Level: intermediate
- Current Skills: JavaScript, React, TypeScript
- Strong Skills: CSS, HTML
- Skills to Improve: Node.js, GraphQL

**Evaluation Instructions:**
1. Determine if each answer is CORRECT, WRONG, or SKIPPED
2. If WRONG/SKIPPED, provide correct answer
3. If WRONG/SKIPPED, provide explanation (2-3 sentences)
4. Award 1 mark for correct, 0 for wrong/skipped
5. Be fair and context-aware for intermediate level

**Questions and Answers:**
[30 question-answer pairs]

**Output:** JSON array with evaluation results
```

---

## 💻 Frontend Integration

### Example: Submit Assessment

```typescript
import { SubmitAssessmentRequest, SubmitAssessmentResponse } from '@/lib/types/database'

async function submitAssessment(
  assessmentId: string,
  answers: { [questionId: number]: string }
) {
  const request: SubmitAssessmentRequest = {
    assessmentId,
    answers
  }

  const response = await fetch('/api/submit-assessment', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${sessionToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to submit assessment')
  }

  const data: SubmitAssessmentResponse = await response.json()
  return data
}

// Usage
try {
  const result = await submitAssessment('assessment-uuid', {
    1: "JavaScript is a programming language",
    2: "Closures are functions with access to outer scope",
    3: "", // Skipped
    // ... remaining answers
  })

  console.log('Score:', result.score, '/', result.maxScore)
  console.log('Percentage:', result.percentage, '%')
  console.log('Completed at:', result.completedAt)

  // Navigate to results page or display results
  showResults(result.evaluation)
} catch (error) {
  console.error('Submission failed:', error)
}
```

### Example: Display Results

```typescript
'use client'

import AssessmentResults from '@/components/AssessmentResults'
import { SubmitAssessmentResponse } from '@/lib/types/database'

export default function ResultsPage({ data }: { data: SubmitAssessmentResponse }) {
  const summary = {
    totalQuestions: data.evaluation.totalQuestions,
    correctCount: data.evaluation.correctCount,
    wrongCount: data.evaluation.wrongCount,
    skippedCount: data.evaluation.skippedCount,
    score: data.score,
    maxScore: data.maxScore,
    percentage: data.percentage
  }

  return (
    <div className="container mx-auto p-6">
      <AssessmentResults
        summary={summary}
        results={data.evaluation.results}
        showDetailedResults={true}
      />

      <div className="mt-6 text-center">
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  )
}
```

### Example: Fetch Completed Assessment

```typescript
import { PreAssessment } from '@/lib/types/database'

async function getCompletedAssessment(assessmentId: string) {
  const { data, error } = await supabase
    .from('pre_assessment')
    .select('*')
    .eq('id', assessmentId)
    .single()

  if (error) throw error
  return data as PreAssessment
}

// Check if assessment is completed
const assessment = await getCompletedAssessment('uuid')

if (assessment.completed_at) {
  // Show results
  const results = assessment.evaluated_results
  console.log('Score:', assessment.score, '/', assessment.max_score)
  console.log('Results:', results.summary)
} else {
  // Assessment not yet completed
  console.log('Assessment in progress')
}
```

---

## 🔒 Security & Validation

### Authentication
- All endpoints require valid JWT token
- User can only submit/view their own assessments
- RLS policies enforce user-specific access

### Validation Checks

1. **Assessment Ownership**
   ```typescript
   .eq('user_id', user.id)
   ```

2. **Already Completed**
   ```typescript
   if (assessment.completed_at) {
     return error('Assessment already completed')
   }
   ```

3. **Required Fields**
   ```typescript
   validateRequiredFields(body, ['assessmentId', 'answers'])
   ```

4. **Answer Format**
   ```typescript
   answers: { [questionId: number]: string }
   ```

---

## 🧪 Testing

### Test Case 1: Submit Valid Assessment

```bash
curl -X POST http://localhost:3000/api/submit-assessment \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assessmentId": "uuid-here",
    "answers": {
      "1": "JavaScript is a programming language",
      "2": "React is a UI library",
      "3": ""
    }
  }'
```

**Expected:** 200 OK with evaluation results

### Test Case 2: Submit Already Completed

```bash
# Submit same assessment twice
```

**Expected:** 400 Error "Assessment already completed"

### Test Case 3: Submit Without Auth

```bash
curl -X POST http://localhost:3000/api/submit-assessment \
  -H "Content-Type: application/json" \
  -d '{...}'
```

**Expected:** 401 Unauthorized

### Test Case 4: Submit Wrong Assessment ID

```bash
curl -X POST http://localhost:3000/api/submit-assessment \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assessmentId": "wrong-uuid",
    "answers": {...}
  }'
```

**Expected:** 404 Not Found

---

## 📊 Database Lifecycle Example

### Before Submission (Generated State)

```sql
SELECT * FROM pre_assessment WHERE id = 'uuid';
```

```
id                  | user_id | questions | answers | score | completed_at
--------------------|---------|-----------|---------|-------|-------------
assessment-uuid-123 | user-1  | [...30]   | NULL    | NULL  | NULL
```

### After Submission (Completed State)

```sql
SELECT * FROM pre_assessment WHERE id = 'uuid';
```

```
id                  | user_id | questions | answers        | score | correct | wrong | skipped | completed_at
--------------------|---------|-----------|----------------|-------|---------|-------|---------|------------------
assessment-uuid-123 | user-1  | [...30]   | [...30 with..] | 25    | 25      | 5     | 0       | 2025-12-15 10:30
```

---

## 🎯 Best Practices

### 1. Handle Submission Errors

```typescript
try {
  const result = await submitAssessment(id, answers)
  showResults(result)
} catch (error) {
  if (error.message.includes('already completed')) {
    // Show "already submitted" message
    showAlreadyCompletedMessage()
  } else if (error.message.includes('not found')) {
    // Redirect to dashboard
    router.push('/dashboard')
  } else {
    // Show generic error
    showError('Failed to submit. Please try again.')
  }
}
```

### 2. Show Loading State

```typescript
const [isSubmitting, setIsSubmitting] = useState(false)

async function handleSubmit() {
  setIsSubmitting(true)
  try {
    const result = await submitAssessment(id, answers)
    // Show results
  } finally {
    setIsSubmitting(false)
  }
}

return (
  <button disabled={isSubmitting}>
    {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
  </button>
)
```

### 3. Prevent Double Submission

```typescript
const [hasSubmitted, setHasSubmitted] = useState(false)

async function handleSubmit() {
  if (hasSubmitted) return

  setHasSubmitted(true)
  // Submit logic
}
```

### 4. Validate All Questions Answered (Optional)

```typescript
function validateAnswers(answers: { [id: number]: string }, totalQuestions: number) {
  const answeredCount = Object.values(answers).filter(a => a.trim()).length

  if (answeredCount < totalQuestions) {
    const unanswered = totalQuestions - answeredCount
    const confirm = window.confirm(
      `You have ${unanswered} unanswered questions. Submit anyway?`
    )
    return confirm
  }

  return true
}
```

---

## ✅ Summary

**Complete Workflow Implemented:**

1. ✅ User submits assessment via `/api/submit-assessment`
2. ✅ API fetches assessment from `pre_assessment` table
3. ✅ API validates (auth, ownership, not completed)
4. ✅ AI evaluates all answers via `/api/evaluate-assessment`
5. ✅ API updates all NULL fields in `pre_assessment` table:
   - `answers` array
   - `score`, `correct_count`, `wrong_count`, `skipped_count`
   - `evaluated_results` full details
   - `completed_at` timestamp
6. ✅ API returns results to frontend
7. ✅ Frontend displays results using `AssessmentResults` component

**Status:** ✅ Production Ready
**Last Updated:** 2025-12-15

---

## 🔗 Related Files

- **Submit API:** `app/api/submit-assessment/route.ts`
- **Evaluate API:** `app/api/evaluate-assessment/route.ts`
- **Component:** `components/AssessmentResults.tsx`
- **Types:** `lib/types/database.ts`
- **Table Guide:** `PRE_ASSESSMENT_TABLE_GUIDE.md`
- **Generation Guide:** `PRE_ASSESSMENT_IMPLEMENTATION_GUIDE.md`
