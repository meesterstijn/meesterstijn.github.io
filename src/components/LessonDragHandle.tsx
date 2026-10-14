import { useEffect, useRef } from "react";
import { GripVertical } from "lucide-react";

export function LessonDragHandle({ day, id, title, onMove, onStep, disabled }: {
  day: number; id: string; title: string; onMove: (target: string) => void;
  onStep: (direction: number) => void; disabled?: boolean;
}) {
  const dragging = useRef(false);
  const target = useRef<HTMLElement | null>(null);
  const clear = () => {
    dragging.current = false;
    target.current?.removeAttribute("data-drop-target");
    target.current = null;
  };
  useEffect(() => {
    const escape = (e: KeyboardEvent) => { if (e.key === "Escape") clear(); };
    window.addEventListener("keydown", escape);
    window.addEventListener("blur", clear);
    return () => { clear(); window.removeEventListener("keydown", escape); window.removeEventListener("blur", clear); };
  }, []);
  return <button type="button" disabled={disabled} aria-label={`${title} verplaatsen`} title="Sleep naar een andere plek; of gebruik pijl omhoog/omlaag"
    className="mr-1 shrink-0 touch-none rounded-lg p-2 cursor-grab active:cursor-grabbing hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-40"
    onPointerDown={e => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.currentTarget.focus();
      e.currentTarget.setPointerCapture(e.pointerId);
      dragging.current = true;
    }}
    onPointerMove={e => {
      if (!dragging.current) return;
      const row = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>("[data-lesson-id]");
      target.current?.removeAttribute("data-drop-target");
      target.current = row?.dataset.lessonDay === String(day) && row.dataset.lessonId !== id ? row : null;
      target.current?.setAttribute("data-drop-target", "true");
    }}
    onPointerUp={() => {
      const targetId = target.current?.dataset.lessonId;
      const commit = dragging.current;
      clear();
      if (commit && targetId) onMove(targetId);
    }}
    onPointerCancel={clear} onLostPointerCapture={clear}
    onKeyDown={e => {
      if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
      e.preventDefault(); onStep(e.key === "ArrowUp" ? -1 : 1);
    }}><GripVertical className="h-4 w-4" /></button>;
}
