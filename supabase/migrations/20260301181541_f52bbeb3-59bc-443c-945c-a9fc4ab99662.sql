
-- Junction table: each quest can reward XP to multiple stats
CREATE TABLE public.quest_stat_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quest_id UUID NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
  stat_id UUID NOT NULL REFERENCES public.stat_definitions(id) ON DELETE CASCADE,
  xp_amount INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(quest_id, stat_id)
);

ALTER TABLE public.quest_stat_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own quest rewards"
  ON public.quest_stat_rewards FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.quests WHERE quests.id = quest_id AND quests.user_id = auth.uid()));

CREATE POLICY "Users can insert their own quest rewards"
  ON public.quest_stat_rewards FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.quests WHERE quests.id = quest_id AND quests.user_id = auth.uid()));

CREATE POLICY "Users can update their own quest rewards"
  ON public.quest_stat_rewards FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.quests WHERE quests.id = quest_id AND quests.user_id = auth.uid()));

CREATE POLICY "Users can delete their own quest rewards"
  ON public.quest_stat_rewards FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.quests WHERE quests.id = quest_id AND quests.user_id = auth.uid()));
