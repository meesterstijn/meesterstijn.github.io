import { useState, useEffect } from "react";
import { SiteHeader } from "@/components/SiteHeader";

type WeerData = { temp: number; gevoels: number; code: number };

const fetchWeer = async (): Promise<WeerData> => {
  const res = await fetch(
    "https://api.open-meteo.com/v1/forecast?latitude=51.77&longitude=4.62&current=temperature_2m,apparent_temperature,weathercode&timezone=Europe%2FAmsterdam"
  );
  const d = await res.json();
  return {
    temp:    Math.round(d.current.temperature_2m),
    gevoels: Math.round(d.current.apparent_temperature),
    code:    d.current.weathercode,
  };
};

const weerEmoji = (code: number) => {
  if (code === 0)        return "☀️";
  if (code <= 2)         return "🌤️";
  if (code === 3)        return "☁️";
  if (code <= 48)        return "🌫️";
  if (code <= 67)        return "🌧️";
  if (code <= 77)        return "❄️";
  if (code <= 82)        return "🌦️";
  return "⛈️";
};

const weerTekst = (code: number) => {
  if (code === 0)        return "Heldere lucht";
  if (code <= 2)         return "Licht bewolkt";
  if (code === 3)        return "Bewolkt";
  if (code <= 48)        return "Mistig";
  if (code <= 57)        return "Lichte motregen";
  if (code <= 67)        return "Regen";
  if (code <= 77)        return "Sneeuw";
  if (code <= 82)        return "Regenbuien";
  return "Onweer";
};

const jasNodig = (temp: number, code: number) => !(temp >= 18 && code <= 1);
const jasTekst = (temp: number) =>
  temp >= 18
    ? "Neem je jas mee naar buiten. Je kunt hem uittrekken als je het warm krijgt."
    : "Neem je jas mee naar buiten.";

const Weer = () => {
  const [weer, setWeer]       = useState<WeerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fout, setFout]       = useState(false);

  useEffect(() => {
    fetchWeer()
      .then(w => { setWeer(w); setLoading(false); })
      .catch(() => { setFout(true); setLoading(false); });
  }, []);

  const jas = weer ? jasNodig(weer.temp, weer.code) : null;

  return (
    <>
      <style>{`
        @keyframes weer-bob {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes weer-pulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.08); }
        }
      `}</style>

      <div className="min-h-screen bg-paper bg-warm">
        <SiteHeader />
        <main className="container py-10 md:py-14">

          <div className="mb-10 animate-fade-up">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Buiten</p>
            <h1 className="mt-2 font-display text-4xl font-semibold md:text-5xl">Jas mee?</h1>
            <p className="mt-3 text-muted-foreground">Het huidige weer buiten — voor als je gaat buitenspelen.</p>
          </div>

          {loading && <p className="text-muted-foreground">Weer ophalen…</p>}
          {fout    && <p className="text-muted-foreground">Kan het weer niet laden. Controleer de verbinding.</p>}

          {weer && jas !== null && (
            <div className="grid gap-6 lg:grid-cols-2 animate-fade-up">

              {/* Verdict kaart */}
              <div className={`flex flex-col items-center justify-center gap-6 rounded-3xl p-10 text-center shadow-tile ${
                jas ? "bg-primary text-primary-foreground" : "bg-sage text-sage-foreground"
              }`}>
                <span
                  className="text-8xl leading-none"
                  style={{ animation: jas ? "weer-bob 2.4s ease-in-out infinite" : "weer-pulse 2s ease-in-out infinite" }}
                >
                  {jas ? "🧥" : "🌞"}
                </span>
                <div>
                  <p className="font-display text-4xl font-bold md:text-5xl">
                    {jas ? "Jas mee!" : "Geen jas nodig!"}
                  </p>
                  <p className="mt-4 text-base leading-relaxed opacity-85 max-w-xs mx-auto">
                    {jas
                      ? jasTekst(weer.temp)
                      : "Het is lekker warm vandaag. Lekker buiten spelen!"}
                  </p>
                </div>
              </div>

              {/* Weer info */}
              <div className="flex flex-col gap-4">
                <div className="rounded-3xl border border-border bg-card p-8 shadow-soft text-center">
                  <span
                    className="text-7xl leading-none"
                    style={{ animation: "weer-bob 3s ease-in-out infinite" }}
                  >
                    {weerEmoji(weer.code)}
                  </span>
                  <p className="mt-5 font-display text-7xl font-bold tracking-tight">{weer.temp}°C</p>
                  <p className="mt-2 text-lg font-medium">{weerTekst(weer.code)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Gevoelstemperatuur: {weer.gevoels}°C
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-card/60 px-5 py-4 text-sm text-muted-foreground leading-relaxed">
                  Geen jas nodig als het <strong>18°C of warmer</strong> is met heldere lucht. Anders: jas mee
                  {weer.temp >= 18 ? " — buiten kun je hem uittrekken als je het warm krijgt." : "."}
                </div>
              </div>

            </div>
          )}

          <footer className="mt-20 border-t border-border pt-6 text-center text-sm text-muted-foreground">
            Meester Stijn
          </footer>
        </main>
      </div>
    </>
  );
};

export default Weer;
