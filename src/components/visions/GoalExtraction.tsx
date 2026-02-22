import { useState } from "react";
import { Swords, ChevronRight, ChevronLeft, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface QuestDraft {
  title: string;
}

interface GoalExtractionProps {
  onNext: (quests: QuestDraft[]) => void;
  onBack: () => void;
  initial?: QuestDraft[];
}

export function GoalExtraction({ onNext, onBack, initial }: GoalExtractionProps) {
  const [quests, setQuests] = useState<QuestDraft[]>(
    initial && initial.length > 0
      ? initial
      : [{ title: "" }, { title: "" }, { title: "" }]
  );

  const update = (i: number, title: string) => {
    setQuests((prev) => prev.map((q, idx) => (idx === i ? { title } : q)));
  };

  const addQuest = () => {
    if (quests.length < 5) setQuests((prev) => [...prev, { title: "" }]);
  };

  const removeQuest = (i: number) => {
    if (quests.length > 1) setQuests((prev) => prev.filter((_, idx) => idx !== i));
  };

  const filledQuests = quests.filter((q) => q.title.trim());

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-xl mx-auto px-4">
      <Swords className="w-10 h-10 text-gold mb-4" />
      <h2 className="font-display text-3xl text-gold mb-2 text-center">
        Extract Epic Quests
      </h2>
      <p className="text-muted-foreground text-sm text-center mb-8 max-w-md">
        From your vision, extract 3–5 concrete quests that will make it a reality. These will become active entries in your Quest Log.
      </p>

      <div className="w-full space-y-3 mb-6">
        {quests.map((q, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-mono w-6 text-right">{i + 1}.</span>
            <Input
              value={q.title}
              onChange={(e) => update(i, e.target.value)}
              placeholder={`Quest ${i + 1} — e.g. "Ship the MVP by March"`}
              className="flex-1 border-gold/10 focus-visible:ring-gold/30"
              autoFocus={i === 0}
            />
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
