# Roadmap Generation API - Examples

## Endpoint

```
POST /api/generate-roadmap-v2
```

## Schema Version

**v1.0 - LOCKED**

---

## Example 1: Machine Learning Engineer

### Request Body

```json
{
  "job_role": "Machine Learning Engineer",
  "current_skills": ["Python", "Statistics", "SQL"],
  "strong_skills": ["Python", "Data Analysis"],
  "weak_skills": ["Deep Learning", "MLOps", "TensorFlow"],
  "assessment": {
    "overall_score": 0.493,
    "accuracy_per_skill": {
      "Python": 0.85,
      "Data Analysis": 0.45,
      "Statistics": 0.72,
      "SQL": 0.68,
      "Deep Learning": 0.30,
      "MLOps": 0.20,
      "TensorFlow": 0.25
    },
    "correct_answers": 34,
    "wrong_answers": 35
  },
  "duration": "6 months",
  "weekly_hours": 12,
  "llm_provider": "openai",
  "llm_model": "gpt-4o-mini"
}
```

### Expected Response Structure

```json
{
  "success": true,
  "roadmap": {
    "user_profile_summary": {
      "job_role": "Machine Learning Engineer",
      "verified_strengths": ["Python"],
      "areas_to_improve": ["Statistics", "SQL"],
      "critical_gaps": ["Data Analysis", "Deep Learning", "MLOps", "TensorFlow"],
      "assessment_overall_score": 49.3,
      "roadmap_duration": "6 months",
      "estimated_weekly_hours": 12,
      "total_estimated_hours": 288
    },
    "skill_analysis": {
      "skills_validated": [
        {
          "skill_name": "Python",
          "claimed_level": "strong",
          "assessed_accuracy": 0.85,
          "correct_answers": 17,
          "wrong_answers": 3,
          "validation_status": "VERIFIED",
          "assigned_track": "REINFORCE",
          "agent_note": "Excellent proficiency demonstrated. Focus on production-level optimization."
        },
        {
          "skill_name": "Data Analysis",
          "claimed_level": "strong",
          "assessed_accuracy": 0.45,
          "correct_answers": 9,
          "wrong_answers": 11,
          "validation_status": "OVERSTATED",
          "assigned_track": "BUILD",
          "agent_note": "Assessment indicates opportunities for foundational strengthening in data manipulation and analysis techniques."
        }
      ]
    },
    "roadmap": {
      "build_skills": {
        "track_name": "Build Foundation",
        "track_description": "Critical skill gaps requiring comprehensive learning from fundamentals",
        "priority": "HIGH",
        "estimated_duration": "16 weeks",
        "total_estimated_hours": 168,
        "modules": [ /* 3-5 modules */ ]
      },
      "improve_skills": {
        "track_name": "Improve & Strengthen",
        "track_description": "Skills with solid foundation needing depth",
        "priority": "MEDIUM",
        "estimated_duration": "8 weeks",
        "total_estimated_hours": 72,
        "modules": [ /* 2-3 modules */ ]
      },
      "reinforce_skills": {
        "track_name": "Reinforce & Specialize",
        "track_description": "Verified strengths to optimize",
        "priority": "LOW",
        "estimated_duration": "4 weeks",
        "total_estimated_hours": 48,
        "modules": [ /* 1-2 modules */ ]
      }
    },
    "learning_path_summary": { /* ... */ },
    "ui_navigation": { /* ... */ },
    "metadata": {
      "roadmap_id": "machine-learning-engineer-6mon-a3f2b1c9",
      "generated_at": "2025-01-15T14:23:45.123Z",
      "generated_by": "llm-direct",
      "llm_provider": "openai",
      "model_used": "gpt-4o-mini",
      "generation_time_seconds": 8.42,
      "prompt_tokens": 3420,
      "completion_tokens": 8500,
      "version": "1.0",
      "last_updated": "2025-01-15T14:23:45.123Z"
    }
  }
}
```

---

## Example 2: Data Scientist (Using Groq)

### Request Body

```json
{
  "job_role": "Data Scientist",
  "current_skills": ["Python", "Statistics", "Pandas", "NumPy"],
  "strong_skills": ["Python", "Statistics", "Pandas"],
  "weak_skills": ["Machine Learning", "Deep Learning", "Big Data"],
  "assessment": {
    "overall_score": 0.65,
    "accuracy_per_skill": {
      "Python": 0.90,
      "Statistics": 0.78,
      "Pandas": 0.82,
      "NumPy": 0.75,
      "Machine Learning": 0.45,
      "Deep Learning": 0.30,
      "Big Data": 0.25
    },
    "correct_answers": 39,
    "wrong_answers": 21
  },
  "duration": "4 months",
  "weekly_hours": 15,
  "llm_provider": "groq",
  "llm_model": "llama-3.1-70b-versatile"
}
```

