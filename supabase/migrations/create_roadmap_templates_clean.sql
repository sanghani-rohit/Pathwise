-- ============================================================================
-- Clean Roadmap System Migration (Idempotent - Safe to Run Multiple Times)
-- ============================================================================

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_roadmap_templates_skill;
DROP INDEX IF EXISTS idx_roadmap_templates_level;
DROP INDEX IF EXISTS idx_roadmap_templates_order;
DROP INDEX IF EXISTS idx_roadmap_sections_roadmap;
DROP INDEX IF EXISTS idx_roadmap_sections_user;
DROP INDEX IF EXISTS idx_roadmap_sections_order;
DROP INDEX IF EXISTS idx_roadmap_progress_user;
DROP INDEX IF EXISTS idx_roadmap_progress_roadmap;
DROP INDEX IF EXISTS idx_roadmap_progress_section;

-- Create roadmap_templates table for fixed structure
CREATE TABLE IF NOT EXISTS roadmap_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    skill TEXT NOT NULL,
    module_name TEXT NOT NULL,
    subtopics TEXT[] NOT NULL DEFAULT '{}',
    order_index INTEGER NOT NULL,
    level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    tools TEXT[] NOT NULL DEFAULT '{}',
    prerequisites TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create roadmap_sections table for storing generated content
CREATE TABLE IF NOT EXISTS roadmap_sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    roadmap_id UUID NOT NULL,
    user_id UUID NOT NULL,
    module_name TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    level TEXT NOT NULL,
    detailed_explanation TEXT,
    tools_frameworks JSONB DEFAULT '[]',
    best_practices TEXT[],
    example_code TEXT,
    project_ideas TEXT[],
    subtopics JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create roadmap_progress table for tracking completion
CREATE TABLE IF NOT EXISTS roadmap_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    roadmap_id UUID NOT NULL,
    section_id UUID NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    notes TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, section_id)
);

-- Create indexes
CREATE INDEX idx_roadmap_templates_skill ON roadmap_templates(skill);
CREATE INDEX idx_roadmap_templates_level ON roadmap_templates(level);
CREATE INDEX idx_roadmap_templates_order ON roadmap_templates(skill, order_index);
CREATE INDEX idx_roadmap_sections_roadmap ON roadmap_sections(roadmap_id);
CREATE INDEX idx_roadmap_sections_user ON roadmap_sections(user_id);
CREATE INDEX idx_roadmap_sections_order ON roadmap_sections(roadmap_id, order_index);
CREATE INDEX idx_roadmap_progress_user ON roadmap_progress(user_id);
CREATE INDEX idx_roadmap_progress_roadmap ON roadmap_progress(roadmap_id);
CREATE INDEX idx_roadmap_progress_section ON roadmap_progress(section_id);

-- Delete any existing template data to avoid duplicates
DELETE FROM roadmap_templates WHERE skill IN ('Agentic AI', 'React');

