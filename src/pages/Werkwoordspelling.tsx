import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { RotateCcw } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type QNode = {
  type: "q";
  id: string;
  text: string;
  sub?: string;
  kofschip?: true;
  choices: { label: string; next: Node }[];
};
type RNode = { type: "r"; text: string; items?: string[]; note?: string };
type INode = { type: "i"; text: string; rows: { k: string; v: string }[] };
type Node = QNode | RNode | INode;

// ─── Flow trees ───────────────────────────────────────────────────────────────

const STERK: Node = {
  type: "r",
  text: "Schrijf het woord volgens de gewone spellingregels.",
  note: "Sterke werkwoorden veranderen van klank in de verleden tijd.",
};

// Persoonsvorm
const P_TT: Node = {
  type: "i",
  text: "Tegenwoordige tijd",
  rows: [
    { k: "ik", v: "ik-vorm" },
    { k: "één ander  (hij / zij / het)", v: "ik-vorm + t" },
    { k: "meervoud  (wij / jullie / zij)", v: "hele werkwoord" },
  ],
};
const P_VT_JA: Node = {
  type: "r",
  text: "Laatste letter staat in 't kofschip",
  items: ["enkelvoud:  ik-vorm + te", "meervoud:  ik-vorm + ten"],
};
const P_VT_NEE: Node = {
  type: "r",
  text: "Laatste letter staat niet in 't kofschip",
  items: ["enkelvoud:  ik-vorm + de", "meervoud:  ik-vorm + den"],
};
const P_VT_K: Node = {
  type: "q", id: "p-k",
  text: "Zit de laatste letter van de ik-vorm in 't kofschip?",
  kofschip: true,
  choices: [{ label: "Ja", next: P_VT_JA }, { label: "Nee", next: P_VT_NEE }],
};
const P_VT_SZ: Node = {
  type: "q", id: "p-sz",
  text: "Is het een sterk of zwak werkwoord?",
  sub: "Zwak: behoudt klank · Sterk: verandert van klank",
  choices: [{ label: "Zwak", next: P_VT_K }, { label: "Sterk", next: STERK }],
};
const P_ROOT: Node = {
  type: "q", id: "p-t",
  text: "In welke tijd staat het werkwoord?",
  choices: [{ label: "Tegenwoordige tijd", next: P_TT }, { label: "Verleden tijd", next: P_VT_SZ }],
};

// Voltooid deelwoord
const V_JA: Node = { type: "r", text: "Voltooid deelwoord eindigt op  -t", items: ["Net als gestreept:  ge-  /  be-  /  ver-  +  ik-vorm  +  t"] };
const V_NEE: Node = { type: "r", text: "Voltooid deelwoord eindigt op  -d", items: ["Net als gestreept:  ge-  /  be-  /  ver-  +  ik-vorm  +  d"] };
const V_K: Node = {
  type: "q", id: "vd-k",
  text: "Zit de laatste letter van de ik-vorm in 't kofschip?",
  kofschip: true,
  choices: [{ label: "Ja", next: V_JA }, { label: "Nee", next: V_NEE }],
};
const V_ROOT: Node = {
  type: "q", id: "vd-sz",
  text: "Is het een sterk of zwak werkwoord?",
  sub: "Zwak: behoudt klank · Sterk: verandert van klank",
  choices: [{ label: "Zwak", next: V_K }, { label: "Sterk", next: STERK }],
};

// Infinitief
const INF: Node = {
  type: "r",
  text: "Schrijf het werkwoord zoals het in het woordenboek staat.",
  note: "De infinitief eindigt altijd op -en (soms -n). Gebruik een woordenboek bij twijfel.",
};

// Bijvoeglijk gebruikt VD
const B_ZWAK: Node = {
  type: "r",
  text: "Schrijf het woord zo kort mogelijk.",
  items: ["Gebruik de kortste schrijfwijze (ik-vorm + t of ik-vorm + d)"],
};
const B_ROOT: Node = {
  type: "q", id: "bvd-sz",
  text: "Is het een sterk of zwak werkwoord?",
  sub: "Zwak: behoudt klank · Sterk: verandert van klank",
  choices: [{ label: "Zwak", next: B_ZWAK }, { label: "Sterk", next: STERK }],
};

// ─── Tab config ───────────────────────────────────────────────────────────────

type TabId = "persoonsvorm" | "vd" | "infinitief" | "bvd";

