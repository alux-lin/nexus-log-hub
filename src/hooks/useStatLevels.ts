import { useMemo } from "react";
import { useStats, useProfile, useQuestRewards } from "./usePlayerData";

/** Total cumulative XP needed to reach a given level */
export function xpForLevel(level: number, base: number, ratio: number): number {
  if (level <= 1) return 0;
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += Math.floor(base * Math.pow(ratio, i - 1));
  }
  return total;
}

/** Derive level from cumulative XP */
export function levelFromXp(xp: number, base: number, ratio: number, maxLevel: number): number {
  let level = 1;
  let cumulative = 0;
  while (level < maxLevel) {
    const needed = Math.floor(base * Math.pow(ratio, level - 1));
    if (cumulative + needed > xp) break;
    cumulative += needed;
    level++;
  }
  return level;
}

/** XP progress within current level (0–1) */
export function levelProgress(xp: number, base: number, ratio: number, maxLevel: number): number {
  const level = levelFromXp(xp, base, ratio, maxLevel);
  if (level >= maxLevel) return 1;
  const currentLevelXp = xpForLevel(level, base, ratio);
  const nextLevelXp = xpForLevel(level + 1, base, ratio);
  return (xp - currentLevelXp) / (nextLevelXp - currentLevelXp);
}

export interface StatLevel {
  id: string;
  name: string;
  color: string | null;
  archetypeName: string | null;
  totalXp: number;
  level: number;
  progress: number;
  xpToNext: number;
}

/**
 * Calculates stat levels from quest_stat_rewards XP.
 * Uses the user's custom XP curve parameters from their profile.
 */
export function useStatLevels() {
  const { data: profile } = useProfile();
  const { data: stats } = useStats();
  const { data: rewards } = useQuestRewards();

  const base = (profile as Record<string, unknown>)?.xp_base as number ?? 5;
  const ratio = Number((profile as Record<string, unknown>)?.xp_ratio ?? 1.5);
  const maxLevel = (profile as Record<string, unknown>)?.xp_max_level as number ?? 20;

  const statLevels = useMemo<StatLevel[]>(() => {
    if (!stats) return [];

    const xpByStat: Record<string, number> = {};
    for (const s of stats) xpByStat[s.id] = 0;

    // Sum XP from quest_stat_rewards (only completed quests due to inner join)
    if (rewards) {
      for (const r of rewards) {
        const reward = r as Record<string, unknown>;
        const statId = reward.stat_id as string;
        const xp = reward.xp_amount as number;
        const quest = reward.quests as Record<string, unknown>;
        if (quest?.status === "completed" && xpByStat[statId] !== undefined) {
          xpByStat[statId] += xp;
        }
      }
    }

    return stats.map((s) => {
      const totalXp = xpByStat[s.id] ?? 0;
      const level = levelFromXp(totalXp, base, ratio, maxLevel);
      const progress = levelProgress(totalXp, base, ratio, maxLevel);
      const nextXp = xpForLevel(level + 1, base, ratio);
      return {
        id: s.id,
        name: s.name,
        color: s.color,
        archetypeName: (s as Record<string, unknown>).archetype_name as string | null,
        totalXp,
        level,
        progress,
        xpToNext: nextXp - totalXp,
      };
    });
  }, [stats, rewards, base, ratio, maxLevel]);

  return statLevels;
}

/** Get the dominant stat's archetype name */
export function getDominantArchetype(statLevels: StatLevel[]): string | null {
  if (statLevels.length === 0) return null;
  const dominant = statLevels.reduce((a, b) => (b.totalXp > a.totalXp ? b : a));
  if (dominant.totalXp === 0) return null;
  return dominant.archetypeName ?? `The ${dominant.name} Master`;
}
