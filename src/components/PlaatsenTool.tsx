import { useState, useEffect, useRef, useCallback } from "react";
import { X, Plus, RotateCw, Trash2 } from "lucide-react";

const SUPABASE_URL = "https://fxcsqxshjnxlknnmfsbv.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4Y3NxeHNoam54bGtubm1mc2J2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMzQwNTgsImV4cCI6MjA5MzcxMDA1OH0.MVp882LWEZVMW33l1Ld94BnFbvCrIzStq02-9ylpYnc";
const H = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" };

const PAD = 44;
const DESK_W = 0.65;
const DESK_H = 0.45;
const CHAIR_H = 0.20;
const SNAP = 0.05;
const DESK_SNAP = 0.15;

type Tafel = { id: string; x: number; y: number; w: number; h: number; naam: string };
type Wand = "boven" | "onder" | "links" | "rechts";
type Lokaal = { breedte: number; diepte: number; bord: number; bordWand: Wand };
type DragInfo = { id: string; startMouseX: number; startMouseY: number; startX: number; startY: number };

const snapTo = (v: number) => Math.round(v / SNAP) * SNAP;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const uid = () => Math.random().toString(36).slice(2, 9);

const DEFAULT_LOKAAL: Lokaal = { breedte: 9, diepte: 7, bord: 4, bordWand: "boven" };

async function fetchFromSupabase(): Promise<{ lokaal: Lokaal; tafels: Tafel[] } | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/plaatsen?id=eq.1`, { headers: H });
    const rows = await res.json();
    if (Array.isArray(rows) && rows.length > 0) {
      const lok = rows[0].lokaal ?? DEFAULT_LOKAAL;
      if (lok.bord == null) lok.bord = DEFAULT_LOKAAL.bord;
      if (lok.bordWand == null) lok.bordWand = DEFAULT_LOKAAL.bordWand;
      return { lokaal: lok, tafels: rows[0].tafels ?? [] };
    }
  } catch {}
  return null;
}

async function saveToSupabase(lokaal: Lokaal, tafels: Tafel[]) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/plaatsen`, {
      method: "POST",
      headers: { ...H, Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({ id: 1, lokaal, tafels }),
    });
  } catch {}
}

