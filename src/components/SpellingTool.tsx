import { useState, useEffect } from "react";
import { X, Plus, Trash2, Shuffle, ChevronRight, BookOpen } from "lucide-react";

const SUPABASE_URL = "https://fxcsqxshjnxlknnmfsbv.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4Y3NxeHNoam54bGtubm1mc2J2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMzQwNTgsImV4cCI6MjA5MzcxMDA1OH0.MVp882LWEZVMW33l1Ld94BnFbvCrIzStq02-9ylpYnc";
const H = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" };

type Word = { id: number; word: string };

const fetchWords = async (): Promise<Word[]> => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/spelling_words?order=word.asc`, { headers: H });
  return res.json();
};
const addWord = async (word: string) => {
  await fetch(`${SUPABASE_URL}/rest/v1/spelling_words`, { method: "POST", headers: H, body: JSON.stringify({ word }) });
};
const deleteWord = async (id: number) => {
  await fetch(`${SUPABASE_URL}/rest/v1/spelling_words?id=eq.${id}`, { method: "DELETE", headers: H });
};

const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

const SpellingTool = ({ onClose }: { onClose: () => void }) => {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"beheer" | "oefenen">("beheer");
  const [queue, setQueue] = useState<Word[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const load = async () => {
    const data = await fetchWords();
    setWords(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    // meerdere woorden tegelijk toevoegen (komma of enter gescheiden)
    const nieuw = trimmed.split(/[,\n]+/).map(w => w.trim()).filter(Boolean);
    await Promise.all(nieuw.map(addWord));
    setInput("");
    await load();
  };

  const handleDelete = async (id: number) => {
    await deleteWord(id);
    setWords(prev => prev.filter(w => w.id !== id));
  };

  const startOefenen = () => {
    setQueue(shuffle(words));
    setIndex(0);
    setRevealed(false);
    setMode("oefenen");
  };

  const next = () => {
    if (index + 1 >= queue.length) {
      // opnieuw shufflen
      setQueue(shuffle(words));
      setIndex(0);
    } else {
      setIndex(i => i + 1);
    }
    setRevealed(false);
  };

  const huidigWoord = queue[index];

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden" style={{ background: "hsl(334 10% 97%)" }}>
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-card/95 px-6 py-3 backdrop-blur-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Spelling</p>
          <h2 className="font-display text-xl font-semibold">Spellingswoorden</h2>
        </div>
        <div className="flex items-center gap-2">
          {mode === "oefenen" ? (
            <button
              onClick={() => setMode("beheer")}
              className="rounded-xl border border-border px-4 py-2 text-sm font-medium transition-smooth hover:border-accent"
            >
              ← Beheer
            </button>
          ) : (
            <button
              onClick={startOefenen}
              disabled={words.length === 0}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-smooth hover:opacity-90 disabled:opacity-40"
            >
              <Shuffle className="h-4 w-4" /> Oefenen
            </button>
          )}
          <button onClick={onClose} className="rounded-xl border border-border p-2 transition-smooth hover:border-accent">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Beheer */}
      {mode === "beheer" && (
        <div className="flex flex-1 items-center overflow-y-auto p-8">
          <div className="flex flex-row items-start gap-10 w-full max-w-4xl">

          {/* Woord toevoegen */}
          <div className="flex flex-col gap-3 w-72 shrink-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Woord toevoegen</p>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAdd(); } }}
              placeholder="Typ een woord… (meerdere woorden: komma of Enter)"
              rows={4}
              className="resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-accent"
            />
            <button
              onClick={handleAdd}
              className="flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-smooth hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Toevoegen
            </button>
          </div>

          {/* Woordenlijst */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Woordenlijst <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-muted-foreground normal-case font-normal">{words.length}</span>
            </p>
            {loading && <p className="text-sm text-muted-foreground">Laden…</p>}
            {!loading && words.length === 0 && (
              <p className="text-sm text-muted-foreground">Nog geen woorden toegevoegd.</p>
            )}
            <ul className="flex flex-wrap gap-2">
              {words.map(w => (
                <li key={w.id} className="group flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium shadow-soft">
                  <span>{w.word}</span>
                  <button
                    onClick={() => handleDelete(w.id)}
                    className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-smooth hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          </div>
        </div>
      )}

      {/* Oefenmodus */}
      {mode === "oefenen" && huidigWoord && (
        <div className="flex flex-1 flex-col items-center justify-center gap-10 p-6">
          <p className="text-sm text-muted-foreground">
            {index + 1} / {queue.length}
          </p>

          {/* Woord */}
          <div
            className="flex cursor-pointer flex-col items-center gap-4"
            onClick={() => setRevealed(v => !v)}
          >
            {revealed ? (
              <p className="font-display text-7xl font-bold tracking-tight md:text-8xl">
                {huidigWoord.word}
              </p>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="h-24 w-96 max-w-full rounded-2xl bg-muted/60 border-2 border-dashed border-border" />
                <p className="text-sm text-muted-foreground">Tik om het woord te tonen</p>
              </div>
            )}
          </div>

          {/* Knoppen */}
          <div className="flex gap-4">
            <button
              onClick={() => { setQueue(shuffle(words)); setIndex(0); setRevealed(false); }}
              className="flex items-center gap-2 rounded-2xl border border-border px-5 py-3 text-sm font-medium transition-smooth hover:border-accent"
            >
              <Shuffle className="h-4 w-4" /> Opnieuw shufflen
            </button>
            <button
              onClick={next}
              className="flex items-center gap-2 rounded-2xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90"
            >
              Volgende <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpellingTool;
