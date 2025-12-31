/**
 * User Profile Service
 * Handles all database operations for user_profile and user_skills tables
 */

import { supabase } from './supabase'
import { supabaseServer } from './supabase-server'
import {
  UserProfile,
  UserProfileInsert,
  UserProfileUpdate,
  UserSkills,
  UserSkillsInsert,
  UserSkillsUpdate,
  CompleteUserProfile,
  OnboardingFormData,
  ApiResponse,
} from './types/database'

// ==================== USER PROFILE OPERATIONS ====================

/**
 * Get user profile by user_id
 */
export async function getUserProfile(
  userId: string,
  useServerClient: boolean = false
): Promise<UserProfile | null> {
  const client = useServerClient ? supabaseServer : supabase

  const { data, error } = await client
    .from('user_profile')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching user profile:', error)
    throw error
  }

  return data
}

/**
 * Create new user profile
 */
export async function createUserProfile(
  profileData: UserProfileInsert,
  useServerClient: boolean = false
): Promise<UserProfile> {
  const client = useServerClient ? supabaseServer : supabase

  const { data, error } = await client
    .from('user_profile')
    .insert(profileData)
    .select()
    .single()

  if (error) {
    console.error('Error creating user profile:', error)
    throw error
  }

  return data
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  profileData: UserProfileUpdate,
  useServerClient: boolean = false
): Promise<UserProfile> {
  const client = useServerClient ? supabaseServer : supabase

  const { data, error } = await client
    .from('user_profile')
    .update(profileData)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating user profile:', error)
    throw error
  }

  return data
}

/**
 * Delete user profile
 */
export async function deleteUserProfile(
  userId: string,
  useServerClient: boolean = false
): Promise<void> {
  const client = useServerClient ? supabaseServer : supabase

  const { error } = await client
    .from('user_profile')
    .delete()
    .eq('user_id', userId)

  if (error) {
    console.error('Error deleting user profile:', error)
    throw error
  }
}

// ==================== USER SKILLS OPERATIONS ====================

/**
 * Get user skills by user_id
 */
export async function getUserSkills(
  userId: string,
  useServerClient: boolean = false
): Promise<UserSkills | null> {
  const client = useServerClient ? supabaseServer : supabase

  const { data, error } = await client
    .from('user_skills')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching user skills:', error)
    throw error
  }

  return data
}

/**
 * Create new user skills
 */
export async function createUserSkills(
  skillsData: UserSkillsInsert,
  useServerClient: boolean = false
): Promise<UserSkills> {
  const client = useServerClient ? supabaseServer : supabase

  const { data, error } = await client
    .from('user_skills')
    .insert(skillsData)
    .select()
    .single()

  if (error) {
    console.error('Error creating user skills:', error)
    throw error
  }

  return data
}

/**
 * Update user skills
 */
export async function updateUserSkills(
  userId: string,
  skillsData: UserSkillsUpdate,
  useServerClient: boolean = false
): Promise<UserSkills> {
  const client = useServerClient ? supabaseServer : supabase

  const { data, error } = await client
    .from('user_skills')
    .update(skillsData)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating user skills:', error)
    throw error
  }

  return data
}

/**
 * Delete user skills
 */
export async function deleteUserSkills(
  userId: string,
  useServerClient: boolean = false
): Promise<void> {
  const client = useServerClient ? supabaseServer : supabase

  const { error } = await client
    .from('user_skills')
    .delete()
    .eq('user_id', userId)

  if (error) {
    console.error('Error deleting user skills:', error)
    throw error
  }
}

// ==================== COMBINED OPERATIONS ====================

/**
 * Get complete user profile (profile + skills)
 */
export async function getCompleteUserProfile(
  userId: string,
  useServerClient: boolean = false
): Promise<CompleteUserProfile | null> {
  const client = useServerClient ? supabaseServer : supabase

  // Fetch both profile and skills
  const [profileResult, skillsResult] = await Promise.all([
    client.from('user_profile').select('*').eq('user_id', userId).maybeSingle(),
    client.from('user_skills').select('*').eq('user_id', userId).maybeSingle(),
  ])

  if (profileResult.error) {
    console.error('Error fetching user profile:', profileResult.error)
    throw profileResult.error
  }

  if (skillsResult.error) {
    console.error('Error fetching user skills:', skillsResult.error)
    throw skillsResult.error
  }

  if (!profileResult.data) {
    return null
  }

  return {
    profile: profileResult.data,
    skills: skillsResult.data,
  }
}

