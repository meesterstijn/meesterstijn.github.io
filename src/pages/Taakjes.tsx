import { useState, useEffect } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { Trash2, Shuffle, RotateCw, Settings } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useClasses, type Student } from "@/context/ClassContext";
import { TaskManagerPanel, fetchTasks, type Taak } from "@/components/TaskManagerPanel";

// taskId -> student_id[]
type Assignments = Record<string, string[]>;

const fetchAssignments = async (classId: string): Promise<Assignments> => {
  const { data } = await supabase.from("task_assignments").select("task_id,student_id").eq("class_id", classId);
  const assignments: Assignments = {};
  for (const row of data ?? []) {
    assignments[row.task_id] = [...(assignments[row.task_id] ?? []), row.student_id];
  }
  return assignments;
};

// Eén leerling naar een taak (ver)plaatsen — dankzij de unique constraint op
// student_id werkt upsert zowel voor een nieuwe toewijzing als een verplaatsing.
const assignStudent = async (classId: string, studentId: string, taskId: string) => {
  await supabase.from("task_assignments").upsert(
    { class_id: classId, student_id: studentId, task_id: taskId },
    { onConflict: "student_id" }
  );
};

const clearAssignments = async (classId: string) => {
  await supabase.from("task_assignments").delete().eq("class_id", classId);
};

const bulkAssign = async (classId: string, rows: { student_id: string; task_id: string }[]) => {
  await clearAssignments(classId);
  if (rows.length > 0) await supabase.from("task_assignments").insert(rows.map(r => ({ ...r, class_id: classId })));
};

const CHIP_COLORS = [
  "bg-accent/20 text-accent border-accent/40",
  "bg-sage/20 text-sage border-sage/40",
  "bg-primary/20 text-primary border-primary/40",
  "bg-highlight/20 text-foreground border-highlight/50",
  "bg-[#c084fc]/20 text-[#7c3aed] border-[#c084fc]/40",
  "bg-[#f472b6]/20 text-[#be185d] border-[#f472b6]/40",
];

const shuffleArr = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

type Selected = { taakId: string; studentId: string };
type DragSrc  = { taakId: string; studentId: string };

