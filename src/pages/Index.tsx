import { Link } from "react-router-dom";
import {
  PencilLine, CalendarDays, FolderOpen, BookOpen, Wrench, Clock,
  Puzzle, Crown, Music2, Youtube, Radio, Image as ImageIcon,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { ClockCard } from "@/components/ClockCard";
import { SiteHeader } from "@/components/SiteHeader";

type Tile = {
  title: string;
  desc: string;
  icon: LucideIcon;
  href: string;
  external?: boolean;
  tone: "ink" | "cream" | "coral" | "amber" | "sage";
};

const tiles: Tile[] = [
  { title: "Whiteboard", desc: "Samen tekenen & uitleggen", icon: PencilLine, href: "https://excalidraw.com/", external: true, tone: "ink" },
  { title: "Planning",   desc: "Het rooster van vandaag",   icon: CalendarDays, href: "/planning",  tone: "coral" },
  { title: "Bestanden",  desc: "Werkbladen & bronnen",      icon: FolderOpen,   href: "/bestanden", tone: "cream" },
  { title: "Bijbel",     desc: "Tekst voor de dag",         icon: BookOpen,     href: "https://www.debijbel.nl/", external: true, tone: "sage" },
  { title: "Tools",      desc: "Vertaler & handige links",  icon: Wrench,       href: "#tools",     tone: "cream" },
  { title: "Klastools",  desc: "Timer, tekstbord & stoplicht", icon: Wrench,      href: "/klastools", tone: "amber" },
  { title: "Focus",      desc: "Concentratietimer",               icon: Clock,       href: "/focus",     tone: "sage"  },
  { title: "Spellen",    desc: "Pauzespellen",              icon: Puzzle,       href: "#spellen",   tone: "cream" },
  { title: "Schaken",    desc: "Een potje schaak",          icon: Crown,        href: "https://www.chess.com/home", external: true, tone: "ink" },
];

const quickLinks = [
  { label: "Spotify", icon: Music2, href: "https://open.spotify.com" },
  { label: "Youtube", icon: Youtube, href: "https://youtube.com" },
  { label: "Groot Nieuws Radio", icon: Radio, href: "https://www.grootnieuwsradio.nl/" },
  { label: "Free Bible Images", icon: ImageIcon, href: "https://www.freebibleimages.org/" },
];

const toneClasses: Record<Tile["tone"], string> = {
  ink:    "bg-primary text-primary-foreground hover:bg-primary/90",
  cream:  "bg-card text-card-foreground hover:bg-secondary",
  coral:  "bg-accent text-accent-foreground hover:brightness-105",
  amber:  "bg-highlight text-highlight-foreground hover:brightness-105",
  sage:   "bg-sage text-sage-foreground hover:brightness-105",
};

const Index = () => {
  return (
    <div className="min-h-screen bg-paper bg-warm">
      <SiteHeader />

      <main className="container py-10 md:py-14">
        {/* Hero grid */}
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="animate-fade-up lg:col-span-3">
            <ClockCard />
          </div>

          <div className="flex flex-col gap-4 lg:col-span-2">
            <div className="animate-fade-up rounded-3xl border border-border bg-card p-6 shadow-soft" style={{ animationDelay: "80ms" }}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Snelle links
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {quickLinks.map((q) => (
                  <a
                    key={q.label}
                    href={q.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-2 rounded-xl border border-border/60 bg-background/60 px-3 py-2.5 text-sm font-medium transition-smooth hover:border-accent hover:bg-accent/5"
                  >
                    <q.icon className="h-4 w-4 text-muted-foreground group-hover:text-accent" />
                    <span className="truncate">{q.label}</span>
                    <ArrowUpRight className="ml-auto h-3.5 w-3.5 opacity-0 transition-smooth group-hover:opacity-100" />
                  </a>
                ))}
              </div>
            </div>

            <div className="animate-fade-up rounded-3xl border border-border bg-gradient-to-br from-accent/15 via-card to-highlight/15 p-6 shadow-soft" style={{ animationDelay: "160ms" }}>
              <p className="font-display text-lg font-medium leading-snug">
                "Onderwijs is het ontsteken van een vlam,
                niet het vullen van een vat."
              </p>
              <p className="mt-3 text-sm text-muted-foreground">— Socrates</p>
            </div>
          </div>
        </div>

        {/* Tiles */}
        <section className="mt-12">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-semibold md:text-4xl">
                Het klaslokaal
              </h2>
              <p className="text-muted-foreground">Alles binnen handbereik.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {tiles.map((t, i) => {
              const Inner = (
                <div
                  className={`group relative flex h-44 flex-col justify-between overflow-hidden rounded-3xl p-5 shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-tile ${
                    toneClasses[t.tone]
                  } ${t.tone === "cream" ? "border border-border" : ""}`}
                >
                  <t.icon className="h-8 w-8 transition-smooth group-hover:scale-110" strokeWidth={1.6} />
                  <div>
                    <p className="font-display text-xl font-semibold leading-tight">{t.title}</p>
                    <p className={`mt-0.5 text-xs ${t.tone === "cream" ? "text-muted-foreground" : "opacity-80"}`}>
                      {t.desc}
                    </p>
                  </div>
                  <ArrowUpRight className="absolute right-4 top-4 h-4 w-4 opacity-50 transition-smooth group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                </div>
              );
              const style = { animationDelay: `${i * 60}ms` };
              return t.external ? (
                <a key={t.title} href={t.href} target="_blank" rel="noreferrer" className="animate-tile-in" style={style}>
                  {Inner}
                </a>
              ) : (
                <Link key={t.title} to={t.href} className="animate-tile-in" style={style}>
                  {Inner}
                </Link>
              );
            })}
          </div>
        </section>

        <footer className="mt-20 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          Met liefde gemaakt voor de klas · Meester Stijn
        </footer>
      </main>
    </div>
  );
};

export default Index;
