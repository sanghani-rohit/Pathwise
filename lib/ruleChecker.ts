/**
 * Rule-Based Pre-Grader
 *
 * Performs deterministic checks before LLM evaluation to filter out
 * questions that can be graded without AI.
 *
 * Token Savings: Eliminates ~60-70% of LLM calls for straightforward answers
 * Estimated savings: ~4,500 tokens per assessment (70% of total)
 */

export interface Question {
  id: string | number
  text: string
  type?: 'mcq' | 'numeric' | 'boolean' | 'text'
  expectedAnswer?: string
  keywords?: string[]
  numericRange?: { min: number; max: number }
}

export interface Answer {
  questionId: string | number
  text: string
}

export type GradeStatus = 'correct' | 'wrong' | 'skipped' | 'ambiguous'

export interface RuleCheckResult {
  questionId: string | number
  status: GradeStatus
  confidence: number // 0-1, how confident the rule check is
  reason?: string
  requiresLLM: boolean
}

/**
 * Main rule checker function
 * Applies deterministic rules to grade answers without LLM
 */
export function checkAnswer(question: Question, answer: Answer): RuleCheckResult {
  const answerText = answer.text?.trim() || ''

  // Rule 1: Skipped answers
  if (!answerText || answerText.length === 0) {
    return {
      questionId: question.id,
      status: 'skipped',
      confidence: 1.0,
      reason: 'No answer provided',
      requiresLLM: false
    }
  }

  // Rule 2: Exact match (case-insensitive)
  if (question.expectedAnswer) {
    if (normalizeText(answerText) === normalizeText(question.expectedAnswer)) {
      return {
        questionId: question.id,
        status: 'correct',
        confidence: 1.0,
        reason: 'Exact match',
        requiresLLM: false
      }
    }
  }

  // Rule 3: Numeric answers
  if (question.type === 'numeric') {
    const numericResult = checkNumericAnswer(question, answerText)
    if (numericResult.confidence >= 0.9) {
      return numericResult
    }
  }

  // Rule 4: Boolean answers
  if (question.type === 'boolean') {
    const booleanResult = checkBooleanAnswer(question, answerText)
    if (booleanResult.confidence >= 0.9) {
      return booleanResult
    }
  }

  // Rule 5: Keyword matching
  if (question.keywords && question.keywords.length > 0) {
    const keywordResult = checkKeywordMatch(question, answerText)
    if (keywordResult.confidence >= 0.8) {
      return keywordResult
    }
  }

  // Rule 6: Very short answers (likely incomplete)
  if (answerText.split(/\s+/).length < 3) {
    return {
      questionId: question.id,
      status: 'wrong',
      confidence: 0.7,
      reason: 'Answer too brief',
      requiresLLM: false
    }
  }

  // Rule 7: Pattern matching for common formats
  const patternResult = checkCommonPatterns(question, answerText)
  if (patternResult && patternResult.confidence >= 0.8) {
    return patternResult
  }

  // Default: Ambiguous, requires LLM
  return {
    questionId: question.id,
    status: 'ambiguous',
    confidence: 0.0,
    reason: 'Requires LLM evaluation',
    requiresLLM: true
  }
}

/**
 * Batch rule checking for multiple Q&A pairs
 */
export function batchCheckAnswers(
  questions: Question[],
  answers: Answer[]
): RuleCheckResult[] {
  const answerMap = new Map(answers.map(a => [a.questionId, a]))

  return questions.map(question => {
    const answer = answerMap.get(question.id) || { questionId: question.id, text: '' }
    return checkAnswer(question, answer)
  })
}

/**
 * Filters results to get only ambiguous answers that need LLM
 */
export function getAmbiguousAnswers(results: RuleCheckResult[]): RuleCheckResult[] {
  return results.filter(r => r.requiresLLM)
}

/**
 * Gets evaluation statistics from rule checking
 */
export function getStats(results: RuleCheckResult[]) {
  return {
    total: results.length,
    correct: results.filter(r => r.status === 'correct').length,
    wrong: results.filter(r => r.status === 'wrong').length,
    skipped: results.filter(r => r.status === 'skipped').length,
    ambiguous: results.filter(r => r.status === 'ambiguous').length,
    llmRequired: results.filter(r => r.requiresLLM).length
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/[^\w\s]/g, '')
}

