/**
 * POST /api/save-onboarding
 *
 * Saves user onboarding data to user_profile and user_skills tables
 *
 * Auth: Required (Bearer token)
 * Body: OnboardingFormData
 * Returns: { success, profile, skills }
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer, getAuthenticatedUser } from '@/lib/supabase-server'
import {
  createCompleteUserProfile,
  updateCompleteUserProfile,
  getCompleteUserProfile,
} from '@/lib/userProfileService'
import {
  createErrorResponse,
  createSuccessResponse,
  getCorrelationId,
  logApiRequest,
  logApiResponse,
  validateRequiredFields,
} from '@/lib/api-utils'
import { OnboardingFormData } from '@/lib/types/database'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const correlationId = getCorrelationId(request)

  try {
    logApiRequest(correlationId, 'POST', '/api/save-onboarding')

    // ========== AUTHENTICATION ==========
    const authorization = request.headers.get('authorization')
    const user = await getAuthenticatedUser(authorization)

    if (!user) {
      logApiResponse(correlationId, 401, Date.now() - startTime)
      return createErrorResponse(
        'Unauthorized',
        401,
        { message: 'Invalid or missing authentication token' },
        correlationId
      )
    }

    logApiRequest(correlationId, 'POST', '/api/save-onboarding', user.id)

    // ========== PARSE AND VALIDATE REQUEST ==========
    const body: OnboardingFormData = await request.json()

    const requiredFields = [
      'full_name',
      'email',
      'job_role',
      'years_of_experience',
      'months_of_experience',
      'skill_level',
    ]

    const validation = validateRequiredFields(body, requiredFields)
    if (!validation.valid) {
      return createErrorResponse(
        'Missing required fields',
        400,
        { missing: validation.missing },
        correlationId
      )
    }

    // Validate arrays are present (can be empty but must exist)
    if (!Array.isArray(body.current_skills)) {
      body.current_skills = []
    }
    if (!Array.isArray(body.strong_skills)) {
      body.strong_skills = []
    }
    if (!Array.isArray(body.skills_to_improve)) {
      body.skills_to_improve = []
    }

    // Ensure at least one skill array has data
    const hasSkills =
      body.current_skills.length > 0 ||
      body.strong_skills.length > 0 ||
      body.skills_to_improve.length > 0

    if (!hasSkills) {
      return createErrorResponse(
        'Validation error',
        400,
        {
          message:
            'At least one skill must be provided (current_skills, strong_skills, or skills_to_improve)',
        },
        correlationId
      )
    }

    // Validate skill_level enum
    const validSkillLevels = [
      'beginner',
      'intermediate',
      'advanced',
      'beginner-to-intermediate',
      'intermediate-to-advanced',
    ]

    if (!validSkillLevels.includes(body.skill_level)) {
      return createErrorResponse(
        'Validation error',
        400,
        {
          message: `Invalid skill_level. Must be one of: ${validSkillLevels.join(', ')}`,
        },
        correlationId
      )
    }

    // Validate experience values
    if (
      body.years_of_experience < 0 ||
      body.years_of_experience > 50
    ) {
      return createErrorResponse(
        'Validation error',
        400,
        { message: 'years_of_experience must be between 0 and 50' },
        correlationId
      )
    }

    if (
      body.months_of_experience < 0 ||
      body.months_of_experience > 11
    ) {
      return createErrorResponse(
        'Validation error',
        400,
        { message: 'months_of_experience must be between 0 and 11' },
        correlationId
      )
    }

    console.log(`[${correlationId}] Saving onboarding data for user: ${user.id}`)

    // ========== CHECK IF PROFILE EXISTS ==========
    const existingProfile = await getCompleteUserProfile(user.id, true)

    let result

    if (existingProfile?.profile) {
      // Update existing profile
      console.log(`[${correlationId}] Updating existing profile`)
      result = await updateCompleteUserProfile(user.id, body, true)
      console.log(`[${correlationId}] Profile updated successfully`)
    } else {
      // Create new profile
      console.log(`[${correlationId}] Creating new profile`)
      result = await createCompleteUserProfile(user.id, body, true)
      console.log(`[${correlationId}] Profile created successfully`)
    }

    logApiResponse(correlationId, 200, Date.now() - startTime)

    return createSuccessResponse(
      {
        success: true,
        message: existingProfile?.profile
          ? 'Profile updated successfully'
          : 'Profile created successfully',
        profile: result.profile,
        skills: result.skills,
      },
      correlationId
    )
  } catch (error: any) {
    console.error(`[${correlationId}] Error saving onboarding data:`, error)

    logApiResponse(correlationId, 500, Date.now() - startTime)

    return createErrorResponse(
      'Failed to save onboarding data',
      500,
      {
        message: error.message || 'An unexpected error occurred',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      correlationId
    )
  }
}

// ========== GET ENDPOINT - Retrieve user profile ==========
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const correlationId = getCorrelationId(request)

  try {
    logApiRequest(correlationId, 'GET', '/api/save-onboarding')

    // ========== AUTHENTICATION ==========
    const authorization = request.headers.get('authorization')
    const user = await getAuthenticatedUser(authorization)

    if (!user) {
      logApiResponse(correlationId, 401, Date.now() - startTime)
      return createErrorResponse(
        'Unauthorized',
        401,
        { message: 'Invalid or missing authentication token' },
        correlationId
      )
    }

    console.log(`[${correlationId}] Fetching profile for user: ${user.id}`)

    // ========== FETCH PROFILE ==========
    const completeProfile = await getCompleteUserProfile(user.id, true)

    if (!completeProfile?.profile) {
      return createErrorResponse(
        'Profile not found',
        404,
        { message: 'User has not completed onboarding' },
        correlationId
      )
    }

    logApiResponse(correlationId, 200, Date.now() - startTime)

    return createSuccessResponse(
      {
        success: true,
        profile: completeProfile.profile,
        skills: completeProfile.skills,
        hasCompletedOnboarding: !!(
          completeProfile.profile && completeProfile.skills
        ),
      },
      correlationId
    )
  } catch (error: any) {
    console.error(`[${correlationId}] Error fetching profile:`, error)

    logApiResponse(correlationId, 500, Date.now() - startTime)

    return createErrorResponse(
      'Failed to fetch profile',
      500,
      {
        message: error.message || 'An unexpected error occurred',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      correlationId
    )
  }
}
