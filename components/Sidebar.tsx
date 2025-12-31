'use client'

import { useApp } from '@/contexts/AppContext'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  Home,
  BarChart3,
  GraduationCap,
  User,
  Bell,
  LogOut,
  Menu,
  X,
  ClipboardCheck,
  Map
} from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const menuItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'courses', label: 'Recommended Courses', icon: GraduationCap },
  { id: 'assessment', label: 'Pre-Post Assessment', icon: ClipboardCheck },
  { id: 'roadmap', label: 'Roadmap', icon: Map },
  { id: 'profile', label: 'User Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell }
]

export default function Sidebar() {
  const { currentPage, setCurrentPage, setFormSubmitted } = useApp()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setFormSubmitted(false)
    setCurrentPage('home')
    localStorage.clear()
    router.push('/')
  }

  const handleMenuClick = (pageId: string) => {
    if (pageId === 'roadmap') {
      router.push('/roadmap')
      setIsMobileOpen(false)
    } else {
      setCurrentPage(pageId)
      setIsMobileOpen(false)
    }
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-primary-600 text-white rounded-lg shadow-lg hover:bg-primary-700 transition-colors"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isMobileOpen || window.innerWidth >= 1024 ? 0 : -280,
          width: isCollapsed ? 80 : 240
        }}
        className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-primary-700 to-primary-900 text-white shadow-2xl z-40 transition-all duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ width: isCollapsed ? '80px' : '240px' }}
      >
        {/* Logo/Brand */}
        <div className="h-16 flex items-center justify-between px-3 border-b border-white/10">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 overflow-hidden"
            >
              <GraduationCap size={24} className="text-primary-200 flex-shrink-0" />
              <h1 className="text-lg font-bold whitespace-nowrap overflow-hidden text-ellipsis">PathWise</h1>
            </motion.div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:block p-1.5 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 py-6 px-2 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = item.id === 'roadmap'
                ? pathname === '/roadmap'
                : currentPage === item.id

              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleMenuClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      isActive
                        ? 'bg-white/20 shadow-lg'
                        : 'hover:bg-white/10'
                    }`}
                  >
                    <Icon size={20} className={`flex-shrink-0 ${isActive ? 'text-primary-100' : 'text-white'}`} />
                    {!isCollapsed && (
                      <span className={`text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis ${isActive ? 'text-white' : 'text-gray-200'}`}>
                        {item.label}
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-600/30 transition-all group"
          >
            <LogOut size={20} className="flex-shrink-0 text-red-300 group-hover:text-red-200" />
            {!isCollapsed && (
              <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis text-red-300 group-hover:text-red-200">
                Logout
              </span>
            )}
          </button>
        </div>
      </motion.aside>

      {/* Spacer for desktop */}
      <div
        className="hidden lg:block"
        style={{ width: isCollapsed ? '80px' : '240px', flexShrink: 0 }}
      />
    </>
  )
}
