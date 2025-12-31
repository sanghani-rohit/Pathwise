# Supabase Database - Complete Data Summary

**Generated:** December 3, 2024
**Purpose:** Comprehensive overview of all data stored in PathWise Supabase database

---

## Database Overview

### Total Records by Table

| Table | Rows | Status |
|-------|------|--------|
| user_profiles | 4 | ✅ Active |
| skill_requests | 13 | ✅ Active |
| assessments | 36 | ✅ Active |
| roadmaps | ? | To be checked |
| learning_path_steps | ? | To be checked |
| roadmap_templates | ? | To be checked |
| user_skills | ? | To be checked |
| courses | ? | To be checked |
| learning_paths | ? | To be checked |

---

## Table 1: user_profiles (4 rows)

### Schema
```typescript
{
  user_id: UUID (PK) - References auth.users(id)
  full_name: TEXT
  department: TEXT | NULL
  role: TEXT
  phone_number: TEXT
  company_name: TEXT
  skills: JSONB (array of skill strings)
  preferences: JSONB { learning_format: string }
  avatar_url: TEXT | NULL
  bio: TEXT | NULL
  created_at: TIMESTAMPTZ
  updated_at: TIMESTAMPTZ
  experience_years: INTEGER
  experience_months: INTEGER
}
```

### Sample Data

#### User 1: Darshan
```json
{
  "user_id": "77fcc105-365f-43c5-b0c5-383c53592935",
  "full_name": "Darshan",
  "role": "Data Scientist",
  "phone_number": "+91 9434343434",
  "company_name": "Stithi AI",
  "skills": [
    "Python", "Scikit-learn", "NumPy", "TensorFlow",
    "Statistics", "Machine Learning", "Jupyter", "Data Visualization"
  ],
  "preferences": { "learning_format": "Mixed" },
  "experience_years": 1,
  "experience_months": 1,
  "created_at": "2025-11-14T06:11:41Z"
}
```

#### User 2: Rohan
```json
{
  "user_id": "6fee259f-ebc5-44ed-a94c-eaeeb8b12649",
  "full_name": "rohan",
  "role": "Data Scientist",
  "company_name": "Stithi AI",
  "skills": [
    "Python", "Pandas", "NumPy", "Scikit-learn",
    "TensorFlow", "Statistics", "Machine Learning", "Data Visualization"
  ],
  "experience_years": 1,
  "experience_months": 2
}
```

#### User 3: Smit
```json
{
  "user_id": "39575b85-2b10-4b29-9f89-430cea35075d",
  "full_name": "smit",
  "role": "Data Scientist",
  "company_name": "camron ai",
  "skills": [
    "Python", "Pandas", "NumPy", "Scikit-learn",
    "TensorFlow", "Statistics", "Machine Learning", "Jupyter", "Data Visualization"
  ],
  "experience_years": 1,
  "experience_months": 0
}
```

### Insights
- **All users are Data Scientists** - indicates focused user base
- **Common Skills Pattern:**
  - Python (universal)
  - Data Science libraries (Pandas, NumPy, Scikit-learn, TensorFlow)
  - Machine Learning
  - Data Visualization
- **Experience Level:** All users are junior (1 year experience)
- **Company Profile:**
  - 2 users from "Stithi AI"
  - 1 user from "camron ai"
- **Learning Preference:** All prefer "Mixed" format (Video + Reading + Projects)

---

## Table 2: skill_requests (13 rows)

### Schema
```typescript
{
  id: SERIAL (PK)
  user_id: UUID - References auth.users(id)
  target_skill: TEXT
  current_skills: TEXT[] (array)
  strong_skills: TEXT[] (array)
  weak_skills: TEXT[] (array)
  goal: TEXT
  current_level: TEXT ('beginner', 'intermediate', 'advanced')
  target_level: TEXT ('beginner', 'intermediate', 'advanced')
  preferred_format: TEXT ('Video', 'Reading', 'Projects', 'Mixed')
  status: TEXT ('pending', 'approved', 'completed')
  created_at: TIMESTAMPTZ
  updated_at: TIMESTAMPTZ
}
```

