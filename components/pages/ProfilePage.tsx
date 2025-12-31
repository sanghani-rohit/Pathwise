'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Briefcase, MapPin, Edit2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface UserProfileData {
  full_name: string
  email: string
  phone_number: string | null
  company_name: string | null
  job_role: string
  current_skills: string[]
  strong_skills: string[]
}

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<UserProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfileData()

    // Set up realtime subscription for profile changes
    const profileChannel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_profile'
        },
        () => {
          fetchProfileData()
        }
      )
      .subscribe()

    // Set up realtime subscription for skills changes
    const skillsChannel = supabase
      .channel('skills-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_skills'
        },
        () => {
          fetchProfileData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(profileChannel)
      supabase.removeChannel(skillsChannel)
    }
  }, [])

  async function fetchProfileData() {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        setLoading(false)
        return
      }

      // Fetch profile and skills data
      const [profileResult, skillsResult] = await Promise.all([
        supabase
          .from('user_profile')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle(),
        supabase
          .from('user_skills')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle()
      ])

      if (profileResult.data && skillsResult.data) {
        setProfileData({
          full_name: profileResult.data.full_name,
          email: profileResult.data.email,
          phone_number: profileResult.data.phone_number,
          company_name: profileResult.data.company_name,
          job_role: skillsResult.data.job_role,
          current_skills: skillsResult.data.current_skills || [],
          strong_skills: skillsResult.data.strong_skills || []
        })
      }
    } catch (error) {
      console.error('Error fetching profile data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Combine current and strong skills, remove duplicates
  const allSkills = profileData
    ? Array.from(new Set([...profileData.current_skills, ...profileData.strong_skills]))
    : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Profile</h1>
        <p className="text-gray-600">Manage your personal information and skills</p>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      )}

      {/* Profile Card */}
      {!loading && profileData && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            {/* Cover */}
            <div className="h-32 bg-gradient-to-r from-primary-600 to-primary-400"></div>

            {/* Profile Info */}
            <div className="px-8 pb-8">
              {/* Avatar */}
              <div className="relative -mt-16 mb-4">
                <div className="w-32 h-32 rounded-full bg-white p-2 shadow-xl">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                    <User size={48} className="text-white" />
                  </div>
                </div>
                <button className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors">
                  <Edit2 size={16} className="text-gray-600" />
                </button>
              </div>

              {/* Name and Role */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{profileData.full_name}</h2>
                <p className="text-gray-600">{profileData.job_role}</p>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail size={20} className="text-primary-600" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{profileData.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone size={20} className="text-primary-600" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900">
                      {profileData.phone_number || 'Not provided'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Briefcase size={20} className="text-primary-600" />
                  <div>
                    <p className="text-xs text-gray-500">Company</p>
                    <p className="text-sm font-medium text-gray-900">
                      {profileData.company_name || 'Not provided'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin size={20} className="text-primary-600" />
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="text-sm font-medium text-gray-900">India</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Skills Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">My Skills</h3>
              <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                Edit Skills
              </button>
            </div>
            {allSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {allSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No skills added yet</p>
            )}
          </motion.div>
        </>
      )}

      {/* Empty State */}
      {!loading && !profileData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-12 shadow-lg text-center"
        >
          <User size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No profile data found</h3>
          <p className="text-gray-600">Please complete the skill form to set up your profile</p>
        </motion.div>
      )}
    </div>
  )
}
