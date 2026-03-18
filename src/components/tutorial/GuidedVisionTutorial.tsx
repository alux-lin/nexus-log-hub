import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  SkipForward,
  ChevronRight,
  Eye,
  Swords,
  Shield,
  ScrollText,
  Sparkles,
  Save,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useStats, useSaveVision, useStartQuest } from "@/hooks/usePlayerData";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

/* ──────────── Types ──────────── */

interface TutorialQuest {
  title: string;
  category_stat_id?: string | null;
}

type Phase =
  | "intro"
  | "vision-coach"
  | "vision-write"
  | "quests-coach"
  | "quests-write"
  | "review-coach"
  | "review-view"
  | "save-prompt";

/* ──────────── Coaching Bubble ──────────── */

function CoachBubble({
  children,
  onNext,
  nextLabel = "Got it",
  onSkip,
}: {
  children: React.ReactNode;
  onNext: () => void;
  nextLabel?: string;
  onSkip: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="max-w-lg mx-auto"
    >
      <div className="bg-card border border-gold/30 rounded-2xl p-6 shadow-2xl relative">
        {/* Gold accent line */}
        <div className="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

        <div className="text-sm text-foreground/90 leading-relaxed space-y-3">
          {children}
        </div>

        <div className="flex items-center justify-between mt-6">
          <button
            onClick={onSkip}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <SkipForward className="w-3 h-3" /> Skip Tutorial
          </button>
          <Button
            size="sm"
            onClick={onNext}
            className="bg-gold text-gold-foreground hover:bg-gold/90"
          >
            {nextLabel} <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

/* ──────────── Main Tutorial ──────────── */

interface GuidedVisionTutorialProps {
  onClose: () => void;
}

function getDefaultQuarter() {
  const now = new Date();
  const q = Math.ceil((now.getMonth() + 1) / 3);
  const endDates: Record<number, string> = { 1: "03-31", 2: "06-30", 3: "09-30", 4: "12-31" };
  const endDate = new Date(`${now.getFullYear()}-${endDates[q]}`);
  return { quarter: `Q${q}`, year: now.getFullYear(), endDate };
}

export function GuidedVisionTutorial({ onClose }: GuidedVisionTutorialProps) {
  const { data: stats } = useStats();
  const saveVision = useSaveVision();
  const startQuest = useStartQuest();
  const { toast } = useToast();
  const defaults = getDefaultQuarter();

  const [phase, setPhase] = useState<Phase>("intro");
  const [visionText, setVisionText] = useState("");
  const [quests, setQuests] = useState<TutorialQuest[]>([
    { title: "", category_stat_id: null },
    { title: "", category_stat_id: null },
    { title: "", category_stat_id: null },
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const filledQuests = quests.filter((q) => q.title.trim());

  const handleSkip = useCallback(() => {
    localStorage.setItem("nexus-guided-tutorial-seen", "1");
    onClose();
  }, [onClose]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      if (visionText.trim()) {
        await saveVision.mutateAsync({
          quarter_label: defaults.quarter,
          year: defaults.year,
          vision_text: visionText.trim(),
          target_date: format(defaults.endDate, "yyyy-MM-dd"),
        });
      }

      for (const q of filledQuests) {
        await startQuest.mutateAsync({
          title: q.title,
          category_stat_id: q.category_stat_id ?? null,
          target_completion_date: format(defaults.endDate, "yyyy-MM-dd"),
        });
      }

      toast({
        title: "Tutorial Complete!",
        description: `Vision and ${filledQuests.length} quest${filledQuests.length !== 1 ? "s" : ""} saved for ${defaults.quarter} ${defaults.year}.`,
      });
      localStorage.setItem("nexus-guided-tutorial-seen", "1");
      onClose();
    } catch {
      toast({ title: "Error", description: "Failed to save. You can add these manually later.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  }, [visionText, filledQuests, defaults, saveVision, startQuest, toast, onClose]);

  const handleDiscard = useCallback(() => {
    localStorage.setItem("nexus-guided-tutorial-seen", "1");
    toast({ title: "Tutorial Complete", description: "Nothing was saved. You can start fresh from Visions anytime." });
    onClose();
  }, [onClose, toast]);

  const updateQuest = (i: number, field: Partial<TutorialQuest>) => {
    setQuests((prev) => prev.map((q, idx) => (idx === i ? { ...q, ...field } : q)));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-background overflow-y-auto"
    >
      {/* Top bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-gold" />
          <span className="text-sm font-medium text-foreground">Guided Tutorial</span>
          <span className="text-xs text-muted-foreground ml-2">
            {phase === "intro" && "1/4 — Introduction"}
            {(phase === "vision-coach" || phase === "vision-write") && "2/4 — Write Your Vision"}
            {(phase === "quests-coach" || phase === "quests-write") && "3/4 — Define Quests"}
            {(phase === "review-coach" || phase === "review-view") && "4/4 — Review"}
            {phase === "save-prompt" && "Done!"}
          </span>
        </div>
        <button
          onClick={handleSkip}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-secondary">
        <div
          className="h-full bg-gold transition-all duration-500"
          style={{
            width:
              phase === "intro" ? "12%" :
              phase === "vision-coach" || phase === "vision-write" ? "37%" :
              phase === "quests-coach" || phase === "quests-write" ? "62%" :
              phase === "review-coach" || phase === "review-view" ? "87%" :
              "100%",
          }}
        />
      </div>

      {/* Content */}
      <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {/* ── INTRO ── */}
          {phase === "intro" && (
            <CoachBubble key="intro" onNext={() => setPhase("vision-coach")} nextLabel="Let's Begin" onSkip={handleSkip}>
              <div className="text-center mb-4">
                <Eye className="w-10 h-10 text-gold mx-auto mb-3" />
                <h2 className="text-xl font-display font-bold text-foreground mb-1">
                  The Quarterly Vision Ritual
                </h2>
              </div>
              <p>
                Every quarter in Nexus Log, you write a <span className="text-gold font-medium">Present Narrative Vision</span> — a paragraph describing your goals as if you've <em>already achieved them</em>.
              </p>
              <p>
                Then you extract concrete <span className="text-gold font-medium">Quests</span> from that vision, and commit to your quarter. At the end, you review your progress in a <span className="text-gold font-medium">Manifesto</span>.
              </p>
              <p className="text-muted-foreground text-xs">
                This tutorial will walk you through the full flow. Everything you write can be saved at the end — or discarded.
              </p>
            </CoachBubble>
          )}

          {/* ── VISION COACHING ── */}
          {phase === "vision-coach" && (
            <CoachBubble key="vcoach" onNext={() => setPhase("vision-write")} nextLabel="Start Writing" onSkip={handleSkip}>
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-gold" />
                <h3 className="font-display font-bold text-foreground">Step 1: Write Your Vision</h3>
              </div>
              <p>
                Imagine it's <span className="text-gold">{format(defaults.endDate, "MMMM d, yyyy")}</span> — the last day of {defaults.quarter}. Write in the present tense as if everything went perfectly.
              </p>
              <div className="bg-secondary/50 rounded-lg p-3 border border-border font-display italic text-foreground/70 text-sm">
                "It is {format(defaults.endDate, "MMMM d")}, and I have successfully launched my project, grown my skills in…"
              </div>
              <p className="text-xs text-muted-foreground">
                Tips: Be specific. Include feelings. Describe outcomes, not just tasks.
              </p>
            </CoachBubble>
          )}

          {/* ── VISION WRITING ── */}
          {phase === "vision-write" && (
            <motion.div
              key="vwrite"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-2xl mx-auto"
            >
              <div className="text-center mb-6">
                <Eye className="w-8 h-8 text-gold mx-auto mb-2" />
                <h2 className="font-display text-2xl text-gold mb-1">Present Narrative Vision</h2>
                <p className="text-sm text-muted-foreground">
                  {defaults.quarter} {defaults.year} · Target: {format(defaults.endDate, "MMMM d, yyyy")}
                </p>
              </div>

              {/* Prompt */}
              <div className="bg-secondary/50 rounded-lg p-4 mb-4 border border-border">
                <p className="text-sm text-muted-foreground font-display italic">
                  "It is {format(defaults.endDate, "MMMM d, yyyy")}, and I have successfully..."
                </p>
              </div>

              <Textarea
                value={visionText}
                onChange={(e) => setVisionText(e.target.value)}
                placeholder="Write your vision here… Describe what you've achieved as if it already happened."
                className="min-h-[200px] font-display text-lg leading-relaxed border-gold/10 focus-visible:ring-gold/30 mb-4"
                autoFocus
              />

              {/* Coaching hint */}
              <div className="bg-gold/5 border border-gold/20 rounded-lg p-3 mb-6 text-xs text-muted-foreground">
                <span className="text-gold font-medium">💡 Tutorial Tip:</span> Don't overthink it — even a couple of sentences work. You can always edit later.
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={handleSkip}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <SkipForward className="w-3 h-3" /> Skip Tutorial
                </button>
                <Button
                  onClick={() => setPhase("quests-coach")}
                  disabled={!visionText.trim()}
                  className="bg-gold text-gold-foreground hover:bg-gold/90"
                >
                  Define Quests <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── QUESTS COACHING ── */}
          {phase === "quests-coach" && (
            <CoachBubble key="qcoach" onNext={() => setPhase("quests-write")} nextLabel="Add Quests" onSkip={handleSkip}>
              <div className="flex items-center gap-2 mb-2">
                <Swords className="w-5 h-5 text-gold" />
                <h3 className="font-display font-bold text-foreground">Step 2: Extract Quests</h3>
              </div>
              <p>
                Now break your vision down into <span className="text-gold font-medium">concrete quests</span> — specific, actionable goals you'll pursue this quarter.
              </p>
              <p>
                Each quest can be linked to one of your <span className="text-gold font-medium">stats</span>. When you complete a quest, it awards XP to that stat and levels up your character.
              </p>
              <p className="text-xs text-muted-foreground">
                Aim for 3–5 quests. Think: "What specific things do I need to do to make my vision real?"
              </p>
            </CoachBubble>
          )}

          {/* ── QUESTS WRITING ── */}
          {phase === "quests-write" && (
            <motion.div
              key="qwrite"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-xl mx-auto"
            >
              <div className="text-center mb-6">
                <Swords className="w-8 h-8 text-gold mx-auto mb-2" />
                <h2 className="font-display text-2xl text-gold mb-1">Define Your Quests</h2>
                <p className="text-sm text-muted-foreground">
                  Break your vision into actionable quests
                </p>
              </div>

              {/* Vision reminder */}
              <div className="bg-secondary/30 rounded-lg p-3 mb-5 border border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Your Vision</p>
                <p className="text-sm font-display italic text-foreground/70 line-clamp-2">
                  "{visionText}"
                </p>
              </div>

              <div className="space-y-3 mb-4">
                {quests.map((q, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-mono w-6 text-right">{i + 1}.</span>
                    <Input
                      value={q.title}
                      onChange={(e) => updateQuest(i, { title: e.target.value })}
                      placeholder={
                        i === 0
                          ? 'e.g. "Ship the MVP by end of quarter"'
                          : i === 1
                            ? 'e.g. "Read 3 books on leadership"'
                            : 'e.g. "Run a half marathon"'
                      }
                      className="flex-1 border-gold/10 focus-visible:ring-gold/30"
                      autoFocus={i === 0}
                    />
                    {stats && stats.length > 0 && (
                      <Select
                        value={q.category_stat_id ?? ""}
                        onValueChange={(v) => updateQuest(i, { category_stat_id: v || null })}
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue placeholder="Stat…" />
                        </SelectTrigger>
                        <SelectContent>
                          {stats.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              <span className="flex items-center gap-2">
                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{ background: s.color ?? undefined }}
                                />
                                {s.name}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                ))}
              </div>

              {quests.length < 5 && (
                <button
                  onClick={() => setQuests((prev) => [...prev, { title: "", category_stat_id: null }])}
                  className="text-xs text-muted-foreground hover:text-gold transition-colors mb-6 block"
                >
                  + Add another quest
                </button>
              )}

              {/* Coaching hint */}
              <div className="bg-gold/5 border border-gold/20 rounded-lg p-3 mb-6 text-xs text-muted-foreground">
                <span className="text-gold font-medium">💡 Tutorial Tip:</span> Linking a stat is optional but it's how you earn XP. Leave it blank if unsure — you can assign stats later.
              </div>

              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => setPhase("vision-write")}>
                  ← Back
                </Button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSkip}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    <SkipForward className="w-3 h-3" /> Skip
                  </button>
                  <Button
                    onClick={() => setPhase("review-coach")}
                    disabled={filledQuests.length === 0}
                    className="bg-gold text-gold-foreground hover:bg-gold/90"
                  >
                    Review <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── REVIEW COACHING ── */}
          {phase === "review-coach" && (
            <CoachBubble key="rcoach" onNext={() => setPhase("review-view")} nextLabel="See My Manifesto" onSkip={handleSkip}>
              <div className="flex items-center gap-2 mb-2">
                <ScrollText className="w-5 h-5 text-gold" />
                <h3 className="font-display font-bold text-foreground">Step 3: The Quarterly Review</h3>
              </div>
              <p>
                At the end of each quarter, Nexus Log generates a <span className="text-gold font-medium">Manifesto</span> — a summary of your vision, completed quests, XP gains, and stat growth.
              </p>
              <p>
                You can triage unfinished quests (carry forward or abandon), then archive the quarter. Here's a preview of what your manifesto would look like:
              </p>
            </CoachBubble>
          )}

          {/* ── REVIEW VIEW (mock manifesto) ── */}
          {phase === "review-view" && (
            <motion.div
              key="rview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-2xl mx-auto"
            >
              <div className="text-center mb-6">
                <ScrollText className="w-8 h-8 text-gold mx-auto mb-2" />
                <h2 className="font-display text-2xl text-gold mb-1">
                  {defaults.quarter} {defaults.year} Manifesto
                </h2>
                <p className="text-xs text-muted-foreground">Preview — this is what your quarterly review looks like</p>
              </div>

              {/* Vision */}
              <Card className="border-gold/20 mb-4">
                <CardContent className="p-5">
                  <p className="text-xs uppercase tracking-widest text-gold mb-2 font-medium">Present Narrative Vision</p>
                  <p className="font-display italic text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    "{visionText}"
                  </p>
                </CardContent>
              </Card>

              {/* Mock stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: "Quests", value: String(filledQuests.length), icon: Swords },
                  { label: "XP (potential)", value: String(filledQuests.length * 50), icon: Sparkles },
                  { label: "Stats Linked", value: String(filledQuests.filter((q) => q.category_stat_id).length), icon: Shield },
                ].map((s) => (
                  <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
                    <s.icon className="w-4 h-4 text-gold mx-auto mb-1" />
                    <p className="text-xl font-bold font-mono text-foreground">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Quests list */}
              <Card className="border-border mb-4">
                <CardContent className="p-5">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3 font-medium">
                    Your Quests
                  </p>
                  <div className="space-y-2">
                    {filledQuests.map((q, i) => {
                      const stat = stats?.find((s) => s.id === q.category_stat_id);
                      return (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span className="text-gold">✦</span>
                          <span className="text-foreground flex-1">{q.title}</span>
                          {stat && (
                            <span
                              className="text-xs px-2 py-0.5 rounded-full border"
                              style={{
                                borderColor: stat.color ?? undefined,
                                color: stat.color ?? undefined,
                              }}
                            >
                              {stat.name}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Coaching hint */}
              <div className="bg-gold/5 border border-gold/20 rounded-lg p-3 mb-6 text-xs text-muted-foreground">
                <span className="text-gold font-medium">💡 Tutorial Tip:</span> In a real quarter, this manifesto shows your actual XP gains, stat levels, and completed/abandoned quests. It becomes a permanent record of your growth.
              </div>

              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => setPhase("quests-write")}>
                  ← Back
                </Button>
                <Button
                  onClick={() => setPhase("save-prompt")}
                  className="bg-gold text-gold-foreground hover:bg-gold/90"
                >
                  Finish Tutorial <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── SAVE PROMPT ── */}
          {phase === "save-prompt" && (
            <motion.div
              key="save"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-md mx-auto"
            >
              <div className="bg-card border border-gold/30 rounded-2xl p-6 shadow-2xl text-center">
                <Sparkles className="w-10 h-10 text-gold mx-auto mb-3" />
                <h2 className="text-xl font-display font-bold text-foreground mb-2">
                  Tutorial Complete! 🎉
                </h2>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  You wrote a vision and defined {filledQuests.length} quest{filledQuests.length !== 1 ? "s" : ""} for {defaults.quarter} {defaults.year}. Would you like to save them to your account?
                </p>

                {/* Summary */}
                <div className="bg-secondary/50 rounded-lg p-4 mb-6 text-left border border-border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">What you created</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Eye className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                      <p className="text-foreground/80 font-display italic line-clamp-2">
                        "{visionText}"
                      </p>
                    </div>
                    {filledQuests.map((q, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Swords className="w-3.5 h-3.5 text-gold shrink-0" />
                        <span className="text-foreground/80">{q.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-gold text-gold-foreground hover:bg-gold/90 w-full"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Saving..." : "Save Vision & Quests"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleDiscard}
                    className="text-muted-foreground w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Discard & Finish
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
