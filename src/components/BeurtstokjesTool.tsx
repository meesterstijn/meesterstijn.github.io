import { useState } from "react";
import { X, Plus, Trash2, Users, Pencil, Check, GraduationCap } from "lucide-react";

import { useClasses } from "@/context/ClassContext";
import { useBeurtstokjesTrekker } from "@/hooks/useBeurtstokjes";

const BeurtstokjesTool = ({ onClose }: { onClose: () => void }) => {
  const {
    classes, activeClassId, activeClass, activeStudents, loading,
    setActiveClassId, addClass, renameClass, deleteClass,
    addStudent, removeStudent, clearStudents,
  } = useClasses();

  const [beheren, setBeheren]       = useState(false);
  const [nieuw, setNieuw]           = useState("");
  const [nieuweKlas, setNieuweKlas] = useState("");
  const [bewerkKlasId, setBewerkKlasId] = useState<string | null>(null);
  const [bewerkNaam, setBewerkNaam]     = useState("");

  const namen = activeStudents.map(s => s.name);
  const { display, gekozen, draaien, trek: startTrek } = useBeurtstokjesTrekker(namen, activeClassId);

  const voegToe = async () => {
    const naam = nieuw.trim();
    if (!naam || !activeClassId) return;
    setNieuw("");
    await addStudent(activeClassId, naam);
  };

  const voegKlasToe = async () => {
    const naam = nieuweKlas.trim();
    if (!naam) return;
    setNieuweKlas("");
    await addClass(naam);
  };

  const startBewerkKlas = (id: string, huidigeNaam: string) => {
    setBewerkKlasId(id);
    setBewerkNaam(huidigeNaam);
  };

  const bevestigBewerkKlas = async () => {
    if (bewerkKlasId && bewerkNaam.trim()) await renameClass(bewerkKlasId, bewerkNaam);
    setBewerkKlasId(null);
  };

  const verwijderKlas = async (id: string, naam: string) => {
    if (!window.confirm(`Klas "${naam}" verwijderen? De bijbehorende leerlinglijst wordt dan ook verwijderd.`)) return;
    await deleteClass(id);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden" style={{ background: "hsl(334 10% 97%)" }}>
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border bg-card/95 px-6 py-3 backdrop-blur-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            {activeClass ? activeClass.name : "Klas"}
          </p>
          <h2 className="font-display text-xl font-semibold">Beurtstokjes</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setBeheren(v => !v)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition-smooth hover:border-accent ${beheren ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
          >
            <Users className="h-4 w-4" />
            Leerlingen &amp; klassen
          </button>
          <button onClick={onClose} className="rounded-xl border border-border p-2 transition-smooth hover:border-accent">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="relative flex flex-1 overflow-hidden">

        {/* Hoofd: naam + knop */}
        <div className="flex flex-1 flex-col items-center justify-center gap-8 p-8">

          {/* Naam display */}
          <div
            className="flex h-52 w-full max-w-lg items-center justify-center rounded-3xl border border-border bg-card shadow-soft"
            style={{ transition: "box-shadow 0.3s" }}
          >
            {loading ? (
              <p className="text-muted-foreground text-sm">Laden…</p>
            ) : !activeClass ? (
              <div className="flex flex-col items-center gap-3 px-6 text-center">
                <p className="text-muted-foreground text-sm">
                  Je hebt nog geen klas. Maak eerst een klas aan om leerlingen te kunnen trekken.
                </p>
                <div className="flex gap-2">
                  <input
                    value={nieuweKlas}
                    onChange={e => setNieuweKlas(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && voegKlasToe()}
                    placeholder="Naam klas, bv. Groep 6…"
                    autoFocus
                    className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                  <button
                    onClick={voegKlasToe}
                    className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-smooth hover:opacity-90"
                  >
                    <Plus className="h-4 w-4" /> Klas maken
                  </button>
                </div>
              </div>
            ) : namen.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center px-6">
                Voeg eerst leerlingen toe via de knop "Leerlingen &amp; klassen" rechtsboven.
              </p>
            ) : (
              <span
                className="font-display font-bold text-center px-6"
                style={{
                  fontSize: display.length > 16 ? "2.2rem" : display.length > 10 ? "3rem" : "3.8rem",
                  color: gekozen ? "hsl(var(--accent))" : "hsl(var(--foreground))",
                  transition: "color 0.4s",
                }}
              >
                {display || "—"}
              </span>
            )}
          </div>

          {/* Trek-knop */}
          <button
            onClick={startTrek}
            disabled={draaien || namen.length === 0}
            className="rounded-2xl bg-primary px-10 py-4 font-display text-xl font-semibold text-primary-foreground shadow-soft transition-smooth hover:opacity-90 disabled:opacity-40"
          >
            {draaien ? "Draaien…" : "Trek een leerling"}
          </button>
        </div>

        {/* Zijpaneel: klassen + leerlingen beheren — absoluut links, schuift over de inhoud */}
        {beheren && (
          <div className="absolute right-0 top-0 bottom-0 z-10 flex w-80 flex-col overflow-hidden border-l border-border bg-card shadow-tile">

            {/* Klassen */}
            <div className="p-4 border-b border-border">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                Klassen
              </p>
              <ul className="flex flex-col gap-1 mb-3">
                {classes.map(klas => (
                  <li key={klas.id}>
                    {bewerkKlasId === klas.id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          value={bewerkNaam}
                          onChange={e => setBewerkNaam(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") bevestigBewerkKlas(); if (e.key === "Escape") setBewerkKlasId(null); }}
                          autoFocus
                          className="min-w-0 flex-1 rounded-lg border border-accent bg-background px-2.5 py-1.5 text-sm outline-none"
                        />
                        <button onClick={bevestigBewerkKlas} className="shrink-0 rounded-lg border border-border p-1.5 text-muted-foreground hover:border-accent hover:text-accent">
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div
                        className={`group flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-smooth ${
                          klas.id === activeClassId ? "border border-primary bg-primary/10 text-primary" : "border border-transparent hover:bg-secondary"
                        }`}
                      >
                        <button onClick={() => setActiveClassId(klas.id)} className="flex-1 truncate text-left flex items-center gap-1.5">
                          {klas.id === activeClassId && <GraduationCap className="h-3.5 w-3.5 shrink-0" />}
                          {klas.name}
                        </button>
                        <span className="flex shrink-0 items-center gap-0.5 opacity-0 transition-smooth group-hover:opacity-100">
                          <button onClick={() => startBewerkKlas(klas.id, klas.name)} className="p-1 text-muted-foreground hover:text-accent">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => verwijderKlas(klas.id, klas.name)} className="p-1 text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <input
                  value={nieuweKlas}
                  onChange={e => setNieuweKlas(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && voegKlasToe()}
                  placeholder="Nieuwe klas…"
                  className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                />
                <button
                  onClick={voegKlasToe}
                  className="rounded-xl border border-border bg-background p-2 transition-smooth hover:border-accent"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Leerlingen van actieve klas */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                  Leerlingen{activeClass ? ` — ${activeClass.name}` : ""} ({namen.length})
                </p>
                {namen.length > 0 && activeClassId && (
                  <button
                    onClick={() => clearStudents(activeClassId)}
                    className="text-xs text-muted-foreground hover:text-destructive transition-smooth"
                  >
                    Alles verwijderen
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  value={nieuw}
                  onChange={e => setNieuw(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && voegToe()}
                  placeholder={activeClass ? "Naam toevoegen…" : "Kies eerst een klas…"}
                  disabled={!activeClassId}
                  className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent disabled:opacity-50"
                />
                <button
                  onClick={voegToe}
                  disabled={!activeClassId}
                  className="rounded-xl border border-border bg-background p-2 transition-smooth hover:border-accent disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {!activeClass ? (
                <p className="text-center text-sm text-muted-foreground py-8">Maak of kies eerst een klas.</p>
              ) : activeStudents.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">Nog geen leerlingen.</p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {activeStudents.map(leerling => (
                    <li
                      key={leerling.id}
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium hover:bg-secondary"
                    >
                      <span>{leerling.name}</span>
                      <button
                        onClick={() => removeStudent(leerling.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BeurtstokjesTool;
