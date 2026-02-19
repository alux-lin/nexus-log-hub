import { Package } from "lucide-react";

export default function Inventory() {
  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <Package className="w-6 h-6 text-gold" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
          <p className="text-sm text-muted-foreground">Track your resources & assets</p>
        </div>
      </div>
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <p className="text-muted-foreground text-sm">Your inventory is empty. Start adding items.</p>
      </div>
    </div>
  );
}
