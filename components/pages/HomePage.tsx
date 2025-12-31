'use client'

import { useApp } from '@/contexts/AppContext'
import { Sparkles, TrendingUp, Target, Award } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Activity {
  type: 'form' | 'assessment' | 'roadmap'
  title: string
  date: string
  score?: string
}

interface RoadmapProgress {
  id: string
  title: string
  totalModules: number
  completedModules: number
  modules: {
    module_number: number
    module_name: string
    completed: boolean
  }[]
  createdAt: string
}

export default function HomePage() {
  const { userName } = useApp()
  const [recentActivities, setRecentActivities] = useState<Activity[]>([])
  const [loadingActivities, setLoadingActivities] = useState(true)
  const [roadmapProgress, setRoadmapProgress] = useState<RoadmapProgress[]>([])
  const [loadingRoadmaps, setLoadingRoadmaps] = useState(true)
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date())

  const stats = [
    { label: 'Skills Acquired', value: '12', icon: Award, color: 'bg-blue-500' },
    { label: 'Courses Completed', value: '5', icon: Target, color: 'bg-green-500' },
    { label: 'Learning Streak', value: '7 days', icon: TrendingUp, color: 'bg-purple-500' },
    { label: 'Achievements', value: '8', icon: Sparkles, color: 'bg-orange-500' }
  ]

  useEffect(() => {
    fetchRecentActivities()
    fetchRoadmapProgress()

    // Auto-refresh when page becomes visible (user returns from roadmap page)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchRecentActivities()
        fetchRoadmapProgress()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  async function fetchRecentActivities() {
    try {
      setLoadingActivities(true)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setLoadingActivities(false)
        return
      }

      const activities: Activity[] = []

      // Fetch user skills (filled forms)
      const { data: userSkills } = await supabase
        .from('user_skills')
        .select('job_role, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (userSkills && userSkills.length > 0) {
        userSkills.forEach(skill => {
          activities.push({
            type: 'form',
            title: `${skill.job_role} Skills Form`,
            date: skill.created_at
          })
        })
      }

      // Fetch assessments
      const { data: assessments } = await supabase
        .from('pre_assessment')
        .select('score, total_questions, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (assessments && assessments.length > 0) {
        assessments.forEach(assessment => {
          activities.push({
            type: 'assessment',
            title: 'Pre-Assessment',
            date: assessment.created_at,
            score: `${assessment.score}/${assessment.total_questions}`
          })
        })
      }

      // Fetch roadmaps
      const { data: roadmaps } = await supabase
        .from('roadmaps')
        .select('job_role, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (roadmaps && roadmaps.length > 0) {
        roadmaps.forEach(roadmap => {
          activities.push({
            type: 'roadmap',
            title: `${roadmap.job_role} Learning Roadmap`,
            date: roadmap.created_at
          })
        })
      }

      // Sort all activities by date (most recent first)
      activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      // Keep only the 6 most recent activities
      setRecentActivities(activities.slice(0, 6))

    } catch (error) {
      console.error('Error fetching recent activities:', error)
    } finally {
      setLoadingActivities(false)
    }
  }

  async function fetchRoadmapProgress() {
    try {
      setLoadingRoadmaps(true)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setLoadingRoadmaps(false)
        return
      }

      // Fetch all roadmaps for the user
      const { data: roadmaps } = await supabase
        .from('roadmaps')
        .select('id, job_role, roadmap_data, total_modules, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (!roadmaps || roadmaps.length === 0) {
        setRoadmapProgress([])
        setLoadingRoadmaps(false)
        return
      }

      // For each roadmap, fetch completion data
      const progressData: RoadmapProgress[] = []

      for (const roadmap of roadmaps) {
        // Fetch module completions for this roadmap
        const { data: completions } = await supabase
          .from('module_completions')
          .select('module_number')
          .eq('user_id', session.user.id)
          .eq('roadmap_id', roadmap.id)

        const completedModuleNumbers = new Set(
          completions?.map(c => c.module_number) || []
        )

        // Extract modules from roadmap_data
        const modules = roadmap.roadmap_data?.roadmap || []

        const moduleProgress = modules.map((module: any) => ({
          module_number: module.module_number,
          module_name: module.module_name,
          completed: completedModuleNumbers.has(module.module_number)
        }))

        progressData.push({
          id: roadmap.id,
          title: `${roadmap.job_role} Learning Path`,
          totalModules: roadmap.total_modules,
          completedModules: completedModuleNumbers.size,
          modules: moduleProgress,
          createdAt: roadmap.created_at
        })
      }

      setRoadmapProgress(progressData)
      setLastRefreshed(new Date())

      console.log('📊 Roadmap progress refreshed:', {
        roadmapCount: progressData.length,
        timestamp: new Date().toLocaleTimeString()
      })

    } catch (error) {
      console.error('Error fetching roadmap progress:', error)
    } finally {
      setLoadingRoadmaps(false)
    }
  }

  function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`

    // Return formatted date for older items
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  function getActivityIcon(type: string): string {
    switch (type) {
      case 'form':
        return '📝'
      case 'assessment':
        return '📊'
      case 'roadmap':
        return '🗺️'
      default:
        return '•'
    }
  }

  function getActivityLabel(type: string): string {
    switch (type) {
      case 'form':
        return 'Filled Form'
      case 'assessment':
        return 'Completed Assessment'
      case 'roadmap':
        return 'Generated Roadmap'
      default:
        return 'Activity'
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-600 to-primary-400 rounded-2xl p-8 text-white shadow-xl"
      >
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {userName || 'Learner'}! 👋
        </h1>
        <p className="text-primary-100">
          Continue your learning journey and master new skills today.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Roadmap Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl p-6 shadow-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Roadmap Progress</h2>
          {!loadingRoadmaps && roadmapProgress.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Last synced: {lastRefreshed.toLocaleTimeString()}</span>
            </div>
          )}
        </div>

        {loadingRoadmaps ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
          </div>
        ) : roadmapProgress.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🗺️</div>
            <p className="text-gray-500 mb-2">No roadmaps generated yet</p>
            <p className="text-gray-400 text-sm">Complete your assessment and generate your first roadmap!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {roadmapProgress.map((roadmap, index) => {
              const completionPercentage = (roadmap.completedModules / roadmap.totalModules) * 100

              return (
                <div
                  key={roadmap.id}
                  className="border-2 border-gray-200 rounded-xl p-5 hover:border-primary-300 transition-colors"
                >
                  {/* Roadmap Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{roadmap.title}</h3>
                        <p className="text-xs text-gray-500">
                          {roadmap.completedModules} of {roadmap.totalModules} modules completed
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary-600">
                        {completionPercentage.toFixed(0)}%
                      </div>
                      <p className="text-xs text-gray-500">Complete</p>
                    </div>
                  </div>

                  {/* Overall Progress Bar */}
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-green-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Module Breakdown */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Module Breakdown</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {roadmap.modules.map((module) => (
                        <div
                          key={module.module_number}
                          className={`flex items-center justify-between p-3 rounded-lg text-sm ${
                            module.completed
                              ? 'bg-green-50 border border-green-200'
                              : 'bg-gray-50 border border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                              module.completed
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-300 text-gray-600'
                            }`}>
                              {module.completed ? '✓' : module.module_number}
                            </div>
                            <span className={`truncate ${
                              module.completed ? 'text-green-900' : 'text-gray-700'
                            }`}>
                              {module.module_name}
                            </span>
                          </div>
                          <span className={`ml-2 text-xs font-medium flex-shrink-0 ${
                            module.completed ? 'text-green-600' : 'text-gray-400'
                          }`}>
                            {module.completed ? '100%' : '0%'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl p-6 shadow-lg"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {loadingActivities ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : recentActivities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No recent activities yet</p>
              <p className="text-gray-400 text-xs mt-1">Complete the skill form and assessment to get started</p>
            </div>
          ) : (
            recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="text-2xl mt-0.5">{getActivityIcon(activity.type)}</div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-semibold text-gray-900">{getActivityLabel(activity.type)}</span>
                    {activity.score && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                        Score: {activity.score}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-700 mt-0.5">{activity.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatRelativeTime(activity.date)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  )
}
