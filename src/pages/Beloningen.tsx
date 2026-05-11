import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { Plus, Minus, Trash2, Trophy, Star, ArrowUpRight } from "lucide-react";

import { supabase } from "@/lib/supabase";

type Reward = { id: number; label: string; goal: number; claimed: boolean };


const fetchPoints = async (): Promise<number> => {
  const { data } = await supabase.from("class_points").select("value").eq("id", 1).single();
  return data?.value ?? 0;
};

const updatePoints = async (value: number) => {
  await supabase.from("class_points").update({ value }).eq("id", 1);
};

const fetchRewards = async (): Promise<Reward[]> => {
  const { data } = await supabase.from("rewards").select("*").order("goal", { ascending: true });
  return data ?? [];
};

const addReward = async (label: string, goal: number) => {
  await supabase.from("rewards").insert({ label, goal, claimed: false });
};

const toggleClaimed = async (id: number, claimed: boolean) => {
  await supabase.from("rewards").update({ claimed }).eq("id", id);
};

const deleteReward = async (id: number) => {
  await supabase.from("rewards").delete().eq("id", id);
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

            {/* Bloemenveld tegel */}
            <section className="mt-14 animate-fade-up" style={{ animationDelay: "120ms" }}>
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Groeien</p>
                <h2 className="mt-1 font-display text-2xl font-semibold md:text-3xl">Bloemenveld</h2>
                <p className="mt-1 text-sm text-muted-foreground">Elke voltooide focustimer laat een bloem groeien in het veld.</p>
              </div>
              <Link
                to="/bloemenveld"
                className="inline-flex items-center gap-4 rounded-3xl border border-border bg-card px-8 py-5 shadow-soft transition-smooth hover:border-accent hover:shadow-tile"
              >
                <span className="text-4xl">🌸</span>
                <div>
                  <p className="font-display text-lg font-semibold">Bekijk het bloemenveld</p>
                  <p className="text-sm text-muted-foreground">Zie welke bloemen de klas al heeft laten groeien</p>
                </div>
                <ArrowUpRight className="ml-4 h-5 w-5 text-accent opacity-60" />
              </Link>
            </section>
          </>
        )}

        <footer className="mt-20 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          Meester Stijn
        </footer>
      </main>

    </div>
  );
};

export default Beloningen;
