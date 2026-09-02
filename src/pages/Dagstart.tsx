import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays, Cake, Focus, Loader2, PencilLine,
  RefreshCw, Sparkles, Sunrise,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { ClockCard } from "@/components/ClockCard";
import { StoplichtWidget } from "@/components/StoplichtWidget";
import { BeurtstokjesCompact } from "@/components/BeurtstokjesCompact";
import DagelijkseChallenge, { CHALLENGES, dagChallenge } from "@/components/DagelijkseChallenge";
import VerjaardagTool from "@/components/VerjaardagTool";
import { useClasses } from "@/context/ClassContext";
import { defaultWeek, loadDagritme, type Block, type Tone } from "@/pages/Dagritme";
import { fetchWeer, jasNodig, weerEmoji, weerTekst, type WeerData } from "@/pages/Weer";

const WELCOME_KEY = "ms-dagstart-welkom";

const toneClasses: Record<Tone, string> = {
  coral: "border-l-accent bg-accent/5",
  sage: "border-l-sage bg-sage/5",
  amber: "border-l-highlight bg-highlight/10",
  ink: "border-l-primary bg-primary/5",
  cream: "border-l-border bg-muted/50",
};

const dayIndex = () => {
  const day = new Date().getDay();
  return day >= 1 && day <= 5 ? day - 1 : 0;
};

const minutes = (time: string) => {
  const [hours, mins] = time.split(":").map(Number);
  return hours * 60 + mins;
};

