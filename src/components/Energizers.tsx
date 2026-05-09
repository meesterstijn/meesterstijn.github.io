import { useState } from "react";
import { X, Zap, ChevronLeft, Shuffle } from "lucide-react";

type Energizer = {
  titel: string;
  beschrijving: string;
  instructies: string[];
  duur: string;
  categorie: string;
  kleur: string;
};

const ENERGIZERS: Energizer[] = [
  {
    titel: "Freeze dans",
    beschrijving: "Dansen totdat de muziek stopt — dan meteen bevriezen!",
    instructies: [
      "Zet vrolijke muziek op.",
      "Iedereen danst op zijn plek of door de klas.",
      "Zodra de muziek stopt, bevriest iedereen in de houding waarin ze zijn.",
      "Wie beweegt is af. De leraar bepaalt wie er beweegt.",
      "Speel 3–5 ronden.",
    ],
    duur: "3 min",
    categorie: "Beweging",
    kleur: "bg-accent/10 text-accent border-accent/30",
  },
  {
    titel: "Simon zegt",
    beschrijving: "Doe alleen mee als 'Simon' het zegt.",
    instructies: [
      "De leider (meester of leerling) geeft opdrachten.",
      "Opdrachten die beginnen met 'Simon zegt' moeten worden uitgevoerd.",
      "Opdrachten zonder 'Simon zegt' worden genegeerd.",
      "Wie toch meedoet, is af.",
      "De laatste die overblijft wint en mag de nieuwe Simon zijn.",
    ],
    duur: "5 min",
    categorie: "Spel",
    kleur: "bg-highlight/10 text-foreground border-highlight/40",
  },
  {
    titel: "Steen-papier-schaar toernooi",
    beschrijving: "Klassikaal kampioenschap in één minuut.",
    instructies: [
      "Iedereen staat op.",
      "Zoek een tegenstander en speel één potje steen-papier-schaar.",
      "De verliezer gaat achter de winnaar staan en juicht mee.",
      "De winnaar zoekt de volgende uitdager (met zijn hele trein).",
      "De trein die het grootst is aan het einde wint.",
    ],
    duur: "5 min",
    categorie: "Spel",
    kleur: "bg-highlight/10 text-foreground border-highlight/40",
  },
  {
    titel: "Oogcontact wissel",
    beschrijving: "Ruil van stoel door oogcontact te maken — zonder te praten.",
    instructies: [
      "Iedereen zit op een stoel, één leerling staat in het midden.",
      "Leerlingen kunnen van plek wisselen door oogcontact te maken met een ander.",
      "De persoon in het midden probeert een lege stoel te pakken.",
      "Wie zonder stoel eindigt, gaat naar het midden.",
      "Speel 3–4 minuten.",
    ],
    duur: "4 min",
    categorie: "Sociaal",
    kleur: "bg-sage/10 text-sage border-sage/30",
  },
  {
    titel: "Categorieën",
    beschrijving: "Noem zo snel mogelijk woorden binnen een categorie.",
    instructies: [
      "Kies een categorie (bijv. dieren, landen, groenten, superhelden).",
      "Iedereen zit in een kring. Begin bij jezelf.",
      "De eerste leerling noemt een woord, daarna de volgende, enzovoort.",
      "Wie te lang nadenkt of een woord herhaalt, is af.",
      "De categorie wisselt elke ronde.",
    ],
    duur: "4 min",
    categorie: "Taal",
    kleur: "bg-primary/10 text-primary border-primary/30",
  },
  {
    titel: "Lopen op muziek",
    beschrijving: "Beweeg door de klas op de maat van de muziek.",
    instructies: [
      "Zet muziek op en laat de leerlingen door de klas lopen.",
      "Variatie: laat iedereen precies op de maat lopen — niet sneller, niet langzamer.",
      "Wanneer de muziek stopt, bevriest iedereen.",
      "Roep een nieuwe manier van bewegen: springen, sluipen, huppelen.",
      "Speel 4–5 ronden.",
    ],
    duur: "4 min",
    categorie: "Beweging",
    kleur: "bg-accent/10 text-accent border-accent/30",
  },
  {
    titel: "Balans op één been",
    beschrijving: "Wie kan het langst balanceren — ook met ogen dicht?",
    instructies: [
      "Iedereen staat naast zijn stoel.",
      "Hef één voet van de grond en houd je evenwicht.",
      "Na 30 seconden: wissel van been.",
      "Extra uitdaging: doe het nu met ogen dicht.",
      "Wie het langst op één been staat zonder te wankelen wint.",
    ],
    duur: "2 min",
    categorie: "Beweging",
    kleur: "bg-sage/10 text-sage border-sage/30",
  },
  {
    titel: "Naamgooi",
    beschrijving: "Gooi een (imaginaire) bal door de klas — steeds sneller.",
    instructies: [
      "Iedereen staat in een kring.",
      "De eerste leerling gooit de imaginaire bal naar iemand en roept zijn naam.",
      "Die leerling vangt de bal (doe er een beweging bij!) en gooit door.",
      "Elk type gooien mag: onderhands, achter de rug, in slow motion.",
      "Verhoog elke ronde het tempo: steeds sneller, tot het bijna niet meer bij te houden is.",
    ],
    duur: "4 min",
    categorie: "Sociaal",
    kleur: "bg-primary/10 text-primary border-primary/30",
  },
  {
    titel: "Knoop ontwarren",
    beschrijving: "Een menselijke knoop die de klas samen moet oplossen.",
    instructies: [
      "Iedereen staat in een kring en pakt met beide handen de hand van twee verschillende mensen (niet de buren).",
      "De groep probeert de knoop te ontwarren zonder handen los te laten.",
      "Communiceren mag — sturen en draaien ook.",
      "Doel: één grote kring of twee aparte ringen.",
      "Werkt goed met groepen van 8–12 leerlingen.",
    ],
    duur: "5 min",
    categorie: "Samenwerking",
    kleur: "bg-sage/10 text-sage border-sage/30",
  },
  {
    titel: "Klap het ritme",
    beschrijving: "Klap een ritme na en laat het steeds complexer worden.",
    instructies: [
      "De leider klapt een eenvoudig ritme (bijv. klap-klap-knie).",
      "De klas herhaalt exact het ritme.",
      "Voeg elke ronde een element toe of maak het sneller.",
      "Een leerling mag ook een ritme bedenken.",
      "Wie het ritme fout doet begint opnieuw.",
    ],
    duur: "3 min",
    categorie: "Muziek",
    kleur: "bg-primary/10 text-primary border-primary/30",
  },
  {
    titel: "Vier hoeken",
    beschrijving: "Kies een hoek en hoop dat de meester jouw hoek NIET noemt.",
    instructies: [
      "Wijs vier hoeken van het lokaal aan (A, B, C, D).",
      "Iedereen staat op en kiest snel een hoek.",
      "De meester noemt met gesloten ogen een letter.",
      "Wie in die hoek staat is af en gaat zitten.",
      "Ga door totdat er één leerling over is.",
    ],
    duur: "4 min",
    categorie: "Spel",
    kleur: "bg-highlight/10 text-foreground border-highlight/40",
  },
  {
    titel: "Spiegelspel",
    beschrijving: "Twee leerlingen spiegelen elkaars bewegingen — wie is de spiegel?",
    instructies: [
      "Leerlingen zitten of staan in tweetallen tegenover elkaar.",
      "Eén leerling is de 'beweger', de ander is de spiegel.",
      "De spiegel volgt elke beweging zo vloeiend mogelijk — geen oponthoud.",
      "Na 45 seconden wisselen ze van rol.",
      "Variatie: laat de klas raden wie de spiegel is bij een koppel vooraan.",
    ],
    duur: "3 min",
    categorie: "Beweging",
    kleur: "bg-accent/10 text-accent border-accent/30",
  },
  {
    titel: "Hoofd-schouders-knie-teen",
    beschrijving: "Het bekende liedje — maar steeds sneller en met valstrikken.",
    instructies: [
      "Begin langzaam: hoofd, schouders, knie en teen aanraken terwijl je het zingt.",
      "Elke ronde gaat het een stuk sneller.",
      "Variatie: laat één lichaamsdeel weg uit het liedje maar raak het WEL aan.",
      "Of: vervang een woord door een geluid (bijv. 'hoofd' = klap in handen).",
      "Wie de fout ingaat staat voor de volgende ronde.",
    ],
    duur: "3 min",
    categorie: "Beweging",
    kleur: "bg-sage/10 text-sage border-sage/30",
  },
  {
    titel: "Buzz",
    beschrijving: "Tel in een kring, maar zeg 'buzz' bij elk veelvoud van een getal.",
    instructies: [
      "Kies een getal, bijv. 3. Iedereen telt reihbeurt: 1, 2, buzz, 4, 5, buzz…",
      "Wie het veelvoud vergeet en gewoon het getal zegt, is af.",
      "Maak het moeilijker: twee getallen tegelijk (bijv. 3 én 5 → double buzz).",
      "Of tel achteruit vanaf 30.",
      "Werkt ook goed als oefening voor tafels.",
    ],
    duur: "4 min",
    categorie: "Taal & denken",
    kleur: "bg-primary/10 text-primary border-primary/30",
  },
  {
    titel: "Twee waarheden, één leugen",
    beschrijving: "Vertel drie dingen over jezelf — de klas raadt welke de leugen is.",
    instructies: [
      "Een leerling bedenkt twee ware dingen en één verzinsel over zichzelf.",
      "Hij of zij vertelt alle drie in willekeurige volgorde.",
      "De rest van de klas bespreekt kort welke de leugen is.",
      "De klas stemt door handopsteken: A, B of C.",
      "De leerling onthult de leugen — punten voor wie het goed had.",
    ],
    duur: "5 min",
    categorie: "Nadenken",
    kleur: "bg-highlight/10 text-foreground border-highlight/40",
  },
  {
    titel: "Twintig vragen",
    beschrijving: "Raad het geheime woord in maximaal twintig ja/nee-vragen.",
    instructies: [
      "De meester (of een leerling) denkt aan een dier, voorwerp of persoon.",
      "De klas mag vragen stellen die alleen met ja of nee beantwoord worden.",
      "Schrijf het aantal gestelde vragen bij op het bord.",
      "Wie het woord raadt voor vraag 20 wint.",
      "Variatie: laat de rader ook een leerling zijn in plaats van de meester.",
    ],
    duur: "5 min",
    categorie: "Nadenken",
    kleur: "bg-highlight/10 text-foreground border-highlight/40",
  },
  {
    titel: "Rij wissel",
    beschrijving: "Twee rijen wisselen van kant — zonder te praten.",
    instructies: [
      "Verdeel de klas in twee groepen die tegenover elkaar staan.",
      "De opdracht: beide groepen wisselen van kant zonder te praten.",
      "Ze mogen elkaar niet aanraken en moeten de ander laten passeren.",
      "Tijd de rijen: hoe snel lukt het?",
      "Tweede ronde: ogen dicht, hand op de schouder van de voorganger.",
    ],
    duur: "3 min",
    categorie: "Samenwerking",
    kleur: "bg-sage/10 text-sage border-sage/30",
  },
  {
    titel: "Raadseltijd",
    beschrijving: "Korte raadsels die het hoofd laten kraken.",
    instructies: [
      "Stel een raadsel: bijv. 'Ik heb handen maar geen vingers. Wat ben ik?' (een klok).",
      "Leerlingen mogen hun hand opsteken als ze het antwoord weten.",
      "Wie het goed heeft, mag het volgende raadsel bedenken of voorlezen.",
      "Gebruik moeilijkheidsniveaus: eenvoudig → tricky → heel moeilijk.",
      "Tip: schrijf het raadsel ook op het bord zodat iedereen mee kan lezen.",
    ],
    duur: "4 min",
    categorie: "Nadenken",
    kleur: "bg-primary/10 text-primary border-primary/30",
  },
];

