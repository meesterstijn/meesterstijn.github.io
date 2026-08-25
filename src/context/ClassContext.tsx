import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";

export type SchoolClass = { id: string; name: string; createdAt: string };
export type Student = { id: string; classId: string; name: string; createdAt: string };

const ACTIVE_CLASS_KEY = "ms-active-class-id";
const MIGRATION_KEY = "ms-class-migration-done";

type ClassRow = { id: string; name: string; created_at: string };
type StudentRow = { id: string; class_id: string; name: string; created_at: string };

const mapClass = (row: ClassRow): SchoolClass => ({ id: row.id, name: row.name, createdAt: row.created_at });
const mapStudent = (row: StudentRow): Student => ({ id: row.id, classId: row.class_id, name: row.name, createdAt: row.created_at });

const sortByNaam = (a: Student, b: Student) => a.name.localeCompare(b.name, "nl");

type ClassCtx = {
  classes: SchoolClass[];
  students: Student[];
  activeClassId: string | null;
  activeClass: SchoolClass | null;
  activeStudents: Student[];
  loading: boolean;
  setActiveClassId: (id: string) => void;
  addClass: (name: string) => Promise<SchoolClass | null>;
  renameClass: (id: string, name: string) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;
  studentCount: (classId: string) => number;
  addStudent: (classId: string, name: string) => Promise<void>;
  removeStudent: (studentId: string) => Promise<void>;
  clearStudents: (classId: string) => Promise<void>;
};

const ClassContext = createContext<ClassCtx | null>(null);

// Migreert de bestaande, ongekoppelde data (tabel "taakjes" rij id 1: leerlingen +
// taakverdeling, en tabel "plaatsen" rij id 1: lokaalindeling) naar een eerste klas
// zodra er nog geen enkele klas bestaat. Draait maar één keer.
const migrateIfNeeded = async (): Promise<ClassRow[]> => {
  if (localStorage.getItem(MIGRATION_KEY)) return [];
  localStorage.setItem(MIGRATION_KEY, "1");
  try {
    const { data: taakjesRow } = await supabase.from("taakjes").select("leerlingen,assignments").eq("id", 1).single();
    const namen: string[] = taakjesRow?.leerlingen ?? [];
    if (namen.length === 0) return [];

    const { data: nieuweKlas, error: classError } = await supabase
      .from("classes")
      .insert({ name: "Groep 6" })
      .select()
      .single();
    if (classError || !nieuweKlas) return [];

    const { data: nieuweStudenten } = await supabase
      .from("students")
      .insert(namen.map(naam => ({ class_id: nieuweKlas.id, name: naam })))
      .select();

    // Bestaande taakverdeling meenemen: was gekoppeld op naam, wordt gekoppeld op student_id.
    const oudeAssignments: Record<string, string[]> = taakjesRow?.assignments ?? {};
    const idPerNaam = new Map((nieuweStudenten ?? []).map((s: StudentRow) => [s.name, s.id]));
    const assignmentRows = Object.entries(oudeAssignments).flatMap(([taskId, namenInTaak]) =>
      (Array.isArray(namenInTaak) ? namenInTaak : [])
        .map(naam => idPerNaam.get(naam))
        .filter((id): id is string => !!id)
        .map(studentId => ({ class_id: nieuweKlas.id, task_id: taskId, student_id: studentId }))
    );
    if (assignmentRows.length > 0) await supabase.from("task_assignments").insert(assignmentRows);

    // Bestaande plaatsindeling meenemen (was één gedeelde rij, id 1).
    const { data: plaatsenRow } = await supabase.from("plaatsen").select("lokaal,tafels").eq("id", 1).single();
    if (plaatsenRow) {
      await supabase.from("plaatsen").insert({ class_id: nieuweKlas.id, lokaal: plaatsenRow.lokaal, tafels: plaatsenRow.tafels });
    }

    return [nieuweKlas as ClassRow];
  } catch {
    return [];
  }
};

