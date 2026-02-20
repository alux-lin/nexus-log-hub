import React, { useRef, useState, useCallback, useEffect } from "react";
import { Pencil, Trash2, Package, Coins, BookOpen, Flame, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Currency: <Coins className="w-5 h-5" />,
  Knowledge: <BookOpen className="w-5 h-5" />,
  Streak: <Flame className="w-5 h-5" />,
  Achievement: <Trophy className="w-5 h-5" />,
  General: <Package className="w-5 h-5" />,
};

type InventoryItem = {
  id: string;
  name: string;
  quantity: number;
  category: string | null;
  description: string | null;
};

interface Props {
  item: InventoryItem;
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
  onAdjust: (id: string, newQuantity: number) => void;
}

const DEBOUNCE_MS = 400;

const InventoryItemCard = React.memo(function InventoryItemCard({
  item,
  onEdit,
  onDelete,
  onAdjust,
}: Props) {
  const [localQty, setLocalQty] = useState(item.quantity);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync when server value changes
  useEffect(() => {
    setLocalQty(item.quantity);
  }, [item.quantity]);

  const adjust = useCallback(
    (delta: number) => {
      setLocalQty((prev) => {
        const next = Math.max(0, prev + delta);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          onAdjust(item.id, next);
        }, DEBOUNCE_MS);
        return next;
      });
    },
    [item.id, onAdjust]
  );

  return (
    <Card className="border-border group hover:border-gold/30 transition-colors">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gold/10 text-gold flex items-center justify-center">
              {CATEGORY_ICONS[item.category ?? "General"] ?? <Package className="w-5 h-5" />}
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.category ?? "General"}</p>
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(item)}>
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(item.id)}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-3xl font-bold text-gold tabular-nums">{localQty}</span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => adjust(-1)}>−</Button>
            <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => adjust(1)}>+</Button>
          </div>
        </div>

        {item.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
        )}
      </CardContent>
    </Card>
  );
});

export default InventoryItemCard;
