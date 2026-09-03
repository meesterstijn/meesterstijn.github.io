import { useEffect, useMemo, useState } from "react";
import { X, Zap, ChevronLeft, Shuffle, Pencil, Check, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const CATEGORIEEN = ["Beweging", "Samenwerking", "Muziek", "Taal", "Spel"] as const;
type Categorie = (typeof CATEGORIEEN)[number];

const CAT_KLEUR: Record<Categorie, string> = {
  Beweging:     "bg-accent/10 text-accent border-accent/30",
  Samenwerking: "bg-sage/10 text-sage border-sage/30",
  Muziek:       "bg-primary/10 text-primary border-primary/30",
  Taal:         "bg-highlight/15 text-foreground border-highlight/50",
  Spel:         "bg-secondary text-secondary-foreground border-border",
};

type Energizer = {
  id: string;
  titel: string;
  beschrijving: string;
  instructies: string[];
  duur: string;
  categorie: Categorie;
};

const RAW_ENERGIZERS: Omit<Energizer, "id">[] = [
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
  },
  {
    titel: "Atoomgroepjes",
    beschrijving: "Loop rond en vorm razendsnel groepjes van het genoemde getal.",
    instructies: [
      "Iedereen loopt rustig door het lokaal.",
      "De meester roept 'Atoom 3!' (of een ander getal).",
      "Vorm zo snel mogelijk groepjes van dat aantal en ga hurken.",
      "Wie geen groepje heeft, doet een klein dansje of tien jumping jacks.",
      "Speel door met wisselende getallen, sluit af met één groot atoom.",
    ],
    duur: "3 min",
    categorie: "Beweging",
  },
  {
    titel: "Boter, kaas en eieren estafette",
    beschrijving: "Ren om de beurt naar het speelveld en leg je pion neer.",
    instructies: [
      "Leg vooraan 9 vellen papier in een vierkant van 3 bij 3.",
      "Maak twee teams; elk team krijgt 3 gekleurde voorwerpen (of hesjes).",
      "Om de beurt rent één leerling naar voren en legt één voorwerp op een vak.",
      "Zijn alle 3 voorwerpen gelegd? Dan mag de volgende renner er één verplaatsen.",
      "Het team dat als eerste drie op een rij heeft, wint de ronde.",
    ],
    duur: "5 min",
    categorie: "Beweging",
  },
  {
    titel: "Ninja",
    beschrijving: "Eén beweging per beurt om andermans hand te tikken.",
    instructies: [
      "Sta in een kring, handen tegen elkaar, en spring samen naar buiten in een ninja-pose.",
      "Om de beurt maak je één vloeiende beweging om de hand van een buur te tikken.",
      "Word je getikt, dan doe je die hand achter je rug; twee handen weg = af.",
      "De ander mag alleen wegduiken als het jouw beurt is — daarna weer stilstaan.",
      "De laatste ninja met een hand vrij wint.",
    ],
    duur: "4 min",
    categorie: "Beweging",
  },
  {
    titel: "Cowboy-duel",
    beschrijving: "Twee leerlingen 'trekken', hun buren schieten het snelst.",
    instructies: [
      "Iedereen staat in een kring.",
      "De meester wijst twee leerlingen aan die tegenover elkaar staan.",
      "Die twee roepen 'BANG!' en bukken snel.",
      "De leerlingen náást hen 'schieten' elkaar — wie het laatst 'bang' roept is af.",
      "Afvallers gaan zitten; speel tot er een winnaar overblijft.",
    ],
    duur: "3 min",
    categorie: "Beweging",
  },
  {
    titel: "1-2-3 klap",
    beschrijving: "Tel om de beurt en vervang cijfers door bewegingen.",
    instructies: [
      "Ga in tweetallen staan en tel om de beurt: 1 – 2 – 3 – 1 – 2 – 3…",
      "Vervang de 1 door een klap in je handen.",
      "Lukt dat? Vervang de 2 door een stamp met je voet.",
      "En de 3 door een sprongetje.",
      "Nu tel je zonder woorden — elke fout is lachen en je begint opnieuw.",
    ],
    duur: "3 min",
    categorie: "Beweging",
  },
  {
    titel: "De bom",
    beschrijving: "Geef het voorwerp snel door — niet ontploffen als de tijd om is!",
    instructies: [
      "Iedereen staat in een kring met één voorwerp (de 'bom').",
      "Zet een timer op een willekeurige tijd tussen 20 en 60 seconden — verborgen.",
      "Geef de bom zo snel mogelijk door van hand tot hand.",
      "Bij wie de bom is als de timer afgaat, doet een korte opdracht (bijv. 5 kikkersprongen).",
      "Extra: bij 'wissel!' gaat de bom de andere kant op.",
    ],
    duur: "3 min",
    categorie: "Beweging",
  },
  {
    titel: "Standbeeldenmaker",
    beschrijving: "Kneed je maatje in 20 seconden tot een standbeeld.",
    instructies: [
      "Werk in tweetallen: één is de klei, één is de beeldhouwer.",
      "De meester noemt een woord (superheld, vakantie, sport, robot…).",
      "De beeldhouwer zet zijn maatje voorzichtig in de juiste pose — 20 seconden.",
      "Iedereen bevriest; de meester tikt een paar beelden aan die 'tot leven' komen.",
      "Wissel van rol bij het volgende woord.",
    ],
    duur: "4 min",
    categorie: "Beweging",
  },
  {
    titel: "Schipper mag ik overvaren",
    beschrijving: "Steek het lokaal over zonder getikt te worden.",
    instructies: [
      "Eén leerling is de schipper en staat in het midden van het lokaal.",
      "De rest staat tegen de muur en roept: 'Schipper mag ik overvaren?'",
      "De schipper roept een opdracht: 'Ja, maar alleen wie een bril draagt' of 'hinkelend'.",
      "Wie voldoet, steekt over naar de andere muur; wie getikt wordt, helpt tikken.",
      "De laatste vrije leerling is de nieuwe schipper.",
    ],
    duur: "5 min",
    categorie: "Beweging",
  },
  {
    titel: "Sportcommando's",
    beschrijving: "Beeld razendsnel de sport uit die de meester roept.",
    instructies: [
      "Iedereen staat bij zijn plek en jogt rustig op de plaats.",
      "De meester roept een sport: 'voetbal!', 'boksen!', 'touwtjespringen!', 'zwemmen!'.",
      "Iedereen beeldt die beweging meteen uit tot het volgende commando.",
      "Bij 'freeze!' sta je doodstil — wie nog beweegt doet vijf kniebuigingen.",
      "Laat de laatste ronde een leerling de commando's roepen.",
    ],
    duur: "3 min",
    categorie: "Beweging",
  },
  {
    titel: "Zip Zap Boing",
    beschrijving: "Geef de energie door in de kring met geluid en gebaar.",
    instructies: [
      "Sta in een kring. Geef een 'zip' door naar je buurman met een klap in zijn richting.",
      "Met 'zap' spring je iemand aan de overkant aan en wijs je naar hem.",
      "Met 'boing' (handen omhoog) kaats je de beurt terug naar wie hem stuurde.",
      "Wie twijfelt, het verkeerde woord zegt of te laat is, is af.",
      "Voer het tempo elke ronde op.",
    ],
    duur: "4 min",
    categorie: "Beweging",
  },
  {
    titel: "Popcorn",
    beschrijving: "Spring als een popcornpitje op — maar nooit met z'n tweeën tegelijk.",
    instructies: [
      "Iedereen hurkt naast zijn stoel.",
      "Op een zelfgekozen moment spring je op met 'pop!' en hurk je weer.",
      "Springen er twee tegelijk? Dan gaan zij allebei zitten.",
      "Doel: de klas laat om de beurt zoveel mogelijk pitjes poppen zonder botsing.",
      "Extra uitdaging: probeer samen precies twintig pops te halen.",
    ],
    duur: "2 min",
    categorie: "Beweging",
  },
  {
    titel: "Rug-aan-rug opstaan",
    beschrijving: "Samen rechtop komen zonder je handen te gebruiken.",
    instructies: [
      "Ga in tweetallen op de grond zitten, rug tegen rug, armen in elkaar gehaakt.",
      "Duw tegen elkaars rug en kom samen tegelijk overeind.",
      "Gelukt? Doe het opnieuw met een groepje van drie, dan vier.",
      "Hoe groter de groep, hoe meer overleg en timing je nodig hebt.",
      "Welke groep krijgt de hele kring tegelijk staand?",
    ],
    duur: "4 min",
    categorie: "Beweging",
  },
  {
    titel: "Levende letters",
    beschrijving: "Vorm met je lichaam samen een letter of cijfer.",
    instructies: [
      "Maak groepjes van drie of vier leerlingen.",
      "De meester noemt een letter of cijfer.",
      "Elk groepje vormt die vorm zo snel mogelijk met hun lichamen op de grond.",
      "De andere groepjes raden of het klopt.",
      "Volgende ronde: vorm samen een kort woord met de hele klas.",
    ],
    duur: "4 min",
    categorie: "Beweging",
  },
  {
    titel: "Estafette zonder handen",
    beschrijving: "Geef het voorwerp door van kin tot kin — niet laten vallen!",
    instructies: [
      "Verdeel de klas in rijen of teams.",
      "De eerste klemt een zacht voorwerp (knuffel, sok, balletje) onder zijn kin.",
      "Geef het door aan de volgende zonder handen te gebruiken.",
      "Valt het? Dan mag alleen die persoon het met de handen terugleggen en opnieuw.",
      "Het team dat het voorwerp als eerste achteraan heeft, wint.",
    ],
    duur: "4 min",
    categorie: "Beweging",
  },
  {
    titel: "Snelle handen",
    beschrijving: "Tik de handen van je maatje voordat hij ze wegtrekt.",
    instructies: [
      "Sta in tweetallen tegenover elkaar.",
      "Eén houdt de handpalmen omhoog, de ander legt zijn handen er losjes bovenop.",
      "Wie onder ligt, probeert de bovenste handen te tikken met een snelle beweging.",
      "Lukt het? Punt. Trekt de ander op tijd weg? Punt voor hem.",
      "Na vijf pogingen wisselen jullie van rol.",
    ],
    duur: "3 min",
    categorie: "Beweging",
  },
  {
    titel: "Sleutelbewaker",
    beschrijving: "Sluip naar de sleutels zonder dat de bewaker je hoort.",
    instructies: [
      "Eén leerling zit geblinddoekt op een stoel met een sleutelbos eronder.",
      "De meester wijst stil een 'dief' aan die naar voren sluipt.",
      "Hoort de bewaker iets, dan wijst hij die kant op — klopt het, dan is de dief af.",
      "Pakt de dief de sleutels en komt hij terug op zijn plek? Dan heeft hij gewonnen.",
      "De gepakte of winnende dief mag de nieuwe bewaker zijn.",
    ],
    duur: "5 min",
    categorie: "Beweging",
  },
  {
    titel: "Knietik-kring",
    beschrijving: "Tik de knie van je linkerbuur voor je rechterbuur die van jou tikt.",
    instructies: [
      "Sta in een kring, handen bij je knieën.",
      "Op 'start' probeert iedereen de knie van zijn linkerbuur te tikken.",
      "Tegelijk moet je je eigen knieën beschermen tegen je rechterbuur.",
      "Word je twee keer getikt, dan doe je een stap naar achteren en juich je mee.",
      "Speel tot er een klein winnend groepje overblijft.",
    ],
    duur: "3 min",
    categorie: "Beweging",
  },
  {
    titel: "Bewegingsketting",
    beschrijving: "Bouw samen een reeks bewegingen op — en vergeet er geen.",
    instructies: [
      "Sta in een kring. De eerste leerling doet één beweging (bijv. springen).",
      "De volgende herhaalt die en voegt er een eigen beweging aan toe.",
      "Zo groeit de ketting: elke leerling doet eerst alles na en breidt uit.",
      "Wie de volgorde kwijt is, mag geholpen worden door de klas.",
      "Haalt de klas de hele kring rond zonder fouten?",
    ],
    duur: "5 min",
    categorie: "Beweging",
  },
  {
    titel: "Land - Zee",
    beschrijving: "Spring de goede kant op — één foute sprong en je bent af.",
    instructies: [
      "Trek een denkbeeldige lijn op de grond: links is 'land', rechts is 'zee'.",
      "Iedereen staat op de lijn.",
      "De meester roept 'land!' of 'zee!' en iedereen springt met beide voeten die kant op.",
      "Roept de meester dezelfde kant nog eens, dan blijf je gewoon staan.",
      "Wie de verkeerde kant op springt of wiebelt, is af — het tempo gaat steeds omhoog.",
    ],
    duur: "3 min",
    categorie: "Beweging",
  },
  {
    titel: "Dierenestafette",
    beschrijving: "Kikkersprong heen, krabgang terug — tik dan de volgende aan.",
    instructies: [
      "Maak twee of drie teams achter een startlijn.",
      "De eerste hupt als een kikker naar de overkant.",
      "Terug gaat het als krab (op handen en voeten, buik omhoog).",
      "Bij de startlijn tik je de volgende aan, die een nieuw dier krijgt van de meester.",
      "Het team dat als eerste helemaal rond is, wint.",
    ],
    duur: "4 min",
    categorie: "Beweging",
  },
  {
    titel: "Elektriciteit",
    beschrijving: "Geef het kneepje snel door — waar zit de stroom nu?",
    instructies: [
      "Sta in een kring, handen vast, één leerling in het midden.",
      "De meester knijpt zachtjes in de hand van een leerling; die geeft het kneepje door.",
      "De 'stroom' gaat zo snel mogelijk de kring rond, links of rechts.",
      "De leerling in het midden wijst aan waar het kneepje volgens hem is.",
      "Raadt hij goed, dan wisselt hij met die leerling.",
    ],
    duur: "4 min",
    categorie: "Beweging",
  },
  {
    titel: "Ballon in de lucht",
    beschrijving: "Houd de ballon samen omhoog — de grond is verboden.",
    instructies: [
      "De klas staat in een kring of open ruimte met één ballon.",
      "Tik de ballon om de beurt omhoog; niemand mag hem twee keer achter elkaar raken.",
      "Raakt de ballon de grond, dan begint de teller opnieuw.",
      "Tel hardop hoeveel tikken de klas haalt.",
      "Lukt 30? Gooi er een tweede ballon bij.",
    ],
    duur: "3 min",
    categorie: "Beweging",
  },
  {
    titel: "Snel sorteren",
    beschrijving: "Ga in de juiste volgorde staan — zonder één woord te zeggen.",
    instructies: [
      "De meester noemt een volgorde: op lengte, op schoenmaat, of op verjaardag.",
      "De klas gaat zo snel mogelijk in één rij in die volgorde staan.",
      "Praten mag niet — wijzen, gebaren en duwen wel.",
      "De meester stopt de tijd en loopt de rij na op fouten.",
      "Volgende ronde: probeer het eigen record te verbreken.",
    ],
    duur: "4 min",
    categorie: "Beweging",
  },
  {
    titel: "Robot sturen",
    beschrijving: "Loods je robot met schoudertikjes naar de finish — ogen dicht.",
    instructies: [
      "Werk in tweetallen: één is de robot met de ogen dicht, één is de bestuurder.",
      "Tik op de rechterschouder = naar rechts, links = naar links, tussen de schouders = rechtdoor.",
      "Stuur je robot van de ene kant van het lokaal naar een doel, zonder botsingen.",
      "Bots je tegen een tafel of andere robot, dan begin je opnieuw.",
      "Wissel van rol als je het doel hebt bereikt.",
    ],
    duur: "4 min",
    categorie: "Beweging",
  },
  {
    titel: "Volg de leider",
    beschrijving: "De rader zoekt wie stiekem alle bewegingen begint.",
    instructies: [
      "Eén leerling gaat even de gang op.",
      "De klas kiest een 'leider' die steeds nieuwe bewegingen begint (klappen, stampen, wiebelen).",
      "Iedereen doet de leider zo onopvallend mogelijk na.",
      "De rader komt terug in het midden en heeft drie pogingen om de leider aan te wijzen.",
      "De leider wordt de nieuwe rader.",
    ],
    duur: "4 min",
    categorie: "Beweging",
  },
  {
    titel: "Denkbeeldig springtouw",
    beschrijving: "Spring op tijd 'in het touw' dat er niet is.",
    instructies: [
      "Twee leerlingen 'draaien' een denkbeeldig springtouw met grote armbewegingen en tellen hardop.",
      "De rest staat in een rij en springt om de beurt 'in het touw'.",
      "Je springt drie keer mee en loopt er dan weer 'uit'.",
      "Wie de maat van de draaiers mist, neemt de plek van een draaier over.",
      "Extra: laat twee leerlingen tegelijk in het touw springen.",
    ],
    duur: "3 min",
    categorie: "Beweging",
  },
  {
    titel: "Handjeklap-toernooi",
    beschrijving: "Klap het ritme met je maatje — steeds sneller, winnaars door.",
    instructies: [
      "Sta in tweetallen en spreek een klappatroon af (eigen handen, dan tegen elkaar).",
      "Doe het patroon samen, elke ronde iets sneller.",
      "Maakt een van jullie een fout, dan verliest dat koppel.",
      "Winnaars zoeken een nieuwe winnaar als tegenstander.",
      "Speel door tot er één kampioenskoppel over is.",
    ],
    duur: "4 min",
    categorie: "Beweging",
  },
  {
    titel: "De lavavloer",
    beschrijving: "Kom van muur tot muur zonder de 'lava' aan te raken.",
    instructies: [
      "Maak groepjes van vier; elk groepje krijgt drie vellen papier (de 'eilanden').",
      "De vloer is lava — je mag alleen op de eilanden staan.",
      "Leg een eiland neer, stap erop en geef het achterste eiland door naar voren.",
      "Raakt iemand de vloer, dan gaat het hele groepje terug naar de start.",
      "Welk groepje bereikt als eerste de overkant?",
    ],
    duur: "5 min",
    categorie: "Beweging",
  },
  {
    titel: "Annemaria Koekoek",
    beschrijving: "Sluip naar de muur en bevries zodra de wachter zich omdraait.",
    instructies: [
      "Eén leerling is de wachter en staat met het gezicht naar de muur; de rest staat achterin op een startlijn.",
      "Zolang de wachter naar de muur kijkt, sluipen de leerlingen vooruit.",
      "De wachter draait zich plots om — iedereen moet meteen doodstil staan.",
      "Wie nog beweegt, gaat terug naar de startlijn.",
      "Wie als eerste de muur aantikt, is de nieuwe wachter.",
    ],
    duur: "4 min",
    categorie: "Beweging",
  },
  {
    titel: "Tik de kleur",
    beschrijving: "De meester roept een kleur — raak er zo snel mogelijk iets van aan.",
    instructies: [
      "Iedereen staat in het midden van het lokaal.",
      "De meester roept een kleur, bijvoorbeeld 'blauw!'.",
      "Iedereen rent en raakt zo snel mogelijk iets van die kleur aan.",
      "De laatste die een goede kleur aanraakt, doet een korte opdracht (vijf sprongen).",
      "Speel door met steeds andere kleuren; sluit af met 'terug naar je plek!'.",
    ],
    duur: "3 min",
    categorie: "Beweging",
  },
  {
    titel: "Kat en muis om de kring",
    beschrijving: "Ren om de stoelenkring en plof op een lege stoel voor je getikt wordt.",
    instructies: [
      "Zet de stoelen in een kring, iedereen zit, twee stoelen blijven leeg.",
      "De 'muis' loopt buiten de kring en tikt iemand op de schouder.",
      "Die leerling wordt de 'kat' en probeert de muis te tikken — allebei rennen om de kring.",
      "De muis is veilig zodra hij op een lege stoel ploft.",
      "De kat wordt de nieuwe muis en tikt iemand nieuw aan.",
    ],
    duur: "4 min",
    categorie: "Beweging",
  },
  {
    titel: "Team steen-papier-schaar",
    beschrijving: "Kies samen een houding — het winnende team jaagt het andere naar huis.",
    instructies: [
      "Twee teams staan op een lijn tegenover elkaar, met achter elk team een 'thuis'.",
      "Kies met je team stiekem: steen (hurken), papier (armen en benen wijd) of schaar (schrede).",
      "Op '1-2-3!' laat elk team zijn houding tegelijk zien.",
      "Het winnende team jaagt het andere naar hun thuis; wie getikt wordt, wisselt van team.",
      "Bij gelijke houding kies je meteen opnieuw.",
    ],
    duur: "4 min",
    categorie: "Beweging",
  },
  {
    titel: "Fruitmand",
    beschrijving: "Je fruit wordt geroepen? Snel wisselen van stoel!",
    instructies: [
      "Iedereen zit in een kring op een stoel, één leerling staat in het midden.",
      "Geef de kring rond een fruitnaam: appel, peer, banaan, appel, peer, banaan…",
      "De leerling in het midden roept een fruit — al die leerlingen wisselen van stoel.",
      "Ook de leerling in het midden zoekt een stoel; wie overblijft, staat in het midden.",
      "Bij 'fruitmand!' wisselt de hele kring van plek.",
    ],
    duur: "4 min",
    categorie: "Beweging",
  },
  {
    titel: "Wie ben ik?",
    beschrijving: "Loop rond en raad met ja/nee-vragen welk woord er op je rug hangt.",
    instructies: [
      "De meester plakt bij iedereen een woord op de rug (dier, beroep, voorwerp).",
      "Loop rond en zoek steeds een nieuwe partner.",
      "Stel elkaar om de beurt één ja/nee-vraag over je eigen woord.",
      "Denk je het te weten, dan check je het bij de meester.",
      "Klopt het, dan help je de anderen verder raden.",
    ],
    duur: "5 min",
    categorie: "Beweging",
  },
  {
    titel: "Bevroren tikkertje",
    beschrijving: "Getikt? Sta bevroren tot iemand je onderdoor kruipt en bevrijdt.",
    instructies: [
      "Kies twee tikkers; maak een deel van het lokaal vrij.",
      "Word je getikt, dan sta je bevroren met je armen wijd.",
      "Een medeleerling bevrijdt je door onder je arm door te kruipen.",
      "De tikkers proberen iedereen tegelijk bevroren te krijgen.",
      "Lukt dat, dan kiezen we nieuwe tikkers.",
    ],
    duur: "4 min",
    categorie: "Beweging",
  },
  {
    titel: "Boek-balans-estafette",
    beschrijving: "Loop met een boek op je hoofd naar de overkant — zonder handen.",
    instructies: [
      "Maak twee of drie teams achter een startlijn, elk met een boek.",
      "Loop met het boek plat op je hoofd naar de overkant en terug, zonder het vast te houden.",
      "Valt het boek, dan blijf je staan, legt het terug en loopt verder.",
      "Bij de startlijn geef je het boek door aan de volgende.",
      "Het team dat als eerste helemaal rond is, wint.",
    ],
    duur: "4 min",
    categorie: "Beweging",
  },
  {
    titel: "Dominogolf",
    beschrijving: "Hurk zodra je buur omhoog komt — als een rij vallende dominostenen.",
    instructies: [
      "Ga in een lange rij naast elkaar staan.",
      "De meester start de golf: de eerste hurkt en komt weer omhoog.",
      "Zodra jouw buur omhoog komt, hurk jij.",
      "De golf gaat één keer heen en één keer terug door de rij.",
      "Klok de tijd en probeer de golf steeds vloeiender te maken.",
    ],
    duur: "3 min",
    categorie: "Beweging",
  },
  {
    titel: "Spud",
    beschrijving: "Bal omhoog, naam roepen, wegrennen — tot 'STOP!' klinkt.",
    instructies: [
      "Iedereen staat dicht bij elkaar; één leerling heeft een zachte bal.",
      "Die gooit de bal recht omhoog en roept de naam van een klasgenoot.",
      "Iedereen rent weg, behalve wie geroepen is: die vangt de bal en roept 'STOP!'.",
      "Nu staat iedereen stil; de vanger zet drie grote stappen naar iemand toe.",
      "Raakt hij die persoon met een zachte worp, dan krijgt die een letter van S-P-U-D.",
    ],
    duur: "5 min",
    categorie: "Beweging",
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
    categorie: "Samenwerking",
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
    categorie: "Samenwerking",
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
  },
  {
    titel: "Buzz",
    beschrijving: "Tel in een kring, maar zeg 'buzz' bij elk veelvoud van een getal.",
    instructies: [
      "Kies een getal, bijv. 3. Iedereen telt om de beurt: 1, 2, buzz, 4, 5, buzz…",
      "Wie het veelvoud vergeet en gewoon het getal zegt, is af.",
      "Maak het moeilijker: twee getallen tegelijk (bijv. 3 én 5 → double buzz).",
      "Of tel achteruit vanaf 30.",
      "Werkt ook goed als oefening voor tafels.",
    ],
    duur: "4 min",
    categorie: "Taal",
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
    categorie: "Taal",
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
    categorie: "Spel",
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
    categorie: "Spel",
  },
];

