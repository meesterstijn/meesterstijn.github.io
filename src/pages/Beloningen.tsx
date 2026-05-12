import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { Plus, Minus, Trash2, Trophy, Star, ArrowUpRight, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { FieldItemSVG, VELD_ITEMS, type FieldItemType } from "@/components/FieldItemSVG";

const STARS_PER_ITEM = 5;
const TODAY = new Date().toISOString().split("T")[0];

type Reward    = { id: number; label: string; goal: number; claimed: boolean };
type FieldItem = { type: FieldItemType };

// ── Supabase helpers ──────────────────────────────────────────────────────────
const loadClassData = async () => {
  const { data } = await supabase
    .from("class_points")
    .select("value, unlock_stars, last_reset_date")
    .eq("id", 1)
    .single();
  return data ?? { value: 0, unlock_stars: 0, last_reset_date: null };
};

const fetchRewards    = async (): Promise<Reward[]> => {
  const { data } = await supabase.from("rewards").select("*").order("goal", { ascending: true });
  return data ?? [];
};
const fetchFieldItems = async (): Promise<FieldItem[]> => {
  const { data } = await supabase.from("field_items").select("type");
  return (data ?? []) as FieldItem[];
};

const setDailyPoints   = (v: number) =>
  supabase.from("class_points").update({ value: v }).eq("id", 1);
const setUnlockStars   = (v: number) =>
  supabase.from("class_points").update({ unlock_stars: v }).eq("id", 1);
const resetDailyPoints = () =>
  supabase.from("class_points").update({ value: 0, last_reset_date: TODAY }).eq("id", 1);

const insertFieldItem = (type: FieldItemType) =>
  supabase.from("field_items").insert({ type, x: 50, y: 50 });

const deleteFieldItem = (type: FieldItemType) =>
  supabase.from("field_items").delete().eq("type", type);

const addReward    = (label: string, goal: number) =>
  supabase.from("rewards").insert({ label, goal, claimed: false });
const toggleClaimed = (id: number, claimed: boolean) =>
  supabase.from("rewards").update({ claimed }).eq("id", id);
const deleteReward  = (id: number) =>
  supabase.from("rewards").delete().eq("id", id);

// ── Component ─────────────────────────────────────────────────────────────────
const Beloningen = () => {
  const [points,      setPoints]      = useState(0);
  const [unlockStars, setUnlockStarsS] = useState(0);
  const [rewards,     setRewards]     = useState<Reward[]>([]);
  const [fieldItems,  setFieldItems]  = useState<FieldItem[]>([]);
  const [newLabel,    setNewLabel]    = useState("");
  const [newGoal,     setNewGoal]     = useState("");
  const [loading,     setLoading]     = useState(true);
  const [justUnlocked, setJustUnlocked] = useState<FieldItemType | null>(null);

  // ── Boot ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const [cd, rw, fi] = await Promise.all([loadClassData(), fetchRewards(), fetchFieldItems()]);

      // Daily reset
      let dailyPoints = cd.value;
      if (cd.last_reset_date !== TODAY) {
        await resetDailyPoints();
        dailyPoints = 0;
      }

      // Auto-unlock items based on cumulative unlock_stars
      const stars = cd.unlock_stars ?? 0;
      const unlockedCount = Math.min(Math.floor(stars / STARS_PER_ITEM), VELD_ITEMS.length);
      const unlockedTypes = new Set(fi.map(f => f.type));
      const toInsert = VELD_ITEMS.slice(0, unlockedCount).filter(v => !unlockedTypes.has(v.type));
      if (toInsert.length > 0) {
        for (const v of toInsert) {
          if (v.replaces) await deleteFieldItem(v.replaces);
          await insertFieldItem(v.type);
        }
        const fresh = await fetchFieldItems();
        setFieldItems(fresh);
      } else {
        setFieldItems(fi);
      }

      setPoints(dailyPoints);
      setUnlockStarsS(stars);
      setRewards(rw);
      setLoading(false);
    })();
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const unlockedTypes  = new Set(fieldItems.map(f => f.type));
  const unlockedCount  = Math.min(Math.floor(unlockStars / STARS_PER_ITEM), VELD_ITEMS.length);
  const starsProgress  = unlockStars % STARS_PER_ITEM;
  const nextItem       = VELD_ITEMS[unlockedCount];
  const allDone        = unlockedCount >= VELD_ITEMS.length;
  // Map basic type → luxury type that replaces it
  const upgradedBy     = new Map(VELD_ITEMS.filter(v => v.replaces).map(v => [v.replaces!, v.type]));

  // ── Daily points ──────────────────────────────────────────────────────────
  const changePoints = async (delta: number) => {
    const next = Math.max(0, points + delta);
    setPoints(next);
    await setDailyPoints(next);
  };

  // ── Unlock stars ──────────────────────────────────────────────────────────
  const addUnlockStars = async (n: number) => {
    const next    = unlockStars + n;
    const newCount = Math.min(Math.floor(next / STARS_PER_ITEM), VELD_ITEMS.length);

    setUnlockStarsS(next);
    await setUnlockStars(next);

    // Check for new unlocks
    for (let i = unlockedCount; i < newCount; i++) {
      const item = VELD_ITEMS[i];
      if (!unlockedTypes.has(item.type)) {
        if (item.replaces) {
          await deleteFieldItem(item.replaces);
          setFieldItems(prev => prev.filter(f => f.type !== item.replaces));
        }
        await insertFieldItem(item.type);
        setFieldItems(prev => [...prev, { type: item.type }]);
        setJustUnlocked(item.type);
        setTimeout(() => setJustUnlocked(null), 2500);
      }
    }
  };

  // ── Custom rewards ────────────────────────────────────────────────────────
  const handleAddReward = async () => {
    const goal = parseInt(newGoal);
    if (!newLabel.trim() || isNaN(goal) || goal <= 0) return;
    await addReward(newLabel.trim(), goal);
    setNewLabel(""); setNewGoal("");
    setRewards(await fetchRewards());
  };
  const handleToggle = async (r: Reward) => {
    await toggleClaimed(r.id, !r.claimed);
    setRewards(p => p.map(x => x.id === r.id ? { ...x, claimed: !x.claimed } : x));
  };
  const handleDelete = async (id: number) => {
    await deleteReward(id);
    setRewards(p => p.filter(x => x.id !== id));
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-paper bg-warm">
      <SiteHeader />
      <main className="container py-10 md:py-14">

        <div className="mb-10 animate-fade-up">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">De klas</p>
          <h1 className="mt-2 font-display text-4xl font-semibold md:text-5xl">Beloningen</h1>
          <p className="mt-3 text-muted-foreground">Spaar punten, verdien beloningen en bouw het veld op.</p>
        </div>

        {loading ? <p className="text-muted-foreground">Laden…</p> : (
          <div className="flex flex-col gap-10">

            {/* ── Rij 1: dagpunten + eigen beloningen ── */}
            <div className="grid gap-8 lg:grid-cols-2">

              {/* Klassenpunten (dagelijks) */}
              <div className="animate-fade-up rounded-3xl border border-border bg-card p-5 md:p-8 shadow-soft">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Klassenpunten</p>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">reset elke dag</span>
                </div>
                <div className="flex flex-col items-center gap-6 mt-5">
                  <div className="flex items-center gap-2">
                    <Star className="h-8 w-8 text-highlight fill-highlight" />
                    <span className="font-display text-7xl font-bold">{points}</span>
                    <Star className="h-8 w-8 text-highlight fill-highlight" />
                  </div>
                  <div className="flex flex-wrap justify-center gap-3">
                    <button onClick={() => changePoints(-1)}
                      className="flex items-center gap-1.5 rounded-2xl border border-border px-5 py-2.5 text-sm font-semibold transition-smooth hover:border-accent hover:text-accent">
                      <Minus className="h-4 w-4" />1
                    </button>
                    <button onClick={() => changePoints(1)}
                      className="flex items-center gap-1.5 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90">
                      <Plus className="h-4 w-4" />1
                    </button>
                    <button onClick={() => changePoints(-points)}
                      className="flex items-center gap-1.5 rounded-2xl border border-border px-5 py-2.5 text-sm font-semibold transition-smooth hover:border-accent hover:text-accent">
                      <Minus className="h-4 w-4" />Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* Eigen beloningen */}
              <div className="animate-fade-up flex flex-col gap-4" style={{ animationDelay: "60ms" }}>
                <div className="rounded-3xl border border-border bg-card p-4 md:p-6 shadow-soft">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent mb-4">Nieuwe beloning</p>
                  <div className="flex flex-col gap-3">
                    <input value={newLabel} onChange={e => setNewLabel(e.target.value)}
                      placeholder="Naam van de beloning…"
                      className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent" />
                    <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                      <input value={newGoal} onChange={e => setNewGoal(e.target.value)}
                        placeholder="Punten nodig" type="number" min={1}
                        className="w-full sm:w-36 rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent" />
                      <button onClick={handleAddReward}
                        className="flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-smooth hover:opacity-90">
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
                    const pct     = Math.min(1, points / r.goal);
                    const reached = points >= r.goal;
                    return (
                      <li key={r.id} className={`rounded-2xl border p-4 shadow-soft transition-smooth ${
                        r.claimed ? "border-border bg-muted/40 opacity-60"
                          : reached ? "border-highlight bg-highlight/10"
                          : "border-border bg-card"}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <Trophy className={`h-5 w-5 shrink-0 ${reached && !r.claimed ? "text-highlight" : "text-muted-foreground"}`} />
                            <div>
                              <p className={`font-semibold leading-tight ${r.claimed ? "line-through text-muted-foreground" : ""}`}>{r.label}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{points} / {r.goal} punten</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {reached && !r.claimed && (
                              <button onClick={() => handleToggle(r)}
                                className="rounded-xl bg-highlight px-3 py-1.5 text-xs font-semibold text-highlight-foreground transition-smooth hover:opacity-90">
                                Uitdelen
                              </button>
                            )}
                            {r.claimed && (
                              <button onClick={() => handleToggle(r)}
                                className="rounded-xl border border-border px-3 py-1.5 text-xs font-medium transition-smooth hover:border-accent">
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
                            <div className="h-full rounded-full bg-highlight transition-all duration-500" style={{ width: `${pct * 100}%` }} />
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* ── Rij 2: unlock sterren ── */}
            <section className="animate-fade-up rounded-3xl border border-border bg-card p-6 md:p-8 shadow-soft" style={{ animationDelay: "80ms" }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Veld vrijspelen</p>
                  <h2 className="mt-1 font-display text-2xl font-semibold">Unlock sterren</h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">Sterren lopen altijd op en worden onthouden.</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  <span className="font-display text-2xl font-bold">{unlockStars}</span>
                  <span className="text-sm text-muted-foreground">totaal</span>
                </div>
              </div>

              <div className="grid gap-8 md:grid-cols-2">

                {/* Linker kolom: volgende item + voortgang */}
                <div className="flex flex-col items-center gap-4">
                  {allDone ? (
                    <div className="flex flex-col items-center gap-3 rounded-2xl bg-green-50 border border-green-200 px-8 py-8 text-center">
                      <span className="text-4xl">🎉</span>
                      <p className="font-display text-lg font-semibold text-green-700">Alle items vrijgespeeld!</p>
                      <p className="text-sm text-green-600">Het veld is compleet.</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-muted-foreground">
                        {nextItem?.replaces ? "Upgrade: " : "Volgende: "}
                        <span className="font-semibold text-foreground">{nextItem?.label}</span>
                        {nextItem?.replaces && (
                          <span className="ml-1.5 text-xs text-amber-600">
                            (vervangt {VELD_ITEMS.find(v => v.type === nextItem.replaces)?.label})
                          </span>
                        )}
                      </p>

                      {/* Next item preview */}
                      <div className={`relative flex items-center justify-center rounded-2xl border-2 p-6 transition-all duration-500 ${
                        justUnlocked === nextItem?.type
                          ? "border-amber-400 bg-amber-50 scale-105"
                          : starsProgress >= 8
                          ? "border-amber-300 bg-amber-50/50"
                          : "border-border bg-muted/30"
                      }`} style={{ width: 140, height: 140 }}>
                        {justUnlocked === nextItem?.type && (
                          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-amber-400/20 text-2xl animate-pulse">🌟</div>
                        )}
                        <div style={{ width: 90, height: 90, opacity: starsProgress >= 8 ? 1 : 0.4, filter: starsProgress < 8 ? "grayscale(0.8)" : "none", transition: "all 0.3s" }}>
                          {nextItem && <FieldItemSVG type={nextItem.type} />}
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full">
                        <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                          <span>{starsProgress} / {STARS_PER_ITEM} sterren</span>
                          <span>{STARS_PER_ITEM - starsProgress} nog te gaan</span>
                        </div>
                        <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-amber-400 transition-all duration-500"
                            style={{ width: `${(starsProgress / STARS_PER_ITEM) * 100}%` }}
                          />
                        </div>
                        {/* Star dots */}
                        <div className="mt-2 flex justify-between px-0.5">
                          {Array.from({ length: STARS_PER_ITEM }, (_, i) => (
                            <Star key={i} className={`h-3.5 w-3.5 transition-all ${i < starsProgress ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* +ster knop */}
                  {!allDone && (
                    <div className="flex gap-3 mt-2">
                      <button onClick={() => addUnlockStars(1)}
                        className="flex items-center gap-1.5 rounded-2xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-amber-900 transition-smooth hover:bg-amber-300 shadow-sm">
                        <Star className="h-3.5 w-3.5 fill-amber-800" />+1
                      </button>
                    </div>
                  )}
                </div>

                {/* Rechter kolom: alle items status */}
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {unlockedCount} / {VELD_ITEMS.length} vrijgespeeld
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {VELD_ITEMS.map((item, i) => {
                      const isUnlocked  = unlockedTypes.has(item.type);
                      const isNext      = i === unlockedCount;
                      const isUpgrade   = !!item.replaces;
                      const upgradeType = upgradedBy.get(item.type);
                      const isReplaced  = upgradeType ? unlockedTypes.has(upgradeType) : false;
                      return (
                        <div key={item.type} className={`flex items-center gap-2.5 rounded-xl border p-2.5 transition-smooth ${
                          isReplaced    ? "border-border bg-muted/10 opacity-35"
                            : isUnlocked && isUpgrade ? "border-amber-400 bg-amber-50/60"
                            : isUnlocked ? "border-green-300 bg-green-50/60"
                            : isNext     ? "border-amber-300 bg-amber-50/40"
                            : "border-border bg-muted/20 opacity-50"}`}>
                          <div style={{ width: 36, height: 36, flexShrink: 0, filter: (isUnlocked && !isReplaced) ? "none" : "grayscale(1)", opacity: (isUnlocked && !isReplaced) ? 1 : 0.5 }}>
                            <FieldItemSVG type={item.type} />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold">{item.label}</p>
                            {isReplaced
                              ? <p className="text-xs text-muted-foreground">↑ geüpgraded</p>
                              : isUnlocked && isUpgrade
                              ? <p className="text-xs text-amber-600">✦ upgrade</p>
                              : isUnlocked
                              ? <p className="text-xs text-green-600">✓ vrij</p>
                              : isNext
                              ? <p className="text-xs text-amber-600">← volgende</p>
                              : <Lock className="mt-0.5 h-3 w-3 text-muted-foreground/50" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* ── Bloemenveld link ── */}
            <section className="animate-fade-up" style={{ animationDelay: "120ms" }}>
              <Link to="/bloemenveld"
                className="inline-flex items-center gap-4 rounded-3xl border border-border bg-card px-8 py-5 shadow-soft transition-smooth hover:border-accent hover:shadow-tile">
                <span className="text-4xl">🌸</span>
                <div>
                  <p className="font-display text-lg font-semibold">Bekijk het bloemenveld</p>
                  <p className="text-sm text-muted-foreground">Zie welke bloemen en decoraties er al staan</p>
                </div>
                <ArrowUpRight className="ml-4 h-5 w-5 text-accent opacity-60" />
              </Link>
            </section>

          </div>
        )}

        <footer className="mt-20 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          Meester Stijn
        </footer>
      </main>
    </div>
  );
};

export default Beloningen;
