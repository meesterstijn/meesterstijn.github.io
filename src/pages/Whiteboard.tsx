import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { Eraser, Trash2, BookOpen, Play, Pause, RotateCcw, Plus, Minus, Clock, X, Type, Image as ImageIcon, Upload, Wrench } from "lucide-react";

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
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running && seconds > 0) {
      interval.current = setInterval(() => setSeconds(s => s - 1), 1000);
    } else {
      if (interval.current) clearInterval(interval.current);
      if (seconds === 0) setRunning(false);
    }
    return () => { if (interval.current) clearInterval(interval.current); };
  }, [running, seconds]);

  const adjust = (delta: number) => {
    if (running) return;
    const next = Math.max(60, totalSec + delta);
    setTotalSec(next);
    setSeconds(next);
  };

  const reset = () => { setRunning(false); setSeconds(totalSec); };
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const pct = totalSec > 0 ? seconds / totalSec : 0;
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

      <div className="flex items-center gap-3">
        <button onClick={() => adjust(-60)} className="rounded-xl border border-border p-2 transition-smooth hover:border-accent hover:text-accent">
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-12 text-center text-xs text-muted-foreground">1 min</span>
        <button onClick={() => adjust(60)} className="rounded-xl border border-border p-2 transition-smooth hover:border-accent hover:text-accent">
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setRunning(r => !r)}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-smooth hover:opacity-90"
        >
          {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {running ? "Pauzeer" : "Start"}
        </button>
        <button onClick={reset} className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium transition-smooth hover:border-accent">
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      <Link
        to="/focus"
        className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium transition-smooth hover:border-accent hover:text-accent"
      >
        <Clock className="h-4 w-4" />
        Focus pagina openen
      </Link>
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

const BILJETTEN = [
  { v: 500, label: "€500", bg: "#8B5CF6" },
  { v: 200, label: "€200", bg: "#F59E0B" },
  { v: 100, label: "€100", bg: "#10B981" },
  { v: 50,  label: "€50",  bg: "#F97316" },
  { v: 20,  label: "€20",  bg: "#3B82F6" },
  { v: 10,  label: "€10",  bg: "#EF4444" },
  { v: 5,   label: "€5",   bg: "#6B7280" },
];
const MUNTEN = [
  { v: 2,    label: "€2"   },
  { v: 1,    label: "€1"   },
  { v: 0.5,  label: "50ct" },
  { v: 0.2,  label: "20ct" },
  { v: 0.1,  label: "10ct" },
  { v: 0.05, label: "5ct"  },
  { v: 0.02, label: "2ct"  },
  { v: 0.01, label: "1ct"  },
];

const GeldContent = () => {
  const [counts, setCounts] = useState<Record<number, number>>({});
  const adj = (v: number, d: number) => setCounts(p => ({ ...p, [v]: Math.max(0, (p[v] || 0) + d) }));
  const total = [...BILJETTEN, ...MUNTEN].reduce((s, x) => s + (counts[x.v] || 0) * x.v, 0);
  const Row = ({ v, label, bg }: { v: number; label: string; bg?: string }) => (
    <div className="flex items-center gap-2 py-0.5">
      <div className={`flex h-7 w-14 shrink-0 items-center justify-center rounded text-xs font-bold text-white`}
        style={{ backgroundColor: bg ?? "#C69B34" }}>{label}</div>
      <span className="w-5 text-center text-sm tabular-nums">{counts[v] || 0}</span>
      <button onClick={() => adj(v, -1)} className="h-6 w-6 rounded border border-border text-xs leading-none hover:border-accent">−</button>
      <button onClick={() => adj(v, 1)}  className="h-6 w-6 rounded border border-border text-xs leading-none hover:border-accent">+</button>
    </div>
  );
  return (
    <div className="p-4" style={{ width: 340 }}>
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Biljetten</p>
      {BILJETTEN.map(b => <Row key={b.v} {...b} />)}
      <p className="mb-1 mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Munten</p>
      <div className="grid grid-cols-2 gap-x-3">
        {MUNTEN.map(m => <Row key={m.v} v={m.v} label={m.label} />)}
      </div>
      <div className="mt-3 flex items-center justify-between rounded-xl bg-primary/10 px-4 py-2">
        <span className="text-sm font-semibold">Totaal</span>
        <span className="font-display text-xl font-bold">€ {total.toFixed(2)}</span>
      </div>
      <button onClick={() => setCounts({})} className="mt-1.5 w-full text-center text-xs text-muted-foreground hover:text-accent transition-smooth">Wis alles</button>
    </div>
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
          className={`shrink-0 flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition-smooth hover:border-accent ${showStoplicht ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
        >
          <span className="flex gap-0.5">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: "#EEA081" }} />
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: "#FFE48D" }} />
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: "#98F797" }} />
          </span>
          Stoplicht
        </button>

        {/* Timer toggle */}
        <button
          onClick={() => setShowTimer(v => !v)}
          className={`shrink-0 flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition-smooth hover:border-accent ${showTimer ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
        >
          <Clock className="h-4 w-4" />
          Timer
        </button>

        {/* Tekstvak toggle */}
        <button
          onClick={() => setShowTekst(v => !v)}
          className={`shrink-0 flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition-smooth hover:border-accent ${showTekst ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
        >
          <Type className="h-4 w-4" />
          Tekst
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
