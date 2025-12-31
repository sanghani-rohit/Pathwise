'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import RoadmapDisplay from '@/components/RoadmapDisplay'

export default function RoadmapPage() {
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [roadmapData, setRoadmapData] = useState<any>(null)
  const [roadmapId, setRoadmapId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [prerequisites, setPrerequisites] = useState({
    hasFilledForm: false,
    hasCompletedAssessment: false,
    hasGeneratedRoadmap: false
  })

  useEffect(() => {
    checkPrerequisitesAndRoadmap()
  }, [])

  async function checkPrerequisitesAndRoadmap() {
    try {
      setLoading(true)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('Please log in to view your roadmap')
        return
      }

      // Check if user has filled the skill form
      const { data: userSkills, error: skillsError } = await supabase
        .from('user_skills')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle()

      const hasFilledForm = !!userSkills
      if (skillsError) console.error('Skills check error:', skillsError)

      // Check if user has completed assessment
      const { data: assessment, error: assessmentError } = await supabase
        .from('pre_assessment')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle()

      const hasCompletedAssessment = !!assessment
      if (assessmentError) console.error('Assessment check error:', assessmentError)

      // Check if user has existing roadmap
      const { data: roadmaps, error: roadmapError } = await supabase
        .from('roadmaps')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (roadmapError) {
        console.error('❌ Roadmap fetch error:', roadmapError)
      }

      const roadmap = roadmaps && roadmaps.length > 0 ? roadmaps[0] : null
      const hasGeneratedRoadmap = !!roadmap

      console.log('📊 Prerequisites Check:')
      console.log('  - User ID:', session.user.id)
      console.log('  - Has filled form:', hasFilledForm)
      console.log('  - Has completed assessment:', hasCompletedAssessment)
      console.log('  - Has generated roadmap:', hasGeneratedRoadmap)
      console.log('  - Roadmap data:', roadmap ? 'Found' : 'Not found')

      setPrerequisites({
        hasFilledForm,
        hasCompletedAssessment,
        hasGeneratedRoadmap
      })

      if (roadmap) {
        console.log('✅ Existing roadmap found:', roadmap.id)
        console.log('   Created at:', roadmap.created_at)
        setRoadmapData(roadmap.roadmap_data)
        setRoadmapId(roadmap.id)
      } else {
        console.log('ℹ️  No existing roadmap found for user')
        setRoadmapData(null)
        setRoadmapId(null)
      }
    } catch (err) {
      console.error('❌ Error checking prerequisites:', err)
    } finally {
      setLoading(false)
    }
  }

  async function generateRoadmap() {
    try {
      setGenerating(true)
      setError('')

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('Please log in to generate a roadmap')
        return
      }

      console.log('🚀 Generating new roadmap...')

      const response = await fetch('/api/roadmap/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate roadmap')
      }

      console.log('✅ Roadmap generated successfully')
      setRoadmapData(data.roadmap)

      // Fetch the saved roadmap to get its ID and update prerequisites
      await checkPrerequisitesAndRoadmap()

    } catch (err: any) {
      console.error('❌ Error generating roadmap:', err)
      setError(err.message || 'Failed to generate roadmap')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Your Personalized Learning Roadmap
          </h1>
          <p className="text-gray-600 text-lg">
            AI-generated learning path based on your skills and goals
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 bg-red-50 border-2 border-red-200 rounded-lg p-6">
            <div className="flex items-start">
              <svg
                className="w-6 h-6 text-red-600 mt-0.5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h3 className="font-semibold text-red-900">Error</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Prerequisites Check */}
        {!roadmapData && !loading && (!prerequisites.hasFilledForm || !prerequisites.hasCompletedAssessment) && (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Complete These Steps First
              </h2>
              <p className="text-gray-600">
                Before generating your roadmap, please complete the following:
              </p>
            </div>

            <div className="space-y-4">
              {/* Step 1: Fill Form */}
              <div className={`flex items-start gap-4 p-4 rounded-lg border-2 ${
                prerequisites.hasFilledForm
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  prerequisites.hasFilledForm
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {prerequisites.hasFilledForm ? '✓' : '1'}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Fill the Skill Form
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Tell us about your skills, experience, and learning goals
                  </p>
                  {!prerequisites.hasFilledForm && (
                    <a
                      href="/upgrade-skill"
                      className="inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Go to Skill Form →
                    </a>
                  )}
                </div>
              </div>

              {/* Step 2: Complete Assessment */}
              <div className={`flex items-start gap-4 p-4 rounded-lg border-2 ${
                prerequisites.hasCompletedAssessment
                  ? 'bg-green-50 border-green-200'
                  : prerequisites.hasFilledForm
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-gray-100 border-gray-300 opacity-60'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  prerequisites.hasCompletedAssessment
                    ? 'bg-green-600 text-white'
                    : prerequisites.hasFilledForm
                      ? 'bg-gray-300 text-gray-600'
                      : 'bg-gray-200 text-gray-400'
                }`}>
                  {prerequisites.hasCompletedAssessment ? '✓' : '2'}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Complete the Assessment
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Take our skill assessment to evaluate your current knowledge
                  </p>
                  {!prerequisites.hasCompletedAssessment && prerequisites.hasFilledForm && (
                    <a
                      href="/personal-dashboard"
                      className="inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Go to Assessment →
                    </a>
                  )}
                  {!prerequisites.hasFilledForm && (
                    <p className="text-xs text-gray-500 italic">
                      Complete Step 1 first
                    </p>
                  )}
                </div>
              </div>

              {/* Step 3: Generate Roadmap */}
              <div className={`flex items-start gap-4 p-4 rounded-lg border-2 ${
                prerequisites.hasFilledForm && prerequisites.hasCompletedAssessment
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-gray-100 border-gray-300 opacity-60'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  prerequisites.hasFilledForm && prerequisites.hasCompletedAssessment
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Generate Your Roadmap
                  </h3>
                  <p className="text-sm text-gray-600">
                    Once steps 1 & 2 are complete, you can generate your personalized learning roadmap
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Generate Roadmap - All Prerequisites Met */}
        {!roadmapData && !loading && prerequisites.hasFilledForm && prerequisites.hasCompletedAssessment && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Generate Your Learning Roadmap
            </h2>
            <p className="text-gray-600 mb-8">
              Create a comprehensive, personalized learning roadmap based on your profile and assessment results.
            </p>
            <button
              onClick={generateRoadmap}
              disabled={generating}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {generating ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Generating Your Roadmap...
                </span>
              ) : (
                'Generate My Roadmap'
              )}
            </button>
            <p className="mt-4 text-sm text-gray-500">
              This may take 20-40 seconds as we create your personalized plan
            </p>
          </div>
        )}

        {/* Display Roadmap */}
        {roadmapData && roadmapId && (
          <div>
            <RoadmapDisplay roadmap={roadmapData} roadmapId={roadmapId} />
          </div>
        )}
      </div>
    </div>
  )
}
