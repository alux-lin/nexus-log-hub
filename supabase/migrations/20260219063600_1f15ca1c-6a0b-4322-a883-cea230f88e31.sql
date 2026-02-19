
-- =============================================
-- NEXUS LOG: Full Schema Migration
-- =============================================

-- 1. PROFILES TABLE
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  archetype_class TEXT DEFAULT 'The Architect',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own profile" ON public.profiles FOR DELETE USING (auth.uid() = user_id);

-- 2. STAT DEFINITIONS TABLE
CREATE TABLE public.stat_definitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'zap',
  color TEXT DEFAULT '#3B82F6',
  current_value INTEGER NOT NULL DEFAULT 0,
  max_value INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.stat_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own stats" ON public.stat_definitions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own stats" ON public.stat_definitions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own stats" ON public.stat_definitions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own stats" ON public.stat_definitions FOR DELETE USING (auth.uid() = user_id);

-- 3. INVENTORY ITEMS TABLE
CREATE TABLE public.inventory_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  category TEXT DEFAULT 'General',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own inventory" ON public.inventory_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own inventory" ON public.inventory_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own inventory" ON public.inventory_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own inventory" ON public.inventory_items FOR DELETE USING (auth.uid() = user_id);

-- 4. QUESTS TABLE
CREATE TABLE public.quests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  category_stat_id UUID REFERENCES public.stat_definitions(id) ON DELETE SET NULL,
  impact INTEGER NOT NULL DEFAULT 1 CHECK (impact >= 1 AND impact <= 5),
  reflection TEXT,
  quarter TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own quests" ON public.quests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own quests" ON public.quests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own quests" ON public.quests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own quests" ON public.quests FOR DELETE USING (auth.uid() = user_id);

-- 5. QUARTERLY VISIONS TABLE
CREATE TABLE public.quarterly_visions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  quarter_label TEXT NOT NULL,
  year INTEGER NOT NULL,
  vision_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, quarter_label, year)
);

ALTER TABLE public.quarterly_visions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own visions" ON public.quarterly_visions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own visions" ON public.quarterly_visions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own visions" ON public.quarterly_visions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own visions" ON public.quarterly_visions FOR DELETE USING (auth.uid() = user_id);

-- 6. SHARED UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_stat_definitions_updated_at BEFORE UPDATE ON public.stat_definitions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON public.inventory_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_quests_updated_at BEFORE UPDATE ON public.quests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_quarterly_visions_updated_at BEFORE UPDATE ON public.quarterly_visions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. AUTO-CREATE PROFILE ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
