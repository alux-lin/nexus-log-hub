import { useState, useCallback, useEffect } from "react";
import { format, parse } from "date-fns";
import { Eye, Plus, Sparkles, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrentVision, useAllVisions, useSaveVision, useStartQuest } from "@/hooks/usePlayerData";
import { useUnreviewedQuarter, useArchivedReviews } from "@/hooks/useQuarterlyReview";
import { useToast } from "@/hooks/use-toast";
import { RitualStepper } from "@/components/visions/RitualStepper";
import { PnvSanctuary, type PnvData } from "@/components/visions/PnvSanctuary";
import { GoalExtraction, type QuestDraft } from "@/components/visions/GoalExtraction";
import { RitualCommitment } from "@/components/visions/RitualCommitment";
import { QuarterlyReviewModal } from "@/components/review/QuarterlyReviewModal";

function getDefaultQuarter() {
  const now = new Date();
  return {
    quarter: `Q${Math.ceil((now.getMonth() + 1) / 3)}`,
    year: now.getFullYear(),
  };
}

function getQuarterEndDate(quarter: string, year: number): Date {
  const endDates: Record<string, string> = { Q1: "03-31", Q2: "06-30", Q3: "09-30", Q4: "12-31" };
  return parse(`${year}-${endDates[quarter] ?? "12-31"}`, "yyyy-MM-dd", new Date());
}

