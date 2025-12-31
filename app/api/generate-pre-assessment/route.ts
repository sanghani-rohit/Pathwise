// Enhanced with detailed error logging - v4 (Using Groq Llama-3.1-8B-Instant)
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Groq from 'groq-sdk'
import {
  calculateQuestionRatio,
  generateDistributionDescription,
  getQuestionTypeExamples,
  type UserContext
} from '@/lib/questionRatioCalculator'

export async function POST(request: NextRequest) {
  console.log('=== Generate Pre-Assessment API Called (Groq Llama 3.1-8B-Instant) ===')
  try {
    // Get auth token from headers
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    console.log('Auth header present:', !!authHeader)

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      }
    )

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id

    // Fetch user data from NEW user_skills table
    const { data: userSkills, error: skillsError } = await supabase
      .from('user_skills')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (skillsError) {
      console.error('Error fetching user skills:', skillsError)
      return NextResponse.json(
        { error: 'Failed to fetch user skills data' },
        { status: 500 }
      )
    }

    // Check if user has completed the skill upgrade form
    if (!userSkills) {
      console.log('No user skills found for user:', userId)
      return NextResponse.json(
        { error: 'Please complete the skill upgrade form first before generating an assessment' },
        { status: 400 }
      )
    }

    // Calculate total experience from new table
    const totalExperience =
      (userSkills.years_of_experience || 0) +
      (userSkills.months_of_experience || 0) / 12

    // Determine difficulty level based on skill_level field
    const skillLevelMapping: { [key: string]: string } = {
      'beginner': 'beginner',
      'intermediate': 'intermediate',
      'advanced': 'advanced',
      'expert': 'advanced'
    }
    const difficultyLevel = skillLevelMapping[userSkills.skill_level] || 'beginner'

    // Prepare skills data from new schema
    const currentSkills = userSkills.current_skills || []
    const strongSkills = userSkills.strong_skills || []
    const weakSkills = userSkills.skills_to_improve || []
    const learningGoals = userSkills.learning_goals || ''
    const jobRole = userSkills.job_role || ''

    console.log('=== User Skills Data ===')
    console.log('Job Role:', jobRole)
    console.log('Experience:', `${userSkills.years_of_experience}y ${userSkills.months_of_experience}m`)
    console.log('Skill Level:', userSkills.skill_level)
    console.log('Current Skills:', currentSkills)
    console.log('Strong Skills:', strongSkills)
    console.log('Weak Skills:', weakSkills)
    console.log('Learning Goals:', learningGoals)

    // Initialize Groq AI - using Llama-3.1-8B-Instant
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })

    // Retry helper function with exponential backoff
    async function retryWithBackoff<T>(
      fn: () => Promise<T>,
      maxRetries: number = 3,
      baseDelay: number = 1000
    ): Promise<T> {
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          return await fn()
        } catch (error: any) {
          const isLastAttempt = attempt === maxRetries - 1

          // Check if error is retryable (503, 429, network errors)
          const isRetryable =
            error.message?.includes('503') ||
            error.message?.includes('429') ||
            error.message?.includes('overloaded') ||
            error.message?.includes('rate limit')

          if (!isRetryable || isLastAttempt) {
            throw error
          }

          // Exponential backoff: 1s, 2s, 4s
          const delay = baseDelay * Math.pow(2, attempt)
          console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
      throw new Error('Max retries reached')
    }

    // Create 10-10-10 distribution prompt (10 current, 10 strong, 10 weak)
    const prompt = `You are an expert technical skills assessment creator. Generate exactly 30 assessment questions following a specific distribution based on the user's skill profile.

**USER PROFILE:**
- Job Role: ${jobRole}
- Experience: ${userSkills.years_of_experience} years, ${userSkills.months_of_experience} months
- Skill Level: ${userSkills.skill_level.toUpperCase()}
- Learning Goals: ${learningGoals}

**SKILLS DATA:**
- Current Skills: ${currentSkills.join(', ') || 'None specified'}
- Strong Skills: ${strongSkills.join(', ') || 'None specified'}
- Skills to Improve (Weak): ${weakSkills.join(', ') || 'None specified'}

**CRITICAL REQUIREMENT - 10-10-10 DISTRIBUTION:**
You MUST generate EXACTLY 30 questions with this EXACT distribution:

1. **Questions 1-10 (Current Skills):** 10 questions based on CURRENT SKILLS
   - Focus on: ${currentSkills.slice(0, 5).join(', ') || 'general skills'}
   - Test understanding and practical application
   - Difficulty: ${difficultyLevel}

2. **Questions 11-20 (Strong Skills):** 10 questions based on STRONG SKILLS
   - Focus on: ${strongSkills.slice(0, 5).join(', ') || 'general skills'}
   - Test advanced knowledge and best practices
   - Difficulty: ${difficultyLevel} to advanced

3. **Questions 21-30 (Weak Skills):** 10 questions based on SKILLS TO IMPROVE
   - Focus on: ${weakSkills.slice(0, 5).join(', ') || 'general skills'}
   - Test foundational concepts and common pitfalls
   - Difficulty: ${difficultyLevel}

**QUESTION TYPES:**
Mix these types across all categories:
- **Theory/Conceptual:** Definitions, explanations, comparisons, principles
- **Practical/Code:** Code output prediction, debugging, syntax, small snippets
- **Scenario-based:** Real-world application, problem-solving, best practices

**QUESTION GUIDELINES:**
1. Keep questions concise (2-3 lines maximum)
2. For code questions: Use SHORT snippets (max 3-4 lines)
3. Align difficulty with user's experience level: ${userSkills.skill_level}
4. Make questions relevant to ${jobRole} context
5. Each question worth 1 mark
6. Questions should be objective and have clear answers

**EXAMPLE QUESTIONS:**

Current Skills Example:
{"id": 5, "category": "current_skills", "skill": "${currentSkills[0] || 'JavaScript'}", "question": "What is the difference between let and const in ${currentSkills[0] || 'JavaScript'}?", "marks": 1}

Strong Skills Example:
{"id": 15, "category": "strong_skills", "skill": "${strongSkills[0] || 'Python'}", "question": "Explain the concept of decorators in ${strongSkills[0] || 'Python'} and when to use them.", "marks": 1}

Weak Skills Example:
{"id": 25, "category": "weak_skills", "skill": "${weakSkills[0] || 'React'}", "question": "What is the purpose of useState hook in ${weakSkills[0] || 'React'}?", "marks": 1}

**OUTPUT FORMAT:**
Return ONLY a valid JSON array with exactly 30 questions in this structure:

[
  {"id": 1, "category": "current_skills", "skill": "SkillName", "question": "Question text here?", "marks": 1},
  {"id": 2, "category": "current_skills", "skill": "SkillName", "question": "Question text here?", "marks": 1},
  ...
  {"id": 10, "category": "current_skills", "skill": "SkillName", "question": "Question text here?", "marks": 1},
  {"id": 11, "category": "strong_skills", "skill": "SkillName", "question": "Question text here?", "marks": 1},
  ...
  {"id": 20, "category": "strong_skills", "skill": "SkillName", "question": "Question text here?", "marks": 1},
  {"id": 21, "category": "weak_skills", "skill": "SkillName", "question": "Question text here?", "marks": 1},
  ...
  {"id": 30, "category": "weak_skills", "skill": "SkillName", "question": "Question text here?", "marks": 1}
]

**IMPORTANT:**
- Return ONLY the JSON array, no additional text
- Ensure exactly 30 questions
- Follow the 10-10-10 distribution strictly
- Include "category" and "skill" fields for each question`

    // Generate questions
    console.log('=== Starting Groq Llama AI Generation ===')
    console.log('User ID:', userId)
    console.log('Difficulty Level:', difficultyLevel)
    console.log('Total Experience:', totalExperience.toFixed(1))
    console.log('Distribution: 10 Current + 10 Strong + 10 Weak = 30 total')
    console.log('Prompt length:', prompt.length)

    let responseText: string
    try {
      // Use Llama-3.1-8B-Instant with retry logic (Groq API)
      console.log('Calling Llama-3.1-8B-Instant API with retry logic...')
      const result = await retryWithBackoff(async () => {
        console.log('Attempting Llama-3.1-8B-Instant API call...')
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          model: 'llama-3.1-8b-instant',
          temperature: 0.7,
          max_tokens: 8192,
        })
        return chatCompletion
      }, 3, 2000) // 3 retries with 2s base delay

      console.log('Groq API call completed, getting response...')
      responseText = result.choices[0]?.message?.content || ''
      console.log('Received response from Groq, length:', responseText.length)
    } catch (groqError: any) {
      console.error('=== GROQ API ERROR (All attempts failed) ===')
      console.error('Error name:', groqError.name)
      console.error('Error message:', groqError.message)
      console.error('Error stack:', groqError.stack)

      // User-friendly error messages
      let userMessage = 'Unable to generate assessment questions at this moment.'
      if (groqError.message?.includes('overloaded') || groqError.message?.includes('503')) {
        userMessage = 'The AI service is currently experiencing high demand. Please try again in a few minutes.'
      } else if (groqError.message?.includes('rate limit') || groqError.message?.includes('429')) {
        userMessage = 'Rate limit reached. Please wait a moment and try again.'
      } else if (groqError.message?.includes('API key')) {
        userMessage = 'API configuration error. Please contact support.'
      }

      return NextResponse.json(
        {
          error: userMessage,
          technicalDetails: `${groqError.message || 'Unknown error'}`,
          retryable: groqError.message?.includes('503') || groqError.message?.includes('429')
        },
        { status: 503 } // Use 503 for service unavailable
      )
    }

    // Parse JSON response
    let questions
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = responseText.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0])
      } else {
        questions = JSON.parse(responseText)
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError)
      console.log('AI Response:', responseText)

      // Fallback: Generate questions with 10-10-10 distribution
      const allSkills = [...currentSkills, ...strongSkills, ...weakSkills]
      questions = []

      // Generate 10 current skills questions
      for (let i = 0; i < 10; i++) {
        const skill = currentSkills[i % currentSkills.length] || 'general skills'
        questions.push({
          id: i + 1,
          category: 'current_skills',
          skill: skill,
          question: `Describe your understanding of ${skill}.`,
          marks: 1,
        })
      }

      // Generate 10 strong skills questions
      for (let i = 0; i < 10; i++) {
        const skill = strongSkills[i % strongSkills.length] || 'general skills'
        questions.push({
          id: i + 11,
          category: 'strong_skills',
          skill: skill,
          question: `Explain advanced concepts in ${skill}.`,
          marks: 1,
        })
      }

      // Generate 10 weak skills questions
      for (let i = 0; i < 10; i++) {
        const skill = weakSkills[i % weakSkills.length] || 'general skills'
        questions.push({
          id: i + 21,
          category: 'weak_skills',
          skill: skill,
          question: `What are the basics of ${skill}?`,
          marks: 1,
        })
      }
    }

    // Ensure we have exactly 30 questions
    if (questions.length !== 30) {
      console.warn(`Expected 30 questions, got ${questions.length}`)
      if (questions.length > 30) {
        questions = questions.slice(0, 30)
      } else {
        // Pad with additional questions if needed
        const allSkills = [...currentSkills, ...strongSkills, ...weakSkills]
        while (questions.length < 30) {
          const skill = allSkills[questions.length % allSkills.length] || 'general'
          questions.push({
            id: questions.length + 1,
            category: 'current_skills',
            skill: skill,
            question: `Explain ${skill} in your own words.`,
            marks: 1,
          })
        }
      }
    }

    // Validate 10-10-10 distribution
    const currentSkillsCount = questions.filter((q: any) => q.category === 'current_skills').length
    const strongSkillsCount = questions.filter((q: any) => q.category === 'strong_skills').length
    const weakSkillsCount = questions.filter((q: any) => q.category === 'weak_skills').length

    console.log('Successfully generated 30 questions for user:', userId)
    console.log(`Distribution - Current: ${currentSkillsCount}, Strong: ${strongSkillsCount}, Weak: ${weakSkillsCount}`)
    console.log(`Expected - Current: 10, Strong: 10, Weak: 10`)

    // Save to pre_assessment table
    const { data: savedAssessment, error: saveError } = await supabase
      .from('pre_assessment')
      .insert({
        user_id: userId,
        assessment_type: 'pre',
        questions: questions,
        answers: [],
        total_questions: 30,
        max_score: 30,
        score: null,
        correct_count: null,
        wrong_count: null,
        skipped_count: null,
        evaluated_results: {},
        completed_at: null,
      })
      .select()
      .single()

    if (saveError) {
      console.error('Error saving assessment to database:', saveError)
      // Still return questions even if save fails
      return NextResponse.json({
        questions,
        metadata: {
          skillLevel: userSkills.skill_level,
          jobRole: jobRole,
          distribution: {
            current: currentSkillsCount,
            strong: strongSkillsCount,
            weak: weakSkillsCount
          },
          totalExperience: totalExperience.toFixed(1)
        },
        warning: 'Assessment generated but not saved to database'
      })
    }

    console.log('Assessment saved to pre_assessment table with ID:', savedAssessment.id)

    return NextResponse.json({
      questions,
      assessmentId: savedAssessment.id,
      metadata: {
        skillLevel: userSkills.skill_level,
        jobRole: jobRole,
        distribution: {
          current: currentSkillsCount,
          strong: strongSkillsCount,
          weak: weakSkillsCount
        },
        totalExperience: totalExperience.toFixed(1)
      }
    })
  } catch (error: any) {
    console.error('=== GENERAL ERROR IN GENERATE PRE-ASSESSMENT ===')
    console.error('Error name:', error.name)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    console.error('Full error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate assessment',
        message: error.message || 'Unknown error',
        details: error.toString()
      },
      { status: 500 }
    )
  }
}
