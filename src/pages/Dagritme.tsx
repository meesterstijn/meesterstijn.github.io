import { useState, useEffect } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Clock, Lock, Pencil, Plus, Trash2, Check, X } from "lucide-react";

const PASSWORD = "nietvoorleerlingen";
const SUPABASE_URL = "https://fxcsqxshjnxlknnmfsbv.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4Y3NxeHNoam54bGtubm1mc2J2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMzQwNTgsImV4cCI6MjA5MzcxMDA1OH0.MVp882LWEZVMW33l1Ld94BnFbvCrIzStq02-9ylpYnc";
const ROW_ID = 1;

type Tone = "coral" | "sage" | "amber" | "ink" | "cream";
type Block = { id: string; time: string; title: string; subject: string; tone: Tone };
type Day = { day: string; blocks: Block[] };

const uid = () => Math.random().toString(36).slice(2, 8);

const DAYS = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag"];

const defaultWeek: Day[] = DAYS.map((day, i) => ({
  day,
  blocks: [
    { id: `${i}a`, time: "08:30", title: "Inloop",     subject: "",          tone: "amber" },
    { id: `${i}b`, time: "08:45", title: "Bijbel",     subject: "",          tone: "sage"  },
    { id: `${i}c`, time: "09:15", title: "Taal",       subject: "",          tone: "coral" },
    { id: `${i}d`, time: "10:00", title: "Pauze",      subject: "",          tone: "cream" },
    { id: `${i}e`, time: "10:15", title: "Rekenen",    subject: "",          tone: "coral" },
    { id: `${i}f`, time: "11:15", title: "Zaakvakken", subject: "",          tone: "sage"  },
    { id: `${i}g`, time: "12:00", title: "Pauze",      subject: "",          tone: "cream" },
    { id: `${i}h`, time: "12:30", title: "Les",        subject: "",          tone: "coral" },
    { id: `${i}i`, time: "14:15", title: "Afsluiting", subject: "",          tone: "ink"   },
  ],
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
    if (rows?.[0]?.data) return JSON.parse(rows[0].data);
  } catch {}
  return null;
}

async function saveToSupabase(week: Day[]) {
  const data = JSON.stringify(week);
  await fetch(`${SUPABASE_URL}/rest/v1/dagritme`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({ id: ROW_ID, data }),
  });
}

const Dagritme = () => {
  const [week, setWeek]       = useState<Day[]>(defaultWeek);
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);
  const [editing, setEditing] = useState<{ dayIdx: number; blockId: string } | null>(null);
  const [editVal, setEditVal] = useState<Block | null>(null);
  const [saving, setSaving]   = useState(false);

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

  const startEdit = (dayIdx: number, block: Block) => {
    setEditing({ dayIdx, blockId: block.id });
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

  const deleteBlock = (dayIdx: number, blockId: string) => {
    saveWeek(week.map((d, i) =>
      i === dayIdx ? { ...d, blocks: d.blocks.filter(b => b.id !== blockId) } : d
    ));
  };

  const addBlock = (dayIdx: number) => {
    const newBlock: Block = { id: uid(), time: "08:00", title: "Nieuw blok", subject: "", tone: "amber" };
    const newWeek = week.map((d, i) =>
      i === dayIdx ? { ...d, blocks: [...d.blocks, newBlock] } : d
    );
    setWeek(newWeek);
    startEdit(dayIdx, newBlock);
  };

  return (
    <div className="min-h-screen bg-paper bg-warm">
      <SiteHeader />
      <main className="container py-10 md:py-14">
        <div className="mb-10 animate-fade-up flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Rooster</p>
            <h1 className="mt-2 font-display text-4xl font-semibold md:text-5xl">Dagritme</h1>
            <p className="mt-3 text-muted-foreground">Het weekrooster van de klas.</p>
          </div>
          <div className="mt-4 flex items-center gap-2">
            {saving && <span className="text-xs text-muted-foreground">Opslaan…</span>}
            {!unlocked ? (
              <button
                onClick={() => setShowPw(true)}
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium transition-smooth hover:border-accent"
              >
                <Lock className="h-4 w-4" /> Bewerken
              </button>
            ) : (
              <span className="flex items-center gap-2 rounded-xl border border-accent bg-accent/10 px-4 py-2.5 text-sm font-medium text-accent">
                <Pencil className="h-4 w-4" /> Bewerkmode aan
              </span>
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

        {/* Weekrooster */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {week.map((d, dayIdx) => (
            <section
              key={d.day}
              className="animate-fade-up rounded-3xl border border-border bg-card p-4 shadow-soft"
              style={{ animationDelay: `${dayIdx * 60}ms` }}
            >
              <header className="mb-3 border-b border-border pb-2.5">
                <h2 className="font-display text-lg font-semibold">{d.day}</h2>
              </header>
              <ul className="space-y-2">
                {d.blocks.map(b => (
                  <li key={b.id} className={`group/block rounded-xl border-l-4 px-3 py-2 transition-smooth ${toneBg[b.tone]}`}>
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          <Clock className="h-2.5 w-2.5" /> {b.time}
                        </div>
                        <p className="mt-0.5 text-sm font-semibold leading-tight">{b.title}</p>
                        {b.subject && <p className="text-xs text-muted-foreground">{b.subject}</p>}
                      </div>
                      {unlocked && (
                        <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover/block:opacity-100">
                          <button onClick={() => startEdit(dayIdx, b)} className="rounded-lg p-1 hover:bg-accent/20">
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button onClick={() => deleteBlock(dayIdx, b.id)} className="rounded-lg p-1 hover:bg-destructive/20 hover:text-destructive">
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
                  onClick={() => addBlock(dayIdx)}
                  className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2 text-xs text-muted-foreground transition-smooth hover:border-accent hover:text-accent"
                >
                  <Plus className="h-3.5 w-3.5" /> Blok toevoegen
                </button>
              )}
            </section>
          ))}
        </div>

        <footer className="mt-20 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          Met liefde gemaakt voor de klas · Meester Stijn
        </footer>
      </main>
    </div>
  );
};

export default Dagritme;