const slug = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const DEFAULT_ENERGIZERS: Energizer[] = RAW_ENERGIZERS.map((e) => ({ ...e, id: slug(e.titel) }));

type Row = {
  id: string;
  titel: string;
  beschrijving: string | null;
  instructies: unknown;
  duur: string | null;
  categorie: string | null;
};

const isCategorie = (v: unknown): v is Categorie =>
  typeof v === "string" && (CATEGORIEEN as readonly string[]).includes(v);

const mapRow = (r: Row): Energizer => ({
  id: r.id,
  titel: r.titel,
  beschrijving: r.beschrijving ?? "",
  instructies: Array.isArray(r.instructies) ? r.instructies.map((x) => String(x)) : [],
  duur: r.duur ?? "",
  categorie: isCategorie(r.categorie) ? r.categorie : "Spel",
});

const toPayload = (e: Omit<Energizer, "id">, sort: number) => ({
  titel: e.titel,
  beschrijving: e.beschrijving,
  instructies: e.instructies,
  duur: e.duur,
  categorie: e.categorie,
  sort,
});

// Laadt de energizers uit Supabase. Is de tabel nog leeg, dan wordt hij eenmalig
// gevuld met de standaardlijst. Lukt dat niet (tabel bestaat niet / geen verbinding),
// dan valt de pagina terug op de ingebouwde lijst en is bewerken uitgeschakeld.
async function loadEnergizers(): Promise<{ list: Energizer[]; readOnly: boolean }> {
  try {
    const { data, error } = await supabase
      .from("energizers").select("*").order("sort", { ascending: true });
    if (error) return { list: DEFAULT_ENERGIZERS, readOnly: true };
    if (!data || data.length === 0) {
      const { data: seeded, error: seedErr } = await supabase
        .from("energizers")
        .insert(RAW_ENERGIZERS.map((e, i) => toPayload(e, i)))
        .select();
      if (seedErr || !seeded) return { list: DEFAULT_ENERGIZERS, readOnly: true };
      return { list: (seeded as Row[]).map(mapRow), readOnly: false };
    }
    return { list: (data as Row[]).map(mapRow), readOnly: false };
  } catch {
    return { list: DEFAULT_ENERGIZERS, readOnly: true };
  }
}

