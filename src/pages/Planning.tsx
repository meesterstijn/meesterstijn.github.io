import { SiteHeader } from "@/components/SiteHeader";
import { Clock } from "lucide-react";

type Block = { time: string; title: string; subject: string; tone: "coral" | "sage" | "amber" | "ink" | "cream" };

const week: { day: string; date: string; blocks: Block[] }[] = [
  {
    day: "Maandag", date: "11 mei",
    blocks: [
      { time: "08:30", title: "Inloop & dagopening", subject: "Bijbelverhaal", tone: "sage" },
      { time: "09:00", title: "Rekenen — breuken", subject: "Blok 5, les 3", tone: "coral" },
      { time: "10:15", title: "Pauze", subject: "Buiten spelen", tone: "cream" },
      { time: "10:45", title: "Begrijpend lezen", subject: "Tekst: De wolven", tone: "amber" },
      { time: "12:00", title: "Lunch", subject: "Eten in de klas", tone: "cream" },
      { time: "13:00", title: "Wereldoriëntatie", subject: "Vulkanen", tone: "ink" },
      { time: "14:30", title: "Tekenen", subject: "Stillevens", tone: "amber" },
    ],
  },
  {
    day: "Dinsdag", date: "12 mei",
    blocks: [
      { time: "08:30", title: "Dagopening", subject: "Quote van de dag", tone: "sage" },
      { time: "09:00", title: "Spelling", subject: "Categorie 12", tone: "coral" },
      { time: "10:15", title: "Pauze", subject: "—", tone: "cream" },
      { time: "10:45", title: "Rekenen", subject: "Tafels herhaling", tone: "coral" },
      { time: "13:00", title: "Gym", subject: "Estafette", tone: "ink" },
    ],
  },
  {
    day: "Woensdag", date: "13 mei",
    blocks: [
      { time: "08:30", title: "Bijbelverhaal", subject: "Mattheüs 5", tone: "sage" },
      { time: "09:00", title: "Schrijven", subject: "Verhaal opbouw", tone: "amber" },
      { time: "10:45", title: "Rekenen", subject: "Werkboek p. 24", tone: "coral" },
      { time: "12:00", title: "Vrije middag", subject: "—", tone: "cream" },
    ],
  },
  {
    day: "Donderdag", date: "14 mei",
    blocks: [
      { time: "08:30", title: "Dagopening", subject: "Lied", tone: "sage" },
      { time: "09:00", title: "Engels", subject: "Unit 6", tone: "ink" },
      { time: "10:45", title: "Topografie", subject: "Europa", tone: "coral" },
      { time: "13:00", title: "Knutselen", subject: "Moederdag", tone: "amber" },
    ],
  },
  {
    day: "Vrijdag", date: "15 mei",
    blocks: [
      { time: "08:30", title: "Weekopening", subject: "Hoogtepunten", tone: "sage" },
      { time: "09:00", title: "Toets rekenen", subject: "Blok 5", tone: "coral" },
      { time: "10:45", title: "Vrij lezen", subject: "Stille tijd", tone: "cream" },
      { time: "13:00", title: "Klassengesprek", subject: "Weekafsluiting", tone: "amber" },
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
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Week 20</p>
        <h1 className="mt-2 font-display text-4xl font-semibold md:text-5xl">Planning</h1>
        <p className="mt-3 text-muted-foreground">
          Een overzichtelijk weekrooster. Klik op een dag om door te scrollen.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {week.map((d, i) => (
          <section
            key={d.day}
            className="animate-fade-up rounded-3xl border border-border bg-card p-5 shadow-soft"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <header className="mb-4 flex items-baseline justify-between border-b border-border pb-3">
              <h2 className="font-display text-xl font-semibold">{d.day}</h2>
              <span className="text-xs text-muted-foreground">{d.date}</span>
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
                  <p className="text-xs text-muted-foreground">{b.subject}</p>
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
