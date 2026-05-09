import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Clock, X, Globe, BookOpen, Bookmark, PartyPopper, LayoutGrid, Hand } from "lucide-react";

const KaartTool      = lazy(() => import("@/components/KaartTool"));
const SpellingTool   = lazy(() => import("@/components/SpellingTool"));
const BoekentipsTool = lazy(() => import("@/components/BoekentipsTool"));
const TafelsTool       = lazy(() => import("@/components/TafelsTool"));
const VerjaardagTool   = lazy(() => import("@/components/VerjaardagTool"));
const PlaatsenTool       = lazy(() => import("@/components/PlaatsenTool"));
const BeurtstokjesTool   = lazy(() => import("@/components/BeurtstokjesTool"));

// ─── Canon data ───────────────────────────────────────────────────────────────

type Evt = {
  jaar: string;
  y: number; // parsed year (negative = BCE)
  titel: string;
  omschrijving: string;
  canon?: true;
  era: string;
};

const raw = [
  { jaar: "± 5500 v.Chr.", y: -5500, titel: "Trijntje",                  era: "Prehistorie",          canon: true,  omschrijving: "Trijntje leefde rond 5500 voor Christus en is het oudst bekende menselijke skelet van Nederland. Haar botten werden in 1997 gevonden bij Hardinxveld-Giessendam. Ze was een jager-verzamelaarster van 40–60 jaar oud en werd begraven op een zandrug, naast drie honden." },
  { jaar: "± 3000 v.Chr.", y: -3000, titel: "Hunebedden",               era: "Prehistorie",          canon: true,  omschrijving: "Prehistorische grafmonumenten in Drenthe, gebouwd door de eerste bewoners van Nederland." },
  { jaar: "± 4 v.Chr.",   y: -4,     titel: "Geboorte van Jezus",       era: "Bijbelse tijd",                        omschrijving: "Jezus wordt geboren in Bethlehem. Het begin van de christelijke jaartelling." },
  { jaar: "± 33 n.Chr.", y: 33,     titel: "Kruisiging van Jezus",     era: "Bijbelse tijd",                        omschrijving: "Jezus wordt gekruisigd in Jeruzalem en staat op uit de dood. Het fundament van het christelijk geloof." },
  { jaar: "± 100 n.Chr.", y: 100,    titel: "De Romeinen",              era: "Romeinse tijd",        canon: true,  omschrijving: "De Romeinen vestigen zich in de Lage Landen en bouwen wegen en de limes langs de Rijn." },
  { jaar: "± 700",        y: 700,    titel: "Willibrord",               era: "Middeleeuwen",         canon: true,  omschrijving: "De missionaris Willibrord brengt het christendom naar de Lage Landen." },
  { jaar: "± 800",        y: 800,    titel: "Karel de Grote",           era: "Middeleeuwen",         canon: true,  omschrijving: "Karel de Grote regeert over een groot deel van Europa, waaronder de Lage Landen." },
  { jaar: "± 1100",       y: 1098,   titel: "Hebban olla vogala",        era: "Middeleeuwen",         canon: true,  omschrijving: "'Hebban olla vogala' is de oudst bekende zin in het Nederlands, geschreven door een Vlaamse monnik rond 1100. De tekst betekent: 'Hebben alle vogels nesten gemaakt, behalve ik en jij.'" },
  { jaar: "± 1100",       y: 1100,   titel: "Hanze",                    era: "Middeleeuwen",         canon: true,  omschrijving: "Handelssteden sluiten zich aaneen in de Hanze, een machtig Europees handelsnetwerk." },
  { jaar: "± 1300",       y: 1300,   titel: "Floris V",                 era: "Middeleeuwen",         canon: true,  omschrijving: "Graaf Floris V bevordert de macht van Holland en wordt in 1296 vermoord." },
  { jaar: "± 1400",       y: 1400,   titel: "Bourgondiërs",             era: "Middeleeuwen",         canon: true,  omschrijving: "De Bourgondische hertogen verenigen de Lage Landen onder één bewind." },
  { jaar: "± 1469",       y: 1469,   titel: "Erasmus",                  era: "Renaissance",          canon: true,  omschrijving: "De humanist Erasmus pleit voor tolerantie en hervorming van de kerk." },
  { jaar: "1517",         y: 1517,   titel: "Reformatie",               era: "Renaissance",          canon: true,  omschrijving: "Maarten Luther publiceert zijn stellingen. De reformatie verspreidt zich door Europa." },
  { jaar: "1533",         y: 1533,   titel: "Willem van Oranje",        era: "Renaissance",          canon: true,  omschrijving: "Willem van Oranje wordt in 1533 geboren en groeit op aan het Habsburgse hof. Later wordt hij de leider van de Nederlandse opstand tegen Spanje en de grondlegger van de Republiek der Zeven Verenigde Nederlanden." },
  { jaar: "1566",         y: 1566,   titel: "Beeldenstorm",             era: "Tachtigjarige Oorlog", canon: true,  omschrijving: "Calvinisten vernielen katholieke kerkbeelden in de Lage Landen." },
  { jaar: "1568",         y: 1568,   titel: "Tachtigjarige Oorlog",     era: "Tachtigjarige Oorlog", canon: true,  omschrijving: "De opstand tegen Spanje begint. Willem van Oranje leidt de strijd." },
  { jaar: "1572",         y: 1572,   titel: "Watergeuzen",              era: "Tachtigjarige Oorlog", canon: true,  omschrijving: "De Watergeuzen nemen Den Briel in — het begin van de bevrijding van Holland." },
  { jaar: "1579",         y: 1579,   titel: "Unie van Utrecht",         era: "Tachtigjarige Oorlog", canon: true,  omschrijving: "Zeven gewesten vormen de Unie van Utrecht, basis van de Republiek." },
  { jaar: "1581",         y: 1581,   titel: "Plakkaat van Verlatinghe", era: "Tachtigjarige Oorlog", canon: true,  omschrijving: "De gewesten verklaren zich onafhankelijk van de Spaanse koning Filips II." },
  { jaar: "1583",         y: 1583,   titel: "Hugo de Groot",            era: "Tachtigjarige Oorlog", canon: true,  omschrijving: "Hugo de Groot (Grotius) legt de grondslagen voor het internationale recht. Met zijn werk Mare Liberum pleit hij voor vrijheid van de zeeën en rechten van volken." },
  { jaar: "1602",         y: 1602,   titel: "VOC",                      era: "Gouden Eeuw",          canon: true,  omschrijving: "De Vereenigde Oostindische Compagnie wordt opgericht — eerste multinational ter wereld." },
  { jaar: "1632",         y: 1632,   titel: "Spinoza",                  era: "Gouden Eeuw",          canon: true,  omschrijving: "Baruch de Spinoza, geboren in Amsterdam, is één van de grootste filosofen uit de Gouden Eeuw. Hij pleit voor vrijheid van denken en scheiding van godsdienst en politiek." },
  { jaar: "1637",         y: 1637,   titel: "De Statenbijbel",          era: "Gouden Eeuw",          canon: true,  omschrijving: "In 1637 verschijnt de Statenbijbel, de eerste officiële Nederlandse vertaling van de Bijbel. De bijbel heeft grote invloed op de Nederlandse taal en cultuur." },
  { jaar: "± 1620",       y: 1620,   titel: "Rembrandt",                era: "Gouden Eeuw",          canon: true,  omschrijving: "Rembrandt van Rijn wordt één van de grootste schilders van de Gouden Eeuw." },
  { jaar: "± 1630",       y: 1630,   titel: "Slavernij",                era: "Gouden Eeuw",          canon: true,  omschrijving: "Nederland is actief betrokken bij de trans-Atlantische slavenhandel." },
  { jaar: "± 1650",       y: 1650,   titel: "Michiel de Ruyter",        era: "Gouden Eeuw",          canon: true,  omschrijving: "De zeeheld Michiel de Ruyter bevecht de Engelsen en Fransen op zee." },
  { jaar: "1672",         y: 1672,   titel: "Rampjaar",                 era: "Gouden Eeuw",          canon: true,  omschrijving: "Frankrijk en Engeland vallen Nederland aan. Johan de Witt wordt vermoord." },
  { jaar: "1795",         y: 1795,   titel: "Bataafse Republiek",       era: "Franse tijd",          canon: true,  omschrijving: "Franse troepen helpen Nederlandse patriotten een republiek te stichten." },
  { jaar: "1806",         y: 1806,   titel: "Napoleon",                 era: "Franse tijd",          canon: true,  omschrijving: "Napoleon Bonaparte heeft grote invloed op Nederland. Zijn broer Lodewijk Napoleon wordt koning van Holland in 1806, waarna Napoleon Nederland inlijft bij het Franse keizerrijk." },
  { jaar: "1813",         y: 1813,   titel: "Koninkrijk Nederland",     era: "19e eeuw",             canon: true,  omschrijving: "Na de val van Napoleon wordt het Koninkrijk der Nederlanden gesticht onder Willem I." },
  { jaar: "1815",         y: 1815,   titel: "Koning Willem I",          era: "19e eeuw",             canon: true,  omschrijving: "Koning Willem I regeert het nieuwe Koninkrijk der Nederlanden. Hij investeert in wegen, kanalen en onderwijs en legt de basis voor de moderne Nederlandse staat." },
  { jaar: "1830",         y: 1830,   titel: "Belgische opstand",        era: "19e eeuw",                           omschrijving: "België scheidt zich af van het Koninkrijk der Nederlanden." },
  { jaar: "1839",         y: 1839,   titel: "De eerste spoorlijn",      era: "19e eeuw",             canon: true,  omschrijving: "Op 20 september 1839 rijdt de eerste trein in Nederland: van Amsterdam naar Haarlem. De stoomlocomotief de Arend trekt de wagons. Het begin van het Nederlandse spoorwegnet." },
  { jaar: "1848",         y: 1848,   titel: "De Grondwet",              era: "19e eeuw",             canon: true,  omschrijving: "Thorbecke herziet de Grondwet in 1848. Nederland wordt een parlementaire democratie: ministers zijn verantwoordelijk aan het parlement en burgers krijgen grondrechten." },
  { jaar: "1860",         y: 1860,   titel: "Max Havelaar",             era: "19e eeuw",             canon: true,  omschrijving: "Multatuli publiceert Max Havelaar, een aanklacht tegen het koloniale bestuur in Indië." },
  { jaar: "1863",         y: 1863,   titel: "Afschaffing slavernij",    era: "19e eeuw",             canon: true,  omschrijving: "Nederland schaft de slavernij af in Suriname en de Antillen." },
  { jaar: "± 1880",       y: 1880,   titel: "Vincent van Gogh",         era: "19e eeuw",             canon: true,  omschrijving: "Vincent van Gogh schildert zijn beroemde werken en beïnvloedt de moderne kunst." },
  { jaar: "1914–1918",    y: 1914,   titel: "Eerste Wereldoorlog",      era: "20e eeuw",             canon: true,  omschrijving: "De Eerste Wereldoorlog woedt in Europa van 1914 tot 1918. Nederland blijft neutraal, maar lijdt zwaar: vluchtelingen, voedseltekort en economische schade." },
  { jaar: "1917",         y: 1917,   titel: "Algemeen kiesrecht",       era: "20e eeuw",             canon: true,  omschrijving: "Mannen krijgen algemeen kiesrecht. Scholen worden gelijkgesteld." },
  { jaar: "1919",         y: 1919,   titel: "Vrouwenkiesrecht",         era: "20e eeuw",             canon: true,  omschrijving: "Vrouwen krijgen het recht om te stemmen in Nederland." },
  { jaar: "1940",         y: 1940,   titel: "Bezetting",                era: "Tweede Wereldoorlog",  canon: true,  omschrijving: "Duitsland valt Nederland binnen op 10 mei 1940. Rotterdam wordt gebombardeerd." },
  { jaar: "1941",         y: 1941,   titel: "Februaristaking",          era: "Tweede Wereldoorlog",  canon: true,  omschrijving: "Amsterdammers staken uit protest tegen de jodenvervolging." },
  { jaar: "1944",         y: 1944,   titel: "Anne Frank",               era: "Tweede Wereldoorlog",  canon: true,  omschrijving: "Anne Frank schrijft haar dagboek tijdens de onderduik in Amsterdam." },
  { jaar: "1944",         y: 1944,   titel: "Hongerwinter",             era: "Tweede Wereldoorlog",  canon: true,  omschrijving: "Tienduizenden Nederlanders sterven van honger in de winter van 1944–1945." },
  { jaar: "1945",         y: 1945,   titel: "Bevrijding",               era: "Tweede Wereldoorlog",  canon: true,  omschrijving: "Op 5 mei 1945 capituleert Duitsland in Nederland. Nederland is bevrijd." },
  { jaar: "1945–1949",   y: 1947,   titel: "Oorlog Nederlands-Indië",  era: "Wederopbouw",          canon: true,  omschrijving: "Na de Tweede Wereldoorlog roept Indonesië de onafhankelijkheid uit. Nederland voert twee 'politionele acties' uit. In 1949 erkent Nederland de onafhankelijkheid van Indonesië." },
  { jaar: "1951",         y: 1951,   titel: "De televisie",             era: "Wederopbouw",          canon: true,  omschrijving: "In 1951 begint de Nederlandse televisie met uitzenden. Een nieuw medium dat informatie, cultuur en entertainment bij mensen thuis brengt en de samenleving ingrijpend verandert." },
  { jaar: "1953",         y: 1953,   titel: "Watersnoodramp",           era: "Wederopbouw",          canon: true,  omschrijving: "Een zware stormvloed treft Zeeland en Zuid-Holland. Ruim 1800 mensen verdrinken." },
  { jaar: "1975",         y: 1975,   titel: "Suriname onafhankelijk",   era: "Moderne tijd",         canon: true,  omschrijving: "Suriname wordt onafhankelijk van Nederland." },
  { jaar: "1995",         y: 1995,   titel: "Srebrenica",               era: "Moderne tijd",         canon: true,  omschrijving: "Bosnische Serviërs vermoorden duizenden moslims nabij Srebrenica." },
  { jaar: "2001",         y: 2001,   titel: "Geboorte van Meester Stijn", era: "Moderne tijd",                       omschrijving: "Meester Stijn wordt geboren. De klas mag van geluk spreken. 🎉" },
] satisfies Evt[];

