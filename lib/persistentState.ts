/**
 * Persistent State Management for PathWise
 *
 * This module handles localStorage-based state persistence
 * to ensure user progress is maintained across page refreshes.
 */

// ==================== STORAGE KEYS ====================

export const STORAGE_KEYS = {
  // Assessment States
  ASSESSMENT_QUESTIONS: 'pathwise_assessment_questions',
  ASSESSMENT_ANSWERS: 'pathwise_assessment_answers',
  ASSESSMENT_TIMESTAMP: 'pathwise_assessment_timestamp',
  ASSESSMENT_COMPLETED: 'pathwise_assessment_completed',
  ASSESSMENT_RESULTS: 'pathwise_assessment_results',
  ASSESSMENT_SCORE: 'pathwise_assessment_score',
  ASSESSMENT_ID: 'pathwise_assessment_id',

  // Form States
  SKILL_FORM_COMPLETED: 'pathwise_skill_form_completed',
  USER_PROFILE_COMPLETED: 'pathwise_profile_completed',

  // Roadmap States
  ROADMAP_GENERATED: 'pathwise_roadmap_generated',
  ROADMAP_ID: 'pathwise_roadmap_id',
  READY_FOR_ROADMAP: 'pathwise_ready_for_roadmap',

  // Session States
  USER_ID: 'pathwise_user_id',
  LAST_ACTIVITY: 'pathwise_last_activity'
} as const

// ==================== TYPE DEFINITIONS ====================

export interface AssessmentResults {
  assessmentId: string
  score: number
  maxScore: number
  totalQuestions: number
  correctCount: number
  wrongCount: number
  skippedCount: number
  completedAt: string
  evaluation: {
    totalQuestions: number
    correctCount: number
    wrongCount: number
    skippedCount: number
    results: Array<{
      questionId: number
      question: string
      userAnswer: string
      status: 'correct' | 'wrong' | 'skipped'
      correctAnswer?: string
      explanation?: string
      marksAwarded: number
    }>
  }
}

export interface UserFlowState {
  skillFormCompleted: boolean
  profileCompleted: boolean
  assessmentCompleted: boolean
  assessmentResults?: AssessmentResults
  roadmapGenerated: boolean
  roadmapId?: string
  readyForRoadmap: boolean
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Safely get item from localStorage with error handling
 */
function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch (error) {
    console.error(`Error reading from localStorage (key: ${key}):`, error)
    return null
  }
}

/**
 * Safely set item to localStorage with error handling
 */
function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value)
    return true
  } catch (error) {
    console.error(`Error writing to localStorage (key: ${key}):`, error)
    return false
  }
}

/**
 * Safely remove item from localStorage with error handling
 */
function safeRemoveItem(key: string): boolean {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error(`Error removing from localStorage (key: ${key}):`, error)
    return false
  }
}

/**
 * Check if a timestamp is still valid (within maxHours)
 */
function isTimestampValid(timestamp: string, maxHours: number = 24): boolean {
  try {
    const time = parseInt(timestamp)
    const hoursSince = (Date.now() - time) / (1000 * 60 * 60)
    return hoursSince < maxHours
  } catch {
    return false
  }
}

// ==================== ASSESSMENT STATE ====================

/**
 * Save assessment results to localStorage
 */
export function saveAssessmentResults(results: AssessmentResults): boolean {
  try {
    safeSetItem(STORAGE_KEYS.ASSESSMENT_COMPLETED, 'true')
    safeSetItem(STORAGE_KEYS.ASSESSMENT_RESULTS, JSON.stringify(results))
    safeSetItem(STORAGE_KEYS.ASSESSMENT_SCORE, results.score.toString())
    safeSetItem(STORAGE_KEYS.ASSESSMENT_ID, results.assessmentId)
    safeSetItem(STORAGE_KEYS.ASSESSMENT_TIMESTAMP, Date.now().toString())
    safeSetItem(STORAGE_KEYS.READY_FOR_ROADMAP, 'true')

    console.log('✅ Assessment results saved to localStorage')
    return true
  } catch (error) {
    console.error('❌ Failed to save assessment results:', error)
    return false
  }
}

/**
 * Get saved assessment results from localStorage
 */
export function getAssessmentResults(): AssessmentResults | null {
  try {
    const completed = safeGetItem(STORAGE_KEYS.ASSESSMENT_COMPLETED)
    const resultsStr = safeGetItem(STORAGE_KEYS.ASSESSMENT_RESULTS)
    const timestamp = safeGetItem(STORAGE_KEYS.ASSESSMENT_TIMESTAMP)

    if (!completed || !resultsStr || !timestamp) {
      return null
    }

    // Check if results are still valid (within 7 days)
    if (!isTimestampValid(timestamp, 24 * 7)) {
      console.log('Assessment results expired, clearing...')
      clearAssessmentState()
      return null
    }

    const results = JSON.parse(resultsStr) as AssessmentResults
    console.log('✅ Assessment results loaded from localStorage')
    return results
  } catch (error) {
    console.error('❌ Failed to load assessment results:', error)
    return null
  }
}

/**
 * Check if user has completed assessment
 */
export function hasCompletedAssessment(): boolean {
  const completed = safeGetItem(STORAGE_KEYS.ASSESSMENT_COMPLETED)
  const timestamp = safeGetItem(STORAGE_KEYS.ASSESSMENT_TIMESTAMP)

  if (!completed || !timestamp) {
    return false
  }

  // Verify timestamp is still valid
  return isTimestampValid(timestamp, 24 * 7) // 7 days validity
}

