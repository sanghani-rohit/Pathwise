/**
 * POST /api/submit-assessment
 *
 * Submits user assessment answers for AI evaluation and updates pre_assessment table
 *
 * Auth: Required (Bearer token)
 * Body: { assessmentId, answers }
 * Returns: { success, score, maxScore, assessment_id, evaluation, completedAt }
 */

import { NextRequest } from 'next/server'
import { supabaseServer, getAuthenticatedUser } from '@/lib/supabase-server'
import {
  createErrorResponse,
  createSuccessResponse,
  getCorrelationId,
  logApiRequest,
  logApiResponse,
  validateRequiredFields,
} from '@/lib/api-utils'
import { evaluateAssessment } from '@/lib/utils/assessment-evaluator'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const correlationId = getCorrelationId(request)

  try {
    logApiRequest(correlationId, 'POST', '/api/submit-assessment')

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

    logApiRequest(correlationId, 'POST', '/api/submit-assessment', user.id)

    // ========== PARSE AND VALIDATE REQUEST ==========
    const body = await request.json()
    const { assessmentId, answers } = body

    const validation = validateRequiredFields(body, ['assessmentId', 'answers'])
    if (!validation.valid) {
      return createErrorResponse(
        'Missing required fields',
        400,
        { missing: validation.missing },
        correlationId
      )
    }

    console.log(`[${correlationId}] Submitting assessment for user: ${user.id}`)
    console.log(`[${correlationId}] Assessment ID: ${assessmentId}`)
    console.log(`[${correlationId}] Answered: ${Object.keys(answers || {}).length}`)

    // ========== FETCH ASSESSMENT FROM pre_assessment TABLE ==========
    const { data: assessment, error: fetchError } = await supabaseServer
      .from('pre_assessment')
      .select('*')
      .eq('id', assessmentId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !assessment) {
      console.error(`[${correlationId}] Assessment not found:`, fetchError)
      return createErrorResponse(
        'Assessment not found',
        404,
        { message: 'Assessment not found or you do not have access' },
        correlationId
      )
    }

    // Check if already completed
    if (assessment.completed_at) {
      console.log(`[${correlationId}] Assessment already completed at: ${assessment.completed_at}`)
      return createErrorResponse(
        'Assessment already completed',
        400,
        { message: 'This assessment has already been submitted', completedAt: assessment.completed_at },
        correlationId
      )
    }

    const questions = assessment.questions
    console.log(`[${correlationId}] Total questions: ${questions?.length || 0}`)

    // ========== CALL AI EVALUATION AGENT ==========
    console.log(`[${correlationId}] Calling AI Evaluation Agent...`)

    // Use shared evaluation utility instead of HTTP fetch
    const authToken = authorization?.replace('Bearer ', '')
    const evaluation = await evaluateAssessment(questions, answers, authToken)

    console.log(`[${correlationId}] AI Evaluation completed:`)
    console.log(`[${correlationId}] - Score: ${evaluation.score} / ${evaluation.maxScore}`)
    console.log(`[${correlationId}] - Correct: ${evaluation.correctCount}`)
    console.log(`[${correlationId}] - Wrong: ${evaluation.wrongCount}`)
    console.log(`[${correlationId}] - Skipped: ${evaluation.skippedCount}`)

    // ========== UPDATE pre_assessment TABLE WITH RESULTS ==========
    console.log(`[${correlationId}] Updating pre_assessment table with evaluation results...`)

    // Prepare answers array for database
    const answersArray = evaluation.results.map((r: any) => ({
      question_id: r.questionId,
      answer: r.userAnswer,
      is_correct: r.status === 'correct',
      marks_awarded: r.marksAwarded
    }))

    const completedAt = new Date().toISOString()

    const { data: updatedAssessment, error: updateError } = await supabaseServer
      .from('pre_assessment')
      .update({
        answers: answersArray,
        score: evaluation.score,
        correct_count: evaluation.correctCount,
        wrong_count: evaluation.wrongCount,
        skipped_count: evaluation.skippedCount,
        evaluated_results: {
          results: evaluation.results,
          summary: {
            totalQuestions: evaluation.totalQuestions,
            correctCount: evaluation.correctCount,
            wrongCount: evaluation.wrongCount,
            skippedCount: evaluation.skippedCount,
            score: evaluation.score,
            maxScore: evaluation.maxScore,
            percentage: Math.round((evaluation.score / evaluation.maxScore) * 100)
          },
          evaluatedAt: completedAt
        },
        completed_at: completedAt
      })
      .eq('id', assessmentId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error(`[${correlationId}] Error updating assessment:`, updateError)
      return createErrorResponse(
        'Failed to save evaluation results',
        500,
        { message: updateError.message, details: updateError.details },
        correlationId
      )
    }

    console.log(`[${correlationId}] ✅ Assessment evaluation saved successfully!`)
    console.log(`[${correlationId}] Assessment ID: ${updatedAssessment.id}`)
    console.log(`[${correlationId}] Completed at: ${updatedAssessment.completed_at}`)

    logApiResponse(correlationId, 200, Date.now() - startTime)

    return createSuccessResponse(
      {
        success: true,
        score: evaluation.score,
        maxScore: evaluation.maxScore,
        percentage: Math.round((evaluation.score / evaluation.maxScore) * 100),
        assessment_id: updatedAssessment.id,
        completedAt: updatedAssessment.completed_at,
        evaluation: {
          totalQuestions: evaluation.totalQuestions,
          correctCount: evaluation.correctCount,
          wrongCount: evaluation.wrongCount,
          skippedCount: evaluation.skippedCount,
          results: evaluation.results,
        },
      },
      correlationId
    )
  } catch (error: any) {
    console.error(`[${correlationId}] Error submitting assessment:`, error)

    logApiResponse(correlationId, 500, Date.now() - startTime)

    return createErrorResponse(
      'Failed to submit assessment',
      500,
      {
        message: error.message || 'An unexpected error occurred',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      correlationId
    )
  }
}
