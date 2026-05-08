import { useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Eraser, Trash2, BookOpen, Play, Pause, RotateCcw, Plus, Minus, Clock, X } from "lucide-react";

const COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#7C3AED", "#000000", "#ffffff"];
const SIZES = [3, 6, 12, 20, 32];
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
    ctx.fillStyle = "#fffef0";
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
    </div>
  );
};

// ─── Whiteboard ───────────────────────────────────────────────────────────────

const Whiteboard = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#2563EB");
  const [size, setSize] = useState(6);
  const [lined, setLinedState] = useState(false);
  const [showStoplicht, setShowStoplicht] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawBackground(ctx, canvas, false);
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
      if (strokes.current.length !== before) redraw(ctx, canvas);
    }
  };

  const stopDraw = () => {
    if (tool === "pen" && currentStroke.current && currentStroke.current.points.length > 0)
      strokes.current.push(currentStroke.current);
    currentStroke.current = null;
    drawing.current = false;
  };

  const clear = () => {
    strokes.current = [];
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawBackground(ctx, canvas, linedRef.current);
  };

  return (
    <div className="min-h-screen bg-paper bg-warm flex flex-col">
      <SiteHeader />

      <main className="container py-6 flex flex-col flex-1">
        {/* Toolbar */}
        <div className="animate-fade-up mb-3 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-soft" style={{ animationDelay: "60ms" }}>
          {/* Colors */}
          <div className="flex gap-1.5">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => { setColor(c); setTool("pen"); }}
                style={{ backgroundColor: c }}
                className={`h-7 w-7 rounded-full border-2 transition-smooth hover:scale-110 ${color === c && tool === "pen" ? "border-primary scale-110" : "border-border"}`}
              />
            ))}
          </div>

          <div className="h-6 w-px bg-border" />

          {/* Sizes */}
          <div className="flex items-center gap-2">
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

          <div className="h-6 w-px bg-border" />

          {/* Eraser */}
          <button
            onClick={() => setTool(t => t === "eraser" ? "pen" : "eraser")}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition-smooth hover:border-accent ${tool === "eraser" ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
          >
            <Eraser className="h-4 w-4" />
            Gum
          </button>

          <div className="h-6 w-px bg-border" />

          {/* Clear */}
          <button
            onClick={clear}
            className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-sm font-medium text-destructive transition-smooth hover:border-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Leegmaken
          </button>

          {/* Lined */}
          <button
            onClick={toggleLined}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition-smooth hover:border-accent ${lined ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
          >
            <BookOpen className="h-4 w-4" />
            Schrift
          </button>

          <div className="h-6 w-px bg-border" />

          {/* Stoplicht toggle */}
          <button
            onClick={() => setShowStoplicht(v => !v)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition-smooth hover:border-accent ${showStoplicht ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
          >
            <span className="flex gap-0.5">
              <span className="h-3 w-3 rounded-full bg-red-500" />
              <span className="h-3 w-3 rounded-full bg-orange-400" />
              <span className="h-3 w-3 rounded-full bg-green-500" />
            </span>
            Stoplicht
          </button>

          {/* Timer toggle */}
          <button
            onClick={() => setShowTimer(v => !v)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition-smooth hover:border-accent ${showTimer ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
          >
            <Clock className="h-4 w-4" />
            Timer
          </button>
        </div>

        {/* Canvas wrapper — position:relative so overlays can be positioned inside */}
        <div
          className="animate-fade-up flex-1 rounded-3xl border border-border shadow-soft"
          style={{ position: "relative", overflow: "hidden", animationDelay: "120ms" }}
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
        </div>
      </main>
    </div>
  );
};

export default Whiteboard;
