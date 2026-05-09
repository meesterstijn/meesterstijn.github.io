import { SiteHeader } from "@/components/SiteHeader";

type Afspraak = {
  id: number;
  tekst: string;
};

const afspraken: Afspraak[] = [
  { id: 1, tekst: "Bij aftellen van 5 naar 0 zit je in de luisterhouding." },
  { id: 2, tekst: "Ga met een ander om zoals je zelf behandeld wilt worden." },
  { id: 3, tekst: "We zorgen dat iedereen rustig kan werken." },
  { id: 4, tekst: "We helpen en vertrouwen elkaar." },
];

const ediRegels: Afspraak[] = [
  { id: 1, tekst: "Wisbordjes op de hoek van je tafel en onder je kin." },
  { id: 2, tekst: "Hele zinnen, spreek luid en duidelijk." },
  { id: 3, tekst: "Schoudermaatjes, denk hardop en luister naar elkaar." },
  { id: 4, tekst: "Kijken, drie twee één ik kijk meteen." },
  { id: 5, tekst: "Lezen, vinger erbij ogen langs de tekst, hardop." },
];

const Klassenafspraken = () => {
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
              className="animate-fade-up flex items-start gap-5 rounded-2xl border border-border bg-card p-5 shadow-soft"
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
              className="animate-fade-up flex items-start gap-5 rounded-2xl border border-border bg-card p-5 shadow-soft"
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
    </div>
  );
};

export default Klassenafspraken;
