/**
 * Profile Compression Utility
 *
 * Compresses user profile and skills into a single-line summary (≤100 chars)
 * to minimize token usage in LLM prompts.
 *
 * Token Savings: ~150-300 tokens → ~20-30 tokens (85-90% reduction)
 */

export interface UserProfile {
  currentSkills: string[]
  weakSkills: string[]
  experienceYears: number
  experienceMonths?: number
  targetSkill?: string
}

export interface CompressedProfile {
  summary: string
  tokenEstimate: number
}

/**
 * Compresses user profile into a concise summary
 *
 * @param profile - User profile data
 * @returns Compressed profile summary (≤100 chars)
 */
export function compressProfile(profile: UserProfile): CompressedProfile {
  const { currentSkills, weakSkills, experienceYears, experienceMonths = 0, targetSkill } = profile

  // Calculate total experience
  const totalExp = experienceYears + (experienceMonths / 12)
  const expStr = totalExp >= 1 ? `${Math.floor(totalExp)}y` : `${experienceMonths}mo`

  // Abbreviate skills (max 3 current, 2 weak)
  const currentAbbrev = abbreviateSkills(currentSkills.slice(0, 3))
  const weakAbbrev = abbreviateSkills(weakSkills.slice(0, 2))

  // Build compact summary
  let summary = `${currentAbbrev} (${expStr})`

  if (weakAbbrev) {
    summary += `. Weak: ${weakAbbrev}`
  }

  if (targetSkill && summary.length < 80) {
    summary += `. Goal: ${abbreviateSkill(targetSkill)}`
  }

  // Ensure under 100 chars
  if (summary.length > 100) {
    summary = summary.substring(0, 97) + '...'
  }

  return {
    summary,
    tokenEstimate: Math.ceil(summary.length / 4) // Rough estimate: 4 chars = 1 token
  }
}

/**
 * Abbreviates a list of skills using common abbreviations
 */
function abbreviateSkills(skills: string[]): string {
  return skills.map(abbreviateSkill).join(', ')
}

/**
 * Abbreviates individual skill names
 */
function abbreviateSkill(skill: string): string {
  const abbreviations: Record<string, string> = {
    'JavaScript': 'JS',
    'TypeScript': 'TS',
    'Python': 'Py',
    'Machine Learning': 'ML',
    'Deep Learning': 'DL',
    'Natural Language Processing': 'NLP',
    'Computer Vision': 'CV',
    'Data Science': 'DS',
    'Database': 'DB',
    'PostgreSQL': 'PG',
    'MongoDB': 'Mongo',
    'React.js': 'React',
    'Node.js': 'Node',
    'TensorFlow': 'TF',
    'Scikit-learn': 'sklearn',
    'Artificial Intelligence': 'AI',
    'Application Programming Interface': 'API',
    'User Interface': 'UI',
    'User Experience': 'UX',
    'Continuous Integration': 'CI',
    'Continuous Deployment': 'CD',
    'Amazon Web Services': 'AWS',
    'Google Cloud Platform': 'GCP',
    'Kubernetes': 'K8s'
  }

  return abbreviations[skill] || skill
}

/**
 * Expands compressed profile for debugging/display
 */
export function expandProfile(summary: string): Partial<UserProfile> {
  // Simple parser for debugging purposes
  const expMatch = summary.match(/\((\d+)y?\)/)?.[1]
  const weakMatch = summary.match(/Weak: ([^.]+)/)?.[1]
  const goalMatch = summary.match(/Goal: ([^.]+)/)?.[1]

  return {
    experienceYears: expMatch ? parseInt(expMatch) : 0,
    weakSkills: weakMatch ? weakMatch.split(', ') : [],
    targetSkill: goalMatch || undefined
  }
}

/**
 * Validates that profile compression stays under limit
 */
export function validateCompression(profile: UserProfile): boolean {
  const compressed = compressProfile(profile)
  return compressed.summary.length <= 100 && compressed.tokenEstimate <= 30
}
