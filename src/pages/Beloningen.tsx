import { useState, useEffect, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { Plus, Minus, Trash2, Trophy, Star, Lock, ArrowUpRight, X } from "lucide-react";

const VerjaardagTool = lazy(() => import("@/components/VerjaardagTool"));

const SUPABASE_URL = "https://fxcsqxshjnxlknnmfsbv.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4Y3NxeHNoam54bGtubm1mc2J2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMzQwNTgsImV4cCI6MjA5MzcxMDA1OH0.MVp882LWEZVMW33l1Ld94BnFbvCrIzStq02-9ylpYnc";

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
};

type Reward = { id: number; label: string; goal: number; claimed: boolean };

type Unlockable =
  | { id: string; emoji: string; naam: string; punten: number; desc: string; type: "href"; href: string }
  | { id: string; emoji: string; naam: string; punten: number; desc: string; type: "route"; route: string }
  | { id: string; emoji: string; naam: string; punten: number; desc: string; type: "mop" }
  | { id: string; emoji: string; naam: string; punten: number; desc: string; type: "feest" };

const UNLOCKABLES: Unlockable[] = [
  { id: "muziek",  emoji: "🎵", naam: "Muziek aan",      punten: 10,  desc: "Zet Spotify aan als achtergrondmuziek",            type: "href",  href: "https://open.spotify.com" },
  { id: "tekenen", emoji: "🎨", naam: "Vrij tekenen",    punten: 20,  desc: "Iedereen mag vrij tekenen op het whiteboard",      type: "route", route: "/whiteboard" },
  { id: "spellen", emoji: "🎮", naam: "Klassikaal spel", punten: 30,  desc: "Kies samen een spel uit de spellenhoek",            type: "route", route: "/spellen" },
  { id: "filmpje", emoji: "🎬", naam: "Filmpje kijken",  punten: 40,  desc: "Zoek samen een leuk filmpje op YouTube",           type: "href",  href: "https://youtube.com" },
  { id: "mop",     emoji: "🤣", naam: "Moppenshow",      punten: 50,  desc: "De meester vertelt zijn allerslechtste mop",       type: "mop" },
  { id: "math",    emoji: "🏆", naam: "99math battle",   punten: 60,  desc: "Klassikaal tafels-battle op 99math.com",            type: "href",  href: "https://99math.com" },
  { id: "dans",    emoji: "💃", naam: "Danspauze",       punten: 75,  desc: "3 minuten dansen — stilzitten is verboden!",       type: "href",  href: "https://open.spotify.com" },
  { id: "feest",   emoji: "🎉", naam: "Klasfeestje",     punten: 100, desc: "Een groot feest voor de hele klas!",                type: "feest" },
];

const MOPPEN = [
  "Wat zegt een nul tegen een acht?\n\n'Mooi riem heb je aan!'",
  "Hoe noem je een boemerang die niet terugkomt?\n\nEen stok.",
  "Wat heeft vier wielen en vliegt?\n\nEen vuilniswagen.",
  "Waarom snauwt een hond?\n\nOmdat hij niet kan snateren.",
  "Wat is snel, groen en gevaarlijk?\n\nEen kikker met een brommer.",
  "Waarom huilt een banaan?\n\nOmdat hij zijn schil kwijt is.",
  "Knock knock! — Wie is daar? — Koe. — Koe wie?\n\nKoe-lderboe! 🐄",
  "Wat is bruin en plakt aan het plafond?\n\nEen domme karamel.",
  "Waarom had de wiskundeleraar een liniaal?\n\nOm de grenzen aan te geven.",
  "Hoe noem je een vis zonder ogen?\n\nEen vs.",
];

const fetchPoints = async (): Promise<number> => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/class_points?id=eq.1&select=value`, { headers });
  const data = await res.json();
  return data?.[0]?.value ?? 0;
};

const updatePoints = async (value: number) => {
  await fetch(`${SUPABASE_URL}/rest/v1/class_points?id=eq.1`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ value }),
  });
};

const fetchRewards = async (): Promise<Reward[]> => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rewards?order=goal.asc`, { headers });
  return res.json();
};

const addReward = async (label: string, goal: number) => {
  await fetch(`${SUPABASE_URL}/rest/v1/rewards`, {
    method: "POST",
    headers,
    body: JSON.stringify({ label, goal, claimed: false }),
  });
};

