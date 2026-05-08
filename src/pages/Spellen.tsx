import { useState, lazy, Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Star } from "lucide-react";

const DagelijkseChallenge = lazy(() => import("@/components/DagelijkseChallenge"));

const Spellen = () => {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <>
      <div className="min-h-screen bg-paper bg-warm">
        <SiteHeader />
        <main className="container py-10 md:py-14">
          <div className="mb-10 animate-fade-up">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Klas</p>
            <h1 className="mt-2 font-display text-4xl font-semibold md:text-5xl">Spellen</h1>
            <p className="mt-3 text-muted-foreground">Leuke activiteiten voor in de klas.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-fade-up">
            <button
              onClick={() => setOpen("challenge")}
              className="group flex flex-col items-start gap-4 rounded-3xl border border-border bg-card p-6 shadow-soft text-left transition-smooth hover:-translate-y-1 hover:shadow-tile hover:border-accent"
            >
              <div className="rounded-2xl bg-secondary p-3">
                <Star className="h-6 w-6 text-primary" strokeWidth={1.6} />
              </div>
              <div>
                <p className="font-display text-xl font-semibold">Dagelijkse challenge</p>
                <p className="mt-1 text-sm text-muted-foreground">Elke dag een nieuwe uitdaging voor de klas.</p>
              </div>
            </button>
          </div>

          <footer className="mt-20 border-t border-border pt-6 text-center text-sm text-muted-foreground">
            Met liefde gemaakt voor de klas · Meester Stijn
          </footer>
        </main>
      </div>

      {open === "challenge" && (
        <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-paper text-muted-foreground">Laden…</div>}>
          <DagelijkseChallenge onClose={() => setOpen(null)} />
        </Suspense>
      )}
    </>
  );
};

export default Spellen;
