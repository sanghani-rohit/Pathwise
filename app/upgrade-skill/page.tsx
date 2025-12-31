'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Sparkles, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import RoleSkillSelector from '@/components/RoleSkillSelector'
import { useApp } from '@/contexts/AppContext'

export default function UpgradeSkillPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { setFormSubmitted, setUserName, setLastRoute } = useApp()

  useEffect(() => {
    // Save current route
    if (pathname) {
      setLastRoute(pathname)
    }
  }, [pathname, setLastRoute])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)
  const [hasExistingForm, setHasExistingForm] = useState(false)
  const [isEditingExisting, setIsEditingExisting] = useState(false)

  // Get user data and check for existing form
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
        setFormData(prev => ({
          ...prev,
          email: user.email || '',
          fullName: user.user_metadata?.full_name || ''
        }))

        // Check if user has already completed onboarding (check new tables first)
        const { data: existingProfile } = await supabase
          .from('user_profile')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        const { data: existingSkills } = await supabase
          .from('user_skills')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        // Check if user has completed onboarding
        if (existingProfile || existingSkills) {
          setHasExistingForm(true)
          console.log('User has completed onboarding')
        }
      }
    }
    getUser()
  }, [router])

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    companyName: '',
    currentRole: '',
    experienceYears: '',
    experienceMonths: '',
    currentSkills: [] as string[],
    strongSkills: [] as string[],
    weakSkills: [] as string[],
    targetSkill: '',
    learningGoal: '',
    preferredFormat: '',
    skillLevelImprovement: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (!formData.fullName.trim()) return 'Full name is required'
    if (!formData.email.trim()) return 'Email is required'
    if (!/\S+@\S+\.\S+/.test(formData.email)) return 'Invalid email format'
    if (!formData.phoneNumber.trim()) return 'Phone number is required'
    if (!formData.companyName.trim()) return 'Company name is required'
    if (!formData.currentRole.trim()) return 'Current role is required'
    if (!formData.experienceYears && !formData.experienceMonths) return 'Experience is required'
    if (formData.currentSkills.length === 0) return 'Select at least one current skill'
    if (formData.strongSkills.length === 0) return 'Select at least one strong skill'
    if (formData.weakSkills.length === 0) return 'Select at least one weak skill'
    if (!formData.targetSkill.trim()) return 'Target skill is required'
    if (!formData.learningGoal.trim()) return 'Learning goal is required'
    if (!formData.preferredFormat) return 'Preferred learning format is required'
    if (!formData.skillLevelImprovement) return 'Skill level improvement is required'
    return null
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session || !session.user || !session.access_token) {
        throw new Error('You must be logged in to submit a skill request')
      }

      // Map skill level improvement to skill_level enum
      const getSkillLevel = (improvement: string): 'beginner' | 'intermediate' | 'advanced' | 'beginner-to-intermediate' | 'intermediate-to-advanced' => {
        if (improvement.includes('Beginner → Intermediate')) return 'beginner-to-intermediate'
        if (improvement.includes('Intermediate → Advanced')) return 'intermediate-to-advanced'
        if (improvement.includes('Advanced → Expert')) return 'advanced'
        return 'intermediate' // Default
      }

      // Prepare onboarding data for new tables
      const onboardingData = {
        // user_profile fields
        full_name: formData.fullName.trim(),
        email: formData.email.trim(),
        phone_number: formData.phoneNumber.trim(),
        company_name: formData.companyName.trim(),

        // user_skills fields
        job_role: formData.currentRole.trim(),
        years_of_experience: parseInt(formData.experienceYears) || 0,
        months_of_experience: parseInt(formData.experienceMonths) || 0,
        current_skills: formData.currentSkills,
        strong_skills: formData.strongSkills,
        skills_to_improve: formData.weakSkills,
        learning_goals: `${formData.targetSkill.trim()} - ${formData.learningGoal.trim()}`,
        skill_level: getSkillLevel(formData.skillLevelImprovement)
      }

      console.log('Submitting onboarding data:', onboardingData)

      // Call new API endpoint to save to user_profile and user_skills tables
      const response = await fetch('/api/save-onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(onboardingData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Failed to save onboarding data')
      }

      console.log('Onboarding saved successfully:', result)

      setSuccess(true)

      // Store user name and set form as submitted
      setUserName(formData.fullName)
      setFormSubmitted(true)

      // Store weak skills and redirect to personal dashboard
      localStorage.setItem('weakSkills', JSON.stringify(formData.weakSkills))

      // Redirect to personal dashboard after brief delay
      setTimeout(() => {
        router.push('/personal-dashboard')
      }, 1500)

    } catch (err: any) {
      console.error('Form submission error:', err)
      setError(err.message || 'Failed to submit request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gray-50"
    >
      {/* Back Button */}
      <div className="sticky top-0 bg-white shadow-sm z-20 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 py-3 text-primary-600 hover:text-primary-700 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-400 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-16">
            <div className="flex items-center gap-3">
              <Sparkles size={24} />
              <h1 className="text-xl font-bold">Upgrade Your Skills</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="bg-white rounded-2xl shadow-xl p-6 sm:p-8"
        >
          {/* Existing Form Notice */}
          {hasExistingForm && !isEditingExisting && (
            <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <CheckCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="font-semibold text-blue-900">✓ You've Already Completed This Form</p>
                  <p className="text-sm text-blue-700 mt-1">
                    You have already filled the skill improvement form. You can view your personalized dashboard or update your information below if needed.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push('/personal-dashboard')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Go to Personal Dashboard
                </button>
                <button
                  onClick={() => setIsEditingExisting(true)}
                  className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                >
                  Update My Information
                </button>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-semibold text-green-900">Success!</p>
                <p className="text-sm text-green-700">
                  Your skill upgrade request has been submitted successfully!
                  Redirecting to your dashboard...
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <span className="text-primary-600 font-bold">1</span>
                </div>
                Personal Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="john@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Acme Corp"
                  />
                </div>
              </div>
            </div>

            {/* Professional Background */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <span className="text-primary-600 font-bold">2</span>
                </div>
                Professional Background
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Role / Designation <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="currentRole"
                    value={formData.currentRole}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Senior Software Engineer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="experienceYears"
                    value={formData.experienceYears}
                    onChange={handleInputChange}
                    min="0"
                    max="50"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Months of Experience
                  </label>
                  <input
                    type="number"
                    name="experienceMonths"
                    value={formData.experienceMonths}
                    onChange={handleInputChange}
                    min="0"
                    max="11"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="6"
                  />
                </div>
              </div>
            </div>

            {/* Skills Assessment */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <span className="text-primary-600 font-bold">3</span>
                </div>
                Skills Assessment
              </h3>

              <p className="text-sm text-gray-600 mb-6">
                Select a role to view and choose relevant skills for each category
              </p>

              {/* Current Skills */}
              <div className="mb-6">
                <label className="block text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-2xl">📋</span>
                  Current Skills <span className="text-red-500">*</span>
                </label>
                <RoleSkillSelector
                  selectedSkills={formData.currentSkills}
                  onSkillsChange={(skills) => setFormData(prev => ({ ...prev, currentSkills: skills }))}
                  skillType="current"
                />
              </div>

              {/* Strong Skills */}
              <div className="mb-6">
                <label className="block text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-2xl">💪</span>
                  Strong Skills <span className="text-red-500">*</span>
                </label>
                <RoleSkillSelector
                  selectedSkills={formData.strongSkills}
                  onSkillsChange={(skills) => setFormData(prev => ({ ...prev, strongSkills: skills }))}
                  skillType="strong"
                />
              </div>

              {/* Skills to Improve */}
              <div className="mb-6">
                <label className="block text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  Skills to Improve <span className="text-red-500">*</span>
                </label>
                <RoleSkillSelector
                  selectedSkills={formData.weakSkills}
                  onSkillsChange={(skills) => setFormData(prev => ({ ...prev, weakSkills: skills }))}
                  skillType="weak"
                />
              </div>
            </div>

            {/* Learning Goals */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <span className="text-primary-600 font-bold">4</span>
                </div>
                Learning Goals
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Skill to Learn <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="targetSkill"
                    value={formData.targetSkill}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Advanced React Patterns"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Learning Goal or Motivation <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="learningGoal"
                    value={formData.learningGoal}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Why do you want to learn this skill? What do you hope to achieve?"
                  />
                </div>
              </div>
            </div>

            {/* Learning Preferences */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <span className="text-primary-600 font-bold">5</span>
                </div>
                Learning Preferences
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Learning Format <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="preferredFormat"
                    value={formData.preferredFormat}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select format</option>
                    <option value="Video">Video Tutorials</option>
                    <option value="Reading">Reading / Articles</option>
                    <option value="Projects">Hands-on Projects</option>
                    <option value="Mixed">Mixed (All formats)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Want to Improve Skill Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="skillLevelImprovement"
                    value={formData.skillLevelImprovement}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select level</option>
                    <option value="Beginner → Intermediate">Beginner → Intermediate</option>
                    <option value="Intermediate → Advanced">Intermediate → Advanced</option>
                    <option value="Advanced → Expert">Advanced → Expert</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                disabled={loading}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  )
}
