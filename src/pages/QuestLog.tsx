import { ScrollText } from "lucide-react";

export default function QuestLog() {
  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <ScrollText className="w-6 h-6 text-gold" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quest Log</h1>
          <p className="text-sm text-muted-foreground">Track your achievements & reflections</p>
        </div>
      </div>
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <p className="text-muted-foreground text-sm">No quests logged yet. Your journey begins here.</p>
      </div>
    </div>
  );
}
