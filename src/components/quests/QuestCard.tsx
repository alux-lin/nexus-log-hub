import React from "react";
import { Trash2, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface QuestCardProps {
  quest: {
    id: string;
    title: string;
    impact: number;
    reflection: string | null;
    quarter: string | null;
    completed_at: string | null;
    stat_definitions: { name: string; color: string | null } | null;
  };
  onDelete: (id: string) => void;
}

const QuestCard = React.memo(function QuestCard({ quest, onDelete }: QuestCardProps) {
  return (
    <Card className="border-border bg-card hover:border-gold/20 transition-colors group animate-fade-in">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-foreground text-sm leading-snug">{quest.title}</h3>
          <button
            onClick={() => onDelete(quest.id)}
            className="opacity-0 group-hover:opacity-100 p-1 rounded text-muted-foreground hover:text-destructive transition-all"
            title="Delete quest"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {quest.stat_definitions && (
            <Badge variant="outline" className="text-[10px] border-border">
              <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ background: quest.stat_definitions.color ?? undefined }} />
              {quest.stat_definitions.name}
            </Badge>
          )}
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${i < quest.impact ? "text-gold fill-gold" : "text-muted-foreground/30"}`}
              />
            ))}
          </div>
          {quest.quarter && (
            <span className="text-[10px] text-muted-foreground ml-auto">{quest.quarter}</span>
          )}
        </div>

        {quest.reflection && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 font-mono">
            {quest.reflection}
          </p>
        )}
      </CardContent>
    </Card>
  );
});

export default QuestCard;