function checkNumericAnswer(question: Question, answerText: string): RuleCheckResult {
  const numMatch = answerText.match(/[-+]?[0-9]*\.?[0-9]+/)
  if (!numMatch) {
    return {
      questionId: question.id,
      status: 'ambiguous',
      confidence: 0.0,
      requiresLLM: true
    }
  }

  const answerNum = parseFloat(numMatch[0])

  if (question.expectedAnswer) {
    const expectedNum = parseFloat(question.expectedAnswer)
    const tolerance = 0.01 // 1% tolerance

    if (Math.abs(answerNum - expectedNum) / expectedNum < tolerance) {
      return {
        questionId: question.id,
        status: 'correct',
        confidence: 1.0,
        reason: 'Numeric match within tolerance',
        requiresLLM: false
      }
    } else {
      return {
        questionId: question.id,
        status: 'wrong',
        confidence: 0.95,
        reason: 'Numeric value incorrect',
        requiresLLM: false
      }
    }
  }

  if (question.numericRange) {
    const { min, max } = question.numericRange
    if (answerNum >= min && answerNum <= max) {
      return {
        questionId: question.id,
        status: 'correct',
        confidence: 0.9,
        reason: 'Within expected range',
        requiresLLM: false
      }
    } else {
      return {
        questionId: question.id,
        status: 'wrong',
        confidence: 0.9,
        reason: 'Outside expected range',
        requiresLLM: false
      }
    }
  }

  return {
    questionId: question.id,
    status: 'ambiguous',
    confidence: 0.0,
    requiresLLM: true
  }
}

function checkBooleanAnswer(question: Question, answerText: string): RuleCheckResult {
  const normalized = normalizeText(answerText)

  const truePatterns = ['yes', 'true', 'correct', 'right', 'agree']
  const falsePatterns = ['no', 'false', 'incorrect', 'wrong', 'disagree']

  const isTrue = truePatterns.some(p => normalized.includes(p))
  const isFalse = falsePatterns.some(p => normalized.includes(p))

  if (isTrue && !isFalse) {
    const status = question.expectedAnswer?.toLowerCase() === 'true' ? 'correct' : 'wrong'
    return {
      questionId: question.id,
      status,
      confidence: 0.95,
      reason: 'Boolean match',
      requiresLLM: false
    }
  }

  if (isFalse && !isTrue) {
    const status = question.expectedAnswer?.toLowerCase() === 'false' ? 'correct' : 'wrong'
    return {
      questionId: question.id,
      status,
      confidence: 0.95,
      reason: 'Boolean match',
      requiresLLM: false
    }
  }

  return {
    questionId: question.id,
    status: 'ambiguous',
    confidence: 0.0,
    requiresLLM: true
  }
}

function checkKeywordMatch(question: Question, answerText: string): RuleCheckResult {
  if (!question.keywords || question.keywords.length === 0) {
    return {
      questionId: question.id,
      status: 'ambiguous',
      confidence: 0.0,
      requiresLLM: true
    }
  }

  const normalized = normalizeText(answerText)
  const matchedKeywords = question.keywords.filter(kw =>
    normalized.includes(normalizeText(kw))
  )

  const matchRatio = matchedKeywords.length / question.keywords.length

  if (matchRatio >= 0.7) {
    return {
      questionId: question.id,
      status: 'correct',
      confidence: 0.8,
      reason: `Matched ${matchedKeywords.length}/${question.keywords.length} keywords`,
      requiresLLM: false
    }
  } else if (matchRatio >= 0.3) {
    return {
      questionId: question.id,
      status: 'ambiguous',
      confidence: 0.5,
      reason: 'Partial keyword match, needs LLM',
      requiresLLM: true
    }
  } else {
    return {
      questionId: question.id,
      status: 'wrong',
      confidence: 0.75,
      reason: 'Missing key concepts',
      requiresLLM: false
    }
  }
}

function checkCommonPatterns(question: Question, answerText: string): RuleCheckResult | null {
  const normalized = normalizeText(answerText)

  // Big O notation pattern
  const bigOMatch = answerText.match(/O\s*\(\s*([^)]+)\s*\)/i)
  if (bigOMatch && question.expectedAnswer?.includes('O(')) {
    const expectedComplexity = question.expectedAnswer.match(/O\s*\(\s*([^)]+)\s*\)/i)?.[1]
    if (expectedComplexity && normalizeText(bigOMatch[1]) === normalizeText(expectedComplexity)) {
      return {
        questionId: question.id,
        status: 'correct',
        confidence: 1.0,
        reason: 'Big O notation match',
        requiresLLM: false
      }
    }
  }

  // Code snippet pattern (likely needs LLM)
  if (normalized.includes('function') || normalized.includes('def ') || normalized.includes('class ')) {
    return {
      questionId: question.id,
      status: 'ambiguous',
      confidence: 0.0,
      reason: 'Code snippet detected, needs LLM',
      requiresLLM: true
    }
  }

  return null
}
