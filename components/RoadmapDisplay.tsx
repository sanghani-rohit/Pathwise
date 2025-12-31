'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Module {
  module_number: number
  module_name: string
  description: string
  duration: string
  skills_covered: string[]
  prerequisites: string[]
  youtube_video: string
  reading_materials: string[]
  practice_exercises: string[]
  project: string
  success_metrics: string[]
}

interface RoadmapData {
  user_id: string
  job_role: string
  experience: string
  skill_level: string
  total_modules: number
  estimated_duration: string
  roadmap: Module[]
  generated_at: string
}

export default function RoadmapDisplay({ roadmap, roadmapId }: { roadmap: RoadmapData, roadmapId: string }) {
  const [expandedModule, setExpandedModule] = useState<number | null>(0)
  const [completedModules, setCompletedModules] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [savingModule, setSavingModule] = useState<number | null>(null)
  const [successMessage, setSuccessMessage] = useState<string>('')

  useEffect(() => {
    loadCompletedModules()
  }, [roadmapId])

  async function loadCompletedModules() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data, error } = await supabase
        .from('module_completions')
        .select('module_number')
        .eq('user_id', session.user.id)
        .eq('roadmap_id', roadmapId)

      if (!error && data) {
        const moduleNumbers = data.map(item => item.module_number)
        setCompletedModules(moduleNumbers)
        console.log('✅ Loaded completed modules:', moduleNumbers)
      }
    } catch (error) {
      console.error('Error loading completed modules:', error)
    } finally {
      setLoading(false)
    }
  }

  async function toggleModuleCompletion(moduleNumber: number) {
    try {
      setSavingModule(moduleNumber)
      console.log('🔄 Toggling module completion:', { moduleNumber, roadmapId })

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        console.error('❌ No session found')
        setSavingModule(null)
        return
      }

      const isCompleted = completedModules.includes(moduleNumber)
      console.log('📊 Current status:', isCompleted ? 'Completed' : 'Incomplete')

      if (isCompleted) {
        // Remove from database FIRST
        const { error } = await supabase
          .from('module_completions')
          .delete()
          .eq('user_id', session.user.id)
          .eq('roadmap_id', roadmapId)
          .eq('module_number', moduleNumber)

        if (error) {
          console.error('❌ Error removing completion:', error)
          setSuccessMessage('Failed to update status. Please try again.')
          setTimeout(() => setSuccessMessage(''), 3000)
        } else {
          // Only update state if database operation succeeded
          const newCompleted = completedModules.filter(num => num !== moduleNumber)
          setCompletedModules(newCompleted)
          console.log('✅ Module marked as incomplete in database')
          setSuccessMessage('Module marked as incomplete!')
          setTimeout(() => setSuccessMessage(''), 3000)
        }
      } else {
        // Save to database FIRST
        const { error } = await supabase
          .from('module_completions')
          .insert({
            user_id: session.user.id,
            roadmap_id: roadmapId,
            module_number: moduleNumber,
            completed_at: new Date().toISOString()
          })

        if (error) {
          console.error('❌ Error marking complete:', error)
          setSuccessMessage('Failed to mark as complete. Please try again.')
          setTimeout(() => setSuccessMessage(''), 3000)
        } else {
          // Only update state if database operation succeeded
          const newCompleted = [...completedModules, moduleNumber]
          setCompletedModules(newCompleted)
          console.log('✅ Module marked as complete in database')
          console.log('📊 New progress:', `${newCompleted.length}/${roadmap.total_modules}`)
          setSuccessMessage('Module completed! Great progress! 🎉')
          setTimeout(() => setSuccessMessage(''), 3000)

          // Create notification for module completion
          const currentModule = roadmap.roadmap.find(m => m.module_number === moduleNumber)
          if (currentModule) {
            const { error: notificationError } = await supabase
              .from('notifications')
              .insert({
                user_id: session.user.id,
                title: 'Module Completed! ✅',
                description: `You've completed "${currentModule.module_name}" from your ${roadmap.job_role} learning path.`,
                type: 'module_completed',
                metadata: {
                  roadmap_id: roadmapId,
                  module_number: moduleNumber,
                  module_name: currentModule.module_name,
                  job_role: roadmap.job_role
                }
              })

            if (notificationError) {
              console.error('⚠️ Failed to create notification:', notificationError)
            } else {
              console.log('✅ Module completion notification created')
            }
          }

          // Check if all modules are now completed (course completion)
          if (newCompleted.length === roadmap.total_modules) {
            const { error: courseNotificationError } = await supabase
              .from('notifications')
              .insert({
                user_id: session.user.id,
                title: 'Course Completed! 🎓',
                description: `Congratulations! You've completed all ${roadmap.total_modules} modules in your ${roadmap.job_role} learning path. Amazing achievement!`,
                type: 'course_completed',
                metadata: {
                  roadmap_id: roadmapId,
                  job_role: roadmap.job_role,
                  total_modules: roadmap.total_modules,
                  completed_at: new Date().toISOString()
                }
              })

            if (courseNotificationError) {
              console.error('⚠️ Failed to create course completion notification:', courseNotificationError)
            } else {
              console.log('🎓 Course completion notification created')
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Error toggling module completion:', error)
      setSuccessMessage('An error occurred. Please try again.')
      setTimeout(() => setSuccessMessage(''), 3000)
    } finally {
      setSavingModule(null)
    }
  }

  const toggleModule = (index: number) => {
    setExpandedModule(expandedModule === index ? null : index)
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-100 border-2 border-green-400 rounded-xl p-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="text-2xl">✅</div>
            <p className="text-green-800 font-semibold">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Overview Card */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Job Role</p>
            <p className="text-lg font-bold text-gray-900">{roadmap.job_role}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Experience</p>
            <p className="text-lg font-bold text-gray-900">{roadmap.experience}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Modules</p>
            <p className="text-lg font-bold text-blue-600">{roadmap.total_modules}</p>
          </div>
        </div>
      </div>

      {/* Modules */}
      <div className="space-y-4">
        {roadmap.roadmap.map((module, index) => {
          const isCompleted = completedModules.includes(module.module_number)

          return (
            <div
              key={index}
              className={`bg-white rounded-xl shadow-lg overflow-hidden border-2 transition-all ${
                isCompleted
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              {/* Module Header */}
              <div
                className={`p-6 cursor-pointer transition-colors ${
                  isCompleted ? 'hover:bg-green-100' : 'hover:bg-gray-50'
                }`}
                onClick={() => toggleModule(index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${
                        isCompleted ? 'bg-green-600' : 'bg-blue-600'
                      } text-white rounded-full flex items-center justify-center font-bold`}>
                        {isCompleted ? '✓' : module.module_number}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {module.module_name}
                        </h3>
                        <p className="text-sm text-gray-600">Duration: {module.duration}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {isCompleted && (
                      <span className="text-sm font-semibold text-green-600">
                        Completed ✓
                      </span>
                    )}
                    <div className="text-right">
                      <span className="text-sm text-gray-500">
                        {module.skills_covered.length} skills
                      </span>
                    </div>
                    <svg
                      className={`w-6 h-6 text-gray-600 transition-transform ${
                        expandedModule === index ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Module Content */}
              {expandedModule === index && (
                <div className="px-6 pb-6 border-t border-gray-200 pt-6">
                  {/* Description */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      • Module Overview
                    </h4>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                        {module.description}
                      </p>
                    </div>
                  </div>

                  {/* Skills Covered */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      • Skills You'll Learn
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {module.skills_covered.map((skill, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Prerequisites */}
                  {module.prerequisites.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">
                        — Prerequisites
                      </h4>
                      <ul className="list-disc list-inside space-y-1">
                        {module.prerequisites.map((prereq, i) => (
                          <li key={i} className="text-gray-700">{prereq}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* YouTube Video */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      ➜ Recommended Video
                    </h4>
                    <a
                      href={module.youtube_video}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <div className="text-2xl font-bold text-red-600">▸</div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Watch Tutorial</p>
                        <p className="text-sm text-gray-600 break-all">{module.youtube_video}</p>
                      </div>
                      <div className="text-gray-400">→</div>
                    </a>
                  </div>

                  {/* Reading Materials */}
                  {module.reading_materials.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">
                        • Reading Materials
                      </h4>
                      <ul className="space-y-2">
                        {module.reading_materials.map((material, i) => (
                          <li key={i}>
                            <a
                              href={material}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              <span>→</span>
                              {material}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Practice Exercises */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      • Practice Exercises
                    </h4>
                    <ol className="list-decimal list-inside space-y-2 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      {module.practice_exercises.map((exercise, i) => (
                        <li key={i} className="text-gray-700">{exercise}</li>
                      ))}
                    </ol>
                  </div>

                  {/* Project */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      ➜ Hands-On Project
                    </h4>
                    <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
                      <p className="text-gray-700 font-medium">{module.project}</p>
                    </div>
                  </div>

                  {/* Success Metrics */}
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      • Success Metrics
                    </h4>
                    <ul className="space-y-2">
                      {module.success_metrics.map((metric, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span className="text-gray-700">{metric}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Complete Module Button - At the end */}
                  <div className="pt-4 border-t-2 border-gray-200">
                    <button
                      onClick={() => toggleModuleCompletion(module.module_number)}
                      disabled={savingModule === module.module_number || isCompleted}
                      className={`w-full py-4 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-lg ${
                        isCompleted
                          ? 'bg-green-600 text-white cursor-default'
                          : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-400'
                      } disabled:cursor-not-allowed`}
                    >
                      {savingModule === module.module_number ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Saving...</span>
                        </>
                      ) : isCompleted ? (
                        <>
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Completed</span>
                        </>
                      ) : (
                        <span>Mark as Complete</span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer Info */}
      <div className="bg-gray-100 rounded-lg p-4 text-center text-sm text-gray-600">
        Generated on {new Date(roadmap.generated_at).toLocaleString()} for {roadmap.skill_level} level
      </div>
    </div>
  )
}
