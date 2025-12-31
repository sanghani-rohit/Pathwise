/**
 * POST /api/roadmap/generate
 *
 * New Roadmap Generation Agent
 * Generates 5-10 personalized learning modules based on user data
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  const correlationId = generateCorrelationId()
  const startTime = Date.now()

  try {
    console.log(`\n[${correlationId}] ========================================`)
    console.log(`[${correlationId}] 🚀 NEW ROADMAP GENERATION STARTED`)
    console.log(`[${correlationId}] ========================================\n`)

    // ========== STEP 1: AUTHENTICATE USER ==========
    console.log(`[${correlationId}] 🔐 Step 1: Authenticating user...`)

    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error(`[${correlationId}] ❌ No authorization token provided`)
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required'
        },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')

    // Create Supabase client with the token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error(`[${correlationId}] ❌ Authentication failed:`, authError)
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required'
        },
        { status: 401 }
      )
    }

    console.log(`[${correlationId}] ✅ User authenticated: ${user.id}`)

    // ========== STEP 2: FETCH USER DATA FROM SUPABASE ==========
    console.log(`[${correlationId}] 📊 Step 2: Fetching user data from Supabase...`)

    // Fetch from user_skills table
    const { data: userSkills, error: skillsError } = await supabase
      .from('user_skills')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (skillsError || !userSkills) {
      console.error(`[${correlationId}] ❌ Error fetching user skills:`, skillsError)
      return NextResponse.json(
        {
          success: false,
          error: 'User skills not found. Please complete onboarding first.'
        },
        { status: 404 }
      )
    }

    // Fetch from pre_assessment table (latest pre-assessment)
    const { data: assessment, error: assessmentError } = await supabase
      .from('pre_assessment')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (assessmentError || !assessment) {
      console.error(`[${correlationId}] ❌ Error fetching assessment:`, assessmentError)
      return NextResponse.json(
        {
          success: false,
          error: 'Assessment not found. Please complete assessment first.'
        },
        { status: 404 }
      )
    }

    console.log(`[${correlationId}] ✅ Data fetched successfully`)
    console.log(`[${correlationId}]    Job Role: ${userSkills.job_role}`)
    console.log(`[${correlationId}]    Experience: ${userSkills.years_of_experience}y ${userSkills.months_of_experience}m`)
    console.log(`[${correlationId}]    Skill Level: ${userSkills.skill_level}`)
    console.log(`[${correlationId}]    Assessment Score: ${assessment.score}/${assessment.total_questions}`)
    console.log()

    // ========== STEP 3: BUILD AI PROMPT ==========
    console.log(`[${correlationId}] 🎯 Step 3: Building AI prompt...`)

    const prompt = buildRoadmapPrompt({
      user_id: user.id,
      job_role: userSkills.job_role,
      years_of_experience: userSkills.years_of_experience || 0,
      months_of_experience: userSkills.months_of_experience || 0,
      current_skills: userSkills.current_skills || [],
      strong_skills: userSkills.strong_skills || [],
      skills_to_improve: userSkills.skills_to_improve || [],
      learning_goals: userSkills.learning_goals || '',
      skill_level: userSkills.skill_level || 'beginner',
      assessment: {
        type: 'pre',
        score: assessment.score || 0,
        max_score: assessment.total_questions || 30,
        correct_count: assessment.correct_answers || 0,
        wrong_count: assessment.wrong_answers || 0,
        skipped_count: assessment.skipped_count || 0,
        questions: assessment.questions || [],
        answers: assessment.answers || []
      }
    })

    console.log(`[${correlationId}] ✅ Prompt built (${prompt.length} characters)`)
    console.log()

    // ========== STEP 4: CALL AI AGENT (GPT-4o-mini) ==========
    console.log(`[${correlationId}] 🤖 Step 4: Calling AI Agent (GPT-4o-mini)...`)

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: getSystemPrompt()
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 16000,
      response_format: { type: 'json_object' }
    })

    const responseContent = completion.choices[0]?.message?.content

    if (!responseContent) {
      throw new Error('No response from AI')
    }

    console.log(`[${correlationId}] ✅ AI response received (${responseContent.length} characters)`)
    console.log()

    // ========== STEP 5: PARSE AND VALIDATE RESPONSE ==========
    console.log(`[${correlationId}] 🔍 Step 5: Parsing AI response...`)

    const roadmapData = JSON.parse(responseContent)

    // Validate module count
    if (!roadmapData.roadmap || roadmapData.roadmap.length < 5 || roadmapData.roadmap.length > 10) {
      throw new Error(`Invalid module count: ${roadmapData.roadmap?.length || 0}. Expected 5-10 modules.`)
    }

    console.log(`[${correlationId}] ✅ Roadmap validated`)
    console.log(`[${correlationId}]    Total Modules: ${roadmapData.roadmap.length}`)
    console.log()

    // ========== STEP 6: SAVE TO DATABASE ==========
    console.log(`[${correlationId}] 💾 Step 6: Saving roadmap to database...`)

    const { data: savedRoadmap, error: saveError } = await supabase
      .from('roadmaps')
      .insert({
        user_id: user.id,
        job_role: userSkills.job_role,
        target_skill: userSkills.job_role,
        roadmap_data: roadmapData,
        total_modules: roadmapData.roadmap.length,
        skill_level: userSkills.skill_level,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (saveError) {
      console.error(`[${correlationId}] ⚠️  Warning: Failed to save to database:`, saveError)
      console.log(`[${correlationId}] ℹ️  Returning roadmap anyway...`)
    } else {
      console.log(`[${correlationId}] ✅ Roadmap saved to database`)
      console.log(`[${correlationId}]    Roadmap ID: ${savedRoadmap.id}`)

      // Create notification for roadmap creation
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: 'New Learning Roadmap Created! 🎯',
          description: `Your personalized ${userSkills.job_role} roadmap with ${roadmapData.roadmap.length} modules is ready to explore.`,
          type: 'roadmap_created',
          metadata: {
            roadmap_id: savedRoadmap.id,
            job_role: userSkills.job_role,
            total_modules: roadmapData.roadmap.length
          }
        })

      if (notificationError) {
        console.error(`[${correlationId}] ⚠️  Warning: Failed to create notification:`, notificationError)
      } else {
        console.log(`[${correlationId}] ✅ Notification created`)
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)

    console.log(`\n[${correlationId}] ========================================`)
    console.log(`[${correlationId}] ✅ ROADMAP GENERATION COMPLETE (${duration}s)`)
    console.log(`[${correlationId}] ========================================\n`)

    // ========== RETURN RESPONSE ==========
    return NextResponse.json({
      success: true,
      roadmap: roadmapData,
      metadata: {
        generated_at: new Date().toISOString(),
        generation_time: parseFloat(duration),
        user_id: user.id,
        job_role: userSkills.job_role,
        correlation_id: correlationId
      }
    })

  } catch (error: any) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2)

    console.error(`\n[${correlationId}] ========================================`)
    console.error(`[${correlationId}] ❌ ROADMAP GENERATION FAILED (${duration}s)`)
    console.error(`[${correlationId}] ========================================`)
    console.error(`[${correlationId}] Error:`, error.message)
    console.error(`[${correlationId}] Stack:`, error.stack)
    console.error(`[${correlationId}] ========================================\n`)

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate roadmap',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

/**
 * Build comprehensive prompt for AI agent
 */
