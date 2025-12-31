'use client'

import { useState } from 'react'
import { Search, ChevronDown, CheckCircle, X } from 'lucide-react'
import { rolesData, searchRoles, getSkillsForRole } from '@/lib/rolesData'
import { motion, AnimatePresence } from 'framer-motion'

interface RoleSkillSelectorProps {
  selectedSkills: string[]
  onSkillsChange: (skills: string[]) => void
  skillType: 'current' | 'strong' | 'weak'
}

export default function RoleSkillSelector({
  selectedSkills,
  onSkillsChange,
  skillType
}: RoleSkillSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [showAllRoles, setShowAllRoles] = useState(false)

  // Get filtered roles based on search
  const filteredRoles = searchQuery
    ? searchRoles(searchQuery)
    : rolesData

  // Show 6 roles by default, all if expanded
  const displayedRoles = showAllRoles ? filteredRoles : filteredRoles.slice(0, 6)

  // Get skills for selected role
  const availableSkills = selectedRole ? getSkillsForRole(selectedRole) : []

  const handleRoleClick = (roleName: string) => {
    if (selectedRole === roleName) {
      // Deselect role
      setSelectedRole(null)
    } else {
      setSelectedRole(roleName)
    }
  }

  const handleSkillToggle = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      onSkillsChange(selectedSkills.filter(s => s !== skill))
    } else {
      onSkillsChange([...selectedSkills, skill])
    }
  }

  const handleClearRole = () => {
    setSelectedRole(null)
    setSearchQuery('')
  }

  // Color schemes for different skill types
  const colorScheme = {
    current: {
      bg: 'bg-primary-50',
      border: 'border-primary-600',
      text: 'text-primary-600',
      hover: 'hover:bg-primary-100',
      selected: 'bg-primary-600 text-white'
    },
    strong: {
      bg: 'bg-green-50',
      border: 'border-green-600',
      text: 'text-green-600',
      hover: 'hover:bg-green-100',
      selected: 'bg-green-600 text-white'
    },
    weak: {
      bg: 'bg-orange-50',
      border: 'border-orange-600',
      text: 'text-orange-600',
      hover: 'hover:bg-orange-100',
      selected: 'bg-orange-600 text-white'
    }
  }

  const colors = colorScheme[skillType]

  return (
    <div className="space-y-2">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a role..."
          className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Selected Role Display */}
      {selectedRole && (
        <div className={`px-3 py-2 ${colors.bg} border ${colors.border} rounded flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600">Selected:</span>
            <span className={`text-sm font-semibold ${colors.text}`}>{selectedRole}</span>
          </div>
          <button
            type="button"
            onClick={handleClearRole}
            className="p-1 hover:bg-white/50 rounded transition"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Role List */}
      {!selectedRole && (
        <div className="space-y-1">
          <div className="flex flex-col gap-2">
            {displayedRoles.map((role) => (
              <button
                key={role.role_name}
                type="button"
                onClick={() => handleRoleClick(role.role_name)}
                className={`w-full px-3 py-2 border rounded text-left transition-all ${
                  selectedRole === role.role_name
                    ? `${colors.border} border-2 ${colors.bg}`
                    : `border-gray-200 hover:bg-gray-50 hover:border-gray-300 bg-white`
                }`}
              >
                <div className="text-sm text-gray-900">{role.role_name}</div>
              </button>
            ))}
          </div>

          {/* Show More/Less Button */}
          {filteredRoles.length > 6 && (
            <button
              type="button"
              onClick={() => setShowAllRoles(!showAllRoles)}
              className="w-full py-2 text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center justify-center gap-1 mt-1"
            >
              {showAllRoles ? 'Show Less' : 'All Roles'}
              <ChevronDown
                size={14}
                className={`transform transition-transform ${showAllRoles ? 'rotate-180' : ''}`}
              />
            </button>
          )}

          {/* No Results */}
          {filteredRoles.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              <p className="text-sm">No roles found for "{searchQuery}"</p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-2 text-primary-600 hover:underline text-xs"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      )}

      {/* Skills List (shown when role is selected) */}
      <AnimatePresence>
        {selectedRole && availableSkills.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="border border-gray-300 rounded p-3 bg-white">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm text-gray-900">
                  Select Skills from {selectedRole}
                </h4>
                <span className="text-xs text-gray-500">
                  {selectedSkills.length} selected
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {availableSkills.map((skill) => {
                  const isSelected = selectedSkills.includes(skill)
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleSkillToggle(skill)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? `${colors.selected}`
                          : `bg-gray-100 text-gray-700 hover:bg-gray-200`
                      }`}
                    >
                      {skill}
                      {isSelected && <CheckCircle size={12} className="inline ml-1" />}
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Skills Summary (always visible) */}
      {selectedSkills.length > 0 && (
        <div className={`p-3 ${colors.bg} border ${colors.border} rounded`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-900">
              Selected Skills ({selectedSkills.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedSkills.map((skill) => (
              <span
                key={skill}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${colors.selected}`}
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleSkillToggle(skill)}
                  className="hover:bg-white/20 rounded-full p-0.5 transition"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
