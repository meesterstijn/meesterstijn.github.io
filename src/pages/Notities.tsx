import { useState, useEffect, useRef } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Plus, Trash2, FileText } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Note = { id: string; title: string; content: string; updated_at: string };

const fetchNotes = async (): Promise<Note[]> => {
  const { data } = await supabase.from("notes").select("*").order("updated_at", { ascending: false });
  return (data as Note[]) ?? [];
};

const createNote = async (): Promise<Note | null> => {
  const { data } = await supabase
    .from("notes")
    .insert({ title: "Nieuwe notitie", content: "" })
    .select()
    .single();
  return data as Note | null;
};

const saveNote = async (id: string, changes: Partial<Note>) => {
  await supabase.from("notes").update({ ...changes, updated_at: new Date().toISOString() }).eq("id", id);
};

const removeNote = async (id: string) => {
  await supabase.from("notes").delete().eq("id", id);
};

const Notities = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchNotes().then(data => {
      setNotes(data);
      if (data.length > 0) setSelectedId(data[0].id);
      setLoading(false);
    });
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) { el.style.height = "auto"; el.style.height = el.scrollHeight + "px"; }
  }, [notes, selectedId]);

  const selected = notes.find(n => n.id === selectedId) ?? null;

  const update = (field: "title" | "content", value: string) => {
    if (!selectedId) return;
    setNotes(prev => prev.map(n => n.id === selectedId ? { ...n, [field]: value } : n));
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveNote(selectedId, { [field]: value }), 600);
  };

  const handleNew = async () => {
    const note = await createNote();
    if (!note) return;
    setNotes(prev => [note, ...prev]);
    setSelectedId(note.id);
  };

  const handleDelete = async (id: string) => {
    await removeNote(id);
    setNotes(prev => {
      const rest = prev.filter(n => n.id !== id);
      if (selectedId === id) setSelectedId(rest[0]?.id ?? null);
      return rest;
    });
  };

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-paper bg-warm">
      <SiteHeader />
      <main className="container py-10 md:py-14">

        <div className="mb-8 animate-fade-up">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Persoonlijk</p>
          <h1 className="mt-2 font-display text-4xl font-semibold md:text-5xl">Notities</h1>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Laden…</p>
        ) : (
          <div className="animate-fade-up grid h-[calc(100vh-280px)] min-h-[480px] grid-cols-1 gap-0 overflow-hidden rounded-3xl border border-border bg-card shadow-soft md:grid-cols-[260px_1fr]">

            {/* Sidebar */}
            <div className="flex flex-col border-b border-border md:border-b-0 md:border-r">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                  {notes.length} notitie{notes.length !== 1 ? "s" : ""}
                </span>
                <button
                  onClick={handleNew}
                  className="flex items-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-smooth hover:opacity-90"
                >
                  <Plus className="h-3.5 w-3.5" /> Nieuw
                </button>
              </div>

              <ul className="flex-1 overflow-y-auto">
                {notes.length === 0 && (
                  <li className="px-4 py-6 text-center text-sm text-muted-foreground">
                    Nog geen notities.<br />Klik op "Nieuw" om te beginnen.
                  </li>
                )}
                {notes.map(note => (
                  <li key={note.id}>
                    <button
                      onClick={() => setSelectedId(note.id)}
                      className={`group flex w-full flex-col items-start gap-0.5 px-4 py-3 text-left transition-smooth hover:bg-muted/50 ${
                        selectedId === note.id ? "bg-muted/60 border-l-2 border-primary" : "border-l-2 border-transparent"
                      }`}
                    >
                      <span className="line-clamp-1 text-sm font-semibold leading-snug">
                        {note.title || "Naamloze notitie"}
                      </span>
                      <span className="text-[11px] text-muted-foreground">{fmt(note.updated_at)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Editor */}
            {selected ? (
              <div className="flex flex-col overflow-hidden">
                <div className="flex items-center justify-between border-b border-border px-6 py-3">
                  <input
                    value={selected.title}
                    onChange={e => update("title", e.target.value)}
                    placeholder="Titel…"
                    className="flex-1 bg-transparent font-display text-lg font-semibold outline-none placeholder:text-muted-foreground/50"
                  />
                  <button
                    onClick={() => handleDelete(selected.id)}
                    className="ml-4 text-muted-foreground transition-smooth hover:text-destructive"
                    title="Verwijder notitie"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <textarea
                  ref={textareaRef}
                  value={selected.content}
                  onChange={e => { update("content", e.target.value); const el = e.target; el.style.height = "auto"; el.style.height = el.scrollHeight + "px"; }}
                  placeholder="Begin met typen…"
                  className="flex-1 resize-none overflow-y-auto bg-transparent px-6 py-5 text-sm leading-relaxed outline-none placeholder:text-muted-foreground/40"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <FileText className="h-10 w-10 opacity-20" />
                <p className="text-sm">Selecteer een notitie of maak een nieuwe aan.</p>
              </div>
            )}
          </div>
        )}

        <footer className="mt-10 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          Meester Stijn
        </footer>
      </main>
    </div>
  );
};

export default Notities;
