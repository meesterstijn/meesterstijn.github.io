import { useEffect, useState } from "react";

const dayNames = [
  "zondag", "maandag", "dinsdag", "woensdag",
  "donderdag", "vrijdag", "zaterdag",
];
const monthNames = [
  "januari", "februari", "maart", "april", "mei", "juni",
  "juli", "augustus", "september", "oktober", "november", "december",
];

export const ClockCard = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  const day = dayNames[now.getDay()];
  const dateStr = `${now.getDate()} ${monthNames[now.getMonth()]} ${now.getFullYear()}`;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-primary p-8 text-primary-foreground shadow-tile md:p-12">
      <div
        className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full opacity-30 blur-3xl"
        style={{ background: "hsl(var(--accent))" }}
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full opacity-20 blur-3xl"
        style={{ background: "hsl(var(--highlight))" }}
      />
      <div className="relative">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary-foreground/60">
          Vandaag is het
        </p>
        <p className="mt-2 font-display text-3xl font-medium capitalize md:text-4xl">
          {day}
        </p>
        <p className="text-primary-foreground/70">{dateStr}</p>
        <div className="mt-8 flex items-end gap-2 font-display text-7xl font-semibold tabular-nums leading-none md:text-[8rem]">
          <span>{hh}</span>
          <span className="text-accent">:</span>
          <span>{mm}</span>
          <span className="ml-2 text-3xl text-primary-foreground/50 md:text-4xl">{ss}</span>
        </div>
      </div>
    </div>
  );
};
