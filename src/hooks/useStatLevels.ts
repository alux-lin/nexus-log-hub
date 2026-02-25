import { useMemo, useRef, useEffect } from "react";
import { useCompletedQuests, useStats, useUpdateStat, useUpdateProfile } from "./usePlayerData";
import { useToast } from "./use-toast";

// Exponential XP curve: XP needed for level N = base * (ratio ^ (N-1))
const BASE_XP = 5;
const RATIO = 1.5;
const MAX_LEVEL = 20;

/** Total cumulative XP needed to reach a given level */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += Math.floor(BASE_XP * Math.pow(RATIO, i - 1));
  }
  return total;
}

/** Derive level from cumulative XP */
export function levelFromXp(xp: number): number {
  let level = 1;
  let cumulative = 0;
  while (level < MAX_LEVEL) {
    const needed = Math.floor(BASE_XP * Math.pow(RATIO, level - 1));
    if (cumulative + needed > xp) break;
    cumulative += needed;
    level++;
  }
  return level;
}

/** XP progress within current level (0–1) */
export function levelProgress(xp: number): number {
  const level = levelFromXp(xp);
  if (level >= MAX_LEVEL) return 1;
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  return (xp - currentLevelXp) / (nextLevelXp - currentLevelXp);
}

const ARCHETYPE_MAP: Record<string, string> = {
  Strength: "The Guardian",
  Intellect: "The Architect",
  Spirit: "The Sage",
};

export interface StatLevel {
  id: string;
  name: string;
  color: string | null;
  totalXp: number;
  level: number;
  progress: number;
  xpToNext: number;
}

/**
 * Calculates stat levels from completed quest impacts.
 * Also syncs current_value on stat_definitions and auto-updates archetype.
 */
export function useStatLevels() {
  const { data: stats } = useStats();
  const { data: completedQuests } = useCompletedQuests();
  const updateStat = useUpdateStat();
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();
  const prevLevelsRef = useRef<Record<string, number>>({});

  const statLevels = useMemo<StatLevel[]>(() => {
    if (!stats || !completedQuests) return [];

    // Sum impact per stat from completed quests
    const xpByStat: Record<string, number> = {};
    for (const s of stats) xpByStat[s.id] = 0;

    for (const q of completedQuests) {
      if (q.category_stat_id && xpByStat[q.category_stat_id] !== undefined) {
        xpByStat[q.category_stat_id] += q.impact;
      }
    }

    return stats.map((s) => {
      const totalXp = xpByStat[s.id] ?? 0;
      const level = levelFromXp(totalXp);
      const progress = levelProgress(totalXp);
      const nextXp = xpForLevel(level + 1);
      return {
        id: s.id,
        name: s.name,
        color: s.color,
        totalXp,
        level,
        progress,
        xpToNext: nextXp - totalXp,
      };
    });
  }, [stats, completedQuests]);

  // Detect level-ups and sync
  useEffect(() => {
    if (statLevels.length === 0) return;

    const prev = prevLevelsRef.current;
    const hasPrev = Object.keys(prev).length > 0;

    for (const sl of statLevels) {
      // Show level-up toast
      if (hasPrev && prev[sl.id] !== undefined && sl.level > prev[sl.id]) {
        toast({
          title: `⬆️ Level Up! ${sl.name} → Lv.${sl.level}`,
          description: `Your ${sl.name} stat reached level ${sl.level}!`,
        });
      }

      // Sync current_value to stat_definitions
      updateStat.mutate({ id: sl.id, current_value: sl.totalXp });
    }

    // Update prev levels
    const newPrev: Record<string, number> = {};
    for (const sl of statLevels) newPrev[sl.id] = sl.level;
    prevLevelsRef.current = newPrev;

    // Auto-set archetype based on dominant stat
    if (statLevels.length > 0) {
      const dominant = statLevels.reduce((a, b) => (b.totalXp > a.totalXp ? b : a));
      if (dominant.totalXp > 0) {
        const archetype = ARCHETYPE_MAP[dominant.name] ?? `The ${dominant.name} Master`;
        updateProfile.mutate({ archetype_class: archetype });
      }
    }
  }, [statLevels]); // eslint-disable-line react-hooks/exhaustive-deps

  return statLevels;
}
