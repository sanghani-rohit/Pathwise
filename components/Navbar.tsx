'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { Menu, X, LogOut } from 'lucide-react'

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [hasCompletedSkillForm, setHasCompletedSkillForm] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // Check if user has completed skill form
  const checkSkillFormCompletion = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('skill_requests')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle()

      setHasCompletedSkillForm(!!data)

      // Store in localStorage for persistence
      if (data) {
        localStorage.setItem('hasCompletedSkillForm', 'true')
      } else {
        localStorage.removeItem('hasCompletedSkillForm')
      }
    } catch (error) {
      console.error('Error checking skill form completion:', error)
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)

      // Check skill form completion if user is logged in
      if (session?.user) {
        checkSkillFormCompletion(session.user.id)
      } else {
        setHasCompletedSkillForm(false)
        localStorage.removeItem('hasCompletedSkillForm')
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)

      // Check skill form completion on auth change
      if (session?.user) {
        checkSkillFormCompletion(session.user.id)
      } else {
        setHasCompletedSkillForm(false)
        localStorage.removeItem('hasCompletedSkillForm')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              PathWise
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`${
                pathname === '/' ? 'text-primary-600' : 'text-gray-700'
              } hover:text-primary-600 transition-colors`}
            >
              Home
            </Link>

            {user ? (
              <>
                <Link
                  href="/personal-dashboard"
                  className={`${
                    pathname === '/personal-dashboard' ? 'text-primary-600' : 'text-gray-700'
                  } hover:text-primary-600 transition-colors flex items-center gap-1`}
                >
                  Personal Dashboard
                </Link>
                {hasCompletedSkillForm && (
                  <Link
                    href="/roadmap"
                    className={`${
                      pathname === '/roadmap' ? 'text-primary-600' : 'text-gray-700'
                    } hover:text-primary-600 transition-colors flex items-center gap-1`}
                  >
                    Roadmap
                  </Link>
                )}
                <Link
                  href="/upgrade-skill"
                  className={`${
                    pathname === '/upgrade-skill' ? 'text-primary-600' : 'text-gray-700'
                  } hover:text-primary-600 transition-colors flex items-center gap-1`}
                >
                  Skill Form
                  {hasCompletedSkillForm && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      ✓ Filled
                    </span>
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link
              href="/"
              className="block text-gray-700 hover:text-primary-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>

            {user ? (
              <>
                <Link
                  href="/personal-dashboard"
                  className="block text-gray-700 hover:text-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Personal Dashboard
                </Link>
                {hasCompletedSkillForm && (
                  <Link
                    href="/roadmap"
                    className="block text-gray-700 hover:text-primary-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Roadmap
                  </Link>
                )}
                <Link
                  href="/upgrade-skill"
                  className="block text-gray-700 hover:text-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center gap-2">
                    Skill Form
                    {hasCompletedSkillForm && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                        ✓ Filled
                      </span>
                    )}
                  </div>
                </Link>
                <button
                  onClick={() => {
                    handleLogout()
                    setIsMenuOpen(false)
                  }}
                  className="flex items-center gap-2 w-full text-left text-gray-700 hover:text-primary-600"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block text-gray-700 hover:text-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
