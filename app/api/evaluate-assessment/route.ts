// AI Evaluation Agent - Intelligently grades assessment answers using Groq Llama-3.1-8B
import { NextRequest, NextResponse } from 'next/server'
import { evaluateAssessment } from '@/lib/utils/assessment-evaluator'

export async function POST(request: NextRequest) {
  try {
    // Get auth token from headers
    const authHeader = request.headers.get('authorization')
    const authToken = authHeader?.replace('Bearer ', '')

    // Parse request body
    const body = await request.json()
    const { questions, answers } = body

    if (!questions || !answers) {
      return NextResponse.json(
        { error: 'Missing questions or answers' },
        { status: 400 }
      )
    }

    // Use shared evaluation utility
    const evaluation = await evaluateAssessment(questions, answers, authToken)

    return NextResponse.json({
      success: true,
      evaluation
    })

  } catch (error: any) {
    console.error('=== AI EVALUATION ERROR ===')
    console.error('Error:', error)
    console.error('Message:', error.message)
    console.error('Stack:', error.stack)

    return NextResponse.json(
      {
        error: 'Failed to evaluate assessment',
        message: error.message,
        details: error.toString()
      },
      { status: 500 }
    )
  }
}