export const ClassProvider = ({ children }: { children: ReactNode }) => {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [activeClassId, setActiveClassIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      let { data: classRows } = await supabase.from("classes").select("*").order("created_at", { ascending: true });
      classRows = classRows ?? [];

      if (classRows.length === 0) {
        const migrated = await migrateIfNeeded();
        if (migrated.length > 0) classRows = migrated;
      }

      const { data: studentRows } = await supabase.from("students").select("*");

      setClasses(classRows.map(mapClass));
      setStudents((studentRows ?? []).map(mapStudent));

      const stored = localStorage.getItem(ACTIVE_CLASS_KEY);
      const geldig = classRows.find(c => c.id === stored);
      const initieel = geldig ? geldig.id : classRows[0]?.id ?? null;
      setActiveClassIdState(initieel);
      if (initieel) localStorage.setItem(ACTIVE_CLASS_KEY, initieel);
      else localStorage.removeItem(ACTIVE_CLASS_KEY);

      setLoading(false);
    })();
  }, []);

  const setActiveClassId = (id: string) => {
    setActiveClassIdState(id);
    localStorage.setItem(ACTIVE_CLASS_KEY, id);
  };

  const addClass = async (name: string): Promise<SchoolClass | null> => {
    const naam = name.trim();
    if (!naam) return null;
    const { data, error } = await supabase.from("classes").insert({ name: naam }).select().single();
    if (error || !data) { console.error("Klas toevoegen mislukt:", error); return null; }
    const nieuwe = mapClass(data as ClassRow);
    setClasses(prev => [...prev, nieuwe]);
    if (!activeClassId) setActiveClassId(nieuwe.id);
    return nieuwe;
  };

  const renameClass = async (id: string, name: string) => {
    const naam = name.trim();
    if (!naam) return;
    const { error } = await supabase.from("classes").update({ name: naam }).eq("id", id);
    if (error) { console.error("Klas hernoemen mislukt:", error); return; }
    setClasses(prev => prev.map(c => c.id === id ? { ...c, name: naam } : c));
  };

  const deleteClass = async (id: string) => {
    const { error } = await supabase.from("classes").delete().eq("id", id);
    if (error) { console.error("Klas verwijderen mislukt:", error); return; }
    setClasses(prev => prev.filter(c => c.id !== id));
    setStudents(prev => prev.filter(s => s.classId !== id));
    if (activeClassId === id) {
      const rest = classes.filter(c => c.id !== id);
      if (rest.length > 0) setActiveClassId(rest[0].id);
      else { setActiveClassIdState(null); localStorage.removeItem(ACTIVE_CLASS_KEY); }
    }
  };

  const studentCount = (classId: string) => students.filter(s => s.classId === classId).length;

  const addStudent = async (classId: string, name: string) => {
    const naam = name.trim();
    if (!naam) return;
    if (students.some(s => s.classId === classId && s.name === naam)) return;
    const { data, error } = await supabase.from("students").insert({ class_id: classId, name: naam }).select().single();
    if (error || !data) { console.error("Leerling toevoegen mislukt:", error); return; }
    setStudents(prev => [...prev, mapStudent(data as StudentRow)]);
  };

  const removeStudent = async (studentId: string) => {
    const { error } = await supabase.from("students").delete().eq("id", studentId);
    if (error) { console.error("Leerling verwijderen mislukt:", error); return; }
    setStudents(prev => prev.filter(s => s.id !== studentId));
  };

  const clearStudents = async (classId: string) => {
    const { error } = await supabase.from("students").delete().eq("class_id", classId);
    if (error) { console.error("Leerlingen verwijderen mislukt:", error); return; }
    setStudents(prev => prev.filter(s => s.classId !== classId));
  };

  const activeClass = useMemo(() => classes.find(c => c.id === activeClassId) ?? null, [classes, activeClassId]);
  const activeStudents = useMemo(
    () => students.filter(s => s.classId === activeClassId).sort(sortByNaam),
    [students, activeClassId]
  );

  return (
    <ClassContext.Provider value={{
      classes, students, activeClassId, activeClass, activeStudents, loading,
      setActiveClassId, addClass, renameClass, deleteClass, studentCount,
      addStudent, removeStudent, clearStudents,
    }}>
      {children}
    </ClassContext.Provider>
  );
};

export const useClasses = () => {
  const ctx = useContext(ClassContext);
  if (!ctx) throw new Error("useClasses must be used within ClassProvider");
  return ctx;
};
