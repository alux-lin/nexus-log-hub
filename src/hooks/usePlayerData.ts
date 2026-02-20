import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateProfile() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (updates: { display_name?: string; archetype_class?: string }) => {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

export function useStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["stats", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stat_definitions")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });
}

export function useInitDefaultStats() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const defaults = [
        { name: "Strength", icon: "sword", color: "#EF4444", user_id: user!.id },
        { name: "Intellect", icon: "brain", color: "#3B82F6", user_id: user!.id },
        { name: "Spirit", icon: "heart", color: "#A855F7", user_id: user!.id },
      ];
      const { error } = await supabase.from("stat_definitions").insert(defaults);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stats"] }),
  });
}

export function useUpdateStat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; current_value?: number; color?: string }) => {
      const { error } = await supabase.from("stat_definitions").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stats"] }),
  });
}

export function useQuestCount() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["quest-count", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("quests")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id);
      if (error) throw error;
      return count ?? 0;
    },
  });
}

export function useInventoryItems() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["inventory", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory_items")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });
}

export function useInventoryCount() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["inventory-count", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("inventory_items")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id);
      if (error) throw error;
      return count ?? 0;
    },
  });
}

export function useAddInventoryItem() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: { name: string; quantity?: number; category?: string; description?: string }) => {
      const { error } = await supabase.from("inventory_items").insert({ ...item, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({ queryKey: ["inventory-count"] });
    },
  });
}

export function useUpdateInventoryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; quantity?: number; category?: string; description?: string }) => {
      const { error } = await supabase.from("inventory_items").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({ queryKey: ["inventory-count"] });
    },
  });
}

export function useDeleteInventoryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("inventory_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({ queryKey: ["inventory-count"] });
    },
  });
}

export function useCurrentVision() {
  const { user } = useAuth();
  const now = new Date();
  const quarter = `Q${Math.ceil((now.getMonth() + 1) / 3)}`;
  const year = now.getFullYear();
  return useQuery({
    queryKey: ["current-vision", user?.id, quarter, year],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quarterly_visions")
        .select("vision_text")
        .eq("user_id", user!.id)
        .eq("quarter_label", quarter)
        .eq("year", year)
        .maybeSingle();
      if (error) throw error;
      return data?.vision_text ?? null;
    },
  });
}
