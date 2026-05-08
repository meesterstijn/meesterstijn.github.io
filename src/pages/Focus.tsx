import { useState, useEffect, useRef } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Play, Pause, RotateCcw, Sprout } from "lucide-react";

const presets = [5, 10, 15, 20, 30];

// ─── Plant ────────────────────────────────────────────────────────────────────

const PlantSVG = ({ progress }: { progress: number }) => {
  const gY = 140;
  const stemLen = 108;
  const p = Math.max(0, Math.min(1, progress));
  const tip = gY - stemLen * p;

  const lo = (t: number) => Math.max(0, Math.min(1, (p - t) / 0.1));

  return (
    <svg viewBox="0 0 100 170" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Soil */}
      <ellipse cx="50" cy="154" rx="38" ry="11" fill="#c8a45a" opacity="0.45" />
      <ellipse cx="50" cy="150" rx="33" ry="8"  fill="#a67c38" opacity="0.5" />
      <ellipse cx="50" cy="147" rx="27" ry="5.5" fill="#8a6428" opacity="0.55" />

      {/* Seed */}
      <ellipse
        cx="50" cy="143" rx="5" ry="3.5"
        fill="#7a5c2e"
        opacity={Math.max(0, 1 - p / 0.07)}
      />

      {/* Stem */}
      {p > 0.03 && (
        <line x1="50" y1={gY} x2="50" y2={tip}
          stroke="#4a7828" strokeWidth="3.5" strokeLinecap="round" />
      )}

      {/* Leaf 1 — lower left */}
      <g opacity={lo(0.28)} transform={`translate(50,${gY - stemLen * 0.31})`}>
        <ellipse cx="-8" cy="0" rx="14" ry="5.5" fill="#6ab840" transform="rotate(-28)" />
      </g>

      {/* Leaf 2 — lower right */}
      <g opacity={lo(0.47)} transform={`translate(50,${gY - stemLen * 0.51})`}>
        <ellipse cx="8" cy="0" rx="13" ry="5" fill="#6ab840" transform="rotate(28)" />
      </g>

      {/* Leaf 3 — upper left */}
      <g opacity={lo(0.65)} transform={`translate(50,${gY - stemLen * 0.69})`}>
        <ellipse cx="-7" cy="0" rx="12" ry="4.5" fill="#58a034" transform="rotate(-33)" />
      </g>

      {/* Leaf 4 — upper right */}
      <g opacity={lo(0.83)} transform={`translate(50,${gY - stemLen * 0.87})`}>
        <ellipse cx="7" cy="0" rx="11" ry="4" fill="#58a034" transform="rotate(33)" />
      </g>

      {/* Flower at stem tip */}
      <g opacity={lo(0.92)} transform={`translate(50,${tip})`}>
        {[0, 60, 120, 180, 240, 300].map(a => (
          <ellipse key={a} cx="0" cy="-7" rx="3.5" ry="5.5"
            fill="#f9a8d4" transform={`rotate(${a})`} />
        ))}
        <circle cx="0" cy="0" r="4.5" fill="#fbbf24" />
      </g>
    </svg>
  );
};

// ─── Focus ────────────────────────────────────────────────────────────────────

const SUPABASE_URL = "https://fxcsqxshjnxlknnmfsbv.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4Y3NxeHNoam54bGtubm1mc2J2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMzQwNTgsImV4cCI6MjA5MzcxMDA1OH0.MVp882LWEZVMW33l1Ld94BnFbvCrIzStq02-9ylpYnc";

