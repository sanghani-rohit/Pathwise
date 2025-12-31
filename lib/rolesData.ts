// Parsed roles and skills data from roles_skills.csv
export interface Role {
  role_name: string
  category: string
  skills: string[]
}

export const rolesData: Role[] = [
  {
    role_name: "Software Engineer",
    category: "Software Development",
    skills: ["Python", "Java", "C++", "C#", "Git", "Algorithms", "Data Structures", "OOP", "SQL", "REST APIs", "Agile", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "Web Developer",
    category: "Web Development",
    skills: ["HTML", "CSS", "JavaScript", "React", "Node.js", "Next.js", "TypeScript", "REST APIs", "Git", "Responsive Design", "TailwindCSS", "Webpack", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "Frontend Developer",
    category: "Web Development",
    skills: ["HTML", "CSS", "JavaScript", "React", "Angular", "Vue.js", "TypeScript", "Redux", "TailwindCSS", "Webpack", "Responsive Design", "UI/UX", "Git", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "Backend Developer",
    category: "Web Development",
    skills: ["Node.js", "Express", "Django", "Flask", "Spring Boot", ".NET", "PHP", "MySQL", "PostgreSQL", "MongoDB", "REST APIs", "Authentication", "Git", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "Full Stack Developer",
    category: "Web Development",
    skills: ["React", "Node.js", "Next.js", "Django", "MySQL", "PostgreSQL", "APIs", "Docker", "AWS", "Git", "TypeScript", "GraphQL", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "UI Developer",
    category: "Web Development",
    skills: ["HTML", "CSS", "JavaScript", "Figma", "React", "TailwindCSS", "Material UI", "Responsive Design", "UX Principles", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "API Developer",
    category: "Backend Development",
    skills: ["REST APIs", "GraphQL", "Node.js", "Express", "Python", "JSON", "OAuth", "Postman", "OpenAPI", "MySQL", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "Software Architect",
    category: "Software Development",
    skills: ["System Design", "Microservices", "Cloud Architecture", "Databases", "Docker", "Kubernetes", "AWS", "Design Patterns", "Scalability", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "Application Developer",
    category: "Software Development",
    skills: ["Java", "Kotlin", "C#", ".NET", "SQL", "REST APIs", "OOP", "Git", "Android Studio", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "Embedded Systems Engineer",
    category: "Software Development",
    skills: ["C", "C++", "Assembly", "Python", "RTOS", "Microcontrollers", "IoT", "UART", "SPI", "I2C", "Debugging", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "DevOps Engineer",
    category: "Cloud & DevOps",
    skills: ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "Jenkins", "GitHub Actions", "Bash", "Linux", "Monitoring", "CI/CD", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "Cloud Engineer",
    category: "Cloud & DevOps",
    skills: ["AWS", "Azure", "GCP", "EC2", "S3", "Lambda", "Docker", "Kubernetes", "Terraform", "CloudFormation", "Networking", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "Cloud Architect",
    category: "Cloud & DevOps",
    skills: ["AWS", "GCP", "Azure", "VPC", "Load Balancing", "Kubernetes", "Terraform", "Security", "Cost Optimization", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "Site Reliability Engineer (SRE)",
    category: "Cloud & DevOps",
    skills: ["Monitoring", "Prometheus", "Grafana", "Kubernetes", "CI/CD", "Linux", "Incident Management", "Docker", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "Infrastructure Engineer",
    category: "Cloud & DevOps",
    skills: ["Linux", "Networking", "DNS", "Load Balancing", "Ansible", "Terraform", "Shell Scripting", "AWS", "Monitoring", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "Platform Engineer",
    category: "Cloud & DevOps",
    skills: ["Kubernetes", "Docker", "CI/CD", "Jenkins", "ArgoCD", "Terraform", "Python", "Linux", "Observability", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "System Administrator",
    category: "IT Operations",
    skills: ["Linux", "Windows Server", "Active Directory", "PowerShell", "Bash", "Networking", "Firewalls", "Monitoring", "Security", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "Release Engineer",
    category: "DevOps",
    skills: ["Jenkins", "GitLab CI", "Docker", "Version Control", "Deployment Pipelines", "Linux", "Automation", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "Automation Engineer",
    category: "DevOps",
    skills: ["Python", "Shell Scripting", "n8n", "Jenkins", "Terraform", "Ansible", "Automation Tools", "APIs", "CI/CD", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "Performance Engineer",
    category: "DevOps",
    skills: ["Load Testing", "JMeter", "Locust", "Prometheus", "Performance Optimization", "Profiling", "CI/CD", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "Data Analyst",
    category: "Data & AI",
    skills: ["Excel", "SQL", "Python", "Pandas", "Power BI", "Tableau", "Data Cleaning", "Visualization", "Statistics", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "Data Engineer",
    category: "Data & AI",
    skills: ["Python", "SQL", "Apache Spark", "Airflow", "ETL", "BigQuery", "Snowflake", "Data Modeling", "Kafka", "dbt", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "Data Scientist",
    category: "Data & AI",
    skills: ["Python", "Pandas", "NumPy", "Scikit-learn", "TensorFlow", "Statistics", "Machine Learning", "Jupyter", "Data Visualization", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "Machine Learning Engineer",
    category: "Data & AI",
    skills: ["Python", "TensorFlow", "PyTorch", "Scikit-learn", "Pandas", "Feature Engineering", "Model Deployment", "FastAPI", "MLflow", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "AI Engineer",
    category: "Data & AI",
    skills: ["Python", "LangChain", "LlamaIndex", "OpenAI API", "Hugging Face", "Vector Databases", "Prompt Engineering", "Transformers", "RAG", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "Generative AI Engineer",
    category: "Data & AI",
    skills: ["Python", "LangChain", "OpenAI", "Diffusers", "Hugging Face", "Stable Diffusion", "Prompt Tuning", "LLMs", "Vector Search", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "Agentic AI Engineer",
    category: "Data & AI",
    skills: ["LangChain", "CrewAI", "AutoGPT", "n8n", "Pinecone", "ChromaDB", "Supabase", "LlamaIndex", "GPT API", "Tool Use", "Reasoning", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "MLOps Engineer",
    category: "Data & AI",
    skills: ["Python", "MLflow", "Docker", "Kubernetes", "TensorFlow Serving", "FastAPI", "Airflow", "CI/CD", "AWS SageMaker", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "AI Research Scientist",
    category: "Data & AI",
    skills: ["Python", "PyTorch", "Deep Learning", "NLP", "Reinforcement Learning", "Transformers", "Research Papers", "Model Training", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "Data Architect",
    category: "Data & AI",
    skills: ["SQL", "Snowflake", "Redshift", "Data Modeling", "ETL", "BigQuery", "Data Governance", "Cloud Architecture", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "Cybersecurity Engineer",
    category: "Security",
    skills: ["Firewalls", "IDS", "IPS", "Nmap", "Kali Linux", "Wireshark", "Snort", "Splunk", "Metasploit", "SIEM", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "Security Analyst",
    category: "Security",
    skills: ["Threat Detection", "Risk Analysis", "SIEM", "Splunk", "SOC Monitoring", "Incident Response", "Python", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "Penetration Tester",
    category: "Security",
    skills: ["Kali Linux", "Burp Suite", "Metasploit", "OWASP", "Wireshark", "Python", "Reconnaissance", "Exploits", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "SOC Analyst",
    category: "Security",
    skills: ["Incident Response", "SIEM", "Log Analysis", "Splunk", "Threat Hunting", "Linux", "Network Monitoring", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "Security Architect",
    category: "Security",
    skills: ["Network Security", "Cloud Security", "Encryption", "IAM", "Zero Trust", "Security Design", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "Cloud Security Engineer",
    category: "Security",
    skills: ["AWS Security Hub", "IAM", "Azure Defender", "Firewalls", "SIEM", "Threat Modeling", "Cloud Security Tools", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "Network Engineer",
    category: "IT Infrastructure",
    skills: ["Cisco", "Juniper", "Routing", "Switching", "VLANs", "Firewalls", "VPNs", "TCP/IP", "Wireshark", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "Network Administrator",
    category: "IT Infrastructure",
    skills: ["DNS", "DHCP", "Routing", "Switching", "Firewalls", "Network Monitoring", "Linux", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "IT Support Engineer",
    category: "IT Infrastructure",
    skills: ["Windows", "Linux", "Troubleshooting", "Help Desk", "Networking", "Office 365", "Hardware", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "System Integration Engineer",
    category: "IT Infrastructure",
    skills: ["APIs", "Middleware", "Microservices", "Docker", "Python", "Linux", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "Mobile App Developer",
    category: "Mobile Development",
    skills: ["Flutter", "React Native", "Kotlin", "Swift", "Firebase", "REST APIs", "UI Design", "Git", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "Android Developer",
    category: "Mobile Development",
    skills: ["Kotlin", "Java", "Android Studio", "XML", "Firebase", "Jetpack Compose", "REST APIs", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "iOS Developer",
    category: "Mobile Development",
    skills: ["Swift", "SwiftUI", "Xcode", "UIKit", "CoreData", "Firebase", "REST APIs", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "Blockchain Developer",
    category: "Emerging Tech",
    skills: ["Solidity", "Hardhat", "Web3.js", "Ethers.js", "Smart Contracts", "Truffle", "IPFS", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "Web3 Developer",
    category: "Emerging Tech",
    skills: ["React", "Solidity", "Web3.js", "Ethers.js", "Blockchain APIs", "MetaMask", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "AR/VR Developer",
    category: "Emerging Tech",
    skills: ["Unity", "Unreal Engine", "C#", "Blender", "XR SDK", "Oculus SDK", "ARKit", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "Game Developer",
    category: "Emerging Tech",
    skills: ["Unity", "Unreal Engine", "C#", "C++", "Game Physics", "3D Modeling", "Blender", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "IoT Engineer",
    category: "Emerging Tech",
    skills: ["Python", "C", "C++", "MQTT", "Raspberry Pi", "Arduino", "Node-RED", "Sensors", "Cloud IoT", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "Robotics Engineer",
    category: "Emerging Tech",
    skills: ["ROS", "Python", "C++", "Sensors", "Machine Vision", "OpenCV", "SLAM", "AI Planning", "Problem Solving", "Communication", "Teamwork"]
  },
  {
    role_name: "Quantum Computing Engineer",
    category: "Emerging Tech",
    skills: ["Python", "Qiskit", "Cirq", "Quantum Gates", "Linear Algebra", "Quantum Algorithms", "Problem Solving", "Communication", "Teamwork"]
  }
]

// Get unique categories
export const categories = Array.from(new Set(rolesData.map(r => r.category))).sort()

// Get roles by category
export const getRolesByCategory = (category: string): Role[] => {
  return rolesData.filter(r => r.category === category)
}

// Search roles by name
export const searchRoles = (query: string): Role[] => {
  const lowerQuery = query.toLowerCase()
  return rolesData.filter(r =>
    r.role_name.toLowerCase().includes(lowerQuery) ||
    r.category.toLowerCase().includes(lowerQuery)
  )
}

// Get skills for a role
export const getSkillsForRole = (roleName: string): string[] => {
  const role = rolesData.find(r => r.role_name === roleName)
  return role ? role.skills : []
}
