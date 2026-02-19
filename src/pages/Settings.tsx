import { Settings as SettingsIcon } from "lucide-react";

export default function Settings() {
  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <SettingsIcon className="w-6 h-6 text-gold" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Configure your character & preferences</p>
        </div>
      </div>
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <p className="text-muted-foreground text-sm">Settings coming soon.</p>
      </div>
    </div>
  );
}