const toggleClaimed = async (id: number, claimed: boolean) => {
  await fetch(`${SUPABASE_URL}/rest/v1/rewards?id=eq.${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ claimed }),
  });
};

const deleteReward = async (id: number) => {
  await fetch(`${SUPABASE_URL}/rest/v1/rewards?id=eq.${id}`, {
    method: "DELETE",
    headers,
  });
};

const Beloningen = () => {
  const [points, setPoints] = useState<number>(0);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [newGoal, setNewGoal] = useState("");
  const [loading, setLoading] = useState(true);
  const [mop, setMop] = useState<string | null>(null);
  const [showFeest, setShowFeest] = useState(false);

  const load = async () => {
    const [p, r] = await Promise.all([fetchPoints(), fetchRewards()]);
    setPoints(p);
    setRewards(r);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const changePoints = async (delta: number) => {
    const next = Math.max(0, points + delta);
    setPoints(next);
    await updatePoints(next);
  };

  const handleAddReward = async () => {
    const goal = parseInt(newGoal);
    if (!newLabel.trim() || isNaN(goal) || goal <= 0) return;
    await addReward(newLabel.trim(), goal);
    setNewLabel("");
    setNewGoal("");
    const r = await fetchRewards();
    setRewards(r);
  };

  const handleToggle = async (reward: Reward) => {
    await toggleClaimed(reward.id, !reward.claimed);
    setRewards(prev => prev.map(r => r.id === reward.id ? { ...r, claimed: !r.claimed } : r));
  };

  const handleDelete = async (id: number) => {
    await deleteReward(id);
    setRewards(prev => prev.filter(r => r.id !== id));
  };

  const handleUnlock = (item: Unlockable) => {
    if (points < item.punten) return;
    if (item.type === "href") { window.open(item.href, "_blank", "noreferrer"); return; }
    if (item.type === "mop") { setMop(MOPPEN[Math.floor(Math.random() * MOPPEN.length)]); return; }
    if (item.type === "feest") { setShowFeest(true); return; }
  };

  return (
    <div className="min-h-screen bg-paper bg-warm">
      <SiteHeader />
      <main className="container py-10 md:py-14">

        <div className="mb-10 animate-fade-up">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">De klas</p>
          <h1 className="mt-2 font-display text-4xl font-semibold md:text-5xl">Beloningen</h1>
          <p className="mt-3 text-muted-foreground">Spaar punten en verdien beloningen.</p>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Laden…</p>
        ) : (
          <>
            <div className="grid gap-8 lg:grid-cols-2">

              {/* Punten */}
              <div className="animate-fade-up rounded-3xl border border-border bg-card p-5 md:p-8 shadow-soft">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent mb-6">Klassenpunten</p>
                <div className="flex flex-col items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Star className="h-8 w-8 text-highlight fill-highlight" />
                    <span className="font-display text-7xl font-bold">{points}</span>
                    <Star className="h-8 w-8 text-highlight fill-highlight" />
                  </div>
                  <div className="flex flex-wrap justify-center gap-3">
                    {[1, 2, 5].map(n => (
                      <button
                        key={n}
                        onClick={() => changePoints(n)}
                        className="flex items-center gap-1.5 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90"
                      >
                        <Plus className="h-4 w-4" />{n}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap justify-center gap-3">
                    {[1, 2].map(n => (
                      <button
                        key={n}
                        onClick={() => changePoints(-n)}
                        className="flex items-center gap-1.5 rounded-2xl border border-border px-5 py-2.5 text-sm font-semibold transition-smooth hover:border-accent hover:text-accent"
                      >
                        <Minus className="h-4 w-4" />{n}
                      </button>
                    ))}
                    <button
                      onClick={() => changePoints(-points)}
                      className="flex items-center gap-1.5 rounded-2xl border border-border px-5 py-2.5 text-sm font-semibold transition-smooth hover:border-accent hover:text-accent"
                    >
                      <Minus className="h-4 w-4" /> Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* Beloningen */}
              <div className="animate-fade-up flex flex-col gap-4" style={{ animationDelay: "60ms" }}>
                <div className="rounded-3xl border border-border bg-card p-4 md:p-6 shadow-soft">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent mb-4">Nieuwe beloning</p>
                  <div className="flex flex-col gap-3">
                    <input
                      value={newLabel}
                      onChange={e => setNewLabel(e.target.value)}
                      placeholder="Naam van de beloning…"
                      className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
                    />
                    <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                      <input
                        value={newGoal}
                        onChange={e => setNewGoal(e.target.value)}
                        placeholder="Punten nodig"
                        type="number"
                        min={1}
                        className="w-full sm:w-36 rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
                      />
                      <button
                        onClick={handleAddReward}
                        className="flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-smooth hover:opacity-90"
                      >
                        <Plus className="h-4 w-4" /> Toevoegen
                      </button>
                    </div>
                  </div>
                </div>

                <ul className="flex flex-col gap-3">
                  {rewards.length === 0 && (
                    <p className="text-sm text-muted-foreground">Nog geen beloningen toegevoegd.</p>
                  )}
                  {rewards.map(r => {
                    const pct = Math.min(1, points / r.goal);
                    const reached = points >= r.goal;
                    return (
                      <li
                        key={r.id}
                        className={`rounded-2xl border p-4 shadow-soft transition-smooth ${
                          r.claimed
                            ? "border-border bg-muted/40 opacity-60"
                            : reached
                            ? "border-highlight bg-highlight/10"
                            : "border-border bg-card"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <Trophy className={`h-5 w-5 shrink-0 ${reached && !r.claimed ? "text-highlight" : "text-muted-foreground"}`} />
                            <div>
                              <p className={`font-semibold leading-tight ${r.claimed ? "line-through text-muted-foreground" : ""}`}>
                                {r.label}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">{points} / {r.goal} punten</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {reached && !r.claimed && (
                              <button
                                onClick={() => handleToggle(r)}
                                className="rounded-xl bg-highlight px-3 py-1.5 text-xs font-semibold text-highlight-foreground transition-smooth hover:opacity-90"
                              >
                                Uitdelen
                              </button>
                            )}
                            {r.claimed && (
                              <button
                                onClick={() => handleToggle(r)}
                                className="rounded-xl border border-border px-3 py-1.5 text-xs font-medium transition-smooth hover:border-accent"
                              >
                                Ongedaan
                              </button>
                            )}
                            <button onClick={() => handleDelete(r.id)} className="text-muted-foreground transition-smooth hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        {!r.claimed && (
                          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-highlight transition-all duration-500"
                              style={{ width: `${pct * 100}%` }}
                            />
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Unlockable content */}
            <section className="mt-14 animate-fade-up" style={{ animationDelay: "120ms" }}>
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Klassenpunten</p>
                <h2 className="mt-1 font-display text-2xl font-semibold md:text-3xl">Unlockable content</h2>
                <p className="mt-1 text-sm text-muted-foreground">Spaar genoeg punten om dit vrij te spelen.</p>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {UNLOCKABLES.map(item => {
                  const unlocked = points >= item.punten;
                  const inner = (
                    <div
                      className={`relative flex h-40 flex-col justify-between rounded-3xl border-2 p-5 transition-smooth ${
                        unlocked
                          ? "border-accent bg-accent/5 shadow-tile hover:-translate-y-1 hover:shadow-tile cursor-pointer"
                          : "border-border bg-card opacity-50 cursor-not-allowed"
                      }`}
                    >
                      {!unlocked && (
                        <Lock className="absolute right-4 top-4 h-4 w-4 text-muted-foreground" />
                      )}
                      {unlocked && (
                        <ArrowUpRight className="absolute right-4 top-4 h-4 w-4 text-accent opacity-60" />
                      )}
                      <span className="text-3xl">{item.emoji}</span>
                      <div>
                        <p className="font-display font-semibold leading-tight">{item.naam}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground truncate">{item.desc}</p>
                        <p className={`mt-1 text-xs font-semibold ${unlocked ? "text-accent" : "text-muted-foreground"}`}>
                          {unlocked ? "Ontgrendeld!" : `${item.punten} ⭐ nodig`}
                        </p>
                      </div>
                    </div>
                  );

                  if (!unlocked) return <div key={item.id}>{inner}</div>;
                  if (item.type === "route") return <Link key={item.id} to={item.route}>{inner}</Link>;
                  return <button key={item.id} onClick={() => handleUnlock(item)} className="text-left">{inner}</button>;
                })}
              </div>
            </section>
          </>
        )}

        <footer className="mt-20 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          Meester Stijn
        </footer>
      </main>

      {/* Mop popup */}
      {mop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-tile mx-4">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-display text-xl font-semibold">🤣 Moppenshow</p>
              <button onClick={() => setMop(null)} className="rounded-xl border border-border p-1.5 transition-smooth hover:border-accent">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-lg leading-relaxed whitespace-pre-line">{mop}</p>
            <button
              onClick={() => setMop(MOPPEN[Math.floor(Math.random() * MOPPEN.length)])}
              className="mt-6 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-smooth hover:opacity-90"
            >
              Nog een mop
            </button>
          </div>
        </div>
      )}

      {/* Klasfeestje */}
      {showFeest && (
        <Suspense fallback={null}>
          <VerjaardagTool onClose={() => setShowFeest(false)} />
        </Suspense>
      )}
    </div>
  );
};

export default Beloningen;
