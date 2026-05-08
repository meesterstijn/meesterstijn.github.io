import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const KaartTool = ({ onClose }: { onClose: () => void }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || instanceRef.current) return;
    instanceRef.current = L.map(mapRef.current, {
      center: [20, 10],
      zoom: 2,
      minZoom: 2,
      maxZoom: 10,
      zoomControl: true,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(instanceRef.current);
    return () => {
      instanceRef.current?.remove();
      instanceRef.current = null;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden" style={{ background: "hsl(334 10% 97%)" }}>
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-card/95 px-6 py-3 backdrop-blur-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Aardrijkskunde</p>
          <h2 className="font-display text-xl font-semibold">Kaart van de wereld</h2>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>Scroll om in/uit te zoomen · Sleep om te bewegen</span>
          <button onClick={onClose} className="rounded-xl border border-border p-2 transition-smooth hover:border-accent">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div ref={mapRef} className="flex-1" />
    </div>
  );
};

export default KaartTool;
