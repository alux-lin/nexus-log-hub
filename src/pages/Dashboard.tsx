import { LayoutDashboard } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <LayoutDashboard className="w-6 h-6 text-gold" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Your quarterly overview</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Active Quests", value: "0", sub: "This quarter" },
          { label: "Total XP", value: "0", sub: "Accumulated" },
          { label: "Inventory", value: "0", sub: "Items tracked" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-foreground font-mono">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-gold/20 rounded-xl p-6">
        <p className="text-xs uppercase tracking-widest text-gold mb-3 font-medium">Current Vision</p>
        <p className="text-muted-foreground text-sm italic font-display">
          No vision set for this quarter yet. Head to <span className="text-gold">Visions</span> to write yours.
        </p>
      </div>
    </div>
  );
}