const PlaatsenTool = ({ onClose }: { onClose: () => void }) => {
  const [tafels, setTafels] = useState<Tafel[]>([]);
  const [lokaal, setLokaal] = useState<Lokaal>(DEFAULT_LOKAAL);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [svgSize, setSvgSize] = useState({ w: 800, h: 600 });
  const [breedte, setBreedte] = useState("9");
  const [diepte, setDiepte] = useState("7");
  const [bord, setBord] = useState("4");
  const [loading, setLoading] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const lokaalRef = useRef(lokaal);
  const scaleRef = useRef(1);
  const tabelsRef = useRef(tafels);
  const dragRef = useRef<DragInfo | null>(null);
  const initialLoad = useRef(true);

  useEffect(() => { lokaalRef.current = lokaal; }, [lokaal]);
  useEffect(() => { tabelsRef.current = tafels; }, [tafels]);

  // Load from Supabase on mount
  useEffect(() => {
    fetchFromSupabase().then(data => {
      const s = data ?? { lokaal: DEFAULT_LOKAAL, tafels: [] };
      setTafels(s.tafels);
      setLokaal(s.lokaal);
      setBreedte(String(s.lokaal.breedte));
      setDiepte(String(s.lokaal.diepte));
      setBord(String(s.lokaal.bord));
      setLoading(false);
    });
  }, []);

  // Debounced save to Supabase on every change (skip first render)
  useEffect(() => {
    if (initialLoad.current) { initialLoad.current = false; return; }
    if (loading) return;
    const timer = setTimeout(() => saveToSupabase(lokaal, tafels), 1200);
    return () => clearTimeout(timer);
  }, [lokaal, tafels, loading]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
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

    const rawX = clamp(info.startX + (clientX - info.startMouseX) / sc, 0, lok.breedte - tafel.w);
    const rawY = clamp(info.startY + (clientY - info.startMouseY) / sc, 0, lok.diepte - tafel.h);

    // Grid snap as baseline
    let newX = snapTo(rawX);
    let newY = snapTo(rawY);

    // Desk-to-desk edge snapping (overrides grid snap when close enough)
    const others = tabelsRef.current.filter(t => t.id !== info.id);
    let bestDx = DESK_SNAP;
    let bestDy = DESK_SNAP;
    let snapX: number | null = null;
    let snapY: number | null = null;

    for (const o of others) {
      const d1 = Math.abs(rawX - (o.x + o.w));
      if (d1 < bestDx) { bestDx = d1; snapX = o.x + o.w; }
      const d2 = Math.abs(rawX + tafel.w - o.x);
      if (d2 < bestDx) { bestDx = d2; snapX = o.x - tafel.w; }
      const d3 = Math.abs(rawY - (o.y + o.h));
      if (d3 < bestDy) { bestDy = d3; snapY = o.y + o.h; }
      const d4 = Math.abs(rawY + tafel.h - o.y);
      if (d4 < bestDy) { bestDy = d4; snapY = o.y - tafel.h; }
    }

    if (snapX !== null) newX = snapX;
    if (snapY !== null) newY = snapY;

    newX = clamp(newX, 0, lok.breedte - tafel.w);
    newY = clamp(newY, 0, lok.diepte - tafel.h);

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
    const newTafel: Tafel = { id: uid(), x, y, w: DESK_W, h: DESK_H, naam: "" };
    setTafels(prev => [...prev, newTafel]);
    setSelectedId(newTafel.id);
  };

  const rotateTafel = (id: string) => {
    setTafels(prev => prev.map(t => {
      if (t.id !== id) return t;
      const newW = t.h;
      const newH = t.w;
      return {
        ...t,
        w: newW,
        h: newH,
        x: clamp(t.x, 0, Math.max(0, lokaalRef.current.breedte - newW)),
        y: clamp(t.y, 0, Math.max(0, lokaalRef.current.diepte - newH)),
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
  // Center the room in the canvas
  const offsetX = Math.max(PAD, (svgSize.w - roomW) / 2);
  const offsetY = Math.max(PAD, (svgSize.h - roomH) / 2);
  const toX = (m: number) => offsetX + m * scale;
  const toY = (m: number) => offsetY + m * scale;

  const vLines: number[] = [];
  const hLines: number[] = [];
  for (let x = 0; x <= lokaal.breedte + 0.01; x += 0.5) vLines.push(parseFloat(x.toFixed(1)));
  for (let y = 0; y <= lokaal.diepte + 0.01; y += 0.5) hLines.push(parseFloat(y.toFixed(1)));

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "hsl(334 10% 97%)" }}>
        <p className="text-muted-foreground">Indeling laden…</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden" style={{ background: "hsl(334 10% 97%)" }}>
      {/* Sidebar */}
      <aside className="flex w-72 shrink-0 flex-col border-r border-border bg-card">
        {/* Scrollable content */}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Klaslokaal</p>
              <h2 className="font-display text-xl font-semibold">Plaatsen</h2>
            </div>
            <button onClick={onClose} className="rounded-xl border border-border p-2 transition-smooth hover:border-accent">
              <X className="h-4 w-4" />
            </button>
          </div>

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
            className="flex items-center gap-2 rounded-2xl border border-border bg-background/60 p-4 text-sm font-semibold transition-smooth hover:border-accent hover:bg-accent/5"
          >
            <Plus className="h-4 w-4 text-accent" />
            Tafel toevoegen
          </button>

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
                  <RotateCw className="h-3.5 w-3.5" /> Draaien
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

        {/* Fixed bottom: delete all */}
        <div className="shrink-0 border-t border-border p-4">
          <button
            onClick={() => { setTafels([]); setSelectedId(null); }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50/50 p-3 text-sm font-semibold text-red-500 transition-smooth hover:bg-red-100 hover:border-red-400"
          >
            <Trash2 className="h-4 w-4" /> Alle tafels verwijderen
          </button>
        </div>
      </aside>

      {/* SVG canvas */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden"
        onClick={() => setSelectedId(null)}
      >
        <svg width={svgSize.w} height={svgSize.h} style={{ display: "block" }}>
          <defs>
            <clipPath id="plaatsen-room-clip">
              <rect x={offsetX} y={offsetY} width={roomW} height={roomH} />
            </clipPath>
          </defs>

          {/* Room floor */}
          <rect x={offsetX} y={offsetY} width={roomW} height={roomH} fill="white" />

          {/* Grid */}
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

          {/* Room border */}
          <rect x={offsetX} y={offsetY} width={roomW} height={roomH} fill="none" stroke="#6b7280" strokeWidth={2} />

          {/* Axis labels */}
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

          {/* Desks */}
          <g clipPath="url(#plaatsen-room-clip)">
            {tafels.map(t => {
              const sx = toX(t.x);
              const sy = toY(t.y);
              const sw = t.w * scale;
              const sh = t.h * scale;
              const isSelected = selectedId === t.id;
              const chairH = CHAIR_H * scale;
              const fontSize = Math.max(8, Math.min(12, sw / 5.5));

              return (
                <g
                  key={t.id}
                  style={{ cursor: "grab" }}
                  onMouseDown={e => startDrag(e, t.id)}
                  onTouchStart={e => startDrag(e, t.id)}
                  onClick={e => { e.stopPropagation(); setSelectedId(t.id); }}
                >
                  {/* Chair */}
                  <rect
                    x={sx + sw * 0.15}
                    y={sy + sh + 3}
                    width={sw * 0.7}
                    height={chairH}
                    rx={3}
                    fill={isSelected ? "#fcd34d" : "#bfdbfe"}
                    opacity={0.85}
                  />
                  {/* Desk top */}
                  <rect
                    x={sx} y={sy} width={sw} height={sh}
                    rx={4}
                    fill={isSelected ? "#fef3c7" : "#dbeafe"}
                    stroke={isSelected ? "#f59e0b" : "#60a5fa"}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                  />
                  {/* Name label */}
                  {t.naam && (
                    <text
                      x={sx + sw / 2}
                      y={sy + sh / 2 + fontSize * 0.35}
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
      </div>
    </div>
  );
};

export default PlaatsenTool;
