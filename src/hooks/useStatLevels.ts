import { useMemo } from "react";
import { useCompletedQuests, useStats } from "./usePlayerData";

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
 * Calculates stat levels from completed quest impacts.
 * Pure computation — no side effects.
 */
export function useStatLevels() {
  const { data: stats } = useStats();
  const { data: completedQuests } = useCompletedQuests();

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
        archetypeName: (s as Record<string, unknown>).archetype_name as string | null,
        totalXp,
        level,
        progress,
        xpToNext: nextXp - totalXp,
      };
    });
  }, [stats, completedQuests]);

  return statLevels;
}

/** Get the dominant stat's archetype name */
export function getDominantArchetype(statLevels: StatLevel[]): string | null {
  if (statLevels.length === 0) return null;
  const dominant = statLevels.reduce((a, b) => (b.totalXp > a.totalXp ? b : a));
  if (dominant.totalXp === 0) return null;
  return dominant.archetypeName ?? `The ${dominant.name} Master`;
}
