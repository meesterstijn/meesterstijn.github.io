import { useState } from "react";
import { X } from "lucide-react";

const COLORS = ["#FF6B6B", "#FFE66D", "#4ECDC4", "#FF8E53", "#C084FC", "#F472B6", "#38BDF8", "#86EFAC", "#FCD34D", "#F87171"];

const pieces = Array.from({ length: 120 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  delay: Math.random() * 7,
  duration: 4 + Math.random() * 5,
  color: COLORS[Math.floor(Math.random() * COLORS.length)],
  w: 5 + Math.random() * 10,
  h: 4 + Math.random() * 8,
  rot: Math.random() * 360,
  circle: Math.random() > 0.65,
}));

const BALLOONS = ["🎈", "🎈", "🎈", "🎈", "🎈", "🎈"];
const EMOJIS   = ["🎁", "🎊", "🥳", "🎊", "🎁", "🎊"];

const VerjaardagTool = ({ onClose }: { onClose: () => void }) => {
  const [naam, setNaam] = useState("");

  return (
    <>
      <style>{`
        @keyframes vj-fall {
          0%   { transform: translateY(-30px) rotate(0deg);   opacity: 1; }
          90%  { opacity: 1; }
          100% { transform: translateY(105vh) rotate(800deg); opacity: 0; }
        }
        @keyframes vj-bob {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-14px); }
        }
        @keyframes vj-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.85; transform: scale(1.03); }
        }
        @keyframes vj-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      <div
        className="fixed inset-0 z-50 flex flex-col overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1e0a3c 0%, #0f1e5c 45%, #1e0a3c 100%)" }}
      >
        {/* Confetti */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {pieces.map(p => (
            <div
              key={p.id}
              style={{
                position: "absolute",
                left: `${p.left}%`,
                top: "-30px",
                width: `${p.w}px`,
                height: `${p.h}px`,
                background: p.color,
                borderRadius: p.circle ? "50%" : "2px",
                transform: `rotate(${p.rot}deg)`,
                animation: `vj-fall ${p.duration}s ${p.delay}s infinite linear`,
              }}
            />
          ))}
        </div>

        {/* Header */}
        <div className="relative flex shrink-0 items-center justify-between border-b border-white/10 bg-white/5 px-6 py-3 backdrop-blur-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pink-300">Feest</p>
            <h2 className="font-display text-xl font-semibold text-white">Verjaardag</h2>
          </div>
          <button onClick={onClose} className="rounded-xl border border-white/20 p-2 text-white transition-smooth hover:border-white/60">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="relative flex flex-1 flex-col items-center justify-center gap-8 p-8 text-center">

          {/* Ballonnen boven */}
          <div className="pointer-events-none absolute top-2 left-0 right-0 flex justify-around px-10">
            {BALLOONS.map((b, i) => (
              <span
                key={i}
                className="text-4xl"
                style={{ animation: `vj-bob ${2.2 + i * 0.25}s ease-in-out infinite`, animationDelay: `${i * 0.35}s` }}
              >
                {b}
              </span>
            ))}
          </div>

          {/* Taart */}
          <div
            className="text-7xl md:text-8xl"
            style={{ animation: "vj-pulse 2.5s ease-in-out infinite" }}
          >
            🎂
          </div>

          {/* Tekst */}
          {naam ? (
            <div>
              <p className="font-display text-3xl font-bold text-white/80 md:text-4xl">Gefeliciteerd</p>
              <p
                className="font-display text-5xl font-bold md:text-7xl"
                style={{
                  background: "linear-gradient(90deg, #FFE66D, #FF8E53, #F472B6, #C084FC, #38BDF8)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  animation: "vj-pulse 2s ease-in-out infinite",
                }}
              >
                {naam}!
              </p>
            </div>
          ) : (
            <h1
              className="font-display text-5xl font-bold text-white md:text-7xl"
              style={{ animation: "vj-pulse 2.5s ease-in-out infinite" }}
            >
              🎉 Gefeliciteerd! 🎉
            </h1>
          )}

          {/* Naam invoer */}
          <input
            type="text"
            value={naam}
            onChange={e => setNaam(e.target.value)}
            placeholder="Wie is er jarig?"
            className="w-full max-w-xs rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-center text-lg text-white placeholder-white/40 outline-none backdrop-blur-sm focus:border-yellow-300"
          />

          {/* Emoji rij onder */}
          <div className="pointer-events-none flex gap-4 text-3xl">
            {EMOJIS.map((e, i) => (
              <span
                key={i}
                style={{ animation: `vj-bob ${1.6 + i * 0.2}s ease-in-out infinite`, animationDelay: `${i * 0.28}s` }}
              >
                {e}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default VerjaardagTool;
