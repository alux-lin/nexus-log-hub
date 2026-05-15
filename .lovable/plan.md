## Plan: Add `src/lib/rewardRoll.ts`

Create a new pure-logic module (no React, no Supabase imports) for reward rolling.

### File: `src/lib/rewardRoll.ts`

**Types** (defined locally, derived from the existing `reward_items` and `tracker_reward_overrides` tables):
- `RewardItem` — `{ id: string; rarity: string; weight: number; is_active?: boolean; ... }` (use a structural type matching the Supabase row).
- `TrackerRewardOverride` — `{ reward_item_id: string; excluded: boolean; weight_override: number | null }`.
- `RarityMultipliers` — `Record<string, number>`, with default `{ common: 1.0, rare: 0.4, legendary: 0.15 }`.

**Exports:**

1. `getEffectiveWeight(item, overrides, rarityMultipliers)` → `number`
   - Find override for `item.id`.
   - Base weight = `override.weight_override ?? item.weight`.
   - Multiplier = `rarityMultipliers[item.rarity] ?? 1.0`.
   - Return `base * multiplier`.
   - Returns `0` if the item is excluded (caller filters first, but safe fallback).

2. `rollReward({ rewardItems, overrides, baseFireRate = 0.35 })` → `RewardItem | null`
   - **Stage 1**: if `Math.random() >= baseFireRate`, return `null`.
   - **Stage 2**: build eligible pool: filter out items where `is_active === false` or where override has `excluded: true`.
   - Compute effective weight for each via `getEffectiveWeight`.
   - Drop items with `weight <= 0`.
   - If pool is empty, return `null`.
   - Weighted random: sum weights, pick `Math.random() * total`, walk pool subtracting until threshold crossed, return that item.

### Constraints
- No imports from `react`, `@/integrations/supabase/*`, or any hook/component.
- Pure functions; `Math.random()` is the only side effect (acceptable per spec).
- Default rarity multipliers exported as a const so tests can reuse them.

### Out of scope
- No call sites updated. No tests added (existing `src/test/example.test.ts` left untouched). No DB or hook changes.
