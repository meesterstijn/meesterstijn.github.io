import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { X, Plus, RotateCw, Trash2, Users } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useClasses } from "@/context/ClassContext";

const PAD = 44;
const DESK_W = 0.65;
const DESK_H = 0.45;
const CHAIR_H = 0.20;
const SNAP = 0.05;
const DESK_SNAP = 0.15;

type Rotation = 0 | 90 | 180 | 270;
type Tafel = { id: string; x: number; y: number; w: number; h: number; rotation: Rotation; naam: string };

const eff = (t: Tafel) => (t.rotation === 0 || t.rotation === 180) ? { w: t.w, h: t.h } : { w: t.h, h: t.w };
type Wand = "boven" | "onder" | "links" | "rechts";
type Lokaal = { breedte: number; diepte: number; bord: number; bordWand: Wand };
type DragInfo = { id: string; startMouseX: number; startMouseY: number; startX: number; startY: number };

const snapTo = (v: number) => Math.round(v / SNAP) * SNAP;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const uid = () => Math.random().toString(36).slice(2, 9);

const DEFAULT_LOKAAL: Lokaal = { breedte: 9, diepte: 7, bord: 4, bordWand: "boven" };

// ─── Supabase helpers ─────────────────────────────────────────────────────────

async function fetchFromSupabase(classId: string): Promise<{ lokaal: Lokaal; tafels: Tafel[] } | null> {
  try {
    const { data } = await supabase.from("plaatsen").select("lokaal,tafels").eq("class_id", classId).maybeSingle();
    if (data) {
      const lok = data.lokaal ?? DEFAULT_LOKAAL;
      if (lok.bord == null) lok.bord = DEFAULT_LOKAAL.bord;
      if (lok.bordWand == null) lok.bordWand = DEFAULT_LOKAAL.bordWand;
      const tafels = (data.tafels ?? []).map((t: Tafel) => ({ rotation: 0 as Rotation, ...t }));
      return { lokaal: lok, tafels };
    }
  } catch {}
  return null;
}

async function saveToSupabase(classId: string, lokaal: Lokaal, tafels: Tafel[]): Promise<string | null> {
  try {
    const { error } = await supabase.from("plaatsen").upsert({ class_id: classId, lokaal, tafels }, { onConflict: "class_id" });
    return error ? error.message : null;
  } catch (e) {
    return String(e);
  }
}

// ─── Default layout generator ─────────────────────────────────────────────────

const buildDefaultLayout = (leerlingen: string[], lokaal: Lokaal): Tafel[] => {
  // Bureau meester — vooraan rechts
  const meester: Tafel = {
    id: uid(),
    x: snapTo(clamp(lokaal.breedte - 1.45, 0, lokaal.breedte - 1.2)),
    y: snapTo(0.3),
    w: 1.2,
    h: 0.6,
    rotation: 0 as Rotation,
    naam: "Meester",
  };

  const n = leerlingen.length;
  if (n === 0) return [meester];

  const marginTop = 1.5;   // ruimte voor bord/leraar
  const gapX = 0.30;       // ruimte tussen kolommen
  const gapY = 0.55;       // ruimte tussen rijen (boven stoel)

  const slotW = DESK_W + gapX;
  const slotH = DESK_H + CHAIR_H + gapY;

  // Hoeveel kolommen passen er horizontaal (met 0.5m marge aan elke kant)
  const maxCols = Math.max(1, Math.floor((lokaal.breedte - 1.0 + gapX) / slotW));
  const cols = Math.min(maxCols, n);

  // Centreer horizontaal
  const totalW = cols * slotW - gapX;
  const startX = (lokaal.breedte - totalW) / 2;

  const leerlingTafels = leerlingen.map((naam, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return {
      id: uid(),
      x: snapTo(clamp(startX + col * slotW, 0, lokaal.breedte - DESK_W)),
      y: snapTo(clamp(marginTop + row * slotH, 0, lokaal.diepte - DESK_H - CHAIR_H)),
      w: DESK_W,
      h: DESK_H,
      rotation: 0 as Rotation,
      naam,
    };
  });

  return [meester, ...leerlingTafels];
};

// ─── Component ────────────────────────────────────────────────────────────────

