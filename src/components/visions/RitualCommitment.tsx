import { format } from "date-fns";
import { Shield, ChevronLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PnvData } from "./PnvSanctuary";
import type { QuestDraft } from "./GoalExtraction";

interface RitualCommitmentProps {
  pnv: PnvData;
  quests: QuestDraft[];
  onCommit: () => void;
  onBack: () => void;
  isCommitting: boolean;
}

export function RitualCommitment({ pnv, quests, onCommit, onBack, isCommitting }: RitualCommitmentProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-2xl mx-auto px-4">
      <Shield className="w-10 h-10 text-gold mb-4" />
      <h2 className="font-display text-3xl text-gold mb-2 text-center">
        Review & Commit
      </h2>
      <p className="text-muted-foreground text-sm text-center mb-8">
        Confirm your vision and quests for {pnv.quarter} {pnv.year}.
      </p>

      {/* PNV Summary */}
      <div className="w-full bg-secondary/50 rounded-lg border border-gold/20 p-6 mb-6">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-mono">
          Present Narrative Vision · {format(pnv.targetDate, "MMMM d, yyyy")}
        </p>
        <p className="font-display italic text-foreground/90 leading-relaxed text-lg">
          "{pnv.text}"
        </p>
      </div>

      {/* Quests Summary */}
      <div className="w-full bg-secondary/50 rounded-lg border border-border p-6 mb-8">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-mono">
          Quests ({quests.length})
        </p>
        <ul className="space-y-2">
          {quests.map((q, i) => (
            <li key={i} className="flex items-center gap-2 text-foreground/80">
              <Sparkles className="w-3.5 h-3.5 text-gold shrink-0" />
              <span className="text-sm">{q.title}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-3">
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <Button
          onClick={onCommit}
          disabled={isCommitting}
          className="bg-gold text-gold-foreground hover:bg-gold/90 px-8"
          size="lg"
        >
          {isCommitting ? "Committing..." : "Commit to Quarter"} <Sparkles className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
