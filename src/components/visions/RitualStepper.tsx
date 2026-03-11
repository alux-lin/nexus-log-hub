import { cn } from "@/lib/utils";
import { Eye, Swords, Shield } from "lucide-react";

const STEPS = [
  { label: "Vision", icon: Eye },
  { label: "Quests", icon: Swords },
  { label: "Commit", icon: Shield },
];

interface RitualStepperProps {
  currentStep: number;
}

export function RitualStepper({ currentStep }: RitualStepperProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const isActive = i === currentStep;
        const isDone = i < currentStep;
        return (
          <div key={i} className="flex items-center gap-2">
            {i > 0 && (
              <div
                className={cn(
                  "w-12 h-px",
                  isDone ? "bg-gold" : "bg-border"
                )}
              />
            )}
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all",
                  isActive && "bg-gold text-gold-foreground glow-warn",
                  isDone && "bg-gold/20 text-gold border border-gold/40",
                  !isActive && !isDone && "bg-secondary text-muted-foreground border border-border"
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={cn(
                  "text-xs font-medium hidden sm:block",
                  isActive ? "text-gold" : isDone ? "text-gold/60" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