const PlaatsenTool = ({ onClose }: { onClose: () => void }) => {
  const { activeClass, activeClassId, activeStudents, loading: klasLoading } = useClasses();
  const leerlingen = activeStudents.map(s => s.name);

  const [tafels, setTafels] = useState<Tafel[]>([]);
  const [lokaal, setLokaal] = useState<Lokaal>(DEFAULT_LOKAAL);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [svgSize, setSvgSize] = useState({ w: 0, h: 0 });
  const [breedte, setBreedte] = useState("9");
  const [diepte, setDiepte] = useState("7");
  const [bord, setBord] = useState("4");
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">("saved");
  const [saveError, setSaveError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const lokaalRef = useRef(lokaal);
  const scaleRef = useRef(1);
  const tabelsRef = useRef(tafels);
  const dragRef = useRef<DragInfo | null>(null);
  const initialLoad = useRef(true);

  useEffect(() => { lokaalRef.current = lokaal; }, [lokaal]);
  useEffect(() => { tabelsRef.current = tafels; }, [tafels]);

  // Laad de indeling van de actieve klas — opnieuw bij elke klaswissel. Wachten tot
  // useClasses() klaar is, zodat de leerlingenlijst hieronder al klopt voor de auto-opstelling.
  useEffect(() => {
    if (klasLoading) return;
    setSelectedId(null);
    if (!activeClassId) { setTafels([]); setLoading(false); return; }
    setLoading(true);
    fetchFromSupabase(activeClassId).then(data => {
      const s = data ?? { lokaal: DEFAULT_LOKAAL, tafels: [] };
      // Als er nog geen tafels zijn → automatisch opstelling maken op basis van leerlingen
      const tafelsToLoad = s.tafels.length > 0 ? s.tafels : buildDefaultLayout(leerlingen, s.lokaal);
      initialLoad.current = true; // dit is een load, geen wijziging — sla niet meteen weer op
      setTafels(tafelsToLoad);
      setLokaal(s.lokaal);
      setBreedte(String(s.lokaal.breedte));
      setDiepte(String(s.lokaal.diepte));
      setBord(String(s.lokaal.bord));
      setLoading(false);
    });
    // leerlingen bewust buiten de deps: alleen relevant op het moment dat een klas zonder
    // opgeslagen indeling geladen wordt, niet bij elke wijziging van de leerlingenlijst.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeClassId, klasLoading]);

  // Debounced save
  useEffect(() => {
    if (initialLoad.current) { initialLoad.current = false; return; }
    if (loading || !activeClassId) return;
    setSaveStatus("saving");
    const timer = setTimeout(async () => {
      const err = await saveToSupabase(activeClassId, lokaal, tafels);
      if (err) { setSaveError(err); setSaveStatus("error"); }
      else { setSaveError(null); setSaveStatus("saved"); }
    }, 1200);
    return () => clearTimeout(timer);
  }, [lokaal, tafels, loading, activeClassId]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setSvgSize({ w: el.clientWidth, h: el.clientHeight });
    const ro = new ResizeObserver(entries => {
      const r = entries[0].contentRect;
      setSvgSize({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = Math.min(
    (svgSize.w - 2 * PAD) / lokaal.breedte,
    (svgSize.h - 2 * PAD) / lokaal.diepte
  );
  scaleRef.current = scale;

  const updateDragPos = useCallback((clientX: number, clientY: number) => {
    if (!dragRef.current) return;
    const sc = scaleRef.current;
    const lok = lokaalRef.current;
    const info = dragRef.current;
    const tafel = tabelsRef.current.find(t => t.id === info.id);
    if (!tafel) return;

    const { w: ew, h: eh } = eff(tafel);
    const rawX = clamp(info.startX + (clientX - info.startMouseX) / sc, 0, lok.breedte - ew);
    const rawY = clamp(info.startY + (clientY - info.startMouseY) / sc, 0, lok.diepte - eh);

    let newX = snapTo(rawX);
    let newY = snapTo(rawY);

    const others = tabelsRef.current.filter(t => t.id !== info.id);
    let bestDx = DESK_SNAP;
    let bestDy = DESK_SNAP;
    let snapX: number | null = null;
    let snapY: number | null = null;

    for (const o of others) {
      const { w: ow, h: oh } = eff(o);
      const d1 = Math.abs(rawX - (o.x + ow));
      if (d1 < bestDx) { bestDx = d1; snapX = o.x + ow; }
      const d2 = Math.abs(rawX + ew - o.x);
      if (d2 < bestDx) { bestDx = d2; snapX = o.x - ew; }
      const d3 = Math.abs(rawY - (o.y + oh));
      if (d3 < bestDy) { bestDy = d3; snapY = o.y + oh; }
      const d4 = Math.abs(rawY + eh - o.y);
      if (d4 < bestDy) { bestDy = d4; snapY = o.y - eh; }
    }

    if (snapX !== null) newX = snapX;
    if (snapY !== null) newY = snapY;

    newX = clamp(newX, 0, lok.breedte - ew);
    newY = clamp(newY, 0, lok.diepte - eh);

    setTafels(prev => prev.map(t => t.id === info.id ? { ...t, x: newX, y: newY } : t));
  }, []);

  const endDrag = useCallback(() => { dragRef.current = null; }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => updateDragPos(e.clientX, e.clientY);
    const onTMove = (e: TouchEvent) => { e.preventDefault(); updateDragPos(e.touches[0].clientX, e.touches[0].clientY); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", endDrag);
    window.addEventListener("touchmove", onTMove, { passive: false });
    window.addEventListener("touchend", endDrag);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", endDrag);
      window.removeEventListener("touchmove", onTMove);
      window.removeEventListener("touchend", endDrag);
    };
  }, [updateDragPos, endDrag]);

  const startDrag = (e: React.MouseEvent | React.TouchEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const tafel = tabelsRef.current.find(t => t.id === id);
    if (!tafel) return;
    setSelectedId(id);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    dragRef.current = { id, startMouseX: clientX, startMouseY: clientY, startX: tafel.x, startY: tafel.y };
  };

  const addTafel = () => {
    const count = tabelsRef.current.length;
    const col = count % 6;
    const row = Math.floor(count / 6);
    const x = snapTo(clamp(0.5 + col * 0.9, 0, lokaalRef.current.breedte - DESK_W));
    const y = snapTo(clamp(1.0 + row * 0.85, 0, lokaalRef.current.diepte - DESK_H));
    const newTafel: Tafel = { id: uid(), x, y, w: DESK_W, h: DESK_H, rotation: 0, naam: "" };
    setTafels(prev => [...prev, newTafel]);
    setSelectedId(newTafel.id);
  };

  const resetNaarLeerlingen = () => {
    if (tafels.length === 0 || window.confirm("Dit vervangt de huidige opstelling met de leerlingenlijst. Doorgaan?")) {
      setTafels(buildDefaultLayout(leerlingen, lokaalRef.current));
      setSelectedId(null);
    }
  };

  const rotateTafel = (id: string) => {
    setTafels(prev => prev.map(t => {
      if (t.id !== id) return t;
      const nextRot = ((t.rotation + 90) % 360) as Rotation;
      const { w: ew, h: eh } = eff({ ...t, rotation: nextRot });
      return {
        ...t,
        rotation: nextRot,
        x: clamp(t.x, 0, Math.max(0, lokaalRef.current.breedte - ew)),
        y: clamp(t.y, 0, Math.max(0, lokaalRef.current.diepte - eh)),
      };
    }));
  };

  const rotateAll = () => {
    setTafels(prev => prev.map(t => {
      const nextRot = ((t.rotation + 90) % 360) as Rotation;
      const { w: ew, h: eh } = eff({ ...t, rotation: nextRot });
      return {
        ...t,
        rotation: nextRot,
        x: clamp(t.x, 0, Math.max(0, lokaalRef.current.breedte - ew)),
        y: clamp(t.y, 0, Math.max(0, lokaalRef.current.diepte - eh)),
      };
    }));
  };

  const deleteTafel = (id: string) => {
    setTafels(prev => prev.filter(t => t.id !== id));
    setSelectedId(prev => (prev === id ? null : prev));
  };

  const applyLokaal = () => {
    const b = parseFloat(breedte);
    const d = parseFloat(diepte);
    const bd = parseFloat(bord);
    if (!isNaN(b) && !isNaN(d) && b >= 2 && d >= 2)
      setLokaal(prev => ({ ...prev, breedte: b, diepte: d, bord: !isNaN(bd) ? clamp(bd, 0.5, b) : prev.bord }));
  };

  const selectedTafel = tafels.find(t => t.id === selectedId) ?? null;

  const roomW = lokaal.breedte * scale;
  const roomH = lokaal.diepte * scale;
  const offsetX = Math.max(PAD, (svgSize.w - roomW) / 2);
  const offsetY = Math.max(PAD, (svgSize.h - roomH) / 2);
  const toX = (m: number) => offsetX + m * scale;
  const toY = (m: number) => offsetY + m * scale;

  const vLines: number[] = [];
  const hLines: number[] = [];
  for (let x = 0; x <= lokaal.breedte + 0.01; x += 0.5) vLines.push(parseFloat(x.toFixed(1)));
  for (let y = 0; y <= lokaal.diepte + 0.01; y += 0.5) hLines.push(parseFloat(y.toFixed(1)));

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden" style={{ background: "hsl(334 10% 97%)" }}>
      {/* Sidebar */}
      <aside className="flex w-72 shrink-0 flex-col border-r border-border bg-card">
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                {activeClass ? activeClass.name : "Klaslokaal"}
              </p>
              <h2 className="font-display text-xl font-semibold">Plaatsen</h2>
              <p className={`mt-0.5 text-xs ${saveStatus === "error" ? "text-red-500" : "text-muted-foreground"}`}>
                {saveStatus === "saving" ? "Opslaan…" : saveStatus === "error" ? "⚠ Opslaan mislukt" : "✓ Opgeslagen"}
              </p>
              {saveStatus === "error" && saveError && (
                <p className="mt-1 text-[10px] text-red-400 leading-snug break-all">{saveError}</p>
              )}
            </div>
            <button onClick={onClose} className="rounded-xl border border-border p-2 transition-smooth hover:border-accent">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Leerlingen info */}
          {!activeClass ? (
            <div className="rounded-2xl border border-border bg-background/60 px-4 py-3">
              <p className="text-xs text-muted-foreground">
                Je hebt nog geen klas. Maak eerst een klas aan via de klas-kiezer in de header of bij Beurtstokjes.
              </p>
            </div>
          ) : leerlingen.length > 0 ? (
            <div className="rounded-2xl border border-border bg-background/60 px-4 py-3">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{leerlingen.length} leerlingen</span> uit {activeClass.name}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-background/60 px-4 py-3">
              <p className="text-xs text-muted-foreground">
                Nog geen leerlingen in {activeClass.name}. Voeg ze toe via Beurtstokjes / klasbeheer.
              </p>
            </div>
          )}

          <section className="rounded-2xl border border-border bg-background/60 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Afmetingen lokaal</p>
            <div className="flex flex-col gap-2">
              <label className="flex items-center justify-between gap-2 text-sm">
                <span className="text-muted-foreground">Breedte (m)</span>
                <input
                  type="number" min="2" max="20" step="0.5"
                  value={breedte}
                  onChange={e => setBreedte(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && applyLokaal()}
                  className="w-20 rounded-lg border border-border bg-card px-2 py-1 text-right text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </label>
              <label className="flex items-center justify-between gap-2 text-sm">
                <span className="text-muted-foreground">Diepte (m)</span>
                <input
                  type="number" min="2" max="20" step="0.5"
                  value={diepte}
                  onChange={e => setDiepte(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && applyLokaal()}
                  className="w-20 rounded-lg border border-border bg-card px-2 py-1 text-right text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </label>
              <label className="flex items-center justify-between gap-2 text-sm">
                <span className="text-muted-foreground">Bord lengte (m)</span>
                <input
                  type="number" min="0.5" max="20" step="0.5"
                  value={bord}
                  onChange={e => setBord(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && applyLokaal()}
                  className="w-20 rounded-lg border border-border bg-card px-2 py-1 text-right text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </label>
              <div>
                <p className="mb-1.5 text-xs text-muted-foreground">Bord aan de wand</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {(["boven", "onder", "links", "rechts"] as const).map(w => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setLokaal(prev => ({ ...prev, bordWand: w }))}
                      className={`rounded-lg py-1.5 text-xs font-semibold capitalize transition-smooth ${
                        lokaal.bordWand === w
                          ? "bg-primary text-primary-foreground"
                          : "border border-border hover:border-accent"
                      }`}
                    >
                      {w.charAt(0).toUpperCase() + w.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={applyLokaal}
                className="mt-1 rounded-xl bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90"
              >
                Toepassen
              </button>
            </div>
          </section>

          <button
            onClick={addTafel}
            disabled={!activeClass}
            className="flex items-center gap-2 rounded-2xl border border-border bg-background/60 p-4 text-sm font-semibold transition-smooth hover:border-accent hover:bg-accent/5 disabled:opacity-40"
          >
            <Plus className="h-4 w-4 text-accent" />
            Losse tafel toevoegen
          </button>

          {leerlingen.length > 0 && (
            <button
              onClick={resetNaarLeerlingen}
              className="flex items-center gap-2 rounded-2xl border border-accent/40 bg-accent/5 p-4 text-sm font-semibold text-accent transition-smooth hover:border-accent hover:bg-accent/10"
            >
              <Users className="h-4 w-4" />
              Opstelling met leerlingenlijst
            </button>
          )}

          {selectedTafel && (
            <section className="rounded-2xl border border-border bg-background/60 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Geselecteerd</p>
              <input
                type="text"
                placeholder="Naam leerling…"
                value={selectedTafel.naam}
                onChange={e => {
                  const naam = e.target.value;
                  setTafels(prev => prev.map(t => t.id === selectedTafel.id ? { ...t, naam } : t));
                }}
                className="mb-3 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />

              <div className="mb-3 flex gap-2">
                <label className="flex flex-1 flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Breedte (m)</span>
                  <input
                    type="number" min="0.3" max="3" step="0.05"
                    value={selectedTafel.w.toFixed(2)}
                    onChange={e => {
                      const w = parseFloat(e.target.value);
                      if (!isNaN(w) && w >= 0.3)
                        setTafels(prev => prev.map(t => t.id === selectedTafel.id ? { ...t, w } : t));
                    }}
                    className="rounded-lg border border-border bg-card px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </label>
                <label className="flex flex-1 flex-col gap-1">
                  <span className="text-xs text-muted-foreground">Diepte (m)</span>
                  <input
                    type="number" min="0.3" max="3" step="0.05"
                    value={selectedTafel.h.toFixed(2)}
                    onChange={e => {
                      const h = parseFloat(e.target.value);
                      if (!isNaN(h) && h >= 0.3)
                        setTafels(prev => prev.map(t => t.id === selectedTafel.id ? { ...t, h } : t));
                    }}
                    className="rounded-lg border border-border bg-card px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => rotateTafel(selectedTafel.id)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border px-2 py-2 text-xs font-semibold transition-smooth hover:border-accent"
                >
                  <RotateCw className="h-3.5 w-3.5" /> {selectedTafel.rotation}°
                </button>
                <button
                  onClick={() => deleteTafel(selectedTafel.id)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-200 px-2 py-2 text-xs font-semibold text-red-500 transition-smooth hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Verwijderen
                </button>
              </div>
            </section>
          )}
        </div>

        {/* Vaste onderkant */}
        <div className="shrink-0 border-t border-border p-4 flex flex-col gap-2">
          <button
            onClick={rotateAll}
            disabled={!activeClass}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-background/60 p-3 text-sm font-semibold transition-smooth hover:border-accent hover:bg-accent/5 disabled:opacity-40"
          >
            <RotateCw className="h-4 w-4" /> Alle tafels draaien
          </button>
          <button
            onClick={() => { setTafels([]); setSelectedId(null); }}
            disabled={!activeClass}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50/50 p-3 text-sm font-semibold text-red-500 transition-smooth hover:bg-red-100 hover:border-red-400 disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" /> Alle tafels verwijderen
          </button>
        </div>
      </aside>

      {/* SVG canvas */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden"
        onClick={() => setSelectedId(null)}
      >
        {klasLoading || loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-muted-foreground">{klasLoading ? "Klas laden…" : "Indeling laden…"}</p>
          </div>
        ) : !activeClass ? (
          <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
            <p className="text-muted-foreground">
              Maak eerst een klas aan om een plaatsindeling te kunnen maken.
            </p>
          </div>
        ) : null}
        {!klasLoading && !loading && activeClass && svgSize.w > 0 && (
          <svg width={svgSize.w} height={svgSize.h} style={{ display: "block" }}>
            <defs>
              <clipPath id="plaatsen-room-clip">
                <rect x={offsetX} y={offsetY} width={roomW} height={roomH} />
              </clipPath>
            </defs>

            <rect x={offsetX} y={offsetY} width={roomW} height={roomH} fill="white" />

            <g clipPath="url(#plaatsen-room-clip)">
              {vLines.map(x => (
                <line
                  key={`v${x}`}
                  x1={toX(x)} y1={offsetY}
                  x2={toX(x)} y2={offsetY + roomH}
                  stroke={x % 1 === 0 ? "#d1d5db" : "#e5e7eb"}
                  strokeWidth={x % 1 === 0 ? 1 : 0.5}
                />
              ))}
              {hLines.map(y => (
                <line
                  key={`h${y}`}
                  x1={offsetX} y1={toY(y)}
                  x2={offsetX + roomW} y2={toY(y)}
                  stroke={y % 1 === 0 ? "#d1d5db" : "#e5e7eb"}
                  strokeWidth={y % 1 === 0 ? 1 : 0.5}
                />
              ))}
            </g>

            {/* Bord */}
            {(() => {
              const wand = lokaal.bordWand;
              const len = lokaal.bord * scale;
              const dikte = 7;
              const horizontal = wand === "boven" || wand === "onder";
              const bx = horizontal
                ? toX((lokaal.breedte - lokaal.bord) / 2)
                : wand === "links" ? offsetX + 4 : offsetX + roomW - 4 - dikte;
              const by = horizontal
                ? wand === "boven" ? offsetY + 4 : offsetY + roomH - 4 - dikte
                : toY((lokaal.diepte - lokaal.bord) / 2);
              const bw = horizontal ? len : dikte;
              const bh = horizontal ? dikte : len;
              const lx = horizontal ? toX(lokaal.breedte / 2) : wand === "links" ? offsetX + 18 : offsetX + roomW - 18;
              const ly = horizontal ? by + (wand === "boven" ? 20 : -8) : toY(lokaal.diepte / 2);
              const rot = horizontal ? 0 : -90;
              return (
                <>
                  <rect x={bx} y={by} width={bw} height={bh} rx={2} fill="#374151" clipPath="url(#plaatsen-room-clip)" />
                  <text
                    x={lx} y={ly}
                    textAnchor="middle"
                    fontSize={9}
                    fill="#6b7280"
                    transform={rot ? `rotate(${rot},${lx},${ly})` : undefined}
                    clipPath="url(#plaatsen-room-clip)"
                  >
                    bord ({lokaal.bord}m)
                  </text>
                </>
              );
            })()}

            <rect x={offsetX} y={offsetY} width={roomW} height={roomH} fill="none" stroke="#6b7280" strokeWidth={2} />

            {Array.from({ length: Math.floor(lokaal.breedte) + 1 }, (_, i) => i).map(m => (
              <text key={`xl${m}`} x={toX(m)} y={offsetY - 10} textAnchor="middle" fontSize={10} fill="#9ca3af">
                {m}m
              </text>
            ))}
            {Array.from({ length: Math.floor(lokaal.diepte) + 1 }, (_, i) => i).map(m => (
              <text key={`yl${m}`} x={offsetX - 7} y={toY(m) + 4} textAnchor="end" fontSize={10} fill="#9ca3af">
                {m}m
              </text>
            ))}

            {/* Tafels */}
            <g clipPath="url(#plaatsen-room-clip)">
              {tafels.map(t => {
                const { w: ew, h: eh } = eff(t);
                const sx = toX(t.x);
                const sy = toY(t.y);
                const sw = ew * scale;
                const sh = eh * scale;
                const isSelected = selectedId === t.id;
                const cs = CHAIR_H * scale;
                const cx = sx + sw / 2;
                const cy = sy + sh / 2;
                const fontSize = Math.max(8, Math.min(12, Math.min(sw, sh) / 3.5));

                const chairProps = (() => {
                  const gap = 3;
                  if (t.rotation === 0)   return { x: sx + sw * 0.15, y: sy + sh + gap, width: sw * 0.7, height: cs };
                  if (t.rotation === 90)  return { x: sx + sw + gap,   y: sy + sh * 0.15, width: cs, height: sh * 0.7 };
                  if (t.rotation === 180) return { x: sx + sw * 0.15, y: sy - gap - cs,  width: sw * 0.7, height: cs };
                  return                         { x: sx - gap - cs,   y: sy + sh * 0.15, width: cs, height: sh * 0.7 };
                })();

                return (
                  <g
                    key={t.id}
                    style={{ cursor: "grab" }}
                    onMouseDown={e => startDrag(e, t.id)}
                    onTouchStart={e => startDrag(e, t.id)}
                    onClick={e => { e.stopPropagation(); setSelectedId(t.id); }}
                  >
                    <rect {...chairProps} rx={3} fill={isSelected ? "#fcd34d" : "#bfdbfe"} opacity={0.85} />
                    <rect
                      x={sx} y={sy} width={sw} height={sh}
                      rx={4}
                      fill={isSelected ? "#fef3c7" : "#dbeafe"}
                      stroke={isSelected ? "#f59e0b" : "#60a5fa"}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                    />
                    {t.naam && (
                      <text
                        x={cx} y={cy + fontSize * 0.35}
                        textAnchor="middle"
                        fontSize={fontSize}
                        fontWeight="600"
                        fill={isSelected ? "#92400e" : "#1d4ed8"}
                      >
                        {t.naam}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          </svg>
        )}
      </div>
    </div>
  );
};

export default PlaatsenTool;
