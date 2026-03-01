import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useStats } from "@/hooks/usePlayerData";
import { cn } from "@/lib/utils";

interface StatReward {
  stat_id: string;
  xp_amount: number;
}

interface StartQuestFormProps {
  onSubmit: (data: { title: string; category_stat_id: string | null; target_completion_date: string | null; statRewards: StatReward[] }) => void;
  onCancel: () => void;
  isPending?: boolean;
}

export default function StartQuestForm({ onSubmit, onCancel, isPending }: StartQuestFormProps) {
  const { data: stats } = useStats();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date>();
  const [statRewards, setStatRewards] = useState<StatReward[]>([]);

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

  const usedStatIds = new Set(statRewards.map((r) => r.stat_id));
  const canAddMore = stats && stats.length > usedStatIds.size;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      category_stat_id: statRewards.length === 1 ? statRewards[0].stat_id : null,
      target_completion_date: date ? format(date, "yyyy-MM-dd") : null,
      statRewards,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="quest-title">Quest Title</Label>
        <Input id="quest-title" placeholder="What's your goal?" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
      </div>

      {/* Stat XP Rewards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Stat XP Rewards</Label>
          <Button type="button" variant="outline" size="sm" onClick={addReward} disabled={!canAddMore} className="gap-1 h-7 text-xs">
            <Plus className="w-3 h-3" /> Add Stat
          </Button>
        </div>
        {statRewards.length === 0 && (
          <p className="text-xs text-muted-foreground">No stats linked. Add stats to plan XP rewards.</p>
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
        <Label>Target Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={!title.trim() || isPending}>Start Quest</Button>
      </div>
    </form>
  );
}
