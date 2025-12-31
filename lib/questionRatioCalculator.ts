/**
 * Question Ratio Calculator
 *
 * Determines the optimal balance of theory vs technical questions
 * based on user experience level and skill category.
 */

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'
export type SkillCategory = 'programming' | 'data' | 'web' | 'cloud' | 'general'
export type QuestionType = 'theory' | 'practical'

export interface UserContext {
  experienceYears: number
  experienceMonths: number
  currentSkills: string[]
  weakSkills: string[]
  targetSkill?: string
  currentRole?: string
}

export interface QuestionRatio {
  experienceLevel: ExperienceLevel
  skillCategory: SkillCategory
  theoryCount: number
  practicalCount: number
  theoryPercentage: number
  practicalPercentage: number
  totalQuestions: number
}

/**
 * Calculate the optimal question distribution
 */
export function calculateQuestionRatio(
  context: UserContext,
  totalQuestions: number = 30
): QuestionRatio {
  // Step 1: Determine experience level
  const experienceLevel = determineExperienceLevel(
    context.experienceYears,
    context.experienceMonths
  )

  // Step 2: Detect skill category from user's skills and role
  const skillCategory = detectSkillCategory(
    context.currentSkills,
    context.weakSkills,
    context.targetSkill,
    context.currentRole
  )

  // Step 3: Get base ratio from experience level
  let theoryPercentage = getBaseTheoryPercentage(experienceLevel)

  // Step 4: Apply skill-specific adjustments
  theoryPercentage = adjustForSkillCategory(
    theoryPercentage,
    skillCategory,
    experienceLevel
  )

  // Step 5: Calculate final counts
  const theoryCount = Math.round((theoryPercentage / 100) * totalQuestions)
  const practicalCount = totalQuestions - theoryCount

  return {
    experienceLevel,
    skillCategory,
    theoryCount,
    practicalCount,
    theoryPercentage,
    practicalPercentage: 100 - theoryPercentage,
    totalQuestions
  }
}

/**
 * Determine user's experience level
 */
function determineExperienceLevel(years: number, months: number): ExperienceLevel {
  const totalYears = years + (months / 12)

  if (totalYears < 1) return 'beginner'
  if (totalYears < 3) return 'intermediate'
  return 'advanced'
}

/**
 * Get base theory percentage based on experience level
 */
function getBaseTheoryPercentage(level: ExperienceLevel): number {
  const ratios: Record<ExperienceLevel, number> = {
    beginner: 70,      // 70% theory / 30% practical
    intermediate: 60,  // 60% theory / 40% practical
    advanced: 40       // 40% theory / 60% practical
  }

  return ratios[level]
}

/**
 * Detect primary skill category from user's skills
 */
function detectSkillCategory(
  currentSkills: string[],
  weakSkills: string[],
  targetSkill?: string,
  currentRole?: string
): SkillCategory {
  const allSkills = [
    ...currentSkills,
    ...weakSkills,
    targetSkill || '',
    currentRole || ''
  ].map(s => s.toLowerCase())

  // Skill category keywords
  const categories = {
    programming: [
      'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'go', 'rust',
      'dsa', 'algorithms', 'data structures', 'backend', 'api', 'node',
      'software engineer', 'backend developer', 'software developer'
    ],
    data: [
      'data analyst', 'data scientist', 'ml engineer', 'machine learning',
      'deep learning', 'ai', 'artificial intelligence', 'data science',
      'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy',
      'statistics', 'analytics', 'bi', 'tableau', 'power bi'
    ],
    web: [
      'react', 'vue', 'angular', 'frontend', 'full stack', 'fullstack',
      'html', 'css', 'web developer', 'ui', 'ux', 'next.js', 'svelte',
      'web development', 'responsive design', 'tailwind'
    ],
    cloud: [
      'aws', 'azure', 'gcp', 'cloud', 'devops', 'kubernetes', 'docker',
      'terraform', 'jenkins', 'ci/cd', 'sysadmin', 'system administrator',
      'infrastructure', 'networking', 'linux', 'unix'
    ]
  }

  // Count matches for each category
  const scores: Record<SkillCategory, number> = {
    programming: 0,
    data: 0,
    web: 0,
    cloud: 0,
    general: 0
  }

  for (const skill of allSkills) {
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => skill.includes(keyword))) {
        scores[category as SkillCategory]++
      }
    }
  }

  // Find category with highest score
  const maxScore = Math.max(...Object.values(scores))
  if (maxScore === 0) return 'general'

  const detectedCategory = Object.entries(scores)
    .find(([_, score]) => score === maxScore)?.[0] as SkillCategory

  return detectedCategory || 'general'
}