const TABS = [
  {
    id: "persoonsvorm" as TabId,
    label: "Persoonsvorm",
    root: P_ROOT,
    dot: "bg-rose-500",
    activeCls: "border-rose-400 bg-rose-50 text-rose-800",
    line: "bg-rose-200",
    filled: "bg-rose-500 text-white border-transparent",
    resultBg: "bg-rose-50 border-rose-200",
    resultText: "text-rose-900",
  },
  {
    id: "vd" as TabId,
    label: "Voltooid deelwoord",
    root: V_ROOT,
    dot: "bg-violet-500",
    activeCls: "border-violet-400 bg-violet-50 text-violet-800",
    line: "bg-violet-200",
    filled: "bg-violet-500 text-white border-transparent",
    resultBg: "bg-violet-50 border-violet-200",
    resultText: "text-violet-900",
  },
  {
    id: "infinitief" as TabId,
    label: "Infinitief",
    root: INF,
    dot: "bg-sky-500",
    activeCls: "border-sky-400 bg-sky-50 text-sky-800",
    line: "bg-sky-200",
    filled: "bg-sky-500 text-white border-transparent",
    resultBg: "bg-sky-50 border-sky-200",
    resultText: "text-sky-900",
  },
  {
    id: "bvd" as TabId,
    label: "Bijvoeglijk gebruikt voltooid deelwoord",
    root: B_ROOT,
    dot: "bg-amber-500",
    activeCls: "border-amber-400 bg-amber-50 text-amber-800",
    line: "bg-amber-200",
    filled: "bg-amber-500 text-white border-transparent",
    resultBg: "bg-amber-50 border-amber-200",
    resultText: "text-amber-900",
  },
] as const;

type Tab = (typeof TABS)[number];

// ─── Path builder ─────────────────────────────────────────────────────────────

const buildPath = (root: Node, choices: Record<string, string>): Node[] => {
  const path: Node[] = [root];
  let cur = root;
  while (cur.type === "q") {
    const sel = choices[cur.id];
    if (!sel) break;
    const c = cur.choices.find(x => x.label === sel);
    if (!c) break;
    path.push(c.next);
    cur = c.next;
  }
  return path;
};

// ─── Kofschip letters ─────────────────────────────────────────────────────────

const KofschipLetters = () => (
  <div className="mt-3 flex flex-wrap gap-1.5">
    {["t", "k", "f", "s", "ch", "p"].map(l => (
      <span
        key={l}
        className="flex h-9 min-w-[2.25rem] items-center justify-center rounded-xl border border-amber-300 bg-amber-50 px-2 text-sm font-bold text-amber-800"
      >
        {l}
      </span>
    ))}
  </div>
);

// ─── Flow ─────────────────────────────────────────────────────────────────────

type FlowProps = {
  tab: Tab;
  choices: Record<string, string>;
  onChoice: (id: string, label: string) => void;
};