/**
 * Create complete user profile (profile + skills) from onboarding form
 */
export async function createCompleteUserProfile(
  userId: string,
  formData: OnboardingFormData,
  useServerClient: boolean = false
): Promise<CompleteUserProfile> {
  const client = useServerClient ? supabaseServer : supabase

  // Split form data into profile and skills
  const profileData: UserProfileInsert = {
    user_id: userId,
    full_name: formData.full_name,
    email: formData.email,
    phone_number: formData.phone_number || null,
    company_name: formData.company_name || null,
  }

  const skillsData: UserSkillsInsert = {
    user_id: userId,
    job_role: formData.job_role,
    years_of_experience: formData.years_of_experience,
    months_of_experience: formData.months_of_experience,
    current_skills: formData.current_skills,
    strong_skills: formData.strong_skills,
    skills_to_improve: formData.skills_to_improve,
    learning_goals: formData.learning_goals || null,
    skill_level: formData.skill_level,
  }

  // Insert both records in a transaction-like manner
  const [profileResult, skillsResult] = await Promise.all([
    client.from('user_profile').insert(profileData).select().single(),
    client.from('user_skills').insert(skillsData).select().single(),
  ])

  if (profileResult.error) {
    console.error('Error creating user profile:', profileResult.error)
    throw profileResult.error
  }

  if (skillsResult.error) {
    console.error('Error creating user skills:', skillsResult.error)
    // Rollback: delete the profile we just created
    await client.from('user_profile').delete().eq('user_id', userId)
    throw skillsResult.error
  }

  return {
    profile: profileResult.data,
    skills: skillsResult.data,
  }
}

/**
 * Update complete user profile (profile + skills)
 */
export async function updateCompleteUserProfile(
  userId: string,
  formData: Partial<OnboardingFormData>,
  useServerClient: boolean = false
): Promise<CompleteUserProfile> {
  // Split form data into profile and skills updates
  const profileUpdate: UserProfileUpdate = {}
  const skillsUpdate: UserSkillsUpdate = {}

  // Profile fields
  if (formData.full_name !== undefined) profileUpdate.full_name = formData.full_name
  if (formData.email !== undefined) profileUpdate.email = formData.email
  if (formData.phone_number !== undefined) profileUpdate.phone_number = formData.phone_number || null
  if (formData.company_name !== undefined) profileUpdate.company_name = formData.company_name || null

  // Skills fields
  if (formData.job_role !== undefined) skillsUpdate.job_role = formData.job_role
  if (formData.years_of_experience !== undefined) skillsUpdate.years_of_experience = formData.years_of_experience
  if (formData.months_of_experience !== undefined) skillsUpdate.months_of_experience = formData.months_of_experience
  if (formData.current_skills !== undefined) skillsUpdate.current_skills = formData.current_skills
  if (formData.strong_skills !== undefined) skillsUpdate.strong_skills = formData.strong_skills
  if (formData.skills_to_improve !== undefined) skillsUpdate.skills_to_improve = formData.skills_to_improve
  if (formData.learning_goals !== undefined) skillsUpdate.learning_goals = formData.learning_goals || null
  if (formData.skill_level !== undefined) skillsUpdate.skill_level = formData.skill_level

  // Update both tables
  const updates: Promise<any>[] = []

  if (Object.keys(profileUpdate).length > 0) {
    updates.push(updateUserProfile(userId, profileUpdate, useServerClient))
  }

  if (Object.keys(skillsUpdate).length > 0) {
    updates.push(updateUserSkills(userId, skillsUpdate, useServerClient))
  }

  const [profile, skills] = await Promise.all(updates)

  return {
    profile,
    skills,
  }
}

/**
 * Check if user has completed onboarding
 */
export async function hasCompletedOnboarding(
  userId: string,
  useServerClient: boolean = false
): Promise<boolean> {
  try {
    const completeProfile = await getCompleteUserProfile(userId, useServerClient)
    return !!(completeProfile?.profile && completeProfile?.skills)
  } catch (error) {
    console.error('Error checking onboarding status:', error)
    return false
  }
}

/**
 * Calculate total experience in years (including months)
 */
export function calculateTotalExperience(skills: UserSkills): number {
  return skills.years_of_experience + skills.months_of_experience / 12
}

/**
 * Determine difficulty level from total experience
 */
export function getDifficultyLevel(totalYears: number): 'beginner' | 'intermediate' | 'advanced' {
  if (totalYears < 1) return 'beginner'
  if (totalYears < 3) return 'intermediate'
  return 'advanced'
}
