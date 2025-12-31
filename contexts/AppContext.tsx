'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AppContextType {
  isFormSubmitted: boolean
  setFormSubmitted: (value: boolean) => void
  currentPage: string
  setCurrentPage: (page: string) => void
  userName: string
  setUserName: (name: string) => void
  isContextLoaded: boolean
  lastRoute: string
  setLastRoute: (route: string) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [isFormSubmitted, setIsFormSubmitted] = useState(false)
  const [currentPage, setCurrentPage] = useState('home')
  const [userName, setUserName] = useState('')
  const [isContextLoaded, setIsContextLoaded] = useState(false)
  const [lastRoute, setLastRouteState] = useState('/')

  // Load state from localStorage on mount
  useEffect(() => {
    const formSubmitted = localStorage.getItem('isFormSubmitted')
    const savedPage = localStorage.getItem('currentPage')
    const savedUserName = localStorage.getItem('userName')
    const savedRoute = localStorage.getItem('lastRoute')

    if (formSubmitted === 'true') {
      setIsFormSubmitted(true)
    }
    if (savedPage) {
      setCurrentPage(savedPage)
    }
    if (savedUserName) {
      setUserName(savedUserName)
    }
    if (savedRoute) {
      setLastRouteState(savedRoute)
    }

    // Mark context as loaded
    setIsContextLoaded(true)
  }, [])

  // Save state to localStorage whenever it changes
  const setFormSubmitted = (value: boolean) => {
    setIsFormSubmitted(value)
    localStorage.setItem('isFormSubmitted', value.toString())
  }

  const handleSetCurrentPage = (page: string) => {
    setCurrentPage(page)
    localStorage.setItem('currentPage', page)
  }

  const handleSetUserName = (name: string) => {
    setUserName(name)
    localStorage.setItem('userName', name)
  }

  const setLastRoute = (route: string) => {
    setLastRouteState(route)
    localStorage.setItem('lastRoute', route)
  }

  return (
    <AppContext.Provider
      value={{
        isFormSubmitted,
        setFormSubmitted,
        currentPage,
        setCurrentPage: handleSetCurrentPage,
        userName,
        setUserName: handleSetUserName,
        isContextLoaded,
        lastRoute,
        setLastRoute
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
