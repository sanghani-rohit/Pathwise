/**
 * Navigation utility functions for managing routes and redirects
 */

/**
 * Get the last visited route from localStorage
 * @param defaultPath - Default path to return if no saved route exists
 * @returns The last visited route or default path
 */
export const getLastRoute = (defaultPath: string = '/dashboard'): string => {
  if (typeof window === 'undefined') return defaultPath

  const lastRoute = localStorage.getItem('lastRoute')
  return lastRoute || defaultPath
}

/**
 * Save the current route to localStorage
 * @param route - The route path to save
 */
export const saveLastRoute = (route: string): void => {
  if (typeof window === 'undefined') return

  localStorage.setItem('lastRoute', route)
}

/**
 * Redirect to the last visited page or default path
 * @param router - Next.js router instance
 * @param defaultPath - Default path if no saved route exists
 */
export const redirectToLastPage = (
  router: any,
  defaultPath: string = '/dashboard'
): void => {
  const lastRoute = getLastRoute(defaultPath)
  router.push(lastRoute)
}

/**
 * Clear all saved navigation state
 */
export const clearNavigationState = (): void => {
  if (typeof window === 'undefined') return

  localStorage.removeItem('lastRoute')
  localStorage.removeItem('currentPage')
}

/**
 * Determine the correct redirect path based on auth and form submission status
 * @param isAuthenticated - Whether user is logged in
 * @param hasSubmittedForm - Whether user has completed skill form
 * @returns The appropriate redirect path
 */
export const getRedirectPath = (
  isAuthenticated: boolean,
  hasSubmittedForm: boolean
): string => {
  if (!isAuthenticated) {
    return '/'
  }

  if (hasSubmittedForm) {
    // User is authenticated and has submitted form
    // Return to last route or personal dashboard
    return getLastRoute('/personal-dashboard')
  }

  // User is authenticated but hasn't submitted form
  return '/dashboard'
}

/**
 * Check if a route requires authentication
 * @param pathname - The route pathname
 * @returns true if route requires authentication
 */
export const requiresAuth = (pathname: string): boolean => {
  const protectedRoutes = [
    '/dashboard',
    '/personal-dashboard',
    '/upgrade-skill',
    '/recommended-courses'
  ]

  return protectedRoutes.some(route => pathname.startsWith(route))
}

/**
 * Check if a route requires form submission
 * @param pathname - The route pathname
 * @returns true if route requires completed form
 */
export const requiresFormSubmission = (pathname: string): boolean => {
  const formRequiredRoutes = [
    '/personal-dashboard',
    '/recommended-courses'
  ]

  return formRequiredRoutes.some(route => pathname.startsWith(route))
}
