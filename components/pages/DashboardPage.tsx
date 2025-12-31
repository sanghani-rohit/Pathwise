'use client'

import { motion } from 'framer-motion'
import { BookOpen, Clock, Trophy, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  const progressData = [
    { skill: 'Python', progress: 75, color: 'bg-blue-500' },
    { skill: 'Machine Learning', progress: 45, color: 'bg-green-500' },
    { skill: 'Data Visualization', progress: 60, color: 'bg-purple-500' },
    { skill: 'SQL', progress: 85, color: 'bg-orange-500' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Dashboard</h1>
        <p className="text-gray-600">Track your progress and achievements</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Study Time', value: '24h', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Courses In Progress', value: '3', icon: BookOpen, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Certificates Earned', value: '5', icon: Trophy, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Skill Growth', value: '+12%', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' }
        ].map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <div className={`${stat.bg} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                <Icon className={stat.color} size={24} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Skill Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl p-6 shadow-lg"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-6">Skill Progress</h2>
        <div className="space-y-6">
          {progressData.map((skill, index) => (
            <div key={skill.skill}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-900">{skill.skill}</span>
                <span className="text-sm text-gray-600">{skill.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${skill.progress}%` }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
                  className={`h-full ${skill.color} rounded-full`}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Learning Activity Chart Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl p-6 shadow-lg"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Weekly Learning Activity</h2>
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <TrendingUp size={48} className="text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Chart visualization coming soon</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