const Flow = ({ tab, choices, onChoice }: FlowProps) => {
  const path = buildPath(tab.root, choices);

  return (
    <div className="flex flex-col">
      {path.map((node, i) => {
        const isLast = i === path.length - 1;
        const isDone = node.type === "r" || node.type === "i";

        return (
          <div key={i} className="flex gap-4 animate-fade-up">
            {/* Left track */}
            <div className="flex flex-col items-center" style={{ minWidth: 40 }}>
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${
                  isDone ? tab.filled : "border-border bg-card text-foreground"
                }`}
              >
                {isDone ? "✓" : i + 1}
              </div>
              {!isLast && (
                <div className={`w-0.5 flex-1 ${tab.line} my-1 min-h-4`} />
              )}
            </div>

            {/* Card */}
            <div className="mb-4 flex-1 min-w-0">
              {node.type === "q" && (
                <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                  <p className="font-semibold leading-snug">{node.text}</p>
                  {node.sub && (
                    <p className="mt-1 text-xs text-muted-foreground">{node.sub}</p>
                  )}
                  {node.kofschip && <KofschipLetters />}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {node.choices.map(c => {
                      const selected = choices[node.id] === c.label;
                      return (
                        <button
                          key={c.label}
                          onClick={() => onChoice(node.id, c.label)}
                          className={`rounded-xl border px-5 py-2.5 text-sm font-semibold transition-smooth ${
                            selected
                              ? tab.filled
                              : "border-border bg-background hover:border-accent hover:text-accent"
                          }`}
                        >
                          {c.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {node.type === "i" && (
                <div className={`rounded-2xl border p-4 shadow-soft ${tab.resultBg}`}>
                  <p className={`mb-3 text-xs font-semibold uppercase tracking-widest opacity-60 ${tab.resultText}`}>
                    {node.text}
                  </p>
                  <div className="flex flex-col gap-2">
                    {node.rows.map(row => (
                      <div key={row.k} className="flex items-baseline gap-3 text-sm">
                        <span className="text-muted-foreground" style={{ minWidth: 196 }}>
                          {row.k}
                        </span>
                        <span className={`font-mono font-bold ${tab.resultText}`}>{row.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {node.type === "r" && (
                <div className={`rounded-2xl border p-4 shadow-soft ${tab.resultBg}`}>
                  <p className={`font-semibold leading-snug ${tab.resultText}`}>{node.text}</p>
                  {node.items && (
                    <div className="mt-2 flex flex-col gap-1">
                      {node.items.map(item => (
                        <span key={item} className={`font-mono text-sm font-bold ${tab.resultText}`}>
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                  {node.note && (
                    <p className="mt-2 text-xs text-muted-foreground">{node.note}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const Werkwoordspelling = () => {
  const [activeTab, setActiveTab] = useState<TabId>("persoonsvorm");
  const [allChoices, setAllChoices] = useState<Record<TabId, Record<string, string>>>({
    persoonsvorm: {},
    vd: {},
    infinitief: {},
    bvd: {},
  });

  const tab = TABS.find(t => t.id === activeTab)!;
  const choices = allChoices[activeTab];

  const handleChoice = (id: string, label: string) => {
    setAllChoices(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], [id]: label } }));
  };

  const handleReset = () => {
    setAllChoices(prev => ({ ...prev, [activeTab]: {} }));
  };

  return (
    <div className="min-h-screen bg-paper bg-warm">
      <SiteHeader />
      <main className="container py-10 md:py-14">

        <div className="mb-10 animate-fade-up">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Taal</p>
          <h1 className="mt-2 font-display text-4xl font-semibold md:text-5xl">Werkwoordspelling</h1>
          <p className="mt-3 text-muted-foreground">Volg het stappenplan voor de juiste spelling.</p>
        </div>

        <div className="animate-fade-up" style={{ animationDelay: "60ms" }}>

          {/* Tabs */}
          <div className="mb-8 flex flex-wrap gap-2">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 rounded-2xl border px-5 py-2.5 text-sm font-semibold transition-smooth ${
                  activeTab === t.id ? t.activeCls + " shadow-soft" : "border-border hover:border-accent"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${t.dot}`} />
                {t.label}
              </button>
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-[3fr_1fr]">

            {/* Flow */}
            <div>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold">{tab.label}</h2>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-medium transition-smooth hover:border-accent hover:text-accent"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Opnieuw
                </button>
              </div>
              <Flow tab={tab} choices={choices} onChoice={handleChoice} />
            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-4 lg:sticky lg:top-6">

              {/* Kofschip */}
              <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                  't Kofschip
                </p>
                <div className="my-2 flex justify-center text-5xl">⛵</div>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {["t", "k", "f", "s", "ch", "p"].map(l => (
                    <span
                      key={l}
                      className="flex h-9 min-w-[2.25rem] items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-2 text-sm font-bold text-amber-800"
                    >
                      {l}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">
                  Staat de laatste letter van de ik-vorm hierin?<br />
                  Dan gebruik je <strong>-te / -ten</strong> of VD op <strong>-t</strong>.
                </p>
              </div>

              {/* Sterk vs Zwak */}
              <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                  Sterk of zwak?
                </p>
                <div className="flex flex-col gap-3 text-sm">
                  <div className="rounded-2xl bg-muted/40 p-3">
                    <p className="font-semibold">Zwak werkwoord</p>
                    <p className="text-xs text-muted-foreground">behoudt klank in verleden tijd</p>
                    <p className="mt-1 font-mono text-xs">werken → werkte</p>
                  </div>
                  <div className="rounded-2xl bg-muted/40 p-3">
                    <p className="font-semibold">Sterk werkwoord</p>
                    <p className="text-xs text-muted-foreground">verandert van klank in verleden tijd</p>
                    <p className="mt-1 font-mono text-xs">schrijven → schreef</p>
                  </div>
                </div>
              </div>

              {/* De ik-vorm vinden */}
              <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                  De ik-vorm vinden
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Haal <strong>-en</strong> van de infinitief af.<br />
                  Dubbele medeklinker? Schrap er één.<br />
                  Korte klinker? Verleng hem.
                </p>
                <p className="mt-2 font-mono text-xs leading-relaxed">
                  werken → werk<br />
                  lopen → loop<br />
                  zetten → zet
                </p>
              </div>

            </div>
          </div>
        </div>

        <footer className="mt-20 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          Meester Stijn
        </footer>
      </main>
    </div>
  );
};

export default Werkwoordspelling;
