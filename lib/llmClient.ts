/**
 * LLM Client for Ambiguous Answer Evaluation
 *
 * Handles batch evaluation of ambiguous answers with minimal token usage.
 * Only called for answers that pass through rule-based filtering.
 *
 * Token Savings:
 * - Batch processing: ~30% reduction
 * - Short responses: ~50% reduction
 * - Total: ~1,200 tokens per batch (vs ~3,000 without optimization)
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

export interface LLMQuestion {
  questionId: string | number
  question: string
  userAnswer: string
  context?: string // Optional: relevant context from embeddings
}

export interface LLMEvaluation {
  questionId: string | number
  status: 'correct' | 'wrong' | 'skipped'
  correctAnswer?: string
  explanation?: string
  confidence: number
}

export interface LLMConfig {
  provider: 'gemini' | 'openai' | 'anthropic'
  apiKey: string
  model?: string
  maxRetries?: number
  temperature?: number
}

export interface BatchEvaluationRequest {
  questions: LLMQuestion[]
  userProfile: string // Compressed profile (≤100 chars)
  batchSize?: number
}

/**
 * Evaluates a batch of ambiguous answers using LLM
 *
 * @param request - Batch evaluation request
 * @param config - LLM configuration
 * @returns Array of evaluation results
 */
export async function evaluateBatch(
  request: BatchEvaluationRequest,
  config: LLMConfig
): Promise<LLMEvaluation[]> {
  const { questions, userProfile, batchSize = 5 } = request

  // Split into smaller batches
  const batches = chunkArray(questions, batchSize)
  const allResults: LLMEvaluation[] = []

  for (const batch of batches) {
    try {
      const results = await evaluateSingleBatch(batch, userProfile, config)
      allResults.push(...results)
    } catch (error) {
      console.error('Batch evaluation failed:', error)
      // Fallback: mark all as ambiguous/wrong
      allResults.push(...batch.map(q => ({
        questionId: q.questionId,
        status: 'wrong' as const,
        correctAnswer: 'Unable to evaluate',
        explanation: 'Evaluation service temporarily unavailable',
        confidence: 0.0
      })))
    }
  }

  return allResults
}

/**
 * Evaluates a single batch (≤5 questions)
 */
async function evaluateSingleBatch(
  questions: LLMQuestion[],
  userProfile: string,
  config: LLMConfig
): Promise<LLMEvaluation[]> {
  switch (config.provider) {
    case 'gemini':
      return evaluateWithGemini(questions, userProfile, config)
    case 'openai':
      return evaluateWithOpenAI(questions, userProfile, config)
    case 'anthropic':
      return evaluateWithAnthropic(questions, userProfile, config)
    default:
      throw new Error(`Unsupported provider: ${config.provider}`)
  }
}

/**
 * Gemini 2.5 Flash evaluation with retry logic
 */
async function evaluateWithGemini(
  questions: LLMQuestion[],
  userProfile: string,
  config: LLMConfig
): Promise<LLMEvaluation[]> {
  const genAI = new GoogleGenerativeAI(config.apiKey)

  // Try Gemini 2.5 Flash first, fallback to 1.5 Flash
  const models = [
    'models/gemini-2.5-flash',
    'gemini-1.5-flash'
  ]

  for (const modelName of models) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: config.temperature || 0.1,
          maxOutputTokens: 1024,
        }
      })

      const prompt = buildCompactPrompt(questions, userProfile)

      const result = await retryWithBackoff(
        () => model.generateContent(prompt),
        config.maxRetries || 3
      )

      const response = await result.response
      const text = response.text()

      return parseEvaluationResponse(text, questions)

    } catch (error: any) {
      console.warn(`${modelName} failed, trying next model...`, error.message)
      if (modelName === models[models.length - 1]) {
        throw error // Last model failed
      }
    }
  }

  throw new Error('All Gemini models failed')
}

/**
 * OpenAI GPT-4 evaluation
 */
async function evaluateWithOpenAI(
  questions: LLMQuestion[],
  userProfile: string,
  config: LLMConfig
): Promise<LLMEvaluation[]> {
  const prompt = buildCompactPrompt(questions, userProfile)

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a precise assessment grader. Return only valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: config.temperature || 0.1,
      max_tokens: 1024
    })
  })

  const data = await response.json()
  const text = data.choices[0].message.content

  return parseEvaluationResponse(text, questions)
}

/**
 * Anthropic Claude evaluation
 */
