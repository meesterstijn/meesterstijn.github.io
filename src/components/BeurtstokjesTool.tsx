import { useEffect, useRef, useState } from "react";
import { X, Plus, Trash2, Users } from "lucide-react";

const SUPABASE_URL = "https://fxcsqxshjnxlknnmfsbv.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4Y3NxeHNoam54bGtubm1mc2J2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMzQwNTgsImV4cCI6MjA5MzcxMDA1OH0.MVp882LWEZVMW33l1Ld94BnFbvCrIzStq02-9ylpYnc";
const H = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" };

const fetchLeerlingen = async (): Promise<string[]> => {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/taakjes?id=eq.1`, { headers: H });
    const data = await res.json();
    return data?.[0]?.leerlingen ?? [];
  } catch { return []; }
};

const saveLeerlingen = (namen: string[]) =>
  fetch(`${SUPABASE_URL}/rest/v1/taakjes?id=eq.1`, { method: "PATCH", headers: H, body: JSON.stringify({ leerlingen: namen }) });

const BeurtstokjesTool = ({ onClose }: { onClose: () => void }) => {
  const [leerlingen, setLeerlingen] = useState<string[]>([]);
  const [display, setDisplay]       = useState<string>("");
  const [gekozen, setGekozen]       = useState<string | null>(null);
  const [draaien, setDraaien]       = useState(false);
  const [beheren, setBeheren]       = useState(false);
  const [nieuw, setNieuw]           = useState("");
  const [loading, setLoading]       = useState(true);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchLeerlingen().then(l => { setLeerlingen(l); setLoading(false); });
  }, []);

  const startTrek = () => {
    if (draaien || leerlingen.length === 0) return;
    setGekozen(null);
    setDraaien(true);

    const winnaar = leerlingen[Math.floor(Math.random() * leerlingen.length)];
    const pool    = leerlingen.length > 1 ? leerlingen : [winnaar];

    let stap = 0;
    const stapMax = 15; // ~1 seconde totaal

    const volgende = () => {
      stap++;
      setDisplay(pool[Math.floor(Math.random() * pool.length)]);
      if (stap < stapMax) {
        const delay = 30 + Math.pow(stap / stapMax, 2) * 100;
        intervalRef.current = setTimeout(volgende, delay);
      } else {
        setDisplay(winnaar);
        setGekozen(winnaar);
        setDraaien(false);
      }
    };
    volgende();
  };

  const voegToe = () => {
    const naam = nieuw.trim();
    if (!naam || leerlingen.includes(naam)) return;
    const nieuweLijst = [...leerlingen, naam].sort((a, b) => a.localeCompare(b, "nl"));
    setLeerlingen(nieuweLijst);
    saveLeerlingen(nieuweLijst);
    setNieuw("");
  };

  const verwijder = (naam: string) => {
    const nieuweLijst = leerlingen.filter(l => l !== naam);
    setLeerlingen(nieuweLijst);
    saveLeerlingen(nieuweLijst);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden" style={{ background: "hsl(334 10% 97%)" }}>
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border bg-card/95 px-6 py-3 backdrop-blur-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Klas</p>
          <h2 className="font-display text-xl font-semibold">Beurtstokjes</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setBeheren(v => !v)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition-smooth hover:border-accent ${beheren ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
          >
            <Users className="h-4 w-4" />
            Leerlingen
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
            ) : leerlingen.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center px-6">
                Voeg eerst leerlingen toe via de knop "Leerlingen" rechtsboven.
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
            disabled={draaien || leerlingen.length === 0}
            className="rounded-2xl bg-primary px-10 py-4 font-display text-xl font-semibold text-primary-foreground shadow-soft transition-smooth hover:opacity-90 disabled:opacity-40"
          >
            {draaien ? "Draaien…" : "Trek een leerling"}
          </button>
        </div>

        {/* Zijpaneel: leerlingen beheren — absoluut links, schuift over de inhoud */}
        {beheren && (
          <div className="absolute right-0 top-0 bottom-0 z-10 flex w-72 flex-col overflow-hidden border-l border-border bg-card shadow-tile">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                  Leerlingen ({leerlingen.length})
                </p>
                {leerlingen.length > 0 && (
                  <button
                    onClick={() => { setLeerlingen([]); saveLeerlingen([]); }}
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
                  placeholder="Naam toevoegen…"
                  className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                />
                <button
                  onClick={voegToe}
                  className="rounded-xl border border-border bg-background p-2 transition-smooth hover:border-accent"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {leerlingen.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">Nog geen leerlingen.</p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {leerlingen.map(naam => (
                    <li
                      key={naam}
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium hover:bg-secondary"
                      style={{ opacity: 1 }}
                    >
                      <span>{naam}</span>
                      <button
                        onClick={() => verwijder(naam)}
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
