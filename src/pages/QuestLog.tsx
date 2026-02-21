import { useState, useCallback } from "react";
import { ScrollText, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useQuests, useAddQuest, useDeleteQuest } from "@/hooks/usePlayerData";
import { toast } from "sonner";
import QuestForm from "@/components/quests/QuestForm";
import QuestCard from "@/components/quests/QuestCard";

export default function QuestLog() {
  const { data: quests, isLoading } = useQuests();
  const addQuest = useAddQuest();
  const deleteQuest = useDeleteQuest();
  const [open, setOpen] = useState(false);

  const handleAdd = useCallback(
    (data: { title: string; category_stat_id: string | null; impact: number; reflection: string | null; quarter: string | null }) => {
      if (addQuest.isPending) return;
      addQuest.mutate(data, {
        onSuccess: () => {
          setOpen(false);
          toast.success("Quest complete! EXP gained ✨");
          // Dispatch event for sidebar animation
          window.dispatchEvent(new CustomEvent("exp-gained"));
        },
      });
    },
    [addQuest]
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteQuest.mutate(id, { onSuccess: () => toast.success("Quest removed") });
    },
    [deleteQuest]
  );

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <ScrollText className="w-6 h-6 text-gold" />
          <div>
            <h1 className="text-2xl font-bold text-foreground font-serif">Quest Log</h1>
            <p className="text-sm text-muted-foreground">Track your achievements & reflections</p>
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" /> Complete Quest
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold" /> Complete a Quest
              </DialogTitle>
              <DialogDescription>Record an achievement and reflect on what you learned.</DialogDescription>
            </DialogHeader>
            <QuestForm onSubmit={handleAdd} onCancel={() => setOpen(false)} isPending={addQuest.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse h-28 bg-card border-border" />
          ))}
        </div>
      ) : !quests?.length ? (
        <Card className="border-border border-dashed">
          <CardContent className="p-12 text-center space-y-3">
            <ScrollText className="w-10 h-10 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground text-sm">No quests logged yet. Your journey begins here.</p>
            <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-1.5">
              <Plus className="w-4 h-4" /> Complete Your First Quest
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest as any}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
