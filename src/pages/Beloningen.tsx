import { useState, useEffect } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Plus, Minus, Trash2, Trophy, Star } from "lucide-react";

const SUPABASE_URL = "https://fxcsqxshjnxlknnmfsbv.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4Y3NxeHNoam54bGtubm1mc2J2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMzQwNTgsImV4cCI6MjA5MzcxMDA1OH0.MVp882LWEZVMW33l1Ld94BnFbvCrIzStq02-9ylpYnc";

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
};

type Reward = { id: number; label: string; goal: number; claimed: boolean };

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
          <div className="grid gap-8 lg:grid-cols-2">

            {/* Punten */}
            <div className="animate-fade-up rounded-3xl border border-border bg-card p-8 shadow-soft">
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
              <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent mb-4">Nieuwe beloning</p>
                <div className="flex flex-col gap-3">
                  <input
                    value={newLabel}
                    onChange={e => setNewLabel(e.target.value)}
                    placeholder="Naam van de beloning…"
                    className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
                  />
                  <div className="flex gap-3">
                    <input
                      value={newGoal}
                      onChange={e => setNewGoal(e.target.value)}
                      placeholder="Punten nodig"
                      type="number"
                      min={1}
                      className="w-36 rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
                    />
                    <button
                      onClick={handleAddReward}
                      className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-smooth hover:opacity-90"
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
        )}

        <footer className="mt-20 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          Met liefde gemaakt voor de klas · Meester Stijn
        </footer>
      </main>
    </div>
  );
};

export default Beloningen;