const fetchPlantCount = async (): Promise<number> => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/counters?id=eq.1&select=value`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  const data = await res.json();
  return data?.[0]?.value ?? 0;
};

const incrementPlantCount = async (): Promise<number> => {
  const current = await fetchPlantCount();
  const next = current + 1;
  await fetch(`${SUPABASE_URL}/rest/v1/counters?id=eq.1`, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ value: next }),
  });
  return next;
};

const Focus = () => {
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [showPlant, setShowPlant] = useState(false);
  const [plantCount, setPlantCount] = useState<number | null>(null);
  const counted = useRef(false);
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchPlantCount().then(setPlantCount);
  }, []);

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
      }
    }
    return () => { if (interval.current) clearInterval(interval.current); };
  }, [running, seconds]);

  const setTimer = (minutes: number) => {
    setRunning(false);
    setTotalSeconds(minutes * 60);
    setSeconds(minutes * 60);
  };

  const reset = () => {
    setRunning(false);
    setSeconds(totalSeconds);
  };

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const pct = totalSeconds > 0 ? seconds / totalSeconds : 0;
  const progress = 1 - pct;
  const danger = seconds <= 60 && seconds > 0;
  const done = seconds === 0;
  const circumference = 2 * Math.PI * 44;

  return (
    <div className="min-h-screen bg-paper bg-warm">
      <SiteHeader />
      <main className="container py-10 md:py-14">
        <div className="mb-12 text-center animate-fade-up">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Concentratie</p>
          <h1 className="mt-2 font-display text-4xl font-semibold md:text-5xl">Focus</h1>
          <p className="mt-3 text-muted-foreground">Zet een timer en werk geconcentreerd.</p>
        </div>

        <div className="flex flex-wrap items-start justify-center gap-12">

          {/* Timer */}
          <div className="animate-fade-up flex flex-col items-center gap-10">
            <div className="relative h-72 w-72">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="3" className="text-border" />
                <circle
                  cx="50" cy="50" r="44" fill="none"
                  stroke={done ? "#22c55e" : danger ? "#ef4444" : "currentColor"}
                  strokeWidth="3" strokeLinecap="round"
                  strokeDasharray={`${circumference}`}
                  strokeDashoffset={`${circumference * (1 - pct)}`}
                  className={done ? "" : danger ? "" : "text-accent"}
                  style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                <span className={`font-display text-6xl font-bold tabular-nums ${done ? "text-green-500" : danger ? "text-red-500" : ""}`}>
                  {fmt(seconds)}
                </span>
                {done && <span className="text-sm font-semibold text-green-500">Goed gedaan! 🎉</span>}
                {!done && running && <span className="text-xs text-muted-foreground">Bezig…</span>}
                {!done && !running && seconds === totalSeconds && <span className="text-xs text-muted-foreground">Klaar om te starten</span>}
                {!done && !running && seconds !== totalSeconds && <span className="text-xs text-muted-foreground">Gepauzeerd</span>}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setRunning(r => !r)}
                disabled={done}
                className="flex items-center gap-2 rounded-2xl bg-primary px-8 py-3 text-base font-medium text-primary-foreground transition-smooth hover:opacity-90 disabled:opacity-40"
              >
                {running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                {running ? "Pauzeer" : "Start"}
              </button>
              <button
                onClick={reset}
                className="flex items-center gap-2 rounded-2xl border border-border px-5 py-3 text-base font-medium transition-smooth hover:border-accent"
              >
                <RotateCcw className="h-5 w-5" />
              </button>
              <button
                onClick={() => setShowPlant(v => !v)}
                title="Plant"
                className={`flex items-center justify-center rounded-2xl border px-5 py-3 text-base font-medium transition-smooth hover:border-accent ${showPlant ? "border-primary bg-primary/10 text-primary" : "border-border"}`}
              >
                <Sprout className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {presets.map(min => (
                <button
                  key={min}
                  onClick={() => setTimer(min)}
                  className={`rounded-2xl border px-5 py-2.5 text-sm font-semibold transition-smooth hover:border-accent hover:text-accent ${
                    totalSeconds === min * 60 && !done
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card"
                  }`}
                >
                  {min} min
                </button>
              ))}
            </div>
          </div>

          {/* Plant panel */}
          {showPlant && (
            <div className="animate-fade-up flex flex-col items-center gap-4 rounded-3xl border border-border bg-card p-6 shadow-soft" style={{ width: 240 }}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                {done ? "Volgroeid! 🌸" : progress < 0.01 ? "Zaadje 🌱" : "Groeit…"}
              </p>
              <div style={{ width: 160, height: 210 }}>
                <PlantSVG progress={progress} />
              </div>
              <p className="text-center text-sm text-muted-foreground">
                {done
                  ? "Prachtig! Jij hebt gefocust."
                  : running
                  ? "Blijf gefocust, de plant groeit!"
                  : "Start de timer om te laten groeien."}
              </p>
              {plantCount !== null && (
                <p className="text-center text-xs text-muted-foreground">
                  🌸 {plantCount} plantje{plantCount === 1 ? "" : "s"} volgroeid
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Focus;
