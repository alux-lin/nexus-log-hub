
-- Add status and target_completion_date columns to quests
ALTER TABLE public.quests 
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS target_completion_date date NULL;

-- Mark all existing quests (that have completed_at set) as completed
UPDATE public.quests SET status = 'completed' WHERE completed_at IS NOT NULL;
