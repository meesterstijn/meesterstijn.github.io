# Meester Stijn — Klaslokaal Dashboard

Een warm, modern dashboard voor in de klas. Gebouwd met:

- **React 18** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS** (styling)
- **shadcn/ui** (UI componenten)
- **React Router** (pagina's)

## Aan de slag

```bash
npm install
npm run dev
```

## Bouwen voor productie

```bash
npm run build
```

De output staat in `dist/`. Push dit naar je GitHub Pages repo.

## Pagina's

- `/` — Startpagina met klok en tegels
- `/planning` — Weekrooster
- `/bestanden` — Bestandenbibliotheek
- `/quotes` — Inspirerende citaten

## GitHub Pages deployen

Voeg dit toe aan je `package.json` scripts en installeer `gh-pages`:

```bash
npm install --save-dev gh-pages
```

En in `package.json`:
```json
"deploy": "npm run build && gh-pages -d dist"
```

Dan: `npm run deploy`
