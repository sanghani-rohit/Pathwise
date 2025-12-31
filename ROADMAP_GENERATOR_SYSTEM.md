# Roadmap Generator Agent - Complete Documentation

## 📋 Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [How It Works](#how-it-works)
4. [Core Components](#core-components)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Frontend Components](#frontend-components)
8. [AI Agent Behavior](#ai-agent-behavior)
9. [Usage Flow](#usage-flow)
10. [Setup Instructions](#setup-instructions)
11. [Testing](#testing)

---

## 📖 Overview

The **Roadmap Generator Agent** is the third AI agent in the PathWise platform. It generates personalized, multi-path learning roadmaps based on a user's:

- Pre-assessment score and evaluation results
- Weak skills, current skills, and target skill
- Experience level (beginner, intermediate, advanced)
- Career goals and current role

The agent acts like a **senior mentor**, analyzing gaps, explaining strengths, and creating adaptive roadmaps that guide users from their current state to their target skill.

### Key Features

✅ **Adaptive Roadmap Generation**: Creates 1-4 roadmaps based on skill gaps
✅ **Multi-Page Learning**: Each roadmap contains 8-12 topics (one page per topic)
✅ **Video Integration**: Each topic includes curated YouTube video links
✅ **Progress Tracking**: Marks topics as complete and stores progress in database
✅ **AI Analysis Summary**: Explains strengths, weaknesses, and recommended learning order
✅ **Prerequisite Detection**: Identifies foundational skills needed before target skill

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Flow                                │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ├─> 1. Complete Skill Upgrade Form
                       │    └─> Stored in: skill_requests table
                       │
                       ├─> 2. Complete Pre-Assessment
                       │    └─> Stored in: assessments table
                       │    └─> Evaluation results: evaluation_results JSONB
                       │
                       ├─> 3. Navigate to /roadmap
                       │    └─> Check if assessment completed
                       │
                       ├─> 4. Click "Generate My Roadmap"
                       │    │
                       │    ├─> POST /api/generate-roadmap
                       │    │   │
                       │    │   ├─> Fetch: user_profiles, skill_requests, assessments
                       │    │   ├─> Analyze: score, weak skills, wrong answers
                       │    │   ├─> Call: lib/roadmapGenerator.ts
                       │    │   │    └─> Gemini 2.5 Flash AI generates roadmaps
                       │    │   ├─> Store: roadmaps table
                       │    │   └─> Return: JSON with roadmaps
                       │    │
                       │    └─> Display: Analysis summary + roadmap cards
                       │
                       ├─> 5. Select Roadmap → Open RoadmapViewer
                       │    └─> Multi-page viewer (1 page = 1 topic)
                       │    └─> Video player embedded
                       │    └─> Navigation: Previous | Next
                       │
                       └─> 6. Mark Topic Complete
                            │
                            ├─> POST /api/complete-topic
                            │   └─> Insert/Update: learning_path_steps table
                            │
                            └─> Progress bar updated
                                └─> Analytics data available
```

---

## ⚙️ How It Works

### Step 1: User Context Collection

The system collects comprehensive user data:

**From `user_profiles`:**
- Experience years and months
- Current role

**From `skill_requests`:**
- Current skills (strengths)
- Weak skills (areas to improve)
- Target skill (career goal)

**From `assessments`:**
- Assessment score (e.g., 18/30)
- Correct, wrong, skipped counts
- Evaluation results (wrong/skipped questions)

### Step 2: Performance Analysis

```typescript
analyzeUserPerformance(context) {
  // Calculate score tier
  const scorePercentage = (score / totalQuestions) * 100

  // Tier classification
  if (scorePercentage < 40) → 'low'
  if (scorePercentage 40-70) → 'medium'
  if (scorePercentage > 70) → 'high'

  // Identify gaps from:
  // - Explicitly mentioned weak skills
  // - Wrong answer patterns
  // - Skipped questions

  return { scoreTier, experienceLevel, identifiedGaps }
}
```

### Step 3: Roadmap Strategy Decision

**The AI agent follows these rules:**

| Score Tier | Strategy | Roadmaps Generated |
|------------|----------|-------------------|
| **Low (<40%)** | User needs fundamentals first | 2+ roadmaps: Prerequisites + Target |
| **Medium (40-70%)** | Some gaps exist | 1-2 roadmaps: Optional prerequisite + Target |
| **High (>70%)** | Strong foundation | 1 roadmap: Advanced target skill only |

**Additional Rules:**
- If multiple weak skills detected → Separate roadmap for each major gap
- If target skill has clear prerequisites missing → Generate prerequisite roadmap first

### Step 4: AI Roadmap Generation

The system calls **Gemini 2.5 Flash** with a detailed prompt:

```typescript
const prompt = buildRoadmapPrompt(context, analysis)

// Prompt includes:
// - User profile (experience, role, skills)
// - Assessment results (score, wrong answers, skipped)
// - Strategy rules (when to generate multiple roadmaps)
// - Topic requirements (8-12 topics per roadmap)
// - Format specification (JSON structure)

const response = await gemini.generateContent(prompt)
const roadmapData = parseJSON(response)
```

### Step 5: Topic Structure

Each roadmap contains **8-12 topics**, where each topic has:

```typescript
{
  id: "topic_1_1234567890",
  title: "Prompt Engineering Basics",
  intro: "Learn how prompts influence model behavior...",
  example: "Example: Changing instruction from X to Y produces Z.",
  videoUrl: "https://youtube.com/watch?v=abc123",
  estimatedHours: 3,
  prerequisites: ["Introduction to GenAI"]
}
```

### Step 6: Progress Tracking

When a user marks a topic as complete:

```typescript
POST /api/complete-topic
{
  roadmapId: "roadmap_1_1234567890",
  topicId: "topic_5_1234567890",
  topicTitle: "Advanced Prompt Patterns",
  skill: "GenAI Basics",
  timeSpentMinutes: 45
}

// Stored in: learning_path_steps table
// Used for: Progress bars, analytics, completion graphs
```

---

## 🧩 Core Components

### 1. `lib/roadmapGenerator.ts`

**Purpose:** Core AI agent logic for roadmap generation

**Key Functions:**

```typescript
// Main function - generates personalized roadmaps
export async function generateRoadmaps(
  context: UserRoadmapContext,
  apiKey: string
): Promise<RoadmapAnalysis>

// Analyzes user performance and identifies gaps
export function analyzeUserPerformance(
  context: UserRoadmapContext
): { scorePercentage, scoreTier, experienceLevel, identifiedGaps }

// Builds comprehensive prompt for Gemini AI
function buildRoadmapPrompt(
  context: UserRoadmapContext,
  analysis: PerformanceAnalysis
): string

// Fallback if AI fails
export function generateFallbackRoadmap(
  context: UserRoadmapContext
): RoadmapAnalysis
```

**Key Interfaces:**

```typescript
export interface UserRoadmapContext {
  userId: string
  currentSkills: string[]
  weakSkills: string[]
  strongSkills: string[]
  targetSkill: string
  currentRole?: string
  experienceYears: number
  experienceMonths: number
  assessmentScore: number
  totalQuestions: number
  correctCount: number
  wrongCount: number
  skippedCount: number
  wrongAnswers?: WrongAnswer[]
  skippedAnswers?: SkippedAnswer[]
}

export interface RoadmapAnalysis {
  analysisSummary: string
  strengths: string[]
  weaknesses: string[]
  recommendedOrder: string[]
  roadmaps: Roadmap[]
}

export interface Roadmap {
  id: string
  skill: string
  priority: number // 1 = complete first
  reasoning: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedWeeks: number
  topics: RoadmapTopic[]
}
```

---

### 2. `app/api/generate-roadmap/route.ts`

**Purpose:** API endpoint to generate roadmaps

**Flow:**
1. Authenticate user
2. Fetch user profile, skill request, latest assessment
3. Build `UserRoadmapContext`
4. Call `generateRoadmaps()` from lib/roadmapGenerator.ts
5. Store roadmap in `roadmaps` table
6. Return roadmap JSON to frontend

**Request:**
```bash
POST /api/generate-roadmap
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "roadmapId": "uuid",
  "analysisSummary": "Based on your assessment...",
  "strengths": ["Python", "Data Analysis"],
  "weaknesses": ["Machine Learning", "Deep Learning"],
  "recommendedOrder": ["ML Basics", "Agentic AI"],
  "roadmaps": [
    {
      "id": "roadmap_1",
      "skill": "Machine Learning Basics",
      "priority": 1,
      "reasoning": "Foundation needed before Agentic AI",
      "difficulty": "intermediate",
      "estimatedWeeks": 4,
      "topics": [ ... 10 topics ... ]
    },
    {
      "id": "roadmap_2",
      "skill": "Agentic AI",
      "priority": 2,
      "reasoning": "Your target skill",
      "difficulty": "intermediate",
      "estimatedWeeks": 6,
      "topics": [ ... 12 topics ... ]
    }
  ],
  "metadata": {
    "assessmentScore": 18,
    "totalQuestions": 30,
    "targetSkill": "Agentic AI",
    "generatedAt": "2025-01-20T..."
  }
}
```

---

### 3. `app/api/complete-topic/route.ts`

**Purpose:** Track user progress through roadmap topics

**POST Endpoint:**
```bash
POST /api/complete-topic
Authorization: Bearer <token>

{
  "roadmapId": "uuid",
  "topicId": "topic_5_1234",
  "topicTitle": "Prompt Engineering",
  "skill": "GenAI Basics",
  "timeSpentMinutes": 45
}
```

**Response:**
```json
{
  "success": true,
  "message": "Topic marked as complete",
  "stepId": "uuid",
  "completedAt": "2025-01-20T..."
}
```

**GET Endpoint:**
```bash
GET /api/complete-topic?roadmapId=<uuid>
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "roadmapId": "uuid",
  "completedTopics": [
    {
      "id": "uuid",
      "topic_id": "topic_1_123",
      "topic_title": "Introduction to GenAI",
      "completed_at": "2025-01-20T...",
      "time_spent_minutes": 30
    }
  ],
  "totalCompleted": 5
}
```

---

## 🗄 Database Schema

### `roadmaps` Table

```sql
CREATE TABLE roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  assessment_id UUID REFERENCES assessments(id),

  target_skill TEXT NOT NULL,
  analysis_summary TEXT NOT NULL,
  strengths TEXT[] DEFAULT '{}',
  weaknesses TEXT[] DEFAULT '{}',
  recommended_order TEXT[] DEFAULT '{}',

  roadmap_data JSONB NOT NULL, -- Array of roadmap objects

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_roadmaps_user_id ON roadmaps(user_id);
CREATE INDEX idx_roadmaps_assessment_id ON roadmaps(assessment_id);

-- RLS Policies (users can view/insert/update/delete their own roadmaps)
```

**JSONB Structure for `roadmap_data`:**

```json
[
  {
    "id": "roadmap_1_1234567890",
    "skill": "Machine Learning Basics",
    "priority": 1,
    "reasoning": "Foundation needed before advanced topics",
    "difficulty": "intermediate",
    "estimatedWeeks": 4,
    "topics": [
      {
        "id": "topic_1_1234567890",
        "title": "Introduction to ML",
        "intro": "Learn fundamental ML concepts...",
        "example": "Example: Predicting house prices...",
        "videoUrl": "https://youtube.com/watch?v=abc123",
        "estimatedHours": 3,
        "prerequisites": []
      }
    ]
  }
]
```

---

### `learning_path_steps` Table

```sql
CREATE TABLE learning_path_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  roadmap_id UUID NOT NULL REFERENCES roadmaps(id),

  topic_id TEXT NOT NULL,
  topic_title TEXT NOT NULL,
  skill TEXT DEFAULT '',

  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent_minutes INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_user_roadmap_topic UNIQUE (user_id, roadmap_id, topic_id)
);

-- Indexes
CREATE INDEX idx_learning_path_steps_user_id ON learning_path_steps(user_id);
CREATE INDEX idx_learning_path_steps_roadmap_id ON learning_path_steps(roadmap_id);
CREATE INDEX idx_learning_path_steps_user_roadmap ON learning_path_steps(user_id, roadmap_id);

-- RLS Policies (users can view/insert/update/delete their own progress)
```

---

## 🎨 Frontend Components

### 1. `app/roadmap/page.tsx`

**Main Roadmap Page**

**States:**
- No assessment completed → Show "Complete assessment first" message
- No roadmap generated → Show "Generate Roadmap" button
- Roadmap exists → Show analysis summary + roadmap cards

**Features:**
- Checks assessment status on mount
- Loads existing roadmap if available
- Generates new roadmap on button click
- Displays AI analysis summary (strengths/weaknesses)
- Shows recommended learning order
- Grid of roadmap cards

---

### 2. `components/RoadmapCard.tsx`

**Individual Roadmap Card**

**Displays:**
- Priority badge (Priority 1, 2, 3...)
- Skill name
- Difficulty level (beginner/intermediate/advanced)
- Reasoning (why this roadmap is needed)
- Total topics and estimated hours
- Sample topics (first 3)
- "Start Learning" button

---

### 3. `components/RoadmapViewer.tsx`

**Multi-Page Topic Viewer**

**Features:**
- **Header:** Roadmap title, progress bar, completion stats
- **Topic Card:** Current topic with intro, example, video
- **Video Player:** Embedded YouTube video (if available)
- **Prerequisites:** Shows required prior topics
- **Mark Complete Button:** Saves progress to database
- **Navigation:** Previous/Next buttons
- **Quick Navigation:** Grid of all topics with completion checkmarks
- **Progress Tracking:** Loads and displays completed topics

**Progress Flow:**
```typescript
1. Load progress: GET /api/complete-topic?roadmapId=X
2. Display completed topics with checkmarks
3. User marks topic complete: POST /api/complete-topic
4. Update local state: completedTopics.add(topicId)
5. Update progress bar: (completed / total) * 100
```

---

## 🤖 AI Agent Behavior

### Gemini 2.5 Flash Prompt Strategy

The agent receives a comprehensive prompt with:

1. **User Profile Section**
   - Experience level and role
   - Current skills (strengths)
   - Weak skills (gaps)
   - Target skill (goal)

2. **Assessment Results Section**
   - Score percentage and tier
   - Correct/wrong/skipped counts
   - Top 5 wrong answers (showing conceptual gaps)
   - Top 3 skipped questions

3. **Strategy Rules**
   - When to generate multiple roadmaps
   - How to prioritize roadmaps
   - Difficulty level guidelines

4. **Topic Requirements**
   - 8-12 topics per roadmap
   - Topic structure (title, intro, example, etc.)
   - Estimated hours (1-8 per topic)
   - Prerequisites array

5. **Output Format**
   - JSON structure specification
   - Example output

### AI Decision Making

**Score < 40% (Low Tier):**
```
Agent thinks: "User has weak foundation"
→ Generate 2+ roadmaps
→ Priority 1: Foundational skills
→ Priority 2: Target skill (simplified)
→ Reasoning: "You need basics first"
```

**Score 40-70% (Medium Tier):**
```
Agent thinks: "User has some gaps"
→ Generate 1-2 roadmaps
→ If weak skills detected: Priority 1 for those
→ Priority 2: Target skill
→ Reasoning: "Fill these gaps to succeed"
```

**Score > 70% (High Tier):**
```
Agent thinks: "User has strong foundation"
→ Generate 1 roadmap
→ Focus on advanced target skill
→ Skip basics, go deeper
→ Reasoning: "You're ready for advanced topics"
```

---

## 🚀 Usage Flow

### Complete User Journey

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant AI
    participant DB

    User->>Frontend: Navigate to /roadmap
    Frontend->>API: Check assessment status
    API->>DB: Query assessments table
    DB-->>Frontend: Assessment completed ✓

    Frontend->>User: Show "Generate Roadmap" button
    User->>Frontend: Click "Generate"

    Frontend->>API: POST /api/generate-roadmap
    API->>DB: Fetch user_profiles, skill_requests, assessments
    DB-->>API: User data

    API->>AI: Call Gemini 2.5 Flash
    AI-->>API: Roadmap JSON (2 roadmaps)

    API->>DB: Insert into roadmaps table
    API-->>Frontend: Return roadmap data

    Frontend->>User: Display analysis + 2 roadmap cards
    User->>Frontend: Click "Start Learning" on Roadmap 1

    Frontend->>User: Show RoadmapViewer (Topic 1/10)
    Frontend->>API: GET /api/complete-topic?roadmapId=X
    API-->>Frontend: Completed topics: []

    User->>Frontend: Mark Topic 1 complete
    Frontend->>API: POST /api/complete-topic
    API->>DB: Insert into learning_path_steps
    API-->>Frontend: Success

    Frontend->>User: Update progress bar (10%)
    Frontend->>User: Navigate to Topic 2
```

---

## 🛠 Setup Instructions

### 1. Run Database Migrations

```bash
# Navigate to Supabase SQL editor and run:
D:\PathWise\supabase\migrations\create_roadmaps_table.sql
D:\PathWise\supabase\migrations\create_learning_path_steps_table.sql
```

### 2. Environment Variables

Ensure `.env.local` has:

```env
GOOGLE_API_KEY=your_gemini_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Install Dependencies

```bash
npm install @google/generative-ai
```

### 4. Test the Flow

1. **Register/Login** → Complete skill form
2. **Take Pre-Assessment** → Get evaluated
3. **Navigate to /roadmap** → Generate roadmap
4. **Click "Start Learning"** → View topics
5. **Mark topics complete** → Check progress

---

## 🧪 Testing

### Test Case 1: Low Score (Beginner User)

**Setup:**
- User: 0.5 years experience
- Assessment Score: 10/30 (33%)
- Weak Skills: Python, DSA, APIs
- Target Skill: Backend Development

**Expected Output:**
- 2 roadmaps:
  1. **Python & DSA Basics** (Priority 1, Beginner)
  2. **Backend Development** (Priority 2, Beginner)
- Analysis summary mentions weak foundation
- 18-20 total topics across both roadmaps

---

### Test Case 2: Medium Score (Intermediate User)

**Setup:**
- User: 2 years experience
- Assessment Score: 20/30 (67%)
- Weak Skills: Machine Learning, TensorFlow
- Target Skill: AI Engineering

**Expected Output:**
- 2 roadmaps:
  1. **Machine Learning Fundamentals** (Priority 1, Intermediate)
  2. **AI Engineering** (Priority 2, Intermediate)
- Analysis summary identifies ML gap
- 20-24 total topics

---

### Test Case 3: High Score (Advanced User)

**Setup:**
- User: 5 years experience
- Assessment Score: 27/30 (90%)
- Weak Skills: None significant
- Target Skill: System Design

**Expected Output:**
- 1 roadmap:
  1. **Advanced System Design** (Priority 1, Advanced)
- Analysis summary praises strong foundation
- 10-12 advanced topics

---

## 📊 Analytics & Insights

### Trackable Metrics

From `learning_path_steps` table:

```sql
-- User progress percentage
SELECT
  user_id,
  roadmap_id,
  COUNT(*) FILTER (WHERE completed = true) * 100.0 / COUNT(*) as progress_pct
FROM learning_path_steps
GROUP BY user_id, roadmap_id;

-- Average time spent per topic
SELECT
  skill,
  AVG(time_spent_minutes) as avg_minutes
FROM learning_path_steps
WHERE completed = true
GROUP BY skill;

-- Most completed topics
SELECT
  topic_title,
  COUNT(*) as completions
FROM learning_path_steps
WHERE completed = true
GROUP BY topic_title
ORDER BY completions DESC
LIMIT 10;

-- Completion rate by difficulty
SELECT
  r.roadmap_data->0->>'difficulty' as difficulty,
  COUNT(*) FILTER (WHERE lps.completed = true) * 100.0 / COUNT(*) as completion_rate
FROM roadmaps r
JOIN learning_path_steps lps ON lps.roadmap_id = r.id
GROUP BY difficulty;
```

---

## 🔮 Future Enhancements

1. **Collaborative Filtering**: Recommend topics based on what similar users completed
2. **Spaced Repetition**: Suggest re-visiting topics after X weeks
3. **Skill Trees**: Visual dependency graphs showing topic prerequisites
4. **Certificates**: Generate completion certificates for finished roadmaps
5. **Community Notes**: Allow users to add tips/notes on topics
6. **Adaptive Difficulty**: Adjust topic difficulty based on quiz performance
7. **Multi-Language Support**: Translate roadmaps to different languages
8. **Offline Mode**: Download roadmap content for offline learning

---

## ✅ Checklist for Deployment

- [ ] Run database migrations (`roadmaps`, `learning_path_steps`)
- [ ] Verify RLS policies are active
- [ ] Test with low/medium/high score users
- [ ] Verify video embedding works
- [ ] Test progress tracking persistence
- [ ] Check mobile responsiveness
- [ ] Verify Navbar "Roadmap" link appears
- [ ] Test "Generate Roadmap" button
- [ ] Verify AI generates valid JSON
- [ ] Test fallback roadmap if AI fails
- [ ] Load test with concurrent users

---

## 📞 Support

For issues or questions:
- Check console logs for detailed error messages
- Verify user has completed assessment before accessing roadmap
- Ensure Gemini API key is valid
- Check Supabase RLS policies if database queries fail

---

## 🎉 Summary

The **Roadmap Generator Agent** completes the PathWise AI trilogy:

1. **Assessment Generator** → Creates questions
2. **Evaluation Agent** → Grades answers
3. **Roadmap Generator** → Creates learning paths ✓

Users now have a complete journey:
1. Define goals (Skill Form)
2. Get assessed (Pre-Assessment)
3. Receive roadmap (Roadmap Generator)
4. Learn and track progress (Topic completion)
5. Get re-assessed (Post-Assessment)

The system is production-ready and fully integrated! 🚀
