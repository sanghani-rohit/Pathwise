# Gemini API Token Usage Analysis - PathWise Assessment System

## Overview
This document estimates the token usage for the two main AI operations in the PathWise assessment system.

---

## 1. Generate Pre-Assessment (30 Questions)

### Input Tokens Breakdown

**Fixed Prompt Components:**
- System instruction: ~100 tokens
- Instructions (6 numbered points): ~120 tokens
- Format specification & example: ~80 tokens
- Subtotal: **~300 tokens**

**Dynamic User Data:**
- Experience level: "intermediate (1.5 years)" → ~10 tokens
- Current skills list: "Python, Pandas, NumPy, Scikit-learn, TensorFlow, Statistics, Machine Learning, Jupyter, Data Visualization" → ~30-50 tokens
- Weak skills list: "LangChain, n8n, Supabase, CrewAI, Communication" → ~20-30 tokens
- Target skill: "Agentic AI" → ~5 tokens
- Subtotal: **~65-95 tokens**

**Total Input Tokens: ~365-395 tokens**
**Average: ~380 tokens**

---

### Output Tokens Breakdown

**Expected Response:**
```json
[
  {"id": 1, "question": "What is the primary purpose of LangChain in AI development?", "marks": 1},
  {"id": 2, "question": "Explain the role of agents in CrewAI framework.", "marks": 1},
  ...
  {"id": 30, "question": "...", "marks": 1}
]
```

**Per Question:**
- JSON structure: `{"id": X, "question": "...", "marks": 1}` → ~15 tokens overhead
- Question text: Average 15-25 words → ~20-35 tokens
- Per question total: **~35-50 tokens**

**Total for 30 Questions: 30 × 42 (average) = ~1,260 tokens**

---

### Generate Assessment Total:
| Type | Tokens |
|------|--------|
| **Input** | ~380 tokens |
| **Output** | ~1,260 tokens |
| **Total per assessment** | **~1,640 tokens** |

---

## 2. Evaluate Assessment (Grade Wrong Answers)

### Input Tokens Breakdown

**Fixed Prompt Components:**
- System instruction: ~80 tokens
- Evaluation instructions (4 points): ~100 tokens
- Grading criteria: ~80 tokens
- Output format specification: ~60 tokens
- Subtotal: **~320 tokens**

**Dynamic User Context:**
- Experience level: ~10 tokens
- Current skills: ~30-50 tokens
- Target skills: ~5-10 tokens
- Subtotal: **~45-70 tokens**

**Questions & Answers (30 Q&A pairs):**

Per Q&A pair:
```
Question 1 (ID: 1):
What is the primary purpose of LangChain in AI development?

User's Answer: LangChain is used for building applications with large language models by providing chains and agents.
---
```

- Question text: ~20-35 tokens
- User answer: **~20-150 tokens** (varies significantly)
  - Skipped: 0-5 tokens "[SKIPPED - No answer provided]"
  - Short answer: ~20-40 tokens
  - Medium answer: ~40-80 tokens
  - Long answer: ~80-150 tokens
- Formatting overhead: ~15 tokens
- **Per Q&A: ~55-200 tokens**

**Total for 30 Q&A pairs:**
- Minimum (all skipped): 30 × 55 = **1,650 tokens**
- Average (mix of answers): 30 × 110 = **3,300 tokens**
- Maximum (all detailed): 30 × 200 = **6,000 tokens**

**Total Input Tokens:**
- Minimum: 320 + 60 + 1,650 = **~2,030 tokens**
- Average: 320 + 60 + 3,300 = **~3,680 tokens**
- Maximum: 320 + 60 + 6,000 = **~6,380 tokens**

---

### Output Tokens Breakdown

**Expected Response (30 evaluation results):**
```json
[
  {
    "questionId": 1,
    "status": "correct",
    "marksAwarded": 1
  },
  {
    "questionId": 2,
    "status": "wrong",
    "correctAnswer": "CrewAI is a framework for building multi-agent systems where AI agents collaborate to solve complex tasks through role-based assignments and structured workflows.",
    "explanation": "Your answer mentioned agents but missed the key concept of multi-agent collaboration and role-based task distribution, which is the core feature of CrewAI.",
    "marksAwarded": 0
  },
  ...
]
```