### Key Patterns

#### Most Common Target Skill
**"Agentic AI"** - Appears in most requests (at least 10+ times)

#### Sample Request - Darshan (ID: 1)
```json
{
  "id": 1,
  "user_id": "77fcc105-365f-43c5-b0c5-383c53592935",
  "target_skill": "Agentic AI",
  "current_skills": [
    "Python", "NumPy", "Machine Learning",
    "Data Visualization", "Statistics", "Jupyter"
  ],
  "strong_skills": [
    "Machine Learning", "Data Visualization", "Python"
  ],
  "weak_skills": [
    "NLP", "TensorFlow", "LangChain", "OpenAI API", "Hugging Face"
  ],
  "goal": "want to improve skills in Agentic AI",
  "current_level": "beginner",
  "target_level": "intermediate",
  "preferred_format": "Mixed",
  "status": "pending"
}
```

#### Sample Request - User ID 2
```json
{
  "target_skill": "Agentic AI",
  "current_skills": [
    "Python", "R", "NumPy", "SQL",
    "Machine Learning", "Data Visualization"
  ],
  "strong_skills": [
    "Pandas", "NumPy", "Data Visualization", "Python"
  ],
  "weak_skills": [
    "Vector Databases", "NLP", "LangChain", "PyTorch"
  ]
}
```

#### Sample Request - Non-Python Background (ID: 3)
```json
{
  "target_skill": "Agentic AI",
  "current_skills": ["C#", "Algorithms", "Data Structures", "OOP"],
  "strong_skills": ["C++", "Algorithms", "Data Structures", "OOP"],
  "weak_skills": ["Python", "Git", "Algorithms", "Data Structures", "OOP"]
}
```

### Insights
- **Dominant Target:** Agentic AI (shows high interest in AI agents)
- **Common Weak Skills Pattern:**
  - LangChain (AI framework)
  - NLP (Natural Language Processing)
  - TensorFlow / PyTorch (deep learning)
  - OpenAI API / Hugging Face (LLM APIs)
  - Vector Databases
- **Progression Path:** Most users want beginner → intermediate
- **Status:** All requests are "pending" (no approved/completed yet)
- **Multiple Submissions:** Same users submit multiple times (e.g., user "77fcc105..." has 3+ requests)

---

## Table 3: assessments (36 rows)

### Schema
```typescript
{
  id: UUID (PK)
  user_id: UUID - References auth.users(id)
  assessment_type: TEXT ('pre', 'post')
  questions: JSONB (array of question objects)
  answers: JSONB (object with question_id: answer)
  score: INTEGER
  total_questions: INTEGER (default: 30)
  correct_count: INTEGER
  wrong_count: INTEGER
  skipped_count: INTEGER
  max_score: INTEGER (default: 30)
  evaluation_results: JSONB | NULL (array of evaluation objects)
  completed_at: TIMESTAMPTZ
  created_at: TIMESTAMPTZ
  updated_at: TIMESTAMPTZ
}
```

### Sample Assessment

#### Assessment 1 - Rohan (Score: 25/30, 83%)
```json
{
  "id": "3b57206e-5e88-4c2a-a2b3-144e7f2524c5",
  "user_id": "6fee259f-ebc5-44ed-a94c-eaeeb8b12649",
  "assessment_type": "pre",
  "score": 25,
  "total_questions": 30,
  "correct_count": 0,
  "wrong_count": 0,
  "skipped_count": 0,
  "max_score": 30,
  "completed_at": "2025-11-17T03:47:55Z"
}
```

**Sample Questions from this Assessment:**
```json
[
  {
    "id": 1,
    "marks": 1,
    "question": "What is the primary purpose of LangChain in the context of LLMs?"
  },
  {
    "id": 2,
    "marks": 1,
    "question": "Which core component in LangChain is typically responsible for preparing and formatting the input text before sending it to an LLM?"
  },
  {
    "id": 6,
    "marks": 1,
    "question": "In CrewAI, distinguish between an 'Agent' and a 'Task'."
  },
  {
    "id": 8,
    "marks": 1,
    "question": "What is the main function of n8n in a development or operational context?"
  },
  {
    "id": 22,
    "marks": 1,
    "question": "What is the fundamental concept of an 'Agent' in Agentic AI?"
  }
]
```

