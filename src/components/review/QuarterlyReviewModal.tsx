import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ScrollText, Trophy, Swords, Package, ArrowRight, Archive, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useManifestoBuilder, useArchiveQuarter, type ManifestoData } from "@/hooks/useQuarterlyReview";
import { useStatLevels } from "@/hooks/useStatLevels";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Props {
  quarterLabel: string;
  year: number;
  onClose: () => void;
}

type Step = "manifesto" | "triage" | "done";

export function QuarterlyReviewModal({ quarterLabel, year, onClose }: Props) {
  const { data, isLoading } = useManifestoBuilder(quarterLabel, year);
  const statLevels = useStatLevels();
  const archiveQuarter = useArchiveQuarter();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("manifesto");
  const [carryOver, setCarryOver] = useState<Set<string>>(new Set());
  const [isArchiving, setIsArchiving] = useState(false);

  // Merge stat levels into manifesto growth data
  const enrichedGrowth = useMemo(() => {
    if (!data) return [];
    return data.statGrowth.map((sg) => {
      const sl = statLevels.find((s) => s.name === sg.name);
      return { ...sg, levelReached: sl?.level ?? 0 };
    });
  }, [data, statLevels]);

  const toggleCarry = (id: string) => {
    setCarryOver((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleArchive = async () => {
    if (!data) return;
    setIsArchiving(true);
    try {
      const activeIds = data.activeQuests.map((q) => q.id);
      const carryIds = activeIds.filter((id) => carryOver.has(id));
      const abandonIds = activeIds.filter((id) => !carryOver.has(id));

      const manifesto: ManifestoData = {
        visionText: data.visionText,
        completedQuests: data.completedQuests,
        abandonedQuests: data.activeQuests.filter((q) => abandonIds.includes(q.id)).map((q) => q.title),
        carriedOverQuests: data.activeQuests.filter((q) => carryIds.includes(q.id)).map((q) => q.title),
        statGrowth: enrichedGrowth,
        dominantArchetype: data.dominantArchetype,
        inventorySnapshot: data.inventorySnapshot,
        totalXpGained: data.totalXpGained,
        questsCompleted: data.questsCompleted,
      };

      await archiveQuarter.mutateAsync({
        quarterLabel,
        year,
        manifesto,
        abandonQuestIds: abandonIds,
        carryOverQuestIds: carryIds,
      });

      setStep("done");
      toast({ title: "Quarter Archived", description: `${quarterLabel} ${year} has been archived.` });
    } catch {
      toast({ title: "Error", description: "Failed to archive quarter.", variant: "destructive" });
    } finally {
      setIsArchiving(false);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <p className="text-muted-foreground text-sm animate-pulse">Gathering your chronicle...</p>
      </div>
    );
  }

  // ── Done Screen ──
  if (step === "done") {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Sparkles className="w-12 h-12 text-gold mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">Quarter Sealed</h2>
          <p className="text-muted-foreground text-sm mb-6">
            {quarterLabel} {year} has been archived. Your chronicle grows stronger.
          </p>
          <Button onClick={onClose} className="bg-gold text-gold-foreground hover:bg-gold/90">
            Begin Next Ritual
          </Button>
        </div>
      </div>
    );
  }

  // ── Quest Triage ──
  if (step === "triage") {
    return (
      <div className="min-h-screen p-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Swords className="w-6 h-6 text-gold" />
          <div>
            <h2 className="text-xl font-bold text-foreground">Quest Triage</h2>
            <p className="text-sm text-muted-foreground">
              {data.activeQuests.length} unfinished quest{data.activeQuests.length !== 1 ? "s" : ""} — choose which to carry forward
            </p>
          </div>
        </div>

        {data.activeQuests.length === 0 ? (
          <Card className="border-border mb-6">
            <CardContent className="p-6 text-center text-muted-foreground text-sm">
              All quests completed — nothing to triage! 🎉
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2 mb-6">
            {data.activeQuests.map((q) => (
              <Card
                key={q.id}
                className={cn(
                  "border cursor-pointer transition-colors",
                  carryOver.has(q.id) ? "border-gold/40 bg-gold/5" : "border-border hover:border-muted-foreground/30"
                )}
                onClick={() => toggleCarry(q.id)}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <Checkbox
                    checked={carryOver.has(q.id)}
                    onCheckedChange={() => toggleCarry(q.id)}
                  />
                  <div className="flex-1">
                    <p className="text-sm text-foreground font-medium">{q.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {carryOver.has(q.id) ? "Will carry forward →" : "Will be abandoned"}
                    </p>
                  </div>
                  {carryOver.has(q.id) && <ArrowRight className="w-4 h-4 text-gold" />}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setStep("manifesto")}>Back</Button>
          <Button
            onClick={handleArchive}
            disabled={isArchiving}
            className="bg-gold text-gold-foreground hover:bg-gold/90 flex-1"
          >
            <Archive className="w-4 h-4 mr-1" />
            {isArchiving ? "Archiving..." : "Seal This Quarter"}
          </Button>
        </div>
      </div>
    );
  }

  // ── Manifesto View ──
  const totalXp = data.totalXpGained;
  const topStat = enrichedGrowth.reduce((a, b) => (b.xpGained > a.xpGained ? b : a), enrichedGrowth[0]);

  return (
    <div className="min-h-screen p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <ScrollText className="w-10 h-10 text-gold mx-auto mb-3" />
        <h1 className="text-3xl font-display font-bold text-foreground">
          {quarterLabel} {year} Manifesto
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Your quarterly chronicle</p>
      </div>

      {/* Vision */}
      {data.visionText && (
        <Card className="border-gold/20 mb-6">
          <CardContent className="p-6">
            <p className="text-xs uppercase tracking-widest text-gold mb-3 font-medium">Present Narrative Vision</p>
            <p className="font-display italic text-foreground/90 leading-relaxed whitespace-pre-wrap">
              "{data.visionText}"
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <Trophy className="w-5 h-5 text-gold mx-auto mb-1" />
          <p className="text-2xl font-bold font-mono text-foreground">{data.questsCompleted}</p>
          <p className="text-xs text-muted-foreground">Quests Done</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <Sparkles className="w-5 h-5 text-gold mx-auto mb-1" />
          <p className="text-2xl font-bold font-mono text-foreground">{totalXp}</p>
          <p className="text-xs text-muted-foreground">XP Gained</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <Package className="w-5 h-5 text-gold mx-auto mb-1" />
          <p className="text-2xl font-bold font-mono text-foreground">{data.inventorySnapshot.totalItems}</p>
          <p className="text-xs text-muted-foreground">Inventory</p>
        </div>
      </div>

      {/* Dominant Archetype */}
      {data.dominantArchetype && (
        <Card className="border-border mb-6">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-widest text-gold mb-1 font-medium">Dominant Archetype</p>
            <p className="text-lg font-display font-bold text-foreground">{data.dominantArchetype}</p>
          </CardContent>
        </Card>
      )}

      {/* Stat Growth Bars */}
      {enrichedGrowth.length > 0 && (
        <Card className="border-border mb-6">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4 font-medium">Stat Growth</p>
            <div className="space-y-3">
              {enrichedGrowth.map((s) => (
                <div key={s.name} className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-24 truncate">{s.name}</span>
                  <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: topStat && topStat.xpGained > 0 ? `${Math.max((s.xpGained / topStat.xpGained) * 100, 4)}%` : "4%",
                        backgroundColor: s.color ?? "hsl(var(--gold))",
                      }}
                    />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground w-24 text-right">
                    Lv.{s.levelReached} · +{s.xpGained}xp
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Quests */}
      {data.completedQuests.length > 0 && (
        <Card className="border-border mb-6">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3 font-medium">Completed Quests</p>
            <div className="space-y-2">
              {data.completedQuests.map((q, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="text-gold">✦</span>
                  <span className="text-foreground flex-1">{q.title}</span>
                  <span className="text-xs text-muted-foreground font-mono">★{q.impact}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="ghost" onClick={onClose}>Close</Button>
        <Button
          onClick={() => data.activeQuests.length > 0 ? setStep("triage") : handleArchive()}
          disabled={isArchiving}
          className="bg-gold text-gold-foreground hover:bg-gold/90 flex-1"
        >
          <Archive className="w-4 h-4 mr-1" />
          {data.activeQuests.length > 0 ? "Review Unfinished Quests" : isArchiving ? "Archiving..." : "Seal This Quarter"}
        </Button>
      </div>
    </div>
  );
}
