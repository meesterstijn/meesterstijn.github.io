import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type PointerEvent, type CSSProperties } from "react";
import { GripVertical, X, Plus, Lock, Unlock, MoreHorizontal, MoveDiagonal2 } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import "./WidgetBoard.css";
import { BOARD_CLASSES, BOARD_SIZE, boardColumns, boardPositions } from "./widgetBoardLayout";

export type BoardWidget = { id: string; title: string; content: ReactNode; width?: number; height?: number; visible?: boolean; below?: string };
type Placement = { id: string; width: number; height: number; visible: boolean; below?: string };
const STORAGE_KEY = "klastools-layout-v1";
const defaults = (widgets: BoardWidget[]): Placement[] => widgets.map(w => ({ id: w.id, width: w.width ?? 4, height: w.height ?? BOARD_SIZE.defaultHeight, visible: w.visible ?? true, below: w.below }));

function restore(widgets: BoardWidget[]): Placement[] {
  const initial = defaults(widgets);
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (!Array.isArray(saved)) return initial;
    const result: Placement[] = [];
    for (const item of saved) {
      if (!item || !initial.some(w => w.id === item.id) || result.some(w => w.id === item.id)) continue;
      result.push({ id: item.id, width: [3, 4, 6, 8, 12].includes(item.width) ? item.width : 4,
        height: Number.isFinite(item.height) ? Math.max(BOARD_SIZE.minHeight, Math.min(BOARD_SIZE.maxHeight, item.height)) : BOARD_SIZE.defaultHeight,
        visible: typeof item.visible === "boolean" ? item.visible : true,
        below: typeof item.below === "string" && item.below !== item.id && initial.some(w => w.id === item.below) ? item.below : undefined });
    }
    return [...result, ...initial.filter(w => !result.some(s => s.id === w.id))];
  } catch { return initial; }
}


type Gesture = {
  id: string; mode: "move" | "width" | "left" | "height" | "both";
  x: number; y: number; width: number; height: number; unit: number;
  snapshot: Placement[]; targets: { id: string; rect: DOMRect }[];
};
const widths = [3, 4, 6, 8, 12];
const clampHeight = (n: number) => Math.max(BOARD_SIZE.minHeight, Math.min(BOARD_SIZE.maxHeight, n));
function reordered(items: Placement[], id: string, target: string) {
  const next = [...items];
  const from = next.findIndex(w => w.id === id);
  const to = next.findIndex(w => w.id === target);
  if (from < 0 || to < 0 || from === to) return items;
  const moved = next.splice(from, 1)[0];
  next.splice(to, 0, { ...moved, below: undefined });
  return next;
}

