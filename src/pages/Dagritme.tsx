import { useState, useEffect, useRef } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Clock, Lock, Pencil, Plus, Trash2, Check, X, LayoutGrid, CalendarDays } from "lucide-react";

const PASSWORD = "nietvoorleerlingen";
const SUPABASE_URL = "https://fxcsqxshjnxlknnmfsbv.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4Y3NxeHNoam54bGtubm1mc2J2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMzQwNTgsImV4cCI6MjA5MzcxMDA1OH0.MVp882LWEZVMW33l1Ld94BnFbvCrIzStq02-9ylpYnc";
const ROW_ID = 1;

type Tone = "coral" | "sage" | "amber" | "ink" | "cream";
type Block = { id: string; time: string; title: string; subject: string; tone: Tone; les: string; lesdoelen: string };
type Day = { day: string; blocks: Block[] };
type View = "dag" | "week";

const uid = () => Math.random().toString(36).slice(2, 8);

const DAYS = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag"];

const todayIdx = (): number => {
  const d = new Date().getDay();
  return d >= 1 && d <= 5 ? d - 1 : 0; // weekend → maandag
};

const getWeekDates = (): Date[] => {
  const today = new Date();
  const dow = today.getDay();
  const monday = new Date(today);
  if (dow === 0) monday.setDate(today.getDate() + 1);       // zondag → volgende maandag
  else if (dow === 6) monday.setDate(today.getDate() + 2);  // zaterdag → volgende maandag
  else monday.setDate(today.getDate() - (dow - 1));         // doordeweeks → deze maandag
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
};

const isoWeek = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

const fmt = (d: Date) =>
  `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

const defaultWeek: Day[] = DAYS.map((day, i) => ({
  day,
  blocks: [
    { id: `${i}a`, time: "08:30", title: "Inloop",     subject: "", tone: "ink",   les: "", lesdoelen: "" },
    { id: `${i}b`, time: "08:45", title: "Bijbel",     subject: "", tone: "sage",  les: "", lesdoelen: "" },
    { id: `${i}c`, time: "09:15", title: "Taal",       subject: "", tone: "coral", les: "", lesdoelen: "" },
    { id: `${i}d`, time: "10:00", title: "Pauze",      subject: "", tone: "cream", les: "", lesdoelen: "" },
    { id: `${i}e`, time: "10:15", title: "Rekenen",    subject: "", tone: "coral", les: "", lesdoelen: "" },
    { id: `${i}f`, time: "11:15", title: "Zaakvakken", subject: "", tone: "sage",  les: "", lesdoelen: "" },
    { id: `${i}g`, time: "12:00", title: "Pauze",      subject: "", tone: "cream", les: "", lesdoelen: "" },
    { id: `${i}h`, time: "12:30", title: "Les",        subject: "", tone: "coral", les: "", lesdoelen: "" },
    { id: `${i}i`, time: "14:15", title: "Afsluiting", subject: "", tone: "ink",   les: "", lesdoelen: "" },
  ],
}));

const normalize = (w: Day[]): Day[] =>
  w.map(d => ({
    ...d,
    blocks: d.blocks.map(b => ({ les: "", lesdoelen: "", ...b })),
  }));

const toneBg: Record<Tone, string> = {
  coral: "border-l-accent bg-accent/5",
  sage:  "border-l-sage bg-sage/5",
  amber: "border-l-highlight bg-highlight/5",
  ink:   "border-l-primary bg-primary/5",
  cream: "border-l-border bg-muted/40",
};

const toneOptions: Tone[] = ["coral", "sage", "ink", "cream", "amber"];
const toneLabels: Record<Tone, string> = {
  coral: "Koraal", sage: "Salie", amber: "Geel", ink: "Teal", cream: "Licht",
};

async function loadFromSupabase(): Promise<Day[] | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/dagritme?id=eq.${ROW_ID}&select=data`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    const rows = await res.json();
    if (rows?.[0]?.data) return normalize(JSON.parse(rows[0].data));
  } catch {}
  return null;
}

async function saveToSupabase(week: Day[]) {
  await fetch(`${SUPABASE_URL}/rest/v1/dagritme`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({ id: ROW_ID, data: JSON.stringify(week) }),
  });
}

