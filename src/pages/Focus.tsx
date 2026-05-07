import { useState, useEffect, useRef } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Play, Pause, RotateCcw } from "lucide-react";

const presets = [5, 10, 15, 20, 30];

const Focus = () => {
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [seconds, setSeconds] = useState(25 * 60);
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
  const danger = seconds <= 60 && seconds > 0;
  const done = seconds === 0;
  const circumference = 2 * Math.PI * 44;

  return (
    <div className="min-h-screen bg-paper bg-warm">
      <SiteHeader />
      <main className="container py-10 md:py-14 flex flex-col items-center">
        <div className="mb-12 w-full max-w-2xl animate-fade-up text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Concentratie</p>
          <h1 className="mt-2 font-display text-4xl font-semibold md:text-5xl">Focus</h1>
          <p className="mt-3 text-muted-foreground">Zet een timer en werk geconcentreerd.</p>
        </div>

        <div className="animate-fade-up flex flex-col items-center gap-10">
          {/* Grote cirkel */}
          <div className="relative h-72 w-72">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="3" className="text-border" />
              <circle
                cx="50" cy="50" r="44" fill="none"
                stroke={done ? "#22c55e" : danger ? "#ef4444" : "currentColor"}
                strokeWidth="3"
                strokeLinecap="round"
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

          {/* Start / pauze / reset */}
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
          </div>

          {/* Tijdknoppen */}
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
      </main>
    </div>
  );
};

export default Focus;
