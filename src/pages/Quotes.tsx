import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Quote as QuoteIcon, Shuffle } from "lucide-react";

type Quote = { text: string; author: string; tone: "coral" | "sage" | "amber" | "ink" };

const quotes: Quote[] = [
  { text: "Onderwijs is het ontsteken van een vlam, niet het vullen van een vat.", author: "Socrates", tone: "coral" },
  { text: "Vertel het me en ik vergeet, leer het me en ik onthoud, betrek me erbij en ik leer.", author: "Benjamin Franklin", tone: "amber" },
  { text: "De mooiste reis die je kunt maken, is door de wereld van een kind.", author: "Onbekend", tone: "sage" },
  { text: "Een leraar raakt een hele toekomst aan.", author: "Henry Adams", tone: "ink" },
  { text: "Probeer niet perfect te zijn. Probeer beter te zijn dan gisteren.", author: "Onbekend", tone: "coral" },
  { text: "Kinderen leren meer van wat je bent dan van wat je leert.", author: "W.E.B. Du Bois", tone: "amber" },
  { text: "De wortel van het woord 'onderwijzen' is hetzelfde als die van 'liefhebben'.", author: "Volkswijsheid", tone: "sage" },
  { text: "Wie ophoudt te leren, is oud — of hij nu twintig is of tachtig.", author: "Henry Ford", tone: "ink" },
  { text: "Geef een kind ruimte om te denken, en het zal denken in ruimte.", author: "Loris Malaguzzi", tone: "coral" },
];

const toneCard: Record<Quote["tone"], string> = {
  coral: "bg-accent text-accent-foreground",
  sage:  "bg-sage text-sage-foreground",
  amber: "bg-highlight text-highlight-foreground",
  ink:   "bg-primary text-primary-foreground",
};

const Quotes = () => {
  const [featured, setFeatured] = useState(0);
  const f = quotes[featured];

  return (
    <div className="min-h-screen bg-paper bg-warm">
      <SiteHeader />
      <main className="container py-10 md:py-14">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl animate-fade-up">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Inspiratie</p>
            <h1 className="mt-2 font-display text-4xl font-semibold md:text-5xl">Quotes</h1>
            <p className="mt-3 text-muted-foreground">
              Een woord om de dag mee te beginnen — of mee af te sluiten.
            </p>
          </div>
          <button
            onClick={() => setFeatured(Math.floor(Math.random() * quotes.length))}
            className="inline-flex items-center gap-2 self-start rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-soft transition-smooth hover:-translate-y-0.5 hover:shadow-tile"
          >
            <Shuffle className="h-4 w-4" /> Verras me
          </button>
        </div>

        {/* Featured */}
        <section
          key={featured}
          className={`relative mb-12 animate-fade-up overflow-hidden rounded-3xl p-10 shadow-tile md:p-16 ${toneCard[f.tone]}`}
        >
          <QuoteIcon className="absolute -right-4 -top-4 h-40 w-40 opacity-10" />
          <p className="relative font-display text-3xl font-medium leading-tight md:text-5xl">
            "{f.text}"
          </p>
          <p className="relative mt-6 text-sm uppercase tracking-[0.2em] opacity-80">
            — {f.author}
          </p>
        </section>

        {/* Wall */}
        <h2 className="mb-5 font-display text-2xl font-semibold">Meer om te delen</h2>
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
          {quotes.map((q, i) => (
            <article
              key={i}
              onClick={() => setFeatured(i)}
              className={`mb-5 inline-block w-full cursor-pointer break-inside-avoid animate-tile-in rounded-2xl p-6 shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-tile ${
                i === featured
                  ? "ring-2 ring-accent ring-offset-2 ring-offset-background"
                  : ""
              } ${i % 4 === 0 ? "bg-card border border-border" : toneCard[q.tone]}`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <QuoteIcon className="mb-3 h-5 w-5 opacity-60" />
              <p className="font-display text-lg leading-snug">"{q.text}"</p>
              <p className="mt-3 text-xs uppercase tracking-wider opacity-70">— {q.author}</p>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Quotes;