**Per Evaluation Result:**

For **Correct answers** (~10-15 questions):
```json
{"questionId": X, "status": "correct", "marksAwarded": 1}
```
- **~15 tokens per correct answer**

For **Wrong/Skipped answers** (~15-20 questions):
```json
{
  "questionId": X,
  "status": "wrong",
  "correctAnswer": "30-50 word explanation",
  "explanation": "50-80 word detailed explanation with feedback",
  "marksAwarded": 0
}
```
- Correct answer: ~40-70 tokens
- Explanation: ~70-110 tokens
- Structure overhead: ~20 tokens
- **~130-200 tokens per wrong/skipped**

**Total Output Tokens:**
- Scenario 1 (High score - 20 correct, 10 wrong):
  - 20 × 15 + 10 × 165 = 300 + 1,650 = **~1,950 tokens**
- Scenario 2 (Average - 15 correct, 15 wrong):
  - 15 × 15 + 15 × 165 = 225 + 2,475 = **~2,700 tokens**
- Scenario 3 (Low score - 10 correct, 20 wrong):
  - 10 × 15 + 20 × 165 = 150 + 3,300 = **~3,450 tokens**

---

### Evaluate Assessment Total:
| Scenario | Input | Output | Total |
|----------|-------|--------|-------|
| **Minimum (High score)** | 2,030 | 1,950 | **~3,980 tokens** |
| **Average (Medium score)** | 3,680 | 2,700 | **~6,380 tokens** |
| **Maximum (Low score)** | 6,380 | 3,450 | **~9,830 tokens** |

---

## Summary Table

| Operation | Input Tokens | Output Tokens | Total Tokens |
|-----------|--------------|---------------|--------------|
| **Generate Pre-Assessment** | ~380 | ~1,260 | **~1,640** |
| **Evaluate Assessment (Avg)** | ~3,680 | ~2,700 | **~6,380** |
| **Total per User Journey** | ~4,060 | ~3,960 | **~8,020 tokens** |

---

## Cost Estimation (Gemini 2.5 Flash Pricing)

**Gemini 2.5 Flash Pricing (as of 2024):**
- Input: $0.075 per 1M tokens
- Output: $0.30 per 1M tokens

### Per User Assessment:
- **Generate Assessment:**
  - Input: 380 tokens × $0.075/1M = $0.0000285
  - Output: 1,260 tokens × $0.30/1M = $0.000378
  - Subtotal: **$0.0004065 (~$0.0004)**

- **Evaluate Assessment:**
  - Input: 3,680 tokens × $0.075/1M = $0.000276
  - Output: 2,700 tokens × $0.30/1M = $0.00081
  - Subtotal: **$0.001086 (~$0.0011)**

### Total Cost per Complete Assessment:
**~$0.0015 (0.15 cents per user)**

### Scaling Estimates:
- **100 users/month:** ~$0.15
- **1,000 users/month:** ~$1.50
- **10,000 users/month:** ~$15.00
- **100,000 users/month:** ~$150.00

---

## Optimization Opportunities

### Reduce Input Tokens:
1. **Compress skill lists** - Use abbreviations or skill IDs instead of full names
2. **Remove redundant instructions** - Streamline prompt formatting
3. **Cache static prompts** - Use Gemini's context caching (if available)

### Reduce Output Tokens:
1. **Shorter explanations** - Request 1-2 sentences instead of 2-3
2. **Abbreviate status** - Use "C", "W", "S" instead of "correct", "wrong", "skipped"
3. **Conditional explanations** - Only provide explanations for wrong answers, not skipped

### Potential Savings:
With optimizations, could reduce by **~30-40%**:
- Generate: 1,640 → ~1,000 tokens
- Evaluate: 6,380 → ~4,000 tokens
- **New total: ~5,000 tokens per user** (38% reduction)

---

## Notes

1. Token counts are **approximations** based on OpenAI's tokenizer, which is similar to Google's
2. Actual token usage may vary by ±10-15% depending on:
   - Question complexity
   - Answer length variation
   - Skill list sizes
3. Gemini 2.5 Flash has a **1M token context window**, so these prompts are well within limits
4. With retry logic (3 attempts), multiply costs by 1.5-2x in worst-case scenarios