// ─── Schaal ───────────────────────────────────────────────────────────────────

const MIN_Y   = -5700;
const MAX_Y   = 2060;
const PX      = 6;          // pixels per year
const PAD     = 260;        // horizontal padding left/right
const TRACK_T = 300;        // px from top of svg to track
const STEM_HEIGHTS = [80, 130, 180]; // alternating stem lengths
const CARD_W  = 190;
const TOTAL_W = PAD + (MAX_Y - MIN_Y) * PX + PAD;
const TOTAL_H = 620;

const toX = (year: number) => PAD + (year - MIN_Y) * PX;

const ERA_COLOR: Record<string, string> = {
  "Prehistorie":          "#c8a45a",
  "Bijbelse tijd":        "#a07850",
  "Romeinse tijd":        "#e07060",
  "Middeleeuwen":         "#7a7a8a",
  "Renaissance":          "#c4a020",
  "Tachtigjarige Oorlog": "#c05040",
  "Gouden Eeuw":          "#d4aa30",
  "Franse tijd":          "#4060a0",
  "19e eeuw":             "#408060",
  "20e eeuw":             "#5070b0",
  "Tweede Wereldoorlog":  "#505050",
  "Wederopbouw":          "#50a080",
  "Moderne tijd":         "#5090a0",
};

