import { SiteHeader } from "@/components/SiteHeader";
import { Clock } from "lucide-react";

type Block = { time: string; title: string; subject: string; tone: "coral" | "sage" | "amber" | "ink" | "cream" };

const week: { day: string; blocks: Block[] }[] = [
  {
    day: "Maandag",
    blocks: [
      { time: "08:00", title: "Voorbereiden",  subject: "",          tone: "amber" },
      { time: "08:20", title: "Lesgeven",       subject: "Groep 5b", tone: "coral" },
      { time: "12:00", title: "Pauze",          subject: "",          tone: "cream" },
      { time: "12:30", title: "Lesgeven",       subject: "Groep 5b", tone: "coral" },
      { time: "14:45", title: "B-taken",        subject: "",          tone: "ink"   },
    ],
  },
  {
    day: "Woensdag",
    blocks: [
      { time: "07:45", title: "Koffiezetten",   subject: "",          tone: "amber" },
      { time: "08:00", title: "Voorbereiden",   subject: "",          tone: "amber" },
      { time: "08:30", title: "Ralfi lezen",    subject: "",          tone: "sage"  },
      { time: "09:00", title: "Ondersteuning",  subject: "",          tone: "coral" },
      { time: "12:30", title: "B-taken",        subject: "",          tone: "ink"   },
    ],
  },
  {
    day: "Vrijdag",
    blocks: [
      { time: "08:00", title: "Voorbereiden",   subject: "",          tone: "amber" },
      { time: "08:30", title: "Ondersteunen",   subject: "",          tone: "coral" },
      { time: "12:30", title: "B-taken",        subject: "",          tone: "ink"   },
    ],
  },
];

const toneBg: Record<Block["tone"], string> = {
  coral:  "border-l-accent bg-accent/5",
  sage:   "border-l-sage bg-sage/5",
  amber:  "border-l-highlight bg-highlight/5",
  ink:    "border-l-primary bg-primary/5",
  cream:  "border-l-border bg-muted/40",
};

const Planning = () => (
  <div className="min-h-screen bg-paper bg-warm">
    <SiteHeader />
    <main className="container py-10 md:py-14">
      <div className="mb-10 max-w-2xl animate-fade-up">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Rooster</p>
        <h1 className="mt-2 font-display text-4xl font-semibold md:text-5xl">Planning</h1>
        <p className="mt-3 text-muted-foreground">
          Een overzicht van de werkweek.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {week.map((d, i) => (
          <section
            key={d.day}
            className="animate-fade-up rounded-3xl border border-border bg-card p-5 shadow-soft"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <header className="mb-4 border-b border-border pb-3">
              <h2 className="font-display text-xl font-semibold">{d.day}</h2>
            </header>
            <ul className="space-y-2.5">
              {d.blocks.map((b, idx) => (
                <li
                  key={idx}
                  className={`rounded-xl border-l-4 px-3 py-2.5 transition-smooth hover:translate-x-0.5 ${toneBg[b.tone]}`}
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <Clock className="h-3 w-3" /> {b.time}
                  </div>
                  <p className="mt-0.5 text-sm font-semibold leading-tight">{b.title}</p>
                  {b.subject && <p className="text-xs text-muted-foreground">{b.subject}</p>}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  </div>
);

export default Planning;
