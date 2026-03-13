import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { Check, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const ARCHETYPES = [
  {
    id: "The Architect",
    label: "The Architect",
    desc: "Methodical builder. You thrive on systems, structure, and deep technical work.",
  },
  {
    id: "The Guardian",
    label: "The Guardian",
    desc: "Resilient supporter. You prioritize relationships, wellbeing, and sustainable growth.",
  },
  {
    id: "The Catalyst",
    label: "The Catalyst",
    desc: "High-impact driver. You push for results, velocity, and measurable outcomes.",
  },
  {
    id: "The Sage",
    label: "The Sage",
    desc: "Balanced strategist. You seek equilibrium across all dimensions of growth.",
  },
];

const DEFAULT_STATS = [
  { name: "Strength", color: "#EF4444" },
  { name: "Intellect", color: "#3B82F6" },
  { name: "Spirit", color: "#A855F7" },
];

const stepVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [selectedArchetype, setSelectedArchetype] = useState("The Architect");
  const [stats, setStats] = useState(DEFAULT_STATS.map((s) => ({ ...s })));
  const [questTitle, setQuestTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const radarData = stats.map((s) => ({
    stat: s.name || "—",
    value: 3,
  }));

  const updateStatName = (index: number, name: string) => {
    setStats((prev) => prev.map((s, i) => (i === index ? { ...s, name } : s)));
  };

  const handleComplete = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // 1. Update profile with archetype and onboarded flag
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          archetype_class: selectedArchetype,
          is_onboarded: true,
        } as Record<string, unknown>)
        .eq("user_id", user.id);
      if (profileError) throw profileError;

      // 2. Insert stat definitions
      const statInserts = stats
        .filter((s) => s.name.trim())
        .map((s, i) => ({
          user_id: user.id,
          name: s.name.trim(),
          color: s.color,
          icon: ["sword", "brain", "heart"][i] ?? "zap",
          sort_order: i,
        }));
      if (statInserts.length > 0) {
        const { error: statError } = await supabase
          .from("stat_definitions")
          .insert(statInserts);
        if (statError) throw statError;
      }

      // 3. Auto-grant 100 Gold
      const { error: goldError } = await supabase
        .from("inventory_items")
        .insert({
          user_id: user.id,
          name: "Gold",
          quantity: 100,
          category: "Currency",
          description: "Starting resources",
        });
      if (goldError) throw goldError;

      // 4. Create first quest if provided
      if (questTitle.trim()) {
        const now = new Date();
        const quarter = `Q${Math.ceil((now.getMonth() + 1) / 3)} ${now.getFullYear()}`;
        const { error: questError } = await supabase.from("quests").insert({
          user_id: user.id,
          title: questTitle.trim(),
          status: "active",
          quarter,
        });
        if (questError) throw questError;
      }

      // Optimistically update the profile cache so AppLayout doesn't redirect back
      qc.setQueryData(["profile", user.id], (old: any) =>
        old ? { ...old, is_onboarded: true, archetype_class: selectedArchetype } : old
      );
      await qc.invalidateQueries({ queryKey: ["stats"] });
      await qc.invalidateQueries({ queryKey: ["inventory"] });
      await qc.invalidateQueries({ queryKey: ["quests"] });
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      toast({
        title: "Setup failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Progress indicator */}
      <div className="flex items-center gap-3 mb-10">
        {[0, 1, 2].map((s) => (
          <div key={s} className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-semibold transition-colors ${
                step > s
                  ? "bg-gold text-gold-foreground"
                  : step === s
                  ? "border-2 border-gold text-gold"
                  : "border border-border text-muted-foreground"
              }`}
            >
              {step > s ? <Check className="w-3.5 h-3.5" /> : s + 1}
            </div>
            {s < 2 && (
              <div
                className={`w-12 h-px transition-colors ${
                  step > s ? "bg-gold" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="w-full max-w-lg">
        <AnimatePresence mode="wait">
          {/* Step 1: Archetype */}
          {step === 0 && (
            <motion.div
              key="step-0"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              <h1 className="text-2xl font-display font-bold text-foreground mb-1">
                Select your archetype
              </h1>
              <p className="text-sm text-muted-foreground mb-6">
                This sets your starting class. You can change it later.
              </p>

              <div className="grid gap-3">
                {ARCHETYPES.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setSelectedArchetype(a.id)}
                    className={`text-left rounded-xl border p-4 transition-all ${
                      selectedArchetype === a.id
                        ? "border-gold bg-gold/5"
                        : "border-border bg-card hover:border-muted-foreground/30"
                    }`}
                  >
                    <p className="font-semibold text-foreground text-sm">
                      {a.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {a.desc}
                    </p>
                  </button>
                ))}
              </div>

              <Button
                onClick={() => setStep(1)}
                className="w-full mt-6 bg-gold text-gold-foreground hover:bg-gold/90 font-semibold"
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
          )}

          {/* Step 2: Stats */}
          {step === 1 && (
            <motion.div
              key="step-1"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              <h1 className="text-2xl font-display font-bold text-foreground mb-1">
                Define your stats
              </h1>
              <p className="text-sm text-muted-foreground mb-6">
                Rename the default pillars to match your workflow.
              </p>

              <div className="space-y-3 mb-6">
                {stats.map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    <Input
                      value={s.name}
                      onChange={(e) => updateStatName(i, e.target.value)}
                      placeholder={DEFAULT_STATS[i].name}
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>

              {/* Live radar preview */}
              <div className="bg-card border border-border rounded-xl p-4 mb-6">
                <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">
                  Preview
                </p>
                <div style={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="65%">
                      <PolarGrid stroke="hsl(222 30% 20%)" />
                      <PolarAngleAxis
                        dataKey="stat"
                        tick={{
                          fill: "hsl(210 40% 75%)",
                          fontSize: 12,
                          fontWeight: 500,
                        }}
                      />
                      <Radar
                        dataKey="value"
                        stroke="hsl(38 95% 55%)"
                        fill="hsl(38 95% 55%)"
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(0)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(2)}
                  disabled={stats.every((s) => !s.name.trim())}
                  className="flex-1 bg-gold text-gold-foreground hover:bg-gold/90 font-semibold"
                >
                  Continue
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: First Quest */}
          {step === 2 && (
            <motion.div
              key="step-2"
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              <h1 className="text-2xl font-display font-bold text-foreground mb-1">
                Set your first objective
              </h1>
              <p className="text-sm text-muted-foreground mb-6">
                What's one goal you want to track this quarter? You'll also receive 100 Gold to start.
              </p>

              <div className="space-y-1.5 mb-4">
                <Label className="text-xs">Quest Title</Label>
                <Input
                  value={questTitle}
                  onChange={(e) => setQuestTitle(e.target.value)}
                  placeholder="e.g. Ship the new dashboard"
                />
              </div>

              <div className="bg-card border border-border rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center">
                    <span className="text-xs text-gold font-mono">G</span>
                  </div>
                  <span className="text-sm text-foreground">100 Gold</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    Starting resources
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={saving}
                  className="flex-1 bg-gold text-gold-foreground hover:bg-gold/90 font-semibold"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Complete Setup
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
