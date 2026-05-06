import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { FileText, FileSpreadsheet, FileImage, FileType, Download, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type FileItem = {
  name: string;
  category: "Eigen onderwerpen" | "ICT Lessen" | "Rekentijgers" | "Werkwoordspelling";
  type: "pdf" | "doc" | "sheet" | "image";
  size: string;
  updated: string;
  href?: string;
};

const files: FileItem[] = [
  { name: "Atomen en moleculen",             category: "Eigen onderwerpen", type: "doc", size: "", updated: "", href: "https://docs.google.com/document/d/11xUxWUe7yg4JNrFSCkojlbH6Z_dfXswfvQf3ku3HWwQ/edit?usp=sharing" },
  { name: "Atoombommen en waterstofbommen",  category: "Eigen onderwerpen", type: "doc", size: "", updated: "", href: "https://docs.google.com/document/d/1Fdwrn1Mj5MnMu3CB0CUclHqsolOygQ-T6JwJa0pPuYI/edit?usp=sharing" },
  { name: "De Ruimte",                       category: "Eigen onderwerpen", type: "doc", size: "", updated: "", href: "https://docs.google.com/document/d/1LhbCPe4rs5SYN7MMB7IfQq3jDxhEEABCZK_4XGft6QA/edit?usp=sharing" },
  { name: "De Tweede Wereldoorlog in 's-Gravendeel", category: "Eigen onderwerpen", type: "pdf", size: "", updated: "", href: "https://drive.google.com/file/d/1J8ffqaGk1ZZ9G4LR_0TwB1TxhtsKxE1z/view?usp=sharing" },
  { name: "Leren leren",                     category: "Eigen onderwerpen", type: "pdf", size: "", updated: "", href: "https://drive.google.com/file/d/1jFjsQx18LW1WzzCcZlHxjvsRObp3LsT_/view?usp=sharing" },
  { name: "Nucleaire Fysica",                category: "Eigen onderwerpen", type: "pdf", size: "", updated: "", href: "https://docs.google.com/document/d/1LlxXQwAR6dpVa7mccfs_8CoLNci-BiqJhFegXGGRTAE/edit?usp=sharing" },
  { name: "Binas", category: "Eigen onderwerpen", type: "pdf", size: "", updated: "", href: "https://drive.google.com/file/d/1gPl0KXNBzLCNqxfRdLgWIkZ0ZIfuFvue/view?usp=sharing" },
  { name: "Algoritmes leerkrachtinstructie", category: "ICT Lessen", type: "pdf", size: "", updated: "", href: "https://drive.google.com/file/d/1gJlbdMDD4l8zOhKUm4S2ngdE9SJDKQ1H/view?usp=sharing" },
  { name: "Algoritmes werkbladen",            category: "ICT Lessen", type: "pdf", size: "", updated: "", href: "https://drive.google.com/file/d/1XfFuXm3A2aMARWr87m3e15G_IAei23Mh/view?usp=sharing" },
  { name: "Binaire getallen spel",            category: "ICT Lessen", type: "pdf", size: "", updated: "", href: "https://drive.google.com/file/d/1OTord8s1-OH-KHF3aIgOQl6afETUUzTI/view?usp=sharing" },
  { name: "Encryptie leerkrachtinstructie",   category: "ICT Lessen", type: "pdf", size: "", updated: "", href: "https://drive.google.com/file/d/1qDKGe5HjNPjQIYaNiJj4RX5rAyO_mMlB/view?usp=sharing" },
  { name: "Encryptie werkbladen",             category: "ICT Lessen", type: "pdf", size: "", updated: "", href: "https://drive.google.com/file/d/1xn3zZfFsUogb-Z9hc5KseljhDFGsefdX/view?usp=sharing" },
  { name: "Internet leerkrachtinstructie",    category: "ICT Lessen", type: "pdf", size: "", updated: "", href: "https://drive.google.com/file/d/1NkDZbpM9w7A6AeYku62cKyt6TF5ISyqX/view?usp=sharing" },
  { name: "Internet werkbladen", category: "ICT Lessen", type: "pdf", size: "", updated: "", href: "https://drive.google.com/file/d/1BbBcQewizdaxEVCY1nCC0fsx5Pmx-NP-/view?usp=sharing" },
  { name: "Rekentijgers groep 7 deel A", category: "Rekentijgers", type: "pdf", size: "", updated: "", href: "https://drive.google.com/file/d/1ZKEbpC4hVozEQ_yBveHkapiTy7axGTo1/view?usp=sharing" },
  { name: "Rekentijgers groep 7 deel B", category: "Rekentijgers", type: "pdf", size: "", updated: "", href: "https://drive.google.com/file/d/13rPYsbq5in0OZkh0xVAHl0IkNmMoc_QN/view?usp=sharing" },
  { name: "Werkwoordspelling schema", category: "Werkwoordspelling", type: "pdf", size: "", updated: "", href: "https://drive.google.com/file/d/1yrfdfkrp2NXe3uAQ6RnfAtEVF6eAfa3S/view?usp=sharing" },
];

const categories = ["Alle", "Eigen onderwerpen", "ICT Lessen", "Rekentijgers", "Werkwoordspelling"] as const;

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
                      {f.category}{f.size ? ` · ${f.size}` : ""}{f.updated ? ` · ${f.updated}` : ""}
                    </p>
                  </div>
                </div>
                {f.href ? (
                  <a
                    href={f.href}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium transition-smooth group-hover:border-accent group-hover:bg-accent group-hover:text-accent-foreground"
                  >
                    <Download className="h-4 w-4" /> Openen
                  </a>
                ) : (
                  <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium transition-smooth group-hover:border-accent group-hover:bg-accent group-hover:text-accent-foreground">
                    <Download className="h-4 w-4" /> Downloaden
                  </button>
                )}
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
