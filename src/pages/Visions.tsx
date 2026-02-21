import { useState } from "react";
import { Eye, Plus, Sparkles, BookOpen, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrentVision, useAllVisions, useSaveVision } from "@/hooks/usePlayerData";
import { useToast } from "@/hooks/use-toast";

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];

function getDefaultQuarter() {
  const now = new Date();
  return {
    quarter: `Q${Math.ceil((now.getMonth() + 1) / 3)}`,
    year: now.getFullYear(),
  };
}

function formatDate(quarter: string, year: number) {
  const endMonths: Record<string, string> = { Q1: "March 31", Q2: "June 30", Q3: "September 30", Q4: "December 31" };
  return `${endMonths[quarter] ?? "..."}, ${year}`;
}

const FORTE_GUIDE = [
  "Write in the present tense as if it's already happened.",
  "Be specific — include measurable outcomes and feelings.",
  "Describe what your life looks like, not just goals.",
  "Include how you feel about your achievements.",
  "Keep it to one powerful paragraph.",
];

export default function Visions() {
  const { data: currentVision, isLoading: loadingCurrent } = useCurrentVision();
  const { data: allVisions, isLoading: loadingAll } = useAllVisions();
  const saveVision = useSaveVision();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const defaults = getDefaultQuarter();
  const [quarter, setQuarter] = useState(defaults.quarter);
  const [year, setYear] = useState(defaults.year);
  const [text, setText] = useState("");

  const openNew = () => {
    const d = getDefaultQuarter();
    setQuarter(d.quarter);
    setYear(d.year);
    setText("");
    setOpen(true);
  };

  const openEdit = (v: { quarter_label: string; year: number; vision_text: string | null }) => {
    setQuarter(v.quarter_label);
    setYear(v.year);
    setText(v.vision_text ?? "");
    setOpen(true);
  };

  const handleSave = () => {
    if (!text.trim()) return;
    saveVision.mutate(
      { quarter_label: quarter, year, vision_text: text.trim() },
      {
        onSuccess: () => {
          toast({ title: "Vision Saved", description: `${quarter} ${year} vision recorded.` });
          setOpen(false);
        },
      }
    );
  };

  const pastVisions = allVisions?.filter(
    (v) => !(v.quarter_label === defaults.quarter && v.year === defaults.year)
  );

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Eye className="w-6 h-6 text-gold" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Quarterly Visions</h1>
            <p className="text-sm text-muted-foreground">
              Present Narrative Visions — write as if you've already achieved it
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-gold">
                <BookOpen className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs space-y-1.5 p-4">
              <p className="font-semibold text-gold text-xs uppercase tracking-wider mb-2">
                Tiago Forte's Present Narrative Vision
              </p>
              {FORTE_GUIDE.map((tip, i) => (
                <p key={i} className="text-xs text-muted-foreground">
                  {i + 1}. {tip}
                </p>
              ))}
            </TooltipContent>
          </Tooltip>
          <Button onClick={openNew} size="sm" className="bg-gold text-gold-foreground hover:bg-gold/90">
            <Plus className="w-4 h-4 mr-1" /> New Vision
          </Button>
        </div>
      </div>

      {/* Current Quarter */}
      <section className="mb-10">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Current Quarter — {defaults.quarter} {defaults.year}
        </h2>
        {loadingCurrent ? (
          <Card className="border-border"><CardContent className="p-6 text-center text-muted-foreground text-sm">Loading...</CardContent></Card>
        ) : currentVision?.vision_text ? (
          <Card
            className="border-gold/20 cursor-pointer hover:border-gold/40 transition-colors"
            onClick={() => openEdit(currentVision)}
          >
            <CardContent className="p-6">
              <p className="font-display italic text-foreground/90 leading-relaxed whitespace-pre-wrap">
                "{currentVision.vision_text}"
              </p>
              <p className="text-xs text-muted-foreground mt-4">Click to edit</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed border-gold/20">
            <CardContent className="p-8 text-center">
              <Sparkles className="w-8 h-8 text-gold/40 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm font-display italic">
                "It is {formatDate(defaults.quarter, defaults.year)}, and I have..."
              </p>
              <Button onClick={openNew} variant="ghost" size="sm" className="mt-4 text-gold">
                Write your vision
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Past Visions */}
      {!loadingAll && pastVisions && pastVisions.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Past Visions
          </h2>
          <div className="space-y-3">
            {pastVisions.map((v) => (
              <Card
                key={v.id}
                className="border-border cursor-pointer hover:border-muted-foreground/30 transition-colors"
                onClick={() => openEdit(v)}
              >
                <CardHeader className="pb-2 pt-4 px-5">
                  <CardTitle className="text-xs font-mono text-muted-foreground">
                    {v.quarter_label} {v.year}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-4">
                  <p className="font-display italic text-foreground/70 text-sm line-clamp-2">
                    "{v.vision_text}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Focus Mode Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl border-gold/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gold">
              <Eye className="w-5 h-5" /> Present Narrative Vision
            </DialogTitle>
            <DialogDescription>
              Write in the present tense as if it's already {formatDate(quarter, year)}.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-3 mb-2">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Quarter</Label>
              <Select value={quarter} onValueChange={setQuarter}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {QUARTERS.map((q) => (
                    <SelectItem key={q} value={q}>{q}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-28">
              <Label className="text-xs text-muted-foreground">Year</Label>
              <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[defaults.year - 1, defaults.year, defaults.year + 1].map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Prompt */}
          <div className="bg-secondary/50 rounded-lg p-3 mb-1">
            <p className="text-xs text-muted-foreground font-display italic">
              "It is {formatDate(quarter, year)}, and I have successfully..."
            </p>
          </div>

          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your vision here..."
            className="min-h-[200px] font-display text-base leading-relaxed border-gold/10 focus-visible:ring-gold/30"
            autoFocus
          />

          {/* Forte tips inline */}
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer hover:text-gold transition-colors">
              📖 Tiago Forte Style Guide
            </summary>
            <ul className="mt-2 space-y-1 pl-4 list-disc">
              {FORTE_GUIDE.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </details>

          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!text.trim() || saveVision.isPending}
              className="bg-gold text-gold-foreground hover:bg-gold/90"
            >
              <Save className="w-4 h-4 mr-1" /> {saveVision.isPending ? "Saving..." : "Save Vision"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
