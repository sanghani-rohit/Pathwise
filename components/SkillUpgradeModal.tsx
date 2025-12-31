'use client'

import { useState, FormEvent, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { X, Sparkles, CheckCircle, AlertCircle, Loader2, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SkillUpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  userEmail?: string
  userName?: string
}

const skillCategories = {
  'Web Development': ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Node.js', 'Express', 'Next.js', 'Tailwind CSS', 'Bootstrap'],
  'Data Science': ['Python', 'R', 'Pandas', 'NumPy', 'SQL', 'Machine Learning', 'Data Visualization', 'Statistics', 'Jupyter', 'Excel'],
  'DevOps': ['Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'CI/CD', 'Jenkins', 'Git', 'Linux', 'Terraform', 'Ansible'],
  'AI & Generative AI': ['Prompt Engineering', 'NLP', 'TensorFlow', 'PyTorch', 'LangChain', 'OpenAI API', 'Hugging Face', 'GPT Models', 'RAG', 'Vector Databases'],
  'Backend Development': ['Java', 'C#', 'Python', 'Go', 'Ruby', 'PHP', 'Spring Boot', 'Django', 'Flask', '.NET', 'REST APIs', 'GraphQL'],
  'Mobile Development': ['React Native', 'Flutter', 'Swift', 'Kotlin', 'iOS Development', 'Android Development', 'Xamarin'],
  'Database': ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Oracle', 'DynamoDB', 'Cassandra'],
  'Soft Skills': ['Leadership', 'Communication', 'Problem Solving', 'Teamwork', 'Time Management', 'Critical Thinking', 'Presentation Skills']
}

export default function SkillUpgradeModal({ isOpen, onClose, userEmail = '', userName = '' }: SkillUpgradeModalProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [activeSkillType, setActiveSkillType] = useState<'current' | 'strong' | 'weak' | null>(null)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  // Ref for click-outside detection
  const skillSelectionRef = useRef<HTMLDivElement>(null)

  // Form state
  const [formData, setFormData] = useState({
    fullName: userName,
    email: userEmail,
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

  // Click-outside detection to collapse role list
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (skillSelectionRef.current && !skillSelectionRef.current.contains(event.target as Node)) {
        // Close the role list when clicking outside
        setActiveSkillType(null)
        setExpandedCategory(null)
      }
    }

    // Only add listener if there's an active skill type
    if (activeSkillType) {
      document.addEventListener('mousedown', handleClickOutside as EventListener)
      // Also handle touch events for mobile
      document.addEventListener('touchstart', handleClickOutside as EventListener)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside as EventListener)
      document.removeEventListener('touchstart', handleClickOutside as EventListener)
    }
  }, [activeSkillType])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const toggleCategory = (category: string) => {
    setExpandedCategory(prev => prev === category ? null : category)
  }

  const handleSkillToggle = (field: 'currentSkills' | 'strongSkills' | 'weakSkills', skill: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(skill)
        ? prev[field].filter(s => s !== skill)
        : [...prev[field], skill]
    }))
  }

  const getSkillField = (): 'currentSkills' | 'strongSkills' | 'weakSkills' => {
    if (activeSkillType === 'current') return 'currentSkills'
    if (activeSkillType === 'strong') return 'strongSkills'
    return 'weakSkills'
  }

  const handleSkillTypeClick = (type: 'current' | 'strong' | 'weak') => {
    // Toggle behavior: if clicking the same skill type, close it
    if (activeSkillType === type) {
      setActiveSkillType(null)
      setExpandedCategory(null)
    } else {
      // Switch to a different skill type
      setActiveSkillType(type)
      setExpandedCategory(null)
    }
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

    // Validate
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('You must be logged in to submit a skill request')
      }

      // Insert data
      const { error: insertError } = await supabase
        .from('employee_skill_requests')
        .insert([
          {
            user_id: user.id,
            full_name: formData.fullName,
            email: formData.email,
            phone_number: formData.phoneNumber,
            company_name: formData.companyName,
            job_role: formData.currentRole,
            experience_years: parseInt(formData.experienceYears) || 0,
            experience_months: parseInt(formData.experienceMonths) || 0,
            current_skills: formData.currentSkills,
            strong_skills: formData.strongSkills,
            weak_skills: formData.weakSkills,
            target_skill: formData.targetSkill,
            learning_goal: formData.learningGoal,
            preferred_format: formData.preferredFormat,
            skill_level_improvement: formData.skillLevelImprovement
          }
        ])

      if (insertError) throw insertError

      setSuccess(true)

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose()
        // Reset form
        setFormData({
          fullName: userName,
          email: userEmail,
          phoneNumber: '',
          companyName: '',
          currentRole: '',
          experienceYears: '',
          experienceMonths: '',
          currentSkills: [],
          strongSkills: [],
          weakSkills: [],
          targetSkill: '',
          learningGoal: '',
          preferredFormat: '',
          skillLevelImprovement: ''
        })
        setSuccess(false)
        setExpandedCategory(null)
        setActiveSkillType(null)
      }, 2000)

    } catch (err: any) {
      setError(err.message || 'Failed to submit request')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-primary-400 text-white p-6 rounded-t-2xl flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <Sparkles size={28} />
            <h2 className="text-2xl font-bold">Upgrade Your Skills</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="m-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="font-semibold text-green-900">Success!</p>
              <p className="text-sm text-green-700">Your skill upgrade request has been submitted successfully!</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="m-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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

          {/* Skills Assessment - Multi-Step */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <span className="text-primary-600 font-bold">3</span>
              </div>
              Skills Assessment
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              Step 1: Choose skill type → Step 2: Select role category → Step 3: Pick specific skills
            </p>

            {/* Step 1: Skill Type Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Step 1: Select Skill Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => handleSkillTypeClick('current')}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    activeSkillType === 'current'
                      ? 'border-primary-600 bg-primary-50 shadow-md'
                      : 'border-gray-300 bg-white hover:border-primary-300 hover:shadow-sm'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">📋</div>
                    <div className="font-semibold text-gray-900">Current Skills</div>
                    <div className="text-xs text-gray-500 mt-1">{formData.currentSkills.length} selected</div>
                  </div>
                  {activeSkillType === 'current' && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                      <CheckCircle size={16} className="text-white" />
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSkillTypeClick('strong')}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    activeSkillType === 'strong'
                      ? 'border-green-600 bg-green-50 shadow-md'
                      : 'border-gray-300 bg-white hover:border-green-300 hover:shadow-sm'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">💪</div>
                    <div className="font-semibold text-gray-900">Strong Skills</div>
                    <div className="text-xs text-gray-500 mt-1">{formData.strongSkills.length} selected</div>
                  </div>
                  {activeSkillType === 'strong' && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                      <CheckCircle size={16} className="text-white" />
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSkillTypeClick('weak')}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    activeSkillType === 'weak'
                      ? 'border-orange-600 bg-orange-50 shadow-md'
                      : 'border-gray-300 bg-white hover:border-orange-300 hover:shadow-sm'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">🎯</div>
                    <div className="font-semibold text-gray-900">Skills to Improve</div>
                    <div className="text-xs text-gray-500 mt-1">{formData.weakSkills.length} selected</div>
                  </div>
                  {activeSkillType === 'weak' && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center">
                      <CheckCircle size={16} className="text-white" />
                    </div>
                  )}
                </button>
              </div>

              {/* Display Selected Skills */}
              <div className="mt-6 space-y-4">
                {/* Current Skills Display */}
                <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-primary-900">📋 Current Skills:</span>
                    <span className="text-xs text-primary-600">
                      {formData.currentSkills.length > 0
                        ? `${formData.currentSkills.length} selected`
                        : 'None selected yet'}
                    </span>
                  </div>
                  {formData.currentSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {formData.currentSkills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-600 text-white shadow-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-primary-600 italic">No skills selected yet</p>
                  )}
                </div>

                {/* Strong Skills Display */}
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-green-900">💪 Strong Skills:</span>
                    <span className="text-xs text-green-600">
                      {formData.strongSkills.length > 0
                        ? `${formData.strongSkills.length} selected`
                        : 'None selected yet'}
                    </span>
                  </div>
                  {formData.strongSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {formData.strongSkills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-600 text-white shadow-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-green-600 italic">No skills selected yet</p>
                  )}
                </div>

                {/* Skills to Improve Display */}
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-orange-900">🎯 Skills to Improve:</span>
                    <span className="text-xs text-orange-600">
                      {formData.weakSkills.length > 0
                        ? `${formData.weakSkills.length} selected`
                        : 'None selected yet'}
                    </span>
                  </div>
                  {formData.weakSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {formData.weakSkills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-600 text-white shadow-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-orange-600 italic">No skills selected yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Step 2 & 3: Role Categories and Skills */}
            <AnimatePresence mode="wait">
              {activeSkillType && (
                <motion.div
                  ref={skillSelectionRef}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Step 2: Select Role Category, then Step 3: Choose Skills
                  </label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    {Object.entries(skillCategories).map(([category, skills]) => (
                      <div key={category} className="border-b border-gray-200 last:border-b-0">
                        <button
                          type="button"
                          onClick={() => toggleCategory(category)}
                          className={`w-full px-4 py-3 flex justify-between items-center transition-all ${
                            activeSkillType === 'current' ? 'bg-primary-50 hover:bg-primary-100' :
                            activeSkillType === 'strong' ? 'bg-green-50 hover:bg-green-100' :
                            'bg-orange-50 hover:bg-orange-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{category}</span>
                            {formData[getSkillField()].some(s => skills.includes(s)) && (
                              <span className="text-xs px-2 py-0.5 bg-white rounded-full text-gray-600">
                                {formData[getSkillField()].filter(s => skills.includes(s)).length} selected
                              </span>
                            )}
                          </div>
                          <ChevronDown
                            size={20}
                            className={`text-gray-600 transition-transform duration-300 ${
                              expandedCategory === category ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        <AnimatePresence>
                          {expandedCategory === category && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="p-4 bg-white border-t border-gray-200">
                                <div className="flex flex-wrap gap-2">
                                  {skills.map(skill => {
                                    const skillField = getSkillField()
                                    const isSelected = formData[skillField].includes(skill)
                                    return (
                                      <button
                                        key={skill}
                                        type="button"
                                        onClick={() => handleSkillToggle(skillField, skill)}
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                                          isSelected
                                            ? activeSkillType === 'current' ? 'bg-primary-600 text-white shadow-md' :
                                              activeSkillType === 'strong' ? 'bg-green-600 text-white shadow-md' :
                                              'bg-orange-600 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                      >
                                        {skill}
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Summary */}
            {!activeSkillType && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Current Skills:</span>
                    <span className={formData.currentSkills.length > 0 ? 'text-primary-600 font-medium' : 'text-gray-400'}>
                      {formData.currentSkills.length} selected
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Strong Skills:</span>
                    <span className={formData.strongSkills.length > 0 ? 'text-green-600 font-medium' : 'text-gray-400'}>
                      {formData.strongSkills.length} selected
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Skills to Improve:</span>
                    <span className={formData.weakSkills.length > 0 ? 'text-orange-600 font-medium' : 'text-gray-400'}>
                      {formData.weakSkills.length} selected
                    </span>
                  </div>
                </div>
              </div>
            )}
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
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
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
      </div>
    </div>
  )
}