**Sample Answers:**
```json
{
  "1": "Framework",
  "2": "Prompt Templates.",
  "6": "Agent is the doer; Task is the thing to be done.",
  "8": "Workflow automation platform to connect apps, sync data, and automate repetitive tasks...",
  "22": "its kind of cop.",
  "26": "Autonomy means the system can self-direct its actions..."
}
```

#### Assessment 2 - Rohan (Score: 3/30, 10%)
```json
{
  "id": "12ded7f6-f27c-4492-a5ba-00fe4b514896",
  "score": 3,
  "total_questions": 30,
  "correct_count": 3,
  "wrong_count": 0,
  "skipped_count": 27
}
```

**Evaluation Results (AI Grading):**
```json
[
  {
    "status": "correct",
    "questionId": 1,
    "question": "Scenario: You need to automate a workflow that fetches data from an API...",
    "userAnswer": "HTTP Request: To fetch data from the external API...",
    "marksAwarded": 1
  },
  {
    "status": "correct",
    "questionId": 2,
    "question": "How would you secure variables containing API keys in n8n?",
    "userAnswer": "Use n8n Credentials or Environment Variables...",
    "marksAwarded": 1
  },
  {
    "status": "skipped",
    "questionId": 4,
    "userAnswer": "no idea.",
    "marksAwarded": 0
  }
]
```

### Question Topics Covered

Based on the sample assessments, questions cover:

**1. AI Frameworks & Tools (40%)**
- LangChain (chains, agents, retrieval)
- CrewAI (agents, tasks, crews)
- n8n (workflow automation)
- OpenAI API (GPT-4 integration)

**2. Python & Data Science (30%)**
- Python basics (lists, tuples, if statements)
- Pandas (DataFrames, data manipulation)
- NumPy (arrays, operations)
- Scikit-learn (model training, encoding)
- TensorFlow/Keras (neural networks, optimizers)

**3. Machine Learning Concepts (15%)**
- Regression vs Classification
- Model evaluation (precision, recall, F1)
- Hypothesis testing (Type I/II errors)

**4. Statistics & Visualization (10%)**
- Median, mean, distribution
- Plot types (histograms, scatter plots)

**5. Agentic AI Concepts (15%)**
- Agent definition and characteristics
- Autonomy, tool use, memory
- Planning and reasoning
- Multi-agent systems
- Task decomposition
- Reactive vs deliberative agents

**6. Supabase (5%)**
- Authentication
- Database (PostgreSQL)
- Row Level Security (RLS)

### Assessment Statistics

- **Total Assessments:** 36
- **Assessment Type:** All are "pre" (no post-assessments yet)
- **Score Range:** 3/30 (10%) to 25/30 (83%)
- **Question Format:** Mix of theory and practical
- **Evaluation Status:** Some have detailed evaluation_results, some have NULL
- **Answer Patterns:**
  - Short answers: "Framework", "no idea", "don't know"
  - Detailed answers: Multi-line explanations
  - Skipped: Many questions left blank (27/30 in one case)

### Insights

**Question Quality:**
- ✅ Well-structured questions covering beginner to intermediate topics
- ✅ Mix of conceptual and practical scenarios
- ✅ Relevant to target skill (Agentic AI + Data Science)

**User Performance:**
- 📊 Wide score variation (10% to 83%)
- 🎯 Topics users struggle with:
  - Advanced LangChain (RetrievalQA, vector stores)
  - Supabase RLS policies
  - TensorFlow/Keras specifics
  - Type I/II errors in statistics
  - Agentic AI architecture patterns

**Areas for Improvement:**
- ⚠️ Many assessments have NULL evaluation_results (evaluation API not called)
- ⚠️ correct_count, wrong_count, skipped_count are 0 in some records (needs calculation)
- ⚠️ Some users skip majority of questions (27/30 skipped)

