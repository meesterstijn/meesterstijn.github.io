import { useState } from "react";
import { X } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";

type Afspraak = {
  id: number;
  tekst: string;
  accent?: "primary" | "accent";
};

const afspraken: Afspraak[] = [
  { id: 1, tekst: "Bij aftellen van 5 naar 0 zit je in de luisterhouding." },
  { id: 2, tekst: "Ga met een ander om zoals je zelf behandeld wilt worden." },
  { id: 3, tekst: "We zorgen dat iedereen rustig kan werken." },
  { id: 4, tekst: "We helpen en vertrouwen elkaar." },
];

const luisterhouding: Afspraak[] = [
  { id: 1, tekst: "Ik zit rechtop." },
  { id: 2, tekst: "Ik zit met mijn handen over elkaar of onder mijn billen." },
  { id: 3, tekst: "Ik heb mijn handen leeg." },
  { id: 4, tekst: "Mijn mond is dicht." },
  { id: 5, tekst: "Ik kijk naar de meester." },
];

const ediRegels: Afspraak[] = [
  { id: 1, tekst: "Wisbordjes op de hoek van je tafel en onder je kin.", accent: "accent" },
  { id: 2, tekst: "Hele zinnen, spreek luid en duidelijk.", accent: "accent" },
  { id: 3, tekst: "Schoudermaatjes, denk hardop en luister naar elkaar.", accent: "accent" },
  { id: 4, tekst: "Kijken, drie twee één ik kijk meteen.", accent: "accent" },
  { id: 5, tekst: "Lezen, vinger erbij ogen langs de tekst, hardop.", accent: "accent" },
];

const Klassenafspraken = () => {
  const [selected, setSelected] = useState<Afspraak | null>(null);

  return (
    <div className="min-h-screen bg-paper bg-warm">
      <SiteHeader />
      <main className="container py-10 md:py-14">

        <div className="mb-10 animate-fade-up">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Onze klas</p>
          <h1 className="mt-2 font-display text-4xl font-semibold md:text-5xl">Klassenafspraken</h1>
          <p className="mt-3 text-muted-foreground">Dit hebben we samen afgesproken.</p>
        </div>

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {afspraken.map((a, i) => (
            <li
              key={a.id}
              onClick={() => setSelected(a)}
              className="animate-fade-up flex cursor-pointer items-start gap-5 rounded-2xl border border-border bg-card p-5 shadow-soft transition-smooth hover:-translate-y-0.5 hover:border-primary hover:shadow-tile"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary font-display text-lg font-semibold text-primary-foreground">
                {a.id}
              </span>
              <p className="mt-1.5 text-base font-medium leading-snug">{a.tekst}</p>
            </li>
          ))}
        </ul>

        <div className="mt-14 animate-fade-up">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Houding</p>
          <h2 className="mt-2 font-display text-3xl font-semibold md:text-4xl">Luisterhouding</h2>
        </div>

        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {luisterhouding.map((a, i) => (
            <li
              key={a.id}
              onClick={() => setSelected(a)}
              className="animate-fade-up flex cursor-pointer items-start gap-5 rounded-2xl border border-border bg-card p-5 shadow-soft transition-smooth hover:-translate-y-0.5 hover:border-primary hover:shadow-tile"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary font-display text-lg font-semibold text-primary-foreground">
                {a.id}
              </span>
              <p className="mt-1.5 text-base font-medium leading-snug">{a.tekst}</p>
            </li>
          ))}
        </ul>

        <div className="mt-14 animate-fade-up">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">EDI</p>
          <h2 className="mt-2 font-display text-3xl font-semibold md:text-4xl">Regels tijdens EDI-les</h2>
        </div>

        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {ediRegels.map((a, i) => (
            <li
              key={a.id}
              onClick={() => setSelected(a)}
              className="animate-fade-up flex cursor-pointer items-start gap-5 rounded-2xl border border-border bg-card p-5 shadow-soft transition-smooth hover:-translate-y-0.5 hover:border-accent hover:shadow-tile"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent font-display text-lg font-semibold text-accent-foreground">
                {a.id}
              </span>
              <p className="mt-1.5 text-base font-medium leading-snug">{a.tekst}</p>
            </li>
          ))}
        </ul>

        <footer className="mt-20 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          Meester Stijn
        </footer>
      </main>

      {/* Fullscreen overlay */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-primary px-8"
          onClick={() => setSelected(null)}
        >
          <div className="flex max-w-3xl flex-col items-center gap-12 text-center" onClick={e => e.stopPropagation()}>
            <span className="grid h-20 w-20 place-items-center rounded-2xl bg-primary-foreground/10 font-display text-4xl font-bold text-primary-foreground">
              {selected.id}
            </span>
            <p className="font-display text-4xl font-semibold leading-tight text-primary-foreground md:text-6xl">
              {selected.tekst}
            </p>
          </div>
          <button
            onClick={() => setSelected(null)}
            className="absolute bottom-10 flex items-center gap-2 rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 px-8 py-3 text-base font-medium text-primary-foreground transition-smooth hover:bg-primary-foreground/20"
          >
            <X className="h-5 w-5" />
            Sluiten
          </button>
        </div>
      )}
    </div>
  );
};

export default Klassenafspraken;
