import { useClasses } from "@/context/ClassContext";
import { useBeurtstokjesTrekker } from "@/hooks/useBeurtstokjes";

// Compacte "trek een leerling"-widget, gebruikt de leerlingen van de actieve
// klas (zelfde bron als de losse Beurtstokjes-tool). Presentatie mag per
// plek verschillen; de data en selectielogica komen altijd hiervandaan.
export const BeurtstokjesCompact = ({ boxHeight = "h-16" }: { boxHeight?: string }) => {
  const { activeClass, activeStudents, loading } = useClasses();
  const namen = activeStudents.map(s => s.name);
  const { display, gekozen, draaien, trek } = useBeurtstokjesTrekker(namen, activeClass?.id ?? null);

  return (
    <div className="flex w-full flex-col gap-3">
      <div className={`flex ${boxHeight} items-center justify-center rounded-2xl border border-border bg-background`}>
        {loading ? (
          <p className="text-xs text-muted-foreground">Laden…</p>
        ) : !activeClass ? (
          <p className="text-xs text-muted-foreground text-center px-3">Kies of maak eerst een klas.</p>
        ) : namen.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center px-3">Nog geen leerlingen in {activeClass.name}.</p>
        ) : (
          <span
            className="font-display font-bold text-center px-3 leading-tight"
            style={{
              fontSize: display.length > 14 ? "1.1rem" : display.length > 8 ? "1.4rem" : "1.8rem",
              color: gekozen ? "hsl(var(--accent))" : "hsl(var(--foreground))",
              transition: "color 0.4s",
            }}
          >
            {display || "—"}
          </span>
        )}
      </div>
      <button
        onClick={trek}
        disabled={draaien || namen.length === 0}
        className="rounded-xl bg-primary py-2 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90 disabled:opacity-40"
      >
        {draaien ? "…" : "Trek!"}
      </button>
    </div>
  );
};