// ─── Tijdlijn ─────────────────────────────────────────────────────────────────

const Tijdlijn = ({ onClose }: { onClose: () => void }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<Evt | null>(null);

  // Unieke eras in chronologische volgorde
  const eras = Array.from(new Map(raw.map(e => [e.era, e.y])).entries())
    .sort((a, b) => a[1] - b[1])
    .map(([era]) => era);

  const scrollToEra = (era: string) => {
    const evt = raw.find(e => e.era === era);
    if (!evt || !scrollRef.current) return;
    scrollRef.current.scrollLeft = Math.max(0, toX(evt.y) - window.innerWidth * 0.3);
  };

  // Scroll naar heden bij openen
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, []);

  // Sleep-om-te-scrollen met muis
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let dragging = false, startX = 0, scrollStart = 0;
    const down = (e: MouseEvent) => { dragging = true; startX = e.pageX; scrollStart = el.scrollLeft; el.style.cursor = "grabbing"; };
    const move = (e: MouseEvent) => { if (!dragging) return; el.scrollLeft = scrollStart - (e.pageX - startX); };
    const up = () => { dragging = false; el.style.cursor = "grab"; };
    el.addEventListener("mousedown", down);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => { el.removeEventListener("mousedown", down); window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
  }, []);

  // Tick-markeringen
  const ticks: number[] = [];
  for (let y = -5500; y <= 2050; y += 500) ticks.push(y);
  for (let y = 1500; y <= 2025; y += 100) { if (y % 500 !== 0) ticks.push(y); }
  for (let y = 1900; y <= 2025; y += 25)  { if (y % 100 !== 0) ticks.push(y); }

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden" style={{ background: "hsl(334 10% 97%)" }}>
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-card/95 px-6 py-3 backdrop-blur-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Geschiedenis</p>
          <h2 className="font-display text-xl font-semibold">Tijdlijn — Nederlandse Canon</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-full bg-accent" /> Canon-event</span>
            <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-3 rounded-full bg-primary" /> Overig</span>
            <span className="text-muted-foreground/60">← scroll →</span>
          </div>
          <button onClick={onClose} className="rounded-xl border border-border p-2 transition-smooth hover:border-accent">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Era-navigatie */}
      <div className="flex shrink-0 gap-2 overflow-x-auto border-b border-border bg-card/80 px-4 py-2 backdrop-blur-sm">
        {eras.map(era => (
          <button
            key={era}
            onClick={() => scrollToEra(era)}
            className="shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-smooth hover:border-accent hover:text-accent"
            style={{ borderColor: ERA_COLOR[era] + "66", color: ERA_COLOR[era] }}
          >
            {era}
          </button>
        ))}
        <button
          onClick={() => { if (scrollRef.current) scrollRef.current.scrollLeft = scrollRef.current.scrollWidth; }}
          className="shrink-0 rounded-full border border-green-400 px-3 py-1.5 text-xs font-semibold text-green-600 transition-smooth hover:bg-green-50"
        >
          Nu →
        </button>
      </div>

      {/* Tijdlijn canvas */}
      <div ref={scrollRef} className="flex-1 overflow-x-auto overflow-y-hidden" style={{ cursor: "grab" }}>
        <div className="relative select-none" style={{ width: TOTAL_W, height: TOTAL_H }}>

          {/* Horizontale lijn */}
          <div className="absolute bg-border" style={{ left: 0, width: TOTAL_W, top: TRACK_T, height: 2 }} />

          {/* Tick-markeringen */}
          {ticks.map(y => {
            const x = toX(y);
            const big = y % 500 === 0;
            const mid = y % 100 === 0 && !big;
            const lbl = y < 0 ? `${-y} v.Chr.` : y === 0 ? "0" : `${y}`;
            return (
              <g key={y}>
                <div className="absolute bg-border/50" style={{ left: x, top: TRACK_T - (big ? 10 : mid ? 6 : 3), width: 1, height: big ? 20 : mid ? 12 : 6 }} />
                {big && (
                  <div className="absolute text-[11px] font-medium text-muted-foreground" style={{ left: x, top: TRACK_T + 14, transform: "translateX(-50%)", whiteSpace: "nowrap" }}>
                    {lbl}
                  </div>
                )}
                {mid && (
                  <div className="absolute text-[10px] text-muted-foreground/60" style={{ left: x, top: TRACK_T + 14, transform: "translateX(-50%)", whiteSpace: "nowrap" }}>
                    {lbl}
                  </div>
                )}
              </g>
            );
          })}

          {/* "Nu" markering */}
          <div className="absolute" style={{ left: toX(2025) }}>
            <div className="absolute bg-green-500" style={{ top: TRACK_T - 24, width: 2, height: 48, transform: "translateX(-50%)" }} />
            <div className="absolute text-xs font-bold text-green-600" style={{ top: TRACK_T - 38, transform: "translateX(-50%)", whiteSpace: "nowrap" }}>Nu</div>
          </div>

          {/* Events */}
          {raw.map((evt, i) => {
            const x = toX(evt.y);
            const above = i % 2 === 0;
            const stemH = STEM_HEIGHTS[i % 3];
            const cardTop = above ? TRACK_T - stemH - 116 : TRACK_T + stemH + 4;
            const color = ERA_COLOR[evt.era] ?? "#888";

            return (
              <div key={`${evt.y}-${evt.titel}`}>
                {/* Stam */}
                <div className="absolute" style={{
                  left: x - 1,
                  top: above ? TRACK_T - stemH : TRACK_T,
                  width: 2,
                  height: stemH,
                  background: color + "88",
                }} />

                {/* Punt op lijn */}
                <div className="absolute rounded-full border-2 border-card" style={{
                  left: x, top: TRACK_T,
                  width: evt.canon ? 14 : 10,
                  height: evt.canon ? 14 : 10,
                  transform: "translate(-50%, -50%)",
                  backgroundColor: color,
                }} />

                {/* Kaart */}
                <div
                  className="absolute rounded-2xl border border-border bg-card shadow-soft transition-smooth hover:shadow-tile hover:border-accent cursor-pointer"
                  style={{ left: x - CARD_W / 2, top: cardTop, width: CARD_W, padding: "10px 12px" }}
                  onClick={() => setSelected(evt)}
                >
                  <p className="font-display text-xl font-bold leading-none" style={{ color }}>{evt.jaar}</p>
                  <p className="mt-1 text-sm font-semibold leading-tight">{evt.titel}</p>
                  {evt.canon && (
                    <span className="mt-1.5 inline-block rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent">Canon</span>
                  )}
                  <span className="mt-0.5 inline-block ml-1 rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: color + "22", color }}>
                    {evt.era}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail popup */}
      {selected && (
        <div
          className="absolute bottom-6 left-1/2 z-10 flex max-w-sm w-full -translate-x-1/2 flex-col gap-2 rounded-3xl border border-border bg-card p-5 shadow-tile"
          onClick={() => setSelected(null)}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-display text-2xl font-bold" style={{ color: ERA_COLOR[selected.era] }}>{selected.jaar}</p>
              <p className="font-display text-lg font-semibold leading-tight">{selected.titel}</p>
            </div>
            <button className="shrink-0 rounded-xl border border-border p-1.5 hover:border-accent"><X className="h-3.5 w-3.5" /></button>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{selected.omschrijving}</p>
          <div className="flex gap-2 flex-wrap">
            {selected.canon && <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent">Canon</span>}
            <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: ERA_COLOR[selected.era] + "22", color: ERA_COLOR[selected.era] }}>{selected.era}</span>
          </div>
          <p className="text-xs text-muted-foreground/60 text-center">Klik om te sluiten</p>
        </div>
      )}
    </div>
  );
};

