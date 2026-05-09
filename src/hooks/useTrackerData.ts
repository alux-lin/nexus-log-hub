import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";

function getCurrentQuarter() {
  const now = new Date();
  const quarter = `Q${Math.ceil((now.getMonth() + 1) / 3)}`;
  const year = now.getFullYear();
  return { quarter, year };
}

export function useTrackers() {
  const { user } = useAuth();
  const { quarter, year } = getCurrentQuarter();
  return useQuery({
    queryKey: ["trackers", user?.id, quarter, year],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trackers")
        .select("*")
        .eq("user_id", user!.id)
        .eq("quarter_label", quarter)
        .eq("year", year)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

interface MilestoneInput {
  threshold_percent: number;
  reward_text: string;
}

export function useCreateTracker() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      title: string;
      unit: string;
      target_value: number;
      linked_quest_id?: string | null;
      milestones?: MilestoneInput[];
    }) => {
      const { quarter, year } = getCurrentQuarter();
      const { data: tracker, error } = await supabase
        .from("trackers")
        .insert({
          user_id: user!.id,
          title: input.title,
          unit: input.unit,
          target_value: input.target_value,
          linked_quest_id: input.linked_quest_id ?? null,
          quarter_label: quarter,
          year,
        })
        .select()
        .single();
      if (error) throw error;

      if (input.milestones && input.milestones.length > 0) {
        const { error: msError } = await supabase.from("tracker_milestones").insert(
          input.milestones.map((m) => ({
            tracker_id: tracker.id,
            user_id: user!.id,
            threshold_percent: m.threshold_percent,
            reward_text: m.reward_text,
          }))
        );
        if (msError) throw msError;
      }

      return tracker;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trackers"] });
    },
  });
}

export function useDeleteTracker() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("trackers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trackers"] });
      qc.invalidateQueries({ queryKey: ["tracker-entries"] });
    },
  });
}

export function useTrackerEntries(trackerId: string | undefined) {
  return useQuery({
    queryKey: ["tracker-entries", trackerId],
    enabled: !!trackerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tracker_entries")
        .select("*")
        .eq("tracker_id", trackerId!)
        .order("logged_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useLogEntry() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: { tracker_id: string; value: number; note?: string | null }) => {
      const { error } = await supabase.from("tracker_entries").insert({
        user_id: user!.id,
        tracker_id: entry.tracker_id,
        value: entry.value,
        note: entry.note ?? null,
      });
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["tracker-entries", variables.tracker_id] });
      qc.invalidateQueries({ queryKey: ["trackers"] });
    },
  });
}

export function useRewardItems() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["reward-items", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reward_items")
        .select("*")
        .eq("user_id", user!.id)
        .order("rarity")
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateRewardItem() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: {
      title: string;
      rarity: string;
      reward_type: string;
      reward_payload?: Record<string, unknown> | null;
      weight?: number;
      is_active?: boolean;
    }) => {
      const { error } = await supabase.from("reward_items").insert({
        user_id: user!.id,
        title: item.title,
        rarity: item.rarity,
        reward_type: item.reward_type,
        reward_payload: item.reward_payload ?? null,
        weight: item.weight ?? 1.0,
        is_active: item.is_active ?? true,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reward-items"] }),
  });
}

export function useUpdateRewardItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      title?: string;
      rarity?: string;
      reward_type?: string;
      reward_payload?: Record<string, unknown> | null;
      weight?: number;
      is_active?: boolean;
    }) => {
      const { error } = await supabase.from("reward_items").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reward-items"] }),
  });
}

export function useDeleteRewardItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reward_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reward-items"] }),
  });
}

export function useTrackerRewardOverrides(trackerId: string | undefined) {
  return useQuery({
    queryKey: ["tracker-reward-overrides", trackerId],
    enabled: !!trackerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tracker_reward_overrides")
        .select("*")
        .eq("tracker_id", trackerId!);
      if (error) throw error;
      return data;
    },
  });
}

export function useUpsertRewardOverride() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (override: {
      tracker_id: string;
      reward_item_id: string;
      excluded?: boolean;
      weight_override?: number | null;
    }) => {
      const { error } = await supabase
        .from("tracker_reward_overrides")
        .upsert(
          {
            user_id: user!.id,
            tracker_id: override.tracker_id,
            reward_item_id: override.reward_item_id,
            excluded: override.excluded ?? false,
            weight_override: override.weight_override ?? null,
          },
          { onConflict: "tracker_id,reward_item_id" }
        );
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["tracker-reward-overrides", variables.tracker_id] });
    },
  });
}

export function useLogReward() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: {
      tracker_id: string;
      tracker_entry_id: string;
      reward_item_id: string | null;
      was_winner: boolean;
    }) => {
      const { error } = await supabase.from("reward_log").insert({
        user_id: user!.id,
        tracker_id: entry.tracker_id,
        tracker_entry_id: entry.tracker_entry_id,
        reward_item_id: entry.reward_item_id,
        was_winner: entry.was_winner,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reward-log"] });
    },
  });
}
