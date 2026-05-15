import { useState, useCallback } from "react";
import { Target, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import CreateTrackerForm, { type CreateTrackerFormValues } from "@/components/trackers/CreateTrackerForm";
import { useCreateTracker } from "@/hooks/useTrackerData";

export default function Trackers() {
  const [createOpen, setCreateOpen] = useState(false);
  const createTracker = useCreateTracker();

  const handleCreate = useCallback(
    (data: CreateTrackerFormValues) => {
      if (createTracker.isPending) return;
      createTracker.mutate(data, {
        onSuccess: () => {
          setCreateOpen(false);
          toast.success("Tracker created 🎯");
        },
        onError: (err: any) => {
          toast.error(err?.message ?? "Failed to create tracker");
        },
      });
    },
    [createTracker]
  );

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
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" /> New Tracker
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="w-4 h-4 text-gold" /> New Tracker
              </DialogTitle>
              <DialogDescription>Define a quarterly target and milestones.</DialogDescription>
            </DialogHeader>
            <CreateTrackerForm
              onSubmit={handleCreate}
              onCancel={() => setCreateOpen(false)}
              isPending={createTracker.isPending}
            />
          </DialogContent>
        </Dialog>
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
