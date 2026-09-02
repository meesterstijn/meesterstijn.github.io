import { useState } from "react";
import { createPortal } from "react-dom";
import { Clock3, History, RotateCcw, Trash2, X } from "lucide-react";
import type { HistorySnapshot } from "@/hooks/useHistorySnapshots";

type Props<T> = {
  title: string;
  snapshots: HistorySnapshot<T>[];
  onRestore: (snapshot: HistorySnapshot<T>) => Promise<void> | void;
  onRemove: (id: string) => void;
  onClear: () => void;
};

export const HistoryPanel = <T,>({ title, snapshots, onRestore, onRemove, onClear }: Props<T>) => {
  const [open, setOpen] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const clearTextSelection = () => window.getSelection()?.removeAllRanges();

  const openPanel = () => {
    clearTextSelection();
    setOpen(true);
    requestAnimationFrame(clearTextSelection);
  };

  const restore = async (snapshot: HistorySnapshot<T>) => {
    setRestoring(snapshot.id);
    await onRestore(snapshot);
    setRestoring(null);
    setConfirmId(null);
    setOpen(false);
  };

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
    const day = sameDay(date, today)
      ? "Vandaag"
      : sameDay(date, yesterday)
        ? "Gisteren"
        : date.toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" });
    return `${day} · ${date.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}`;
  };

  return (
    <>
      <button onPointerDown={clearTextSelection} onClick={openPanel} className="flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium shadow-soft transition-smooth hover:border-accent hover:text-accent">
        <History className="h-4 w-4" /> Geschiedenis
        {snapshots.length > 0 && <span className="grid min-w-5 place-items-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold leading-none text-primary-foreground">{snapshots.length}</span>}
      </button>
      {open && createPortal(
        <div className="fixed inset-0 z-[70] flex justify-end bg-foreground/30 backdrop-blur-[2px]" onClick={() => setOpen(false)}>
          <aside className="m-0 flex h-full w-full max-w-[440px] flex-col border-l border-border bg-card shadow-2xl sm:my-3 sm:mr-3 sm:h-[calc(100%-1.5rem)] sm:rounded-3xl sm:border" onClick={event => event.stopPropagation()}>
            <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground"><History className="h-5 w-5" /></span>
                <div className="min-w-0">
                  <h2 className="truncate font-display text-xl font-semibold">{title}</h2>
                  <p className="text-xs text-muted-foreground">{snapshots.length === 0 ? "Nog geen versies bewaard" : `${snapshots.length} bewaarde versie${snapshots.length === 1 ? "" : "s"}`}</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Geschiedenis sluiten"><X className="h-4 w-4" /></button>
            </header>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {snapshots.length === 0 ? (
                <div className="flex h-full min-h-64 flex-col items-center justify-center text-center">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-muted text-muted-foreground"><Clock3 className="h-6 w-6" /></span>
                  <p className="mt-4 font-display text-lg font-semibold">Alles is nog actueel</p>
                  <p className="mt-1 max-w-64 text-sm leading-relaxed text-muted-foreground">Na je eerste wijziging bewaren we hier automatisch de vorige versie.</p>
                </div>
              ) : (
                <ul>
                  {snapshots.map((snapshot, index) => (
                    <li key={snapshot.id} className="group relative grid grid-cols-[28px_1fr] gap-3 pb-5 last:pb-0">
                      {index < snapshots.length - 1 && <span className="absolute left-[13px] top-7 h-[calc(100%-12px)] w-px bg-border" />}
                      <span className={`relative z-10 mt-1 h-7 w-7 rounded-full border-4 border-card ${index === 0 ? "bg-accent" : "bg-border"}`} />
                      <div className={`min-w-0 rounded-2xl p-4 transition-colors ${confirmId === snapshot.id ? "bg-accent/10 ring-1 ring-accent/30" : "bg-muted/45 group-hover:bg-muted/70"}`}>
                        <p className="pr-6 text-sm font-semibold leading-snug">{snapshot.label}</p>
                        <p className="mt-1 text-xs capitalize text-muted-foreground">{formatDate(snapshot.createdAt)}</p>
                      {confirmId === snapshot.id ? (
                        <div className="mt-4 border-t border-accent/20 pt-3">
                          <p className="mb-3 text-xs leading-relaxed text-muted-foreground">Deze versie terugzetten? De huidige versie wordt eerst veilig bewaard.</p>
                          <div className="flex items-center gap-2">
                            <button disabled={restoring === snapshot.id} onClick={() => restore(snapshot)} className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50">{restoring === snapshot.id ? "Herstellen…" : "Versie herstellen"}</button>
                            <button onClick={() => setConfirmId(null)} className="rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground">Annuleren</button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 flex items-center">
                          <button onClick={() => setConfirmId(snapshot.id)} className="flex items-center gap-1.5 rounded-lg bg-card px-3 py-2 text-xs font-semibold shadow-sm transition-colors hover:text-accent"><RotateCcw className="h-3.5 w-3.5" /> Herstellen</button>
                          <button onClick={() => onRemove(snapshot.id)} className="ml-auto rounded-lg p-2 text-muted-foreground opacity-60 transition-colors hover:bg-card hover:text-destructive group-hover:opacity-100" aria-label="Momentopname verwijderen"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {snapshots.length > 0 && (
              <footer className="flex items-center justify-between border-t border-border px-6 py-4">
                <p className="text-xs text-muted-foreground">Maximaal 20 versies</p>
                <button onClick={onClear} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /> Alles wissen</button>
              </footer>
            )}
          </aside>
        </div>,
        document.body,
      )}
    </>
  );
};
