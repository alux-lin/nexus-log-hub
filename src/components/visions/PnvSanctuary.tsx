import { useState, useEffect } from "react";
import { format, parse } from "date-fns";
import { CalendarIcon, ChevronRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];

function getDefaultQuarter() {
  const now = new Date();
  return {
    quarter: `Q${Math.ceil((now.getMonth() + 1) / 3)}`,
    year: now.getFullYear(),
  };
}

function getQuarterEndDate(quarter: string, year: number): Date {
  const endDates: Record<string, string> = { Q1: "03-31", Q2: "06-30", Q3: "09-30", Q4: "12-31" };
  return parse(`${year}-${endDates[quarter] ?? "12-31"}`, "yyyy-MM-dd", new Date());
}

const FORTE_GUIDE = [
  "Write in the present tense as if it's already happened.",
  "Be specific — include measurable outcomes and feelings.",
  "Describe what your life looks like, not just goals.",
  "Include how you feel about your achievements.",
  "Keep it to one powerful paragraph.",
];

export interface PnvData {
  quarter: string;
  year: number;
  text: string;
  targetDate: Date;
}

interface PnvSanctuaryProps {
  initial?: PnvData;
  onNext: (data: PnvData) => void;
}

export function PnvSanctuary({ initial, onNext }: PnvSanctuaryProps) {
  const defaults = getDefaultQuarter();
  const [quarter, setQuarter] = useState(initial?.quarter ?? defaults.quarter);
  const [year, setYear] = useState(initial?.year ?? defaults.year);
  const [text, setText] = useState(initial?.text ?? "");
  const [targetDate, setTargetDate] = useState<Date>(
    initial?.targetDate ?? getQuarterEndDate(defaults.quarter, defaults.year)
  );
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (!initial) setTargetDate(getQuarterEndDate(quarter, year));
  }, [quarter, year, initial]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-2xl mx-auto px-4">
      {/* Header */}
      <h2 className="font-display text-3xl sm:text-4xl text-gold mb-2 text-center">
        Present Narrative Vision
      </h2>
      <p className="text-muted-foreground text-sm text-center mb-8 max-w-md">
        Write as if it's already{" "}
        <span className="text-gold">{format(targetDate, "MMMM d, yyyy")}</span>. What have you achieved?
      </p>

      {/* Quarter / Year / Date row */}
      <div className="flex gap-3 mb-4 w-full">
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
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground">Review Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full mt-1 justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(targetDate, "MMM d, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={targetDate}
                onSelect={(d) => d && setTargetDate(d)}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Prompt */}
      <div className="bg-secondary/50 rounded-lg p-4 mb-4 w-full border border-border">
        <p className="text-sm text-muted-foreground font-display italic">
          "It is {format(targetDate, "MMMM d, yyyy")}, and I have successfully..."
        </p>
      </div>

      {/* Writing Area */}
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your vision here..."
        className="min-h-[220px] font-display text-lg leading-relaxed border-gold/10 focus-visible:ring-gold/30 w-full mb-4"
        autoFocus
      />

      {/* Forte guide toggle */}
      <button
        onClick={() => setShowGuide(!showGuide)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold transition-colors mb-6"
      >
        <BookOpen className="w-3.5 h-3.5" />
        Tiago Forte Style Guide
      </button>
      {showGuide && (
        <ul className="text-xs text-muted-foreground space-y-1 pl-4 list-disc mb-6 w-full max-w-md">
          {FORTE_GUIDE.map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>
      )}

      {/* Next */}
      <Button
        onClick={() => onNext({ quarter, year, text: text.trim(), targetDate })}
        disabled={!text.trim()}
        className="bg-gold text-gold-foreground hover:bg-gold/90 px-8"
        size="lg"
      >
        Define Quests <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}
