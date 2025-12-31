'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { useApp } from '@/contexts/AppContext'
import DashboardLayout from '@/components/DashboardLayout'
import { ArrowLeft } from 'lucide-react'

export default function PersonalDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const { isFormSubmitted, setFormSubmitted, isContextLoaded, setLastRoute } = useApp()

  useEffect(() => {
    // Save current route
    if (pathname) {
      setLastRoute(pathname)
    }
  }, [pathname, setLastRoute])

  useEffect(() => {
    // Wait for context to load before making routing decisions
    if (!isContextLoaded) {
      return
    }

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        setLoading(false)
        return
      }

      setUser(session.user)

      // Check if user has completed onboarding by checking user_skills table
      const { data: userSkills } = await supabase
        .from('user_skills')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle()

      // If user skills exists in DB, mark form as submitted
      if (userSkills) {
        setFormSubmitted(true)
        setLoading(false)
      } else if (!isFormSubmitted) {
        // Only redirect if we're sure they haven't submitted
        router.push('/upgrade-skill')
        setLoading(false)
      } else {
        setLoading(false)
      }
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
  }, [router, isFormSubmitted, isContextLoaded, setFormSubmitted])

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

  if (!user || !isFormSubmitted) {
    return null
  }

  return (
    <>
      {/* Back Button */}
      <div className="sticky top-0 bg-white shadow-sm z-20 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.push('/upgrade-skill')}
            className="flex items-center gap-2 py-3 text-primary-600 hover:text-primary-700 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>
      </div>
      <DashboardLayout />
    </>
  )
}
