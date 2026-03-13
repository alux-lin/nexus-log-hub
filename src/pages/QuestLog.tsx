import { useState, useCallback, useMemo } from "react";
import { ScrollText, Plus, Swords, Trophy, CalendarClock, X, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useActiveQuests, useCompletedQuests, useStartQuest, useCompleteQuest, useDeleteQuest, useStats } from "@/hooks/usePlayerData";
import { toast } from "sonner";
import StartQuestForm from "@/components/quests/StartQuestForm";
import CompleteQuestModal from "@/components/quests/CompleteQuestModal";
import QuestCard from "@/components/quests/QuestCard";
import { format } from "date-fns";

export default function QuestLog() {
  const { data: activeQuests, isLoading: loadingActive } = useActiveQuests();
  const { data: completedQuests, isLoading: loadingCompleted } = useCompletedQuests();
  const { data: stats } = useStats();
  const startQuest = useStartQuest();
  const completeQuest = useCompleteQuest();
  const deleteQuest = useDeleteQuest();
  const [startOpen, setStartOpen] = useState(false);
  const [completingQuest, setCompletingQuest] = useState<{ id: string; title: string } | null>(null);
  const [filterStat, setFilterStat] = useState<string>("all");
  const [filterQuarter, setFilterQuarter] = useState<string>("all");

  const quarterOptions = useMemo(() => {
    const quarters = new Set<string>();
    activeQuests?.forEach((q: any) => q.quarter && quarters.add(q.quarter));
    completedQuests?.forEach((q: any) => q.quarter && quarters.add(q.quarter));
    return Array.from(quarters).sort().reverse();
  }, [activeQuests, completedQuests]);

  const filterQuests = useCallback((quests: any[] | undefined) => {
    if (!quests) return [];
    return quests.filter((q: any) => {
      if (filterStat !== "all" && q.category_stat_id !== filterStat) return false;
      if (filterQuarter !== "all" && q.quarter !== filterQuarter) return false;
      return true;
    });
  }, [filterStat, filterQuarter]);

  const filteredActive = useMemo(() => filterQuests(activeQuests), [filterQuests, activeQuests]);
  const filteredCompleted = useMemo(() => filterQuests(completedQuests), [filterQuests, completedQuests]);
  const hasFilters = filterStat !== "all" || filterQuarter !== "all";

  const handleStart = useCallback(
    (data: { title: string; category_stat_id: string | null; target_completion_date: string | null }) => {
      if (startQuest.isPending) return;
      startQuest.mutate(data, {
        onSuccess: () => {
          setStartOpen(false);
          toast.success("Quest started! 🗡️");
        },
      });
    },
    [startQuest]
  );

  const handleComplete = useCallback(
    (data: { id: string; impact: number; reflection: string | null; statRewards: { stat_id: string; xp_amount: number }[] }) => {
      if (completeQuest.isPending) return;
      completeQuest.mutate(data, {
        onSuccess: () => {
          setCompletingQuest(null);
          toast.success("Quest complete! EXP gained ✨");
          window.dispatchEvent(new CustomEvent("exp-gained"));
        },
      });
    },
    [completeQuest]
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteQuest.mutate(id, { onSuccess: () => toast.success("Quest removed") });
    },
    [deleteQuest]
  );

  const renderEmpty = (message: string, showButton?: boolean) => (
    <Card className="border-border border-dashed">
      <CardContent className="p-12 text-center space-y-3">
        <ScrollText className="w-10 h-10 text-muted-foreground mx-auto" />
        <p className="text-muted-foreground text-sm">{message}</p>
        {showButton && (
          <Button variant="outline" size="sm" onClick={() => setStartOpen(true)} className="gap-1.5">
            <Plus className="w-4 h-4" /> Start Your First Quest
          </Button>
        )}
      </CardContent>
    </Card>
  );

  const renderActiveCard = (quest: any) => (
    <Card key={quest.id} className="border-border bg-card hover:border-gold/20 transition-colors group animate-fade-in">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-foreground text-sm leading-snug">{quest.title}</h3>
          <Button
            size="sm"
            variant="outline"
            className="gap-1 text-xs h-7 shrink-0 border-gold/30 text-gold hover:bg-gold/10 hover:text-gold"
            onClick={() => setCompletingQuest({ id: quest.id, title: quest.title })}
          >
            <Trophy className="w-3 h-3" /> Complete
          </Button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {quest.stat_definitions && (
            <span className="inline-flex items-center text-[10px] border border-border rounded-full px-2 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ background: quest.stat_definitions.color ?? undefined }} />
              {quest.stat_definitions.name}
            </span>
          )}
          {quest.target_completion_date && (
            <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
              <CalendarClock className="w-3 h-3" />
              {format(new Date(quest.target_completion_date), "MMM d, yyyy")}
            </span>
          )}
          {quest.quarter && (
            <span className="text-[10px] text-muted-foreground ml-auto">{quest.quarter}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <ScrollText className="w-6 h-6 text-gold" />
          <div>
            <h1 className="text-2xl font-bold text-foreground font-serif">Quest Log</h1>
            <p className="text-sm text-muted-foreground">Track your goals & achievements</p>
          </div>
        </div>
        <Dialog open={startOpen} onOpenChange={setStartOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" /> Start Quest
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Swords className="w-4 h-4 text-gold" /> Start a New Quest
              </DialogTitle>
              <DialogDescription>Set a goal to track your progress.</DialogDescription>
            </DialogHeader>
            <StartQuestForm onSubmit={handleStart} onCancel={() => setStartOpen(false)} isPending={startQuest.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active" className="gap-1.5">
            <Swords className="w-3.5 h-3.5" /> Active ({filteredActive.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-1.5">
            <Trophy className="w-3.5 h-3.5" /> Completed ({filteredCompleted.length})
          </TabsTrigger>
        </TabsList>

        <div className="flex items-center gap-3 flex-wrap">
          <Select value={filterStat} onValueChange={setFilterStat}>
            <SelectTrigger className="w-[180px] h-8 text-xs">
              <SelectValue placeholder="All Stats" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stats</SelectItem>
              {stats?.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterQuarter} onValueChange={setFilterQuarter}>
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue placeholder="All Quarters" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Quarters</SelectItem>
              {quarterOptions.map((q) => (
                <SelectItem key={q} value={q}>{q}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasFilters && (
            <button
              onClick={() => { setFilterStat("all"); setFilterQuarter("all"); }}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <X className="w-3 h-3" /> Clear filters
            </button>
          )}
        </div>

        <TabsContent value="active">
          {loadingActive ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => <Card key={i} className="animate-pulse h-24 bg-card border-border" />)}
            </div>
          ) : !filteredActive.length ? (
            renderEmpty(hasFilters ? "No quests match your filters." : "No active quests. Start one to begin your journey.", !hasFilters)
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredActive.map(renderActiveCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {loadingCompleted ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => <Card key={i} className="animate-pulse h-28 bg-card border-border" />)}
            </div>
          ) : !filteredCompleted.length ? (
            renderEmpty(hasFilters ? "No quests match your filters." : "No completed quests yet. Complete an active quest to see it here.")
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCompleted.map((quest) => (
                <QuestCard key={quest.id} quest={quest as any} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CompleteQuestModal
        quest={completingQuest}
        open={!!completingQuest}
        onOpenChange={(open) => { if (!open) setCompletingQuest(null); }}
        onComplete={handleComplete}
        isPending={completeQuest.isPending}
      />
    </div>
  );
}
