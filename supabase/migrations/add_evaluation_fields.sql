-- Add evaluation fields to assessments table
ALTER TABLE public.assessments
ADD COLUMN IF NOT EXISTS total_questions INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS correct_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS wrong_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS skipped_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_score INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS evaluation_results JSONB;

-- Add comment to explain evaluation_results structure
COMMENT ON COLUMN public.assessments.evaluation_results IS 'Stores detailed evaluation results including question-wise feedback, correct answers, and explanations. Structure: array of {questionId, question, userAnswer, status, correctAnswer, explanation, marksAwarded}';
