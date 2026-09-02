import { useState } from "react";
import { X, Shuffle, Star } from "lucide-react";

type Challenge = { tekst: string; categorie: string; kleur: string };

export const CHALLENGES: Challenge[] = [
  { tekst: "Teken een dier in precies 60 seconden. Raad daarna elkaars tekeningen.", categorie: "Creatief", kleur: "bg-accent/10 text-accent border-accent/30" },
  { tekst: "Zeg de maanden van het jaar van achter naar voren.", categorie: "Taal", kleur: "bg-primary/10 text-primary border-primary/30" },
  { tekst: "Maak 10 jumping jacks, 5 kniebuigingen en 3 keer ronddraaien.", categorie: "Beweging", kleur: "bg-sage/10 text-sage border-sage/30" },
  { tekst: "Bedenk een woord voor elke letter van je naam.", categorie: "Taal", kleur: "bg-primary/10 text-primary border-primary/30" },
  { tekst: "Beschrijf je lievelingseten zonder het te noemen — de klas raadt het.", categorie: "Spreken", kleur: "bg-highlight/10 text-foreground border-highlight/40" },
  { tekst: "Schrijf je naam zo mooi mogelijk met je niet-schrijfhand.", categorie: "Creatief", kleur: "bg-accent/10 text-accent border-accent/30" },
  { tekst: "Maak een compliment aan drie klasgenoten — elk compliment moet anders zijn.", categorie: "Sociaal", kleur: "bg-sage/10 text-sage border-sage/30" },
  { tekst: "Tel van 100 naar 0 in stappen van 7.", categorie: "Rekenen", kleur: "bg-primary/10 text-primary border-primary/30" },
  { tekst: "Doe een dierengeluid na — de klas raadt welk dier het is.", categorie: "Spel", kleur: "bg-highlight/10 text-foreground border-highlight/40" },
  { tekst: "Vertel in 30 seconden alles wat je weet over de Gouden Eeuw.", categorie: "Geschiedenis", kleur: "bg-accent/10 text-accent border-accent/30" },
  { tekst: "Bedenk een superheldennaam en leg uit wat je superkracht is.", categorie: "Creatief", kleur: "bg-accent/10 text-accent border-accent/30" },
  { tekst: "Schrijf een mini-gedicht van precies 3 regels over de klas.", categorie: "Taal", kleur: "bg-primary/10 text-primary border-primary/30" },
  { tekst: "Noem 10 dingen die je kunt zien vanuit het raam.", categorie: "Observatie", kleur: "bg-sage/10 text-sage border-sage/30" },
  { tekst: "Maak een woordketting: het laatste woord wordt het begin van het volgende.", categorie: "Taal", kleur: "bg-primary/10 text-primary border-primary/30" },
  { tekst: "Teken de plattegrond van jouw kamer thuis uit je hoofd.", categorie: "Creatief", kleur: "bg-accent/10 text-accent border-accent/30" },
  { tekst: "Bedenk een nieuwe uitvinding en leg in 1 minuut uit waarvoor het is.", categorie: "Creatief", kleur: "bg-accent/10 text-accent border-accent/30" },
  { tekst: "Noem 5 beroepen die er 100 jaar geleden nog niet bestonden.", categorie: "Denken", kleur: "bg-highlight/10 text-foreground border-highlight/40" },
  { tekst: "Maak een acrostichon van het woord SCHOOL.", categorie: "Taal", kleur: "bg-primary/10 text-primary border-primary/30" },
  { tekst: "Zing de eerste regels van een lied — wie raadt het snelst welk lied het is?", categorie: "Muziek", kleur: "bg-highlight/10 text-foreground border-highlight/40" },
  { tekst: "Teken de kaart van Nederland uit je hoofd. Zet de grote steden erbij.", categorie: "Aardrijkskunde", kleur: "bg-sage/10 text-sage border-sage/30" },
  { tekst: "Bedenk 5 woorden die eindigen op -lijk en maak er een zin mee.", categorie: "Taal", kleur: "bg-primary/10 text-primary border-primary/30" },
  { tekst: "Vertel een mop — hoe meer de klas lacht, hoe beter!", categorie: "Spel", kleur: "bg-highlight/10 text-foreground border-highlight/40" },
  { tekst: "Doe 30 seconden lang alsof je een robot bent die praat en beweegt.", categorie: "Beweging", kleur: "bg-sage/10 text-sage border-sage/30" },
  { tekst: "Schrijf in 1 minuut zoveel mogelijk woorden op die beginnen met de letter M.", categorie: "Taal", kleur: "bg-primary/10 text-primary border-primary/30" },
  { tekst: "Maak een top 3 van je favoriete boeken en vertel waarom.", categorie: "Lezen", kleur: "bg-accent/10 text-accent border-accent/30" },
  { tekst: "Zeg de tafels van 7 zo snel mogelijk van 1 tot 10 en terug.", categorie: "Rekenen", kleur: "bg-primary/10 text-primary border-primary/30" },
  { tekst: "Beschrijf een klasgenoot zonder zijn of haar naam te noemen — de klas raadt wie het is.", categorie: "Spreken", kleur: "bg-highlight/10 text-foreground border-highlight/40" },
  { tekst: "Bedenk 5 dingen waarvoor je vandaag dankbaar bent.", categorie: "Sociaal", kleur: "bg-sage/10 text-sage border-sage/30" },
  { tekst: "Schrijf in 2 minuten een kort verhaaltje met de woorden: draak, fiets en banaan.", categorie: "Creatief", kleur: "bg-accent/10 text-accent border-accent/30" },
  { tekst: "Sta op en loop op je tenen door de klas. Daarna op je hielen terug.", categorie: "Beweging", kleur: "bg-sage/10 text-sage border-sage/30" },
  { tekst: "Noem voor elke letter van het alfabet een dier. Zo snel mogelijk!", categorie: "Taal", kleur: "bg-primary/10 text-primary border-primary/30" },
  { tekst: "Teken in 45 seconden je lievelingseten zo realistisch mogelijk.", categorie: "Creatief", kleur: "bg-accent/10 text-accent border-accent/30" },
  { tekst: "Vertel iets wat heel weinig mensen over jou weten.", categorie: "Sociaal", kleur: "bg-sage/10 text-sage border-sage/30" },
  { tekst: "Maak een paar stomme grappen over wiskunde. Wie heeft de slechtste?", categorie: "Rekenen", kleur: "bg-primary/10 text-primary border-primary/30" },
  { tekst: "Bedenk een slogan voor jouw klas van maximaal 5 woorden.", categorie: "Creatief", kleur: "bg-accent/10 text-accent border-accent/30" },
];