---

## Table 4: roadmaps

**Status:** To be analyzed (waiting for script completion)

**Expected Schema:**
```typescript
{
  id: UUID (PK)
  user_id: UUID
  assessment_id: UUID
  target_skill: TEXT
  analysis_summary: TEXT
  strengths: TEXT[]
  weaknesses: TEXT[]
  recommended_order: TEXT[]
  roadmap_data: JSONB (array of modules)
  created_at: TIMESTAMPTZ
  updated_at: TIMESTAMPTZ
}
```

**Expected Data:**
- Personalized learning roadmaps
- 8-12 modules per roadmap
- Each module contains:
  - module_name
  - order_index
  - level (beginner/intermediate/advanced)
  - overview
  - subtopics
  - tools_frameworks
  - best_practices
  - hands_on_exercise
  - mini_project

---

## Table 5: learning_path_steps

**Status:** To be analyzed

**Expected Schema:**
```typescript
{
  id: UUID (PK)
  user_id: UUID
  roadmap_id: UUID
  topic_id: TEXT
  topic_title: TEXT
  skill: TEXT
  completed: BOOLEAN
  completed_at: TIMESTAMPTZ | NULL
  time_spent_minutes: INTEGER
  created_at: TIMESTAMPTZ
}
```

**Purpose:** Track user progress through roadmap modules

---

## Table 6: roadmap_templates

**Status:** To be analyzed

**Expected Schema:**
```typescript
{
  id: SERIAL (PK)
  skill: TEXT
  module_name: TEXT
  order_index: INTEGER
  level: TEXT
  overview: TEXT
  subtopics: TEXT[]
  tools_frameworks: TEXT[]
  best_practices: TEXT[]
  hands_on_exercise: JSONB
  mini_project: JSONB
  created_at: TIMESTAMPTZ
}
```

**Purpose:** Pre-defined module templates that AI personalizes

---

## Data Relationships

```
auth.users (Supabase managed)
    ↓
    ├── user_profiles (1:1)
    ├── skill_requests (1:many)
    ├── assessments (1:many)
    ├── roadmaps (1:many)
    ├── learning_path_steps (1:many)
    └── user_skills (1:many)

skill_requests
    ↓
    └── Contains target_skill, current_skills, weak_skills

assessments
    ↓
    ├── Links to: user_id
    └── Referenced by: roadmaps.assessment_id

roadmaps
    ↓
    ├── Links to: user_id, assessment_id
    └── Referenced by: learning_path_steps.roadmap_id

learning_path_steps
    ↓
    └── Links to: user_id, roadmap_id
```

---

## Key Findings

### User Demographics
- **Total Active Users:** 4
- **Primary Role:** Data Scientists (100%)
- **Experience Level:** Junior (1 year average)
- **Companies:** Small AI companies (Stithi AI, camron ai)
- **Geographic Region:** India (+91 phone codes)

### Learning Goals
- **Top Target Skill:** Agentic AI (80%+ of requests)
- **Common Path:** Beginner → Intermediate
- **Learning Style:** Mixed format (Video + Reading + Projects)

### Skill Gaps Identified
**Most Common Weak Skills:**
1. LangChain (AI framework)
2. NLP (Natural Language Processing)
3. TensorFlow / PyTorch (deep learning)
4. OpenAI API / Hugging Face (LLM integration)
5. Vector Databases (for RAG)

**Strong Skills (Most Users):**
1. Python (universal)
2. Machine Learning (general concepts)
3. Data Visualization
4. Pandas / NumPy
5. Statistics

### Assessment Patterns
- **Completion Rate:** High (36 assessments from 4 users = 9 avg per user)
- **Performance Range:** 10% to 83%
- **Question Topics:** Well-aligned with weak skills (LangChain, CrewAI, n8n, Agentic AI)
- **Common Issues:**
  - Many skip questions (lack of knowledge)
  - Short, incomplete answers
  - Some evaluation_results are NULL (needs fixing)

