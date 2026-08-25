import { useState } from "react";
import { X, Plus, Pencil, Trash2, Check, ChevronUp, ChevronDown } from "lucide-react";

import { supabase } from "@/lib/supabase";

// Taken zijn algemeen (niet per klas) — de koppeling aan een leerling gebeurt
// per klas via task_assignments.task_id, dat naar tasks.id verwijst.
export type Taak = { id: string; emoji: string; naam: string; desc: string; sortOrder: number };

type TaskRow = { id: string; name: string; description: string; icon: string; sort_order: number };
const mapTaskRow = (row: TaskRow): Taak => ({ id: row.id, emoji: row.icon, naam: row.name, desc: row.description, sortOrder: row.sort_order });

export const fetchTasks = async (): Promise<Taak[]> => {
  const { data, error } = await supabase.from("tasks").select("*").order("sort_order", { ascending: true });
  if (error || !data) return [];
  return data.map(mapTaskRow);
};

const DEFAULT_EMOJI = "🗒️";

type FormState = { naam: string; desc: string; emoji: string };
const LEEG_FORM: FormState = { naam: "", desc: "", emoji: "" };

export const TaskManagerPanel = ({ tasks, onChange, onClose }: {
  tasks: Taak[];
  onChange: (tasks: Taak[]) => void;
  onClose: () => void;
}) => {
  const [addingNew, setAddingNew]         = useState(false);
  const [editingId, setEditingId]         = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [form, setForm]                   = useState<FormState>(LEEG_FORM);
  const [saving, setSaving]               = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [deleteError, setDeleteError]     = useState<string | null>(null);

  const startAdd = () => {
    setAddingNew(true);
    setEditingId(null);
    setConfirmDeleteId(null);
    setForm(LEEG_FORM);
    setError(null);
    setDeleteError(null);
  };

  const startEdit = (taak: Taak) => {
    setEditingId(taak.id);
    setAddingNew(false);
    setConfirmDeleteId(null);
    setForm({ naam: taak.naam, desc: taak.desc, emoji: taak.emoji });
    setError(null);
    setDeleteError(null);
  };

  const startDelete = (id: string) => {
    setConfirmDeleteId(id);
    setAddingNew(false);
    setEditingId(null);
    setDeleteError(null);
  };

  const cancelForm = () => {
    setAddingNew(false);
    setEditingId(null);
    setForm(LEEG_FORM);
    setError(null);
  };

  const submitForm = async () => {
    const naam = form.naam.trim();
    if (!naam) { setError("Vul een naam in."); return; }
    const dubbel = tasks.some(t => t.id !== editingId && t.naam.trim().toLowerCase() === naam.toLowerCase());
    if (dubbel) { setError("Er bestaat al een taak met deze naam."); return; }

    const desc = form.desc.trim();
    const emoji = form.emoji.trim() || DEFAULT_EMOJI;

    setSaving(true);
    setError(null);

    if (editingId) {
      const { data, error: err } = await supabase
        .from("tasks")
        .update({ name: naam, description: desc, icon: emoji })
        .eq("id", editingId)
        .select()
        .single();
      setSaving(false);
      if (err || !data) { setError("Opslaan mislukt. Probeer het opnieuw."); return; }
      onChange(tasks.map(t => t.id === editingId ? mapTaskRow(data as TaskRow) : t));
    } else {
      const sortOrder = tasks.length > 0 ? Math.max(...tasks.map(t => t.sortOrder)) + 1 : 1;
      const { data, error: err } = await supabase
        .from("tasks")
        .insert({ name: naam, description: desc, icon: emoji, sort_order: sortOrder })
        .select()
        .single();
      setSaving(false);
      if (err || !data) { setError("Toevoegen mislukt. Probeer het opnieuw."); return; }
      onChange([...tasks, mapTaskRow(data as TaskRow)]);
    }
    cancelForm();
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    setDeleteError(null);
    const { error: err } = await supabase.from("tasks").delete().eq("id", id);
    if (err) { setDeleteError("Verwijderen mislukt. Probeer het opnieuw."); return; }
    onChange(tasks.filter(t => t.id !== id));
    setConfirmDeleteId(null);
  };

  const reorder = (index: number, richting: -1 | 1) => {
    const j = index + richting;
    if (j < 0 || j >= tasks.length) return;
    const a = tasks[index], b = tasks[j];
    const updated = tasks
      .map(t => t.id === a.id ? { ...t, sortOrder: b.sortOrder } : t.id === b.id ? { ...t, sortOrder: a.sortOrder } : t)
      .sort((x, y) => x.sortOrder - y.sortOrder);
    onChange(updated);
    supabase.from("tasks").update({ sort_order: b.sortOrder }).eq("id", a.id).then();
    supabase.from("tasks").update({ sort_order: a.sortOrder }).eq("id", b.id).then();
  };

  const form_ = (
    <div className="flex flex-col gap-2 rounded-xl border border-accent bg-background p-3">
      <div className="flex gap-2">
        <input
          value={form.emoji}
          onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))}
          placeholder={DEFAULT_EMOJI}
          maxLength={4}
          className="w-14 shrink-0 rounded-lg border border-border bg-card px-2 py-1.5 text-center text-lg outline-none focus:border-accent"
        />
        <input
          value={form.naam}
          onChange={e => setForm(f => ({ ...f, naam: e.target.value }))}
          placeholder="Naam van de taak…"
          autoFocus
          className="min-w-0 flex-1 rounded-lg border border-border bg-card px-3 py-1.5 text-sm outline-none focus:border-accent"
        />
      </div>
      <input
        value={form.desc}
        onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
        placeholder="Omschrijving (optioneel)…"
        onKeyDown={e => e.key === "Enter" && submitForm()}
        className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm outline-none focus:border-accent"
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex justify-end gap-2 pt-0.5">
        <button onClick={cancelForm} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-smooth hover:border-accent">
          Annuleren
        </button>
        <button
          onClick={submitForm}
          disabled={saving}
          className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-smooth hover:opacity-90 disabled:opacity-50"
        >
          <Check className="h-3.5 w-3.5" /> {saving ? "Opslaan…" : "Opslaan"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-40 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20" />
      <div
        onClick={e => e.stopPropagation()}
        className="relative flex h-full w-full flex-col overflow-hidden border-l border-border bg-card shadow-tile lg:w-[26rem]"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Taken beheren</p>
          <button onClick={onClose} className="rounded-xl border border-border p-2 transition-smooth hover:border-accent">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {tasks.length === 0 && !addingNew && (
            <p className="py-8 text-center text-sm text-muted-foreground">Nog geen taken.</p>
          )}
          <ul className="flex flex-col gap-1.5">
            {tasks.map((taak, i) => (
              <li key={taak.id}>
                {editingId === taak.id ? form_ : confirmDeleteId === taak.id ? (
                  <div className="flex flex-col gap-2 rounded-xl border border-destructive/50 bg-destructive/5 p-3">
                    <p className="text-sm font-semibold">Taak verwijderen?</p>
                    <p className="text-xs text-muted-foreground leading-snug">
                      "{taak.naam}" wordt verwijderd. Eventuele huidige toewijzingen aan deze taak verdwijnen ook.
                    </p>
                    {deleteError && <p className="text-xs text-destructive">{deleteError}</p>}
                    <div className="flex justify-end gap-2 pt-0.5">
                      <button onClick={() => { setConfirmDeleteId(null); setDeleteError(null); }} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-smooth hover:border-accent">
                        Annuleren
                      </button>
                      <button onClick={confirmDelete} className="flex items-center gap-1 rounded-lg bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground transition-smooth hover:opacity-90">
                        <Trash2 className="h-3.5 w-3.5" /> Verwijderen
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-secondary">
                    <div className="flex shrink-0 flex-col">
                      <button onClick={() => reorder(i, -1)} disabled={i === 0} className="text-muted-foreground hover:text-accent disabled:opacity-25">
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => reorder(i, 1)} disabled={i === tasks.length - 1} className="text-muted-foreground hover:text-accent disabled:opacity-25">
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="shrink-0 text-lg leading-none">{taak.emoji}</span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{taak.naam}</span>
                    <button onClick={() => startEdit(taak)} className="shrink-0 p-1 text-muted-foreground hover:text-accent">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => startDelete(taak.id)} className="shrink-0 p-1 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </li>
            ))}
            {addingNew && <li>{form_}</li>}
          </ul>
        </div>

        {!addingNew && (
          <div className="shrink-0 border-t border-border p-3">
            <button
              onClick={startAdd}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background/60 py-2.5 text-sm font-semibold transition-smooth hover:border-accent hover:bg-accent/5"
            >
              <Plus className="h-4 w-4 text-accent" /> Taak toevoegen
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
