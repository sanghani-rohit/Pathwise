'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ClipboardCheck, FileCheck, Lock, Loader2, CheckCircle, XCircle, RotateCcw, Map, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import {
  saveAssessmentResults,
  getAssessmentResults,
  hasCompletedAssessment,
  clearAssessmentState,
  isReadyForRoadmap,
  markRoadmapGenerated,
  updateLastActivity,
  type AssessmentResults
} from '@/lib/persistentState'

interface Question {
  id: number
  question: string
  marks: number
}

interface EvaluationResult {
  questionId: number
  question: string
  userAnswer: string
  status: 'correct' | 'wrong' | 'skipped'
  correctAnswer?: string
  explanation?: string
  marksAwarded: number
}

interface AssessmentEvaluation {
  totalQuestions: number
  correctCount: number
  wrongCount: number
  skippedCount: number
  results: EvaluationResult[]
}

// LocalStorage keys for persistence
const STORAGE_KEY_QUESTIONS = 'pathwise_assessment_questions'
const STORAGE_KEY_ANSWERS = 'pathwise_assessment_answers'
const STORAGE_KEY_ASSESSMENT_ID = 'pathwise_assessment_id'
const STORAGE_KEY_TIMESTAMP = 'pathwise_assessment_timestamp'

export default function AssessmentPage() {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [assessmentId, setAssessmentId] = useState<string | null>(null)
  const [answers, setAnswers] = useState<{ [key: number]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [evaluationProgress, setEvaluationProgress] = useState('')
  const [score, setScore] = useState<number | null>(null)
  const [maxScore, setMaxScore] = useState<number>(30)
  const [evaluation, setEvaluation] = useState<AssessmentEvaluation | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [hasRestoredSession, setHasRestoredSession] = useState(false)
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false)
  const [roadmapProgress, setRoadmapProgress] = useState('')
  const [roadmapGenerated, setRoadmapGenerated] = useState(false)

  // Restore assessment from localStorage on mount (in-progress questions)
  useEffect(() => {
    const restoreAssessment = () => {
      try {
        const savedQuestions = localStorage.getItem(STORAGE_KEY_QUESTIONS)
        const savedAnswers = localStorage.getItem(STORAGE_KEY_ANSWERS)
        const savedAssessmentId = localStorage.getItem(STORAGE_KEY_ASSESSMENT_ID)
        const savedTimestamp = localStorage.getItem(STORAGE_KEY_TIMESTAMP)

        if (savedQuestions && savedTimestamp) {
          // Check if session is less than 24 hours old
          const timestamp = parseInt(savedTimestamp)
          const hoursSinceCreation = (Date.now() - timestamp) / (1000 * 60 * 60)

          if (hoursSinceCreation < 24) {
            const parsedQuestions = JSON.parse(savedQuestions)
            const parsedAnswers = savedAnswers ? JSON.parse(savedAnswers) : {}

            setQuestions(parsedQuestions)
            setAnswers(parsedAnswers)
            if (savedAssessmentId) {
              setAssessmentId(savedAssessmentId)
            }
            setHasRestoredSession(true)

            console.log('Restored assessment session from localStorage')
            console.log('Questions:', parsedQuestions.length)
            console.log('Assessment ID:', savedAssessmentId)
            console.log('Answered:', Object.keys(parsedAnswers).filter(key => parsedAnswers[parseInt(key)]?.trim()).length)
          } else {
            // Session too old, clear it
            clearAssessmentStorage()
            console.log('Cleared old assessment session (>24 hours)')
          }
        }
      } catch (error) {
        console.error('Error restoring assessment:', error)
        clearAssessmentStorage()
      }
    }

    restoreAssessment()
  }, [])

  // Restore completed assessment results on mount
  useEffect(() => {
    const restoreResults = () => {
      try {
        // Check if assessment was already completed
        if (hasCompletedAssessment()) {
          const savedResults = getAssessmentResults()

          if (savedResults) {
            console.log('✅ Restoring completed assessment results from localStorage')

            setScore(savedResults.score)
            setMaxScore(savedResults.maxScore)
            setEvaluation(savedResults.evaluation)
            setShowResults(true)

            // Clear in-progress question storage since assessment is complete
            clearAssessmentStorage()

            console.log('Assessment results restored:', {
              score: savedResults.score,
              maxScore: savedResults.maxScore,
              completed: savedResults.completedAt
            })
          }
        }
      } catch (error) {
        console.error('Error restoring completed results:', error)
      }
    }

    restoreResults()
  }, [])

  // Save questions and assessmentId to localStorage whenever they change
  useEffect(() => {
    if (questions.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY_QUESTIONS, JSON.stringify(questions))
        if (!localStorage.getItem(STORAGE_KEY_TIMESTAMP)) {
          localStorage.setItem(STORAGE_KEY_TIMESTAMP, Date.now().toString())
        }
      } catch (error) {
        console.error('Error saving questions to localStorage:', error)
      }
    }
  }, [questions])

  // Save assessmentId to localStorage
  useEffect(() => {
    if (assessmentId) {
      try {
        localStorage.setItem(STORAGE_KEY_ASSESSMENT_ID, assessmentId)
      } catch (error) {
        console.error('Error saving assessment ID to localStorage:', error)
      }
    }
  }, [assessmentId])

  // Save answers to localStorage whenever they change (auto-save)
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY_ANSWERS, JSON.stringify(answers))
      } catch (error) {
        console.error('Error saving answers to localStorage:', error)
      }
    }
  }, [answers])

  // Clear localStorage function
  const clearAssessmentStorage = () => {
    localStorage.removeItem(STORAGE_KEY_QUESTIONS)
    localStorage.removeItem(STORAGE_KEY_ANSWERS)
    localStorage.removeItem(STORAGE_KEY_ASSESSMENT_ID)
    localStorage.removeItem(STORAGE_KEY_TIMESTAMP)
  }

  const handleGeneratePreAssessment = async () => {
    setIsGenerating(true)
    setGenerationProgress('Analyzing your profile...')
    try {
      // Get current session token
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        alert('Please log in to generate assessment')
        setIsGenerating(false)
        setGenerationProgress('')
        return
      }

      setGenerationProgress('Connecting to AI...')

      // Add small delay for UX
      await new Promise(resolve => setTimeout(resolve, 500))

      setGenerationProgress('AI is creating your personalized questions... (this may take 10-15 seconds)')

      const response = await fetch('/api/generate-pre-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('API Error Response:', errorData)
        console.error('Status:', response.status)

        let errorMessage = errorData.error || 'Failed to generate assessment'
        if (errorData.message) {
          errorMessage += `\n\nDetails: ${errorData.message}`
        }
        if (errorData.details) {
          errorMessage += `\n\nTechnical Details: ${errorData.details}`
        }

        throw new Error(errorMessage)
      }

      setGenerationProgress('Processing questions...')
      const data = await response.json()
      console.log('Received questions:', data.questions?.length)
      console.log('Assessment ID:', data.assessmentId)

      if (!data.questions || data.questions.length === 0) {
        throw new Error('No questions were generated. Please try again.')
      }

      if (!data.assessmentId) {
        throw new Error('Assessment ID not received. Please try again.')
      }

      setGenerationProgress('Assessment ready!')
      await new Promise(resolve => setTimeout(resolve, 300))
      setQuestions(data.questions)
      setAssessmentId(data.assessmentId)
    } catch (error: any) {
      console.error('Error generating assessment:', error)
      console.error('Full error object:', error)

      alert(`Failed to generate assessment:\n\n${error.message}\n\nPlease check:\n1. Google Gemini API key is set in .env.local\n2. You have completed the skill upgrade form\n3. Check browser console and terminal for detailed error logs`)
    } finally {
      setIsGenerating(false)
      setGenerationProgress('')
    }
  }

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setEvaluationProgress('Submitting your assessment...')
    try {
      // Get current session token
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        alert('Please log in to submit assessment')
        return
      }

      console.log('Submitting assessment for AI evaluation...')

      if (!assessmentId) {
        alert('Assessment ID not found. Please regenerate the assessment.')
        return
      }

      setEvaluationProgress('AI is evaluating your answers... (this may take 15-25 seconds)')

      const response = await fetch('/api/submit-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          assessmentId,
          answers
        })
      })

      setEvaluationProgress('Finalizing your results...')

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to submit assessment')
      }

      const data = await response.json()
      console.log('AI Evaluation received:', data)

      setScore(data.score)
      setMaxScore(data.maxScore)
      setEvaluation(data.evaluation)
      setEvaluationProgress('Evaluation complete!')
      setShowResults(true)

      // ✅ SAVE RESULTS PERSISTENTLY (don't clear - user might refresh)
      const resultsToSave: AssessmentResults = {
        assessmentId: data.assessment_id || 'unknown',
        score: data.score,
        maxScore: data.maxScore,
        totalQuestions: data.evaluation.totalQuestions,
        correctCount: data.evaluation.correctCount,
        wrongCount: data.evaluation.wrongCount,
        skippedCount: data.evaluation.skippedCount,
        completedAt: new Date().toISOString(),
        evaluation: data.evaluation
      }

      saveAssessmentResults(resultsToSave)

      // Clear only in-progress question storage (but keep completed results)
      clearAssessmentStorage()
      console.log('✅ Assessment submitted successfully, results saved persistently')
    } catch (error: any) {
      console.error('Error submitting assessment:', error)
      alert(`Failed to submit assessment: ${error.message}\n\nPlease try again.`)
    } finally {
      setIsSubmitting(false)
      setEvaluationProgress('')
    }
  }

  const handleReset = () => {
    setQuestions([])
    setAnswers({})
    setScore(null)
    setMaxScore(30)
    setEvaluation(null)
    setShowResults(false)
    setHasRestoredSession(false)

    // Clear localStorage when resetting
    clearAssessmentStorage()
    console.log('Assessment reset, localStorage cleared')
  }

  const handleGenerateRoadmap = async () => {
    setIsGeneratingRoadmap(true)
    setRoadmapProgress('Preparing your profile data...')

    try {
      // Update last activity timestamp
      updateLastActivity()

      // ✅ IMPROVED: Get session with proper error handling
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.error('Session error:', sessionError)
        throw new Error('Failed to get authentication session. Please refresh and try again.')
      }

      if (!session || !session.access_token) {
        console.error('No session found')
        throw new Error('You must be logged in to generate a roadmap. Please log in and try again.')
      }

      console.log('✅ Session validated successfully')

      setRoadmapProgress('Analyzing your assessment results...')
      await new Promise(resolve => setTimeout(resolve, 500))

      setRoadmapProgress('AI is generating your personalized roadmap... (this may take 10-15 seconds)')

      console.log('Calling roadmap generator API...')

      const response = await fetch('/api/roadmap/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Roadmap API Error:', errorData)

        // Don't throw authentication errors that might trigger redirect
        if (response.status === 401) {
          throw new Error('Authentication expired. Please refresh the page and try again.')
        }

        throw new Error(errorData.error || errorData.message || 'Failed to generate roadmap')
      }

      const data = await response.json()
      console.log('✅ Roadmap generated successfully:', data)

      // ✅ Mark roadmap as generated in localStorage
      if (data.roadmapId) {
        markRoadmapGenerated(data.roadmapId)
      }

      setRoadmapProgress('Roadmap ready! Opening...')
      await new Promise(resolve => setTimeout(resolve, 300))

      // ✅ Try to open in new tab, with fallback
      console.log('Opening roadmap...')
      const newWindow = window.open('/roadmap', '_blank', 'noopener,noreferrer')

      // Mark roadmap as generated
      setRoadmapGenerated(true)

      // Check if popup was blocked
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        console.log('⚠️ Popup blocked, navigating in same tab')
        // Popup was blocked, navigate in same tab instead
        router.push('/roadmap')
      } else {
        console.log('✅ New tab opened successfully')
      }
    } catch (error: any) {
      console.error('Error generating roadmap:', error)
      alert(`Failed to generate roadmap:\n\n${error.message}\n\nPlease try again or check console for details.`)
    } finally {
      setIsGeneratingRoadmap(false)
      setRoadmapProgress('')
    }
  }

  const handleViewRoadmap = async () => {
    try {
      console.log('=== View Roadmap Clicked ===')

      // ✅ Validate session BEFORE navigation
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.error('Session error:', sessionError)
        alert('Session error. Please refresh the page and try again.')
        return
      }

      if (!session || !session.user) {
        console.error('No active session found')
        alert('Your session has expired. Please refresh the page and log in again.')
        return
      }

      console.log('✅ Session valid, user:', session.user.id)
      console.log('Navigating to /roadmap')

      // ✅ Navigate to roadmap page (session is valid)
      router.push('/roadmap')
    } catch (error: any) {
      console.error('Error navigating to roadmap:', error)
      alert('Failed to navigate. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <ClipboardCheck size={32} className="text-primary-600" />
          Pre & Post Assessment
        </h1>
        <p className="text-gray-600">
          Evaluate your skills before and after completing your learning journey
        </p>
      </motion.div>

      {/* Session Restored Notification */}
      {hasRestoredSession && questions.length > 0 && !showResults && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border-2 border-green-200 rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <RotateCcw className="text-green-600" size={24} />
            <div className="flex-1">
              <h3 className="text-green-900 font-semibold">Assessment Session Restored</h3>
              <p className="text-green-700 text-sm">
                Your progress has been recovered. You can continue from where you left off.
                Answered: <span className="font-semibold">{Object.keys(answers).filter(key => answers[parseInt(key)]?.trim()).length} / 30</span>
              </p>
            </div>
            <button
              onClick={() => setHasRestoredSession(false)}
              className="text-green-600 hover:text-green-800 text-sm font-medium"
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      )}

      {/* Results Modal with Detailed Feedback */}
      {showResults && evaluation && (
        <div className="space-y-6">
          {/* Score Summary */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8 shadow-xl"
          >
            <div className="mb-4 flex justify-center">
              <CheckCircle size={64} className="text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
              Assessment Completed!
            </h2>
            <p className="text-xl text-gray-700 mb-6 text-center">
              Your Pre-Assessment Score: <span className="font-bold text-green-600">{score} / {maxScore}</span>
            </p>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-100 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-700">{evaluation.correctCount}</div>
                <div className="text-sm text-green-600">Correct</div>
              </div>
              <div className="bg-red-100 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-700">{evaluation.wrongCount}</div>
                <div className="text-sm text-red-600">Wrong</div>
              </div>
              <div className="bg-gray-100 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-700">{evaluation.skippedCount}</div>
                <div className="text-sm text-gray-600">Skipped</div>
              </div>
            </div>

            {/* Generate Roadmap Button - Primary CTA */}
            {isGeneratingRoadmap ? (
              <div className="mb-4 p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Loader2 className="animate-spin text-purple-600" size={32} />
                  <h3 className="text-xl font-bold text-purple-900">Generating Your Roadmap...</h3>
                </div>
                <p className="text-center text-purple-700 font-medium">
                  {roadmapProgress || 'AI is creating your personalized learning path'}
                </p>
              </div>
            ) : roadmapGenerated ? (
              <div className="mb-4 space-y-3">
                <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CheckCircle className="text-green-600" size={24} />
                    <h3 className="text-lg font-bold text-green-900">Roadmap Generated Successfully!</h3>
                  </div>
                  <p className="text-center text-green-700 text-sm">
                    Your personalized learning roadmap is ready. Click below to view it.
                  </p>
                </div>
                <button
                  onClick={handleViewRoadmap}
                  className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center gap-3"
                >
                  <Map size={24} />
                  View My Roadmap
                  <Sparkles size={24} />
                </button>
              </div>
            ) : (
              <button
                onClick={handleGenerateRoadmap}
                disabled={isGeneratingRoadmap}
                className="w-full mb-4 px-8 py-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
              >
                <Sparkles size={24} className="animate-pulse" />
                Generate Roadmap by AI
                <Map size={24} />
              </button>
            )}

            <button
              onClick={handleReset}
              className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
            >
              Take Another Assessment
            </button>
          </motion.div>

          {/* Detailed Feedback */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Detailed Feedback</h3>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4">
              {evaluation.results.map((result, index) => (
                <div
                  key={result.questionId}
                  className={`border-2 rounded-lg p-4 ${
                    result.status === 'correct'
                      ? 'border-green-200 bg-green-50'
                      : result.status === 'wrong'
                      ? 'border-red-200 bg-red-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  {/* Question Number and Status */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        result.status === 'correct'
                          ? 'bg-green-500 text-white'
                          : result.status === 'wrong'
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-400 text-white'
                      }`}>
                        {index + 1}
                      </span>
                      <span className={`font-semibold ${
                        result.status === 'correct'
                          ? 'text-green-700'
                          : result.status === 'wrong'
                          ? 'text-red-700'
                          : 'text-gray-700'
                      }`}>
                        {result.status === 'correct' ? '✓ Correct' : result.status === 'wrong' ? '✗ Wrong' : '○ Skipped'}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      result.marksAwarded > 0
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-300 text-gray-700'
                    }`}>
                      {result.marksAwarded} / 1 mark
                    </span>
                  </div>

                  {/* Question */}
                  <div className="mb-3">
                    <p className="font-medium text-gray-900">{result.question}</p>
                  </div>

                  {/* User's Answer */}
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Your Answer:</p>
                    <p className={`text-sm p-2 rounded ${
                      result.status === 'skipped'
                        ? 'bg-gray-100 text-gray-500 italic'
                        : 'bg-white text-gray-800'
                    }`}>
                      {result.userAnswer}
                    </p>
                  </div>

                  {/* Correct Answer (for wrong/skipped) */}
                  {(result.status === 'wrong' || result.status === 'skipped') && result.correctAnswer && (
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-green-700 mb-1">Correct Answer:</p>
                      <p className="text-sm bg-green-100 text-green-900 p-2 rounded">
                        {result.correctAnswer}
                      </p>
                    </div>
                  )}

                  {/* Explanation (for wrong/skipped) */}
                  {(result.status === 'wrong' || result.status === 'skipped') && result.explanation && (
                    <div>
                      <p className="text-sm font-semibold text-blue-700 mb-1">Explanation:</p>
                      <p className="text-sm bg-blue-50 text-blue-900 p-2 rounded">
                        {result.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Initial Buttons */}
      {questions.length === 0 && !showResults && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Pre-Assessment Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <button
              onClick={handleGeneratePreAssessment}
              disabled={isGenerating}
              className="w-full h-64 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <div className="flex flex-col items-center justify-center h-full p-8">
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin mb-4" size={48} />
                    <h3 className="text-2xl font-bold mb-2">Generating...</h3>
                    <p className="text-primary-100">
                      {generationProgress || 'AI is creating your personalized assessment'}
                    </p>
                  </>
                ) : (
                  <>
                    <FileCheck size={48} className="mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Generate Pre-Assessment</h3>
                    <p className="text-primary-100">Test your current knowledge</p>
                  </>
                )}
              </div>
            </button>
          </motion.div>

          {/* Post-Assessment Button (Disabled) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-full h-64 bg-gray-200 text-gray-500 rounded-2xl shadow-lg cursor-not-allowed relative overflow-hidden">
              <div className="flex flex-col items-center justify-center h-full p-8">
                <Lock size={48} className="mb-4" />
                <h3 className="text-2xl font-bold mb-2">Generate Post-Assessment</h3>
                <p className="text-gray-400">Available after completing your learning path</p>
              </div>
              <div className="absolute top-4 right-4 bg-gray-400 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Coming Soon
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Questions Display */}
      {questions.length > 0 && !showResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="mb-6 pb-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Pre-Assessment Questions</h2>
            <p className="text-gray-600 mt-1">Answer as many questions as you can. Total: 30 marks</p>
          </div>

          <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4">
            {questions.map((q, index) => (
              <div key={q.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
                <div className="flex items-start gap-3 mb-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{q.question}</p>
                    <span className="text-xs text-gray-500 mt-1 inline-block">({q.marks} mark)</span>
                  </div>
                </div>
                <textarea
                  value={answers[q.id] || ''}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  placeholder="Type your answer here... (Leave blank to skip)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            {/* Progress Message During Submission */}
            {isSubmitting && evaluationProgress && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Loader2 className="animate-spin text-blue-600" size={20} />
                  <p className="text-blue-800 font-medium">{evaluationProgress}</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Answered: <span className="font-semibold">{Object.keys(answers).filter(key => answers[parseInt(key)]?.trim()).length}</span> / 30
              </div>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Submit Assessment
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Info Card */}
      {questions.length === 0 && !showResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-blue-900 mb-2">How it works:</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Click "Generate Pre-Assessment" to create a personalized 30-question assessment based on your skills</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Questions are tailored to your experience level and learning goals</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>You can skip questions - only answered questions count toward your score</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Your results will be saved and can be compared with your Post-Assessment later</span>
            </li>
          </ul>
        </motion.div>
      )}
    </div>
  )
}
