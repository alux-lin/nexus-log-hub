import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Save, Loader2, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useProfile, useUpdateProfile, useStats } from "@/hooks/usePlayerData";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface StatEdit {
  id: string;
  name: string;
  color: string | null;
  sort_order: number;
  archetype_name: string;
}

export default function Settings() {
  const { toast } = useToast();
  const { data: profile } = useProfile();
  const { data: stats } = useStats();
  const updateProfile = useUpdateProfile();
  const qc = useQueryClient();

  const [displayName, setDisplayName] = useState("");
  const [statEdits, setStatEdits] = useState<StatEdit[]>([]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? "");
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

  const saving = updateProfile.isPending;

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

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({ display_name: displayName });

      for (const se of statEdits) {
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

      await qc.invalidateQueries({ queryKey: ["stats"] });
      await qc.invalidateQueries({ queryKey: ["profile"] });
      toast({ title: "Saved", description: "Your settings have been updated." });
    } catch {
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
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

      {/* Stat Definitions */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <h2 className="text-sm uppercase tracking-widest text-gold font-medium mb-4">Stats & Archetypes</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Customize stat names, display order, and the archetype title shown when each stat is dominant.
        </p>
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
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Archetype Title (when dominant)</Label>
                  <Input
                    value={s.archetype_name}
                    onChange={(e) => updateField(i, "archetype_name", e.target.value)}
                    placeholder={`e.g. The ${s.name} Master`}
                  />
                </div>
              </div>
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
