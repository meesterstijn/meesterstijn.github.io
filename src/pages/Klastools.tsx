import { useState, useEffect, useRef } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Play, Pause, RotateCcw, Plus, Minus } from "lucide-react";

// ─── TIMER ───────────────────────────────────────────────────────────────────

const Timer = () => {
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

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const pct = seconds / (5 * 60);
  const danger = seconds <= 60 && seconds > 0;
  const done = seconds === 0;

  const adjust = (delta: number) => {
    if (!running) setSeconds(s => Math.max(0, s + delta));
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-accent">Timer</p>
      <div className="flex flex-col items-center gap-6">
        {/* Cirkel */}
        <div className="relative h-48 w-48">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="4" className="text-border" />
            <circle
              cx="50" cy="50" r="44" fill="none"
              stroke={done ? "#22c55e" : danger ? "#ef4444" : "currentColor"}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 44}`}
              strokeDashoffset={`${2 * Math.PI * 44 * (1 - pct)}`}
              className={done ? "" : danger ? "" : "text-accent"}
              style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`font-display text-4xl font-bold tabular-nums ${done ? "text-green-500" : danger ? "text-red-500" : ""}`}>
              {fmt(seconds)}
            </span>
            {done && <span className="mt-1 text-xs font-semibold text-green-500">Klaar!</span>}
          </div>
        </div>

        {/* Tijd aanpassen */}
        <div className="flex items-center gap-3">
          <button onClick={() => adjust(-60)} className="rounded-xl border border-border p-2 transition-smooth hover:border-accent hover:text-accent"><Minus className="h-4 w-4" /></button>
          <span className="w-16 text-center text-sm text-muted-foreground">1 min</span>
          <button onClick={() => adjust(60)} className="rounded-xl border border-border p-2 transition-smooth hover:border-accent hover:text-accent"><Plus className="h-4 w-4" /></button>
        </div>

        {/* Knoppen */}
        <div className="flex gap-3">
          <button
            onClick={() => setRunning(r => !r)}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-smooth hover:opacity-90"
          >
            {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {running ? "Pauzeer" : "Start"}
          </button>
          <button
            onClick={() => { setRunning(false); setSeconds(5 * 60); }}
            className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition-smooth hover:border-accent"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── TEKSTBORD ───────────────────────────────────────────────────────────────

const Tekstbord = () => {
  const [text, setText] = useState("");

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-accent">Tekstbord</p>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Schrijf hier een opdracht, vraag of mededeling voor de klas…"
        className="h-48 w-full resize-none rounded-xl border border-border bg-background p-4 text-sm outline-none focus:border-accent"
      />
      {text && (
        <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4">
          <p className="font-display text-lg font-medium leading-relaxed whitespace-pre-wrap">{text}</p>
        </div>
      )}
    </div>
  );
};

// ─── STOPLICHT ───────────────────────────────────────────────────────────────

type Light = "rood" | "oranje" | "groen";

const lights: { color: Light; label: string; bg: string; glow: string }[] = [
  { color: "rood",   label: "Je werkt stil. Even geen vragen aan de meester.",             bg: "#ef4444", glow: "0 0 40px 10px #ef444488" },
  { color: "oranje", label: "Je werkt stil. Stel je vraag alleen aan de meester.",         bg: "#f97316", glow: "0 0 40px 10px #f9731688" },
  { color: "groen",  label: "Met een fluisterstem samenwerken met schoudermaatje.", bg: "#22c55e", glow: "0 0 40px 10px #22c55e88" },
];

const Stoplicht = () => {
  const [active, setActive] = useState<Light | null>(null);

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-accent">Stoplicht</p>
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-zinc-900 px-6 py-5">
          {lights.map(l => (
            <button
              key={l.color}
              onClick={() => setActive(active === l.color ? null : l.color)}
              className="h-16 w-16 rounded-full transition-all duration-300"
              style={{
                backgroundColor: active === l.color ? l.bg : "#3f3f46",
                boxShadow: active === l.color ? l.glow : "none",
              }}
            />
          ))}
        </div>
        {active && (
          <p className="mt-2 text-center text-sm font-semibold">
            {lights.find(l => l.color === active)?.label}
          </p>
        )}
        {!active && (
          <p className="mt-2 text-center text-sm text-muted-foreground">Klik op een lamp</p>
        )}
      </div>
    </div>
  );
};

// ─── PAGINA ───────────────────────────────────────────────────────────────────

const Klastools = () => (
  <div className="min-h-screen bg-paper bg-warm">
    <SiteHeader />
    <main className="container py-10 md:py-14">
      <div className="mb-10 max-w-2xl animate-fade-up">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Hulpmiddelen</p>
        <h1 className="mt-2 font-display text-4xl font-semibold md:text-5xl">Klastools</h1>
        <p className="mt-3 text-muted-foreground">Timer, tekstbord en stoplicht voor in de klas.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <Timer />
        <Tekstbord />
        <Stoplicht />
      </div>
    </main>
  </div>
);

export default Klastools;