async function evaluateWithAnthropic(
  questions: LLMQuestion[],
  userProfile: string,
  config: LLMConfig
): Promise<LLMEvaluation[]> {
  const prompt = buildCompactPrompt(questions, userProfile)

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: config.model || 'claude-3-haiku-20240307',
      messages: [{ role: 'user', content: prompt }],
      temperature: config.temperature || 0.1,
      max_tokens: 1024
    })
  })

  const data = await response.json()
  const text = data.content[0].text

  return parseEvaluationResponse(text, questions)
}

/**
 * Builds ultra-compact prompt with minimal tokens
 */
function buildCompactPrompt(questions: LLMQuestion[], userProfile: string): string {
  // Ultra-compact instructions (~150 tokens)
  const instructions = `Grade ${questions.length} answers. User: ${userProfile}

Rules:
- Status: "correct", "wrong", or "skipped"
- For wrong/skipped: provide correctAnswer + explanation (max 20 words)
- JSON only, no extra text

Format:
[{"qid":"X","status":"correct/wrong/skipped","ans":"...","exp":"..."}]

Questions:`

  // Compact Q&A format (~80-120 tokens per question)
  const qaList = questions.map((q, idx) => {
    let qaText = `\nQ${idx + 1} [${q.questionId}]: ${truncate(q.question, 80)}\nA: ${truncate(q.userAnswer, 100)}`

    if (q.context) {
      qaText += `\nCtx: ${truncate(q.context, 60)}`
    }

    return qaText
  }).join('\n---')

  return `${instructions}${qaList}\n\nJSON response:`
}

/**
 * Parses LLM response into structured evaluations
 */
function parseEvaluationResponse(
  responseText: string,
  questions: LLMQuestion[]
): LLMEvaluation[] {
  try {
    // Extract JSON from response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/)?.[0]
    if (!jsonMatch) {
      throw new Error('No JSON array found in response')
    }

    const parsed = JSON.parse(jsonMatch)

    // Map to standard format
    return parsed.map((item: any, idx: number) => {
      const question = questions[idx]

      return {
        questionId: item.qid || item.questionId || question.questionId,
        status: normalizeStatus(item.status),
        correctAnswer: item.ans || item.correctAnswer,
        explanation: item.exp || item.explanation,
        confidence: item.confidence || 0.85
      }
    })

  } catch (error) {
    console.error('Failed to parse LLM response:', error)
    console.log('Raw response:', responseText)

    // Fallback: mark all as requiring manual review
    return questions.map(q => ({
      questionId: q.questionId,
      status: 'wrong' as const,
      correctAnswer: 'Parse error - manual review needed',
      explanation: 'Unable to parse LLM response',
      confidence: 0.0
    }))
  }
}

/**
 * Normalizes status strings
 */
function normalizeStatus(status: string): 'correct' | 'wrong' | 'skipped' {
  const normalized = status.toLowerCase().trim()
  if (normalized === 'correct' || normalized === 'c') return 'correct'
  if (normalized === 'skipped' || normalized === 's') return 'skipped'
  return 'wrong'
}

/**
 * Retry with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  baseDelay: number = 2000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      const isLastAttempt = attempt === maxRetries - 1
      const isRetryable =
        error.message?.includes('503') ||
        error.message?.includes('429') ||
        error.message?.includes('overloaded') ||
        error.message?.includes('rate limit')

      if (!isRetryable || isLastAttempt) {
        throw error
      }

      const delay = baseDelay * Math.pow(2, attempt)
      console.log(`Retry ${attempt + 1}/${maxRetries} after ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw new Error('Max retries reached')
}

/**
 * Truncates text to maximum length
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}

/**
 * Chunks array into smaller batches
 */
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

/**
 * Estimates token count for a prompt
 */
export function estimateTokens(text: string): number {
  // Rough estimate: 4 characters ≈ 1 token
  return Math.ceil(text.length / 4)
}

/**
 * Calculates token savings compared to non-optimized approach
 */
export function calculateTokenSavings(
  questionsCount: number,
  optimized: boolean
): { input: number; output: number; total: number; savings: number } {
  if (optimized) {
    // Optimized approach
    const inputPerBatch = 150 + (questionsCount * 100) // instructions + compact Q&A
    const outputPerBatch = questionsCount * 40 // short responses

    return {
      input: inputPerBatch,
      output: outputPerBatch,
      total: inputPerBatch + outputPerBatch,
      savings: 0
    }
  } else {
    // Non-optimized approach (baseline)
    const input = 300 + (questionsCount * 200) // verbose instructions + full Q&A
    const output = questionsCount * 150 // verbose explanations
    const total = input + output

    const optimizedTotal = 150 + (questionsCount * 140)
    const savings = total - optimizedTotal

    return {
      input,
      output,
      total,
      savings
    }
  }
}
