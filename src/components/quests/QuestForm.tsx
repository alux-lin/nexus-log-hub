import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStats } from "@/hooks/usePlayerData";

const impactLevels = [1, 2, 3, 4, 5] as const;

interface QuestFormProps {
  onSubmit: (data: {
    title: string;
    category_stat_id: string | null;
    impact: number;
    reflection: string | null;
    quarter: string | null;
  }) => void;
  onCancel: () => void;
  isPending?: boolean;
}

export default function QuestForm({ onSubmit, onCancel, isPending }: QuestFormProps) {
  const { data: stats } = useStats();
  const [title, setTitle] = useState("");
  const [statId, setStatId] = useState<string>("");
  const [impact, setImpact] = useState(3);
  const [reflection, setReflection] = useState("");

  const now = new Date();
  const quarter = `Q${Math.ceil((now.getMonth() + 1) / 3)} ${now.getFullYear()}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      category_stat_id: statId || null,
      impact,
      reflection: reflection.trim() || null,
      quarter,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="quest-title">Quest Title</Label>
        <Input
          id="quest-title"
          placeholder="What did you accomplish?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Stat Category</Label>
          <Select value={statId} onValueChange={setStatId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose stat…" />
            </SelectTrigger>
            <SelectContent>
              {stats?.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: s.color ?? undefined }} />
                    {s.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
      </div>

      <div className="space-y-2">
        <Label htmlFor="reflection">Reflection (Markdown)</Label>
        <Textarea
          id="reflection"
          placeholder="What did you learn? How did this change you?"
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          rows={5}
          className="font-mono text-xs resize-none"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!title.trim() || isPending} className="gap-1.5">
          Complete Quest
        </Button>
      </div>
    </form>
  );
}