// ─── Tools pagina ─────────────────────────────────────────────────────────────

const ToolsPage = () => {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <>
      <div className="min-h-screen bg-paper bg-warm">
        <SiteHeader />
        <main className="container py-10 md:py-14">
          <div className="mb-10 animate-fade-up">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Hulpmiddelen</p>
            <h1 className="mt-2 font-display text-4xl font-semibold md:text-5xl">Tools</h1>
            <p className="mt-3 text-muted-foreground">Handige hulpmiddelen voor in de les.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-fade-up">
            <button
              onClick={() => setOpen("tijdlijn")}
              className="group flex flex-col items-start gap-4 rounded-3xl border border-border bg-card p-6 shadow-soft text-left transition-smooth hover:-translate-y-1 hover:shadow-tile hover:border-accent"
            >
              <div className="rounded-2xl bg-secondary p-3">
                <Clock className="h-6 w-6 text-primary" strokeWidth={1.6} />
              </div>
              <div>
                <p className="font-display text-xl font-semibold">Tijdlijn Geschiedenis</p>
                <p className="mt-1 text-sm text-muted-foreground">De Nederlandse Canon chronologisch in beeld.</p>
              </div>
            </button>

            <button
              onClick={() => setOpen("kaart")}
              className="group flex flex-col items-start gap-4 rounded-3xl border border-border bg-card p-6 shadow-soft text-left transition-smooth hover:-translate-y-1 hover:shadow-tile hover:border-accent"
            >
              <div className="rounded-2xl bg-secondary p-3">
                <Globe className="h-6 w-6 text-primary" strokeWidth={1.6} />
              </div>
              <div>
                <p className="font-display text-xl font-semibold">Kaart van de wereld</p>
                <p className="mt-1 text-sm text-muted-foreground">Interactieve wereldkaart, in- en uitzoombaar.</p>
              </div>
            </button>

            <button
              onClick={() => setOpen("spelling")}
              className="group flex flex-col items-start gap-4 rounded-3xl border border-border bg-card p-6 shadow-soft text-left transition-smooth hover:-translate-y-1 hover:shadow-tile hover:border-accent"
            >
              <div className="rounded-2xl bg-secondary p-3">
                <BookOpen className="h-6 w-6 text-primary" strokeWidth={1.6} />
              </div>
              <div>
                <p className="font-display text-xl font-semibold">Spellingswoorden</p>
                <p className="mt-1 text-sm text-muted-foreground">Moeilijke woorden toevoegen en oefenen.</p>
              </div>
            </button>

            <button
              onClick={() => setOpen("boekentips")}
              className="group flex flex-col items-start gap-4 rounded-3xl border border-border bg-card p-6 shadow-soft text-left transition-smooth hover:-translate-y-1 hover:shadow-tile hover:border-accent"
            >
              <div className="rounded-2xl bg-secondary p-3">
                <Bookmark className="h-6 w-6 text-primary" strokeWidth={1.6} />
              </div>
              <div>
                <p className="font-display text-xl font-semibold">Boekentips</p>
                <p className="mt-1 text-sm text-muted-foreground">Boekenaanbevelingen van leerlingen.</p>
              </div>
            </button>

            <button
              onClick={() => setOpen("tafels")}
              className="group flex flex-col items-start gap-4 rounded-3xl border border-border bg-card p-6 shadow-soft text-left transition-smooth hover:-translate-y-1 hover:shadow-tile hover:border-accent"
            >
              <div className="rounded-2xl bg-secondary p-3">
                <X className="h-6 w-6 text-primary" strokeWidth={2.2} />
              </div>
              <div>
                <p className="font-display text-xl font-semibold">Tafels oefenen</p>
                <p className="mt-1 text-sm text-muted-foreground">Vermenigvuldigingstafels oefenen via 99math of flitsen.</p>
              </div>
            </button>

            <button
              onClick={() => setOpen("verjaardag")}
              className="group flex flex-col items-start gap-4 rounded-3xl border border-border bg-card p-6 shadow-soft text-left transition-smooth hover:-translate-y-1 hover:shadow-tile hover:border-accent"
            >
              <div className="rounded-2xl bg-secondary p-3">
                <PartyPopper className="h-6 w-6 text-primary" strokeWidth={1.6} />
              </div>
              <div>
                <p className="font-display text-xl font-semibold">Verjaardag</p>
                <p className="mt-1 text-sm text-muted-foreground">Vier een verjaardag in de klas!</p>
              </div>
            </button>

            <button
              onClick={() => setOpen("plaatsen")}
              className="group flex flex-col items-start gap-4 rounded-3xl border border-border bg-card p-6 shadow-soft text-left transition-smooth hover:-translate-y-1 hover:shadow-tile hover:border-accent"
            >
              <div className="rounded-2xl bg-secondary p-3">
                <LayoutGrid className="h-6 w-6 text-primary" strokeWidth={1.6} />
              </div>
              <div>
                <p className="font-display text-xl font-semibold">Plaatsen</p>
                <p className="mt-1 text-sm text-muted-foreground">Lokaalindeling op schaal tekenen.</p>
              </div>
            </button>

            <button
              onClick={() => setOpen("beurtstokjes")}
              className="group flex flex-col items-start gap-4 rounded-3xl border border-border bg-card p-6 shadow-soft text-left transition-smooth hover:-translate-y-1 hover:shadow-tile hover:border-accent"
            >
              <div className="rounded-2xl bg-secondary p-3">
                <Hand className="h-6 w-6 text-primary" strokeWidth={1.6} />
              </div>
              <div>
                <p className="font-display text-xl font-semibold">Beurtstokjes</p>
                <p className="mt-1 text-sm text-muted-foreground">Trek willekeurig een leerling uit de klas.</p>
              </div>
            </button>
          </div>

          <footer className="mt-20 border-t border-border pt-6 text-center text-sm text-muted-foreground">
            Meester Stijn
          </footer>
        </main>
      </div>

      {open === "tijdlijn" && <Tijdlijn onClose={() => setOpen(null)} />}
      {open === "kaart" && (
        <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-paper text-muted-foreground">Kaart laden…</div>}>
          <KaartTool onClose={() => setOpen(null)} />
        </Suspense>
      )}
      {open === "spelling" && (
        <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-paper text-muted-foreground">Laden…</div>}>
          <SpellingTool onClose={() => setOpen(null)} />
        </Suspense>
      )}
      {open === "boekentips" && (
        <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-paper text-muted-foreground">Laden…</div>}>
          <BoekentipsTool onClose={() => setOpen(null)} />
        </Suspense>
      )}
      {open === "tafels" && (
        <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-paper text-muted-foreground">Laden…</div>}>
          <TafelsTool onClose={() => setOpen(null)} />
        </Suspense>
      )}
      {open === "verjaardag" && (
        <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-paper text-muted-foreground">Laden…</div>}>
          <VerjaardagTool onClose={() => setOpen(null)} />
        </Suspense>
      )}
      {open === "plaatsen" && (
        <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-paper text-muted-foreground">Laden…</div>}>
          <PlaatsenTool onClose={() => setOpen(null)} />
        </Suspense>
      )}
      {open === "beurtstokjes" && (
        <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-paper text-muted-foreground">Laden…</div>}>
          <BeurtstokjesTool onClose={() => setOpen(null)} />
        </Suspense>
      )}

    </>
  );
};

export default ToolsPage;
