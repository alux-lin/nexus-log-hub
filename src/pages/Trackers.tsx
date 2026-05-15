import { Target, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Trackers() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Target className="w-6 h-6 text-gold" />
          <div>
            <h1 className="text-2xl font-bold text-foreground font-serif">Trackers</h1>
            <p className="text-sm text-muted-foreground">Track progress toward your quarterly goals</p>
          </div>
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" /> New Tracker
        </Button>
      </div>

      <Card className="border-border border-dashed">
        <CardContent className="p-12 text-center space-y-3">
          <Target className="w-10 h-10 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground text-sm">
            No trackers yet. Create one to start measuring your progress.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