type FormVal = {
  titel: string;
  categorie: Categorie;
  duur: string;
  beschrijving: string;
  instructiesTekst: string;
};

const legeForm: FormVal = { titel: "", categorie: "Beweging", duur: "3 min", beschrijving: "", instructiesTekst: "" };

const naarForm = (e: Energizer): FormVal => ({
  titel: e.titel,
  categorie: e.categorie,
  duur: e.duur,
  beschrijving: e.beschrijving,
  instructiesTekst: e.instructies.join("\n"),
});

const Energizers = ({ onClose }: { onClose: () => void }) => {
  const [lijst, setLijst] = useState<Energizer[]>(DEFAULT_ENERGIZERS);
  const [loading, setLoading] = useState(true);
  const [readOnly, setReadOnly] = useState(false);
  const [selected, setSelected] = useState<Energizer | null>(null);
  const [filter, setFilter] = useState<Categorie | "Alles">("Alles");
  const [bewerken, setBewerken] = useState(false);
  const [form, setForm] = useState<{ mode: "nieuw" | Energizer; val: FormVal } | null>(null);
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  useEffect(() => {
    loadEnergizers().then(({ list, readOnly }) => {
      setLijst(list);
      setReadOnly(readOnly);
      setLoading(false);
    });
  }, []);

  const zichtbaar = useMemo(
    () => (filter === "Alles" ? lijst : lijst.filter((e) => e.categorie === filter)),
    [filter, lijst],
  );

  const gegroepeerd = useMemo(
    () =>
      CATEGORIEEN.map((cat) => ({
        categorie: cat,
        items: zichtbaar.filter((e) => e.categorie === cat),
      })).filter((groep) => groep.items.length > 0),
    [zichtbaar],
  );

  const random = () => {
    const bron = zichtbaar.length > 0 ? zichtbaar : lijst;
    if (bron.length === 0) return;
    setSelected(bron[Math.floor(Math.random() * bron.length)]);
  };

  const opslaanForm = async () => {
    if (!form) return;
    const val = form.val;
    if (!val.titel.trim()) return;
    const kern: Omit<Energizer, "id"> = {
      titel: val.titel.trim(),
      beschrijving: val.beschrijving.trim(),
      instructies: val.instructiesTekst.split("\n").map((r) => r.trim()).filter(Boolean),
      duur: val.duur.trim(),
      categorie: val.categorie,
    };
    setBezig(true);
    setFout(null);
    let err: string | null = null;
    if (form.mode === "nieuw") {
      const { data, error } = await supabase
        .from("energizers").insert(toPayload(kern, Date.now())).select().single();
      if (error || !data) err = "Opslaan mislukt. Is de energizers-tabel al aangemaakt in Supabase?";
      else setLijst((prev) => [...prev, mapRow(data as Row)]);
    } else {
      const id = form.mode.id;
      const { error } = await supabase.from("energizers").update(kern).eq("id", id);
      if (error) err = "Opslaan mislukt.";
      else setLijst((prev) => prev.map((e) => (e.id === id ? { ...e, ...kern } : e)));
    }
    setBezig(false);
    setFout(err);
    if (!err) setForm(null);
  };

  const verwijder = async (e: Energizer) => {
    if (!window.confirm(`"${e.titel}" verwijderen?`)) return;
    setBezig(true);
    setFout(null);
    const { error } = await supabase.from("energizers").delete().eq("id", e.id);
    if (error) setFout("Verwijderen mislukt.");
    else setLijst((prev) => prev.filter((x) => x.id !== e.id));
    setBezig(false);
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
          <div className={`w-full max-w-2xl rounded-3xl border-2 p-8 shadow-tile ${CAT_KLEUR[selected.categorie]}`}>
            <span className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold mb-4 ${CAT_KLEUR[selected.categorie]}`}>
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
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Klas</p>
          <h2 className="font-display text-xl font-semibold">Energizers</h2>
        </div>
        <div className="flex items-center gap-2">
          {bewerken && !readOnly && (
            <button
              onClick={() => { setFout(null); setForm({ mode: "nieuw", val: legeForm }); }}
              className="flex items-center gap-2 rounded-xl border border-border bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-smooth hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Toevoegen
            </button>
          )}
          {!readOnly && (
            <button
              onClick={() => { setBewerken((b) => !b); setFout(null); }}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-smooth ${
                bewerken
                  ? "border-primary bg-primary text-primary-foreground hover:opacity-90"
                  : "border-border bg-card hover:border-accent"
              }`}
            >
              {bewerken ? <><Check className="h-4 w-4" /> Klaar</> : <><Pencil className="h-4 w-4" /> Bewerken</>}
            </button>
          )}
          {!bewerken && (
            <button
              onClick={random}
              className="flex items-center gap-2 rounded-xl border border-border bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90"
            >
              <Shuffle className="h-4 w-4" /> Willekeurig
            </button>
          )}
          <button onClick={onClose} className="rounded-xl border border-border p-2 transition-smooth hover:border-accent">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="shrink-0 border-b border-border bg-card/60 px-6 py-3">
        <div className="flex flex-wrap gap-2">
          {(["Alles", ...CATEGORIEEN] as const).map((cat) => {
            const actief = filter === cat;
            const aantal = cat === "Alles" ? lijst.length : lijst.filter((e) => e.categorie === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-smooth ${
                  actief
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-accent hover:text-foreground"
                }`}
              >
                {cat} <span className="opacity-60">{aantal}</span>
              </button>
            );
          })}
        </div>
      </div>

      {fout && (
        <div className="shrink-0 border-b border-destructive/30 bg-destructive/10 px-6 py-2 text-sm text-destructive">
          {fout}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <p className="text-muted-foreground">Laden…</p>
        ) : (
          <div className="flex flex-col gap-10">
            {gegroepeerd.map((groep) => (
              <section key={groep.categorie}>
                <div className="mb-3 flex items-center gap-3">
                  <h3 className="font-display text-lg font-semibold">{groep.categorie}</h3>
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${CAT_KLEUR[groep.categorie]}`}>
                    {groep.items.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {groep.items.map((e) => {
                    const kop = (
                      <>
                        <div className="flex w-full items-start justify-between gap-2">
                          <div className="rounded-xl bg-secondary p-2">
                            <Zap className="h-5 w-5 text-accent" strokeWidth={1.8} />
                          </div>
                          <div className="flex gap-1.5">
                            <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${CAT_KLEUR[e.categorie]}`}>{e.categorie}</span>
                            <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">{e.duur}</span>
                          </div>
                        </div>
                        <div>
                          <p className="font-display text-lg font-semibold leading-tight">{e.titel}</p>
                          <p className="mt-1 text-sm text-muted-foreground leading-snug">{e.beschrijving}</p>
                        </div>
                      </>
                    );
                    if (bewerken) {
                      return (
                        <div
                          key={e.id}
                          className="flex flex-col items-start gap-3 rounded-2xl border-2 border-border bg-card p-5 shadow-soft"
                        >
                          {kop}
                          <div className="mt-1 flex w-full gap-2">
                            <button
                              onClick={() => { setFout(null); setForm({ mode: e, val: naarForm(e) }); }}
                              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-medium transition-smooth hover:border-accent"
                            >
                              <Pencil className="h-3.5 w-3.5" /> Bewerken
                            </button>
                            <button
                              onClick={() => verwijder(e)}
                              disabled={bezig}
                              className="flex items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-medium text-destructive transition-smooth hover:border-destructive disabled:opacity-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <button
                        key={e.id}
                        onClick={() => setSelected(e)}
                        className="group flex flex-col items-start gap-3 rounded-2xl border-2 border-transparent bg-card p-5 shadow-soft text-left transition-smooth hover:-translate-y-1 hover:shadow-tile hover:border-accent"
                      >
                        {kop}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {form && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-tile">
            <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
              <h3 className="font-display text-lg font-semibold">
                {form.mode === "nieuw" ? "Nieuwe energizer" : "Energizer bewerken"}
              </h3>
              <button onClick={() => setForm(null)} className="rounded-xl border border-border p-2 transition-smooth hover:border-accent">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-muted-foreground">Titel</span>
                <input
                  autoFocus
                  value={form.val.titel}
                  onChange={(ev) => setForm({ ...form, val: { ...form.val, titel: ev.target.value } })}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-muted-foreground">Categorie</span>
                  <select
                    value={form.val.categorie}
                    onChange={(ev) => setForm({ ...form, val: { ...form.val, categorie: ev.target.value as Categorie } })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  >
                    {CATEGORIEEN.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-muted-foreground">Duur</span>
                  <input
                    value={form.val.duur}
                    onChange={(ev) => setForm({ ...form, val: { ...form.val, duur: ev.target.value } })}
                    placeholder="3 min"
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-muted-foreground">Korte beschrijving</span>
                <textarea
                  rows={2}
                  value={form.val.beschrijving}
                  onChange={(ev) => setForm({ ...form, val: { ...form.val, beschrijving: ev.target.value } })}
                  className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-muted-foreground">Instructies — één stap per regel</span>
                <textarea
                  rows={7}
                  value={form.val.instructiesTekst}
                  onChange={(ev) => setForm({ ...form, val: { ...form.val, instructiesTekst: ev.target.value } })}
                  className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm leading-relaxed outline-none focus:border-accent"
                />
              </label>

              {fout && <p className="text-sm text-destructive">{fout}</p>}
            </div>

            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border px-6 py-4">
              {form.mode !== "nieuw" ? (
                <button
                  onClick={() => { const e = form.mode as Energizer; setForm(null); verwijder(e); }}
                  className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-sm font-medium text-destructive transition-smooth hover:border-destructive"
                >
                  <Trash2 className="h-4 w-4" /> Verwijderen
                </button>
              ) : <span />}
              <div className="flex gap-2">
                <button
                  onClick={() => setForm(null)}
                  className="rounded-xl border border-border px-4 py-2 text-sm font-medium transition-smooth hover:border-accent"
                >
                  Annuleren
                </button>
                <button
                  onClick={opslaanForm}
                  disabled={bezig || !form.val.titel.trim()}
                  className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90 disabled:opacity-40"
                >
                  {bezig ? "Opslaan…" : "Opslaan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Energizers;
