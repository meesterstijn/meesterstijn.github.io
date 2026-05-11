export type PlantVariant = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const PLANT_COUNT = 8;
export const randomVariant = (): PlantVariant => Math.floor(Math.random() * PLANT_COUNT) as PlantVariant;

// ── Gedeelde helpers ──────────────────────────────────────────────────────────
const GY = 140;
const STEM_LEN = 108;
const lo = (p: number, t: number) => Math.max(0, Math.min(1, (p - t) / 0.1));

const Soil = () => (
  <>
    <ellipse cx="50" cy="154" rx="38" ry="11" fill="#c8a45a" opacity="0.45" />
    <ellipse cx="50" cy="150" rx="33" ry="8"  fill="#a67c38" opacity="0.5" />
    <ellipse cx="50" cy="147" rx="27" ry="5.5" fill="#8a6428" opacity="0.55" />
  </>
);

// ── Bladeren (gedeeld door de meeste planten) ─────────────────────────────────
const Leaves = ({ p, tip }: { p: number; tip: number }) => (
  <>
    <g opacity={lo(p, 0.28)} transform={`translate(50,${GY - STEM_LEN * 0.31})`}>
      <ellipse cx="-8" cy="0" rx="14" ry="5.5" fill="#6ab840" transform="rotate(-28)" />
    </g>
    <g opacity={lo(p, 0.47)} transform={`translate(50,${GY - STEM_LEN * 0.51})`}>
      <ellipse cx="8" cy="0" rx="13" ry="5" fill="#6ab840" transform="rotate(28)" />
    </g>
    <g opacity={lo(p, 0.65)} transform={`translate(50,${GY - STEM_LEN * 0.69})`}>
      <ellipse cx="-7" cy="0" rx="12" ry="4.5" fill="#58a034" transform="rotate(-33)" />
    </g>
    <g opacity={lo(p, 0.83)} transform={`translate(50,${GY - STEM_LEN * 0.87})`}>
      <ellipse cx="7" cy="0" rx="11" ry="4" fill="#58a034" transform="rotate(33)" />
    </g>
  </>
);

// ── 0: Roze bloem ─────────────────────────────────────────────────────────────
const RozeBloem = ({ p }: { p: number }) => {
  const tip = GY - STEM_LEN * p;
  return (
    <svg viewBox="0 0 100 170" className="w-full h-full">
      <Soil />
      <ellipse cx="50" cy="143" rx="5" ry="3.5" fill="#7a5c2e" opacity={Math.max(0, 1 - p / 0.07)} />
      {p > 0.03 && <line x1="50" y1={GY} x2="50" y2={tip} stroke="#4a7828" strokeWidth="3.5" strokeLinecap="round" />}
      <Leaves p={p} tip={tip} />
      <g opacity={lo(p, 0.92)} transform={`translate(50,${tip})`}>
        {[0,60,120,180,240,300].map(a => (
          <ellipse key={a} cx="0" cy="-12" rx="5.5" ry="9" fill="#f9a8d4" transform={`rotate(${a})`} />
        ))}
        <circle cx="0" cy="0" r="7" fill="#fbbf24" />
        <circle cx="0" cy="0" r="3.5" fill="#f59e0b" />
      </g>
    </svg>
  );
};

// ── 1: Zonnebloem ─────────────────────────────────────────────────────────────
const Zonnebloem = ({ p }: { p: number }) => {
  const tip = GY - STEM_LEN * p;
  return (
    <svg viewBox="0 0 100 170" className="w-full h-full">
      <Soil />
      <ellipse cx="50" cy="143" rx="5" ry="3.5" fill="#7a5c2e" opacity={Math.max(0, 1 - p / 0.07)} />
      {p > 0.03 && <line x1="50" y1={GY} x2="50" y2={tip} stroke="#4a7828" strokeWidth="3.5" strokeLinecap="round" />}
      <Leaves p={p} tip={tip} />
      <g opacity={lo(p, 0.92)} transform={`translate(50,${tip})`}>
        {Array.from({ length: 14 }, (_, i) => i * (360 / 14)).map(a => (
          <ellipse key={a} cx="0" cy="-13" rx="3.5" ry="10" fill="#fbbf24" transform={`rotate(${a})`} />
        ))}
        <circle cx="0" cy="0" r="10" fill="#78350f" />
        <circle cx="0" cy="0" r="7" fill="#92400e" />
        {[[-3,-3],[3,-3],[0,3],[-4,1],[4,1],[0,-5],[-2,4],[2,4]].map(([dx,dy],i) => (
          <circle key={i} cx={dx} cy={dy} r="1.2" fill="#451a03" />
        ))}
      </g>
    </svg>
  );
};

