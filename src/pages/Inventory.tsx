import { useState, useCallback } from "react";
import { Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  useInventoryItems,
  useAddInventoryItem,
  useUpdateInventoryItem,
  useDeleteInventoryItem,
} from "@/hooks/usePlayerData";
import { toast } from "sonner";
import InventoryItemCard from "@/components/inventory/InventoryItemCard";
import ItemForm from "@/components/inventory/ItemForm";

type InventoryItem = {
  id: string;
  name: string;
  quantity: number;
  category: string | null;
  description: string | null;
};

export default function Inventory() {
  const { data: items, isLoading } = useInventoryItems();
  const addItem = useAddInventoryItem();
  const updateItem = useUpdateInventoryItem();
  const deleteItem = useDeleteInventoryItem();
  const [addOpen, setAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const handleAdd = useCallback((data: { name: string; quantity: number; category: string; description: string }) => {
    if (addItem.isPending) return;
    addItem.mutate(data, {
      onSuccess: () => { setAddOpen(false); toast.success("Item added!"); },
    });
  }, [addItem]);

  const handleUpdate = useCallback((data: { name: string; quantity: number; category: string; description: string }) => {
    if (!editingItem || updateItem.isPending) return;
    updateItem.mutate({ id: editingItem.id, ...data }, {
      onSuccess: () => { setEditingItem(null); toast.success("Item updated!"); },
    });
  }, [editingItem, updateItem]);

  const handleDelete = useCallback((id: string) => {
    deleteItem.mutate(id, { onSuccess: () => toast.success("Item removed") });
  }, [deleteItem]);

  const handleAdjust = useCallback((id: string, newQuantity: number) => {
    updateItem.mutate({ id, quantity: newQuantity });
  }, [updateItem]);

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
            <InventoryItemCard
              key={item.id}
              item={item}
              onEdit={setEditingItem}
              onDelete={handleDelete}
              onAdjust={handleAdjust}
            />
          ))}
        </div>
      )}

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