/** Register additional tools in widgets; every tool shares these window controls. */
export function WidgetBoard({ widgets }: { widgets: BoardWidget[] }) {
  const [layout, setLayout] = useState(() => restore(widgets));
  const [locked, setLocked] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY + "-locked") === "true"; } catch { return false; }
  });
  const [active, setActive] = useState<string | null>(null);
  const [preview, setPreview] = useState<Placement[] | null>(null);
  const [storageFailed, setStorageFailed] = useState(false);
  const gesture = useRef<Gesture | null>(null);
  const previewRef = useRef<Placement[] | null>(null);
  const board = useRef<HTMLDivElement>(null);
  const [availableHeight, setAvailableHeight] = useState(560);
  useLayoutEffect(() => {
    const field = board.current;
    if (!field) return;
    const measure = () => {
      // Document coordinates keep the workspace stable when the page scrolls.
      const top = field.getBoundingClientRect().top + window.scrollY;
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      const padding = parseFloat(getComputedStyle(field.closest("main") ?? field).paddingBottom) || 24;
      setAvailableHeight(Math.max(280, Math.floor(viewportHeight - top - padding)));
    };
    measure();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    if (field.parentElement) observer?.observe(field.parentElement);
    const header = document.querySelector("header");
    if (header) observer?.observe(header);
    window.addEventListener("resize", measure);
    window.visualViewport?.addEventListener("resize", measure);
    document.addEventListener("fullscreenchange", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
      window.visualViewport?.removeEventListener("resize", measure);
      document.removeEventListener("fullscreenchange", measure);
    };
  }, []);
  const shownLayout = preview ?? layout;
  const positions = boardPositions(shownLayout);
  const stacked = Object.values(positions).some(position => position.row > 1);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
      localStorage.setItem(STORAGE_KEY + "-locked", String(locked));
      setStorageFailed(false);
    } catch { setStorageFailed(true); }
  }, [layout, locked]);
  const update = (id: string, patch: Partial<Placement>) => setLayout(items => {
    const item = items.find(w => w.id === id);
    const rootId = item?.below && items.some(w => w.id === item.below && w.visible) ? item.below : id;
    return items.map(w => ({ ...w, ...(w.id === id ? patch : {}),
      ...(patch.width !== undefined && (w.id === rootId || w.below === rootId) ? { width: patch.width } : {}),
    }));
  });
  const finish = (cancel = false) => {
    if (!gesture.current) return;
    if (!cancel && previewRef.current) setLayout(previewRef.current);
    gesture.current = null;
    previewRef.current = null;
    setPreview(null);
    setActive(null);
  };
  useEffect(() => {
    const cancel = (e: KeyboardEvent) => { if (e.key === "Escape") finish(true); };
    const blur = () => finish(true);
    window.addEventListener("keydown", cancel);
    window.addEventListener("blur", blur);
    return () => { window.removeEventListener("keydown", cancel); window.removeEventListener("blur", blur); };
  }, []);
  const begin = (e: PointerEvent<HTMLButtonElement>, item: Placement, mode: Gesture["mode"]) => {
    if (locked || e.button !== 0 || gesture.current || !board.current) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const gap = parseFloat(getComputedStyle(board.current).columnGap) || 24;
    gesture.current = {
      id: item.id, mode, x: e.clientX, y: e.clientY, width: layout.find(w => w.id === item.below && w.visible)?.width ?? item.width, height: item.height,
      unit: (board.current.clientWidth + gap) / 12, snapshot: layout,
      targets: Array.from(board.current.querySelectorAll<HTMLElement>("[data-widget-id]:not([hidden])")).map(el => ({ id: el.dataset.widgetId!, rect: el.getBoundingClientRect() })),
    };
    setActive(item.id);
  };
  const onMove = (e: PointerEvent<HTMLButtonElement>) => {
    const g = gesture.current;
    if (!g) return;
    let next = g.snapshot;
    if (g.mode === "move") {
      if (Math.hypot(e.clientX - g.x, e.clientY - g.y) < 6) return;
      const target = g.targets.find(({ rect }) => e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom);
      if (!target) return;
      next = reordered(g.snapshot, g.id, target.id);
    } else {
      const requested = g.width + (e.clientX - g.x) * (g.mode === "left" ? -1 : 1) / Math.max(1, g.unit);
      const width = widths.reduce((a, b) => Math.abs(b - requested) < Math.abs(a - requested) ? b : a);
      const item = g.snapshot.find(w => w.id === g.id)!;
      const rootId = item.below && g.snapshot.some(w => w.id === item.below && w.visible) ? item.below : g.id;
      next = g.snapshot.map(w => ({ ...w,
        width: g.mode !== "height" && window.innerWidth >= 640 && (w.id === rootId || w.below === rootId) ? width : w.width,
        height: w.id === g.id && (g.mode === "height" || g.mode === "both") ? clampHeight(g.height + e.clientY - g.y) : w.height,
      }));
    }
    previewRef.current = next;
    setPreview(next);
  };
  const pointerHandlers = {
    onPointerMove: onMove, onPointerUp: () => finish(),
    onPointerCancel: () => finish(true), onLostPointerCapture: () => finish(true),
  };
  const moveBy = (id: string, direction: number) => {
    const visible = layout.filter(w => w.visible);
    const target = visible[visible.findIndex(w => w.id === id) + direction];
    if (target) setLayout(items => reordered(items, id, target.id));
  };
  return <section aria-label="Modulaire klastools">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div><h1 className="font-display text-3xl font-semibold">Mijn klastools</h1><p className="mt-1 text-sm text-muted-foreground">{locked ? "Je indeling staat vast. Alle tools blijven bruikbaar." : "Sleep de titelbalk om te verplaatsen, trek aan een rand voor het formaat."}</p></div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild><button disabled={locked} className="board-toolbar-button bg-primary text-primary-foreground"><Plus size={16} />Blok toevoegen</button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Beschikbare blokken</DropdownMenuLabel>
            {widgets.map(w => <DropdownMenuItem key={w.id} disabled={layout.some(p => p.id === w.id && p.visible)} onSelect={() => update(w.id, { visible: true })}>{w.title}{layout.some(p => p.id === w.id && p.visible) ? " ? al zichtbaar" : ""}</DropdownMenuItem>)}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setLayout(defaults(widgets))}>Standaardindeling herstellen</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <button aria-label={locked ? "Indeling ontgrendelen" : "Indeling vergrendelen"} aria-pressed={locked} title={locked ? "Indeling ontgrendelen" : "Indeling vergrendelen"} onClick={() => setLocked(v => !v)} className="board-toolbar-button border border-border bg-card">{locked ? <Lock size={18} /> : <Unlock size={18} />}</button>
      </div>
    </div>
    {storageFailed && <p role="status" className="mb-3 text-sm text-muted-foreground">Je browser kan de indeling niet bewaren. Aanpassen werkt wel voor deze sessie.</p>}
    {!layout.some(w => w.visible) && <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground">Je werkveld is leeg. Kies ?Blok toevoegen? om te beginnen.</div>}
    <div ref={board} className={BOARD_CLASSES.field} style={{ "--board-columns": boardColumns(shownLayout), "--board-height": availableHeight + "px" } as CSSProperties} data-locked={locked} data-stacked={stacked}>
      {layout.map(item => {
        const widget = widgets.find(w => w.id === item.id);
        if (!widget) return null;
        const placement = shownLayout.find(w => w.id === item.id) ?? item;
        return <article key={item.id} hidden={!item.visible} data-widget-id={item.id} aria-label={widget.title} className={"widget-board-panel " + BOARD_CLASSES.panel + (active === item.id ? " is-active" : "")} style={{ order: shownLayout.findIndex(w => w.id === item.id), "--board-column": positions[item.id]?.column, "--board-row": positions[item.id]?.row, "--board-span": positions[item.id]?.span, "--widget-width": placement.width, "--widget-height": placement.height + "px" } as CSSProperties}>
          <header className="widget-board-header">
            <button disabled={locked} aria-label={widget.title + " verplaatsen; gebruik de pijltjestoetsen"} title={locked ? widget.title : "Sleep om te verplaatsen; pijltjestoetsen werken ook"} className="widget-board-drag" onPointerDown={e => begin(e, item, "move")} {...pointerHandlers} onKeyDown={e => {
              if (locked || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
              e.preventDefault(); moveBy(item.id, ["ArrowLeft", "ArrowUp"].includes(e.key) ? -1 : 1);
            }}><GripVertical size={16} className="widget-board-grip" /><span>{widget.title}</span></button>
            {!locked && <div className="widget-board-actions">
              <DropdownMenu>
                <DropdownMenuTrigger asChild><button className="board-icon-button" aria-label={widget.title + " opties"}><MoreHorizontal size={18} /></button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{widget.title}</DropdownMenuLabel>
                  <DropdownMenuItem onSelect={() => update(item.id, { width: 12 })}>Extra breed</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => update(item.id, { width: 6 })}>Gemiddelde breedte</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => update(item.id, { height: clampHeight(item.height + 80) })}>Hoger maken</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => update(item.id, { height: clampHeight(item.height - 80) })}>Lager maken</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => update(item.id, { width: widget.width ?? 4, height: widget.height ?? BOARD_SIZE.defaultHeight })}>Standaardformaat</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled={layout.filter(w => w.visible)[0]?.id === item.id} onSelect={() => moveBy(item.id, -1)}>Naar voren verplaatsen</DropdownMenuItem>
                  <DropdownMenuItem disabled={layout.filter(w => w.visible).slice(-1)[0]?.id === item.id} onSelect={() => moveBy(item.id, 1)}>Naar achteren verplaatsen</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => update(item.id, { visible: false })}>Blok verbergen</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <button aria-label={widget.title + " verbergen"} title="Blok verbergen" onClick={() => update(item.id, { visible: false })} className="board-icon-button"><X size={16} /></button>
            </div>}
          </header>
          <div className={"widget-board-content " + BOARD_CLASSES.content}>{widget.content}</div>
          {active === item.id && <div className="widget-board-preview" aria-hidden="true">{gesture.current?.mode === "move" ? "Laat los om hier te plaatsen" : "Voorkeursbreedte " + Math.round(placement.width / shownLayout.filter(w => w.visible).reduce((sum, w) => sum + w.width, 0) * 100) + "% ? " + Math.round(placement.height) + " px"}</div>}
          {!locked && ([ ["left", "breedte links"], ["width", "breedte"], ["height", "hoogte"], ["both", "formaat"] ] as const).map(([mode, label]) => <button key={mode} aria-label={widget.title + " " + label + " aanpassen"} title={"Sleep voor " + label + "; of gebruik de pijltjestoetsen"} className={"widget-board-resize resize-" + mode} onPointerDown={e => begin(e, item, mode)} {...pointerHandlers} onKeyDown={e => {
            if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
            e.preventDefault();
            if (mode !== "height" && ["ArrowLeft", "ArrowRight"].includes(e.key)) update(item.id, { width: widths[Math.max(0, Math.min(widths.length - 1, widths.indexOf(item.width) + (e.key === "ArrowRight" ? 1 : -1) * (mode === "left" ? -1 : 1)))] });
            if (mode !== "width" && mode !== "left" && ["ArrowUp", "ArrowDown"].includes(e.key)) update(item.id, { height: clampHeight(item.height + (e.key === "ArrowDown" ? 20 : -20)) });
          }}>{mode === "both" && <MoveDiagonal2 size={16} />}</button>)}
        </article>;
      })}
    </div>
  </section>;
}