const Dagritme = () => {
  const [week, setWeek]         = useState<Day[]>(defaultWeek);
  const [loading, setLoading]   = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [showPw, setShowPw]     = useState(false);
  const [pwInput, setPwInput]   = useState("");
  const [pwError, setPwError]   = useState(false);
  const [editing, setEditing]   = useState<{ dayIdx: number; blockId: string } | null>(null);
  const [editVal, setEditVal]   = useState<Block | null>(null);
  const [saving, setSaving]     = useState(false);
  const [view, setView]         = useState<View>("dag");
  const [dayIdx, setDayIdx]     = useState(todayIdx());
  const [undoWeek, setUndoWeek] = useState<Day[] | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);

  const weekRef = useRef(week);
  useEffect(() => { weekRef.current = week; }, [week]);

  useEffect(() => {
    loadFromSupabase().then(data => {
      if (data) setWeek(data);
      setLoading(false);
    });
  }, []);

  const saveWeek = async (newWeek: Day[]) => {
    setWeek(newWeek);
    setSaving(true);
    await saveToSupabase(newWeek);
    setSaving(false);
  };

  const handleUnlock = () => {
    if (pwInput === PASSWORD) {
      setUnlocked(true); setShowPw(false); setPwInput(""); setPwError(false);
    } else {
      setPwError(true);
    }
  };

  const startEdit = (dIdx: number, block: Block) => {
    setEditing({ dayIdx: dIdx, blockId: block.id });
    setEditVal({ ...block });
  };

  const saveEdit = () => {
    if (!editing || !editVal) return;
    const newWeek = week.map((d, i) =>
      i === editing.dayIdx
        ? { ...d, blocks: d.blocks.map(b => b.id === editing.blockId ? editVal : b) }
        : d
    );
    saveWeek(newWeek);
    setEditing(null); setEditVal(null);
  };

  const deleteBlock = (dIdx: number, blockId: string) => {
    saveWeek(week.map((d, i) =>
      i === dIdx ? { ...d, blocks: d.blocks.filter(b => b.id !== blockId) } : d
    ));
  };

  const addBlock = (dIdx: number) => {
    const newBlock: Block = { id: uid(), time: "08:00", title: "Nieuw blok", subject: "", tone: "amber", les: "", lesdoelen: "" };
    const newWeek = week.map((d, i) =>
      i === dIdx ? { ...d, blocks: [...d.blocks, newBlock] } : d
    );
    setWeek(newWeek);
    startEdit(dIdx, newBlock);
  };

  const updateInline = (dIdx: number, blockId: string, field: "les" | "lesdoelen", value: string) => {
    setWeek(prev => prev.map((d, i) =>
      i === dIdx ? { ...d, blocks: d.blocks.map(b => b.id === blockId ? { ...b, [field]: value } : b) } : d
    ));
  };

  const wisWeek = () => {
    setUndoWeek(week);
    saveWeek(week.map(d => ({
      ...d,
      blocks: d.blocks.map(b => ({ ...b, les: "", lesdoelen: "" })),
    })));
  };

  const herstelWeek = () => {
    if (!undoWeek) return;
    saveWeek(undoWeek);
    setUndoWeek(null);
  };

  const saveInline = () => {
    setSaving(true);
    saveToSupabase(weekRef.current).then(() => setSaving(false));
  };

  const today = todayIdx();
  const weekDates = getWeekDates();

  return (
    <div className="min-h-screen bg-paper bg-warm">
      <SiteHeader />
      <main className="container py-10 md:py-14">

        {/* Header */}
        <div className="mb-10 animate-fade-up flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="font-display text-4xl font-semibold md:text-5xl">
              {view === "dag" ? DAYS[dayIdx] : "Weekoverzicht"}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {saving && <span className="text-xs text-muted-foreground">Opslaan…</span>}
            <button
              onClick={() => setView(v => v === "dag" ? "week" : "dag")}
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium transition-smooth hover:border-accent"
            >
              {view === "dag"
                ? <><LayoutGrid className="h-4 w-4" /> Weekoverzicht</>
                : <><CalendarDays className="h-4 w-4" /> Dagweergave</>}
            </button>
            {!unlocked ? (
              <button
                onClick={() => setShowPw(true)}
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium transition-smooth hover:border-accent"
              >
                <Lock className="h-4 w-4" /> Bewerken
              </button>
            ) : (
              <>
              {undoWeek && (
                <button
                  onClick={herstelWeek}
                  className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium transition-smooth hover:border-accent hover:text-accent"
                >
                  ↩ Ongedaan maken
                </button>
              )}
              <button
                onClick={wisWeek}
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium transition-smooth hover:border-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" /> Week wissen
              </button>
              <button
                onClick={() => setUnlocked(false)}
                className="flex items-center gap-2 rounded-xl border border-accent bg-accent/10 px-4 py-2.5 text-sm font-medium text-accent transition-smooth hover:bg-accent/20"
              >
                <Pencil className="h-4 w-4" /> Bewerkmode aan
              </button>
              </>
            )}
          </div>
        </div>

        {loading && <p className="text-sm text-muted-foreground mb-6">Rooster laden…</p>}

        {/* Wachtwoordscherm */}
        {showPw && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-tile">
              <div className="mb-4 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <Lock className="h-5 w-5" />
                </span>
                <p className="font-display text-xl font-semibold">Dagritme bewerken</p>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">Voer het wachtwoord in om te bewerken.</p>
              <input
                type="password"
                value={pwInput}
                onChange={e => { setPwInput(e.target.value); setPwError(false); }}
                onKeyDown={e => e.key === "Enter" && handleUnlock()}
                placeholder="Wachtwoord"
                autoFocus
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
              />
              {pwError && <p className="mt-2 text-xs text-destructive">Wachtwoord onjuist.</p>}
              <div className="mt-4 flex gap-2">
                <button onClick={handleUnlock} className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-smooth hover:opacity-90">
                  Ontgrendelen
                </button>
                <button onClick={() => setShowPw(false)} className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition-smooth hover:border-accent">
                  Annuleren
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bewerkscherm */}
        {editing && editVal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-tile">
              <p className="mb-4 font-display text-xl font-semibold">Blok bewerken</p>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">Tijd</label>
                  <input type="time" value={editVal.time} onChange={e => setEditVal({ ...editVal, time: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">Titel</label>
                  <input value={editVal.title} onChange={e => setEditVal({ ...editVal, title: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">Ondertitel (optioneel)</label>
                  <input value={editVal.subject} onChange={e => setEditVal({ ...editVal, subject: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">Kleur</label>
                  <div className="flex flex-wrap gap-2">
                    {toneOptions.map(t => (
                      <button key={t} onClick={() => setEditVal({ ...editVal, tone: t })}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-smooth ${editVal.tone === t ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"}`}>
                        {toneLabels[t]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-5 flex gap-2">
                <button onClick={saveEdit} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
                  <Check className="h-4 w-4" /> Opslaan
                </button>
                <button onClick={() => { setEditing(null); setEditVal(null); }} className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:border-accent">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Dagweergave ── */}
        {view === "dag" && (
          <div className="animate-fade-up">

          {/* Mobiel: alleen blokken */}
          <div className="md:hidden space-y-2">
            {week[dayIdx].blocks.map(b => (
              <div key={b.id} className={`rounded-xl border-l-4 px-3 py-2.5 flex items-center ${toneBg[b.tone]}`}>
                <div className="flex items-center gap-2">
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{b.time}</span>
                  <p className="text-sm font-medium leading-tight">{b.title}</p>
                </div>
                {b.subject && <p className="mt-0.5 text-xs text-muted-foreground">{b.subject}</p>}
              </div>
            ))}
          </div>

          {/* Desktop: sidebar + kolommen */}
          <div className="hidden md:flex gap-4">

            {/* Dag-sidebar */}
            <aside className="flex shrink-0 flex-col gap-1 w-40">
              {week.map((d, i) => (
                <button
                  key={d.day}
                  onClick={() => setDayIdx(i)}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 text-left transition-smooth ${
                    dayIdx === i
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <div>
                    <p className="text-sm font-semibold">{d.day}</p>
                    <p className={`text-xs ${dayIdx === i ? "opacity-70" : "text-muted-foreground"}`}>
                      {fmt(weekDates[i])}
                    </p>
                  </div>
                  {i === today && (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  )}
                </button>
              ))}
              <p className="mt-2 px-4 text-xs text-muted-foreground">
                Week {isoWeek(weekDates[0])}
              </p>
            </aside>

            {/* Dag-inhoud */}
            <div className="flex-1 min-w-0">

              <div className="space-y-2">
                {week[dayIdx].blocks.map(b => (
                  <div key={b.id} className="grid grid-cols-10 gap-3 items-stretch">

                    {/* 2/5 — dagritme kaart */}
                    <div className={`col-span-3 group/block rounded-xl border-l-4 px-3 py-2.5 flex items-center ${toneBg[b.tone]}`}>
                      <div className="flex w-full items-center justify-between gap-1">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{b.time}</span>
                            <p className="text-sm font-medium leading-tight">{b.title}</p>
                          </div>
                          {b.subject && <p className="mt-0.5 text-xs text-muted-foreground">{b.subject}</p>}
                        </div>
                        {unlocked && (
                          <div className="flex shrink-0 flex-col gap-0.5 opacity-0 transition-opacity group-hover/block:opacity-100">
                            <button onClick={() => startEdit(dayIdx, b)} className="rounded-lg p-1 hover:bg-accent/20">
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button onClick={() => deleteBlock(dayIdx, b.id)} className="rounded-lg p-1 hover:bg-destructive/20 hover:text-destructive">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 1/5 — les */}
                    <div className={`col-span-2 rounded-xl border px-3 py-2.5 flex items-center transition-colors ${
                      b.les || focusedId === b.id + "-les"
                        ? "border-border bg-card"
                        : "border-transparent bg-transparent"
                    }`}>
                      {unlocked ? (
                        <input
                          value={b.les}
                          onChange={e => updateInline(dayIdx, b.id, "les", e.target.value)}
                          onFocus={() => setFocusedId(b.id + "-les")}
                          onBlur={() => { setFocusedId(null); saveInline(); }}
                          className="w-full h-full bg-transparent text-sm outline-none"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">{b.les}</p>
                      )}
                    </div>

                    {/* 2/5 — lesdoelen */}
                    <div className={`col-span-5 rounded-xl border px-3 py-2.5 flex items-center transition-colors ${
                      b.lesdoelen || focusedId === b.id + "-lesdoelen"
                                        ? "border-border bg-card"
                        : "border-transparent bg-transparent"
                    }`}>
                      {unlocked ? (
                        <textarea
                          value={b.lesdoelen}
                          onChange={e => updateInline(dayIdx, b.id, "lesdoelen", e.target.value)}
                          onFocus={() => setFocusedId(b.id + "-lesdoelen")}
                          onBlur={() => { setFocusedId(null); saveInline(); }}
                          rows={2}
                          className="w-full h-full resize-none bg-transparent text-sm outline-none my-auto"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap my-auto">{b.lesdoelen}</p>
                      )}
                    </div>

                  </div>
                ))}
              </div>

              {unlocked && (
                <button
                  onClick={() => addBlock(dayIdx)}
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2 text-xs text-muted-foreground transition-smooth hover:border-accent hover:text-accent"
                >
                  <Plus className="h-3.5 w-3.5" /> Blok toevoegen
                </button>
              )}
            </div>
          </div>
          </div>
        )}

        {/* ── Weekoverzicht ── */}
        {view === "week" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 animate-fade-up">
            {week.map((d, i) => (
              <section
                key={d.day}
                className="rounded-3xl border border-border bg-card p-4 shadow-soft"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <header className="mb-3 border-b border-border pb-2.5 flex items-center gap-2">
                  <h2 className="font-display text-lg font-semibold">{d.day}</h2>
                  <span className="text-sm text-muted-foreground">{fmt(weekDates[i])}</span>
                  {i === today && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                </header>
                <ul className="space-y-2">
                  {d.blocks.map(b => (
                    <li key={b.id} className={`group/block rounded-xl border-l-4 px-3 py-2 transition-smooth flex items-center ${toneBg[b.tone]}`}>
                      <div className="flex w-full items-center justify-between gap-1">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{b.time}</span>
                            <p className="text-sm font-medium leading-tight">{b.title}</p>
                          </div>
                          {b.subject && <p className="mt-0.5 text-xs text-muted-foreground">{b.subject}</p>}
                        </div>
                        {unlocked && (
                          <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover/block:opacity-100">
                            <button onClick={() => startEdit(i, b)} className="rounded-lg p-1 hover:bg-accent/20">
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button onClick={() => deleteBlock(i, b.id)} className="rounded-lg p-1 hover:bg-destructive/20 hover:text-destructive">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
                {unlocked && (
                  <button
                    onClick={() => addBlock(i)}
                    className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2 text-xs text-muted-foreground transition-smooth hover:border-accent hover:text-accent"
                  >
                    <Plus className="h-3.5 w-3.5" /> Blok toevoegen
                  </button>
                )}
              </section>
            ))}
          </div>
        )}

        <footer className="mt-20 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          Met liefde gemaakt voor de klas · Meester Stijn
        </footer>
      </main>
    </div>
  );
};

export default Dagritme;
