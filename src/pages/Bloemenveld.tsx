import { useEffect, useRef, useState } from "react";
import { RotateCcw, Trash2 } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { PlantSVG, type PlantVariant } from "@/components/PlantSVG";
import { FieldItemSVG, VELD_ITEMS, type FieldItemType } from "@/components/FieldItemSVG";
import { supabase } from "@/lib/supabase";

type Flower    = { id: number; created_at: string; variant: number; x: number | null; y: number | null };
type FieldItem = { id: string; type: FieldItemType; x: number | null; y: number | null };
type Pos       = { x: number; y: number };

// Draggable item can be a flower or a field item
type DragKey = `flower-${number}` | `item-${string}`;

const FLOWER_W = 88;
const FLOWER_H = 122;

const defaultPos = (index: number, total: number): Pos => {
  const cols = Math.max(3, Math.ceil(Math.sqrt(total * 1.6)));
  const col  = index % cols;
  const row  = Math.floor(index / cols);
  const jx   = ((index * 17 + 3) % 12) - 6;
  const jy   = ((index * 13 + 7) % 12) - 6;
  const x    = 6 + (col / Math.max(cols - 1, 1)) * 84 + jx;
  const y    = 8 + (row / Math.max(Math.ceil(total / cols) - 1, 1)) * 74 + jy;
  return { x: Math.max(3, Math.min(94, x)), y: Math.max(4, Math.min(88, y)) };
};

const fetchFlowers = async (): Promise<Flower[]> => {
  const { data } = await supabase.from("flowers").select("*").order("created_at", { ascending: true });
  return data ?? [];
};

const fetchFieldItems = async (): Promise<FieldItem[]> => {
  const { data } = await supabase.from("field_items").select("*");
  return (data ?? []) as FieldItem[];
};

const updateFlowerPos    = (id: number,  x: number, y: number) =>
  supabase.from("flowers").update({ x, y }).eq("id", id);

const updateFieldItemPos = (id: string,  x: number, y: number) =>
  supabase.from("field_items").update({ x, y }).eq("id", id);

// Seeded pseudo-random so blades are stable across renders
const mkRand = (seed: number) => {
  let s = seed >>> 0;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 0xffffffff; };
};

const rand = mkRand(314159);
const BLADES = Array.from({ length: 500 }, () => {
  const x     = rand() * 1000;
  const y     = rand() * 600;
  const h     = 4 + rand() * 9;
  const lean  = (rand() - 0.5) * 6;
  const w     = 0.8 + rand() * 1.0;
  const op    = 0.13 + rand() * 0.24;
  const t     = rand();
  const color = t > 0.65 ? "#86efac" : t > 0.35 ? "#4ade80" : "#22c55e";
  return { x, y, h, lean, w, op, color };
});

const GrassField = () => (
  <svg
    className="pointer-events-none absolute inset-0 h-full w-full"
    viewBox="0 0 1000 600"
    preserveAspectRatio="xMidYMid slice"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <radialGradient id="vign" cx="50%" cy="50%" r="70%">
        <stop offset="0%"   stopColor="transparent" />
        <stop offset="100%" stopColor="rgba(0,0,0,0.18)" />
      </radialGradient>
    </defs>
    {BLADES.map((b, i) => (
      <path
        key={i}
        d={`M${b.x} ${b.y} Q${b.x + b.lean * 0.5} ${b.y - b.h * 0.55} ${b.x + b.lean} ${b.y - b.h}`}
        fill="none"
        stroke={b.color}
        strokeWidth={b.w}
        strokeLinecap="round"
        opacity={b.op}
      />
    ))}
    <rect width="100%" height="100%" fill="url(#vign)" />
  </svg>
);

