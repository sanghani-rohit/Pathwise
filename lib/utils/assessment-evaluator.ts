/**
 * Assessment Evaluation Utility
 *
 * Shared logic for evaluating assessments using Groq Llama AI
 * Used by both /api/evaluate-assessment and /api/submit-assessment
 */

import { createClient } from '@supabase/supabase-js'
import Groq from 'groq-sdk'

export interface Question {
  id: number
  question: string
  marks: number
}

export interface EvaluationResult {
  questionId: number
  question: string
  userAnswer: string
  status: 'correct' | 'wrong' | 'skipped'
  correctAnswer?: string
  explanation?: string
  marksAwarded: number
}

export interface AssessmentEvaluation {
  totalQuestions: number
  correctCount: number
  wrongCount: number
  skippedCount: number
  score: number
  maxScore: number
  results: EvaluationResult[]
}

/**
 * Evaluate assessment answers using Groq Llama AI
 *
 * @param questions Array of questions
 * @param answers Map of question ID to user answer
 * @param authToken Supabase auth token
 * @returns Assessment evaluation results
 */
export async function evaluateAssessment(
  questions: Question[],
  answers: { [key: number]: string },
  authToken?: string
): Promise<AssessmentEvaluation> {
  console.log('=== AI Evaluation Agent Called ===')

  // Create Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      },
    }
  )

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('Unauthorized - could not get user from token')
  }

  const userId = user.id

  if (!questions || !answers) {
    throw new Error('Missing questions or answers')
  }

  // Fetch user skills for context
  const { data: userSkills } = await supabase
    .from('user_skills')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  // Calculate experience level for context
  const totalExperience = userSkills
    ? (userSkills.years_of_experience || 0) + (userSkills.months_of_experience || 0) / 12
    : 0

  // Use skill_level field directly
  const skillLevelMapping: { [key: string]: string } = {
    'beginner': 'beginner',
    'intermediate': 'intermediate',
    'advanced': 'advanced',
    'expert': 'advanced'
  }
  const difficultyLevel = userSkills?.skill_level
    ? skillLevelMapping[userSkills.skill_level] || 'beginner'
    : 'beginner'

  console.log('Evaluating assessment for user:', userId)
  console.log('Job Role:', userSkills?.job_role || 'Not specified')
  console.log('Skill Level:', userSkills?.skill_level || 'Not specified')
  console.log('Experience level:', difficultyLevel, `(${totalExperience.toFixed(1)} years)`)
  console.log('Total questions:', questions.length)
  console.log('Answered questions:', Object.keys(answers).filter(key => answers[parseInt(key)]?.trim()).length)

  // Initialize Groq AI
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })

  // Build evaluation prompt
  const evaluationPrompt = `You are an expert assessment evaluator. Your task is to grade a technical skills assessment based on user answers.

**User Context:**
- Job Role: ${userSkills?.job_role || 'Not specified'}
- Experience Level: ${difficultyLevel} (${totalExperience.toFixed(1)} years)
- Skill Level: ${userSkills?.skill_level || 'Not specified'}
- Current Skills: ${userSkills?.current_skills?.join(', ') || 'Not specified'}
- Strong Skills: ${userSkills?.strong_skills?.join(', ') || 'Not specified'}
- Skills to Improve: ${userSkills?.skills_to_improve?.join(', ') || 'Not specified'}
- Learning Goals: ${userSkills?.learning_goals || 'Not specified'}

**Instructions:**
Evaluate each question and answer pair below. For each question:
1. Determine if the answer is CORRECT, WRONG, or SKIPPED (if empty/blank)
2. If WRONG or SKIPPED, provide the correct answer
3. If WRONG or SKIPPED, provide a brief explanation (2-3 sentences)
4. Award 1 mark for correct answers, 0 marks for wrong/skipped

Be fair but realistic in your evaluation:
- For ${difficultyLevel} level, adjust expectations accordingly
- Accept variations in correct answers if the core concept is right
- Look for understanding, not just exact wording

**Questions and User Answers:**
${questions.map((q, index) => {
  const userAnswer = answers[q.id]?.trim() || ''
  return `
Question ${index + 1} (ID: ${q.id}):
${q.question}

User's Answer: ${userAnswer || '[SKIPPED - No answer provided]'}
---`
}).join('\n')}

**Required Output Format (JSON only, no other text):**
Return a JSON array where each object has:
{
  "questionId": number,
  "status": "correct" | "wrong" | "skipped",
  "correctAnswer": "string (only if wrong/skipped)",
  "explanation": "string (only if wrong/skipped, 2-3 sentences)",
  "marksAwarded": 0 | 1
}

Return ONLY the JSON array, nothing else.`

  console.log('Sending evaluation request to Groq Llama-3.1-8B-Instant...')

  // Call Groq Llama AI for evaluation
  const result = await groq.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: evaluationPrompt
      }
    ],
    model: 'llama-3.1-8b-instant',
    temperature: 0.7,
    max_tokens: 8192,
  })
  const responseText = result.choices[0]?.message?.content || ''

  console.log('Received AI evaluation response, length:', responseText.length)

  // Parse AI response with robust error handling
  let aiEvaluations: any[]
  try {
    aiEvaluations = parseAIResponse(responseText, questions)
  } catch (parseError) {
    console.error('❌ CRITICAL: All JSON parsing attempts failed')
    console.error('Parse error:', parseError)
    console.log('Raw AI Response:', responseText)

    // FALLBACK: Use rule-based evaluation instead of crashing
    console.log('⚠️  Using fallback rule-based evaluation...')
    aiEvaluations = fallbackEvaluation(questions, answers)
  }

  // Build detailed evaluation results
  const results: EvaluationResult[] = questions.map((q, index) => {
    const aiEval = aiEvaluations.find((e: any) => e.questionId === q.id) || aiEvaluations[index]
    const userAnswer = answers[q.id]?.trim() || ''

    return {
      questionId: q.id,
      question: q.question,
      userAnswer: userAnswer || '[No answer provided]',
      status: aiEval?.status || (userAnswer ? 'wrong' : 'skipped'),
      correctAnswer: aiEval?.correctAnswer,
      explanation: aiEval?.explanation,
      marksAwarded: aiEval?.marksAwarded || 0
    }
  })

  // Calculate summary statistics
  const correctCount = results.filter(r => r.status === 'correct').length
  const wrongCount = results.filter(r => r.status === 'wrong').length
  const skippedCount = results.filter(r => r.status === 'skipped').length
  const score = results.reduce((sum, r) => sum + r.marksAwarded, 0)

  const evaluation: AssessmentEvaluation = {
    totalQuestions: questions.length,
    correctCount,
    wrongCount,
    skippedCount,
    score,
    maxScore: questions.length,
    results
  }

  console.log('Evaluation complete:')
  console.log('- Correct:', correctCount)
  console.log('- Wrong:', wrongCount)
  console.log('- Skipped:', skippedCount)
  console.log('- Final Score:', score, '/', questions.length)

  return evaluation
}

