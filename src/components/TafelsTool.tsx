import { useState } from "react";
import { X, ArrowUpRight, Zap, ChevronRight } from "lucide-react";

type Card = { a: number; b: number };

const shuffle = (arr: Card[]): Card[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const makeCards = (selected: number[]): Card[] => {
  const cards: Card[] = [];
  for (const b of selected)
    for (let a = 1; a <= 12; a++)
      cards.push({ a, b });
  return shuffle(cards);
};

const TafelsTool = ({ onClose }: { onClose: () => void }) => {
  const [mode, setMode] = useState<"menu" | "keuze" | "flitsen">("menu");
  const [selected, setSelected] = useState<number[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const toggleTafel = (n: number) =>
    setSelected(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n]);

  const startFlitsen = () => {
    setCards(makeCards(selected));
    setIdx(0);
    setRevealed(false);
    setMode("flitsen");
  };

  const volgende = () => {
    if (idx < cards.length - 1) {
      setIdx(i => i + 1);
      setRevealed(false);
    } else {
      setMode("keuze");
    }
  };

  const card = cards[idx];

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden" style={{ background: "hsl(334 10% 97%)" }}>
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-card/95 px-6 py-3 backdrop-blur-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Rekenen</p>
          <h2 className="font-display text-xl font-semibold">Tafels oefenen</h2>
        </div>
        <button onClick={onClose} className="rounded-xl border border-border p-2 transition-smooth hover:border-accent">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Menu */}
      {mode === "menu" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
          <p className="mb-2 text-sm text-muted-foreground">Kies een manier om te oefenen</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="https://99math.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90"
            >
              Naar 99math.com <ArrowUpRight className="h-4 w-4" />
            </a>
            <button
              onClick={() => setMode("keuze")}
              className="flex items-center gap-2 rounded-2xl border border-border bg-card px-8 py-4 text-sm font-semibold transition-smooth hover:border-accent hover:shadow-tile"
            >
              <Zap className="h-4 w-4" /> Tafels flitsen
            </button>
          </div>
        </div>
      )}

      {/* Keuze */}
      {mode === "keuze" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-8 p-8">
          <div className="text-center">
            <p className="font-display text-2xl font-semibold">Welke tafels?</p>
            <p className="mt-1 text-sm text-muted-foreground">Kies één of meerdere tafels om te oefenen</p>
          </div>

          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
            {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => toggleTafel(n)}
                className={`h-14 w-14 rounded-2xl border-2 text-lg font-bold transition-smooth hover:scale-105 ${
                  selected.includes(n)
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border bg-card text-foreground hover:border-accent"
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setMode("menu")}
              className="rounded-2xl border border-border px-6 py-3 text-sm font-medium transition-smooth hover:border-accent"
            >
              ← Terug
            </button>
            <button
              onClick={startFlitsen}
              disabled={selected.length === 0}
              className="flex items-center gap-2 rounded-2xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90 disabled:opacity-30"
            >
              <Zap className="h-4 w-4" /> Start flitsen ({selected.length === 0 ? "kies een tafel" : `${selected.length * 12} sommen`})
            </button>
          </div>
        </div>
      )}

      {/* Flitsen */}
      {mode === "flitsen" && card && (
        <div className="flex flex-1 flex-col items-center justify-center gap-8 p-8">
          <p className="text-xs text-muted-foreground">{idx + 1} / {cards.length}</p>

          <button
            onClick={() => revealed ? volgende() : setRevealed(true)}
            className="w-full max-w-sm rounded-3xl border-2 border-border bg-card p-12 text-center shadow-tile transition-smooth hover:border-accent"
          >
            <p className="font-display text-6xl font-semibold">
              {card.a} × {card.b} ={" "}
              {revealed
                ? <span className="text-accent">{card.a * card.b}</span>
                : <span className="text-muted-foreground/30">?</span>}
            </p>
            {!revealed && (
              <p className="mt-5 text-xs text-muted-foreground">Tik om het antwoord te zien</p>
            )}
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => setMode("keuze")}
              className="rounded-2xl border border-border px-6 py-3 text-sm font-medium transition-smooth hover:border-accent"
            >
              ← Terug
            </button>
            <button
              onClick={volgende}
              disabled={!revealed}
              className="flex items-center gap-2 rounded-2xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90 disabled:opacity-30"
            >
              {idx === cards.length - 1 ? "Klaar!" : "Volgende"} <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TafelsTool;
