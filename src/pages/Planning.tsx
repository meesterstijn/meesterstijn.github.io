import { useState, useEffect } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Clock, Pencil, Plus, Trash2, Check, X } from "lucide-react";

import { supabase } from "@/lib/supabase";
const ROW_ID = 1;

type Tone = "coral" | "sage" | "amber" | "ink" | "cream";
type Block = { id: string; time: string; title: string; subject: string; tone: Tone };
type Day = { day: string; blocks: Block[] };

const defaultWeek: Day[] = [
  {
    day: "Maandag",
    blocks: [
      { id: "m1", time: "08:00", title: "Voorbereiden",  subject: "",          tone: "amber" },
      { id: "m2", time: "08:20", title: "Lesgeven",       subject: "Groep 5b", tone: "coral" },
      { id: "m3", time: "12:00", title: "Pauze",          subject: "",          tone: "cream" },
      { id: "m4", time: "12:30", title: "Lesgeven",       subject: "Groep 5b", tone: "coral" },
      { id: "m5", time: "14:45", title: "B-taken",        subject: "",          tone: "ink"   },
    ],
  },
  {
    day: "Woensdag",
    blocks: [
      { id: "w1", time: "07:45", title: "Koffiezetten",   subject: "",          tone: "amber" },
      { id: "w2", time: "08:00", title: "Voorbereiden",   subject: "",          tone: "amber" },
      { id: "w3", time: "08:30", title: "Ralfi lezen",    subject: "",          tone: "sage"  },
      { id: "w4", time: "09:00", title: "Ondersteuning",  subject: "",          tone: "coral" },
      { id: "w5", time: "12:30", title: "B-taken",        subject: "",          tone: "ink"   },
    ],
  },
  {
    day: "Vrijdag",
    blocks: [
      { id: "v1", time: "08:00", title: "Voorbereiden",   subject: "",          tone: "amber" },
      { id: "v2", time: "08:30", title: "Ondersteunen",   subject: "",          tone: "coral" },
      { id: "v3", time: "12:30", title: "B-taken",        subject: "",          tone: "ink"   },
    ],
  },
];

const toneBg: Record<Tone, string> = {
  coral:  "border-l-accent bg-accent/5",
  sage:   "border-l-sage bg-sage/5",
  amber:  "border-l-highlight bg-highlight/5",
  ink:    "border-l-primary bg-primary/5",
  cream:  "border-l-border bg-muted/40",
};

const toneOptions: Tone[] = ["coral", "sage", "ink", "cream"];
const toneLabels: Record<Tone, string> = {
  coral: "Rood", sage: "Groen", amber: "Geel", ink: "Blauw", cream: "Grijs"
};

const uid = () => Math.random().toString(36).slice(2, 8);

async function loadFromSupabase(): Promise<Day[] | null> {
  try {
    const { data } = await supabase.from("planning").select("data").eq("id", ROW_ID).single();
    if (data?.data) return JSON.parse(data.data);
  } catch {}
  return null;
}

async function saveToSupabase(week: Day[]) {
  await supabase.from("planning").upsert({ id: ROW_ID, data: JSON.stringify(week) });
}

const Planning = () => {
  const [week, setWeek] = useState<Day[]>(defaultWeek);
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [editing, setEditing] = useState<{ dayIdx: number; blockId: string } | null>(null);
  const [editVal, setEditVal] = useState<Block | null>(null);
  const [saving, setSaving] = useState(false);

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
    setEditing(null);
    setEditVal(null);
  };

  const deleteBlock = (dayIdx: number, blockId: string) => {
    const newWeek = week.map((d, i) =>
      i === dayIdx ? { ...d, blocks: d.blocks.filter(b => b.id !== blockId) } : d
    );
    saveWeek(newWeek);
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
        <div className="mb-10 max-w-2xl animate-fade-up flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Rooster</p>
            <h1 className="mt-2 font-display text-4xl font-semibold md:text-5xl">Planning</h1>
            <p className="mt-3 text-muted-foreground">Een overzicht van de werkweek.</p>
          </div>
          <div className="mt-4 flex items-center gap-2">
            {saving && <span className="text-xs text-muted-foreground">Opslaan…</span>}
            {!unlocked ? (
              <button
                onClick={() => setUnlocked(true)}
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium transition-smooth hover:border-accent"
              >
                <Pencil className="h-4 w-4" /> Bewerken
              </button>
            ) : (
              <button
                onClick={() => setUnlocked(false)}
                className="flex items-center gap-2 rounded-xl border border-accent bg-accent/10 px-4 py-2.5 text-sm font-medium text-accent transition-smooth hover:bg-accent/20"
              >
                <Pencil className="h-4 w-4" /> Bewerkmode aan
              </button>
            )}
          </div>
        </div>

        {loading && (
          <p className="text-sm text-muted-foreground mb-6">Planning laden…</p>
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
                  <div className="flex gap-2 flex-wrap">
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

        <div className="grid gap-6 lg:grid-cols-3">
          {week.map((d, dayIdx) => (
            <section key={d.day} className="animate-fade-up rounded-3xl border border-border bg-card p-5 shadow-soft" style={{ animationDelay: `${dayIdx * 70}ms` }}>
              <header className="mb-4 border-b border-border pb-3">
                <h2 className="font-display text-xl font-semibold">{d.day}</h2>
              </header>
              <ul className="space-y-2.5">
                {d.blocks.map((b) => (
                  <li key={b.id} className={`group/block rounded-xl border-l-4 px-3 py-2.5 transition-smooth ${toneBg[b.tone]}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          <Clock className="h-3 w-3" /> {b.time}
                        </div>
                        <p className="mt-0.5 text-sm font-semibold leading-tight">{b.title}</p>
                        {b.subject && <p className="text-xs text-muted-foreground">{b.subject}</p>}
                      </div>
                      {unlocked && (
                        <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover/block:opacity-100">
                          <button onClick={() => startEdit(dayIdx, b)} className="rounded-lg p-1 hover:bg-accent/20">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => deleteBlock(dayIdx, b.id)} className="rounded-lg p-1 hover:bg-destructive/20 hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              {unlocked && (
                <button onClick={() => addBlock(dayIdx)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2 text-sm text-muted-foreground transition-smooth hover:border-accent hover:text-accent">
                  <Plus className="h-4 w-4" /> Blok toevoegen
                </button>
              )}
            </section>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Planning;
