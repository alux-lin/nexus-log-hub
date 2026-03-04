import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ManifestoData {
  visionText: string;
  completedQuests: { title: string; impact: number; category: string | null }[];
  abandonedQuests: string[];
  carriedOverQuests: string[];
  statGrowth: { name: string; color: string | null; xpGained: number; levelReached: number }[];
  dominantArchetype: string | null;
  inventorySnapshot: { totalItems: number; totalQuantity: number };
  totalXpGained: number;
  questsCompleted: number;
}

function getCurrentQuarter() {
  const now = new Date();
  return {
    quarter: `Q${Math.ceil((now.getMonth() + 1) / 3)}`,
    year: now.getFullYear(),
  };
}

function getPreviousQuarter() {
  const { quarter, year } = getCurrentQuarter();
  const qNum = parseInt(quarter.slice(1));
  if (qNum === 1) return { quarter: "Q4", year: year - 1 };
  return { quarter: `Q${qNum - 1}`, year };
}

/** Check if there's an unreviewed past quarter */
export function useUnreviewedQuarter() {
  const { user } = useAuth();
  const prev = getPreviousQuarter();

  return useQuery({
    queryKey: ["unreviewed-quarter", user?.id, prev.quarter, prev.year],
    enabled: !!user,
    queryFn: async () => {
      // Check if a vision exists for the previous quarter
      const { data: vision } = await supabase
        .from("quarterly_visions")
        .select("id, quarter_label, year, vision_text")
        .eq("user_id", user!.id)
        .eq("quarter_label", prev.quarter)
        .eq("year", prev.year)
        .maybeSingle();

      if (!vision) return null;

      // Check if already reviewed
      const { data: review } = await (supabase
        .from("quarterly_reviews") as any)
        .select("id")
        .eq("user_id", user!.id)
        .eq("quarter_label", prev.quarter)
        .eq("year", prev.year)
        .maybeSingle();

      if (review) return null;

      return { quarter: prev.quarter, year: prev.year, visionText: vision.vision_text };
    },
  });
}

/** Fetch all archived reviews */
export function useArchivedReviews() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["quarterly-reviews", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase
        .from("quarterly_reviews") as any)
        .select("*")
        .eq("user_id", user!.id)
        .order("year", { ascending: false })
        .order("quarter_label", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });
}

/** Build manifesto data from existing records */
export function useManifestoBuilder(quarterLabel: string, year: number) {
  const { user } = useAuth();
  const quarterString = `${quarterLabel} ${year}`;

  return useQuery({
    queryKey: ["manifesto-builder", user?.id, quarterLabel, year],
    enabled: !!user,
    queryFn: async () => {
      // Get vision
      const { data: vision } = await supabase
        .from("quarterly_visions")
        .select("vision_text")
        .eq("user_id", user!.id)
        .eq("quarter_label", quarterLabel)
        .eq("year", year)
        .maybeSingle();

      // Get completed quests for this quarter
      const { data: completedQuests } = await supabase
        .from("quests")
        .select("id, title, impact, category_stat_id, stat_definitions(name)")
        .eq("user_id", user!.id)
        .eq("status", "completed")
        .eq("quarter", quarterString);

      // Get active (incomplete) quests for this quarter
      const { data: activeQuests } = await supabase
        .from("quests")
        .select("id, title")
        .eq("user_id", user!.id)
        .eq("status", "active")
        .eq("quarter", quarterString);

      // Get stat rewards for completed quest IDs
      const completedIds = (completedQuests ?? []).map((q) => q.id);
      let rewards: { stat_id: string; xp_amount: number }[] = [];
      if (completedIds.length > 0) {
        const { data } = await supabase
          .from("quest_stat_rewards")
          .select("stat_id, xp_amount")
          .in("quest_id", completedIds);
        rewards = (data ?? []) as { stat_id: string; xp_amount: number }[];
      }

      // Get stat definitions
      const { data: stats } = await supabase
        .from("stat_definitions")
        .select("id, name, color, archetype_name")
        .eq("user_id", user!.id);

      // Get inventory summary
      const { data: inventory } = await supabase
        .from("inventory_items")
        .select("quantity")
        .eq("user_id", user!.id);

      // Build stat growth map
      const xpByStat: Record<string, number> = {};
      for (const r of rewards) {
        xpByStat[r.stat_id] = (xpByStat[r.stat_id] ?? 0) + r.xp_amount;
      }

      const statGrowth = (stats ?? []).map((s) => ({
        name: s.name,
        color: s.color,
        xpGained: xpByStat[s.id] ?? 0,
        levelReached: 0, // Will be filled by the component using useStatLevels
      }));

      const totalXp = rewards.reduce((sum, r) => sum + r.xp_amount, 0);

      // Dominant archetype
      let dominant: string | null = null;
      if (stats && stats.length > 0) {
        let maxXp = 0;
        for (const s of stats) {
          const xp = xpByStat[s.id] ?? 0;
          if (xp > maxXp) {
            maxXp = xp;
            dominant = (s as Record<string, unknown>).archetype_name as string | null ?? `The ${s.name} Master`;
          }
        }
        if (maxXp === 0) dominant = null;
      }

      const totalItems = inventory?.length ?? 0;
      const totalQuantity = inventory?.reduce((s, i) => s + (i.quantity ?? 0), 0) ?? 0;

      return {
        visionText: vision?.vision_text ?? "",
        completedQuests: (completedQuests ?? []).map((q) => ({
          title: q.title,
          impact: q.impact,
          category: (q.stat_definitions as Record<string, unknown>)?.name as string | null ?? null,
        })),
        activeQuests: (activeQuests ?? []).map((q) => ({ id: q.id, title: q.title })),
        statGrowth,
        dominantArchetype: dominant,
        inventorySnapshot: { totalItems, totalQuantity },
        totalXpGained: totalXp,
        questsCompleted: completedQuests?.length ?? 0,
      };
    },
  });
}

/** Archive a quarter */
export function useArchiveQuarter() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      quarterLabel,
      year,
      manifesto,
      abandonQuestIds,
      carryOverQuestIds,
    }: {
      quarterLabel: string;
      year: number;
      manifesto: ManifestoData;
      abandonQuestIds: string[];
      carryOverQuestIds: string[];
    }) => {
      // Save the review
      const { error } = await (supabase.from("quarterly_reviews") as any).insert({
        user_id: user!.id,
        quarter_label: quarterLabel,
        year,
        vision_text: manifesto.visionText,
        manifesto_data: manifesto as unknown as Record<string, unknown>,
      });
      if (error) throw error;

      // Abandon selected quests
      if (abandonQuestIds.length > 0) {
        const { error: abandonErr } = await supabase
          .from("quests")
          .update({ status: "abandoned" })
          .in("id", abandonQuestIds);
        if (abandonErr) throw abandonErr;
      }

      // Carry over: update quarter to the current quarter
      if (carryOverQuestIds.length > 0) {
        const now = new Date();
        const newQuarter = `Q${Math.ceil((now.getMonth() + 1) / 3)} ${now.getFullYear()}`;
        const { error: carryErr } = await supabase
          .from("quests")
          .update({ quarter: newQuarter })
          .in("id", carryOverQuestIds);
        if (carryErr) throw carryErr;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["unreviewed-quarter"] });
      qc.invalidateQueries({ queryKey: ["quarterly-reviews"] });
      qc.invalidateQueries({ queryKey: ["quests"] });
      qc.invalidateQueries({ queryKey: ["quest-count"] });
    },
  });
}