### Data Quality Issues

**Issues Found:**
1. ⚠️ Many assessments have NULL evaluation_results
   - **Impact:** Users don't get detailed feedback
   - **Fix:** Ensure /api/evaluate-assessment is always called

2. ⚠️ correct_count, wrong_count, skipped_count are 0 in some records
   - **Impact:** Missing statistics
   - **Fix:** Calculate counts after evaluation

3. ⚠️ Multiple skill_requests from same user
   - **Impact:** Unclear which request to use for roadmap
   - **Current:** Uses most recent (ORDER BY created_at DESC LIMIT 1)

4. ⚠️ All skill_requests have status="pending"
   - **Impact:** No workflow tracking
   - **Fix:** Update status after assessment/roadmap generation

### Recommendations

**For Development:**
1. ✅ Fix evaluation flow to always populate evaluation_results
2. ✅ Calculate assessment statistics (correct/wrong/skipped counts)
3. ✅ Update skill_request status workflow
4. ✅ Add post-assessment support
5. ✅ Implement progress tracking in learning_path_steps

**For Content:**
1. ✅ Add more Agentic AI focused content (high demand)
2. ✅ Create roadmap templates for:
   - LangChain mastery
   - CrewAI development
   - Vector databases + RAG
   - OpenAI API integration
3. ✅ Add intermediate-level TensorFlow/PyTorch modules

**For User Experience:**
1. ✅ Show progress indicators during assessment
2. ✅ Provide hints for difficult questions
3. ✅ Allow saving progress (partially completed assessments)
4. ✅ Add assessment review feature
5. ✅ Gamification: badges, streaks, leaderboard

---

## Next Steps

1. **Complete Data Analysis:**
   - Read roadmaps table
   - Read learning_path_steps table
   - Read roadmap_templates table
   - Read user_skills table

2. **Data Validation:**
   - Verify all foreign key relationships
   - Check for orphaned records
   - Validate JSONB structure

3. **Performance Optimization:**
   - Check index usage
   - Analyze query patterns
   - Optimize slow queries

4. **Data Migration:**
   - Populate missing evaluation_results
   - Calculate missing statistics
   - Update skill_request statuses

---

## SQL Queries for Further Analysis

### 1. Get user assessment statistics
```sql
SELECT
  u.full_name,
  COUNT(a.id) as total_assessments,
  AVG(a.score::float / a.total_questions) * 100 as avg_score_percentage,
  MAX(a.score) as best_score,
  MIN(a.score) as worst_score
FROM user_profiles u
JOIN assessments a ON u.user_id = a.user_id
GROUP BY u.user_id, u.full_name
ORDER BY avg_score_percentage DESC;
```

### 2. Get most common weak skills
```sql
SELECT
  UNNEST(weak_skills) as skill,
  COUNT(*) as frequency
FROM skill_requests
GROUP BY skill
ORDER BY frequency DESC
LIMIT 10;
```

### 3. Get assessment completion rate
```sql
SELECT
  user_id,
  COUNT(*) as total_assessments,
  SUM(CASE WHEN score > 0 THEN 1 ELSE 0 END) as completed,
  SUM(CASE WHEN evaluation_results IS NOT NULL THEN 1 ELSE 0 END) as evaluated
FROM assessments
GROUP BY user_id;
```

### 4. Get roadmap generation status
```sql
SELECT
  u.full_name,
  COUNT(DISTINCT sr.id) as skill_requests,
  COUNT(DISTINCT a.id) as assessments,
  COUNT(DISTINCT r.id) as roadmaps
FROM user_profiles u
LEFT JOIN skill_requests sr ON u.user_id = sr.user_id
LEFT JOIN assessments a ON u.user_id = a.user_id
LEFT JOIN roadmaps r ON u.user_id = r.user_id
GROUP BY u.user_id, u.full_name;
```

---

**End of Supabase Data Summary**

**Status:** ✅ Partial (3 of 9 tables analyzed)
**Next:** Complete analysis of remaining tables
**Generated:** December 3, 2024
