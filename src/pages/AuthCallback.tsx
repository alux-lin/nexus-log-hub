import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Sword, AlertCircle } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: number | undefined;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      if (session) {
        navigate("/", { replace: true });
      }
    });

    supabase.auth.getSession().then(({ data: { session }, error: err }) => {
      if (cancelled) return;
      if (err) {
        setError(err.message);
        return;
      }
      if (session) {
        navigate("/", { replace: true });
      }
    });

    timeoutId = window.setTimeout(() => {
      if (cancelled) return;
      setError("Sign-in is taking longer than expected. Please try again.");
    }, 8000);

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div
        className="fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--gold)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--gold)) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="relative w-full max-w-sm text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-secondary border border-gold/30 mb-6">
          <Sword className="w-7 h-7 text-gold" />
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground tracking-tight mb-2">
          Nexus Log
        </h1>

        {error ? (
          <div className="mt-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10 border border-destructive/30 mb-4">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button
              variant="outline"
              onClick={() => navigate("/auth", { replace: true })}
            >
              Back to Sign In
            </Button>
          </div>
        ) : (
          <div className="mt-8 flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 text-gold animate-spin" />
            <p className="text-muted-foreground">Signing you in...</p>
          </div>
        )}
      </div>
    </div>
  );
}
