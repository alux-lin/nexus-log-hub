import { useState, useEffect } from "react";
import { Star, Sparkles, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useStats, useProfile } from "@/hooks/usePlayerData";
import { cn } from "@/lib/utils";

function getXpPresets(base: number) {
  return { Low: base, Medium: base * 2, High: base * 4 };
}

const impactLevels = [1, 2, 3, 4, 5] as const;

interface StatReward {
  stat_id: string;
  xp_amount: number;
}

interface CompleteQuestModalProps {
  quest: { id: string; title: string } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: { id: string; impact: number; reflection: string | null; statRewards: StatReward[] }) => void;
  isPending?: boolean;
}

export default function CompleteQuestModal({ quest, open, onOpenChange, onComplete, isPending }: CompleteQuestModalProps) {
  const { data: stats } = useStats();
  const { data: profile } = useProfile();
  const xpPresets = getXpPresets(profile?.xp_base ?? 5);
  const [impact, setImpact] = useState(3);
  const [reflection, setReflection] = useState("");
  const [statRewards, setStatRewards] = useState<StatReward[]>([]);

  // Reset when quest changes
  useEffect(() => {
    if (open) {
      setImpact(3);
      setReflection("");
      setStatRewards([]);
    }
  }, [open]);

  const addReward = () => {
    const usedIds = new Set(statRewards.map((r) => r.stat_id));
    const available = stats?.find((s) => !usedIds.has(s.id));
    if (available) {
      setStatRewards((prev) => [...prev, { stat_id: available.id, xp_amount: 5 }]);
    }
  };

  const removeReward = (index: number) => {
    setStatRewards((prev) => prev.filter((_, i) => i !== index));
  };

  const updateReward = (index: number, field: keyof StatReward, value: string | number) => {
    setStatRewards((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quest) return;
    onComplete({ id: quest.id, impact, reflection: reflection.trim() || null, statRewards });
  };

  const usedStatIds = new Set(statRewards.map((r) => r.stat_id));
  const canAddMore = stats && stats.length > usedStatIds.size;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-gold" /> Complete Quest
          </DialogTitle>
          <DialogDescription>Completing: <span className="font-medium text-foreground">{quest?.title}</span></DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label>Impact (1–5)</Label>
            <div className="flex gap-1">
              {impactLevels.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setImpact(n)}
                  className={`flex-1 h-10 rounded-md text-sm font-medium transition-colors border ${
                    impact >= n
                      ? "bg-gold/20 text-gold border-gold/40"
                      : "bg-secondary text-muted-foreground border-border hover:bg-secondary/80"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Stat XP Rewards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>XP Rewards</Label>
              <Button type="button" variant="outline" size="sm" onClick={addReward} disabled={!canAddMore} className="gap-1 h-7 text-xs">
                <Plus className="w-3 h-3" /> Add Stat
              </Button>
            </div>
            {statRewards.length === 0 && (
              <p className="text-xs text-muted-foreground">No XP rewards assigned. Add stats to grant XP.</p>
            )}
            {statRewards.map((reward, i) => (
              <div key={i} className="flex items-center gap-2">
                <Select value={reward.stat_id} onValueChange={(v) => updateReward(i, "stat_id", v)}>
                  <SelectTrigger className="flex-1 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stats?.filter((s) => s.id === reward.stat_id || !usedStatIds.has(s.id)).map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ background: s.color ?? undefined }} />
                          {s.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-1">
                  {Object.entries(xpPresets).map(([label, val]) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => updateReward(i, "xp_amount", val)}
                      className={cn("px-1.5 py-0.5 text-[10px] rounded border transition-colors", reward.xp_amount === val ? "bg-gold/20 text-gold border-gold/40" : "bg-secondary text-muted-foreground border-border hover:bg-secondary/80")}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <Input
                  type="number"
                  min={1}
                  max={999}
                  value={reward.xp_amount}
                  onChange={(e) => updateReward(i, "xp_amount", Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 h-9 text-center"
                />
                <span className="text-xs text-muted-foreground">XP</span>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeReward(i)}>
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reflection">Reflection (Markdown)</Label>
            <Textarea
              id="reflection"
              placeholder="What did you learn? How did this change you?"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              rows={4}
              className="font-mono text-xs resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending} className="gap-1.5">
              <Star className="w-4 h-4" /> Complete Quest
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
