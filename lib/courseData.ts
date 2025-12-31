// Course recommendations mapped to skills
export interface Course {
  id: string
  title: string
  description: string
  thumbnail: string
  platform: string
  url: string
  skills: string[]
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: string
  rating?: number
}

export const coursesDatabase: Course[] = [
  // Programming Languages
  {
    id: 'python-basics',
    title: 'Python for Everybody Specialization',
    description: 'Learn Python programming from scratch with hands-on projects and real-world applications.',
    thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=250&fit=crop',
    platform: 'Coursera',
    url: '#',
    skills: ['Python'],
    level: 'beginner',
    duration: '8 weeks',
    rating: 4.8
  },
  {
    id: 'java-masterclass',
    title: 'Java Programming Masterclass',
    description: 'Complete Java course covering OOP, data structures, and modern Java features.',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=250&fit=crop',
    platform: 'Udemy',
    url: '#',
    skills: ['Java', 'OOP'],
    level: 'intermediate',
    duration: '80 hours',
    rating: 4.6
  },
  {
    id: 'javascript-complete',
    title: 'The Complete JavaScript Course',
    description: 'Master JavaScript from basics to advanced concepts including ES6+ and async programming.',
    thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&h=250&fit=crop',
    platform: 'Udemy',
    url: '#',
    skills: ['JavaScript', 'ES6'],
    level: 'beginner',
    duration: '50 hours',
    rating: 4.7
  },

  // Web Development
  {
    id: 'react-complete',
    title: 'React - The Complete Guide',
    description: 'Build powerful React applications with Hooks, Context API, and modern React patterns.',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop',
    platform: 'Udemy',
    url: '#',
    skills: ['React', 'JavaScript', 'Redux'],
    level: 'intermediate',
    duration: '48 hours',
    rating: 4.8
  },
  {
    id: 'nextjs-fundamentals',
    title: 'Next.js & React - The Complete Guide',
    description: 'Learn Next.js, Server-Side Rendering, Static Site Generation, and full-stack development.',
    thumbnail: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=400&h=250&fit=crop',
    platform: 'Udemy',
    url: '#',
    skills: ['Next.js', 'React', 'TypeScript'],
    level: 'intermediate',
    duration: '30 hours',
    rating: 4.7
  },
  {
    id: 'html-css-bootcamp',
    title: 'HTML & CSS Bootcamp',
    description: 'Build beautiful, responsive websites from scratch with HTML5, CSS3, and Flexbox/Grid.',
    thumbnail: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=400&h=250&fit=crop',
    platform: 'Udemy',
    url: '#',
    skills: ['HTML', 'CSS', 'Responsive Design'],
    level: 'beginner',
    duration: '20 hours',
    rating: 4.6
  },
  {
    id: 'nodejs-express',
    title: 'Node.js, Express & MongoDB Bootcamp',
    description: 'Build fast, scalable REST APIs and web apps with Node.js, Express, and MongoDB.',
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=250&fit=crop',
    platform: 'Udemy',
    url: '#',
    skills: ['Node.js', 'Express', 'MongoDB', 'REST APIs'],
    level: 'intermediate',
    duration: '42 hours',
    rating: 4.7
  },

  // Data Science & AI
  {
    id: 'data-science-python',
    title: 'Data Science with Python',
    description: 'Master data analysis, visualization, and machine learning with Python, Pandas, and NumPy.',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
    platform: 'Coursera',
    url: '#',
    skills: ['Python', 'Pandas', 'NumPy', 'Data Visualization'],
    level: 'intermediate',
    duration: '10 weeks',
    rating: 4.8
  },
  {
    id: 'machine-learning-stanford',
    title: 'Machine Learning Specialization',
    description: 'Learn ML fundamentals, supervised/unsupervised learning, and neural networks.',
    thumbnail: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=400&h=250&fit=crop',
    platform: 'Coursera',
    url: '#',
    skills: ['Machine Learning', 'Python', 'TensorFlow', 'Scikit-learn'],
    level: 'intermediate',
    duration: '12 weeks',
    rating: 4.9
  },
  {
    id: 'deep-learning-specialization',
    title: 'Deep Learning Specialization',
    description: 'Master deep learning with neural networks, CNNs, RNNs, and advanced AI techniques.',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop',
    platform: 'Coursera',
    url: '#',
    skills: ['Deep Learning', 'TensorFlow', 'PyTorch', 'Neural Networks'],
    level: 'advanced',
    duration: '16 weeks',
    rating: 4.9
  },
  {
    id: 'pandas-data-analysis',
    title: 'Pandas Data Analysis',
    description: 'Master data manipulation, cleaning, and analysis with Pandas library.',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
    platform: 'DataCamp',
    url: '#',
    skills: ['Pandas', 'Python', 'Data Cleaning'],
    level: 'beginner',
    duration: '4 weeks',
    rating: 4.7
  },

  // Cloud & DevOps
  {
    id: 'aws-certified',
    title: 'AWS Certified Solutions Architect',
    description: 'Prepare for AWS certification and master cloud architecture on Amazon Web Services.',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=250&fit=crop',
    platform: 'Udemy',
    url: '#',
    skills: ['AWS', 'Cloud Architecture', 'EC2', 'S3'],
    level: 'intermediate',
    duration: '24 hours',
    rating: 4.7
  },
  {
    id: 'docker-kubernetes',
    title: 'Docker & Kubernetes: The Complete Guide',
    description: 'Build, deploy, and scale containerized applications with Docker and Kubernetes.',
    thumbnail: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=400&h=250&fit=crop',
    platform: 'Udemy',
    url: '#',
    skills: ['Docker', 'Kubernetes', 'DevOps', 'CI/CD'],
    level: 'intermediate',
    duration: '22 hours',
    rating: 4.6
  },
  {
    id: 'terraform-iac',
    title: 'Terraform Infrastructure as Code',
    description: 'Automate infrastructure deployment with Terraform across AWS, Azure, and GCP.',
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=250&fit=crop',
    platform: 'Udemy',
    url: '#',
    skills: ['Terraform', 'AWS', 'Infrastructure', 'DevOps'],
    level: 'intermediate',
    duration: '15 hours',
    rating: 4.5
  },

  // Database
  {
    id: 'sql-bootcamp',
    title: 'Complete SQL Bootcamp',
    description: 'Master SQL from basics to advanced queries, joins, and database design.',
    thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&h=250&fit=crop',
    platform: 'Udemy',
    url: '#',
    skills: ['SQL', 'MySQL', 'PostgreSQL', 'Databases'],
    level: 'beginner',
    duration: '9 hours',
    rating: 4.6
  },
  {
    id: 'mongodb-complete',
    title: 'MongoDB - The Complete Guide',
    description: 'Learn MongoDB database design, queries, aggregation, and performance optimization.',
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=250&fit=crop',
    platform: 'Udemy',
    url: '#',
    skills: ['MongoDB', 'NoSQL', 'Databases'],
    level: 'intermediate',
    duration: '16 hours',
    rating: 4.7
  },

  // Mobile Development
  {
    id: 'flutter-complete',
    title: 'Flutter & Dart - Complete Development',
    description: 'Build beautiful iOS and Android apps with Flutter and Dart programming.',
    thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop',
    platform: 'Udemy',
    url: '#',
    skills: ['Flutter', 'Dart', 'Mobile Development'],
    level: 'beginner',
    duration: '30 hours',
    rating: 4.7
  },
  {
    id: 'react-native',
    title: 'React Native - The Practical Guide',
    description: 'Build native mobile apps for iOS and Android using React Native.',
    thumbnail: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=250&fit=crop',
    platform: 'Udemy',
    url: '#',
    skills: ['React Native', 'JavaScript', 'Mobile Development'],
    level: 'intermediate',
    duration: '32 hours',
    rating: 4.6
  },

  // UI/UX & Design
  {
    id: 'figma-ui-ux',
    title: 'Figma UI/UX Design Essentials',
    description: 'Design beautiful user interfaces and prototypes with Figma.',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop',
    platform: 'Udemy',
    url: '#',
    skills: ['Figma', 'UI/UX', 'Design'],
    level: 'beginner',
    duration: '12 hours',
    rating: 4.5
  },
  {
    id: 'tailwindcss-course',
    title: 'Tailwind CSS - From Zero to Production',
    description: 'Master utility-first CSS framework and build modern, responsive UIs.',
    thumbnail: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=400&h=250&fit=crop',
    platform: 'Tailwind Labs',
    url: '#',
    skills: ['TailwindCSS', 'CSS', 'Responsive Design'],
    level: 'beginner',
    duration: '8 hours',
    rating: 4.8
  },

  // AI & LLMs
  {
    id: 'langchain-ai',
    title: 'LangChain: Build AI Applications',
    description: 'Create powerful AI agents and applications using LangChain and LLMs.',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop',
    platform: 'Udemy',
    url: '#',
    skills: ['LangChain', 'Python', 'OpenAI API', 'AI'],
    level: 'intermediate',
    duration: '10 hours',
    rating: 4.7
  },
  {
    id: 'openai-gpt',
    title: 'OpenAI & ChatGPT Development',
    description: 'Build intelligent applications with GPT models and OpenAI API.',
    thumbnail: 'https://images.unsplash.com/photo-1676277791608-ac65a048960e?w=400&h=250&fit=crop',
    platform: 'Udemy',
    url: '#',
    skills: ['OpenAI API', 'GPT API', 'Python', 'Prompt Engineering'],
    level: 'intermediate',
    duration: '12 hours',
    rating: 4.6
  },

  // Version Control & Tools
  {
    id: 'git-github',
    title: 'Git & GitHub Complete Guide',
    description: 'Master version control with Git and collaborate effectively on GitHub.',
    thumbnail: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=400&h=250&fit=crop',
    platform: 'Udemy',
    url: '#',
    skills: ['Git', 'GitHub', 'Version Control'],
    level: 'beginner',
    duration: '6 hours',
    rating: 4.7
  },

  // Testing
  {
    id: 'jest-testing',
    title: 'JavaScript Testing with Jest',
    description: 'Write comprehensive tests for JavaScript applications using Jest.',
    thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=250&fit=crop',
    platform: 'Udemy',
    url: '#',
    skills: ['Jest', 'Testing', 'JavaScript'],
    level: 'intermediate',
    duration: '8 hours',
    rating: 4.5
  }
]

// Get recommended courses based on weak skills
export const getRecommendedCourses = (weakSkills: string[]): Course[] => {
  if (!weakSkills || weakSkills.length === 0) {
    return []
  }

  // Find courses that match any of the weak skills
  const recommendedCourses = coursesDatabase.filter(course =>
    course.skills.some(skill =>
      weakSkills.some(weakSkill =>
        skill.toLowerCase().includes(weakSkill.toLowerCase()) ||
        weakSkill.toLowerCase().includes(skill.toLowerCase())
      )
    )
  )

  // Sort by relevance (number of matching skills) and rating
  return recommendedCourses
    .map(course => ({
      course,
      matchCount: course.skills.filter(skill =>
        weakSkills.some(weakSkill =>
          skill.toLowerCase().includes(weakSkill.toLowerCase()) ||
          weakSkill.toLowerCase().includes(skill.toLowerCase())
        )
      ).length
    }))
    .sort((a, b) => {
      if (b.matchCount !== a.matchCount) {
        return b.matchCount - a.matchCount
      }
      return (b.course.rating || 0) - (a.course.rating || 0)
    })
    .map(item => item.course)
    .slice(0, 12) // Limit to top 12 courses
}
