import { useState, useEffect, useRef } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Play, Pause, RotateCcw, Sprout } from "lucide-react";
import { PlantSVG, randomVariant, type PlantVariant } from "@/components/PlantSVG";

const presets = [5, 10, 15, 20, 30];

// ─── Focus ────────────────────────────────────────────────────────────────────

import { supabase } from "@/lib/supabase";

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

const Focus = () => {
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [showPlant, setShowPlant] = useState(false);
  const [plantCount, setPlantCount] = useState<number | null>(null);
  const [variant, setVariant] = useState<PlantVariant>(randomVariant);
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
    setVariant(randomVariant());
  };

  const reset = () => {
    setRunning(false);
    setSeconds(totalSeconds);
    setVariant(randomVariant());
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

            {!running && (
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
            )}
          </div>

          {/* Plant panel */}
          {showPlant && (
            <div className="animate-fade-up flex flex-col items-center gap-4 rounded-3xl border border-border bg-card p-6 shadow-soft" style={{ width: 240 }}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                {done ? "Volgroeid! 🌸" : progress < 0.01 ? "Zaadje 🌱" : "Groeit…"}
              </p>
              <div style={{ width: 160, height: 210 }}>
                <PlantSVG progress={progress} variant={variant} />
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
