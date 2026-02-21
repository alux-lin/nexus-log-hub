import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useStats } from "@/hooks/usePlayerData";
import { cn } from "@/lib/utils";

interface StartQuestFormProps {
  onSubmit: (data: { title: string; category_stat_id: string | null; target_completion_date: string | null }) => void;
  onCancel: () => void;
  isPending?: boolean;
}

export default function StartQuestForm({ onSubmit, onCancel, isPending }: StartQuestFormProps) {
  const { data: stats } = useStats();
  const [title, setTitle] = useState("");
  const [statId, setStatId] = useState("");
  const [date, setDate] = useState<Date>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      category_stat_id: statId || null,
      target_completion_date: date ? format(date, "yyyy-MM-dd") : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="quest-title">Quest Title</Label>
        <Input id="quest-title" placeholder="What's your goal?" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Stat Category</Label>
          <Select value={statId} onValueChange={setStatId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose stat…" />
            </SelectTrigger>
            <SelectContent>
              {stats?.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: s.color ?? undefined }} />
                    {s.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Target Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={!title.trim() || isPending}>Start Quest</Button>
      </div>
    </form>
  );
}
