import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useClasses } from "@/context/ClassContext";
import { supabase } from "@/lib/supabase";

const source = "dagritme";
type Day = { day: string; blocks: { id: string; time: string; title: string; subject?: string; les?: string }[] };
const DAYS = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"];

export function currentActivityIndex(blocks: { time: string }[], day: string, now: Date) {
  if (day !== DAYS[now.getDay()]) return -1;
  const minutes = now.getHours() * 60 + now.getMinutes();
  let active = -1;
  let latest = -1;
  blocks.forEach((block, index) => {
    if (!/^\d{1,2}:\d{2}$/.test(block.time)) return;
    const [hour, minute] = block.time.split(":").map(Number);
    const start = hour * 60 + minute;
    if (hour < 24 && minute < 60 && start <= minutes && start >= latest) {
      active = index;
      latest = start;
    }
  });
  return active;
}

export function parseSchedule(raw: string): Day[] {
  const parsed = JSON.parse(raw);
  const week = Array.isArray(parsed) ? parsed : parsed?.week;
  if (!Array.isArray(week) || !week.every(d => typeof d.day === "string" && Array.isArray(d.blocks) && d.blocks.every((b: Day["blocks"][number]) => b && typeof b.time === "string" && typeof b.title === "string"))) throw new Error("Ongeldig rooster");
  return week.map(day => ({ ...day, blocks: day.blocks.map(block => ({ ...block, title: block.title.trim().toLocaleLowerCase() === "bijbel" ? "Bijbelverhaal" : block.title })) }));
}

export function DagplanningWidget() {
  const { activeClassId, activeClass } = useClasses();
  const [now, setNow] = useState(() => new Date());
  const [result, setResult] = useState<{ key: string; week: Day[]; error: boolean } | null>(null);
  const key = source + ":" + activeClassId;
  useEffect(() => {
    const updateClock = () => setNow(new Date());
    const timer = window.setInterval(updateClock, 1000);
    window.addEventListener("focus", updateClock);
    document.addEventListener("visibilitychange", updateClock);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", updateClock);
      document.removeEventListener("visibilitychange", updateClock);
    };
  }, []);
  useEffect(() => {
    if (!activeClassId) return;
    let alive = true;
    let sequence = 0;
    const refresh = async () => {
      const request = ++sequence;
      try {
        const { data, error } = await supabase.from(source).select("data").eq("class_id", activeClassId).maybeSingle();
        if (error) throw error;
        const week = data?.data ? parseSchedule(data.data) : [];
        if (alive && request === sequence) setResult({ key, week, error: false });
      } catch {
        if (alive && request === sequence) setResult(previous => ({ key, week: previous?.key === key ? previous.week : [], error: true }));
      }
    };
    void refresh();
    const channel = supabase.channel("klastools-" + key).on("postgres_changes", { event: "*", schema: "public", table: source, filter: "class_id=eq." + activeClassId }, () => void refresh()).subscribe();
    // Polling also works when Realtime is not enabled for the table.
    const timer = window.setInterval(() => { if (!document.hidden) void refresh(); }, 15000);
    const onFocus = () => { if (!document.hidden) void refresh(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => { alive = false; window.clearInterval(timer); void supabase.removeChannel(channel); window.removeEventListener("focus", onFocus); document.removeEventListener("visibilitychange", onFocus); };
  }, [activeClassId, source, key]);
  const current = result?.key === key ? result : null;
  const day = DAYS[now.getDay()];
  const blocks = [...(current?.week.find(d => d.day === day)?.blocks ?? [])].sort((a, b) => a.time.localeCompare(b.time));
  const activeIndex = currentActivityIndex(blocks, day, now);
  return <div className="space-y-4 p-5">
    <p className="text-sm text-muted-foreground">{day}{activeClass ? " · " + activeClass.name : ""}</p>
    {!activeClassId ? <p>Kies eerst een klas.</p> : !current ? <p role="status">Planning laden…</p> : <>
      {current.error && <p role="alert" className="text-sm text-destructive">Synchroniseren lukt niet. Eventueel getoonde gegevens kunnen verouderd zijn; we proberen het opnieuw.</p>}
      {!current.error && blocks.length === 0 && <p className="text-sm text-muted-foreground">Geen opgeslagen planning voor deze dag. Vul deze in op de bronpagina.</p>}
      <ol className="space-y-2">{blocks.map((block, i) => {
        const active = i === activeIndex;
        const pause = block.title.trim().toLocaleLowerCase() === "pauze";
        return <li key={block.id ?? i} aria-current={active ? "step" : undefined} className={`flex gap-3 rounded-xl border p-3 ${active ? "border-accent bg-accent text-accent-foreground" : pause ? "border-highlight bg-highlight/20 text-foreground" : "border-border bg-secondary/40 text-foreground"}`}>
          <time className="shrink-0 text-sm font-semibold tabular-nums">{block.time}</time>
          <div className="min-w-0 break-words">
            {active && <span className="text-xs font-bold uppercase tracking-wide">Nu</span>}
            <p className="font-medium">{block.title}</p>
            {block.subject && <p className={`text-sm ${active ? "text-accent-foreground" : "text-muted-foreground"}`}>{block.subject}</p>}
            {block.les && <p className="text-sm">{block.les}</p>}
          </div>
        </li>;
      })}</ol>
    </>}
    <Link to={"/" + source} className="inline-block text-sm font-medium underline">Planning aanpassen op Dagritme</Link>
    <p className="text-xs text-muted-foreground">Dezelfde opgeslagen planning als op de bronpagina. Wordt automatisch bijgewerkt.</p>
  </div>;
}