/**
 * Clear assessment state from localStorage
 */
export function clearAssessmentState(): void {
  safeRemoveItem(STORAGE_KEYS.ASSESSMENT_QUESTIONS)
  safeRemoveItem(STORAGE_KEYS.ASSESSMENT_ANSWERS)
  safeRemoveItem(STORAGE_KEYS.ASSESSMENT_TIMESTAMP)
  safeRemoveItem(STORAGE_KEYS.ASSESSMENT_COMPLETED)
  safeRemoveItem(STORAGE_KEYS.ASSESSMENT_RESULTS)
  safeRemoveItem(STORAGE_KEYS.ASSESSMENT_SCORE)
  safeRemoveItem(STORAGE_KEYS.ASSESSMENT_ID)
  safeRemoveItem(STORAGE_KEYS.READY_FOR_ROADMAP)

  console.log('✅ Assessment state cleared from localStorage')
}

// ==================== ROADMAP STATE ====================

/**
 * Mark roadmap as generated
 */
export function markRoadmapGenerated(roadmapId: string): boolean {
  try {
    safeSetItem(STORAGE_KEYS.ROADMAP_GENERATED, 'true')
    safeSetItem(STORAGE_KEYS.ROADMAP_ID, roadmapId)
    safeSetItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString())

    console.log('✅ Roadmap generation marked in localStorage')
    return true
  } catch (error) {
    console.error('❌ Failed to mark roadmap generated:', error)
    return false
  }
}

/**
 * Check if roadmap was generated
 */
export function hasGeneratedRoadmap(): boolean {
  return safeGetItem(STORAGE_KEYS.ROADMAP_GENERATED) === 'true'
}

/**
 * Get roadmap ID
 */
export function getRoadmapId(): string | null {
  return safeGetItem(STORAGE_KEYS.ROADMAP_ID)
}

/**
 * Clear roadmap state
 */
export function clearRoadmapState(): void {
  safeRemoveItem(STORAGE_KEYS.ROADMAP_GENERATED)
  safeRemoveItem(STORAGE_KEYS.ROADMAP_ID)
  console.log('✅ Roadmap state cleared from localStorage')
}

// ==================== FORM STATE ====================

/**
 * Mark skill form as completed
 */
export function markSkillFormCompleted(): boolean {
  return safeSetItem(STORAGE_KEYS.SKILL_FORM_COMPLETED, 'true')
}

/**
 * Check if skill form was completed
 */
export function hasCompletedSkillForm(): boolean {
  return safeGetItem(STORAGE_KEYS.SKILL_FORM_COMPLETED) === 'true'
}

/**
 * Mark profile as completed
 */
export function markProfileCompleted(): boolean {
  return safeSetItem(STORAGE_KEYS.USER_PROFILE_COMPLETED, 'true')
}

/**
 * Check if profile was completed
 */
export function hasCompletedProfile(): boolean {
  return safeGetItem(STORAGE_KEYS.USER_PROFILE_COMPLETED) === 'true'
}

// ==================== USER FLOW STATE ====================

/**
 * Get complete user flow state
 */
export function getUserFlowState(): UserFlowState {
  return {
    skillFormCompleted: hasCompletedSkillForm(),
    profileCompleted: hasCompletedProfile(),
    assessmentCompleted: hasCompletedAssessment(),
    assessmentResults: getAssessmentResults() || undefined,
    roadmapGenerated: hasGeneratedRoadmap(),
    roadmapId: getRoadmapId() || undefined,
    readyForRoadmap: safeGetItem(STORAGE_KEYS.READY_FOR_ROADMAP) === 'true'
  }
}

/**
 * Check if user is ready for roadmap generation
 */
export function isReadyForRoadmap(): boolean {
  const state = getUserFlowState()
  return (
    state.skillFormCompleted &&
    state.assessmentCompleted &&
    !state.roadmapGenerated
  )
}

// ==================== SESSION MANAGEMENT ====================

/**
 * Update last activity timestamp
 */
export function updateLastActivity(): boolean {
  return safeSetItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString())
}

/**
 * Store user ID (for quick reference)
 */
export function storeUserId(userId: string): boolean {
  return safeSetItem(STORAGE_KEYS.USER_ID, userId)
}

/**
 * Get stored user ID
 */
export function getStoredUserId(): string | null {
  return safeGetItem(STORAGE_KEYS.USER_ID)
}

/**
 * Clear user ID
 */
export function clearUserId(): void {
  safeRemoveItem(STORAGE_KEYS.USER_ID)
}

// ==================== FULL CLEANUP ====================

/**
 * Clear all PathWise-related localStorage data
 */
export function clearAllState(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    safeRemoveItem(key)
  })
  console.log('✅ All PathWise state cleared from localStorage')
}

/**
 * Clear all state except user session info
 */
export function resetUserProgress(): void {
  clearAssessmentState()
  clearRoadmapState()
  safeRemoveItem(STORAGE_KEYS.SKILL_FORM_COMPLETED)
  safeRemoveItem(STORAGE_KEYS.USER_PROFILE_COMPLETED)
  console.log('✅ User progress reset (session preserved)')
}

// ==================== DEBUG UTILITIES ====================

/**
 * Log current state (for debugging)
 */
export function debugLogState(): void {
  console.log('=== PathWise State Debug ===')
  console.log('User Flow State:', getUserFlowState())
  console.log('Assessment Completed:', hasCompletedAssessment())
  console.log('Roadmap Generated:', hasGeneratedRoadmap())
  console.log('Ready for Roadmap:', isReadyForRoadmap())
  console.log('============================')
}
