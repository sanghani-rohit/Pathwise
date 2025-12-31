'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Sparkles } from 'lucide-react'
import CourseRecommendations from '@/components/CourseRecommendations'
import { getRecommendedCourses, Course } from '@/lib/courseData'

export default function RecommendedCoursesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [courses, setCourses] = useState<Course[]>([])
  const [weakSkills, setWeakSkills] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get weak skills from URL params or localStorage
    const skillsParam = searchParams.get('skills')

    let skills: string[] = []

    if (skillsParam) {
      // From URL params
      skills = skillsParam.split(',').filter(s => s.trim())
    } else {
      // From localStorage as fallback
      const storedSkills = localStorage.getItem('weakSkills')
      if (storedSkills) {
        skills = JSON.parse(storedSkills)
      }
    }

    if (skills.length === 0) {
      // No skills found, redirect back
      router.push('/upgrade-skill')
      return
    }

    setWeakSkills(skills)

    // Get recommended courses
    const recommendedCourses = getRecommendedCourses(skills)
    setCourses(recommendedCourses)
    setLoading(false)

    // Clear localStorage after reading
    localStorage.removeItem('weakSkills')
  }, [searchParams, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading recommendations...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gray-50"
    >
      {/* Navigation Bar */}
      <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-primary-400 text-white shadow-lg z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Back to Dashboard</span>
            </button>
            <div className="flex items-center gap-3">
              <Sparkles size={24} />
              <h1 className="text-xl font-bold">Your Recommended Courses</h1>
            </div>
            <div className="w-40"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="bg-white rounded-2xl shadow-xl p-6 sm:p-8"
        >
          {/* Welcome Message */}
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              🎓 Personalized Learning Path
            </h2>
            <p className="text-gray-600">
              Based on your submission, we've curated these courses to help you master your target skills.
            </p>
          </div>

          {/* Course Recommendations */}
          <CourseRecommendations courses={courses} weakSkills={weakSkills} />

          {/* Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => router.push('/upgrade-skill')}
              className="px-6 py-3 bg-white border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-medium"
            >
              Submit Another Request
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium shadow-lg"
            >
              Go to Dashboard
            </button>
          </div>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            💡 Next Steps
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">1.</span>
              <span>Review the recommended courses and select ones that match your learning style</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">2.</span>
              <span>Click "Start Learning" to begin your journey with any course</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">3.</span>
              <span>Track your progress in your dashboard as you complete courses</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">4.</span>
              <span>Update your skills profile as you gain new competencies</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </motion.div>
  )
}
