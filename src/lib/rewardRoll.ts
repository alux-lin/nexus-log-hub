// Pure reward-roll logic. No React, no Supabase imports.

export interface RewardItem {
  id: string;
  rarity: string;
  weight: number;
  is_active?: boolean;
  [key: string]: unknown;
}

export interface TrackerRewardOverride {
  reward_item_id: string;
  excluded: boolean;
  weight_override: number | null;
}

export type RarityMultipliers = Record<string, number>;

export const DEFAULT_RARITY_MULTIPLIERS: RarityMultipliers = {
  common: 1.0,
  rare: 0.4,
  legendary: 0.15,
};

export const DEFAULT_BASE_FIRE_RATE = 0.35;

export function getEffectiveWeight(
  item: RewardItem,
  overrides: TrackerRewardOverride[],
  rarityMultipliers: RarityMultipliers = DEFAULT_RARITY_MULTIPLIERS
): number {
  const override = overrides.find((o) => o.reward_item_id === item.id);
  if (override?.excluded) return 0;
  const base = override?.weight_override ?? item.weight;
  const multiplier = rarityMultipliers[item.rarity] ?? 1.0;
  const effective = base * multiplier;
  return effective > 0 ? effective : 0;
}

export function rollReward(params: {
  rewardItems: RewardItem[];
  overrides: TrackerRewardOverride[];
  baseFireRate?: number;
  rarityMultipliers?: RarityMultipliers;
}): RewardItem | null {
  const {
    rewardItems,
    overrides,
    baseFireRate = DEFAULT_BASE_FIRE_RATE,
    rarityMultipliers = DEFAULT_RARITY_MULTIPLIERS,
  } = params;

  // Stage 1: did any reward fire?
  if (Math.random() >= baseFireRate) return null;

  // Stage 2: build eligible weighted pool.
  const pool: { item: RewardItem; weight: number }[] = [];
  for (const item of rewardItems) {
    if (item.is_active === false) continue;
    const w = getEffectiveWeight(item, overrides, rarityMultipliers);
    if (w > 0) pool.push({ item, weight: w });
  }

  if (pool.length === 0) return null;

  const total = pool.reduce((sum, p) => sum + p.weight, 0);
  if (total <= 0) return null;

  let threshold = Math.random() * total;
  for (const entry of pool) {
    threshold -= entry.weight;
    if (threshold <= 0) return entry.item;
  }
  return pool[pool.length - 1].item;
}
