import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { FileText, FileSpreadsheet, FileImage, FileType, Download, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type FileItem = {
  name: string;
  category: "Rekenen" | "Taal" | "Wereld" | "Creatief" | "Bijbel";
  type: "pdf" | "doc" | "sheet" | "image";
  size: string;
  updated: string;
};

const files: FileItem[] = [
  { name: "Breuken werkblad — set A", category: "Rekenen", type: "pdf",   size: "240 KB", updated: "2 dagen geleden" },
  { name: "Tafels oefenkaart 1–10",   category: "Rekenen", type: "pdf",   size: "180 KB", updated: "vorige week" },
  { name: "Spellingdictee categorie 12", category: "Taal", type: "doc",  size: "88 KB",  updated: "vandaag" },
  { name: "Verhalenstarters",         category: "Taal", type: "doc",     size: "120 KB", updated: "3 dagen geleden" },
  { name: "Topografie Europa — kaart", category: "Wereld", type: "image", size: "1.2 MB", updated: "1 week geleden" },
  { name: "Vulkanen — leestekst",     category: "Wereld", type: "pdf",   size: "320 KB", updated: "vandaag" },
  { name: "Knutselplan moederdag",    category: "Creatief", type: "pdf", size: "440 KB", updated: "2 dagen geleden" },
  { name: "Stilleven referentiebeeld", category: "Creatief", type: "image", size: "2.1 MB", updated: "vorige maand" },
  { name: "Mattheüs 5 — werkblad",    category: "Bijbel", type: "doc",   size: "96 KB",  updated: "vandaag" },
  { name: "Bijbelverhalen overzicht", category: "Bijbel", type: "sheet", size: "44 KB",  updated: "vorige week" },
  { name: "Cijferlijst groep 6",      category: "Rekenen", type: "sheet", size: "62 KB", updated: "vandaag" },
  { name: "Boekenlijst 2026",         category: "Taal", type: "sheet",   size: "30 KB",  updated: "1 maand geleden" },
];

const categories = ["Alle", "Rekenen", "Taal", "Wereld", "Creatief", "Bijbel"] as const;

const iconFor = (t: FileItem["type"]) =>
  t === "pdf" ? FileText : t === "doc" ? FileType : t === "sheet" ? FileSpreadsheet : FileImage;

const tintFor = (t: FileItem["type"]) =>
  t === "pdf" ? "bg-accent/10 text-accent"
  : t === "doc" ? "bg-primary/10 text-primary"
  : t === "sheet" ? "bg-sage/15 text-sage"
  : "bg-highlight/15 text-highlight-foreground";

const Bestanden = () => {
  const [cat, setCat] = useState<(typeof categories)[number]>("Alle");
  const [q, setQ] = useState("");

  const filtered = files.filter(
    (f) =>
      (cat === "Alle" || f.category === cat) &&
      f.name.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-paper bg-warm">
      <SiteHeader />
      <main className="container py-10 md:py-14">
        <div className="mb-8 max-w-2xl animate-fade-up">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Bibliotheek</p>
          <h1 className="mt-2 font-display text-4xl font-semibold md:text-5xl">Bestanden</h1>
          <p className="mt-3 text-muted-foreground">
            Werkbladen, leesteksten en bronnen, geordend per vak.
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-smooth ${
                  cat === c
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:border-accent hover:text-accent"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="relative md:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Zoek bestand…"
              className="rounded-full border-border bg-card pl-9"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((f, i) => {
            const Icon = iconFor(f.type);
            return (
              <article
                key={f.name}
                className="group animate-tile-in rounded-2xl border border-border bg-card p-5 shadow-soft transition-smooth hover:-translate-y-0.5 hover:shadow-tile"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="flex items-start gap-3">
                  <span className={`grid h-12 w-12 flex-none place-items-center rounded-xl ${tintFor(f.type)}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-lg font-semibold leading-tight">{f.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {f.category} · {f.size} · {f.updated}
                    </p>
                  </div>
                </div>
                <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium transition-smooth group-hover:border-accent group-hover:bg-accent group-hover:text-accent-foreground">
                  <Download className="h-4 w-4" /> Downloaden
                </button>
              </article>
            );
          })}
          {filtered.length === 0 && (
            <p className="col-span-full rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
              Geen bestanden gevonden.
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Bestanden;