const Taakjes = () => {
  const { activeClass, activeClassId, activeStudents, loading: klasLoading } = useClasses();

  const [tasks, setTasks]             = useState<Taak[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [beheerOpen, setBeheerOpen]   = useState(false);
  const [assignments, setAssignments] = useState<Assignments>({});
  const [loading, setLoading]         = useState(true);
  const [dragSrc, setDragSrc]         = useState<DragSrc | null>(null);
  const [dragOver, setDragOver]       = useState<string | null>(null);
  const [selected, setSelected]       = useState<Selected | null>(null);

  // Taken zijn algemeen (niet per klas) — één keer laden, los van de actieve klas.
  useEffect(() => {
    fetchTasks().then(t => { setTasks(t); setTasksLoading(false); });
  }, []);

  // Taakverdeling laden zodra de actieve klas bekend is — en opnieuw bij elke klaswissel.
  // Tijdelijke UI-state (selectie/drag) hoort niet bij de vorige klas, dus die resetten we mee.
  useEffect(() => {
    setSelected(null);
    setDragSrc(null);
    setDragOver(null);
    if (!activeClassId) { setAssignments({}); setLoading(false); return; }
    setLoading(true);
    fetchAssignments(activeClassId).then(a => { setAssignments(a); setLoading(false); });
  }, [activeClassId]);

  const studentById = (id: string): Student | undefined => activeStudents.find(s => s.id === id);

  const move = (studentId: string, fromId: string, toId: string) => {
    if (fromId === toId || !activeClassId) return;
    setAssignments(prev => {
      const next = { ...prev };
      next[fromId] = (next[fromId] ?? []).filter(id => id !== studentId);
      if (next[fromId].length === 0) delete next[fromId];
      next[toId] = [...(next[toId] ?? []), studentId];
      return next;
    });
    assignStudent(activeClassId, studentId, toId);
  };

  const autoVerdelen = () => {
    if (!activeClassId || activeStudents.length === 0 || tasks.length === 0) return;
    const shuffled = shuffleArr(activeStudents);
    const next: Assignments = {};
    const rows: { student_id: string; task_id: string }[] = [];
    shuffled.forEach((student, i) => {
      const taakId = tasks[i % tasks.length].id;
      next[taakId] = [...(next[taakId] ?? []), student.id];
      rows.push({ student_id: student.id, task_id: taakId });
    });
    setAssignments(next);
    setSelected(null);
    bulkAssign(activeClassId, rows);
  };

  const verschuif = () => {
    if (!activeClassId || tasks.length === 0) return;
    const next: Assignments = {};
    const rows: { student_id: string; task_id: string }[] = [];
    tasks.forEach((taak, i) => {
      const ids = assignments[taak.id];
      if (ids?.length) {
        const volgendId = tasks[(i + 1) % tasks.length].id;
        next[volgendId] = [...(next[volgendId] ?? []), ...ids];
        ids.forEach(studentId => rows.push({ student_id: studentId, task_id: volgendId }));
      }
    });
    setAssignments(next);
    setSelected(null);
    bulkAssign(activeClassId, rows);
  };

  const wisTaakverdeling = () => {
    if (!activeClassId) return;
    setAssignments({});
    setSelected(null);
    clearAssignments(activeClassId);
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, taakId: string, studentId: string) => {
    setDragSrc({ taakId, studentId });
    setSelected(null);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (dragSrc && dragSrc.taakId !== targetId) move(dragSrc.studentId, dragSrc.taakId, targetId);
    setDragSrc(null);
    setDragOver(null);
  };

  // Tap handlers (touch / smartboard)
  const handleChipTap = (e: React.MouseEvent, taakId: string, studentId: string) => {
    e.stopPropagation();
    if (selected?.taakId === taakId && selected?.studentId === studentId) { setSelected(null); return; }
    if (selected) { move(selected.studentId, selected.taakId, taakId); setSelected(null); return; }
    setSelected({ taakId, studentId });
  };

  const handleCardTap = (taakId: string) => {
    if (selected && selected.taakId !== taakId) {
      move(selected.studentId, selected.taakId, taakId);
      setSelected(null);
    }
  };

  const chipColor = (studentId: string) =>
    CHIP_COLORS[Math.max(0, activeStudents.findIndex(s => s.id === studentId)) % CHIP_COLORS.length];

  const bezig = klasLoading || loading || tasksLoading;
  const heeftToewijzingen = Object.keys(assignments).length > 0;

  return (
    <div className="min-h-screen bg-paper bg-warm" onClick={() => setSelected(null)}>
      <SiteHeader />
      <main className="container py-10 md:py-14" onClick={e => e.stopPropagation()}>
        {bezig ? <p className="text-muted-foreground">Laden…</p> : <>

        {/* Header */}
        <div className="mb-8 animate-fade-up flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              {activeClass ? activeClass.name : "De klas"}
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold md:text-5xl">Taakjes</h1>
            <p className="mt-3 text-muted-foreground">
              Sleep een naam naar een andere taak, of tik hem aan en tik de doelkaart.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2 sm:flex-nowrap sm:gap-3">
            {activeClass && (
              <>
                <button
                  onClick={verschuif}
                  disabled={!heeftToewijzingen}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium transition-smooth hover:border-accent disabled:opacity-40 sm:flex-none"
                >
                  <RotateCw className="h-4 w-4" /> Doorschuiven
                </button>
                <button
                  onClick={autoVerdelen}
                  disabled={activeStudents.length === 0 || tasks.length === 0}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium transition-smooth hover:border-accent disabled:opacity-40 sm:flex-none"
                >
                  <Shuffle className="h-4 w-4" /> Willekeurig verdelen
                </button>
                <button
                  onClick={wisTaakverdeling}
                  disabled={!heeftToewijzingen}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-muted-foreground transition-smooth hover:border-destructive hover:text-destructive disabled:opacity-40 sm:flex-none"
                >
                  <Trash2 className="h-4 w-4" /> Taakverdeling wissen
                </button>
              </>
            )}
            <button
              onClick={() => setBeheerOpen(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium transition-smooth hover:border-accent sm:flex-none"
            >
              <Settings className="h-4 w-4" /> Taken beheren
            </button>
          </div>
        </div>

        {!activeClass ? (
          <div className="animate-fade-up rounded-3xl border border-border bg-card p-8 text-center shadow-soft">
            <p className="text-muted-foreground">
              Je hebt nog geen klas. Maak eerst een klas aan via de klas-kiezer in de header of bij Beurtstokjes.
            </p>
          </div>
        ) : activeStudents.length === 0 ? (
          <div className="animate-fade-up rounded-3xl border border-border bg-card p-8 text-center shadow-soft">
            <p className="text-muted-foreground">
              Nog geen leerlingen in {activeClass.name}. Voeg ze toe via Beurtstokjes / klasbeheer.
            </p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="animate-fade-up rounded-3xl border border-border bg-card p-8 text-center shadow-soft">
            <p className="text-muted-foreground">
              Nog geen taken. Voeg de eerste toe via "Taken beheren" rechtsboven.
            </p>
          </div>
        ) : (
          <>
            {selected && (
              <div className="mb-4 animate-fade-up rounded-2xl border border-accent bg-accent/10 px-4 py-3 text-sm font-medium text-accent">
                Tik op een taakkaart om <strong>{studentById(selected.studentId)?.name}</strong> daarnaar te verplaatsen. Tik opnieuw op de naam om te deselecteren.
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 animate-fade-up">
              {tasks.map(taak => {
                const ids     = assignments[taak.id] ?? [];
                const isOver  = dragOver === taak.id;
                const isTarget = selected !== null && selected.taakId !== taak.id;

                return (
                  <div
                    key={taak.id}
                    onClick={() => handleCardTap(taak.id)}
                    onDragOver={e => { e.preventDefault(); setDragOver(taak.id); }}
                    onDragLeave={() => setDragOver(null)}
                    onDrop={e => handleDrop(e, taak.id)}
                    className={`flex flex-col rounded-3xl border-2 p-5 shadow-soft transition-smooth ${
                      isOver || (isTarget && ids.length > 0)
                        ? "border-accent bg-accent/5 scale-[1.02] cursor-pointer"
                        : isTarget
                        ? "border-dashed border-accent/60 bg-accent/5 cursor-pointer"
                        : "border-border bg-card"
                    }`}
                  >
                    <span className="text-3xl mb-3">{taak.emoji}</span>
                    <p className="font-display font-semibold leading-tight">{taak.naam}</p>
                    <p className="mt-1 text-xs text-muted-foreground leading-snug">{taak.desc}</p>

                    <div className="mt-4 flex flex-col gap-1.5">
                      {ids.map(studentId => {
                        const student = studentById(studentId);
                        if (!student) return null;
                        const isChipSelected = selected?.taakId === taak.id && selected?.studentId === studentId;
                        return (
                          <div
                            key={studentId}
                            draggable
                            onDragStart={e => handleDragStart(e, taak.id, studentId)}
                            onDragEnd={() => { setDragSrc(null); setDragOver(null); }}
                            onClick={e => handleChipTap(e, taak.id, studentId)}
                            className={`cursor-grab active:cursor-grabbing rounded-xl border px-3 py-1.5 text-sm font-semibold text-center select-none transition-smooth ${chipColor(studentId)} ${
                              isChipSelected ? "ring-2 ring-accent ring-offset-1 scale-105 shadow-md" : "hover:scale-105"
                            }`}
                          >
                            {student.name}
                          </div>
                        );
                      })}
                      {ids.length === 0 && (
                        <div className={`rounded-xl border-2 border-dashed px-3 py-1.5 text-center text-xs transition-smooth ${
                          isTarget ? "border-accent/60 text-accent" : "border-border text-muted-foreground"
                        }`}>
                          {isTarget ? "Zet hier neer" : "Nog niemand"}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <footer className="mt-20 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          Meester Stijn
        </footer>
        </>}
      </main>

      {beheerOpen && (
        <TaskManagerPanel tasks={tasks} onChange={setTasks} onClose={() => setBeheerOpen(false)} />
      )}
    </div>
  );
};

export default Taakjes;
