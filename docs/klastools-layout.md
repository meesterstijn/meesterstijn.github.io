# Klastools aanpassen

De pagina gebruikt Tailwind 3 met Vite. Instellingen staan in
`src/components/widgetBoardLayout.ts`.

- `BOARD_CLASSES.page`: paginabreedte en buitenmarges.
- `BOARD_CLASSES.field`: `gap-6` bepaalt de tussenruimte.
  Vanaf `sm` (640px) staan alle zichtbare vensters naast elkaar.
  Op kleinere schermen staan ze onder elkaar.
- `boardColumns`: verdeelt de beschikbare breedte in relatieve delen met
  `minmax(0, gewicht fr)`. Een venster met breedte 6 is twee keer zo breed
  als een venster met breedte 3. De rij vult altijd de beschikbare breedte.
  Verklein je een venster, dan groeien de andere. Verborgen vensters tellen niet mee.
- `BOARD_CLASSES.content`: `h-[var(--widget-height)]` volgt de ingestelde hoogte.
- `BOARD_SIZE`: standaardhoogte en minimale/maximale hoogte in pixels.

In `src/pages/Klastools.tsx` staat de widgets-lijst met per venster
`id`, `title`, `content`, `width` (3, 4, 6, 8 of 12 als relatief gewicht)
en optioneel `height` in pixels. Standaard is de verhouding 3:6:3.

De browser bewaart gekozen afmetingen. Via **Blok toevoegen ? Standaardindeling
herstellen** herstel je de standaardwaarden; via **? ? Standaardformaat**
herstel je alleen het betreffende venster.

## Schermhoogte

Vanaf 640px breedte volgt het werkveld de beschikbare vensterhoogte onder de kop en bediening. Het past zich aan bij vensterwijzigingen, zoom en fullscreen. Stoplicht en Beurtstokjes behouden de verhouding 2:1. De inhoud van modules kan afzonderlijk scrollen. Bij minder dan 280px beschikbare hoogte mag de pagina scrollen om de bediening bereikbaar te houden. Op smalle schermen staan de modules onder elkaar en gebruiken ze hun opgeslagen individuele hoogtes.
