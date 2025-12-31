'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { useApp } from '@/contexts/AppContext'
import { ArrowLeft, ArrowRight, Sparkles, BookOpen, Clock, Star, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const { isFormSubmitted, setLastRoute } = useApp()

  useEffect(() => {
    // Save current route
    if (pathname) {
      setLastRoute(pathname)
    }
  }, [pathname, setLastRoute])

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)

        // If user already submitted form, redirect to personal dashboard
        if (isFormSubmitted) {
          router.push('/personal-dashboard')
        }
      }
      setLoading(false)
    }

    checkUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [router, isFormSubmitted])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Sample recommended courses
  const recommendedCourses = [
    {
      id: 1,
      title: 'Python for Data Science',
      platform: 'Coursera',
      duration: '6 weeks',
      rating: 4.8,
      thumbnail: '/api/placeholder/400/250',
      description: 'Learn Python programming fundamentals for data analysis'
    },
    {
      id: 2,
      title: 'Machine Learning Basics',
      platform: 'edX',
      duration: '8 weeks',
      rating: 4.7,
      thumbnail: '/api/placeholder/400/250',
      description: 'Introduction to machine learning algorithms and applications'
    },
    {
      id: 3,
      title: 'Web Development Bootcamp',
      platform: 'Udemy',
      duration: '12 weeks',
      rating: 4.9,
      thumbnail: '/api/placeholder/400/250',
      description: 'Complete web development course from basics to advanced'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="sticky top-0 bg-white shadow-sm z-20 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 py-3 text-primary-600 hover:text-primary-700 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back to Homepage</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to PathWise! 👋
          </h1>
          <p className="text-lg text-gray-600">
            Start your personalized learning journey today
          </p>
        </motion.div>

        {/* CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-primary-600 to-primary-400 rounded-2xl p-8 mb-8 text-white shadow-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <Sparkles size={32} />
            <h2 className="text-2xl font-bold">Ready to Upgrade Your Skills?</h2>
          </div>
          <p className="text-primary-50 mb-6 text-lg">
            Tell us about your current skills and learning goals to get personalized course recommendations powered by AI.
          </p>
          <button
            onClick={() => router.push('/upgrade-skill')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-600 rounded-lg hover:bg-primary-50 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Improve Skills
            <ArrowRight size={20} />
          </button>
        </motion.div>

        {/* Recommended Courses Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="text-primary-600" size={28} />
              Popular Courses
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {recommendedCourses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="h-40 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                  <BookOpen size={48} className="text-primary-600" />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{course.description}</p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star size={16} className="text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold text-gray-900">{course.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{course.platform}</span>
                    <button className="px-4 py-2 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200 transition-colors text-sm font-medium">
                      View Course
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl p-8 shadow-lg"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">Why Start Your Skill Assessment?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-3">
                <Sparkles className="text-primary-600" size={24} />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">AI-Powered Recommendations</h4>
              <p className="text-sm text-gray-600">
                Get personalized course suggestions based on your unique skill profile
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-3">
                <TrendingUp className="text-primary-600" size={24} />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Track Your Progress</h4>
              <p className="text-sm text-gray-600">
                Monitor your learning journey and celebrate your achievements
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-3">
                <BookOpen className="text-primary-600" size={24} />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Curated Content</h4>
              <p className="text-sm text-gray-600">
                Access high-quality courses from top platforms and instructors
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
