import { useEffect, useState, useRef } from "react";
import { Trash2, Pencil } from "lucide-react";

const PRESETS = [
  { label: "Goedemorgen", text: "Wat fijn dat jij er bent!\n\nDe Chromebooks worden gehaald.\nDe schriften worden uitgedeeld, deze doe je in je la.\n\nWe gaan gelijk stillezen. Veel plezier!" },
];

const STORAGE_KEY = "klastools-tekstbord-html";
// New default revision: earlier local presets must not override this source update.
const MORNING_KEY = "klastools-goedemorgen-text-v2";
const getMorningText = () => {
  try { return localStorage.getItem(MORNING_KEY) ?? PRESETS[0].text; }
  catch { return PRESETS[0].text; }
};

const getSavedContent = () => {
  try {
    return sessionStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const setSavedContent = (html: string) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, html);
    localStorage.setItem(STORAGE_KEY, html);
  } catch {
    // Opslaan is een extra gemak; de editor moet blijven werken als opslag geblokkeerd is.
  }
};

export const TekstbordWidget = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [morningText, setMorningText] = useState(getMorningText);
  const [morningDraft, setMorningDraft] = useState("");
  const [editingMorning, setEditingMorning] = useState(false);
  const [morningStatus, setMorningStatus] = useState("");

  const saveContent = () => {
    if (editorRef.current) {
      setSavedContent(editorRef.current.innerHTML);
    }
  };

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const saved = getSavedContent();
    const normalize = (text: string) => text.replace(/\s+/g, " ").trim();
    const parsed = new DOMParser().parseFromString(saved ?? "", "text/html");
    parsed.querySelectorAll("br").forEach(el => el.replaceWith(" "));
    parsed.querySelectorAll("div, p").forEach(el => el.append(" "));
    const savedText = normalize(parsed.body.textContent ?? "");
    const oldGreetings = ["Wat fijn dat jij er bent!\nDe Chromebooks worden gehaald.\nDe schriften worden uitgedeeld, deze doe je in je la.\nWe gaan gelijk stillezen.", "Wat fijn dat jij er bent.\nOm half 9 gaan we beginnen met stillezen."];
    try {
      const oldCustom = localStorage.getItem("klastools-goedemorgen-text");
      if (oldCustom) oldGreetings.push(oldCustom);
    } catch { /* The default greeting also works without browser storage. */ }
    if (saved === null || oldGreetings.some(text => normalize(text) === savedText)) {
      editor.textContent = getMorningText();
      setSavedContent(editor.innerHTML);
    } else {
      editor.innerHTML = saved;
    }
  }, []);

  useEffect(() => {
    const saveWhenHidden = () => {
      if (document.visibilityState === "hidden") saveContent();
    };
    window.addEventListener("beforeunload", saveContent);
    document.addEventListener("visibilitychange", saveWhenHidden);
    return () => {
      saveContent();
      window.removeEventListener("beforeunload", saveContent);
      document.removeEventListener("visibilitychange", saveWhenHidden);
    };
  }, []);

  const loadPreset = (text: string) => {
    if (editorRef.current) {
      editorRef.current.textContent = text;
      editorRef.current.focus();
      saveContent();
    }
  };

  const clear = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
      saveContent();
    }
  };

  const saveMorning = () => {
    try {
      localStorage.setItem(MORNING_KEY, morningDraft);
      setMorningText(morningDraft);
      loadPreset(morningDraft);
      setEditingMorning(false);
      setMorningStatus("Goedemorgen-tekst opgeslagen in deze browser.");
    } catch {
      setMorningStatus("Opslaan is niet gelukt. Je browser blokkeert de opslag. Je tekst staat nog in het invoerveld.");
    }
  };

  const toolBtn = "flex items-center justify-center rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm transition-smooth hover:border-accent hover:text-accent";

  return (
    <div className="h-full rounded-3xl border border-border bg-card p-6 shadow-soft flex flex-col gap-4">

      <div className="flex flex-wrap gap-2">
        {PRESETS.map(p => (
          <button
            key={p.label}
            onClick={() => loadPreset(p.label === "Goedemorgen" ? morningText : p.text)}
            className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium transition-smooth hover:border-accent hover:text-accent"
          >
            {p.label}
          </button>
        ))}
        <button
          aria-label="Goedemorgen-tekst aanpassen"
          title="Goedemorgen-tekst aanpassen"
          aria-expanded={editingMorning}
          onClick={() => { setMorningDraft(morningText); setEditingMorning(true); setMorningStatus(""); }}
          className={toolBtn}
        ><Pencil className="h-3.5 w-3.5" /></button>
        <button onClick={clear} className={toolBtn} title="Leegmaken" aria-label="Tekstbord leegmaken"><Trash2 className="h-3.5 w-3.5" /></button>
      </div>

      {editingMorning && <div className="space-y-3 rounded-xl border border-border bg-background p-3">
        <label className="block text-sm font-medium">
          Standaardtekst voor Goedemorgen
          <textarea autoFocus value={morningDraft} onChange={e => setMorningDraft(e.target.value)} rows={5}
            className="mt-2 w-full resize-y rounded-lg border border-border bg-card p-3 text-sm focus:outline-accent" />
        </label>
        <p className="text-xs text-muted-foreground">Bewaard in deze browser, ook als je de website opnieuw opent.</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={saveMorning} className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">Opslaan en tonen</button>
          <button onClick={() => { setEditingMorning(false); setMorningStatus(""); }} className={toolBtn}>Annuleren</button>
        </div>
      </div>}
      {morningStatus && <p role="status" className="text-xs text-muted-foreground">{morningStatus}</p>}

      <div
        ref={editorRef}
        contentEditable
        role="textbox"
        aria-label="Tekstbord inhoud"
        aria-multiline="true"
        suppressContentEditableWarning
        data-placeholder=""
        className="min-h-36 flex-1 w-full overflow-y-auto rounded-xl border border-border bg-background p-4 text-2xl [&_*]:!text-2xl outline-none focus:border-accent"
        style={{ whiteSpace: "pre-wrap" }}
        onInput={saveContent}
        onBlur={saveContent}
      />
    </div>
  );
};