const Energizers = ({ onClose }: { onClose: () => void }) => {
  const [selected, setSelected] = useState<Energizer | null>(null);

  const random = () => {
    const r = Math.floor(Math.random() * ENERGIZERS.length);
    setSelected(ENERGIZERS[r]);
  };

  if (selected) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col overflow-hidden" style={{ background: "hsl(334 10% 97%)" }}>
        <div className="flex shrink-0 items-center justify-between border-b border-border bg-card/95 px-6 py-3 backdrop-blur-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Energizer</p>
            <h2 className="font-display text-xl font-semibold">{selected.titel}</h2>
          </div>
          <button onClick={onClose} className="rounded-xl border border-border p-2 transition-smooth hover:border-accent">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-8 p-8">
          <div className={`w-full max-w-2xl rounded-3xl border-2 p-8 shadow-tile ${selected.kleur}`}>
            <span className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold mb-4 ${selected.kleur}`}>
              {selected.categorie} · {selected.duur}
            </span>
            <p className="font-display text-2xl font-semibold leading-snug mb-6">{selected.beschrijving}</p>
            <ol className="space-y-2">
              {selected.instructies.map((stap, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black/10 text-xs font-bold">
                    {i + 1}
                  </span>
                  {stap}
                </li>
              ))}
            </ol>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setSelected(null)}
              className="flex items-center gap-2 rounded-2xl border border-border px-6 py-3 text-sm font-medium transition-smooth hover:border-accent"
            >
              <ChevronLeft className="h-4 w-4" /> Alle energizers
            </button>
            <button
              onClick={random}
              className="flex items-center gap-2 rounded-2xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90"
            >
              <Shuffle className="h-4 w-4" /> Willekeurig
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden" style={{ background: "hsl(334 10% 97%)" }}>
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-card/95 px-6 py-3 backdrop-blur-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Spellen</p>
          <h2 className="font-display text-xl font-semibold">Energizers</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={random}
            className="flex items-center gap-2 rounded-xl border border-border bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90"
          >
            <Shuffle className="h-4 w-4" /> Willekeurig
          </button>
          <button onClick={onClose} className="rounded-xl border border-border p-2 transition-smooth hover:border-accent">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ENERGIZERS.map((e) => (
            <button
              key={e.titel}
              onClick={() => setSelected(e)}
              className="group flex flex-col items-start gap-3 rounded-2xl border-2 border-transparent bg-card p-5 shadow-soft text-left transition-smooth hover:-translate-y-1 hover:shadow-tile hover:border-accent"
            >
              <div className="flex w-full items-start justify-between gap-2">
                <div className="rounded-xl bg-secondary p-2">
                  <Zap className="h-5 w-5 text-accent" strokeWidth={1.8} />
                </div>
                <div className="flex gap-1.5">
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${e.kleur}`}>{e.categorie}</span>
                  <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">{e.duur}</span>
                </div>
              </div>
              <div>
                <p className="font-display text-lg font-semibold leading-tight">{e.titel}</p>
                <p className="mt-1 text-sm text-muted-foreground leading-snug">{e.beschrijving}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Energizers;
