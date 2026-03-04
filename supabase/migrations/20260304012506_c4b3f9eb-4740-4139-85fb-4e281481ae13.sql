
CREATE TABLE public.quarterly_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  quarter_label text NOT NULL,
  year integer NOT NULL,
  vision_text text,
  manifesto_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  archived_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, quarter_label, year)
);

ALTER TABLE public.quarterly_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reviews" ON public.quarterly_reviews FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own reviews" ON public.quarterly_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews" ON public.quarterly_reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews" ON public.quarterly_reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);
