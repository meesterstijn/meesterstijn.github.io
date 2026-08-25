import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { useClasses } from "@/context/ClassContext";

export const ClassSwitcher = () => {
  const { classes, activeClassId, setActiveClassId, addClass, loading } = useClasses();
  const [nieuw, setNieuw] = useState(false);
  const [naam, setNaam] = useState("");

  if (loading) return null;

  if (classes.length === 0) {
    if (!nieuw) {
      return (
        <button
          onClick={() => setNieuw(true)}
          title="Eerst een klas aanmaken"
          className="flex items-center gap-1 rounded-full border border-dashed border-border px-3.5 py-2 text-sm font-medium text-muted-foreground transition-smooth hover:border-accent hover:text-accent"
        >
          <Plus className="h-3.5 w-3.5" /> Klas
        </button>
      );
    }
    const submit = async () => {
      if (!naam.trim()) { setNieuw(false); return; }
      await addClass(naam);
      setNaam("");
      setNieuw(false);
    };
    return (
      <div className="flex items-center gap-1.5 rounded-full border border-accent bg-card px-2 py-1">
        <input
          autoFocus
          value={naam}
          onChange={e => setNaam(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") submit(); if (e.key === "Escape") { setNaam(""); setNieuw(false); } }}
          onBlur={submit}
          placeholder="Naam klas…"
          className="w-28 bg-transparent px-1.5 py-1 text-sm outline-none"
        />
      </div>
    );
  }

  return (
    <div className="relative">
      <select
        value={activeClassId ?? ""}
        onChange={e => setActiveClassId(e.target.value)}
        title="Actieve klas"
        className="appearance-none rounded-full border border-border bg-card py-2 pl-4 pr-8 text-sm font-medium text-foreground outline-none transition-smooth hover:border-accent focus:border-accent cursor-pointer"
      >
        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
};
