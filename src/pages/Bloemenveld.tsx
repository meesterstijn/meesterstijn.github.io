import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { PlantSVG, type PlantVariant } from "@/components/PlantSVG";
import { supabase } from "@/lib/supabase";

type Flower = { id: number; created_at: string; variant: number };

const fetchFlowers = async (): Promise<Flower[]> => {
  const { data } = await supabase.from("flowers").select("*").order("created_at", { ascending: true });
  return data ?? [];
};

const fmt = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
};

const Bloemenveld = () => {
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlowers().then(f => { setFlowers(f); setLoading(false); });

    const channel = supabase
      .channel("flowers-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "flowers" }, payload => {
        setFlowers(prev => [...prev, payload.new as Flower]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="min-h-screen bg-paper bg-warm">
      <SiteHeader />
      <main className="container py-10 md:py-14">
        <div className="mb-12 animate-fade-up">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">De klas</p>
          <h1 className="mt-2 font-display text-4xl font-semibold md:text-5xl">Bloemenveld</h1>
          <p className="mt-3 text-muted-foreground">
            {loading ? "Laden…" : flowers.length === 0
              ? "Nog geen bloemen. Voltooi een timer om de eerste te laten groeien!"
              : `${flowers.length} bloem${flowers.length === 1 ? "" : "en"} gegroeid`}
          </p>
        </div>

        {!loading && flowers.length > 0 && (
          <div className="grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 animate-fade-up">
            {flowers.map(flower => (
              <div key={flower.id} className="flex flex-col items-center gap-1">
                <div style={{ width: 72, height: 95 }}>
                  <PlantSVG progress={1} variant={flower.variant as PlantVariant} />
                </div>
                <span className="text-center text-xs text-muted-foreground">{fmt(flower.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Bloemenveld;
