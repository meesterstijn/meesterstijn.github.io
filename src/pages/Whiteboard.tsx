import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { createPortal } from "react-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { Eraser, Trash2, BookOpen, Play, Pause, RotateCcw, Plus, Minus, Hourglass, X, Type, Image as ImageIcon, Upload, Wrench, Hand, Sprout } from "lucide-react";
import { PlantSVG, randomVariant, type PlantVariant } from "@/components/PlantSVG";

const fetchPlantCount = async (): Promise<number> => {
  const { data } = await supabase.from("counters").select("value").eq("id", 1).single();
  return data?.value ?? 0;
};
const incrementPlantCount = async (): Promise<number> => {
  const current = await fetchPlantCount();
  const next = current + 1;
  await supabase.from("counters").update({ value: next }).eq("id", 1);
  return next;
};
const insertFlower = async (variant: number) => {
  await supabase.from("flowers").insert({ variant });
};

const COLORS = ["#4682B4", "#10B981", "#F49E4C", "#AB3428", "#7C3AED", "#000000", "#ffffff"];
const SIZES = [3, 6, 12, 20];
const ERASER_RADIUS = 28;
const LINE_SPACING = 52;
const MARGIN_X = 180;

type Tool = "pen" | "eraser";
type Point = { x: number; y: number };
type Stroke = { color: string; size: number; points: Point[] };
type Light = "rood" | "oranje" | "groen";

const LIGHTS: { color: Light; bg: string; glow: string; label: string }[] = [
  { color: "rood",   bg: "#ef4444", glow: "0 0 40px 10px #ef444488", label: "Je werkt stil. Even geen vragen aan de meester." },
  { color: "oranje", bg: "#f97316", glow: "0 0 40px 10px #f9731688", label: "Je werkt stil. Stel je vraag alleen aan de meester." },
  { color: "groen",  bg: "#22c55e", glow: "0 0 40px 10px #22c55e88", label: "Met een fluisterstem samenwerken met schoudermaatje." },
];

// ─── helpers ─────────────────────────────────────────────────────────────────

const distToSegment = (p: Point, a: Point, b: Point) => {
  const dx = b.x - a.x, dy = b.y - a.y;
  if (dx === 0 && dy === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
};

const strokeHit = (stroke: Stroke, pos: Point, radius: number) => {
  const pts = stroke.points;
  if (pts.length === 1) return Math.hypot(pts[0].x - pos.x, pts[0].y - pos.y) < radius + stroke.size / 2;
  for (let i = 0; i < pts.length - 1; i++)
    if (distToSegment(pos, pts[i], pts[i + 1]) < radius + stroke.size / 2) return true;
  return false;
};

const drawBackground = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, lined: boolean) => {
  if (lined) {
    ctx.fillStyle = "#f9f9f9";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#aac5d8";
    ctx.lineWidth = 1.5;
    for (let y = LINE_SPACING * 2; y < canvas.height; y += LINE_SPACING) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }
    ctx.strokeStyle = "#e07070";
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(MARGIN_X, 0); ctx.lineTo(MARGIN_X, canvas.height); ctx.stroke();
  } else {
    ctx.fillStyle = "#faf9f7";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
};

// ─── DraggableWidget ─────────────────────────────────────────────────────────

type Pos = { x: number; y: number };

