import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useActiveQuests } from "@/hooks/usePlayerData";

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];

function getDefaultQuarter() {
  const now = new Date();
  return {
    quarter: `Q${Math.ceil((now.getMonth() + 1) / 3)}`,
    year: now.getFullYear(),
  };
}

interface MilestoneRow {
  threshold_percent: string;
  reward_text: string;
}

export interface CreateTrackerFormValues {
  title: string;
  unit: string;
  target_value: number;
  quarter_label: string;
  year: number;
  linked_quest_id: string | null;
  milestones: { threshold_percent: number; reward_text: string }[];
}

interface CreateTrackerFormProps {
  onSubmit: (data: CreateTrackerFormValues) => void;
  onCancel: () => void;
  isPending?: boolean;
}

export default function CreateTrackerForm({ onSubmit, onCancel, isPending }: CreateTrackerFormProps) {
  const defaults = getDefaultQuarter();
  const { data: activeQuests } = useActiveQuests();

  const [title, setTitle] = useState("");
  const [unit, setUnit] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [quarter, setQuarter] = useState(defaults.quarter);
  const [year, setYear] = useState(defaults.year);
  const [linkedQuestId, setLinkedQuestId] = useState<string>("none");
  const [milestones, setMilestones] = useState<MilestoneRow[]>([
    { threshold_percent: "100", reward_text: "" },
  ]);

  const quarterQuests = (activeQuests ?? []).filter(
    (q: any) => q.quarter === `${quarter} ${year}` || q.quarter === quarter
  );

  const addMilestone = () => {
    setMilestones((prev) => [...prev, { threshold_percent: "", reward_text: "" }]);
  };

  const removeMilestone = (index: number) => {
    setMilestones((prev) => prev.filter((_, i) => i !== index));
  };

  const updateMilestone = (index: number, field: keyof MilestoneRow, value: string) => {
    setMilestones((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetValue);
    if (!title.trim() || !unit.trim() || !Number.isFinite(target) || target <= 0) return;

    const cleanMilestones = milestones
      .map((m) => ({
        threshold_percent: Math.min(100, Math.max(1, parseFloat(m.threshold_percent) || 0)),
        reward_text: m.reward_text.trim(),
      }))
      .filter((m) => m.threshold_percent > 0 && m.reward_text.length > 0);

    onSubmit({
      title: title.trim(),
      unit: unit.trim(),
      target_value: target,
      quarter_label: quarter,
      year,
      linked_quest_id: linkedQuestId === "none" ? null : linkedQuestId,
      milestones: cleanMilestones,
    });
  };

  const canSubmit =
    title.trim().length > 0 &&
    unit.trim().length > 0 &&
    parseFloat(targetValue) > 0 &&
    !isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="tracker-title">Title</Label>
        <Input
          id="tracker-title"
          placeholder="What are you tracking?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="tracker-unit">Unit</Label>
          <Input
            id="tracker-unit"
            placeholder="km, pages, sessions…"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tracker-target">Quarterly Target</Label>
          <Input
            id="tracker-target"
            type="number"
            min={0}
            step="any"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-3 w-full">
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground">Quarter</Label>
          <Select value={quarter} onValueChange={setQuarter}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {QUARTERS.map((q) => (
                <SelectItem key={q} value={q}>{q}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-28">
          <Label className="text-xs text-muted-foreground">Year</Label>
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[defaults.year - 1, defaults.year, defaults.year + 1].map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Milestones */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Milestones</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addMilestone}
            className="gap-1 h-7 text-xs"
          >
            <Plus className="w-3 h-3" /> Add Milestone
          </Button>
        </div>
        {milestones.length === 0 && (
          <p className="text-xs text-muted-foreground">No milestones. Add one to celebrate progress.</p>
        )}
        {milestones.map((m, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Input
                type="number"
                min={1}
                max={100}
                value={m.threshold_percent}
                onChange={(e) => updateMilestone(i, "threshold_percent", e.target.value)}
                className="w-20 h-9 text-center"
                placeholder="%"
              />
              <span className="text-xs text-muted-foreground">%</span>
            </div>
            <Input
              placeholder="Reward at this milestone"
              value={m.reward_text}
              onChange={(e) => updateMilestone(i, "reward_text", e.target.value)}
              className="flex-1 h-9"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => removeMilestone(i)}
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}
      </div>

      {/* Link to Quest */}
      <div className="space-y-2">
        <Label>Link to Quest <span className="text-xs text-muted-foreground">(optional)</span></Label>
        <Select value={linkedQuestId} onValueChange={setLinkedQuestId}>
          <SelectTrigger>
            <SelectValue placeholder="None" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {quarterQuests.map((q: any) => (
              <SelectItem key={q.id} value={q.id}>{q.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={!canSubmit}>Create Tracker</Button>
      </div>
    </form>
  );
}
