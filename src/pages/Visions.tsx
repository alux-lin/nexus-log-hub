import { Eye } from "lucide-react";

export default function Visions() {
  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <Eye className="w-6 h-6 text-gold" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quarterly Visions</h1>
          <p className="text-sm text-muted-foreground">Present Narrative Visions — write as if you've already achieved it</p>
        </div>
      </div>
      <div className="bg-card border border-gold/20 rounded-xl p-8 text-center">
        <p className="text-muted-foreground text-sm italic font-display">
          "It is [date], and I have successfully..."
        </p>
        <p className="text-xs text-muted-foreground mt-3">No vision written yet for this quarter.</p>
      </div>
    </div>
  );
}
