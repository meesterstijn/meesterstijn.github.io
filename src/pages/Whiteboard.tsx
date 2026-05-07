import { useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Eraser, Trash2, Download, Pencil } from "lucide-react";

const COLORS = ["#1f2937", "#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#000000"];
const SIZES = [2, 4, 8, 16, 28];

type Stroke = {
  color: string;
  size: number;
  points: { x: number; y: number }[]; // in CSS pixels
};

const Whiteboard = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const currentRef = useRef<Stroke | null>(null);
  const drawing = useRef(false);
  const erasing = useRef(false);

  const [color, setColor] = useState("#1f2937");
  const [size, setSize] = useState(4);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");

  const redraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const all = [...strokesRef.current];
    if (currentRef.current) all.push(currentRef.current);
    for (const s of all) {
      if (s.points.length === 0) continue;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.size;
      ctx.beginPath();
      ctx.moveTo(s.points[0].x, s.points[0].y);
      for (let i = 1; i < s.points.length; i++) {
        ctx.lineTo(s.points[i].x, s.points[i].y);
      }
      if (s.points.length === 1) {
        // dot
        ctx.lineTo(s.points[0].x + 0.01, s.points[0].y + 0.01);
      }
      ctx.stroke();
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const { width, height } = wrap.getBoundingClientRect();
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      redraw();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  // Distance from point p to segment a-b
  const distToSeg = (
    p: { x: number; y: number },
    a: { x: number; y: number },
    b: { x: number; y: number }
  ) => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len2 = dx * dx + dy * dy;
    let t = len2 === 0 ? 0 : ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    const cx = a.x + t * dx;
    const cy = a.y + t * dy;
    return Math.hypot(p.x - cx, p.y - cy);
  };

  const eraseAt = (p: { x: number; y: number }) => {
    const radius = Math.max(size * 2, 12);
    const before = strokesRef.current.length;
    strokesRef.current = strokesRef.current.filter((s) => {
      if (s.points.length === 1) {
        return Math.hypot(s.points[0].x - p.x, s.points[0].y - p.y) > radius + s.size / 2;
      }
      for (let i = 1; i < s.points.length; i++) {
        if (distToSeg(p, s.points[i - 1], s.points[i]) <= radius + s.size / 2) {
          return false;
        }
      }
      return true;
    });
    if (strokesRef.current.length !== before) redraw();
  };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    const p = getPos(e);
    if (tool === "eraser") {
      erasing.current = true;
      eraseAt(p);
    } else {
      drawing.current = true;
      currentRef.current = { color, size, points: [p] };
      redraw();
    }
  };

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const p = getPos(e);
    if (erasing.current) {
      eraseAt(p);
    } else if (drawing.current && currentRef.current) {
      currentRef.current.points.push(p);
      redraw();
    }
  };

  const onUp = () => {
    if (drawing.current && currentRef.current) {
      strokesRef.current.push(currentRef.current);
      currentRef.current = null;
      redraw();
    }
    drawing.current = false;
    erasing.current = false;
  };

  const clear = () => {
    strokesRef.current = [];
    currentRef.current = null;
    redraw();
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `whiteboard-${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-paper bg-warm">
      <SiteHeader />
      <main className="container py-6">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold md:text-4xl">Whiteboard</h1>
            <p className="text-muted-foreground">Teken, leg uit en sla op.</p>
          </div>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-3 shadow-soft">
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant={tool === "pen" ? "default" : "outline"}
              onClick={() => setTool("pen")}
            >
              <Pencil className="mr-1 h-4 w-4" /> Pen
            </Button>
            <Button
              size="sm"
              variant={tool === "eraser" ? "default" : "outline"}
              onClick={() => setTool("eraser")}
            >
              <Eraser className="mr-1 h-4 w-4" /> Gum
            </Button>
          </div>

          <div className="mx-2 h-6 w-px bg-border" />

          <div className="flex items-center gap-1.5">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => { setColor(c); setTool("pen"); }}
                className={`h-7 w-7 rounded-full border-2 transition-smooth ${
                  color === c && tool === "pen" ? "border-foreground scale-110" : "border-border"
                }`}
                style={{ background: c }}
                aria-label={`Kleur ${c}`}
              />
            ))}
          </div>

          <div className="mx-2 h-6 w-px bg-border" />

          <div className="flex items-center gap-1.5">
            {SIZES.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`grid h-8 w-8 place-items-center rounded-full border transition-smooth ${
                  size === s ? "border-foreground bg-secondary" : "border-border"
                }`}
                aria-label={`Dikte ${s}`}
              >
                <span
                  className="rounded-full bg-foreground"
                  style={{ width: Math.min(s, 20), height: Math.min(s, 20) }}
                />
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={clear}>
              <Trash2 className="mr-1 h-4 w-4" /> Wissen
            </Button>
            <Button size="sm" onClick={download}>
              <Download className="mr-1 h-4 w-4" /> Opslaan
            </Button>
          </div>
        </div>

        <div
          ref={wrapRef}
          className="h-[70vh] w-full overflow-hidden rounded-3xl border border-border bg-white shadow-soft"
        >
          <canvas
            ref={canvasRef}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerLeave={onUp}
            className="block h-full w-full touch-none"
            style={{ cursor: tool === "eraser" ? "cell" : "crosshair" }}
          />
        </div>
      </main>
    </div>
  );
};

export default Whiteboard;
