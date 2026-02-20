import { useState } from "react";
import { Package, Plus, Pencil, Trash2, Coins, BookOpen, Flame, Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useInventoryItems,
  useAddInventoryItem,
  useUpdateInventoryItem,
  useDeleteInventoryItem,
} from "@/hooks/usePlayerData";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Currency: <Coins className="w-5 h-5" />,
  Knowledge: <BookOpen className="w-5 h-5" />,
  Streak: <Flame className="w-5 h-5" />,
  Achievement: <Trophy className="w-5 h-5" />,
  General: <Package className="w-5 h-5" />,
};

const CATEGORIES = ["Currency", "Knowledge", "Streak", "Achievement", "General"];

type InventoryItem = {
  id: string;
  name: string;
  quantity: number;
  category: string | null;
  description: string | null;
};

function ItemForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initial?: Partial<InventoryItem>;
  onSubmit: (data: { name: string; quantity: number; category: string; description: string }) => void;
  onCancel: () => void;
  submitLabel: string;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [quantity, setQuantity] = useState(String(initial?.quantity ?? 0));
  const [category, setCategory] = useState(initial?.category ?? "General");
  const [description, setDescription] = useState(initial?.description ?? "");

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Books Read" />
      </div>
      <div className="space-y-2">
        <Label>Quantity</Label>
        <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Description (optional)</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does this track?" rows={2} />
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => { if (!name.trim()) { toast.error("Name is required"); return; } onSubmit({ name, quantity: Number(quantity) || 0, category, description }); }}>
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}

export default function Inventory() {
  const { data: items, isLoading } = useInventoryItems();
  const addItem = useAddInventoryItem();
  const updateItem = useUpdateInventoryItem();
  const deleteItem = useDeleteInventoryItem();
  const [addOpen, setAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const handleAdd = (data: { name: string; quantity: number; category: string; description: string }) => {
    if (addItem.isPending) return;
    addItem.mutate(data, {
      onSuccess: () => { setAddOpen(false); toast.success("Item added!"); },
    });
  };

  const handleUpdate = (data: { name: string; quantity: number; category: string; description: string }) => {
    if (!editingItem || updateItem.isPending) return;
    updateItem.mutate({ id: editingItem.id, ...data }, {
      onSuccess: () => { setEditingItem(null); toast.success("Item updated!"); },
    });
  };

  const handleDelete = (id: string) => {
    deleteItem.mutate(id, { onSuccess: () => toast.success("Item removed") });
  };

  const handleQuickAdjust = (item: InventoryItem, delta: number) => {
    updateItem.mutate({ id: item.id, quantity: Math.max(0, item.quantity + delta) });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6 text-gold" />
          <div>
            <h1 className="text-2xl font-bold text-foreground font-serif">Inventory</h1>
            <p className="text-sm text-muted-foreground">Track your resources, streaks & achievements</p>
          </div>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5"><Plus className="w-4 h-4" /> Add Item</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Inventory Item</DialogTitle></DialogHeader>
            <ItemForm onSubmit={handleAdd} onCancel={() => setAddOpen(false)} submitLabel="Add" />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse h-36 bg-card border-border" />
          ))}
        </div>
      ) : !items?.length ? (
        <Card className="border-border border-dashed">
          <CardContent className="p-12 text-center space-y-3">
            <Package className="w-10 h-10 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground text-sm">Your inventory is empty. Add your first tracker!</p>
            <Button variant="outline" size="sm" onClick={() => setAddOpen(true)} className="gap-1.5">
              <Plus className="w-4 h-4" /> Add Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="border-border group hover:border-gold/30 transition-colors">
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
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingItem(item)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-gold tabular-nums">{item.quantity}</span>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => handleQuickAdjust(item, -1)}>−</Button>
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => handleQuickAdjust(item, 1)}>+</Button>
                  </div>
                </div>

                {item.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Item</DialogTitle></DialogHeader>
          {editingItem && (
            <ItemForm
              initial={editingItem}
              onSubmit={handleUpdate}
              onCancel={() => setEditingItem(null)}
              submitLabel="Save"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