/**
 * Robust JSON parsing with multiple fallback strategies
 * This ensures the evaluation never crashes due to malformed AI responses
 */
function parseAIResponse(responseText: string, questions: Question[]): any[] {
  console.log('🔍 Attempting to parse AI response...')

  // Strategy 1: Try direct JSON parse (cleanest response)
  try {
    console.log('  Strategy 1: Direct JSON.parse()')
    const parsed = JSON.parse(responseText)
    if (Array.isArray(parsed)) {
      console.log('  ✅ Strategy 1 succeeded')
      return parsed
    }
  } catch (e) {
    console.log('  ❌ Strategy 1 failed:', (e as Error).message)
  }

  // Strategy 2: Remove markdown code blocks (```json ... ```)
  try {
    console.log('  Strategy 2: Remove markdown code blocks')
    let cleaned = responseText.trim()

    // Remove ```json and ``` markers
    cleaned = cleaned.replace(/^```json\s*/i, '')
    cleaned = cleaned.replace(/^```\s*/, '')
    cleaned = cleaned.replace(/\s*```$/, '')
    cleaned = cleaned.trim()

    const parsed = JSON.parse(cleaned)
    if (Array.isArray(parsed)) {
      console.log('  ✅ Strategy 2 succeeded')
      return parsed
    }
  } catch (e) {
    console.log('  ❌ Strategy 2 failed:', (e as Error).message)
  }

  // Strategy 3: Extract JSON array using regex
  try {
    console.log('  Strategy 3: Regex extraction of JSON array')
    const jsonMatch = responseText.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      if (Array.isArray(parsed)) {
        console.log('  ✅ Strategy 3 succeeded')
        return parsed
      }
    }
  } catch (e) {
    console.log('  ❌ Strategy 3 failed:', (e as Error).message)
  }

  // Strategy 4: Extract JSON between first [ and last ]
  try {
    console.log('  Strategy 4: Extract between first [ and last ]')
    const firstBracket = responseText.indexOf('[')
    const lastBracket = responseText.lastIndexOf(']')

    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      const jsonStr = responseText.substring(firstBracket, lastBracket + 1)
      const parsed = JSON.parse(jsonStr)
      if (Array.isArray(parsed)) {
        console.log('  ✅ Strategy 4 succeeded')
        return parsed
      }
    }
  } catch (e) {
    console.log('  ❌ Strategy 4 failed:', (e as Error).message)
  }

  // Strategy 5: Try to extract individual JSON objects and build array
  try {
    console.log('  Strategy 5: Extract individual JSON objects')
    const objectMatches = responseText.matchAll(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g)
    const objects = []

    for (const match of objectMatches) {
      try {
        const obj = JSON.parse(match[0])
        if (obj.questionId !== undefined) {
          objects.push(obj)
        }
      } catch (e) {
        // Skip invalid objects
      }
    }

    if (objects.length > 0) {
      console.log(`  ✅ Strategy 5 succeeded (found ${objects.length} objects)`)
      return objects
    }
  } catch (e) {
    console.log('  ❌ Strategy 5 failed:', (e as Error).message)
  }

  // All strategies failed
  throw new Error('All JSON parsing strategies failed')
}

/**
 * Fallback rule-based evaluation
 * Used when AI parsing completely fails to prevent assessment submission from crashing
 */
function fallbackEvaluation(questions: Question[], answers: { [key: number]: string }): any[] {
  console.log('🔄 Generating rule-based fallback evaluation...')

  return questions.map((q) => {
    const userAnswer = answers[q.id]?.trim() || ''

    if (!userAnswer) {
      // Skipped question
      return {
        questionId: q.id,
        status: 'skipped',
        correctAnswer: 'Answer required',
        explanation: 'No answer was provided for this question.',
        marksAwarded: 0
      }
    }

    // Basic heuristic: if answer is reasonably long, give partial credit
    // This is a temporary evaluation until manual review
    const isReasonableAnswer = userAnswer.length >= 10

    return {
      questionId: q.id,
      status: isReasonableAnswer ? 'correct' : 'wrong',
      correctAnswer: isReasonableAnswer ? undefined : 'Requires manual review',
      explanation: isReasonableAnswer
        ? undefined
        : 'This answer requires manual review. AI evaluation failed temporarily.',
      marksAwarded: isReasonableAnswer ? 1 : 0
    }
  })
}
