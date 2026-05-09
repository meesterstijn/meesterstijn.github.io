import { useState, useEffect } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Plus, Trash2, Shuffle, Settings, ChevronLeft, RotateCw } from "lucide-react";

const SUPABASE_URL = "https://fxcsqxshjnxlknnmfsbv.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4Y3NxeHNoam54bGtubm1mc2J2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMzQwNTgsImV4cCI6MjA5MzcxMDA1OH0.MVp882LWEZVMW33l1Ld94BnFbvCrIzStq02-9ylpYnc";
const H = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" };

type Assignments = Record<string, string[]>;

const fetchData = async (): Promise<{ leerlingen: string[]; assignments: Assignments }> => {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/taakjes?id=eq.1`, { headers: H });
    const data = await res.json();
    const raw = data?.[0]?.assignments ?? {};
    const assignments: Assignments = {};
    for (const [key, val] of Object.entries(raw)) {
      assignments[key] = Array.isArray(val) ? (val as string[]) : typeof val === "string" ? [val] : [];
    }
    return { leerlingen: data?.[0]?.leerlingen ?? [], assignments };
  } catch {
    return { leerlingen: [], assignments: {} };
  }
};

const patch = async (body: object) =>
  fetch(`${SUPABASE_URL}/rest/v1/taakjes?id=eq.1`, { method: "PATCH", headers: H, body: JSON.stringify(body) });

type Taak = { id: string; emoji: string; naam: string; desc: string };

const TAKEN: Taak[] = [
  { id: "uitdeler",   emoji: "📋", naam: "Uitdelers",         desc: "Deelt materiaal uit aan de klas" },
  { id: "afval",      emoji: "🗑️", naam: "Afvalwacht",        desc: "Gooit het afval weg na de les" },
  { id: "stoelen",    emoji: "🪑", naam: "Stoelenzetter",      desc: "Zet stoelen op tafel aan het einde" },
  { id: "computer",   emoji: "💻", naam: "Chromebookdienst",   desc: "Haal en ruim de Chromebooks op" },
  { id: "plant",      emoji: "🌱", naam: "Groene vingers",     desc: "Geeft water aan de klasplant" },
  { id: "opruimen",   emoji: "🧹", naam: "Veegdienst",         desc: "Ruimt de klas op na de les" },
  { id: "helpende",   emoji: "🤝", naam: "Helpende hand",      desc: "Helpt klasgenoten die vastlopen" },
  { id: "tafels",     emoji: "🪑", naam: "Tafelrechtzetter",   desc: "Zet tafels recht aan het einde van de dag" },
  { id: "ramen",      emoji: "🪟", naam: "Ramen",              desc: "Doet de ramen open en dicht" },
];

const CHIP_COLORS = [
  "bg-accent/20 text-accent border-accent/40",
  "bg-sage/20 text-sage border-sage/40",
  "bg-primary/20 text-primary border-primary/40",
  "bg-highlight/20 text-foreground border-highlight/50",
  "bg-[#c084fc]/20 text-[#7c3aed] border-[#c084fc]/40",
  "bg-[#f472b6]/20 text-[#be185d] border-[#f472b6]/40",
];

const shuffleArr = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

type Selected = { taakId: string; naam: string };
type DragSrc  = { taakId: string; naam: string };

const Taakjes = () => {
  const [leerlingen, setLeerlingen]   = useState<string[]>([]);
  const [assignments, setAssignments] = useState<Assignments>({});
  const [mode, setMode]               = useState<"taken" | "beheer">("taken");
  const [nieuwNaam, setNieuwNaam]     = useState("");
  const [dragSrc, setDragSrc]         = useState<DragSrc | null>(null);
  const [dragOver, setDragOver]       = useState<string | null>(null);
  const [selected, setSelected]       = useState<Selected | null>(null);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    fetchData().then(d => {
      setLeerlingen(d.leerlingen);
      setAssignments(d.assignments);
      setLoading(false);
    });
  }, []);

  const saveLeerlingen = (namen: string[]) => {
    setLeerlingen(namen);
    patch({ leerlingen: namen });
  };

  const saveAssignments = (ass: Assignments) => {
    setAssignments(ass);
    patch({ assignments: ass });
  };

  // Move one student from one task to another
  const move = (naam: string, fromId: string, toId: string) => {
    if (fromId === toId) return;
    const next = { ...assignments };
    next[fromId] = (next[fromId] ?? []).filter(n => n !== naam);
    if (next[fromId].length === 0) delete next[fromId];
    next[toId] = [...(next[toId] ?? []), naam];
    saveAssignments(next);
  };

  const addLeerling = () => {
    const naam = nieuwNaam.trim();
    if (!naam || leerlingen.includes(naam)) return;
    saveLeerlingen([...leerlingen, naam]);
    setNieuwNaam("");
  };

  const removeLeerling = (naam: string) => {
    saveLeerlingen(leerlingen.filter(l => l !== naam));
    const next = { ...assignments };
    for (const key of Object.keys(next)) {
      next[key] = next[key].filter(n => n !== naam);
      if (next[key].length === 0) delete next[key];
    }
    saveAssignments(next);
  };

  const autoVerdelen = () => {
    const shuffled = shuffleArr(leerlingen);
    const next: Assignments = {};
    shuffled.forEach((naam, i) => {
      const id = TAKEN[i % TAKEN.length].id;
      next[id] = [...(next[id] ?? []), naam];
    });
    saveAssignments(next);
    setSelected(null);
  };

  const verschuif = () => {
    const next: Assignments = {};
    TAKEN.forEach((taak, i) => {
      const namen = assignments[taak.id];
      if (namen?.length) {
        const volgendId = TAKEN[(i + 1) % TAKEN.length].id;
        next[volgendId] = [...(next[volgendId] ?? []), ...namen];
      }
    });
    saveAssignments(next);
    setSelected(null);
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, taakId: string, naam: string) => {
    setDragSrc({ taakId, naam });
    setSelected(null);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (dragSrc && dragSrc.taakId !== targetId) move(dragSrc.naam, dragSrc.taakId, targetId);
    setDragSrc(null);
    setDragOver(null);
  };

  // Tap handlers (touch / smartboard)
  const handleChipTap = (e: React.MouseEvent, taakId: string, naam: string) => {
    e.stopPropagation();
    if (selected?.taakId === taakId && selected?.naam === naam) { setSelected(null); return; }
    if (selected) { move(selected.naam, selected.taakId, taakId); setSelected(null); return; }
    setSelected({ taakId, naam });
  };

  const handleCardTap = (taakId: string) => {
    if (selected && selected.taakId !== taakId) {
      move(selected.naam, selected.taakId, taakId);
      setSelected(null);
    }
  };

  const chipColor = (naam: string) =>
    CHIP_COLORS[Math.abs(leerlingen.indexOf(naam)) % CHIP_COLORS.length];

  return (
    <div className="min-h-screen bg-paper bg-warm" onClick={() => setSelected(null)}>
      <SiteHeader />
      <main className="container py-10 md:py-14" onClick={e => e.stopPropagation()}>
        {loading ? <p className="text-muted-foreground">Laden…</p> : <>

        {/* Header */}
        <div className="mb-8 animate-fade-up flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">De klas</p>
            <h1 className="mt-2 font-display text-4xl font-semibold md:text-5xl">Taakjes</h1>
            <p className="mt-3 text-muted-foreground">
              {mode === "taken"
                ? "Sleep een naam naar een andere taak, of tik hem aan en tik de doelkaart."
                : "Voeg leerlingen toe en verdeel ze over de taken."}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2 sm:flex-nowrap sm:gap-3">
            {mode === "taken" ? (
              <>
                <button
                  onClick={verschuif}
                  disabled={Object.keys(assignments).length === 0}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium transition-smooth hover:border-accent disabled:opacity-40 sm:flex-none"
                >
                  <RotateCw className="h-4 w-4" /> Doorschuiven
                </button>
                <button
                  onClick={autoVerdelen}
                  disabled={leerlingen.length === 0}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium transition-smooth hover:border-accent disabled:opacity-40 sm:flex-none"
                >
                  <Shuffle className="h-4 w-4" /> Willekeurig verdelen
                </button>
                <button
                  onClick={() => { setMode("beheer"); setSelected(null); }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-smooth hover:opacity-90 sm:w-auto"
                >
                  <Settings className="h-4 w-4" /> Leerlingen
                </button>
              </>
            ) : (
              <button
                onClick={() => setMode("taken")}
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium transition-smooth hover:border-accent"
              >
                <ChevronLeft className="h-4 w-4" /> Terug naar taken
              </button>
            )}
          </div>
        </div>

        {/* Beheer */}
        {mode === "beheer" && (
          <div className="animate-fade-up max-w-2xl">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                  Leerlingen — {leerlingen.length} namen
                </p>
                {leerlingen.length > 0 && (
                  <button
                    onClick={() => { saveLeerlingen([]); saveAssignments({}); }}
                    className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-smooth hover:border-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Alles wissen
                  </button>
                )}
              </div>
              <div className="flex gap-2 mb-5">
                <input
                  value={nieuwNaam}
                  onChange={e => setNieuwNaam(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addLeerling()}
                  placeholder="Naam leerling…"
                  autoFocus
                  className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
                />
                <button
                  onClick={addLeerling}
                  className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-smooth hover:opacity-90"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {leerlingen.length === 0 && (
                <p className="text-sm text-muted-foreground">Nog geen leerlingen toegevoegd.</p>
              )}
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {leerlingen.map((naam, i) => (
                  <li key={naam} className="flex items-center gap-1.5">
                    <div className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium truncate ${CHIP_COLORS[i % CHIP_COLORS.length]}`}>
                      {naam}
                    </div>
                    <button
                      onClick={() => removeLeerling(naam)}
                      className="shrink-0 text-muted-foreground transition-smooth hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Taken grid */}
        {mode === "taken" && (
          <>
            {selected && (
              <div className="mb-4 animate-fade-up rounded-2xl border border-accent bg-accent/10 px-4 py-3 text-sm font-medium text-accent">
                Tik op een taakkaart om <strong>{selected.naam}</strong> daarnaar te verplaatsen. Tik opnieuw op de naam om te deselecteren.
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 animate-fade-up">
              {TAKEN.map(taak => {
                const namen   = Array.isArray(assignments[taak.id]) ? assignments[taak.id] : [];
                const isOver  = dragOver === taak.id;
                const isTarget = selected !== null && selected.taakId !== taak.id;

                return (
                  <div
                    key={taak.id}
                    onClick={() => handleCardTap(taak.id)}
                    onDragOver={e => { e.preventDefault(); setDragOver(taak.id); }}
                    onDragLeave={() => setDragOver(null)}
                    onDrop={e => handleDrop(e, taak.id)}
                    className={`flex flex-col rounded-3xl border-2 p-5 shadow-soft transition-smooth ${
                      isOver || (isTarget && namen.length > 0)
                        ? "border-accent bg-accent/5 scale-[1.02] cursor-pointer"
                        : isTarget
                        ? "border-dashed border-accent/60 bg-accent/5 cursor-pointer"
                        : "border-border bg-card"
                    }`}
                  >
                    <span className="text-3xl mb-3">{taak.emoji}</span>
                    <p className="font-display font-semibold leading-tight">{taak.naam}</p>
                    <p className="mt-1 text-xs text-muted-foreground leading-snug">{taak.desc}</p>

                    <div className="mt-4 flex flex-col gap-1.5">
                      {namen.map(naam => {
                        const isChipSelected = selected?.taakId === taak.id && selected?.naam === naam;
                        return (
                          <div
                            key={naam}
                            draggable
                            onDragStart={e => handleDragStart(e, taak.id, naam)}
                            onDragEnd={() => { setDragSrc(null); setDragOver(null); }}
                            onClick={e => handleChipTap(e, taak.id, naam)}
                            className={`cursor-grab active:cursor-grabbing rounded-xl border px-3 py-1.5 text-sm font-semibold text-center select-none transition-smooth ${chipColor(naam)} ${
                              isChipSelected ? "ring-2 ring-accent ring-offset-1 scale-105 shadow-md" : "hover:scale-105"
                            }`}
                          >
                            {naam}
                          </div>
                        );
                      })}
                      {namen.length === 0 && (
                        <div className={`rounded-xl border-2 border-dashed px-3 py-1.5 text-center text-xs transition-smooth ${
                          isTarget ? "border-accent/60 text-accent" : "border-border text-muted-foreground"
                        }`}>
                          {isTarget ? "Zet hier neer" : "Nog niemand"}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <footer className="mt-20 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          Met liefde gemaakt voor de klas · Meester Stijn
        </footer>
        </>}
      </main>
    </div>
  );
};

export default Taakjes;
