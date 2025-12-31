'use client'

import { Course } from '@/lib/courseData'
import { BookOpen, Clock, Star, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'

interface CourseRecommendationsProps {
  courses: Course[]
  weakSkills: string[]
}

export default function CourseRecommendations({ courses, weakSkills }: CourseRecommendationsProps) {
  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Courses Found</h3>
        <p className="text-sm text-gray-600">
          We couldn't find courses matching your skills. Try selecting different skills.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Recommended Courses for You
        </h2>
        <p className="text-sm text-gray-600">
          Based on your selected skills to improve:{' '}
          <span className="font-semibold text-primary-600">
            {weakSkills.join(', ')}
          </span>
        </p>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
          >
            {/* Course Thumbnail */}
            <div className="relative h-40 overflow-hidden bg-gray-200">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              {/* Platform Badge */}
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-gray-700">
                {course.platform}
              </div>
              {/* Level Badge */}
              <div className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-semibold ${
                course.level === 'beginner' ? 'bg-green-100 text-green-700' :
                course.level === 'intermediate' ? 'bg-blue-100 text-blue-700' :
                'bg-purple-100 text-purple-700'
              }`}>
                {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
              </div>
            </div>

            {/* Course Content */}
            <div className="p-4">
              {/* Title */}
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                {course.title}
              </h3>

              {/* Description */}
              <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                {course.description}
              </p>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {course.skills.slice(0, 3).map((skill) => (
                  <span
                    key={skill}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      weakSkills.some(ws =>
                        ws.toLowerCase().includes(skill.toLowerCase()) ||
                        skill.toLowerCase().includes(ws.toLowerCase())
                      )
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {skill}
                  </span>
                ))}
                {course.skills.length > 3 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">
                    +{course.skills.length - 3} more
                  </span>
                )}
              </div>

              {/* Meta Information */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>{course.duration}</span>
                </div>
                {course.rating && (
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                    <span className="font-medium text-gray-700">{course.rating}</span>
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <button
                onClick={() => window.open(course.url, '_blank')}
                className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 group"
              >
                <span>Start Learning</span>
                <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer Message */}
      {courses.length >= 12 && (
        <div className="text-center pt-4">
          <p className="text-sm text-gray-600">
            Showing top {courses.length} recommended courses
          </p>
        </div>
      )}
    </div>
  )
}