/**
 * Apply skill-category-specific adjustments to theory percentage
 */
function adjustForSkillCategory(
  baseTheoryPercentage: number,
  category: SkillCategory,
  experienceLevel: ExperienceLevel
): number {
  const adjustments: Record<SkillCategory, (base: number, level: ExperienceLevel) => number> = {
    programming: (base, level) => {
      // Programming: 50/50 for all levels, 40/60 for advanced
      if (level === 'advanced') return 40
      return 50
    },

    data: (base, level) => {
      // Data roles: 60/40, advanced = 50/50
      if (level === 'advanced') return 50
      return 60
    },

    web: (base, level) => {
      // Web development: 40/60 for all levels
      return 40
    },

    cloud: (base, level) => {
      // Cloud/DevOps: 70/30 for all levels
      return 70
    },

    general: (base, level) => {
      // Use base percentage from experience level
      return base
    }
  }

  return adjustments[category](baseTheoryPercentage, experienceLevel)
}

/**
 * Generate question distribution description for LLM prompt
 */
export function generateDistributionDescription(ratio: QuestionRatio): string {
  return `
Experience Level: ${ratio.experienceLevel.toUpperCase()}
Skill Category: ${ratio.skillCategory.toUpperCase()}

Question Distribution:
- ${ratio.theoryCount} Theory/Conceptual questions (${ratio.theoryPercentage}%)
- ${ratio.practicalCount} Technical/Practical questions (${ratio.practicalPercentage}%)
- Total: ${ratio.totalQuestions} questions
`.trim()
}

/**
 * Validate question distribution matches expected ratio
 */
export function validateQuestionDistribution(
  questions: Array<{ type: QuestionType }>,
  expectedRatio: QuestionRatio
): boolean {
  const theoryCount = questions.filter(q => q.type === 'theory').length
  const practicalCount = questions.filter(q => q.type === 'practical').length

  // Allow ±1 question tolerance
  return (
    Math.abs(theoryCount - expectedRatio.theoryCount) <= 1 &&
    Math.abs(practicalCount - expectedRatio.practicalCount) <= 1 &&
    questions.length === expectedRatio.totalQuestions
  )
}

/**
 * Get example questions for each type based on skill category
 */
export function getQuestionTypeExamples(category: SkillCategory): {
  theory: string[]
  practical: string[]
} {
  const examples = {
    programming: {
      theory: [
        'What is the time complexity of binary search?',
        'Explain the difference between stack and queue.',
        'What are the SOLID principles in OOP?'
      ],
      practical: [
        'What is the output of: [1,2,3].map(x => x*2).filter(x => x>3)?',
        'Identify the bug: for i in range(5): print(i); i += 1',
        'Write a one-line function to reverse a string in Python.'
      ]
    },
    data: {
      theory: [
        'What is the difference between supervised and unsupervised learning?',
        'Explain what a confusion matrix represents.',
        'What is overfitting in machine learning?'
      ],
      practical: [
        'What will df.groupby("category").mean() return?',
        'Given accuracy=0.9, precision=0.7, what does this indicate?',
        'If model has 90% accuracy but 10% recall, what\'s the issue?'
      ]
    },
    web: {
      theory: [
        'What is the virtual DOM in React?',
        'Explain the difference between var, let, and const.',
        'What is CSS flexbox used for?'
      ],
      practical: [
        'What will useState(0) return on first render?',
        'Fix this CSS: .box { width: 100%; padding: 20px; box-sizing: ??? }',
        'What does fetch().then().catch() handle?'
      ]
    },
    cloud: {
      theory: [
        'What is the difference between IaaS, PaaS, and SaaS?',
        'Explain what a load balancer does.',
        'What is container orchestration?'
      ],
      practical: [
        'Which AWS service would you use for object storage?',
        'What command lists all running Docker containers?',
        'How do you scale a Kubernetes deployment to 5 replicas?'
      ]
    },
    general: {
      theory: [
        'What is an API?',
        'Explain what version control is.',
        'What is the purpose of testing in software development?'
      ],
      practical: [
        'What HTTP status code indicates success?',
        'What Git command creates a new branch?',
        'How do you check if a variable is undefined in JavaScript?'
      ]
    }
  }

  return examples[category] || examples.general
}
