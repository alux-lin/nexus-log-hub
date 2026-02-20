import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useProfile, useUpdateProfile, useStats, useUpdateStat } from "@/hooks/usePlayerData";

export default function Settings() {
  const { toast } = useToast();
  const { data: profile } = useProfile();
  const { data: stats } = useStats();
  const updateProfile = useUpdateProfile();
  const updateStat = useUpdateStat();

  const [displayName, setDisplayName] = useState("");
  const [archetype, setArchetype] = useState("");
  const [statEdits, setStatEdits] = useState<Record<string, string>>({});

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? "");
      setArchetype(profile.archetype_class ?? "The Architect");
    }
  }, [profile]);

  useEffect(() => {
    if (stats) {
      const map: Record<string, string> = {};
      stats.forEach((s) => (map[s.id] = s.name));
      setStatEdits(map);
    }
  }, [stats]);

  const saving = updateProfile.isPending || updateStat.isPending;

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        display_name: displayName,
        archetype_class: archetype,
      });

      for (const stat of stats ?? []) {
        const newName = statEdits[stat.id];
        if (newName && newName !== stat.name) {
          await updateStat.mutateAsync({ id: stat.id, name: newName });
        }
      }

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
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Display Name</Label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Class Archetype</Label>
            <Input
              value={archetype}
              onChange={(e) => setArchetype(e.target.value)}
              placeholder="e.g. The Architect, The Guardian, The Sage"
            />
            <p className="text-xs text-muted-foreground">
              Your archetype reflects your dominant playstyle. Rename it to anything that fits your identity.
            </p>
          </div>
        </div>
      </div>

      {/* Stat Definitions */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <h2 className="text-sm uppercase tracking-widest text-gold font-medium mb-4">Stat Names</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Customize the names of your three core stats. These appear on your radar chart.
        </p>
        <div className="space-y-3">
          {(stats ?? []).map((s) => (
            <div key={s.id} className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: s.color ?? "hsl(var(--gold))" }}
              />
              <Input
                value={statEdits[s.id] ?? s.name}
                onChange={(e) =>
                  setStatEdits((prev) => ({ ...prev, [s.id]: e.target.value }))
                }
                className="flex-1"
              />
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