export const dagChallenge = (): number => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dag = Math.floor((now.getTime() - start.getTime()) / 86400000);
  return dag % CHALLENGES.length;
};

const DagelijkseChallenge = ({ onClose }: { onClose: () => void }) => {
  const [index, setIndex] = useState(dagChallenge());
  const [isDaily, setIsDaily] = useState(true);

  const challenge = CHALLENGES[index];

  const volgende = () => {
    setIsDaily(false);
    let next = Math.floor(Math.random() * CHALLENGES.length);
    if (next === index) next = (next + 1) % CHALLENGES.length;
    setIndex(next);
  };

  const terug = () => {
    setIndex(dagChallenge());
    setIsDaily(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden" style={{ background: "hsl(334 10% 97%)" }}>
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-card/95 px-6 py-3 backdrop-blur-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Spellen</p>
          <h2 className="font-display text-xl font-semibold">Dagelijkse challenge</h2>
        </div>
        <button onClick={onClose} className="rounded-xl border border-border p-2 transition-smooth hover:border-accent">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Challenge */}
      <div className="flex flex-1 flex-col items-center justify-center gap-8 p-8">
        {isDaily && (
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 fill-highlight text-highlight" />
            <p className="text-sm font-semibold text-muted-foreground">Challenge van vandaag</p>
            <Star className="h-4 w-4 fill-highlight text-highlight" />
          </div>
        )}

        <div className={`w-full max-w-2xl rounded-3xl border-2 p-10 shadow-tile text-center ${challenge.kleur}`}>
          <span className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold mb-6 ${challenge.kleur}`}>
            {challenge.categorie}
          </span>
          <p className="font-display text-3xl font-semibold leading-snug md:text-4xl">
            {challenge.tekst}
          </p>
        </div>

        <div className="flex gap-4">
          {!isDaily && (
            <button
              onClick={terug}
              className="rounded-2xl border border-border px-6 py-3 text-sm font-medium transition-smooth hover:border-accent"
            >
              ← Challenge van vandaag
            </button>
          )}
          <button
            onClick={volgende}
            className="flex items-center gap-2 rounded-2xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90"
          >
            <Shuffle className="h-4 w-4" /> Andere challenge
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          {index + 1} / {CHALLENGES.length} challenges
        </p>
      </div>
    </div>
  );
};

export default DagelijkseChallenge;
