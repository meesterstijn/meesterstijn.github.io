import { useState, useEffect, useRef } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Play, Pause, RotateCcw, Plus, Minus, Image as ImageIcon, Upload, X, Sprout, Hand } from "lucide-react";
import { StoplichtWidget } from "@/components/StoplichtWidget";
import { TekstbordWidget } from "@/components/TekstbordWidget";
import { BeurtstokjesCompact } from "@/components/BeurtstokjesCompact";
import { supabase } from "@/lib/supabase";
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

// ─── TIMER ───────────────────────────────────────────────────────────────────

const timerPresets = [5, 10, 15, 20, 30];

const Timer = ({ showPlant, onTogglePlant, onStateChange, onDone }: {
  showPlant: boolean;
  onTogglePlant: () => void;
  onStateChange: (progress: number, running: boolean, done: boolean, variant: PlantVariant) => void;
  onDone: () => void;
}) => {
  const [totalSeconds, setTotalSeconds] = useState(5 * 60);
  const [seconds, setSeconds] = useState(5 * 60);
  const [running, setRunning] = useState(false);
  const [variant, setVariant] = useState<PlantVariant>(randomVariant);
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);
  const counted = useRef(false);

  useEffect(() => {
    if (running && seconds > 0) {
      counted.current = false;
      interval.current = setInterval(() => setSeconds(s => s - 1), 1000);
    } else {
      if (interval.current) clearInterval(interval.current);
      if (seconds === 0 && !counted.current) {
        counted.current = true;
        setRunning(false);
        onDone();
        if (showPlant) insertFlower(variant);
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

  const adjust = (delta: number) => {
    if (running) return;
    const next = Math.max(60, totalSeconds + delta);
    setTotalSeconds(next);
    setSeconds(next);
  };

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const pct = totalSeconds > 0 ? seconds / totalSeconds : 0;
  const danger = seconds <= 60 && seconds > 0;
  const done = seconds === 0;

  useEffect(() => { onStateChange(1 - pct, running, done, variant); }, [seconds, running]);

  return (
    <div className="h-full rounded-3xl border border-border bg-card p-6 shadow-soft">
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

        {/* Preset knoppen — alleen zichtbaar als timer niet loopt */}
        {!running && (
          <div className="flex flex-wrap justify-center gap-2">
            {timerPresets.map(min => (
              <button
                key={min}
                onClick={() => setTimer(min)}
                className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition-smooth hover:border-accent hover:text-accent ${
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

        {/* Knoppen rij 1: − + start */}
        <div className="flex gap-3">
          {!running && <button onClick={() => adjust(-60)} className="rounded-xl border border-border p-2.5 transition-smooth hover:border-accent hover:text-accent"><Minus className="h-4 w-4" /></button>}
          {!running && <button onClick={() => adjust(60)} className="rounded-xl border border-border p-2.5 transition-smooth hover:border-accent hover:text-accent"><Plus className="h-4 w-4" /></button>}
          <button
            onClick={() => setRunning(r => !r)}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-smooth hover:opacity-90"
          >
            {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {running ? "Pauzeer" : "Start"}
          </button>
        </div>

        {/* Knoppen rij 2: herstellen + plant */}
        <div className="flex gap-3">
          <button
            onClick={() => { setRunning(false); setSeconds(totalSeconds); }}
            className="rounded-xl border border-border p-2.5 transition-smooth hover:border-accent hover:text-accent"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={onTogglePlant}
            title="Plant"
            className={`rounded-xl border p-2.5 transition-smooth hover:border-accent ${showPlant ? "border-primary bg-primary/10 text-primary" : "border-border"}`}
          >
            <Sprout className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── TEKSTBORD ───────────────────────────────────────────────────────────────

// ─── PAGINA ───────────────────────────────────────────────────────────────────

const SAVED_IMAGES = [
  { label: "EDI 1", src: "/edi1.webp" },
];

const Klastools = () => {
  const [showBeurtstokjes, setShowBeurtstokjes] = useState(false);
  const [showPlant, setShowPlant]         = useState(false);
  const [plantCount, setPlantCount]       = useState<number | null>(null);
  const [plantProgress, setPlantProgress] = useState(0);
  const [plantRunning, setPlantRunning]   = useState(false);
  const [plantDone, setPlantDone]         = useState(false);
  const [plantVariant, setPlantVariant]   = useState<PlantVariant>(0);
  const [showFoto, setShowFoto] = useState(false);

  useEffect(() => { fetchPlantCount().then(setPlantCount); }, []);

  const handleDone = () => incrementPlantCount().then(setPlantCount);
  const handleState = (progress: number, running: boolean, done: boolean, variant: PlantVariant) => {
    setPlantProgress(progress); setPlantRunning(running); setPlantDone(done); setPlantVariant(variant);
  };
  const [imageUrl, setImageUrl] = useState<string>(SAVED_IMAGES[0].src);
  const [wijzerAan, setWijzerAan] = useState(false);
  const [wijzerPos, setWijzerPos] = useState({ x: 50, y: 50 });
  const [fotoPos, setFotoPos] = useState({ x: 80, y: 80 });
  const fileRef = useRef<HTMLInputElement>(null);
  const fotoAreaRef = useRef<HTMLDivElement>(null);
  const fotoDrag = useRef<{ mx: number; my: number; ox: number; oy: number } | null>(null);

  const beginFotoDrag = (clientX: number, clientY: number) => {
    fotoDrag.current = { mx: clientX, my: clientY, ox: fotoPos.x, oy: fotoPos.y };
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!fotoDrag.current) return;
      const cx = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const cy = "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      setFotoPos({ x: fotoDrag.current.ox + cx - fotoDrag.current.mx, y: fotoDrag.current.oy + cy - fotoDrag.current.my });
    };
    const onUp = () => {
      fotoDrag.current = null;
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

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUrl(URL.createObjectURL(file));
  };

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

  return (
    <div className="min-h-screen bg-paper bg-warm">
      <SiteHeader />
      <main className="container py-10 md:py-14">
        <div className="grid gap-6 md:grid-cols-4">
          <Timer
            showPlant={showPlant}
            onTogglePlant={() => setShowPlant(v => !v)}
            onStateChange={handleState}
            onDone={handleDone}
          />
          {showPlant && (
            <div className="h-full rounded-3xl border border-border bg-card p-6 shadow-soft flex flex-col items-center gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                {plantDone ? "Volgroeid! 🌸" : plantProgress < 0.01 ? "Zaadje 🌱" : "Groeit…"}
              </p>
              <div style={{ width: 120, height: 158 }}>
                <PlantSVG progress={plantProgress} variant={plantVariant} />
              </div>
              <p className="text-center text-xs text-muted-foreground">
                {plantDone ? "Prachtig! Goed gefocust." : plantRunning ? "Blijf gefocust!" : "Start de timer om te laten groeien."}
              </p>
              {plantCount !== null && (
                <p className="text-center text-xs text-muted-foreground">
                  🌸 {plantCount} plantje{plantCount === 1 ? "" : "s"} volgroeid
                </p>
              )}
            </div>
          )}
          <div className={`${showPlant ? "" : "md:col-span-2"} h-full`}><TekstbordWidget /></div>
          <StoplichtWidget footer={
            <div className="w-full flex flex-col items-center gap-3 mt-2">
              <button
                onClick={() => setShowBeurtstokjes(v => !v)}
                className={`flex items-center justify-center rounded-xl border px-5 py-2.5 transition-smooth hover:border-accent ${showBeurtstokjes ? "border-primary bg-primary/10 text-primary" : "border-border"}`}
              >
                <Hand className="h-4 w-4" />
              </button>
              {showBeurtstokjes && (
                <div className="w-full border-t border-border pt-4">
                  <BeurtstokjesCompact />
                </div>
              )}
            </div>
          } />
        </div>
      </main>

      {/* Foto knop — links van de rechter fullscreenknop */}
      <button
        onClick={() => setShowFoto(true)}
        title="Foto weergeven"
        className="fixed bottom-5 right-[68px] z-50 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-soft transition-smooth hover:border-primary hover:text-primary"
      >
        <ImageIcon className="h-4 w-4" />
      </button>

      {/* Foto — zwevend versleepbaar kaartje */}
      {showFoto && (
        <>
        <div
          className="fixed z-[60] flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-tile"
          style={{ left: fotoPos.x, top: fotoPos.y, width: 640 }}
        >
            {/* Header — versleepbaar */}
            <div
              className="flex shrink-0 cursor-grab items-center justify-between border-b border-border px-4 py-3 active:cursor-grabbing"
              onMouseDown={e => beginFotoDrag(e.clientX, e.clientY)}
              onTouchStart={e => beginFotoDrag(e.touches[0].clientX, e.touches[0].clientY)}
            >
              <div className="flex items-center gap-2">
                <p className="font-display text-base font-semibold">Foto weergeven</p>
                {/* Opgeslagen bestanden */}
                {SAVED_IMAGES.map((img) => (
                  <button
                    key={img.src}
                    onClick={() => setImageUrl(img.src)}
                    className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition-smooth hover:border-accent ${imageUrl === img.src ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
                  >
                    {img.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium transition-smooth hover:border-accent"
              >
                <Upload className="h-4 w-4" /> Ander bestand
              </button>
            </div>

            {/* Inhoud */}
            <div
              ref={fotoAreaRef}
              className="relative overflow-hidden bg-muted/20"
              style={{ height: 420, cursor: wijzerAan ? "crosshair" : "default" }}
              onMouseDown={wijzerAan ? e => beginWijzerDrag(e.clientX, e.clientY) : undefined}
              onTouchStart={wijzerAan ? e => beginWijzerDrag(e.touches[0].clientX, e.touches[0].clientY) : undefined}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Weergegeven foto"
                  className="h-full w-full object-contain"
                />
              ) : (
                <div
                  onClick={() => fileRef.current?.click()}
                  className="flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-border p-16 text-muted-foreground transition-smooth hover:border-accent hover:text-accent"
                >
                  <ImageIcon className="h-14 w-14 opacity-40" />
                  <p className="text-sm font-medium">Klik om een foto te kiezen</p>
                </div>
              )}
              {wijzerAan && (
                <div
                  style={{
                    position: "absolute",
                    left: `${wijzerPos.x}%`,
                    top: `${wijzerPos.y}%`,
                    transform: "translate(-50%, -50%)",
                    pointerEvents: "none",
                  }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: "50%",
                    backgroundColor: "#EF4444",
                    boxShadow: "0 0 0 4px white, 0 0 0 6px #EF4444",
                    animation: "pulse 1.5s infinite",
                  }} />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border px-6 py-3">
              <button
                onClick={() => setWijzerAan(v => !v)}
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition-smooth hover:border-accent ${wijzerAan ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}
              >
                📍 Wijzer
              </button>
              <button
                onClick={() => setShowFoto(false)}
                className="flex items-center gap-2 rounded-xl border border-border px-6 py-2 text-sm font-medium transition-smooth hover:border-accent"
              >
                <X className="h-4 w-4" /> Sluiten
              </button>
            </div>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
        </>
      )}
    </div>
  );
};

export default Klastools;
