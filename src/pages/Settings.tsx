import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Save, Loader2, ArrowUp, ArrowDown, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useProfile, useUpdateProfile, useStats } from "@/hooks/usePlayerData";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { xpForLevel } from "@/hooks/useStatLevels";

interface StatEdit {
  id: string;
  name: string;
  color: string | null;
  sort_order: number;
  archetype_name: string;
  isNew?: boolean;
}

const MAX_STATS = 8;
const DEFAULT_COLORS = ["#EF4444", "#3B82F6", "#A855F7", "#10B981", "#F59E0B", "#EC4899", "#06B6D4", "#84CC16"];

export default function Settings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: stats } = useStats();
  const updateProfile = useUpdateProfile();
  const qc = useQueryClient();

  const [displayName, setDisplayName] = useState("");
  const [statEdits, setStatEdits] = useState<StatEdit[]>([]);
  const [xpBase, setXpBase] = useState(5);
  const [xpRatio, setXpRatio] = useState(1.5);
  const [xpMaxLevel, setXpMaxLevel] = useState(100);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? "");
      const p = profile as Record<string, unknown>;
      setXpBase((p.xp_base as number) ?? 5);
      setXpRatio(Number(p.xp_ratio ?? 1.5));
      setXpMaxLevel((p.xp_max_level as number) ?? 20);
    }
  }, [profile]);

  useEffect(() => {
    if (stats) {
      setStatEdits(
        stats.map((s, i) => ({
          id: s.id,
          name: s.name,
          color: s.color,
          sort_order: (s as Record<string, unknown>).sort_order as number ?? i,
          archetype_name: ((s as Record<string, unknown>).archetype_name as string) ?? "",
        }))
      );
    }
  }, [stats]);

  const moveUp = (index: number) => {
    if (index === 0) return;
    setStatEdits((prev) => {
      const arr = [...prev];
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      return arr.map((s, i) => ({ ...s, sort_order: i }));
    });
  };

  const moveDown = (index: number) => {
    if (index >= statEdits.length - 1) return;
    setStatEdits((prev) => {
      const arr = [...prev];
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      return arr.map((s, i) => ({ ...s, sort_order: i }));
    });
  };

  const updateField = (index: number, field: keyof StatEdit, value: string) => {
    setStatEdits((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };

  const addStat = () => {
    if (statEdits.length >= MAX_STATS) return;
    const nextColor = DEFAULT_COLORS[statEdits.length % DEFAULT_COLORS.length];
    setStatEdits((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        name: "",
        color: nextColor,
        sort_order: prev.length,
        archetype_name: "",
        isNew: true,
      },
    ]);
  };

  const removeStat = (index: number) => {
    setStatEdits((prev) => {
      const arr = prev.filter((_, i) => i !== index);
      return arr.map((s, i) => ({ ...s, sort_order: i }));
    });
  };

  // Preview XP table
  const previewLevels = Array.from({ length: Math.min(xpMaxLevel, 10) }, (_, i) => ({
    level: i + 1,
    totalXp: xpForLevel(i + 1, xpBase, xpRatio),
    xpNeeded: i === 0 ? 0 : Math.floor(xpBase * Math.pow(xpRatio, i - 1)),
  }));

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Save profile (display name + XP curve)
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          display_name: displayName,
          xp_base: xpBase,
          xp_ratio: xpRatio,
          xp_max_level: xpMaxLevel,
        } as Record<string, unknown>)
        .eq("user_id", user.id);
      if (profileError) throw profileError;

      // Handle deleted stats
      const editIds = new Set(statEdits.filter((s) => !s.isNew).map((s) => s.id));
      const deletedStats = stats?.filter((s) => !editIds.has(s.id)) ?? [];
      for (const ds of deletedStats) {
        const { error } = await supabase.from("stat_definitions").delete().eq("id", ds.id);
        if (error) throw error;
      }

      // Handle new and updated stats
      for (const se of statEdits) {
        if (se.isNew) {
          if (!se.name.trim()) continue;
          const { error } = await supabase.from("stat_definitions").insert({
            user_id: user.id,
            name: se.name,
            color: se.color,
            sort_order: se.sort_order,
            archetype_name: se.archetype_name || null,
          });
          if (error) throw error;
        } else {
          const original = stats?.find((s) => s.id === se.id);
          if (!original) continue;
          const updates: Record<string, unknown> = {};
          if (se.name !== original.name) updates.name = se.name;
          if (se.sort_order !== ((original as Record<string, unknown>).sort_order ?? 0))
            updates.sort_order = se.sort_order;
          const origArchetype = ((original as Record<string, unknown>).archetype_name as string) ?? "";
          if (se.archetype_name !== origArchetype)
            updates.archetype_name = se.archetype_name || null;

          if (Object.keys(updates).length > 0) {
            const { error } = await supabase
              .from("stat_definitions")
              .update(updates)
              .eq("id", se.id);
            if (error) throw error;
          }
        }
      }

      await qc.invalidateQueries({ queryKey: ["stats"] });
      await qc.invalidateQueries({ queryKey: ["profile"] });
      toast({ title: "Saved", description: "Your settings have been updated." });
    } catch {
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <SettingsIcon className="w-6 h-6 text-gold" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Configure your character & preferences</p>
        </div>
      </div>

      {/* Profile */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <h2 className="text-sm uppercase tracking-widest text-gold font-medium mb-4">Profile</h2>
        <div className="space-y-1.5">
          <Label>Display Name</Label>
          <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        </div>
      </div>

      {/* XP Curve */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <h2 className="text-sm uppercase tracking-widest text-gold font-medium mb-4">Level-Up Curve</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Customize the XP formula: XP per level = Base × Ratio ^ (Level - 1)
        </p>
        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Base XP</Label>
              <span className="text-xs font-mono text-muted-foreground">{xpBase}</span>
            </div>
            <Slider
              value={[xpBase]}
              onValueChange={([v]) => setXpBase(v)}
              min={1}
              max={20}
              step={1}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Growth Ratio</Label>
              <span className="text-xs font-mono text-muted-foreground">{xpRatio.toFixed(2)}</span>
            </div>
            <Slider
              value={[xpRatio * 100]}
              onValueChange={([v]) => setXpRatio(v / 100)}
              min={100}
              max={300}
              step={5}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Max Level</Label>
              <span className="text-xs font-mono text-muted-foreground">{xpMaxLevel}</span>
            </div>
            <Slider
              value={[xpMaxLevel]}
              onValueChange={([v]) => setXpMaxLevel(v)}
              min={5}
              max={100}
              step={1}
            />
          </div>

          {/* Preview table */}
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-2">XP Preview (first {previewLevels.length} levels)</p>
            <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-xs font-mono">
              <span className="text-muted-foreground font-semibold">Level</span>
              <span className="text-muted-foreground font-semibold">XP Needed</span>
              <span className="text-muted-foreground font-semibold">Cumulative</span>
              {previewLevels.map((row) => (
                <>
                  <span key={`l${row.level}`} className="text-foreground">Lv.{row.level}</span>
                  <span key={`n${row.level}`} className="text-foreground">{row.xpNeeded}</span>
                  <span key={`c${row.level}`} className="text-foreground">{row.totalXp}</span>
                </>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stat Definitions */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm uppercase tracking-widest text-gold font-medium">Stats & Archetypes</h2>
            <p className="text-xs text-muted-foreground mt-1">
              {statEdits.length}/{MAX_STATS} stats · Customize names, order, and archetype titles.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={addStat}
            disabled={statEdits.length >= MAX_STATS}
            className="gap-1"
          >
            <Plus className="w-3 h-3" /> Add Stat
          </Button>
        </div>
        <div className="space-y-4">
          {statEdits.map((s, i) => (
            <div key={s.id} className="flex items-start gap-3 bg-secondary/30 rounded-lg p-3">
              <div className="flex flex-col gap-1 pt-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  disabled={i === 0}
                  onClick={() => moveUp(i)}
                >
                  <ArrowUp className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  disabled={i === statEdits.length - 1}
                  onClick={() => moveDown(i)}
                >
                  <ArrowDown className="w-3 h-3" />
                </Button>
              </div>
              <div
                className="w-3 h-3 rounded-full shrink-0 mt-2.5"
                style={{ backgroundColor: s.color ?? "hsl(var(--gold))" }}
              />
              <div className="flex-1 space-y-2">
                <div className="space-y-1">
                  <Label className="text-xs">Stat Name</Label>
                  <Input
                    value={s.name}
                    onChange={(e) => updateField(i, "name", e.target.value)}
                    placeholder="e.g. Strength"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Archetype Title (when dominant)</Label>
                  <Input
                    value={s.archetype_name}
                    onChange={(e) => updateField(i, "archetype_name", e.target.value)}
                    placeholder={`e.g. The ${s.name || "Stat"} Master`}
                  />
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive mt-1"
                onClick={() => removeStat(i)}
                disabled={statEdits.length <= 1}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="bg-gold text-gold-foreground hover:bg-gold/90 font-semibold"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
        Save Changes
      </Button>
    </div>
  );
}