function buildRoadmapPrompt(data: any): string {
  const totalExperience = data.years_of_experience + (data.months_of_experience / 12)
  const assessmentPercentage = ((data.assessment.score / data.assessment.max_score) * 100).toFixed(0)

  return `Generate a personalized learning roadmap for the following user:

═══════════════════════════════════════════════════════
USER PROFILE
═══════════════════════════════════════════════════════
Job Role: ${data.job_role}
Total Experience: ${data.years_of_experience} years ${data.months_of_experience} months (${totalExperience.toFixed(1)} years total)
Skill Level: ${data.skill_level}

Current Skills: ${data.current_skills.join(', ') || 'None listed'}
Strong Skills: ${data.strong_skills.join(', ') || 'None listed'}
Skills to Improve: ${data.skills_to_improve.join(', ') || 'None listed'}

Learning Goals: ${data.learning_goals || 'Not specified'}

═══════════════════════════════════════════════════════
ASSESSMENT RESULTS
═══════════════════════════════════════════════════════
Assessment Type: ${data.assessment.type}
Score: ${data.assessment.score}/${data.assessment.max_score} (${assessmentPercentage}%)
Correct Answers: ${data.assessment.correct_count}
Wrong Answers: ${data.assessment.wrong_count}
Skipped Questions: ${data.assessment.skipped_count}

═══════════════════════════════════════════════════════
YOUR TASK
═══════════════════════════════════════════════════════
Generate a comprehensive learning roadmap with 5-10 modules tailored to this user's:
- Specific job role (${data.job_role})
- Current experience level (${totalExperience.toFixed(1)} years)
- Skill level (${data.skill_level})
- Assessment performance (${assessmentPercentage}%)
- Identified skill gaps
- Learning goals

CRITICAL REQUIREMENTS:
1. Generate EXACTLY 5-10 modules (no more, no less)
2. Each module description must be 30-40 lines (comprehensive and detailed)
3. YOU MUST provide actual YouTube video URLs (search YouTube for latest relevant videos)
   - Videos must be from reputable educational channels
   - Videos should be published within the last 6-12 months
   - Provide FULL YouTube URLs: https://www.youtube.com/watch?v=XXXXX
4. Progression should go from foundational to advanced
5. Include practical projects and exercises for each module
6. Reference the user's specific job role, experience, and skill gaps in each module

For each module, provide detailed explanation of:
- Why this module is important for a ${data.job_role}
- How it addresses their specific skill gaps
- What they'll learn and how it applies to real-world scenarios
- How it connects to their ${totalExperience.toFixed(1)} years of experience
- Practical applications at their ${data.skill_level} level

Return your response as valid JSON following the exact structure shown in the schema below.`
}

