import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, MapPin, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { tutorialSteps } from "./tutorialSteps";
import { cn } from "@/lib/utils";

interface TutorialOverlayProps {
  onClose: () => void;
  onStartGuided?: () => void;
}

export function TutorialOverlay({ onClose, onStartGuided }: TutorialOverlayProps) {
  const [step, setStep] = useState(0);
  const current = tutorialSteps[step];
  const isFirst = step === 0;
  const isLast = step === tutorialSteps.length - 1;

  const handleFinish = () => {
    localStorage.setItem("nexus-tutorial-seen", "1");
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.97 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Progress bar */}
        <div className="h-1 bg-secondary">
          <div
            className="h-full bg-gold transition-all duration-300"
            style={{ width: `${((step + 1) / tutorialSteps.length) * 100}%` }}
          />
        </div>

        {/* Close button */}
        <button
          onClick={handleFinish}
          className="absolute top-4 right-4 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="p-6 pt-5">
          {/* Step indicator */}
          <div className="flex items-center gap-1.5 mb-4">
            {tutorialSteps.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-200",
                  i === step
                    ? "bg-gold w-6"
                    : i < step
                      ? "bg-gold/40"
                      : "bg-secondary"
                )}
              />
            ))}
          </div>

          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{current.icon}</span>
            <div>
              <h2 className="text-lg font-bold text-foreground font-display">
                {current.title}
              </h2>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Step {step + 1} of {tutorialSteps.length}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-foreground/90 leading-relaxed mb-4">
            {current.description}
          </p>

          {/* Details */}
          <ul className="space-y-2 mb-5">
            {current.details.map((detail, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-gold mt-0.5 text-xs">▸</span>
                <span>{detail}</span>
              </li>
            ))}
          </ul>

          {/* Navigate to page hint */}
          {current.id !== "welcome" && (
            <div className="flex items-center gap-4 mb-4">
              <Link
                to={current.page}
                onClick={handleFinish}
                className="inline-flex items-center gap-1.5 text-xs text-gold hover:text-gold/80 transition-colors"
              >
                <MapPin className="w-3 h-3" />
                Go to {current.title} →
              </Link>
              {current.id === "visions" && onStartGuided && (
                <button
                  onClick={() => { handleFinish(); onStartGuided(); }}
                  className="inline-flex items-center gap-1.5 text-xs text-gold hover:text-gold/80 transition-colors border border-gold/30 rounded-md px-2 py-1"
                >
                  <GraduationCap className="w-3 h-3" />
                  Try Guided Tutorial
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-secondary/30">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep((s) => s - 1)}
            disabled={isFirst}
            className="text-muted-foreground"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>

          {isLast ? (
            <Button
              size="sm"
              onClick={handleFinish}
              className="bg-gold text-gold-foreground hover:bg-gold/90"
            >
              Start Your Journey
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => setStep((s) => s + 1)}
              className="bg-gold text-gold-foreground hover:bg-gold/90"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
