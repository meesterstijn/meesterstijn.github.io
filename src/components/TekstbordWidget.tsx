import { useEffect, useState, useRef } from "react";
import { Bold, Trash2 } from "lucide-react";

const PRESETS = [
  { label: "Goedemorgen", text: "Wat fijn dat jij er bent.\nOm half 9 gaan we beginnen met stillezen." },
  { label: "Klaar?",      text: "Ben je klaar? Dan: " },
];

const FONT_SIZES = [
  { label: "S", value: "2" },
  { label: "M", value: "3" },
  { label: "L", value: "5" },
];

const STORAGE_KEY = "klastools-tekstbord-html";

const getSavedContent = () => {
  try {
    return sessionStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
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
  const [fontSize, setFontSize] = useState("3");

  const saveContent = () => {
    if (editorRef.current) {
      setSavedContent(editorRef.current.innerHTML);
    }
  };

  useEffect(() => {
    const saved = getSavedContent();
    if (saved && editorRef.current) {
      editorRef.current.innerHTML = saved;
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

  const cmd = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    saveContent();
  };

  const setSize = (value: string) => {
    setFontSize(value);
    cmd("fontSize", value);
  };

  const loadPreset = (text: string) => {
    if (editorRef.current) {
      editorRef.current.innerText = text;
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

  const toolBtn = "flex items-center justify-center rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm transition-smooth hover:border-accent hover:text-accent";

  return (
    <div className="h-full rounded-3xl border border-border bg-card p-6 shadow-soft flex flex-col gap-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Tekstbord</p>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map(p => (
          <button
            key={p.label}
            onClick={() => loadPreset(p.text)}
            className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium transition-smooth hover:border-accent hover:text-accent"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-background p-2">
        <button onClick={() => cmd("bold")} className={toolBtn} title="Vet"><Bold className="h-3.5 w-3.5"/></button>
        <span className="mx-1 h-5 w-px bg-border"/>
        {FONT_SIZES.map(s => (
          <button key={s.value} onClick={() => setSize(s.value)}
            className={`${toolBtn} min-w-[30px] font-semibold ${fontSize === s.value ? "border-accent text-accent bg-accent/5" : ""}`}>
            {s.label}
          </button>
        ))}
        <span className="ml-auto"/>
        <button onClick={clear} className={toolBtn} title="Leegmaken"><Trash2 className="h-3.5 w-3.5"/></button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder=""
        className="min-h-36 flex-1 w-full overflow-y-auto rounded-xl border border-border bg-background p-4 text-lg outline-none focus:border-accent"
        style={{ whiteSpace: "pre-wrap" }}
        onInput={saveContent}
        onBlur={saveContent}
      />
    </div>
  );
};
