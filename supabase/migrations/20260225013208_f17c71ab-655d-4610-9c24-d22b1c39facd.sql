-- Add sort_order and archetype_name to stat_definitions
ALTER TABLE public.stat_definitions
  ADD COLUMN sort_order integer NOT NULL DEFAULT 0,
  ADD COLUMN archetype_name text;
