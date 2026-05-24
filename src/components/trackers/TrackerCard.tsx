import React, { useState, useCallback, useMemo, useRef } from "react";
import { Plus, X, Target, Trophy, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLogEntry } from "@/hooks/useTrackerData";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type TrackerRow = {
  id: string;
  title: string;
  unit: string;
  target_value: number;
};

export type TrackerEntryRow = {
  id: string;
  tracker_id: string;
  value: number;
};

export type TrackerMilestoneRow = {
  id: string;
  tracker_id: string;
  threshold_percent: number;
  reward_text: string;
  unlocked_at: string | null;
};

interface Props {
  tracker: TrackerRow;
  entries: TrackerEntryRow[];
  milestones: TrackerMilestoneRow[];
  onMilestoneUnlocked?: (milestone: TrackerMilestoneRow) => void;
}

const TrackerCard = React.memo(function TrackerCard({
  tracker,
  entries,
  milestones,
  onMilestoneUnlocked,
}: Props) {
  const logEntry = useLogEntry();
  const [logOpen, setLogOpen] = useState(false);
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");
  const previousTotalRef = useRef<number | null>(null);

  const total = useMemo(
    () => entries.reduce((sum, e) => sum + Number(e.value || 0), 0),
    [entries]
  );

  const target = Math.max(tracker.target_value, 0.0001);
  const progress = Math.min(total / target, 1);
  const sortedMilestones = useMemo(
    () => [...milestones].sort((a, b) => a.threshold_percent - b.threshold_percent),
    [milestones]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const numeric = parseFloat(value);
      if (!Number.isFinite(numeric) || numeric === 0 || logEntry.isPending) return;

      previousTotalRef.current = total;
      logEntry.mutate(
        { tracker_id: tracker.id, value: numeric, note: note.trim() || null },
        {
          onSuccess: () => {
            const prev = previousTotalRef.current ?? total;
            const next = prev + numeric;
            window.dispatchEvent(new CustomEvent("exp-gained"));

            // Detect newly crossed thresholds.
            for (const m of sortedMilestones) {
              if (m.unlocked_at) continue;
              const required = (m.threshold_percent / 100) * tracker.target_value;
              if (prev < required && next >= required) {
                onMilestoneUnlocked?.(m);
              }
            }

            setValue("");
            setNote("");
            setLogOpen(false);
            toast.success("Logged ✨");
          },
          onError: (err: any) => {
            toast.error(err?.message ?? "Failed to log entry");
          },
        }
      );
    },
    [value, note, logEntry, tracker.id, tracker.target_value, total, sortedMilestones, onMilestoneUnlocked]
  );

  return (
    <Card className="border-border hover:border-gold/30 transition-colors">
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-gold/10 text-gold flex items-center justify-center shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-foreground text-sm truncate">{tracker.title}</p>
              <p className="text-xs text-muted-foreground">{tracker.unit}</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="gap-1 text-xs h-7 shrink-0 border-gold/30 text-gold hover:bg-gold/10 hover:text-gold"
            onClick={() => setLogOpen((o) => !o)}
          >
            {logOpen ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
            {logOpen ? "Cancel" : "Log Activity"}
          </Button>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-gold transition-all duration-500"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <span className="text-xs font-mono text-muted-foreground tabular-nums shrink-0">
              {formatNumber(total)} / {formatNumber(tracker.target_value)} {tracker.unit}
            </span>
          </div>
        </div>

        {/* Milestones */}
        {sortedMilestones.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {sortedMilestones.map((m) => {
              const unlocked = m.unlocked_at !== null;
              return (
                <Tooltip key={m.id}>
                  <TooltipTrigger asChild>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border transition-colors cursor-default",
                        unlocked
                          ? "bg-gold/10 text-gold border-gold/30"
                          : "bg-muted text-muted-foreground border-border"
                      )}
                    >
                      {unlocked ? <Trophy className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      {m.threshold_percent}%
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs">{m.reward_text || "No reward set"}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        )}

        {/* Inline log form */}
        {logOpen && (
          <form onSubmit={handleSubmit} className="space-y-2 pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                step="any"
                placeholder={`Value (${tracker.unit})`}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="h-9 flex-1"
                autoFocus
              />
              <Input
                placeholder="Note (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="h-9 flex-1"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!value || logEntry.isPending}
                className="h-9"
              >
                Submit
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
});

function formatNumber(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace(/\.0$/, "");
}

export default TrackerCard;
