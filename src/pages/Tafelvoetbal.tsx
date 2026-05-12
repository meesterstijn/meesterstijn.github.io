import { useState, useEffect } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Plus, Trash2, Medal, Swords, X, Trophy } from "lucide-react";
import { supabase } from "@/lib/supabase";

// ── Types ─────────────────────────────────────────────────────────────────────
type Player     = { id: string; name: string; };
type Tournament = { id: string; name: string; status: string; created_at: string; };
type Group      = { id: string; tournament_id: string; name: string; };
type GroupPlayer = { id: string; group_id: string; player_id: string; };
type Match = {
  id: string; tournament_id: string; group_id: string | null;
  match_type: "1v1" | "2v2";
  player1a_id: string; player1b_id: string | null;
  player2a_id: string; player2b_id: string | null;
  score1: number; score2: number; played_at: string;
};
type Standing = {
  player_id: string; name: string;
  gp: number; w: number; d: number; l: number;
  gf: number; ga: number; pts: number;
};
type Tab = "ranglijst" | "wedstrijden" | "poules" | "spelers";

// ── Standings berekening ──────────────────────────────────────────────────────
const calcStandings = (players: Player[], matches: Match[], filterIds?: Set<string>): Standing[] => {
  const relevant = filterIds ? players.filter(p => filterIds.has(p.id)) : players;
  const map = new Map<string, Standing>(
    relevant.map(p => [p.id, { player_id: p.id, name: p.name, gp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 }])
  );
  for (const m of matches) {
    const t1 = [m.player1a_id, m.player1b_id].filter((x): x is string => !!x);
    const t2 = [m.player2a_id, m.player2b_id].filter((x): x is string => !!x);
    const r1 = m.score1 > m.score2 ? "w" : m.score1 < m.score2 ? "l" : "d";
    const r2 = m.score2 > m.score1 ? "w" : m.score2 < m.score1 ? "l" : "d";
    for (const pid of t1) {
      const s = map.get(pid); if (!s) continue;
      s.gp++; s.gf += m.score1; s.ga += m.score2;
      if (r1 === "w") { s.w++; s.pts += 3; } else if (r1 === "d") { s.d++; s.pts++; } else s.l++;
    }
    for (const pid of t2) {
      const s = map.get(pid); if (!s) continue;
      s.gp++; s.gf += m.score2; s.ga += m.score1;
      if (r2 === "w") { s.w++; s.pts += 3; } else if (r2 === "d") { s.d++; s.pts++; } else s.l++;
    }
  }
  return [...map.values()].sort((a, b) =>
    b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf
  );
};

const pname = (players: Player[], id: string | null) =>
  id ? (players.find(p => p.id === id)?.name ?? "?") : null;