const DraggableWidget = ({
  children, initialPos, onClose, title,
}: {
  children: React.ReactNode;
  initialPos: Pos;
  onClose: () => void;
  title: string;
}) => {
  const [pos, setPos] = useState(initialPos);
  const drag = useRef<{ mx: number; my: number; ox: number; oy: number } | null>(null);

  const beginDrag = (clientX: number, clientY: number) => {
    drag.current = { mx: clientX, my: clientY, ox: pos.x, oy: pos.y };
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!drag.current) return;
      const cx = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const cy = "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      setPos({ x: drag.current.ox + cx - drag.current.mx, y: drag.current.oy + cy - drag.current.my });
    };
    const onUp = () => {
      drag.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onUp);
  };

  return (
    <div
      style={{ position: "absolute", left: pos.x, top: pos.y, zIndex: 20, userSelect: "none", minWidth: 220 }}
      onMouseDown={e => e.stopPropagation()}
      onTouchStart={e => e.stopPropagation()}
    >
      <div className="rounded-3xl border border-border bg-card shadow-tile overflow-hidden">
        <div
          className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2 cursor-grab active:cursor-grabbing"
          onMouseDown={e => { e.stopPropagation(); beginDrag(e.clientX, e.clientY); }}
          onTouchStart={e => { e.stopPropagation(); beginDrag(e.touches[0].clientX, e.touches[0].clientY); }}
        >
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{title}</span>
          <button onClick={onClose} className="ml-3 rounded-full p-1 transition-smooth hover:bg-border">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ─── StoplichtContent ─────────────────────────────────────────────────────────

const StoplichtContent = () => {
  const [active, setActive] = useState<Light | null>(null);
  return (
    <div className="flex flex-col items-center gap-4 p-5">
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-zinc-900 px-6 py-5">
        {LIGHTS.map(l => (
          <button
            key={l.color}
            onClick={() => setActive(a => a === l.color ? null : l.color)}
            className="h-16 w-16 rounded-full transition-all duration-300"
            style={{
              backgroundColor: active === l.color ? l.bg : "#3f3f46",
              boxShadow: active === l.color ? l.glow : "none",
            }}
          />
        ))}
      </div>
      <p className="max-w-[200px] text-center text-sm font-semibold">
        {active
          ? LIGHTS.find(l => l.color === active)?.label
          : <span className="text-muted-foreground font-normal">Klik op een lamp</span>}
      </p>
    </div>
  );
};

// ─── TimerContent ─────────────────────────────────────────────────────────────

const TimerContent = () => {
  const [totalSec, setTotalSec] = useState(5 * 60);
  const [seconds, setSeconds] = useState(5 * 60);
  const [running, setRunning] = useState(false);
  const [showPlant, setShowPlant] = useState(false);
  const [variant, setVariant] = useState<PlantVariant>(randomVariant);
  const [plantCount, setPlantCount] = useState<number | null>(null);
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);
  const counted = useRef(false);
  const showPlantRef = useRef(false);

  useEffect(() => { fetchPlantCount().then(setPlantCount); }, []);

  useEffect(() => {
    if (running && seconds > 0) {
      counted.current = false;
      interval.current = setInterval(() => setSeconds(s => s - 1), 1000);
    } else {
      if (interval.current) clearInterval(interval.current);
      if (seconds === 0 && !counted.current) {
        counted.current = true;
        setRunning(false);
        incrementPlantCount().then(setPlantCount);
        if (showPlantRef.current) insertFlower(variant);
      }
    }
    return () => { if (interval.current) clearInterval(interval.current); };
  }, [running, seconds]);

  const adjust = (delta: number) => {
    if (running) return;
    const next = Math.max(60, totalSec + delta);
    setTotalSec(next);
    setSeconds(next);
  };

  const togglePlant = () => {
    const next = !showPlant;
    setShowPlant(next);
    showPlantRef.current = next;
    if (next) setVariant(randomVariant());
  };

  const reset = () => { setRunning(false); setSeconds(totalSec); setVariant(randomVariant()); };
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const pct = totalSec > 0 ? seconds / totalSec : 0;
  const progress = 1 - pct;
  const danger = seconds <= 60 && seconds > 0;
  const done = seconds === 0;
  const C = 2 * Math.PI * 44;

  return (
    <div className="flex flex-col items-center gap-4 p-5">
      <div className="relative h-40 w-40">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="4" className="text-border" />
          <circle
            cx="50" cy="50" r="44" fill="none"
            stroke={done ? "#22c55e" : danger ? "#ef4444" : "currentColor"}
            strokeWidth="4" strokeLinecap="round"
            strokeDasharray={`${C}`}
            strokeDashoffset={`${C * (1 - pct)}`}
            className={done ? "" : danger ? "" : "text-accent"}
            style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-display text-3xl font-bold tabular-nums ${done ? "text-green-500" : danger ? "text-red-500" : ""}`}>
            {fmt(seconds)}
          </span>
          {done && <span className="mt-1 text-xs font-semibold text-green-500">Klaar!</span>}
        </div>
      </div>

      {!running && (
        <div className="flex items-center gap-3">
          <button onClick={() => adjust(-60)} className="rounded-xl border border-border p-2 transition-smooth hover:border-accent hover:text-accent">
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-12 text-center text-xs text-muted-foreground">1 min</span>
          <button onClick={() => adjust(60)} className="rounded-xl border border-border p-2 transition-smooth hover:border-accent hover:text-accent">
            <Plus className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => setRunning(r => !r)}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-smooth hover:opacity-90"
        >
          {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {running ? "Pauzeer" : "Start"}
        </button>
        <button onClick={reset} className="rounded-xl border border-border p-2 transition-smooth hover:border-accent hover:text-accent">
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          onClick={togglePlant}
          className={`rounded-xl border p-2 transition-smooth hover:border-accent ${showPlant ? "border-primary bg-primary/10 text-primary" : "border-border"}`}
        >
          <Sprout className="h-4 w-4" />
        </button>
      </div>

      {showPlant && (
        <div className="flex flex-col items-center gap-2 border-t border-border pt-3 w-full">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            {done ? "Volgroeid! 🌸" : progress < 0.01 ? "Zaadje 🌱" : "Groeit…"}
          </p>
          <div style={{ width: 100, height: 132 }}>
            <PlantSVG progress={progress} variant={variant} />
          </div>
          <p className="text-center text-xs text-muted-foreground">
            {done ? "Prachtig!" : running ? "Blijf gefocust!" : "Start de timer."}
          </p>
          {plantCount !== null && (
            <p className="text-center text-xs text-muted-foreground">
              🌸 {plantCount} plantje{plantCount === 1 ? "" : "s"} volgroeid
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// ─── TekstContent ─────────────────────────────────────────────────────────────

const tekstPresets = [
  { label: "Goedemorgen", text: "Wat fijn dat jij er bent.\nOm half 9 gaan we beginnen met stillezen." },
  { label: "Klaar?",      text: "Ben je klaar? Dan: " },
];

const TekstContent = () => {
  const [text, setText] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  }, [text]);

  return (
    <div className="flex flex-col gap-3 p-4" style={{ width: 280 }}>
      <div className="flex flex-wrap gap-2">
        {tekstPresets.map(p => (
          <button
            key={p.label}
            onClick={() => setText(p.text)}
            className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium transition-smooth hover:border-accent hover:text-accent"
          >
            {p.label}
          </button>
        ))}
      </div>
      <textarea
        ref={ref}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Typ hier…"
        rows={3}
        className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 outline-none focus:border-accent overflow-hidden"
        style={{ fontSize: 16, lineHeight: 1.3, minHeight: 80, maxHeight: 320, overflowY: "auto" }}
      />
    </div>
  );
};

// ─── Rekenmachine ─────────────────────────────────────────────────────────────

const CalcContent = () => {
  const [display, setDisplay] = useState("0");
  const [stored, setStored] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [fresh, setFresh] = useState(true);

  const compute = (a: number, b: number, o: string) => {
    if (o === "+") return a + b;
    if (o === "−") return a - b;
    if (o === "×") return a * b;
    if (o === "÷") return b !== 0 ? a / b : NaN;
    return b;
  };
  const fmt = (n: number) => {
    const s = String(parseFloat(n.toPrecision(10)));
    return s;
  };
  const handle = (b: string) => {
    if (b === "C") { setDisplay("0"); setStored(null); setOp(null); setFresh(true); return; }
    if (b === "±") { setDisplay(d => d.startsWith("-") ? d.slice(1) : "-" + d); return; }
    if (b === "%") { setDisplay(d => String(parseFloat(d) / 100)); return; }
    if ("0123456789".includes(b)) {
      setDisplay(d => fresh ? b : d === "0" ? b : d + b);
      setFresh(false); return;
    }
    if (b === ".") {
      setDisplay(d => fresh ? "0." : d.includes(".") ? d : d + ".");
      setFresh(false); return;
    }
    if (["+", "−", "×", "÷"].includes(b)) {
      const cur = parseFloat(display);
      if (stored !== null && op && !fresh) {
        const res = compute(stored, cur, op);
        setDisplay(fmt(res)); setStored(res);
      } else { setStored(cur); }
      setOp(b); setFresh(true); return;
    }
    if (b === "=") {
      if (stored === null || !op) return;
      const res = compute(stored, parseFloat(display), op);
      setDisplay(fmt(res)); setStored(null); setOp(null); setFresh(true);
    }
  };
  const rows = [["C","±","%","÷"],["7","8","9","×"],["4","5","6","−"],["1","2","3","+"],[null,"0",".","="]];
  return (
    <div className="p-4" style={{ width: 240 }}>
      <div className="mb-3 rounded-xl bg-muted/30 px-4 py-2 text-right">
        {stored !== null && op && <div className="text-xs text-muted-foreground">{stored} {op}</div>}
        <div className="font-display text-2xl font-bold tabular-nums truncate">{display}</div>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {rows.flat().map((b, i) => (
          <button key={i} onClick={() => b && handle(b)}
            className={`rounded-xl py-3 text-sm font-semibold transition-smooth ${!b ? "" : b === "=" ? "bg-primary text-primary-foreground hover:opacity-90 col-span-1" : b === "C" ? "bg-destructive/10 text-destructive hover:bg-destructive/20" : ["+","−","×","÷","%","±"].includes(b) ? "bg-accent/10 text-accent hover:bg-accent/20" : "border border-border hover:border-accent"}`}
            style={{ gridColumn: b === null ? "span 1" : undefined }}
          >{b ?? ""}</button>
        ))}
      </div>
    </div>
  );
};

// ─── Metriek stelsel ──────────────────────────────────────────────────────────

const MetriekTrap = ({ title, units, factor }: { title: string; units: string[]; factor: number }) => (
  <div className="p-4" style={{ width: 420 }}>
    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
    <div className="flex items-end gap-1">
      {units.map((u, i) => (
        <div key={u} className="flex flex-1 flex-col items-center">
          <div
            className="flex w-full items-center justify-center rounded-t-lg text-xs font-bold text-primary-foreground"
            style={{ height: (units.length - i) * 26, backgroundColor: `hsl(177 12% ${22 + i * 6}%)` }}
          >
            {u}
          </div>
        </div>
      ))}
    </div>
    <div className="mt-2 flex justify-between px-1 text-[11px] font-medium text-muted-foreground">
      <span>÷ {factor} ←</span>
      <span>→ × {factor}</span>
    </div>
  </div>
);

// ─── Geld ─────────────────────────────────────────────────────────────────────

const geldUid = () => Math.random().toString(36).slice(2, 9);

type WorkspaceItem = { id: string; kind: "biljet" | "munt"; v: number; x: number; y: number };
type DragState    = { kind: "biljet" | "munt"; v: number; x: number; y: number; offX: number; offY: number };

const BILJETTEN = [
  { v: 500, bg: "#7c4fa0" },
  { v: 200, bg: "#c8890a" },
  { v: 100, bg: "#2e8b4e" },
  { v: 50,  bg: "#d4660a" },
  { v: 20,  bg: "#2563a8" },
  { v: 10,  bg: "#b82020" },
  { v: 5,   bg: "#5a7a5a" },
];
const MUNTEN = [
  { v: 2,    label: "€2",   copper: false, biMetal: true  },
  { v: 1,    label: "€1",   copper: false, biMetal: true  },
  { v: 0.5,  label: "50ct", copper: false, biMetal: false },
  { v: 0.2,  label: "20ct", copper: false, biMetal: false },
  { v: 0.1,  label: "10ct", copper: false, biMetal: false },
  { v: 0.05, label: "5ct",  copper: true,  biMetal: false },
];

const BiljetImg = ({ v, bg }: { v: number; bg: string }) => (
  <svg viewBox="0 0 90 46" width="90" height="46" style={{ display: "block", flexShrink: 0, borderRadius: 4 }}>
    <rect width="90" height="46" rx="4" fill={bg} />
    {/* inner frame */}
    <rect x="2" y="2" width="86" height="42" rx="3" fill="none" stroke="white" strokeOpacity="0.25" strokeWidth="1" />
    {/* arch / window motif left */}
    <rect x="6" y="8" width="16" height="22" rx="8 8 2 2" fill="none" stroke="white" strokeOpacity="0.35" strokeWidth="1.2" />
    <rect x="9" y="22" width="10" height="8" rx="1" fill="none" stroke="white" strokeOpacity="0.2" strokeWidth="0.8" />
    {/* EU stars */}
    {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => {
      const a = (i * 30 - 90) * Math.PI / 180;
      return <circle key={i} cx={14 + 10 * Math.cos(a)} cy={38 + 4 * Math.sin(a)} r="0.8" fill="gold" fillOpacity="0.7" />;
    })}
    {/* denomination */}
    <text x="62" y="30" fontFamily="Georgia,serif" fontSize="20" fontWeight="bold" fill="white" textAnchor="middle">€{v}</text>
    <text x="62" y="41" fontFamily="sans-serif" fontSize="5.5" fill="white" fillOpacity="0.55" textAnchor="middle" letterSpacing="1">EURO</text>
  </svg>
);

const MuntImg = ({ v, label, copper, biMetal }: { v: number; label: string; copper: boolean; biMetal: boolean }) => {
  const rim   = copper ? "#7a3a10" : biMetal && v === 2 ? "#7a7830" : "#7a5a0a";
  const face  = copper ? "#c46a28" : "#c9a020";
  const inner = "#d4d0c0";
  const textColor = biMetal && v === 2 ? "#5a4800" : "white";
  const fontSize  = v >= 1 ? 9 : v >= 0.1 ? 8 : 7;
  return (
    <svg viewBox="0 0 44 44" width="44" height="44" style={{ display: "block", flexShrink: 0 }}>
      <circle cx="22" cy="22" r="21" fill={rim} />
      <circle cx="22" cy="22" r="19" fill={face} />
      {biMetal && v === 2 && <circle cx="22" cy="22" r="12" fill={inner} />}
      {biMetal && v === 1 && (
        <>
          <circle cx="22" cy="22" r="19" fill="#c9a020" />
          <circle cx="22" cy="22" r="12" fill={face} />
        </>
      )}
      <circle cx="22" cy="22" r="19" fill="none" stroke="white" strokeOpacity="0.18" strokeWidth="1" />
      {/* EU stars ring */}
      {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => {
        const a = (i * 30 - 90) * Math.PI / 180;
        return <circle key={i} cx={22 + 16 * Math.cos(a)} cy={22 + 16 * Math.sin(a)} r="0.9" fill="gold" fillOpacity="0.6" />;
      })}
      <text x="22" y="26" fontFamily="sans-serif" fontSize={fontSize} fontWeight="bold" fill={textColor} textAnchor="middle">{label}</text>
    </svg>
  );
};

const WorkspaceMoneyItem = ({ item, onRemove, onMove }: {
  item: WorkspaceItem;
  onRemove: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
}) => {
  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const ox = e.clientX - item.x;
    const oy = e.clientY - item.y;
    const onPMove = (ev: PointerEvent) => onMove(item.id, ev.clientX - ox, ev.clientY - oy);
    const onPUp   = () => { window.removeEventListener("pointermove", onPMove); window.removeEventListener("pointerup", onPUp); };
    window.addEventListener("pointermove", onPMove);
    window.addEventListener("pointerup", onPUp);
  };
  const biljet = BILJETTEN.find(b => b.v === item.v);
  const munt   = MUNTEN.find(m => m.v === item.v);
  return (
    <div
      style={{ position: "absolute", left: item.x, top: item.y, touchAction: "none", userSelect: "none", cursor: "grab" }}
      onPointerDown={handlePointerDown}
      onDoubleClick={e => { e.stopPropagation(); onRemove(item.id); }}
    >
      {item.kind === "biljet" && biljet
        ? <BiljetImg v={item.v} bg={biljet.bg} />
        : munt ? <MuntImg v={item.v} label={munt.label} copper={munt.copper} biMetal={munt.biMetal} /> : null}
    </div>
  );
};

const GeldContent = () => {
  const [items,    setItems]    = useState<WorkspaceItem[]>([]);
  const [dragging, setDragging] = useState<DragState | null>(null);
  const wsRef  = useRef<HTMLDivElement>(null);
  const total  = items.reduce((s, i) => s + i.v, 0);

  const onMove   = (id: string, x: number, y: number) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, x, y } : i));
  const onRemove = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const startPickerDrag = (e: React.PointerEvent, kind: "biljet" | "munt", v: number, offX: number, offY: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging({ kind, v, x: e.clientX - offX, y: e.clientY - offY, offX, offY });
    const onPMove = (ev: PointerEvent) =>
      setDragging(d => d ? { ...d, x: ev.clientX - offX, y: ev.clientY - offY } : null);
    const onPUp = (ev: PointerEvent) => {
      if (wsRef.current) {
        const rect = wsRef.current.getBoundingClientRect();
        if (ev.clientX >= rect.left && ev.clientX <= rect.right &&
            ev.clientY >= rect.top  && ev.clientY <= rect.bottom) {
          setItems(prev => [...prev, {
            id: geldUid(), kind, v,
            x: ev.clientX - rect.left - offX,
            y: ev.clientY - rect.top  - offY,
          }]);
        }
      }
      setDragging(null);
      window.removeEventListener("pointermove", onPMove);
      window.removeEventListener("pointerup",   onPUp);
    };
    window.addEventListener("pointermove", onPMove);
    window.addEventListener("pointerup",   onPUp);
  };

  const ghostBiljet = dragging?.kind === "biljet" ? BILJETTEN.find(b => b.v === dragging.v) : null;
  const ghostMunt   = dragging?.kind === "munt"   ? MUNTEN.find(m => m.v === dragging.v)    : null;

  return (
    <>
    <div style={{ display: "flex", width: 760, height: 440 }}>
      {/* Picker — biljetten */}
      <div style={{ width: 120, padding: "12px 8px", borderRight: "1px solid var(--border)", overflowY: "auto", flexShrink: 0 }}>
        <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--muted-foreground)", marginBottom: 8 }}>Biljetten</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {BILJETTEN.map(b => (
            <div key={b.v} style={{ cursor: "grab", touchAction: "none", userSelect: "none" }}
              onPointerDown={e => startPickerDrag(e, "biljet", b.v, 45, 23)}>
              <BiljetImg v={b.v} bg={b.bg} />
            </div>
          ))}
        </div>
      </div>

      {/* Picker — munten */}
      <div style={{ width: 68, padding: "12px 8px", borderRight: "1px solid var(--border)", overflowY: "auto", flexShrink: 0 }}>
        <p style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--muted-foreground)", marginBottom: 8 }}>Munten</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {MUNTEN.map(m => (
            <div key={m.v} style={{ cursor: "grab", touchAction: "none", userSelect: "none" }}
              onPointerDown={e => startPickerDrag(e, "munt", m.v, 22, 22)}>
              <MuntImg v={m.v} label={m.label} copper={m.copper} biMetal={m.biMetal} />
            </div>
          ))}
        </div>
      </div>

      {/* Werkblad */}
      <div ref={wsRef} style={{ flex: 1, position: "relative", background: "#faf9f7", overflow: "hidden" }}>
        {items.length === 0 && !dragging && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted-foreground)", fontSize: 13, pointerEvents: "none" }}>
            Sleep geld hierheen
          </div>
        )}
        {items.map(item => (
          <WorkspaceMoneyItem key={item.id} item={item} onRemove={onRemove} onMove={onMove} />
        ))}
        {items.length > 0 && (
          <>
            <div style={{ position: "absolute", bottom: 12, right: 12, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "6px 14px", display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Totaal</span>
              <span style={{ fontSize: 18, fontWeight: 700 }}>€ {total.toFixed(2)}</span>
              <button onClick={() => setItems([])} style={{ fontSize: 11, color: "var(--muted-foreground)", cursor: "pointer", background: "none", border: "none" }}>Wis</button>
            </div>
            <div style={{ position: "absolute", top: 8, right: 10, fontSize: 10, color: "var(--muted-foreground)", pointerEvents: "none" }}>
              Dubbelklik om te verwijderen
            </div>
          </>
        )}
      </div>
    </div>

    {/* Sleepghost — gerenderd buiten de widget zodat hij niet wordt afgeknipt */}
    {dragging && createPortal(
      <div style={{
        position: "fixed", left: dragging.x, top: dragging.y,
        pointerEvents: "none", zIndex: 9999,
        opacity: 0.88,
        transform: "scale(1.08) rotate(3deg)",
        filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.3))",
        transition: "transform 0.05s",
      }}>
        {ghostBiljet && <BiljetImg v={dragging.v} bg={ghostBiljet.bg} />}
        {ghostMunt   && <MuntImg v={dragging.v} label={ghostMunt.label} copper={ghostMunt.copper} biMetal={ghostMunt.biMetal} />}
      </div>,
      document.body
    )}
    </>
  );
};

// ─── Verhoudingtabel ──────────────────────────────────────────────────────────

const VerhoudingContent = () => {
  const [rows, setRows] = useState([
    ["1","2","3","4","5",""],
    [ "","","","","",""],
  ]);
  const update = (r: number, c: number, val: string) =>
    setRows(prev => prev.map((row, ri) => ri === r ? row.map((cell, ci) => ci === c ? val : cell) : row));
  const addCol = () => setRows(prev => prev.map(r => [...r, ""]));
  const removeCol = () => setRows(prev => prev[0].length > 2 ? prev.map(r => r.slice(0, -1)) : prev);
  const clear = () => setRows([Array(rows[0].length).fill(""), Array(rows[0].length).fill("")]);
  return (
    <div className="p-4" style={{ minWidth: 320 }}>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="border-collapse">
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} className={ri === 0 ? "bg-primary/5" : ""}>
                {row.map((cell, ci) => (
                  <td key={ci} className="border border-border p-0">
                    <input
                      value={cell}
                      onChange={e => update(ri, ci, e.target.value)}
                      className="w-14 px-2 py-2 text-center text-sm font-medium outline-none focus:bg-accent/5"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex gap-2">
        <button onClick={removeCol} className="rounded-xl border border-border px-3 py-1.5 text-xs font-medium hover:border-accent transition-smooth">− Kolom</button>
        <button onClick={addCol}    className="rounded-xl border border-border px-3 py-1.5 text-xs font-medium hover:border-accent transition-smooth">+ Kolom</button>
        <button onClick={clear}     className="ml-auto rounded-xl border border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-accent transition-smooth">Wissen</button>
      </div>
    </div>
  );
};

// ─── BeurtstokjesContent ──────────────────────────────────────────────────────

const BeurtstokjesContent = () => {
  const [leerlingen, setLeerlingen] = useState<string[]>([]);
  const [display, setDisplay]       = useState<string>("");
  const [gekozen, setGekozen]       = useState<string | null>(null);
  const [draaien, setDraaien]       = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    supabase.from("taakjes").select("leerlingen").eq("id", 1).single()
      .then(({ data }) => setLeerlingen(data?.leerlingen ?? []));
  }, []);

  const trek = () => {
    if (draaien || leerlingen.length === 0) return;
    setGekozen(null);
    setDraaien(true);
    const winnaar = leerlingen[Math.floor(Math.random() * leerlingen.length)];
    const pool = leerlingen.length > 1 ? leerlingen : [winnaar];
    let stap = 0;
    const stapMax = 15; // ~1 seconde totaal
    const volgende = () => {
      stap++;
      setDisplay(pool[Math.floor(Math.random() * pool.length)]);
      if (stap < stapMax) {
        const delay = 30 + Math.pow(stap / stapMax, 2) * 100;
        timerRef.current = setTimeout(volgende, delay);
      } else {
        setDisplay(winnaar);
        setGekozen(winnaar);
        setDraaien(false);
      }
    };
    volgende();
  };

  return (
    <div className="flex flex-col gap-3 p-4" style={{ width: 240 }}>
      {/* Naam display */}
      <div className="flex h-20 items-center justify-center rounded-2xl border border-border bg-background">
        {leerlingen.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center px-3">Voeg leerlingen toe via Taakjes of Beurtstokjes.</p>
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

      {/* Trek-knop */}
      <button
        onClick={trek}
        disabled={draaien || leerlingen.length === 0}
        className="rounded-xl bg-primary py-2 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90 disabled:opacity-40"
      >
        {draaien ? "…" : "Trek!"}
      </button>

    </div>
  );
};

// ─── Whiteboard ───────────────────────────────────────────────────────────────

const Whiteboard = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#4682B4");
  const [size, setSize] = useState(6);
  const [lined, setLinedState] = useState(false);
  const [showStoplicht, setShowStoplicht] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showTekst, setShowTekst] = useState(false);
  const [showFoto, setShowFoto] = useState(false);
  const [fotoUrl, setFotoUrl] = useState<string>("/edi1.webp");
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const [showOppervlakte, setShowOppervlakte] = useState(false);
  const [showInhoud, setShowInhoud] = useState(false);
  const [showGeld, setShowGeld] = useState(false);
  const [showBeurtstokjes, setShowBeurtstokjes] = useState(false);
  const [showVerhouding, setShowVerhouding] = useState(false);
  const [wijzerAan, setWijzerAan] = useState(false);
  const [wijzerPos, setWijzerPos] = useState({ x: 50, y: 50 });
  const fotoFileRef = useRef<HTMLInputElement>(null);
  const fotoAreaRef = useRef<HTMLDivElement>(null);

  const beginWijzerDrag = (clientX: number, clientY: number) => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      const area = fotoAreaRef.current;
      if (!area) return;
      const rect = area.getBoundingClientRect();
      const cx = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const cy = "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      setWijzerPos({
        x: Math.max(0, Math.min(100, ((cx - rect.left) / rect.width) * 100)),
        y: Math.max(0, Math.min(100, ((cy - rect.top) / rect.height) * 100)),
      });
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("touchend", onUp);
    onMove({ clientX, clientY } as MouseEvent);
  };
  const linedRef = useRef(false);
  const drawing = useRef(false);
  const strokes = useRef<Stroke[]>([]);
  const currentStroke = useRef<Stroke | null>(null);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement): Point => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const redraw = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    drawBackground(ctx, canvas, linedRef.current);
    for (const stroke of strokes.current) {
      if (stroke.points.length === 0) continue;
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (const p of stroke.points.slice(1)) ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    }
  };

  const saveStrokes = () => {
    try { sessionStorage.setItem("wb_strokes", JSON.stringify(strokes.current)); } catch {}
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    try {
      const saved = sessionStorage.getItem("wb_strokes");
      if (saved) {
        strokes.current = JSON.parse(saved);
        redraw(ctx, canvas);
        return;
      }
    } catch {}
    drawBackground(ctx, canvas, false);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const prevent = (e: TouchEvent) => e.preventDefault();
    canvas.addEventListener("touchstart", prevent, { passive: false });
    canvas.addEventListener("touchmove", prevent, { passive: false });
    return () => {
      canvas.removeEventListener("touchstart", prevent);
      canvas.removeEventListener("touchmove", prevent);
    };
  }, []);

  const toggleLined = () => {
    const next = !linedRef.current;
    linedRef.current = next;
    setLinedState(next);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    redraw(ctx, canvas);
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawing.current = true;
    const pos = getPos(e, canvas);
    if (tool === "pen") currentStroke.current = { color, size, points: [pos] };
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e, canvas);

    if (tool === "pen" && currentStroke.current) {
      const pts = currentStroke.current.points;
      const from = pts[pts.length - 1];
      pts.push(pos);
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = currentStroke.current.color;
      ctx.lineWidth = currentStroke.current.size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    } else if (tool === "eraser") {
      const before = strokes.current.length;
      strokes.current = strokes.current.filter(s => !strokeHit(s, pos, ERASER_RADIUS));
      if (strokes.current.length !== before) { redraw(ctx, canvas); saveStrokes(); }
    }
  };

  const stopDraw = () => {
    if (tool === "pen" && currentStroke.current && currentStroke.current.points.length > 0) {
      strokes.current.push(currentStroke.current);
      saveStrokes();
    }
    currentStroke.current = null;
    drawing.current = false;
  };

  const clear = () => {
    strokes.current = [];
    saveStrokes();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawBackground(ctx, canvas, linedRef.current);
  };

  return (
    <div className="overflow-hidden bg-paper bg-warm flex flex-col" style={{ height: "100dvh" }}>
      <SiteHeader />

      <main className="container pt-6 pb-20 flex flex-col flex-1 overflow-hidden">
        {/* Canvas wrapper — position:relative so overlays can be positioned inside */}
        <div
          className="animate-fade-up flex-1 rounded-3xl border border-border shadow-soft min-h-0"
          style={{ position: "relative", overflow: "hidden", animationDelay: "60ms" }}
        >
          <canvas
            ref={canvasRef}
            width={1600}
            height={900}
            className="h-full w-full touch-none"
            style={{ cursor: tool === "eraser" ? "cell" : "crosshair" }}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={stopDraw}
          />

          {showBeurtstokjes && (
            <DraggableWidget title="Beurtstokjes" initialPos={{ x: 800, y: 20 }} onClose={() => setShowBeurtstokjes(false)}>
              <BeurtstokjesContent />
            </DraggableWidget>
          )}

          {showStoplicht && (
            <DraggableWidget title="Stoplicht" initialPos={{ x: 20, y: 20 }} onClose={() => setShowStoplicht(false)}>
              <StoplichtContent />
            </DraggableWidget>
          )}

          {showTimer && (
            <DraggableWidget title="Timer" initialPos={{ x: 280, y: 20 }} onClose={() => setShowTimer(false)}>
              <TimerContent />
            </DraggableWidget>
          )}

          {showTekst && (
            <DraggableWidget title="Tekstvak" initialPos={{ x: 540, y: 20 }} onClose={() => setShowTekst(false)}>
              <TekstContent />
            </DraggableWidget>
          )}

          {showCalc && (
            <DraggableWidget title="Rekenmachine" initialPos={{ x: 20, y: 80 }} onClose={() => setShowCalc(false)}>
              <CalcContent />
            </DraggableWidget>
          )}
          {showOppervlakte && (
            <DraggableWidget title="Metriek — oppervlakte" initialPos={{ x: 20, y: 80 }} onClose={() => setShowOppervlakte(false)}>
              <MetriekTrap title="Oppervlakte" units={["km²","hm²","dam²","m²","dm²","cm²","mm²"]} factor={100} />
            </DraggableWidget>
          )}
          {showInhoud && (
            <DraggableWidget title="Metriek — inhoud" initialPos={{ x: 20, y: 80 }} onClose={() => setShowInhoud(false)}>
              <MetriekTrap title="Inhoud" units={["km³","hm³","dam³","m³","dm³","cm³","mm³"]} factor={1000} />
            </DraggableWidget>
          )}
          {showGeld && (
            <DraggableWidget title="Geld" initialPos={{ x: 20, y: 80 }} onClose={() => setShowGeld(false)}>
              <GeldContent />
            </DraggableWidget>
          )}
          {showVerhouding && (
            <DraggableWidget title="Verhoudingtabel" initialPos={{ x: 20, y: 80 }} onClose={() => setShowVerhouding(false)}>
              <VerhoudingContent />
            </DraggableWidget>
          )}

          {showFoto && (
            <DraggableWidget title="Foto" initialPos={{ x: 60, y: 60 }} onClose={() => { setShowFoto(false); setWijzerAan(false); }}>
              <div style={{ width: 600 }}>
                <div
                  ref={fotoAreaRef}
                  className="relative overflow-hidden bg-muted/10"
                  style={{ height: 420, cursor: wijzerAan ? "crosshair" : "default" }}
                  onMouseDown={wijzerAan ? e => { e.stopPropagation(); beginWijzerDrag(e.clientX, e.clientY); } : undefined}
                  onTouchStart={wijzerAan ? e => { e.stopPropagation(); beginWijzerDrag(e.touches[0].clientX, e.touches[0].clientY); } : undefined}
                >
                  <img src={fotoUrl} alt="" className="h-full w-full object-contain" />
                  {wijzerAan && (
                    <div style={{ position: "absolute", left: `${wijzerPos.x}%`, top: `${wijzerPos.y}%`, transform: "translate(-50%, -50%)", pointerEvents: "none" }}>
                      <div style={{ width: 48, height: 48, borderRadius: "50%", backgroundColor: "#EF4444", boxShadow: "0 0 0 4px white, 0 0 0 6px #EF4444", animation: "pulse 1.5s infinite" }} />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
                  <button
                    onClick={() => setFotoUrl("/edi1.webp")}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-smooth hover:border-accent ${fotoUrl === "/edi1.webp" ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
                  >
                    EDI 1
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setWijzerAan(v => !v)}
                      className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-smooth hover:border-accent ${wijzerAan ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
                    >
                      📍 Wijzer
                    </button>
                    <button onClick={() => fotoFileRef.current?.click()} className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-medium transition-smooth hover:border-accent">
                      <Upload className="h-3.5 w-3.5" /> Ander
                    </button>
                  </div>
                </div>
              </div>
            </DraggableWidget>
          )}

        </div>
      </main>

      <input ref={fotoFileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) setFotoUrl(URL.createObjectURL(f)); }} />

      {/* Toolbar — fixed aan de onderkant, altijd zichtbaar */}
      <div
        className="fixed bottom-0 inset-x-0 z-30 overflow-x-auto border-t border-border bg-card/95 backdrop-blur-sm"
        style={{ paddingTop: "0.75rem", paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
      >
      <div className="mx-auto flex w-fit items-center gap-3 px-4">
        {/* Colors */}
        <div className="flex gap-1.5 shrink-0">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => { setColor(c); setTool("pen"); }}
              style={{ backgroundColor: c }}
              className={`h-7 w-7 rounded-full border-2 transition-smooth hover:scale-110 ${color === c && tool === "pen" ? "border-primary scale-110" : "border-border"}`}
            />
          ))}
        </div>

        <div className="h-6 w-px shrink-0 bg-border" />

        {/* Sizes */}
        <div className="flex shrink-0 items-center gap-2">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => { setSize(s); setTool("pen"); }}
              className={`flex items-center justify-center rounded-xl border transition-smooth hover:border-accent ${size === s && tool === "pen" ? "border-primary bg-primary/10" : "border-border"}`}
              style={{ width: 36, height: 36 }}
            >
              <span style={{ width: Math.min(s, 28), height: Math.min(s, 28), borderRadius: "50%", backgroundColor: "#000000", display: "block" }} />
            </button>
          ))}
        </div>

        <div className="h-6 w-px shrink-0 bg-border" />

        {/* Eraser */}
        <button
          onClick={() => setTool(t => t === "eraser" ? "pen" : "eraser")}
          className={`shrink-0 flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition-smooth hover:border-accent ${tool === "eraser" ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
        >
          <Eraser className="h-4 w-4" />
          Gum
        </button>

        <div className="h-6 w-px shrink-0 bg-border" />

        {/* Clear */}
        <button
          onClick={clear}
          className="shrink-0 flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-sm font-medium transition-smooth"
          style={{ color: "#EEA081" }}
        >
          <Trash2 className="h-4 w-4" />
          Leegmaken
        </button>

        {/* Lined */}
        <button
          onClick={toggleLined}
          className={`shrink-0 flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition-smooth hover:border-accent ${lined ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
        >
          <BookOpen className="h-4 w-4" />
          Schrift
        </button>

        <div className="h-6 w-px shrink-0 bg-border" />

        {/* Stoplicht toggle */}
        <button
          onClick={() => setShowStoplicht(v => !v)}
          className={`shrink-0 flex items-center justify-center rounded-xl border px-3 transition-smooth hover:border-accent ${showStoplicht ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
          style={{ height: 36 }}
        >
          <span className="flex gap-0.5">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: "#EEA081" }} />
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: "#FFE48D" }} />
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: "#98F797" }} />
          </span>
        </button>

        {/* Timer toggle */}
        <button
          onClick={() => setShowTimer(v => !v)}
          className={`shrink-0 flex items-center justify-center rounded-xl border px-3 transition-smooth hover:border-accent ${showTimer ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
          style={{ height: 36 }}
        >
          <Hourglass className="h-4 w-4" />
        </button>

        {/* Tekstvak toggle */}
        <button
          onClick={() => setShowTekst(v => !v)}
          className={`shrink-0 flex items-center justify-center rounded-xl border px-3 transition-smooth hover:border-accent ${showTekst ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
          style={{ height: 36 }}
        >
          <Type className="h-4 w-4" />
        </button>

        {/* Beurtstokjes toggle */}
        <button
          onClick={() => setShowBeurtstokjes(v => !v)}
          className={`shrink-0 flex items-center justify-center rounded-xl border px-3 transition-smooth hover:border-accent ${showBeurtstokjes ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
          style={{ height: 36 }}
        >
          <Hand className="h-4 w-4" />
        </button>

        {/* Foto toggle */}
        <button
          onClick={() => setShowFoto(v => !v)}
          className={`shrink-0 flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition-smooth hover:border-accent ${showFoto ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
        >
          <ImageIcon className="h-4 w-4" />
          Foto
        </button>

        {/* Tools toggle */}
        <button
          onClick={() => setShowToolsMenu(v => !v)}
          className={`shrink-0 flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition-smooth hover:border-accent ${showToolsMenu ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
        >
          <Wrench className="h-4 w-4" />
          Tools
        </button>

      </div>
      </div>

      {/* Tools popup menu */}
      {showToolsMenu && (
        <div className="fixed bottom-[72px] right-4 z-40 flex flex-col gap-1 rounded-2xl border border-border bg-card p-2 shadow-tile">
          {[
            { label: "Rekenmachine", key: "calc", setter: setShowCalc, active: showCalc },
            { label: "Metriek oppervlakte", key: "opp", setter: setShowOppervlakte, active: showOppervlakte },
            { label: "Metriek inhoud", key: "inh", setter: setShowInhoud, active: showInhoud },
            { label: "Geld (euro)", key: "geld", setter: setShowGeld, active: showGeld },
            { label: "Verhoudingtabel", key: "verh", setter: setShowVerhouding, active: showVerhouding },
          ].map(({ label, key, setter, active }) => (
            <button
              key={key}
              onClick={() => { setter(v => !v); setShowToolsMenu(false); }}
              className={`rounded-xl px-4 py-2 text-left text-sm font-medium transition-smooth hover:bg-accent/10 ${active ? "text-accent" : ""}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

    </div>
  );
};

export default Whiteboard;
