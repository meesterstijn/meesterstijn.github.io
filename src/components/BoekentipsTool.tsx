import { useState, useEffect } from "react";
import { X, Plus, Trash2, BookOpen, Pencil, Check } from "lucide-react";

const SUPABASE_URL = "https://fxcsqxshjnxlknnmfsbv.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4Y3NxeHNoam54bGtubm1mc2J2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMzQwNTgsImV4cCI6MjA5MzcxMDA1OH0.MVp882LWEZVMW33l1Ld94BnFbvCrIzStq02-9ylpYnc";
const H = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" };

type Boek = { id: number; titel: string; auteur: string; naam: string; tip: string };

const fetchBoeken = async (): Promise<Boek[]> => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/boekentips?order=id.desc`, { headers: H });
  return res.json();
};

const addBoek = async (b: Omit<Boek, "id">) => {
  await fetch(`${SUPABASE_URL}/rest/v1/boekentips`, { method: "POST", headers: H, body: JSON.stringify(b) });
};

const deleteBoek = async (id: number) => {
  await fetch(`${SUPABASE_URL}/rest/v1/boekentips?id=eq.${id}`, { method: "DELETE", headers: H });
};

const updateBoek = async (id: number, data: Omit<Boek, "id">) => {
  await fetch(`${SUPABASE_URL}/rest/v1/boekentips?id=eq.${id}`, { method: "PATCH", headers: H, body: JSON.stringify(data) });
};

const KLEUREN = [
  "bg-accent/10 border-accent/30",
  "bg-sage/10 border-sage/30",
  "bg-highlight/10 border-highlight/30",
  "bg-primary/10 border-primary/30",
];

const BoekentipsTool = ({ onClose }: { onClose: () => void }) => {
  const [boeken, setBoeken] = useState<Boek[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [titel, setTitel] = useState("");
  const [auteur, setAuteur] = useState("");
  const [naam, setNaam] = useState("");
  const [tip, setTip] = useState("");
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Omit<Boek, "id">>({ titel: "", auteur: "", naam: "", tip: "" });

  const load = async () => {
    const data = await fetchBoeken();
    setBoeken(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!titel.trim() || !naam.trim()) return;
    setSaving(true);
    await addBoek({ titel: titel.trim(), auteur: auteur.trim(), naam: naam.trim(), tip: tip.trim() });
    setTitel(""); setAuteur(""); setNaam(""); setTip("");
    setShowForm(false);
    await load();
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    await deleteBoek(id);
    setBoeken(prev => prev.filter(b => b.id !== id));
  };

  const startEdit = (b: Boek) => {
    setEditId(b.id);
    setEditData({ titel: b.titel, auteur: b.auteur, naam: b.naam, tip: b.tip });
  };

  const handleSaveEdit = async () => {
    if (!editId || !editData.titel.trim() || !editData.naam.trim()) return;
    await updateBoek(editId, editData);
    setBoeken(prev => prev.map(b => b.id === editId ? { ...b, ...editData } : b));
    setEditId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden" style={{ background: "hsl(334 10% 97%)" }}>
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-card/95 px-6 py-3 backdrop-blur-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Lezen</p>
          <h2 className="font-display text-xl font-semibold">Boekentips van leerlingen</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-smooth hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Tip toevoegen
          </button>
          <button onClick={onClose} className="rounded-xl border border-border p-2 transition-smooth hover:border-accent">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Formulier */}
      {showForm && (
        <div className="shrink-0 border-b border-border bg-card px-6 py-5">
          <div className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Boektitel *</label>
              <input value={titel} onChange={e => setTitel(e.target.value)} placeholder="Naam van het boek…" className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Auteur</label>
              <input value={auteur} onChange={e => setAuteur(e.target.value)} placeholder="Schrijver…" className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Jouw naam *</label>
              <input value={naam} onChange={e => setNaam(e.target.value)} placeholder="Naam van de leerling…" className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-muted-foreground">Waarom aanraden?</label>
              <input value={tip} onChange={e => setTip(e.target.value)} placeholder="Kort tipje…" className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-accent" />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="rounded-xl border border-border px-5 py-2 text-sm font-medium transition-smooth hover:border-accent">Annuleren</button>
              <button
                onClick={handleAdd}
                disabled={saving || !titel.trim() || !naam.trim()}
                className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground transition-smooth hover:opacity-90 disabled:opacity-40"
              >
                <BookOpen className="h-4 w-4" /> {saving ? "Opslaan…" : "Opslaan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Boeken grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading && <p className="text-sm text-muted-foreground">Laden…</p>}
        {!loading && boeken.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/40" />
            <p className="text-muted-foreground">Nog geen boekentips. Voeg de eerste toe!</p>
          </div>
        )}
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {boeken.map((b, i) => (
            <li
              key={b.id}
              className={`group relative flex flex-col gap-2 rounded-2xl border p-5 shadow-soft ${KLEUREN[i % KLEUREN.length]}`}
            >
              {editId === b.id ? (
                /* Edit modus */
                <div className="flex flex-col gap-2">
                  <input value={editData.titel} onChange={e => setEditData(d => ({ ...d, titel: e.target.value }))} placeholder="Titel" className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent" />
                  <input value={editData.auteur} onChange={e => setEditData(d => ({ ...d, auteur: e.target.value }))} placeholder="Auteur" className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent" />
                  <input value={editData.naam} onChange={e => setEditData(d => ({ ...d, naam: e.target.value }))} placeholder="Naam leerling" className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent" />
                  <input value={editData.tip} onChange={e => setEditData(d => ({ ...d, tip: e.target.value }))} placeholder="Tip" className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent" />
                  <div className="flex gap-2 pt-1">
                    <button onClick={handleSaveEdit} className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90">
                      <Check className="h-3.5 w-3.5" /> Opslaan
                    </button>
                    <button onClick={() => setEditId(null)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:border-accent">
                      Annuleren
                    </button>
                  </div>
                </div>
              ) : (
                /* Weergave modus */
                <>
                  <div className="absolute right-3 top-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-smooth">
                    <button onClick={() => startEdit(b)} className="text-muted-foreground hover:text-primary">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(b.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <BookOpen className="h-5 w-5 text-muted-foreground/60" />
                  <p className="font-display text-lg font-semibold leading-tight pr-12">{b.titel}</p>
                  {b.auteur && <p className="text-xs text-muted-foreground italic">{b.auteur}</p>}
                  {b.tip && <p className="text-sm text-muted-foreground leading-snug">"{b.tip}"</p>}
                  <p className="mt-auto pt-2 text-xs font-semibold text-accent">— {b.naam}</p>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BoekentipsTool;
