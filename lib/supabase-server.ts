/**
 * Server-side Supabase client with service role
 *
 * IMPORTANT: This client bypasses RLS and should ONLY be used in server-side API routes
 * Never expose this client to the frontend
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseServiceRoleKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
}

/**
 * Server-only Supabase client with service role privileges
 * - Bypasses Row Level Security (RLS)
 * - Full database access
 * - Use ONLY in API routes with proper authentication checks
 */
export const supabaseServer = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
})

/**
 * Get authenticated user from request headers
 * @param authorization - Authorization header value (Bearer token)
 * @returns User object or null if invalid
 */
export async function getAuthenticatedUser(authorization: string | null) {
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return null
  }

  const token = authorization.replace('Bearer ', '')

  try {
    const { data: { user }, error } = await supabaseServer.auth.getUser(token)

    if (error || !user) {
      console.error('Authentication error:', error?.message || 'No user found')
      return null
    }

    return user
  } catch (error) {
    console.error('Error verifying auth token:', error)
    return null
  }
}
