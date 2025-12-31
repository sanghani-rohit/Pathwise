/**
 * Database Types for PathWise
 * Auto-generated types for user_profile and user_skills tables
 */

// ==================== USER PROFILE ====================

export interface UserProfile {
  id: string
  user_id: string
  full_name: string
  email: string
  phone_number: string | null
  company_name: string | null
  created_at: string
  updated_at: string
}

export interface UserProfileInsert {
  user_id: string
  full_name: string
  email: string
  phone_number?: string | null
  company_name?: string | null
}

export interface UserProfileUpdate {
  full_name?: string
  email?: string
  phone_number?: string | null
  company_name?: string | null
}

// ==================== USER SKILLS ====================

export type SkillLevel =
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'beginner-to-intermediate'
  | 'intermediate-to-advanced'

export interface UserSkills {
  id: string
  user_id: string
  job_role: string
  years_of_experience: number
  months_of_experience: number
  current_skills: string[]
  strong_skills: string[]
  skills_to_improve: string[]
  learning_goals: string | null
  skill_level: SkillLevel
  created_at: string
  updated_at: string
}

export interface UserSkillsInsert {
  user_id: string
  job_role: string
  years_of_experience: number
  months_of_experience: number
  current_skills: string[]
  strong_skills: string[]
  skills_to_improve: string[]
  learning_goals?: string | null
  skill_level: SkillLevel
}

export interface UserSkillsUpdate {
  job_role?: string
  years_of_experience?: number
  months_of_experience?: number
  current_skills?: string[]
  strong_skills?: string[]
  skills_to_improve?: string[]
  learning_goals?: string | null
  skill_level?: SkillLevel
}

// ==================== COMBINED USER DATA ====================

export interface CompleteUserProfile {
  profile: UserProfile
  skills: UserSkills | null
}

// ==================== FORM DATA (FOR ONBOARDING) ====================

export interface OnboardingFormData {
  // Profile fields
  full_name: string
  email: string
  phone_number?: string
  company_name?: string

  // Skills fields
  job_role: string
  years_of_experience: number
  months_of_experience: number
  current_skills: string[]
  strong_skills: string[]
  skills_to_improve: string[]
  learning_goals?: string
  skill_level: SkillLevel
}

// ==================== API RESPONSE TYPES ====================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface UserProfileResponse {
  profile: UserProfile
  skills: UserSkills
}

// ==================== PRE ASSESSMENT ====================

export type AssessmentType = 'pre' | 'post'

export interface AssessmentQuestion {
  id: number
  category: 'current_skills' | 'strong_skills' | 'weak_skills'
  skill: string
  question: string
  marks: number
}

export interface AssessmentAnswer {
  question_id: number
  answer: string
  is_correct?: boolean
  marks_awarded?: number
}

export interface PreAssessment {
  id: string
  user_id: string
  assessment_type: AssessmentType
  questions: AssessmentQuestion[]
  answers: AssessmentAnswer[] | null
  total_questions: number
  max_score: number
  score: number | null
  correct_count: number | null
  wrong_count: number | null
  skipped_count: number | null
  evaluated_results: any | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface PreAssessmentInsert {
  user_id: string
  assessment_type: AssessmentType
  questions: AssessmentQuestion[]
  answers?: AssessmentAnswer[] | null
  total_questions: number
  max_score: number
  score?: number | null
  correct_count?: number | null
  wrong_count?: number | null
  skipped_count?: number | null
  evaluated_results?: any | null
  completed_at?: string | null
}

export interface PreAssessmentUpdate {
  answers?: AssessmentAnswer[]
  score?: number
  correct_count?: number
  wrong_count?: number
  skipped_count?: number
  evaluated_results?: any
  completed_at?: string
}

// ==================== ASSESSMENT METADATA ====================

export interface AssessmentMetadata {
  skillLevel: SkillLevel
  jobRole: string
  distribution: {
    current: number
    strong: number
    weak: number
  }
  totalExperience: string
}

export interface GenerateAssessmentResponse {
  questions: AssessmentQuestion[]
  assessmentId: string
  metadata: AssessmentMetadata
}

// ==================== ASSESSMENT EVALUATION ====================

export interface EvaluationResult {
  questionId: number
  question: string
  skill: string
  category: string
  userAnswer: string
  status: 'correct' | 'wrong' | 'skipped'
  correctAnswer?: string
  explanation?: string
  marksAwarded: number
}

export interface EvaluationSummary {
  totalQuestions: number
  correctCount: number
  wrongCount: number
  skippedCount: number
  score: number
  maxScore: number
  percentage: number
}

export interface AssessmentEvaluation {
  results: EvaluationResult[]
  summary: EvaluationSummary
  evaluatedAt: string
}

export interface SubmitAssessmentRequest {
  assessmentId: string
  answers: { [questionId: number]: string }
}

export interface SubmitAssessmentResponse {
  success: boolean
  score: number
  maxScore: number
  percentage: number
  assessment_id: string
  completedAt: string
  evaluation: {
    totalQuestions: number
    correctCount: number
    wrongCount: number
    skippedCount: number
    results: EvaluationResult[]
  }
}
