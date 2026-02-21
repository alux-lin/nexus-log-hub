import { useState } from "react";
import { Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const impactLevels = [1, 2, 3, 4, 5] as const;

interface CompleteQuestModalProps {
  quest: { id: string; title: string } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: { id: string; impact: number; reflection: string | null }) => void;
  isPending?: boolean;
}

export default function CompleteQuestModal({ quest, open, onOpenChange, onComplete, isPending }: CompleteQuestModalProps) {
  const [impact, setImpact] = useState(3);
  const [reflection, setReflection] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quest) return;
    onComplete({ id: quest.id, impact, reflection: reflection.trim() || null });
    setImpact(3);
    setReflection("");
  };

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