### Expected Tracks

**BUILD Track:**
- Machine Learning Fundamentals
- Deep Learning Basics
- Big Data Introduction

**IMPROVE Track:**
- Advanced Statistics for ML
- NumPy Optimization

**REINFORCE Track:**
- Production Python for Data Science
- Advanced Pandas Techniques

---

## Example 3: Backend Engineer Transitioning to Full-Stack

### Request Body

```json
{
  "job_role": "Full-Stack Engineer",
  "current_skills": ["Node.js", "Express", "PostgreSQL", "REST APIs"],
  "strong_skills": ["Node.js", "Express"],
  "weak_skills": ["React", "TypeScript", "Frontend Architecture", "State Management"],
  "assessment": {
    "overall_score": 0.58,
    "accuracy_per_skill": {
      "Node.js": 0.88,
      "Express": 0.85,
      "PostgreSQL": 0.72,
      "REST APIs": 0.80,
      "React": 0.35,
      "TypeScript": 0.42,
      "Frontend Architecture": 0.28,
      "State Management": 0.20
    },
    "correct_answers": 35,
    "wrong_answers": 25
  },
  "duration": "3 months",
  "weekly_hours": 10
}
```

### Expected Tracks

**BUILD Track:**
- React Fundamentals
- TypeScript Basics
- Frontend Architecture Principles
- State Management with Redux/Context

**IMPROVE Track:**
- Advanced PostgreSQL Optimization
- REST API Best Practices

**REINFORCE Track:**
- Production Node.js Patterns
- Express.js Advanced Features

---

## Error Responses

### Validation Error (400)

```json
{
  "success": false,
  "error": "Invalid request body",
  "details": [
    "job_role is required and must be a string",
    "assessment.accuracy_per_skill is required and must be an object"
  ]
}
```

### Roadmap Validation Failed (500)

```json
{
  "success": false,
  "error": "Generated roadmap failed validation",
  "validation_errors": [
    "roadmap.build_skills hour mismatch: declared 170h, calculated 168h",
    "Sidebar module 3 name mismatch: roadmap=\"Deep Learning\", sidebar=\"DL Basics\""
  ],
  "validation_warnings": [
    "roadmap.build_skills.modules[2].recommended_videos exceeds max of 3"
  ]
}
```

### LLM API Error (500)

```json
{
  "success": false,
  "error": "OpenAI API error: Rate limit exceeded"
}
```

---

## cURL Examples

### Basic Request (OpenAI)

```bash
curl -X POST http://localhost:3000/api/generate-roadmap-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "job_role": "Machine Learning Engineer",
    "current_skills": ["Python", "Statistics"],
    "strong_skills": ["Python"],
    "weak_skills": ["Deep Learning", "MLOps"],
    "assessment": {
      "overall_score": 0.65,
      "accuracy_per_skill": {
        "Python": 0.85,
        "Deep Learning": 0.30
      },
      "correct_answers": 13,
      "wrong_answers": 7
    }
  }'
```

### Using Groq for Faster Generation

```bash
curl -X POST http://localhost:3000/api/generate-roadmap-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "job_role": "Data Scientist",
    "current_skills": ["Python", "Pandas"],
    "strong_skills": ["Python"],
    "weak_skills": ["Machine Learning"],
    "assessment": {
      "overall_score": 0.70,
      "accuracy_per_skill": {
        "Python": 0.90,
        "Machine Learning": 0.40
      },
      "correct_answers": 14,
      "wrong_answers": 6
    },
    "llm_provider": "groq",
    "llm_model": "llama-3.1-70b-versatile"
  }'
```

---

## Response Time Expectations

| Provider | Model | Typical Response Time |
|----------|-------|----------------------|
| OpenAI | gpt-4o-mini | 5-10 seconds |
| OpenAI | gpt-4o | 8-15 seconds |
| Groq | llama-3.1-70b-versatile | 2-4 seconds |
| Groq | llama-3.1-8b-instant | 1-2 seconds |

---

## Validation Guarantees

The endpoint validates:
- ✅ Hour consistency (topics → modules → tracks → total)
- ✅ Module numbering is sequential (1, 2, 3, ...)
- ✅ Sidebar matches roadmap modules exactly
- ✅ No YouTube URLs (only search queries)
- ✅ Max 3 videos per topic
- ✅ All required fields present
- ✅ Metadata timestamps are ISO 8601

If validation fails, the endpoint returns **500 error** with detailed validation errors.

**The roadmap is NOT returned unless validation passes.**