// ── 2: Tulp ───────────────────────────────────────────────────────────────────
const Tulp = ({ p }: { p: number }) => {
  const tip = GY - STEM_LEN * p;
  return (
    <svg viewBox="0 0 100 170" className="w-full h-full">
      <Soil />
      <ellipse cx="50" cy="143" rx="5" ry="3.5" fill="#7a5c2e" opacity={Math.max(0, 1 - p / 0.07)} />
      {p > 0.03 && <line x1="50" y1={GY} x2="50" y2={tip} stroke="#4a7828" strokeWidth="3.5" strokeLinecap="round" />}
      {/* Tulp heeft bredere bladeren */}
      <g opacity={lo(p, 0.28)} transform={`translate(50,${GY - STEM_LEN * 0.35})`}>
        <ellipse cx="-10" cy="0" rx="16" ry="6" fill="#4a9020" transform="rotate(-20)" />
      </g>
      <g opacity={lo(p, 0.55)} transform={`translate(50,${GY - STEM_LEN * 0.58})`}>
        <ellipse cx="10" cy="0" rx="15" ry="6" fill="#4a9020" transform="rotate(20)" />
      </g>
      {/* Kelk */}
      <g opacity={lo(p, 0.92)} transform={`translate(50,${tip})`}>
        {/* Buitenste 3 bloemblaadjes */}
        <ellipse cx="-7" cy="-7" rx="5.5" ry="10" fill="#dc2626" transform="rotate(-15)" />
        <ellipse cx="0" cy="-10" rx="5.5" ry="11" fill="#ef4444" />
        <ellipse cx="7" cy="-7" rx="5.5" ry="10" fill="#dc2626" transform="rotate(15)" />
        {/* Binnenste 2 bloemblaadjes */}
        <ellipse cx="-3.5" cy="-9" rx="4" ry="10" fill="#f87171" transform="rotate(-8)" />
        <ellipse cx="3.5" cy="-9" rx="4" ry="10" fill="#f87171" transform="rotate(8)" />
        {/* Stamper */}
        <line x1="0" y1="0" x2="0" y2="-14" stroke="#fbbf24" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="0" cy="-14" r="1.5" fill="#fbbf24" />
      </g>
    </svg>
  );
};

// ── 3: Madeliefje ─────────────────────────────────────────────────────────────
const Madeliefje = ({ p }: { p: number }) => {
  const tip = GY - STEM_LEN * p;
  return (
    <svg viewBox="0 0 100 170" className="w-full h-full">
      <Soil />
      <ellipse cx="50" cy="143" rx="5" ry="3.5" fill="#7a5c2e" opacity={Math.max(0, 1 - p / 0.07)} />
      {p > 0.03 && <line x1="50" y1={GY} x2="50" y2={tip} stroke="#4a7828" strokeWidth="3.5" strokeLinecap="round" />}
      <Leaves p={p} tip={tip} />
      <g opacity={lo(p, 0.92)} transform={`translate(50,${tip})`}>
        {Array.from({ length: 12 }, (_, i) => i * 30).map(a => (
          <ellipse key={a} cx="0" cy="-11" rx="2.8" ry="8.5" fill="white" stroke="#e5e7eb" strokeWidth="0.3" transform={`rotate(${a})`} />
        ))}
        <circle cx="0" cy="0" r="7" fill="#fde68a" />
        <circle cx="0" cy="0" r="4.5" fill="#fbbf24" />
        <circle cx="0" cy="0" r="2.5" fill="#f59e0b" />
      </g>
    </svg>
  );
};

// ── 4: Hibiscus ───────────────────────────────────────────────────────────────
const Hibiscus = ({ p }: { p: number }) => {
  const tip = GY - STEM_LEN * p;
  return (
    <svg viewBox="0 0 100 170" className="w-full h-full">
      <Soil />
      <ellipse cx="50" cy="143" rx="5" ry="3.5" fill="#7a5c2e" opacity={Math.max(0, 1 - p / 0.07)} />
      {p > 0.03 && <line x1="50" y1={GY} x2="50" y2={tip} stroke="#4a7828" strokeWidth="3.5" strokeLinecap="round" />}
      <Leaves p={p} tip={tip} />
      <g opacity={lo(p, 0.92)} transform={`translate(50,${tip})`}>
        {Array.from({ length: 5 }, (_, i) => i * 72).map(a => (
          <ellipse key={a} cx="0" cy="-10" rx="7" ry="11" fill="#f97316" opacity="0.88" transform={`rotate(${a})`} />
        ))}
        <circle cx="0" cy="0" r="5" fill="#fef3c7" />
        <circle cx="0" cy="0" r="2.5" fill="#dc2626" />
        <line x1="0" y1="-2.5" x2="0" y2="-10" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" />
        {[-3,0,3].map((dx, i) => <circle key={i} cx={dx} cy="-10" r="1.2" fill="#fbbf24" />)}
      </g>
    </svg>
  );
};

