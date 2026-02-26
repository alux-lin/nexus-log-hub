
ALTER TABLE public.profiles
ADD COLUMN xp_base integer NOT NULL DEFAULT 5,
ADD COLUMN xp_ratio numeric(4,2) NOT NULL DEFAULT 1.5,
ADD COLUMN xp_max_level integer NOT NULL DEFAULT 20;