const Dagstart = () => {
  const { activeClass, activeClassId, loading: classLoading } = useClasses();
  const [schedule, setSchedule] = useState<Block[]>(defaultWeek[dayIndex()].blocks);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [weather, setWeather] = useState<WeerData | null>(null);
  const [weatherError, setWeatherError] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [showBirthday, setShowBirthday] = useState(false);
  const [now, setNow] = useState(new Date());
  const [welcome, setWelcome] = useState(() => localStorage.getItem(WELCOME_KEY) ?? "Fijn dat jullie er zijn. We maken er samen een mooie dag van!");

  const loadWeather = () => {
    setWeatherError(false);
    fetchWeer().then(setWeather).catch(() => setWeatherError(true));
  };

  useEffect(() => {
    loadWeather();
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (classLoading) return;
    if (!activeClassId) {
      setSchedule(defaultWeek[dayIndex()].blocks);
      setScheduleLoading(false);
      return;
    }
    setScheduleLoading(true);
    loadDagritme(activeClassId).then(payload => {
      setSchedule((payload?.week ?? defaultWeek)[dayIndex()]?.blocks ?? []);
      setScheduleLoading(false);
    });
  }, [activeClassId, classLoading]);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const activeIndex = useMemo(() => {
    if (schedule.length === 0) return -1;
    const next = schedule.findIndex(block => minutes(block.time) > currentMinutes);
    return next === -1 ? schedule.length - 1 : Math.max(0, next - 1);
  }, [schedule, currentMinutes]);
  const visibleSchedule = schedule.slice(Math.max(0, activeIndex), Math.max(0, activeIndex) + 5);
  const challenge = CHALLENGES[dagChallenge()];

  const saveWelcome = (value: string) => {
    setWelcome(value);
    localStorage.setItem(WELCOME_KEY, value);
  };

  return (
    <div className="min-h-screen bg-paper bg-warm">
      <SiteHeader />
      <main className="container py-8 md:py-12">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              <Sunrise className="h-4 w-4" /> Goedemorgen
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold md:text-5xl">
              Dagstart{activeClass ? ` · ${activeClass.name}` : ""}
            </h1>
          </div>
        </div>

        <section className="grid gap-5 lg:grid-cols-12">
          <div className="lg:col-span-7"><ClockCard /></div>
          <div className="flex min-h-56 flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-soft lg:col-span-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Buiten</p>
                <h2 className="mt-1 font-display text-2xl font-semibold">Jas mee?</h2>
              </div>
              {weather && <span className="text-5xl" aria-hidden="true">{weerEmoji(weather.code)}</span>}
            </div>
            {weather ? (
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="font-display text-5xl font-bold">{weather.temp}°C</p>
                  <p className="text-sm text-muted-foreground">{weerTekst(weather.code)} · voelt als {weather.gevoels}°</p>
                </div>
                <span className={`rounded-full px-4 py-2 text-sm font-semibold ${jasNodig(weather.temp, weather.code) ? "bg-primary text-primary-foreground" : "bg-sage text-sage-foreground"}`}>
                  {jasNodig(weather.temp, weather.code) ? "Jas mee" : "Geen jas nodig"}
                </span>
              </div>
            ) : weatherError ? (
              <button onClick={loadWeather} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><RefreshCw className="h-4 w-4" /> Probeer opnieuw</button>
            ) : <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft lg:col-span-7">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Vandaag</p>
                <h2 className="mt-1 font-display text-2xl font-semibold">Dit gaan we doen</h2>
              </div>
              <Link to="/dagritme" className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-accent"><CalendarDays className="h-4 w-4" /> Bekijk rooster</Link>
            </div>
            {scheduleLoading ? <p className="text-sm text-muted-foreground">Rooster laden…</p> : (
              <div className="grid gap-2 sm:grid-cols-2">
                {visibleSchedule.map((block, index) => (
                  <div key={block.id} className={`border-l-4 rounded-2xl px-4 py-3 ${toneClasses[block.tone]} ${index === 0 ? "ring-2 ring-primary/20" : ""}`}>
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-sm font-semibold text-muted-foreground">{block.time}</span>
                      <span className="font-display text-lg font-semibold">{block.title}</span>
                    </div>
                    {(block.subject || block.lesdoelen) && <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{block.subject || block.lesdoelen}</p>}
                  </div>
                ))}
                {visibleSchedule.length === 0 && <p className="text-sm text-muted-foreground">Geen onderdelen voor vandaag.</p>}
              </div>
            )}
          </div>

          <button onClick={() => setShowChallenge(true)} className="group flex flex-col justify-between rounded-3xl border border-highlight/50 bg-highlight/10 p-6 text-left shadow-soft transition-smooth hover:-translate-y-0.5 hover:shadow-tile lg:col-span-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/60">Challenge van vandaag</p>
              <Sparkles className="h-5 w-5 text-accent transition-transform group-hover:rotate-12" />
            </div>
            <p className="my-6 font-display text-2xl font-semibold leading-snug">{challenge.tekst}</p>
            <span className="text-sm font-semibold text-accent">Open challenge →</span>
          </button>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft lg:col-span-4">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-accent">Wie is er aan de beurt?</p>
            <BeurtstokjesCompact boxHeight="h-24" />
          </div>
          <div className="lg:col-span-4"><StoplichtWidget /></div>
          <div className="flex flex-col rounded-3xl border border-border bg-card p-6 shadow-soft lg:col-span-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Welkom in de klas</p>
            <textarea value={welcome} onChange={event => saveWelcome(event.target.value)} className="mt-4 min-h-28 flex-1 resize-none bg-transparent font-display text-2xl font-semibold leading-snug outline-none" aria-label="Welkomsttekst" />
            <p className="text-xs text-muted-foreground">Klik op de tekst om hem aan te passen.</p>
          </div>
        </section>

        <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Link to="/whiteboard" className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-4 font-semibold text-primary-foreground transition-smooth hover:opacity-90"><PencilLine className="h-5 w-5" /> Whiteboard</Link>
          <Link to="/focus" className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-4 font-semibold transition-smooth hover:border-accent"><Focus className="h-5 w-5" /> Focus</Link>
          <button onClick={() => setShowChallenge(true)} className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-4 font-semibold transition-smooth hover:border-accent"><Sparkles className="h-5 w-5" /> Challenge</button>
          <button onClick={() => setShowBirthday(true)} className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-4 font-semibold transition-smooth hover:border-accent"><Cake className="h-5 w-5" /> Verjaardag</button>
        </section>
      </main>

      {showChallenge && <DagelijkseChallenge onClose={() => setShowChallenge(false)} />}
      {showBirthday && <VerjaardagTool onClose={() => setShowBirthday(false)} />}
    </div>
  );
};

export default Dagstart;
