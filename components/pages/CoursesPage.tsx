'use client'

import { motion } from 'framer-motion'
import { BookOpen, Clock, Star, ExternalLink } from 'lucide-react'

export default function CoursesPage() {
  const courses = [
    {
      id: 1,
      title: 'Python for Data Science',
      description: 'Master data analysis and visualization with Python, Pandas, and NumPy',
      thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=250&fit=crop',
      platform: 'Coursera',
      duration: '8 weeks',
      rating: 4.8
    },
    {
      id: 2,
      title: 'Machine Learning Fundamentals',
      description: 'Learn ML algorithms, supervised learning, and neural networks from scratch',
      thumbnail: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=400&h=250&fit=crop',
      platform: 'Udemy',
      duration: '12 weeks',
      rating: 4.7
    },
    {
      id: 3,
      title: 'Advanced React Patterns',
      description: 'Build scalable React applications with hooks, context, and modern patterns',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop',
      platform: 'Udemy',
      duration: '6 weeks',
      rating: 4.9
    },
    {
      id: 4,
      title: 'SQL Database Design',
      description: 'Master database design, queries, and optimization for real-world projects',
      thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&h=250&fit=crop',
      platform: 'DataCamp',
      duration: '4 weeks',
      rating: 4.6
    },
    {
      id: 5,
      title: 'Docker & Kubernetes',
      description: 'Deploy and scale containerized applications with Docker and Kubernetes',
      thumbnail: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=400&h=250&fit=crop',
      platform: 'Udemy',
      duration: '10 weeks',
      rating: 4.7
    },
    {
      id: 6,
      title: 'Data Visualization with Tableau',
      description: 'Create compelling dashboards and tell stories with your data',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
      platform: 'Coursera',
      duration: '5 weeks',
      rating: 4.5
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Recommended Courses</h1>
        <p className="text-gray-600">Curated courses based on your learning goals</p>
      </motion.div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group"
          >
            {/* Thumbnail */}
            <div className="relative h-40 overflow-hidden bg-gray-200">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-gray-700">
                {course.platform}
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                {course.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {course.description}
              </p>

              {/* Meta */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  <span className="font-medium text-gray-700">{course.rating}</span>
                </div>
              </div>

              {/* CTA Button */}
              <button className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <span>Start Learning</span>
                <ExternalLink size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