// ── 5: Lavendel ───────────────────────────────────────────────────────────────
const Lavendel = ({ p }: { p: number }) => {
  const tip = GY - STEM_LEN * p;
  const buds = [0, 7, 14, 21, 28, 35, 42];
  return (
    <svg viewBox="0 0 100 170" className="w-full h-full">
      <Soil />
      <ellipse cx="50" cy="143" rx="5" ry="3.5" fill="#7a5c2e" opacity={Math.max(0, 1 - p / 0.07)} />
      {p > 0.03 && <line x1="50" y1={GY} x2="50" y2={tip} stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" />}
      {/* Smalle grassprietachtige bladeren */}
      <g opacity={lo(p, 0.25)} transform={`translate(50,${GY - STEM_LEN * 0.28})`}>
        <ellipse cx="-6" cy="0" rx="9" ry="3.5" fill="#6b7280" transform="rotate(-30)" />
      </g>
      <g opacity={lo(p, 0.42)} transform={`translate(50,${GY - STEM_LEN * 0.44})`}>
        <ellipse cx="6" cy="0" rx="9" ry="3.5" fill="#6b7280" transform="rotate(30)" />
      </g>
      {/* Lavendel bloempjes langs de top */}
      {buds.map((dy, i) => (
        <ellipse
          key={i}
          cx={50 + (i % 2 === 0 ? 3 : -3)}
          cy={tip + dy}
          rx="3.5"
          ry="5"
          fill="#7c3aed"
          opacity={lo(p, 0.72 + i * 0.02)}
        />
      ))}
      {buds.map((dy, i) => (
        <ellipse
          key={`d${i}`}
          cx={50 + (i % 2 === 0 ? -3 : 3)}
          cy={tip + dy + 3}
          rx="2.5"
          ry="4"
          fill="#a855f7"
          opacity={lo(p, 0.75 + i * 0.02)}
        />
      ))}
    </svg>
  );
};

// ── 6: Cactus ─────────────────────────────────────────────────────────────────
const Cactus = ({ p }: { p: number }) => {
  const bodyH = STEM_LEN * p;
  const tipY = GY - bodyH;
  const loP = (t: number) => lo(p, t);
  return (
    <svg viewBox="0 0 100 170" className="w-full h-full">
      <Soil />
      <ellipse cx="50" cy="143" rx="5" ry="3.5" fill="#7a5c2e" opacity={Math.max(0, 1 - p / 0.07)} />
      {/* Cactus lichaam */}
      {p > 0.03 && (
        <rect x="43" y={tipY} width="14" height={bodyH} rx="7" fill="#15803d" />
      )}
      {/* Ribben */}
      {p > 0.1 && (
        <>
          <line x1="50" y1={tipY} x2="50" y2={GY} stroke="#166534" strokeWidth="1" opacity="0.4" />
          <line x1="47" y1={tipY} x2="47" y2={GY} stroke="#166534" strokeWidth="0.5" opacity="0.25" />
          <line x1="53" y1={tipY} x2="53" y2={GY} stroke="#166534" strokeWidth="0.5" opacity="0.25" />
        </>
      )}
      {/* Stekels */}
      {Array.from({ length: Math.min(6, Math.floor(p * 8)) }, (_, i) => {
        const y = GY - (bodyH * (i + 1) / 7);
        return (
          <g key={i}>
            <line x1="43" y1={y} x2="37" y2={y - 3} stroke="#14532d" strokeWidth="1" strokeLinecap="round" />
            <line x1="57" y1={y} x2="63" y2={y - 3} stroke="#14532d" strokeWidth="1" strokeLinecap="round" />
          </g>
        );
      })}
      {/* Linker arm */}
      <g opacity={loP(0.55)}>
        <path d={`M43 ${GY - bodyH * 0.52} Q32 ${GY - bodyH * 0.54} 32 ${GY - bodyH * 0.68}`}
          fill="none" stroke="#15803d" strokeWidth="10" strokeLinecap="round" />
        <line x1="27" y1={GY - bodyH * 0.58} x2="24" y2={GY - bodyH * 0.60} stroke="#14532d" strokeWidth="1" strokeLinecap="round" />
        <line x1="27" y1={GY - bodyH * 0.64} x2="24" y2={GY - bodyH * 0.67} stroke="#14532d" strokeWidth="1" strokeLinecap="round" />
      </g>
      {/* Rechter arm */}
      <g opacity={loP(0.70)}>
        <path d={`M57 ${GY - bodyH * 0.65} Q68 ${GY - bodyH * 0.67} 68 ${GY - bodyH * 0.80}`}
          fill="none" stroke="#15803d" strokeWidth="9" strokeLinecap="round" />
        <line x1="73" y1={GY - bodyH * 0.72} x2="76" y2={GY - bodyH * 0.74} stroke="#14532d" strokeWidth="1" strokeLinecap="round" />
      </g>
      {/* Bloemetje op top */}
      <g opacity={loP(0.92)} transform={`translate(50,${tipY})`}>
        {[0,72,144,216,288].map(a => (
          <ellipse key={a} cx="0" cy="-7" rx="4" ry="6.5" fill="#fb7185" transform={`rotate(${a})`} />
        ))}
        <circle cx="0" cy="0" r="4.5" fill="#fbbf24" />
      </g>
    </svg>
  );
};

// ── 7: Roos ───────────────────────────────────────────────────────────────────
const Roos = ({ p }: { p: number }) => {
  const tip = GY - STEM_LEN * p;
  return (
    <svg viewBox="0 0 100 170" className="w-full h-full">
      <Soil />
      <ellipse cx="50" cy="143" rx="5" ry="3.5" fill="#7a5c2e" opacity={Math.max(0, 1 - p / 0.07)} />
      {p > 0.03 && <line x1="50" y1={GY} x2="50" y2={tip} stroke="#4a7828" strokeWidth="3.5" strokeLinecap="round" />}
      {/* Doornachtige bladeren */}
      <g opacity={lo(p, 0.28)} transform={`translate(50,${GY - STEM_LEN * 0.30})`}>
        <ellipse cx="-9" cy="0" rx="13" ry="5" fill="#3d8020" transform="rotate(-25)" />
        <line x1="0" y1="0" x2="-16" y2="3" stroke="#3d8020" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      <g opacity={lo(p, 0.50)} transform={`translate(50,${GY - STEM_LEN * 0.55})`}>
        <ellipse cx="9" cy="0" rx="12" ry="5" fill="#3d8020" transform="rotate(25)" />
        <line x1="0" y1="0" x2="16" y2="3" stroke="#3d8020" strokeWidth="1.5" strokeLinecap="round" />
      </g>
      {/* Buitenste laag - 5 grote bloemblaadjes */}
      <g opacity={lo(p, 0.90)} transform={`translate(50,${tip})`}>
        {Array.from({ length: 5 }, (_, i) => i * 72).map(a => (
          <ellipse key={a} cx="0" cy="-11" rx="7" ry="10" fill="#fb7185" opacity="0.7" transform={`rotate(${a})`} />
        ))}
      </g>
      {/* Middelste laag - 5 kleinere */}
      <g opacity={lo(p, 0.93)} transform={`translate(50,${tip})`}>
        {Array.from({ length: 5 }, (_, i) => i * 72 + 36).map(a => (
          <ellipse key={a} cx="0" cy="-7" rx="5.5" ry="8" fill="#f43f5e" opacity="0.85" transform={`rotate(${a})`} />
        ))}
      </g>
      {/* Binnenste kern */}
      <g opacity={lo(p, 0.95)} transform={`translate(50,${tip})`}>
        {Array.from({ length: 4 }, (_, i) => i * 90 + 22).map(a => (
          <ellipse key={a} cx="0" cy="-4" rx="3.5" ry="5.5" fill="#be123c" opacity="0.9" transform={`rotate(${a})`} />
        ))}
        <circle cx="0" cy="0" r="3.5" fill="#9f1239" />
      </g>
    </svg>
  );
};

// ── Hoofdcomponent ────────────────────────────────────────────────────────────
const PLANTS = [RozeBloem, Zonnebloem, Tulp, Madeliefje, Hibiscus, Lavendel, Cactus, Roos];

export const PlantSVG = ({ progress, variant = 0 }: { progress: number; variant?: PlantVariant }) => {
  const Plant = PLANTS[variant];
  return <Plant p={Math.max(0, Math.min(1, progress))} />;
};