-- Insert Agentic AI template (11 modules)
INSERT INTO roadmap_templates (skill, module_name, subtopics, order_index, level, tools, prerequisites) VALUES
('Agentic AI', 'Python Fundamentals for AI', ARRAY['Variables and Data Types', 'Control Flow (if/else, loops)', 'Functions and Lambda Expressions', 'Object-Oriented Programming', 'Error Handling and Debugging', 'File I/O and Data Persistence'], 1, 'beginner', ARRAY['Python 3.11+', 'VS Code', 'Jupyter Notebook', 'Git'], ARRAY[]::TEXT[]),
('Agentic AI', 'LLM Foundations', ARRAY['Understanding Large Language Models', 'Transformer Architecture Basics', 'Prompting Techniques', 'Context Windows and Token Limits', 'Temperature and Sampling Parameters', 'API Integration (OpenAI, Anthropic)'], 2, 'beginner', ARRAY['OpenAI API', 'Anthropic Claude API', 'Requests Library', 'Python-dotenv'], ARRAY['Python Fundamentals for AI']),
('Agentic AI', 'LangChain Framework', ARRAY['LangChain Core Concepts', 'Chains and Sequential Processing', 'Memory Systems', 'Document Loaders and Text Splitters', 'Vector Stores and Embeddings', 'Agents and Tools', 'LangChain Expression Language (LCEL)'], 3, 'intermediate', ARRAY['LangChain', 'OpenAI Embeddings', 'ChromaDB', 'FAISS', 'Pinecone'], ARRAY['LLM Foundations']),
('Agentic AI', 'Vector Databases and RAG', ARRAY['Understanding Vector Embeddings', 'Semantic Search Principles', 'Vector Database Options', 'Retrieval-Augmented Generation (RAG)', 'Chunking Strategies', 'Embedding Models Comparison', 'Hybrid Search Techniques'], 4, 'intermediate', ARRAY['ChromaDB', 'Pinecone', 'Weaviate', 'Qdrant', 'Supabase Vector'], ARRAY['LangChain Framework']),
('Agentic AI', 'Agent Architectures', ARRAY['ReAct Pattern', 'Chain-of-Thought (CoT)', 'Tree of Thoughts', 'Multi-Agent Systems', 'Tool Use and Function Calling', 'Agent Planning and Reasoning', 'Error Recovery Mechanisms'], 5, 'intermediate', ARRAY['LangChain Agents', 'AutoGPT', 'BabyAGI', 'LangGraph'], ARRAY['LangChain Framework']),
('Agentic AI', 'CrewAI Framework', ARRAY['CrewAI Architecture', 'Defining Agents and Roles', 'Task Management', 'Inter-Agent Communication', 'Process Orchestration', 'Hierarchical vs Sequential Execution', 'Custom Tools Integration'], 6, 'advanced', ARRAY['CrewAI', 'LangChain', 'Python 3.11+'], ARRAY['Agent Architectures']),
('Agentic AI', 'n8n Workflow Automation', ARRAY['n8n Fundamentals', 'Visual Workflow Design', 'API Integrations', 'Webhook Triggers', 'Data Transformation', 'Error Handling in Workflows', 'AI Integration with n8n'], 7, 'intermediate', ARRAY['n8n', 'Docker', 'PostgreSQL', 'Supabase'], ARRAY['LLM Foundations']),
('Agentic AI', 'Supabase for AI Applications', ARRAY['Supabase Setup and Architecture', 'PostgreSQL Fundamentals', 'Authentication and Row-Level Security', 'Realtime Subscriptions', 'Edge Functions', 'Vector Search with pgvector', 'Storage and File Management'], 8, 'intermediate', ARRAY['Supabase', 'PostgreSQL', 'pgvector', 'JavaScript/TypeScript'], ARRAY['Python Fundamentals for AI']),
('Agentic AI', 'Prompt Engineering Advanced', ARRAY['Prompt Optimization Techniques', 'Few-Shot Learning', 'Chain-of-Thought Prompting', 'Role Prompting', 'System Messages', 'Prompt Injection Prevention', 'Output Formatting and Parsing'], 9, 'advanced', ARRAY['OpenAI API', 'Anthropic API', 'LangChain PromptTemplates'], ARRAY['LLM Foundations']),
('Agentic AI', 'Production Deployment', ARRAY['Containerization with Docker', 'API Rate Limiting', 'Monitoring and Logging', 'Cost Optimization', 'Scaling Strategies', 'Security Best Practices', 'CI/CD Pipelines'], 10, 'advanced', ARRAY['Docker', 'Kubernetes', 'AWS/GCP/Azure', 'Prometheus', 'Grafana', 'GitHub Actions'], ARRAY['Supabase for AI Applications', 'Agent Architectures']),
('Agentic AI', 'Real-World Projects', ARRAY['Customer Support AI Agent', 'Research Assistant Bot', 'Code Generation Agent', 'Data Analysis Agent', 'Multi-Modal AI Application', 'Agent-as-a-Service Platform'], 11, 'advanced', ARRAY['Full Stack (React/Next.js)', 'FastAPI', 'LangChain', 'CrewAI', 'Supabase', 'n8n'], ARRAY['Production Deployment']);

-- Insert React template (6 modules)
INSERT INTO roadmap_templates (skill, module_name, subtopics, order_index, level, tools, prerequisites) VALUES
('React', 'JavaScript ES6+ Fundamentals', ARRAY['Arrow Functions', 'Destructuring', 'Spread/Rest Operators', 'Template Literals', 'Promises and Async/Await', 'Modules Import/Export'], 1, 'beginner', ARRAY['Node.js', 'npm/yarn', 'VS Code'], ARRAY[]::TEXT[]),
('React', 'React Basics', ARRAY['JSX Syntax', 'Components (Functional vs Class)', 'Props and PropTypes', 'State Management (useState)', 'Event Handling', 'Conditional Rendering', 'Lists and Keys'], 2, 'beginner', ARRAY['Create React App', 'React DevTools', 'Vite'], ARRAY['JavaScript ES6+ Fundamentals']),
('React', 'React Hooks', ARRAY['useState', 'useEffect', 'useContext', 'useReducer', 'useCallback', 'useMemo', 'useRef', 'Custom Hooks'], 3, 'intermediate', ARRAY['React 18+', 'React DevTools'], ARRAY['React Basics']),
('React', 'React Router', ARRAY['BrowserRouter Setup', 'Route Configuration', 'Dynamic Routes and Params', 'Nested Routes', 'Navigation (Link, useNavigate)', 'Protected Routes', 'Lazy Loading'], 4, 'intermediate', ARRAY['React Router v6', 'React 18+'], ARRAY['React Hooks']),
('React', 'State Management', ARRAY['Context API', 'Redux Fundamentals', 'Redux Toolkit', 'Zustand', 'Recoil', 'State Management Patterns'], 5, 'advanced', ARRAY['Redux Toolkit', 'Zustand', 'Recoil'], ARRAY['React Hooks']),
('React', 'Next.js Framework', ARRAY['Pages Router vs App Router', 'Server Components', 'Client Components', 'API Routes', 'Static Generation (SSG)', 'Server-Side Rendering (SSR)', 'Image Optimization', 'SEO'], 6, 'advanced', ARRAY['Next.js 14+', 'Vercel', 'TypeScript'], ARRAY['React Router', 'State Management']);

-- Add table comments
COMMENT ON TABLE roadmap_templates IS 'Template-based roadmap structure to prevent LLM hallucination';
COMMENT ON TABLE roadmap_sections IS 'Generated roadmap content (pure LLM output)';
COMMENT ON TABLE roadmap_progress IS 'User progress tracking for roadmap completion';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Created tables: roadmap_templates, roadmap_sections, roadmap_progress';
  RAISE NOTICE 'Inserted templates: Agentic AI (11 modules), React (6 modules)';
END $$;
