import { useEffect, useState } from "react";

const dayNames = [
  "zondag", "maandag", "dinsdag", "woensdag",
  "donderdag", "vrijdag", "zaterdag",
];
const monthNames = [
  "januari", "februari", "maart", "april", "mei", "juni",
  "juli", "augustus", "september", "oktober", "november", "december",
];

const AnalogClock = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const s = now.getSeconds();
  const m = now.getMinutes();
  const h = now.getHours() % 12;

  const secDeg = s * 6;
  const minDeg = m * 6 + s * 0.1;
  const hrDeg  = h * 30 + m * 0.5;

  const cx = 100, cy = 100, r = 88;

  const hand = (deg: number, length: number, width: number, color: string) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    const x2 = cx + length * Math.cos(rad);
    const y2 = cy + length * Math.sin(rad);
    return <line x1={cx} y1={cy} x2={x2} y2={y2} stroke={color} strokeWidth={width} strokeLinecap="round" />;
  };

  return (
    <svg viewBox="0 0 200 200" className="h-full w-full max-h-36 max-w-36 drop-shadow-lg">
      {/* Face */}
      <circle cx={cx} cy={cy} r={r} fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)" strokeWidth={2} />

      {/* Hour markers */}
      {Array.from({ length: 12 }, (_, i) => {
        const deg = i * 30;
        const rad = ((deg - 90) * Math.PI) / 180;
        const x1 = cx + (r - 10) * Math.cos(rad);
        const y1 = cy + (r - 10) * Math.sin(rad);
        const x2 = cx + (r - 18) * Math.cos(rad);
        const y2 = cy + (r - 18) * Math.sin(rad);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.5)" strokeWidth={2.5} strokeLinecap="round" />;
      })}

      {/* Minute markers */}
      {Array.from({ length: 60 }, (_, i) => {
        if (i % 5 === 0) return null;
        const deg = i * 6;
        const rad = ((deg - 90) * Math.PI) / 180;
        const x1 = cx + (r - 8) * Math.cos(rad);
        const y1 = cy + (r - 8) * Math.sin(rad);
        const x2 = cx + (r - 13) * Math.cos(rad);
        const y2 = cy + (r - 13) * Math.sin(rad);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.18)" strokeWidth={1} strokeLinecap="round" />;
      })}

      {/* Hands */}
      {hand(hrDeg,  46, 5,   "rgba(255,255,255,0.95)")}
      {hand(minDeg, 64, 3.5, "rgba(255,255,255,0.85)")}
      {hand(secDeg, 70, 1.5, "hsl(var(--accent))")}

      {/* Center dot */}
      <circle cx={cx} cy={cy} r={5}   fill="hsl(var(--accent))" />
      <circle cx={cx} cy={cy} r={2.5} fill="white" />
    </svg>
  );
};

export const ClockCard = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const day     = dayNames[now.getDay()];
  const dateStr = `${now.getDate()} ${monthNames[now.getMonth()]} ${now.getFullYear()}`;

  return (
    <div className="relative h-full overflow-hidden rounded-3xl bg-primary p-8 text-primary-foreground shadow-tile md:p-12">
      <div
        className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full opacity-30 blur-3xl"
        style={{ background: "hsl(var(--accent))" }}
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full opacity-20 blur-3xl"
        style={{ background: "hsl(var(--highlight))" }}
      />
      <div className="relative flex flex-col items-center gap-6 md:flex-row md:items-center md:justify-between">
        <div className="text-center md:text-left">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary-foreground/60">
            Vandaag is het
          </p>
          <p className="mt-2 font-display text-3xl font-medium capitalize md:text-4xl">
            {day}
          </p>
          <p className="text-primary-foreground/70">{dateStr}</p>
        </div>
        <div className="flex items-center justify-center md:justify-end" style={{ width: 144, height: 144, flexShrink: 0 }}>
          <AnalogClock />
        </div>
      </div>
    </div>
  );
};