export default function Visions() {
  const { data: currentVision, isLoading: loadingCurrent } = useCurrentVision();
  const { data: allVisions, isLoading: loadingAll } = useAllVisions();
  const { data: unreviewedQuarter } = useUnreviewedQuarter();
  const { data: archivedReviews } = useArchivedReviews();
  const saveVision = useSaveVision();
  const startQuest = useStartQuest();
  const { toast } = useToast();
  const defaults = getDefaultQuarter();

  // Wizard state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [pnvData, setPnvData] = useState<PnvData | null>(null);
  const [questDrafts, setQuestDrafts] = useState<QuestDraft[]>([]);
  const [isCommitting, setIsCommitting] = useState(false);

  // Review state
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewQuarter, setReviewQuarter] = useState<{ q: string; y: number } | null>(null);
  const [autoPrompted, setAutoPrompted] = useState(false);

  // Auto-prompt for unreviewed quarter
  useEffect(() => {
    if (unreviewedQuarter && !autoPrompted && !wizardOpen && !reviewOpen) {
      setReviewQuarter({ q: unreviewedQuarter.quarter, y: unreviewedQuarter.year });
      setReviewOpen(true);
      setAutoPrompted(true);
    }
  }, [unreviewedQuarter, autoPrompted, wizardOpen, reviewOpen]);

  const openWizard = (initial?: PnvData) => {
    setPnvData(initial ?? null);
    setQuestDrafts([]);
    setStep(0);
    setWizardOpen(true);
  };

  const openEdit = (v: { quarter_label: string; year: number; vision_text: string | null; target_date?: string | null }) => {
    openWizard({
      quarter: v.quarter_label,
      year: v.year,
      text: v.vision_text ?? "",
      targetDate: v.target_date ? parse(v.target_date, "yyyy-MM-dd", new Date()) : getQuarterEndDate(v.quarter_label, v.year),
    });
  };

  const handleCommit = useCallback(async () => {
    if (!pnvData) return;
    setIsCommitting(true);
    try {
      // Save vision
      await saveVision.mutateAsync({
        quarter_label: pnvData.quarter,
        year: pnvData.year,
        vision_text: pnvData.text,
        target_date: format(pnvData.targetDate, "yyyy-MM-dd"),
      });

      // Create quests sequentially
      for (const q of questDrafts) {
        await startQuest.mutateAsync({
          title: q.title,
          category_stat_id: q.category_stat_id ?? null,
          target_completion_date: format(pnvData.targetDate, "yyyy-MM-dd"),
        });
      }

      toast({
        title: "Quarter Committed",
        description: `${pnvData.quarter} ${pnvData.year} vision saved with ${questDrafts.length} quest${questDrafts.length !== 1 ? "s" : ""}.`,
      });
      setWizardOpen(false);
    } catch {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setIsCommitting(false);
    }
  }, [pnvData, questDrafts, saveVision, startQuest, toast]);

  const currentDisplayDate = currentVision?.target_date
    ? format(parse(currentVision.target_date, "yyyy-MM-dd", new Date()), "MMMM d, yyyy")
    : format(getQuarterEndDate(defaults.quarter, defaults.year), "MMMM d, yyyy");

  const pastVisions = allVisions?.filter(
    (v) => !(v.quarter_label === defaults.quarter && v.year === defaults.year)
  );

  // ── Review Mode ──
  if (reviewOpen && reviewQuarter) {
    return (
      <QuarterlyReviewModal
        quarterLabel={reviewQuarter.q}
        year={reviewQuarter.y}
        onClose={() => {
          setReviewOpen(false);
          setReviewQuarter(null);
        }}
      />
    );
  }

  // ── Wizard Mode ──
  if (wizardOpen) {
    return (
      <div className="min-h-screen p-8">
        <RitualStepper currentStep={step} />
        {step === 0 && (
          <PnvSanctuary
            initial={pnvData ?? undefined}
            onNext={(data) => {
              setPnvData(data);
              setStep(1);
            }}
          />
        )}
        {step === 1 && (
          <GoalExtraction
            initial={questDrafts.length > 0 ? questDrafts : undefined}
            onNext={(quests) => {
              setQuestDrafts(quests);
              setStep(2);
            }}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && pnvData && (
          <RitualCommitment
            pnv={pnvData}
            quests={questDrafts}
            onCommit={handleCommit}
            onBack={() => setStep(1)}
            isCommitting={isCommitting}
          />
        )}
      </div>
    );
  }

  // ── Default Visions List View ──
  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Eye className="w-6 h-6 text-gold" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Quarterly Visions</h1>
            <p className="text-sm text-muted-foreground">
              Present Narrative Visions — write as if you've already achieved it
            </p>
          </div>
        </div>
        <Button onClick={() => openWizard()} size="sm" className="bg-gold text-gold-foreground hover:bg-gold/90">
          <Plus className="w-4 h-4 mr-1" /> New Ritual
        </Button>
      </div>

      {/* Current Quarter */}
      <section className="mb-10">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Current Quarter — {defaults.quarter} {defaults.year}
        </h2>
        {loadingCurrent ? (
          <Card className="border-border"><CardContent className="p-6 text-center text-muted-foreground text-sm">Loading...</CardContent></Card>
        ) : currentVision?.vision_text ? (
          <Card
            className="border-gold/20 cursor-pointer hover:border-gold/40 transition-colors"
            onClick={() => openEdit(currentVision)}
          >
            <CardContent className="p-6">
              <p className="font-display italic text-foreground/90 leading-relaxed whitespace-pre-wrap">
                "{currentVision.vision_text}"
              </p>
              <p className="text-xs text-muted-foreground mt-4">Target: {currentDisplayDate} · Click to edit</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed border-gold/20">
            <CardContent className="p-8 text-center">
              <Sparkles className="w-8 h-8 text-gold/40 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm font-display italic">
                "It is {currentDisplayDate}, and I have..."
              </p>
              <Button onClick={() => openWizard()} variant="ghost" size="sm" className="mt-4 text-gold">
                Start New Quarter
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Unreviewed Quarter Banner */}
      {unreviewedQuarter && (
        <section className="mb-10">
          <Card className="border-gold/30 bg-gold/5 cursor-pointer hover:border-gold/50 transition-colors" onClick={() => {
            setReviewQuarter({ q: unreviewedQuarter.quarter, y: unreviewedQuarter.year });
            setReviewOpen(true);
          }}>
            <CardContent className="p-5 flex items-center gap-3">
              <ScrollText className="w-5 h-5 text-gold shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Review {unreviewedQuarter.quarter} {unreviewedQuarter.year}</p>
                <p className="text-xs text-muted-foreground">Your previous quarter awaits its chronicle</p>
              </div>
              <Button size="sm" className="bg-gold text-gold-foreground hover:bg-gold/90">Review</Button>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Past Visions */}
      {!loadingAll && pastVisions && pastVisions.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Past Visions
          </h2>
          <div className="space-y-3">
            {pastVisions.map((v) => (
              <Card
                key={v.id}
                className="border-border cursor-pointer hover:border-muted-foreground/30 transition-colors"
                onClick={() => openEdit(v)}
              >
                <CardHeader className="pb-2 pt-4 px-5">
                  <CardTitle className="text-xs font-mono text-muted-foreground">
                    {v.quarter_label} {v.year}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-4">
                  <p className="font-display italic text-foreground/70 text-sm line-clamp-2">
                    "{v.vision_text}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Archived Reviews */}
      {archivedReviews && archivedReviews.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Archived Chronicles
          </h2>
          <div className="space-y-3">
            {archivedReviews.map((r: any) => {
              const m = r.manifesto_data as any;
              return (
                <Card
                  key={r.id}
                  className="border-border cursor-pointer hover:border-muted-foreground/30 transition-colors"
                  onClick={() => {
                    setReviewQuarter({ q: r.quarter_label, y: r.year });
                    setReviewOpen(true);
                  }}
                >
                  <CardContent className="p-5 flex items-center gap-3">
                    <ScrollText className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{r.quarter_label} {r.year} Manifesto</p>
                      <p className="text-xs text-muted-foreground">
                        {m?.questsCompleted ?? 0} quests · {m?.totalXpGained ?? 0} XP
                        {m?.dominantArchetype ? ` · ${m.dominantArchetype}` : ""}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
