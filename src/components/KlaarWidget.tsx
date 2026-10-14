import { useState } from "react";
import { BookOpen, Check, ClipboardList, FileText, Pencil } from "lucide-react";
import { useClasses } from "@/context/ClassContext";

const OPTIONS = [
  { id: "eigen", label: "Eigen/peil taken", icon: ClipboardList },
  { id: "lezen", label: "Stillezen", icon: BookOpen },
  { id: "maken", label: "Maken blz.", icon: FileText },
  { id: "vrij", label: "Eigen opdracht", icon: Pencil },
] as const;
const CURRENT_OPTIONS = [
  { id: "maken", label: "Maken blz.", icon: FileText },
  { id: "vrij", label: "Maken opdracht", icon: Pencil },
] as const;
type Choice = typeof OPTIONS[number]["id"];
type Settings = { selected: Choice[]; page: string; custom: string; confirmed: boolean };
function readSettings(key: string, current = false): Settings {
  try {
    const saved = JSON.parse(localStorage.getItem(key) ?? "null");
    if (saved && Array.isArray(saved.selected)) return {
      selected: (current ? CURRENT_OPTIONS : OPTIONS).filter(option => saved.selected.includes(option.id)).map(option => option.id),
      page: typeof saved.page === "string" ? saved.page : "",
      custom: typeof saved.custom === "string" ? saved.custom : "",
      confirmed: saved.confirmed === true,
    };
  } catch { /* Use defaults when storage is unavailable or invalid. */ }
  return { selected: current ? [] : ["lezen"], page: "", custom: "", confirmed: false };
}

function Tasks({ storageKey, current = false }: { storageKey: string; current?: boolean }) {
  const options = current ? CURRENT_OPTIONS : OPTIONS;
  const [settings, setSettings] = useState(() => readSettings(storageKey, current));
  const [error, setError] = useState(false);
  const save = (next: Settings) => {
    setSettings(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); setError(false); }
    catch { setError(true); }
  };
  return <section aria-label={current ? "Huidige opdracht" : "Klaar-opdrachten"} className="space-y-4 p-5">
    <h2 className="font-display text-xl font-semibold">{current ? "Huidige opdracht" : "Ben je klaar?"}</h2>
    {settings.confirmed ? <>
      <ol className="space-y-3">
        {options.filter(option => settings.selected.includes(option.id)).map((option, index) => <li key={option.id} className="flex items-start gap-3 rounded-xl bg-secondary/50 p-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">{index + 1}</span>
          <span className="pt-0.5 text-lg font-semibold break-words whitespace-pre-wrap min-w-0">{option.id === "vrij" ? (current ? "Maken opdracht " : "") + settings.custom.trim() : option.label}{option.id === "maken" ? " " + settings.page.trim() : ""}</span>
        </li>)}
      </ol>
      <button type="button" aria-label={current ? "Huidige opdracht aanpassen" : undefined} onClick={() => save({ ...settings, confirmed: false })} className="min-h-11 rounded-lg border border-border px-4 py-2 text-sm hover:bg-secondary">Aanpassen</button>
    </> : <>
    <p className="text-xs text-muted-foreground">Tik opdrachten aan of uit. Gekleurde opdrachten staan aan.</p>
    <div className="space-y-3">
      {options.map(option => {
        const selected = settings.selected.includes(option.id);
        return <div key={option.id}>
          <button type="button" aria-label={current ? "Huidige opdracht: " + option.label : undefined} aria-pressed={selected} onClick={() => save({ ...settings, selected: selected ? settings.selected.filter(id => id !== option.id) : [...settings.selected, option.id] })}
            className={"flex min-h-14 w-full items-center gap-3 rounded-xl border p-4 text-left text-base font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent " + (selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:bg-secondary")}>
            <option.icon className="h-5 w-5 shrink-0" /><span className="flex-1">{option.label}</span>{selected && <Check aria-hidden="true" className="h-5 w-5 shrink-0" />}
          </button>
          {option.id === "maken" && selected && <label className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            Bladzijde
            <input aria-label={current ? "Huidige opdracht bladzijdenummer" : "Bladzijdenummer"} type="text" inputMode="numeric" placeholder="Bijv. 24" value={settings.page} maxLength={40}
              onChange={e => save({ ...settings, page: e.target.value })}
              className="min-h-11 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-lg focus:outline-accent" />
          </label>}
          {option.id === "vrij" && selected && <label className="mt-2 block text-sm">
            {current ? "Opdracht" : "Jouw opdracht"}
            <textarea aria-label={current ? "Huidige opdracht tekst" : "Eigen opdracht tekst"} rows={3} placeholder={current ? "Bijv. 3 en 4" : "Bijv. Maak een tekening bij je verhaal."} value={settings.custom}
              onChange={e => save({ ...settings, custom: e.target.value })}
              className="mt-2 w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-base focus:outline-accent" />
          </label>}
        </div>;
      })}
    </div>
    {settings.selected.length === 0 && <p className="text-sm text-muted-foreground">{current ? "Kies de opdracht waar de klas nu aan werkt." : "Er staan nog geen klaar-opdrachten aan."}</p>}
    {settings.selected.includes("maken") && !settings.page.trim() && <p className="text-sm text-muted-foreground">Vul een bladzijdenummer in om te selecteren.</p>}
    {settings.selected.includes("vrij") && !settings.custom.trim() && <p className="text-sm text-muted-foreground">Vul je eigen opdracht in om te selecteren.</p>}
    {settings.selected.length > 0 && <button type="button" aria-label={current ? "Huidige opdracht selecteren" : undefined} disabled={(settings.selected.includes("maken") && !settings.page.trim()) || (settings.selected.includes("vrij") && !settings.custom.trim())} onClick={() => save({ ...settings, confirmed: true })} className="min-h-12 w-full rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground disabled:opacity-40">Selecteren</button>}
    </>}
    {error && <p role="alert" className="text-sm">Bewaren lukt niet. Je keuzes werken nu wel, maar worden mogelijk niet onthouden na sluiten.</p>}
  </section>;
}

export function KlaarWidget() {
  const { activeClassId, loading } = useClasses();
  if (loading) return <p className="p-5">Klas laden...</p>;
  const key = "klastools-klaar-keuzes-" + (activeClassId ?? "algemeen");
  return <div className="divide-y divide-border">
    <Tasks key={key + "-huidig"} storageKey={key + "-huidig"} current />
    <Tasks key={key} storageKey={key} />
  </div>;
}