// ── Ranglijst tabel ───────────────────────────────────────────────────────────
const StandingsTable = ({ standings, title }: { standings: Standing[]; title?: string }) => {
  const medalCls = (i: number) =>
    i === 0 ? "fill-amber-400 text-amber-400"
    : i === 1 ? "fill-slate-400 text-slate-400"
    : "fill-orange-500 text-orange-500";
  return (
    <div>
      {title && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent">{title}</p>}
      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground">#</th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground">Naam</th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-muted-foreground">W</th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-green-600">G</th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-muted-foreground">Gl</th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-destructive/60">V</th>
              <th className="px-3 py-3 text-center text-xs font-semibold text-muted-foreground">Dts</th>
              <th className="px-3 py-3 text-center text-xs font-bold text-foreground">Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.length === 0 && (
              <tr><td colSpan={8} className="px-3 py-5 text-center text-xs text-muted-foreground">Nog geen wedstrijden gespeeld</td></tr>
            )}
            {standings.map((s, i) => (
              <tr key={s.player_id} className="border-b border-border/40 last:border-0 hover:bg-muted/10 transition-colors">
                <td className="px-3 py-2.5 text-center w-8">
                  {i < 3 && s.gp > 0
                    ? <Medal className={`h-4 w-4 mx-auto ${medalCls(i)}`} />
                    : <span className="text-xs text-muted-foreground">{i + 1}</span>}
                </td>
                <td className="px-3 py-2.5 font-semibold">{s.name}</td>
                <td className="px-3 py-2.5 text-center text-xs text-muted-foreground">{s.gp}</td>
                <td className="px-3 py-2.5 text-center text-xs font-medium text-green-600">{s.w}</td>
                <td className="px-3 py-2.5 text-center text-xs text-muted-foreground">{s.d}</td>
                <td className="px-3 py-2.5 text-center text-xs text-destructive/70">{s.l}</td>
                <td className="px-3 py-2.5 text-center text-xs text-muted-foreground">
                  {s.gf > 0 || s.ga > 0 ? `${s.gf}−${s.ga}` : "–"}
                </td>
                <td className="px-3 py-2.5 text-center font-bold">{s.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground/60">W=gespeeld · G=gewonnen · Gl=gelijk · V=verloren · Dts=doelpuntensaldo · Pts=punten (W=3, Gl=1)</p>
    </div>
  );
};

// ── Pagina ────────────────────────────────────────────────────────────────────
const Tafelvoetbal = () => {
  const [tab,         setTab]         = useState<Tab>("ranglijst");
  const [players,     setPlayers]     = useState<Player[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [tournament,  setTournament]  = useState<Tournament | null>(null);
  const [groups,      setGroups]      = useState<Group[]>([]);
  const [groupPlayers,setGroupPlayers]= useState<GroupPlayer[]>([]);
  const [matches,     setMatches]     = useState<Match[]>([]);
  const [loading,     setLoading]     = useState(true);

  // Match formulier
  const [matchType, setMatchType] = useState<"1v1" | "2v2">("1v1");
  const [p1a, setP1a] = useState(""); const [p1b, setP1b] = useState("");
  const [p2a, setP2a] = useState(""); const [p2b, setP2b] = useState("");
  const [s1,  setS1]  = useState("0"); const [s2,  setS2]  = useState("0");
  const [selGroup, setSelGroup] = useState("");

  // Andere formulieren
  const [newPlayerName,     setNewPlayerName]     = useState("");
  const [newTournamentName, setNewTournamentName] = useState("");
  const [showNewTournament, setShowNewTournament] = useState(false);

  const loadTournamentData = async (t: Tournament) => {
    const { data: g } = await supabase
      .from("tf_groups").select("*").eq("tournament_id", t.id).order("name");
    const gs = (g ?? []) as Group[];
    setGroups(gs);
    if (gs.length > 0) {
      const { data: gp } = await supabase
        .from("tf_group_players").select("*").in("group_id", gs.map(x => x.id));
      setGroupPlayers((gp ?? []) as GroupPlayer[]);
    } else {
      setGroupPlayers([]);
    }
    const { data: m } = await supabase
      .from("tf_matches").select("*").eq("tournament_id", t.id).order("played_at", { ascending: false });
    setMatches((m ?? []) as Match[]);
  };

  useEffect(() => {
    (async () => {
      const [{ data: p }, { data: t }] = await Promise.all([
        supabase.from("tf_players").select("*").order("name"),
        supabase.from("tf_tournaments").select("*").order("created_at", { ascending: false }),
      ]);
      setPlayers((p ?? []) as Player[]);
      const ts = (t ?? []) as Tournament[];
      setTournaments(ts);
      const active = ts.find(x => x.status === "active") ?? ts[0] ?? null;
      setTournament(active);
      if (active) await loadTournamentData(active);
      setLoading(false);
    })();
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleAddPlayer = async () => {
    const name = newPlayerName.trim(); if (!name) return;
    const { data } = await supabase.from("tf_players").insert({ name }).select().single();
    if (data) setPlayers(prev => [...prev, data as Player].sort((a, b) => a.name.localeCompare(b.name)));
    setNewPlayerName("");
  };

  const handleDeletePlayer = async (id: string) => {
    if (!window.confirm("Speler verwijderen?")) return;
    await supabase.from("tf_players").delete().eq("id", id);
    setPlayers(prev => prev.filter(p => p.id !== id));
  };

  const handleCreateTournament = async () => {
    const name = newTournamentName.trim(); if (!name) return;
    if (tournament?.status === "active") {
      await supabase.from("tf_tournaments").update({ status: "finished" }).eq("id", tournament.id);
      setTournaments(prev => prev.map(x => x.id === tournament.id ? { ...x, status: "finished" } : x));
    }
    const { data } = await supabase.from("tf_tournaments").insert({ name, status: "active" }).select().single();
    if (data) {
      const t = data as Tournament;
      setTournaments(prev => [t, ...prev]);
      setTournament(t);
      setGroups([]); setGroupPlayers([]); setMatches([]);
    }
    setNewTournamentName(""); setShowNewTournament(false);
  };

  const handleAddGroup = async () => {
    if (!tournament) return;
    const name = `Poule ${String.fromCharCode(65 + groups.length)}`;
    const { data } = await supabase.from("tf_groups").insert({ tournament_id: tournament.id, name }).select().single();
    if (data) setGroups(prev => [...prev, data as Group]);
  };

  const handleDeleteGroup = async (id: string) => {
    if (!window.confirm("Poule verwijderen?")) return;
    await supabase.from("tf_groups").delete().eq("id", id);
    setGroups(prev => prev.filter(g => g.id !== id));
    setGroupPlayers(prev => prev.filter(gp => gp.group_id !== id));
  };

  const handleAddPlayerToGroup = async (groupId: string, playerId: string) => {
    if (!playerId) return;
    if (groupPlayers.some(gp => gp.group_id === groupId && gp.player_id === playerId)) return;
    const { data } = await supabase.from("tf_group_players").insert({ group_id: groupId, player_id: playerId }).select().single();
    if (data) setGroupPlayers(prev => [...prev, data as GroupPlayer]);
  };

  const handleRemovePlayerFromGroup = async (id: string) => {
    await supabase.from("tf_group_players").delete().eq("id", id);
    setGroupPlayers(prev => prev.filter(gp => gp.id !== id));
  };

  const handleAddMatch = async () => {
    if (!tournament || !p1a || !p2a) return;
    if (matchType === "2v2" && (!p1b || !p2b)) return;
    const { data } = await supabase.from("tf_matches").insert({
      tournament_id: tournament.id,
      group_id:      selGroup || null,
      match_type:    matchType,
      player1a_id:   p1a,
      player1b_id:   matchType === "2v2" ? p1b : null,
      player2a_id:   p2a,
      player2b_id:   matchType === "2v2" ? p2b : null,
      score1:        parseInt(s1) || 0,
      score2:        parseInt(s2) || 0,
    }).select().single();
    if (data) setMatches(prev => [data as Match, ...prev]);
    setP1a(""); setP1b(""); setP2a(""); setP2b(""); setS1("0"); setS2("0"); setSelGroup("");
  };

  const handleDeleteMatch = async (id: string) => {
    await supabase.from("tf_matches").delete().eq("id", id);
    setMatches(prev => prev.filter(m => m.id !== id));
  };

  // ── Afgeleide data ────────────────────────────────────────────────────────

  const overallStandings = calcStandings(players, matches);
  const groupStandings = groups.map(g => {
    const ids = new Set(groupPlayers.filter(gp => gp.group_id === g.id).map(gp => gp.player_id));
    return { group: g, standings: calcStandings(players, matches.filter(m => m.group_id === g.id), ids) };
  });

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-paper bg-warm">
      <SiteHeader />
      <main className="container py-10 md:py-14">

        {/* Header */}
        <div className="mb-8 animate-fade-up flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Collega's</p>
            <h1 className="mt-2 font-display text-4xl font-semibold md:text-5xl">Tafelvoetbal</h1>
            {tournament && (
              <p className="mt-1 text-sm text-muted-foreground">
                {tournament.name}
                <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-semibold ${
                  tournament.status === "active" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                }`}>
                  {tournament.status === "active" ? "actief" : "afgelopen"}
                </span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {tournaments.length > 1 && !showNewTournament && (
              <select
                value={tournament?.id ?? ""}
                onChange={async e => {
                  const t = tournaments.find(x => x.id === e.target.value);
                  if (t) { setTournament(t); await loadTournamentData(t); }
                }}
                className="rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none focus:border-accent"
              >
                {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            )}
            {!showNewTournament ? (
              <button
                onClick={() => setShowNewTournament(true)}
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold transition-smooth hover:border-accent"
              >
                <Plus className="h-4 w-4" /> Nieuw toernooi
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={newTournamentName}
                  onChange={e => setNewTournamentName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") handleCreateTournament();
                    if (e.key === "Escape") setShowNewTournament(false);
                  }}
                  placeholder="Naam toernooi…"
                  className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                />
                <button onClick={handleCreateTournament}
                  className="rounded-xl bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground">
                  Aanmaken
                </button>
                <button onClick={() => setShowNewTournament(false)}
                  className="rounded-xl border border-border p-2 hover:border-destructive">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Laden…</p>
        ) : !tournament ? (
          /* Geen toernooi → setup */
          <div className="flex flex-col items-center gap-6 py-20 text-center">
            <div className="rounded-3xl bg-secondary p-6">
              <Swords className="h-12 w-12 text-primary" strokeWidth={1.4} />
            </div>
            <div>
              <p className="font-display text-2xl font-semibold">Nog geen toernooi</p>
              <p className="mt-2 text-muted-foreground">Maak een nieuw toernooi aan om te beginnen.</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                autoFocus
                value={newTournamentName}
                onChange={e => setNewTournamentName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleCreateTournament(); }}
                placeholder="Bijv. Seizoen 2025…"
                className="w-64 rounded-xl border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-accent"
              />
              <button onClick={handleCreateTournament}
                className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
                Aanmaken
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Tab balk */}
            <div className="mb-8 flex gap-1 rounded-2xl border border-border bg-card p-1 shadow-soft w-fit flex-wrap">
              {([
                ["ranglijst",   "Ranglijst"],
                ["wedstrijden", "Wedstrijden"],
                ["poules",      "Poules"],
                ["spelers",     "Spelers"],
              ] as [Tab, string][]).map(([key, label]) => (
                <button key={key} onClick={() => setTab(key)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition-smooth ${
                    tab === key
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}>
                  {label}
                </button>
              ))}
            </div>

            {/* ── Ranglijst ──────────────────────────────────────────────── */}
            {tab === "ranglijst" && (
              <div className="flex flex-col gap-10 animate-fade-up">
                <StandingsTable standings={overallStandings} title="Algehele ranglijst" />
                {groupStandings.length > 0 && (
                  <div className="flex flex-col gap-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Per poule</p>
                    <div className="grid gap-6 md:grid-cols-2">
                      {groupStandings.map(({ group, standings }) => (
                        <StandingsTable key={group.id} standings={standings} title={group.name} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Wedstrijden ────────────────────────────────────────────── */}
            {tab === "wedstrijden" && (
              <div className="flex flex-col gap-6 animate-fade-up">

                {/* Formulier */}
                <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                  <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-accent">Wedstrijd invoeren</p>

                  {/* Type */}
                  <div className="mb-5 flex gap-2">
                    {(["1v1", "2v2"] as const).map(t => (
                      <button key={t} onClick={() => { setMatchType(t); setP1b(""); setP2b(""); }}
                        className={`rounded-xl px-5 py-2 text-sm font-bold transition-smooth ${
                          matchType === t
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "border border-border text-muted-foreground hover:border-accent hover:text-foreground"
                        }`}>
                        {t}
                      </button>
                    ))}
                  </div>

                  <div className="grid gap-5 sm:grid-cols-[1fr_auto_1fr]">
                    {/* Team 1 */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-muted-foreground">
                        {matchType === "2v2" ? "Team 1" : "Speler 1"}
                      </label>
                      <select value={p1a} onChange={e => setP1a(e.target.value)}
                        className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent">
                        <option value="">Kies speler…</option>
                        {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      {matchType === "2v2" && (
                        <select value={p1b} onChange={e => setP1b(e.target.value)}
                          className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent">
                          <option value="">Kies partner…</option>
                          {players.filter(p => p.id !== p1a).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      )}
                    </div>

                    {/* Score */}
                    <div className="flex flex-col items-center justify-end gap-2 sm:pb-0 pb-2">
                      <label className="text-xs font-semibold text-muted-foreground">Score</label>
                      <div className="flex items-center gap-2">
                        <input type="number" min="0" value={s1} onChange={e => setS1(e.target.value)}
                          className="w-16 rounded-xl border border-border bg-background px-2 py-2 text-center text-xl font-bold outline-none focus:border-accent" />
                        <span className="font-display text-xl font-bold text-muted-foreground">–</span>
                        <input type="number" min="0" value={s2} onChange={e => setS2(e.target.value)}
                          className="w-16 rounded-xl border border-border bg-background px-2 py-2 text-center text-xl font-bold outline-none focus:border-accent" />
                      </div>
                    </div>

                    {/* Team 2 */}
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-muted-foreground">
                        {matchType === "2v2" ? "Team 2" : "Speler 2"}
                      </label>
                      <select value={p2a} onChange={e => setP2a(e.target.value)}
                        className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent">
                        <option value="">Kies speler…</option>
                        {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      {matchType === "2v2" && (
                        <select value={p2b} onChange={e => setP2b(e.target.value)}
                          className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent">
                          <option value="">Kies partner…</option>
                          {players.filter(p => p.id !== p2a).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Poule + opslaan */}
                  <div className="mt-5 flex flex-wrap items-end gap-4">
                    {groups.length > 0 && (
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-muted-foreground">Poule (optioneel)</label>
                        <select value={selGroup} onChange={e => setSelGroup(e.target.value)}
                          className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent">
                          <option value="">Geen / vriendschappelijk</option>
                          {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                      </div>
                    )}
                    <button
                      onClick={handleAddMatch}
                      disabled={!p1a || !p2a || (matchType === "2v2" && (!p1b || !p2b))}
                      className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-4 w-4" /> Opslaan
                    </button>
                  </div>
                </div>

                {/* Wedstrijdhistorie */}
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                    Gespeelde wedstrijden ({matches.length})
                  </p>
                  {matches.length === 0 && (
                    <p className="text-sm text-muted-foreground">Nog geen wedstrijden.</p>
                  )}
                  <div className="flex flex-col gap-2">
                    {matches.map(m => {
                      const team1 = m.match_type === "2v2"
                        ? `${pname(players, m.player1a_id)} & ${pname(players, m.player1b_id)}`
                        : pname(players, m.player1a_id);
                      const team2 = m.match_type === "2v2"
                        ? `${pname(players, m.player2a_id)} & ${pname(players, m.player2b_id)}`
                        : pname(players, m.player2a_id);
                      const winner = m.score1 > m.score2 ? 1 : m.score1 < m.score2 ? 2 : 0;
                      const groupName = m.group_id ? groups.find(g => g.id === m.group_id)?.name : null;
                      return (
                        <div key={m.id}
                          className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-soft">
                          <div className="flex flex-1 items-center gap-3 min-w-0 overflow-hidden">
                            <span className={`truncate text-sm font-semibold ${winner === 1 ? "text-foreground" : winner === 0 ? "text-muted-foreground" : "text-muted-foreground/50"}`}>
                              {team1}
                            </span>
                            <div className="flex shrink-0 items-center gap-1">
                              <span className={`min-w-[28px] rounded-lg px-2 py-0.5 text-center text-sm font-bold ${winner === 1 ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                                {m.score1}
                              </span>
                              <span className="text-xs text-muted-foreground">–</span>
                              <span className={`min-w-[28px] rounded-lg px-2 py-0.5 text-center text-sm font-bold ${winner === 2 ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                                {m.score2}
                              </span>
                            </div>
                            <span className={`truncate text-sm font-semibold ${winner === 2 ? "text-foreground" : winner === 0 ? "text-muted-foreground" : "text-muted-foreground/50"}`}>
                              {team2}
                            </span>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            {groupName && (
                              <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent">{groupName}</span>
                            )}
                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{m.match_type}</span>
                            <button onClick={() => handleDeleteMatch(m.id)}
                              className="text-muted-foreground transition-smooth hover:text-destructive">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── Poules ────────────────────────────────────────────────── */}
            {tab === "poules" && (
              <div className="flex flex-col gap-6 animate-fade-up">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Poule-indeling</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Deel spelers in poules in. Wedstrijden kunnen aan een poule worden gekoppeld.
                    </p>
                  </div>
                  <button onClick={handleAddGroup}
                    className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold transition-smooth hover:border-accent hover:shadow-soft">
                    <Plus className="h-4 w-4" /> Poule toevoegen
                  </button>
                </div>

                {groups.length === 0 && (
                  <div className="flex flex-col items-center gap-3 py-12 text-center">
                    <Trophy className="h-10 w-10 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">Nog geen poules. Klik op "Poule toevoegen" om te beginnen.</p>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {groups.map(g => {
                    const gps         = groupPlayers.filter(gp => gp.group_id === g.id);
                    const assignedIds = new Set(gps.map(gp => gp.player_id));
                    const available   = players.filter(p => !assignedIds.has(p.id));
                    return (
                      <div key={g.id} className="rounded-3xl border border-border bg-card p-5 shadow-soft">
                        <div className="mb-4 flex items-center justify-between">
                          <p className="font-display text-lg font-semibold">{g.name}</p>
                          <button onClick={() => handleDeleteGroup(g.id)}
                            className="text-muted-foreground transition-smooth hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mb-3 flex flex-col gap-1.5">
                          {gps.length === 0 && (
                            <p className="text-xs text-muted-foreground italic">Geen spelers toegewezen</p>
                          )}
                          {gps.map(gp => {
                            const player = players.find(p => p.id === gp.player_id);
                            return player ? (
                              <div key={gp.id}
                                className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2">
                                <span className="text-sm font-medium">{player.name}</span>
                                <button onClick={() => handleRemovePlayerFromGroup(gp.id)}
                                  className="text-muted-foreground hover:text-destructive transition-smooth">
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : null;
                          })}
                        </div>
                        {available.length > 0 && (
                          <select
                            value=""
                            onChange={e => { if (e.target.value) handleAddPlayerToGroup(g.id, e.target.value); }}
                            className="w-full rounded-xl border border-dashed border-border bg-background px-3 py-2 text-sm text-muted-foreground outline-none focus:border-accent"
                          >
                            <option value="">+ Speler toevoegen…</option>
                            {available.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                        )}
                        {available.length === 0 && gps.length > 0 && (
                          <p className="text-xs text-muted-foreground/60 text-center">Alle spelers zijn ingedeeld</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Spelers ───────────────────────────────────────────────── */}
            {tab === "spelers" && (
              <div className="flex flex-col gap-6 animate-fade-up">
                <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
                  <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-accent">Speler toevoegen</p>
                  <div className="flex gap-3">
                    <input
                      value={newPlayerName}
                      onChange={e => setNewPlayerName(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") handleAddPlayer(); }}
                      placeholder="Naam collega…"
                      className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent"
                    />
                    <button onClick={handleAddPlayer}
                      className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90">
                      <Plus className="h-4 w-4" /> Toevoegen
                    </button>
                  </div>
                </div>
                {players.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nog geen spelers toegevoegd.</p>
                )}
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {players.map(p => {
                    const st = overallStandings.find(s => s.player_id === p.id);
                    return (
                      <div key={p.id}
                        className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 shadow-soft">
                        <div>
                          <p className="text-sm font-semibold">{p.name}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {st && st.gp > 0
                              ? `${st.gp} wedstr. · ${st.w}W ${st.d}G ${st.l}V · ${st.pts} pts`
                              : "Nog niet gespeeld"}
                          </p>
                        </div>
                        <button onClick={() => handleDeletePlayer(p.id)}
                          className="ml-3 text-muted-foreground transition-smooth hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        <footer className="mt-20 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          Meester Stijn
        </footer>
      </main>
    </div>
  );
};

export default Tafelvoetbal;