const Bloemenveld = () => {
  const [flowers,     setFlowers]     = useState<Flower[]>([]);
  const [fieldItems,  setFieldItems]  = useState<FieldItem[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [positions,   setPositions]   = useState<Record<string, Pos>>({});
  const [draggingKey, setDraggingKey] = useState<DragKey | null>(null);
  const fieldRef    = useRef<HTMLDivElement>(null);
  const positionsRef = useRef<Record<string, Pos>>({});
  const dragRef  = useRef<{
    key: DragKey;
    startX: number; startY: number;
    origX:  number; origY:  number;
  } | null>(null);

  useEffect(() => {
    Promise.all([fetchFlowers(), fetchFieldItems()]).then(([f, fi]) => {
      setFlowers(f);
      setFieldItems(fi);
      const pos: Record<string, Pos> = {};
      f.forEach((fl, i) => {
        const k: DragKey = `flower-${fl.id}`;
        pos[k] = fl.x != null && fl.y != null ? { x: fl.x, y: fl.y } : defaultPos(i, f.length);
      });
      fi.forEach(item => {
        const k: DragKey = `item-${item.id}`;
        pos[k] = item.x != null && item.y != null ? { x: item.x, y: item.y } : { x: 50, y: 50 };
      });
      positionsRef.current = pos;
      setPositions(pos);
      setLoading(false);
    });

    const channel = supabase
      .channel("flowers-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "flowers" }, payload => {
        const nf = payload.new as Flower;
        setFlowers(prev => {
          const updated = [...prev, nf];
          const k: DragKey = `flower-${nf.id}`;
          setPositions(p => ({
            ...p,
            [k]: nf.x != null && nf.y != null ? { x: nf.x, y: nf.y } : defaultPos(updated.length - 1, updated.length),
          }));
          return updated;
        });
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "field_items" }, payload => {
        const ni = payload.new as FieldItem;
        setFieldItems(prev => [...prev, ni]);
        const k: DragKey = `item-${ni.id}`;
        setPositions(p => ({ ...p, [k]: { x: 50, y: 50 } }));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const getPos = (key: DragKey, fallback: Pos): Pos =>
    positions[key] ?? fallback;

  const handlePointerDown = (e: React.PointerEvent, key: DragKey, current: Pos) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { key, startX: e.clientX, startY: e.clientY, origX: current.x, origY: current.y };
    setDraggingKey(key);
  };

  const handlePointerMove = (e: React.PointerEvent, key: DragKey) => {
    if (!dragRef.current || dragRef.current.key !== key || !fieldRef.current) return;
    const rect = fieldRef.current.getBoundingClientRect();
    const dx = ((e.clientX - dragRef.current.startX) / rect.width)  * 100;
    const dy = ((e.clientY - dragRef.current.startY) / rect.height) * 100;
    const x  = Math.max(2, Math.min(94, dragRef.current.origX + dx));
    const y  = Math.max(3, Math.min(90, dragRef.current.origY + dy));
    const updated = { ...positionsRef.current, [key]: { x, y } };
    positionsRef.current = updated;
    setPositions(updated);
  };

  const handlePointerUp = async (key: DragKey) => {
    if (!dragRef.current || dragRef.current.key !== key) return;
    dragRef.current = null;
    setDraggingKey(null);
    const pos = positionsRef.current[key];
    if (!pos) return;
    if (key.startsWith("flower-")) {
      await updateFlowerPos(Number(key.replace("flower-", "")), pos.x, pos.y);
    } else {
      await updateFieldItemPos(key.replace("item-", ""), pos.x, pos.y);
    }
  };

  const resetPositions = async () => {
    const ops: Promise<unknown>[] = [];
    const next: Record<string, Pos> = { ...positions };
    flowers.forEach((fl, i) => {
      const k: DragKey = `flower-${fl.id}`;
      const p = defaultPos(i, flowers.length);
      next[k] = p;
      ops.push(supabase.from("flowers").update({ x: p.x, y: p.y }).eq("id", fl.id));
    });
    await Promise.all(ops);
    positionsRef.current = next;
    setPositions(next);
  };

  const resetVeldItems = async () => {
    if (!window.confirm("Alle vrijgespeelde items verwijderen en sterren teller op 0 zetten?")) return;
    await supabase.from("field_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("class_points").update({ unlock_stars: 0 }).eq("id", 1);
    setFieldItems([]);
    setPositions(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => { if (k.startsWith("item-")) delete next[k]; });
      return next;
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-paper bg-warm">
      <SiteHeader />

      <div className="container flex items-end justify-between py-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">De klas</p>
          <h1 className="mt-1 font-display text-4xl font-semibold">Bloemenveld</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading ? "Laden…" : flowers.length === 0
              ? "Nog geen bloemen. Voltooi een timer om de eerste te laten groeien!"
              : `${flowers.length} bloem${flowers.length === 1 ? "" : "en"} — sleep om te verplaatsen`}
          </p>
        </div>
        {!loading && (
          <div className="flex gap-2">
            {fieldItems.length > 0 && (
              <button
                onClick={resetVeldItems}
                className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-card px-4 py-2 text-sm text-destructive transition-smooth hover:bg-destructive/5"
              >
                <Trash2 className="h-4 w-4" />
                Items resetten
              </button>
            )}
            {flowers.length > 0 && (
              <button
                onClick={resetPositions}
                title="Posities resetten"
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition-smooth hover:border-accent hover:text-foreground"
              >
                <RotateCcw className="h-4 w-4" />
                Posities resetten
              </button>
            )}
          </div>
        )}
      </div>

      {/* Grass field */}
      <div
        ref={fieldRef}
        className="relative mx-4 mb-8 overflow-hidden rounded-3xl shadow-tile"
        style={{
          minHeight: 580,
          background: "linear-gradient(165deg, #86efac 0%, #4ade80 18%, #22c55e 42%, #16a34a 68%, #166534 100%)",
        }}
      >
        <GrassField />

        {!loading && flowers.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="rounded-2xl bg-black/20 px-6 py-4 text-center text-sm font-medium text-white backdrop-blur-sm">
              Nog geen bloemen — voltooi een timer om te beginnen!
            </p>
          </div>
        )}

        {flowers.map((flower, i) => {
          const key        = `flower-${flower.id}` as DragKey;
          const pos        = getPos(key, defaultPos(i, flowers.length));
          const isDragging = draggingKey === key;
          return (
            <div
              key={key}
              className="absolute select-none"
              style={{
                left: `${pos.x}%`, top: `${pos.y}%`,
                width: FLOWER_W, height: FLOWER_H,
                transform: "translate(-50%, -50%)",
                touchAction: "none",
                cursor:     isDragging ? "grabbing" : "grab",
                zIndex:     isDragging ? 50 : 1,
                filter:     isDragging ? "drop-shadow(0 8px 16px rgba(0,0,0,0.45))" : "drop-shadow(0 3px 6px rgba(0,0,0,0.3))",
                scale:      isDragging ? "1.08" : "1",
                transition: isDragging ? "filter 0.1s, scale 0.1s" : "filter 0.2s, scale 0.2s",
              }}
              onPointerDown={e => handlePointerDown(e, key, pos)}
              onPointerMove={e => handlePointerMove(e, key)}
              onPointerUp={() => handlePointerUp(key)}
            >
              <PlantSVG progress={1} variant={flower.variant as PlantVariant} />
            </div>
          );
        })}

        {fieldItems.map(item => {
          const key        = `item-${item.id}` as DragKey;
          const pos        = getPos(key, { x: 50, y: 50 });
          const isDragging = draggingKey === key;
          const meta       = VELD_ITEMS.find(v => v.type === item.type);
          const w          = meta?.w ?? 90;
          const h          = meta?.h ?? 100;
          return (
            <div
              key={key}
              className="absolute select-none"
              style={{
                left: `${pos.x}%`, top: `${pos.y}%`,
                width: w, height: h,
                transform: "translate(-50%, -50%)",
                touchAction: "none",
                cursor:     isDragging ? "grabbing" : "grab",
                zIndex:     isDragging ? 50 : 2,
                filter:     isDragging ? "drop-shadow(0 10px 20px rgba(0,0,0,0.5))" : "drop-shadow(0 4px 8px rgba(0,0,0,0.35))",
                scale:      isDragging ? "1.08" : "1",
                transition: isDragging ? "filter 0.1s, scale 0.1s" : "filter 0.2s, scale 0.2s",
              }}
              onPointerDown={e => handlePointerDown(e, key, pos)}
              onPointerMove={e => handlePointerMove(e, key)}
              onPointerUp={() => handlePointerUp(key)}
            >
              <FieldItemSVG type={item.type} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Bloemenveld;
