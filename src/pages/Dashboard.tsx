import { useEffect } from "react";
import { LayoutDashboard, Shield } from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { useProfile, useStats, useInitDefaultStats, useQuestCount, useInventoryCount, useCurrentVision } from "@/hooks/usePlayerData";

export default function Dashboard() {
  const { data: profile } = useProfile();
  const { data: stats, isLoading: statsLoading } = useStats();
  const initStats = useInitDefaultStats();
  const { data: questCount } = useQuestCount();
  const { data: inventoryCount } = useInventoryCount();
  const { data: visionText } = useCurrentVision();

  // Auto-init default stats for new users
  useEffect(() => {
    if (!statsLoading && stats && stats.length === 0) {
      initStats.mutate();
    }
  }, [statsLoading, stats]);

  const radarData = (stats ?? []).map((s) => ({
    stat: s.name,
    value: s.current_value,
    max: s.max_value,
    fill: s.color ?? "#3B82F6",
  }));

  const totalXP = (stats ?? []).reduce((sum, s) => sum + s.current_value, 0);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <LayoutDashboard className="w-6 h-6 text-gold" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Your quarterly overview</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Active Quests", value: String(questCount ?? 0), sub: "This quarter" },
          { label: "Total XP", value: String(totalXP), sub: "Accumulated" },
          { label: "Inventory", value: String(inventoryCount ?? 0), sub: "Items tracked" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-foreground font-mono">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Character Sheet */}
      <div className="bg-card border border-border rounded-xl p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-5 h-5 text-gold" />
          <div>
            <p className="text-xs uppercase tracking-widest text-gold font-medium">Class Archetype</p>
            <h2 className="text-xl font-display font-bold text-foreground">
              {profile?.archetype_class ?? "The Architect"}
            </h2>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto" style={{ height: 300 }}>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="hsl(222 30% 20%)" />
                <PolarAngleAxis
                  dataKey="stat"
                  tick={{ fill: "hsl(210 40% 75%)", fontSize: 13, fontWeight: 500 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fill: "hsl(215 20% 45%)", fontSize: 10 }}
                  axisLine={false}
                />
                <Radar
                  name="Stats"
                  dataKey="value"
                  stroke="hsl(38 95% 55%)"
                  fill="hsl(38 95% 55%)"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Loading stats…
            </div>
          )}
        </div>

        {/* Stat bars */}
        <div className="grid gap-3 mt-4">
          {(stats ?? []).map((s) => (
            <div key={s.id} className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground w-24 truncate">{s.name}</span>
              <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(s.current_value / s.max_value) * 100}%`,
                    backgroundColor: s.color ?? "hsl(var(--gold))",
                  }}
                />
              </div>
              <span className="text-xs font-mono text-muted-foreground w-12 text-right">
                {s.current_value}/{s.max_value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Current Vision */}
      <div className="bg-card border border-gold/20 rounded-xl p-6">
        <p className="text-xs uppercase tracking-widest text-gold mb-3 font-medium">Current Vision</p>
        {visionText ? (
          <p className="text-foreground text-sm font-display italic leading-relaxed">{visionText}</p>
        ) : (
          <p className="text-muted-foreground text-sm italic font-display">
            No vision set for this quarter yet. Head to <span className="text-gold">Visions</span> to write yours.
          </p>
        )}
      </div>
    </div>
  );
}
