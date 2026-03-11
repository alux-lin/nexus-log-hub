import { useState } from "react";
import { Swords, ChevronRight, ChevronLeft, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStats } from "@/hooks/usePlayerData";

export interface QuestDraft {
  title: string;
  category_stat_id?: string | null;
}

interface GoalExtractionProps {
  onNext: (quests: QuestDraft[]) => void;
  onBack: () => void;
  initial?: QuestDraft[];
}

export function GoalExtraction({ onNext, onBack, initial }: GoalExtractionProps) {
  const { data: stats } = useStats();
  const [quests, setQuests] = useState<QuestDraft[]>(
    initial && initial.length > 0
      ? initial
      : [{ title: "", category_stat_id: null }, { title: "", category_stat_id: null }, { title: "", category_stat_id: null }]
  );

  const update = (i: number, field: Partial<QuestDraft>) => {
    setQuests((prev) => prev.map((q, idx) => (idx === i ? { ...q, ...field } : q)));
  };

  const addQuest = () => {
    if (quests.length < 5) setQuests((prev) => [...prev, { title: "", category_stat_id: null }]);
  };

  const removeQuest = (i: number) => {
    if (quests.length > 1) setQuests((prev) => prev.filter((_, idx) => idx !== i));
  };

  const filledQuests = quests.filter((q) => q.title.trim());

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-xl mx-auto px-4">
      <Swords className="w-10 h-10 text-gold mb-4" />
      <h2 className="font-display text-3xl text-gold mb-2 text-center">
        Quests
      </h2>
      <p className="text-muted-foreground text-sm text-center mb-8 max-w-md">
        Define 3–5 concrete quests from your vision. These become active entries in your Quest Log.
      </p>

      <div className="w-full space-y-3 mb-6">
        {quests.map((q, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono w-6 text-right">{i + 1}.</span>
            <Input
              value={q.title}
              onChange={(e) => update(i, { title: e.target.value })}
              placeholder={`Quest ${i + 1} — e.g. "Ship the MVP by March"`}
              className="flex-1 border-gold/10 focus-visible:ring-gold/30"
              autoFocus={i === 0}
            />
            <Select value={q.category_stat_id ?? ""} onValueChange={(v) => update(i, { category_stat_id: v || null })}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Stat…" />
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
            {quests.length > 1 && (
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8" onClick={() => removeQuest(i)}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {quests.length < 5 && (
        <Button variant="ghost" size="sm" onClick={addQuest} className="text-muted-foreground hover:text-gold mb-8">
          <Plus className="w-4 h-4 mr-1" /> Add Quest
        </Button>
      )}

      <div className="flex gap-3">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <Button
          onClick={() => onNext(filledQuests)}
          disabled={filledQuests.length === 0}
          className="bg-gold text-gold-foreground hover:bg-gold/90 px-8"
          size="lg"
        >
          Review Ritual <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