/**
 * System prompt for AI agent
 */
function getSystemPrompt(): string {
  return `You are an expert Learning Path Architect and Career Development Specialist with 15+ years of experience in personalized education.

Your task is to generate comprehensive, personalized learning roadmaps that are:
- Tailored to the user's specific job role and experience level
- Based on their assessment performance and identified skill gaps
- Structured with clear progression from fundamentals to advanced concepts
- Packed with practical projects and real-world applications
- Supported by high-quality learning resources (YouTube videos, articles, exercises)

CRITICAL RULES - YOU MUST FOLLOW THESE:
1. Generate EXACTLY 5-10 modules (strictly between 5 and 10)
2. Each module description MUST be 30-40 lines long (comprehensive and detailed)
3. YOU MUST provide ACTUAL YouTube video URLs (not search queries or placeholders)
   - Search for real videos on YouTube
   - Use FULL URLs: https://www.youtube.com/watch?v=VIDEO_ID
   - Recommend videos from channels like: freeCodeCamp, Traversy Media, Academind, The Net Ninja, etc.
   - Videos should be recent (published within last 6-12 months)
4. Each module must include:
   - Comprehensive 30-40 line description
   - Duration estimate
   - Skills covered
   - Prerequisites
   - YouTube video (actual URL)
   - 2-3 reading materials
   - 3-5 practice exercises
   - A practical project
   - Success metrics

RETURN ONLY VALID JSON in this exact structure:

{
  "user_id": "the user's ID",
  "job_role": "the job role",
  "experience": "X years Y months",
  "skill_level": "beginner/intermediate/advanced",
  "total_modules": 7,
  "estimated_duration": "6 months",
  "roadmap": [
    {
      "module_number": 1,
      "module_name": "Module Title",
      "description": "EXACTLY 30-40 lines of comprehensive description explaining:\n- Line 1: Why this module matters for the user's specific job role\n- Line 2: How it addresses their skill gaps identified in assessment\n- Line 3: What foundational concepts they'll master\n- Line 4-6: Detailed breakdown of key topics covered\n- Line 7-10: How these topics apply to real-world scenarios\n- Line 11-15: Connection to their current experience level\n- Line 16-20: Progression path and learning methodology\n- Line 21-25: Expected outcomes and capabilities gained\n- Line 26-30: Integration with their learning goals\n- Line 31-35: Industry relevance and career impact\n- Line 36-40: Preparation for subsequent modules",
      "duration": "3 weeks",
      "skills_covered": ["Skill 1", "Skill 2", "Skill 3"],
      "prerequisites": ["Prerequisite 1", "Prerequisite 2"],
      "youtube_video": "https://www.youtube.com/watch?v=ACTUAL_VIDEO_ID",
      "reading_materials": [
        "https://example.com/article1",
        "https://example.com/article2"
      ],
      "practice_exercises": [
        "Exercise 1 description",
        "Exercise 2 description",
        "Exercise 3 description"
      ],
      "project": "Build a practical project that demonstrates mastery of module concepts",
      "success_metrics": [
        "Complete all practice exercises",
        "Build and deploy the project",
        "Achieve 90% on module quiz"
      ]
    }
  ],
  "generated_at": "${new Date().toISOString()}"
}

IMPORTANT: Return ONLY the JSON object. NO markdown code blocks, NO explanations, NO additional text.`
}

/**
 * Generate correlation ID for tracking
 */
function generateCorrelationId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`
}
