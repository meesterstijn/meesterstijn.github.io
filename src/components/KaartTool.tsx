import { useEffect, useRef, useState } from "react";
import { X, Search } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Loc = { latlng: L.LatLng; label: string };

const geocode = async (q: string): Promise<Loc | null> => {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`,
    { headers: { "Accept-Language": "nl" } }
  );
  const data = await res.json();
  if (!data.length) return null;
  const { lat, lon, display_name } = data[0];
  return { latlng: L.latLng(parseFloat(lat), parseFloat(lon)), label: display_name };
};

const fmtKm = (m: number) =>
  m >= 1000 ? `${Math.round(m / 1000).toLocaleString("nl")} km` : `${Math.round(m)} m`;

const SearchRow = ({ label, q, setQ, busy, err, active, onSearch, onClear }: {
  label: string; q: string; setQ: (v: string) => void;
  busy: boolean; err: boolean; active: boolean;
  onSearch: () => void; onClear: () => void;
}) => (
  <div className="flex items-center gap-2">
    <span className="shrink-0 text-xs font-semibold text-muted-foreground w-14">{label}</span>
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        onKeyDown={e => e.key === "Enter" && onSearch()}
        placeholder="Zoek een plaats…"
        className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-8 text-sm outline-none focus:border-accent"
      />
      {active && (
        <button
          onClick={onClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
    <button
      onClick={onSearch} disabled={busy}
      className="shrink-0 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium transition-smooth hover:border-accent disabled:opacity-50"
    >
      {busy ? "…" : "Zoek"}
    </button>
    {err && <span className="text-xs text-destructive shrink-0">?</span>}
  </div>
);

const KaartTool = ({ onClose }: { onClose: () => void }) => {
  const mapRef      = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<L.Map | null>(null);
  const marker1Ref  = useRef<L.Marker | null>(null);
  const marker2Ref  = useRef<L.Marker | null>(null);
  const lineRef     = useRef<L.Polyline | null>(null);

  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [loc1, setLoc1] = useState<Loc | null>(null);
  const [loc2, setLoc2] = useState<Loc | null>(null);
  const [err1, setErr1] = useState(false);
  const [err2, setErr2] = useState(false);
  const [busy1, setBusy1] = useState(false);
  const [busy2, setBusy2] = useState(false);

  const distance = loc1 && loc2 ? loc1.latlng.distanceTo(loc2.latlng) : null;

  useEffect(() => {
    if (!mapRef.current || instanceRef.current) return;
    instanceRef.current = L.map(mapRef.current, {
      center: [20, 10], zoom: 2, minZoom: 2, maxZoom: 10, zoomControl: true,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(instanceRef.current);
    return () => { instanceRef.current?.remove(); instanceRef.current = null; };
  }, []);

  // Update lijn wanneer beide locaties bekend zijn
  useEffect(() => {
    const map = instanceRef.current;
    if (!map) return;
    lineRef.current?.remove();
    lineRef.current = null;
    if (loc1 && loc2) {
      lineRef.current = L.polyline([loc1.latlng, loc2.latlng], {
        color: "#e05a38", weight: 2, dashArray: "6 4",
      }).addTo(map);
      map.flyToBounds(L.latLngBounds([loc1.latlng, loc2.latlng]).pad(0.3), { duration: 1.2 });
    }
  }, [loc1, loc2]);

  const search1 = async () => {
    if (!q1.trim()) return;
    setBusy1(true); setErr1(false);
    const loc = await geocode(q1);
    setBusy1(false);
    if (!loc) { setErr1(true); return; }
    setLoc1(loc);
    marker1Ref.current?.remove();
    marker1Ref.current = L.marker(loc.latlng).addTo(instanceRef.current!).bindPopup(loc.label).openPopup();
    if (!loc2) instanceRef.current!.flyTo(loc.latlng, 5, { duration: 1.2 });
  };

  const search2 = async () => {
    if (!q2.trim()) return;
    setBusy2(true); setErr2(false);
    const loc = await geocode(q2);
    setBusy2(false);
    if (!loc) { setErr2(true); return; }
    setLoc2(loc);
    marker2Ref.current?.remove();
    marker2Ref.current = L.marker(loc.latlng).addTo(instanceRef.current!).bindPopup(loc.label).openPopup();
    if (!loc1) instanceRef.current!.flyTo(loc.latlng, 5, { duration: 1.2 });
  };

  const clear1 = () => {
    setQ1(""); setLoc1(null); setErr1(false);
    marker1Ref.current?.remove(); marker1Ref.current = null;
  };

  const clear2 = () => {
    setQ2(""); setLoc2(null); setErr2(false);
    marker2Ref.current?.remove(); marker2Ref.current = null;
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden" style={{ background: "hsl(334 10% 97%)" }}>
      <div className="flex shrink-0 items-center gap-4 border-b border-border bg-card/95 px-6 py-3 backdrop-blur-sm">
        <div className="shrink-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Aardrijkskunde</p>
          <h2 className="font-display text-xl font-semibold">Kaart van de wereld</h2>
        </div>
        <div className="flex flex-1 flex-col gap-1.5 max-w-lg">
          <SearchRow label="Plaats 1" q={q1} setQ={setQ1} busy={busy1} err={err1} active={!!loc1} onSearch={search1} onClear={clear1} />
          <SearchRow label="Plaats 2" q={q2} setQ={setQ2} busy={busy2} err={err2} active={!!loc2} onSearch={search2} onClear={clear2} />
        </div>
        {distance !== null && (
          <div className="shrink-0 rounded-2xl border border-border bg-card px-4 py-2 text-center">
            <p className="text-xs text-muted-foreground">Afstand</p>
            <p className="font-display text-lg font-semibold">{fmtKm(distance)}</p>
          </div>
        )}
        <button onClick={onClose} className="shrink-0 rounded-xl border border-border p-2 transition-smooth hover:border-accent">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div ref={mapRef} className="flex-1" />
    </div>
  );
};

export default KaartTool;
