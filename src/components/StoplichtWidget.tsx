import { useState } from "react";

type Light = "rood" | "oranje" | "groen";

const lights: { color: Light; label: string; bg: string; glow: string }[] = [
  { color: "rood",   label: "Je werkt stil en zelfstandig, zonder vragen te stellen.",              bg: "#ef4444", glow: "0 0 40px 10px #ef444488" },
  { color: "oranje", label: "Je werkt stil. Je steekt je vinger op voor een vraag aan de meester.", bg: "#f97316", glow: "0 0 40px 10px #f9731688" },
  { color: "groen",  label: "Met een fluisterstem samenwerken met schoudermaatje.",                  bg: "#22c55e", glow: "0 0 40px 10px #22c55e88" },
];

export const StoplichtWidget = ({ footer }: { footer?: React.ReactNode } = {}) => {
  const [active, setActive] = useState<Light | null>(null);

  return (
    <div className="h-full rounded-3xl border border-border bg-card p-6 shadow-soft">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-accent">Stoplicht</p>
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-zinc-900 px-6 py-5">
          {lights.map(l => (
            <button
              key={l.color}
              onClick={() => setActive(active === l.color ? null : l.color)}
              className="h-16 w-16 rounded-full transition-all duration-300"
              style={{
                backgroundColor: active === l.color ? l.bg : "#3f3f46",
                boxShadow: active === l.color ? l.glow : "none",
              }}
            />
          ))}
        </div>
        {active
          ? <p className="mt-2 text-center text-sm font-semibold">{lights.find(l => l.color === active)?.label}</p>
          : <p className="mt-2 text-center text-sm text-muted-foreground">Klik op een lamp</p>
        }
        {footer}
      </div>
    </div>
  );
};
