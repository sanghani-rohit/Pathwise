'use client'

import { useApp } from '@/contexts/AppContext'
import Sidebar from './Sidebar'
import HomePage from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import CoursesPage from './pages/CoursesPage'
import AssessmentPage from './pages/AssessmentPage'
import ProfilePage from './pages/ProfilePage'
import NotificationsPage from './pages/NotificationsPage'
import { motion } from 'framer-motion'

export default function DashboardLayout() {
  const { currentPage } = useApp()

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />
      case 'dashboard':
        return <DashboardPage />
      case 'courses':
        return <CoursesPage />
      case 'assessment':
        return <AssessmentPage />
      case 'profile':
        return <ProfilePage />
      case 'notifications':
        return <NotificationsPage />
      default:
        return <HomePage />
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderPage()}
          </motion.div>
        </div>
      </main>
    </div>
  )
}
