import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const CATEGORIES = ["Currency", "Knowledge", "Streak", "Achievement", "General"];

type InventoryItem = {
  id: string;
  name: string;
  quantity: number;
  category: string | null;
  description: string | null;
};

interface Props {
  initial?: Partial<InventoryItem>;
  onSubmit: (data: { name: string; quantity: number; category: string; description: string }) => void;
  onCancel: () => void;
  submitLabel: string;
}

const ItemForm = React.memo(function ItemForm({ initial, onSubmit, onCancel, submitLabel }: Props) {
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
        <Input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          onBlur={() => setQuantity(String(Number(quantity) || 0))}
        />
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
        <Button onClick={() => {
          if (!name.trim()) { toast.error("Name is required"); return; }
          onSubmit({ name, quantity: Number(quantity) || 0, category, description });
        }}>
          {submitLabel}
        </Button>
      </div>
    </div>
  );
});

export default ItemForm;
