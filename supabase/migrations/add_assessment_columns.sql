-- Add missing columns to assessments table

-- Add completed_at column
ALTER TABLE public.assessments
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Add total_questions column
ALTER TABLE public.assessments
ADD COLUMN IF NOT EXISTS total_questions INTEGER DEFAULT 30;

-- Add correct_count column
ALTER TABLE public.assessments
ADD COLUMN IF NOT EXISTS correct_count INTEGER DEFAULT 0;

-- Add wrong_count column
ALTER TABLE public.assessments
ADD COLUMN IF NOT EXISTS wrong_count INTEGER DEFAULT 0;

-- Add skipped_count column
ALTER TABLE public.assessments
ADD COLUMN IF NOT EXISTS skipped_count INTEGER DEFAULT 0;

-- Add max_score column
ALTER TABLE public.assessments
ADD COLUMN IF NOT EXISTS max_score INTEGER DEFAULT 30;

-- Add evaluation_results column (JSONB to store detailed feedback)
ALTER TABLE public.assessments
ADD COLUMN IF NOT EXISTS evaluation_results JSONB;

-- Create index on completed_at for faster queries
CREATE INDEX IF NOT EXISTS idx_assessments_completed_at ON public.assessments(completed_at);

-- Add comment to table
COMMENT ON COLUMN public.assessments.completed_at IS 'Timestamp when the assessment was completed and submitted';
COMMENT ON COLUMN public.assessments.evaluation_results IS 'JSONB containing detailed evaluation results including wrong/skipped answers with explanations';
