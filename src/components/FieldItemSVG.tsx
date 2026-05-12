export type FieldItemType =
  | "vlinder"     | "waterkan"   | "huis"       | "brievenbus"
  | "moestuin"    | "paddenstoel"| "vogelhuisje"| "perkje"
  | "kikker"      | "schommel"   | "boom"       | "regenboog"
  | "vlindertuin" | "fontein"    | "villa"      | "goudbrievenbus"
  | "kas"         | "paddestoelring" | "voliere" | "rozentuin"
  | "vijver"      | "speeltuin"  | "boomhut"    | "goudregenboog";

export const VELD_ITEMS: {
  type: FieldItemType; label: string; desc: string; w: number; h: number; replaces?: FieldItemType;
}[] = [
  { type: "vlinder",      label: "Vlinder",       desc: "Een kleurrijke vlinder",         w: 90,  h: 80  },
  { type: "waterkan",     label: "Waterkan",      desc: "Een gieter voor de bloemen",     w: 80,  h: 80  },
  { type: "huis",         label: "Huis",          desc: "Een gezellig huis",              w: 140, h: 130 },
  { type: "brievenbus",   label: "Brievenbus",    desc: "Een rode brievenbus",            w: 70,  h: 100 },
  { type: "moestuin",     label: "Moestuin",      desc: "Een groentetuin vol oogst",      w: 140, h: 100 },
  { type: "paddenstoel",  label: "Paddenstoel",   desc: "Een rood paddenstoeltje",        w: 80,  h: 100 },
  { type: "vogelhuisje",  label: "Vogelhuisje",   desc: "Een knus huisje voor vogels",    w: 80,  h: 110 },
  { type: "perkje",       label: "Perkje",        desc: "Een vrolijk bloemenperkie",      w: 120, h: 80  },
  { type: "kikker",       label: "Kikker",        desc: "Een vrolijke groene kikker",     w: 90,  h: 80  },
  { type: "schommel",     label: "Schommel",      desc: "Een houten schommelsetje",       w: 110, h: 120 },
  { type: "boom",         label: "Boom",          desc: "Een grote groene boom",          w: 140, h: 180 },
  { type: "regenboog",    label: "Regenboog",     desc: "Een kleurrijke regenboog",       w: 210, h: 130 },
  // ── Ronde 2: luxe upgrades ─────────────────────────────────────────────
  { type: "vlindertuin",    label: "Vlindertuin",       desc: "Een boog vol vlinders en bloemen",     w: 160, h: 130, replaces: "vlinder"      },
  { type: "fontein",        label: "Fontein",           desc: "Een marmeren spuitfontein",            w: 120, h: 150, replaces: "waterkan"     },
  { type: "villa",          label: "Villa",             desc: "Een statige herenwoning",              w: 190, h: 170, replaces: "huis"         },
  { type: "goudbrievenbus", label: "Gouden brievenbus", desc: "Een sierlijke gouden brievenbus",      w: 90,  h: 120, replaces: "brievenbus"   },
  { type: "kas",            label: "Kas",               desc: "Een glazen kas vol planten",           w: 170, h: 140, replaces: "moestuin"     },
  { type: "paddestoelring", label: "Elfenring",         desc: "Een magische kring van paddenstoelen", w: 170, h: 110, replaces: "paddenstoel"  },
  { type: "voliere",        label: "Volière",           desc: "Een sierlijke vogelkooi",              w: 130, h: 150, replaces: "vogelhuisje"  },
  { type: "rozentuin",      label: "Rozentuin",         desc: "Een weelderige rozentuin",             w: 170, h: 130, replaces: "perkje"       },
  { type: "vijver",         label: "Vijver",            desc: "Een siervijver met waterlelies",       w: 190, h: 130, replaces: "kikker"       },
  { type: "speeltuin",      label: "Speeltuin",         desc: "Een complete speeltuin",               w: 190, h: 170, replaces: "schommel"     },
  { type: "boomhut",        label: "Boomhut",           desc: "Een avontuurlijke boomhut",            w: 170, h: 210, replaces: "boom"         },
  { type: "goudregenboog",  label: "Gouden regenboog",  desc: "Een regenboog met pot van goud",       w: 240, h: 160, replaces: "regenboog"    },
];

// ── Vogelhuisje ───────────────────────────────────────────────────────────────
const Vogelhuisje = () => (
  <svg viewBox="0 0 80 110" className="w-full h-full">
    {/* Post */}
    <rect x="35" y="72" width="10" height="38" rx="3" fill="#7a5120" />
    {/* Body */}
    <rect x="12" y="40" width="56" height="36" rx="5" fill="#c4813a" />
    {/* Roof */}
    <polygon points="6,42 40,12 74,42" fill="#7c3d1a" />
    <polygon points="6,42 40,16 74,42" fill="#8b4820" opacity="0.4" />
    {/* Entrance hole */}
    <circle cx="40" cy="57" r="9" fill="#2d1600" />
    <circle cx="40" cy="57" r="7" fill="#1a0c00" />
    {/* Perch */}
    <rect x="32" y="68" width="16" height="4" rx="2" fill="#7a5120" />
    {/* Window details */}
    <line x1="12" y1="55" x2="68" y2="55" stroke="#a06828" strokeWidth="1" opacity="0.4" />
  </svg>
);

// ── Perkje ────────────────────────────────────────────────────────────────────
const Perkje = () => (
  <svg viewBox="0 0 120 80" className="w-full h-full">
    {/* Earth */}
    <rect x="5" y="48" width="110" height="28" rx="10" fill="#7a4f28" />
    <rect x="5" y="44" width="110" height="12" rx="7" fill="#8b5e32" />
    {/* Stems */}
    {[20, 40, 60, 80, 100].map((x, i) => (
      <line key={i} x1={x} y1={44} x2={x + (i % 2 === 0 ? -3 : 3)} y2={22} stroke="#4a7828" strokeWidth="2.5" strokeLinecap="round" />
    ))}
    {/* Flower heads */}
    {[
      { x: 17, c: "#f472b6" }, { x: 37, c: "#fbbf24" }, { x: 57, c: "#f87171" },
      { x: 77, c: "#a78bfa" }, { x: 97, c: "#34d399" },
    ].map(({ x, c }, i) => (
      <g key={i} transform={`translate(${x},20)`}>
        {[0, 60, 120, 180, 240, 300].map(a => (
          <ellipse key={a} cx="0" cy="-6" rx="3" ry="5" fill={c} transform={`rotate(${a})`} />
        ))}
        <circle cx="0" cy="0" r="4" fill="#fbbf24" />
      </g>
    ))}
  </svg>
);

// ── Vlinder ───────────────────────────────────────────────────────────────────
const Vlinder = () => (
  <svg viewBox="0 0 90 80" className="w-full h-full">
    {/* Upper wings */}
    <path d="M45,40 Q20,10 10,25 Q5,40 45,42" fill="#f97316" opacity="0.9" />
    <path d="M45,40 Q70,10 80,25 Q85,40 45,42" fill="#f97316" opacity="0.9" />
    {/* Wing patterns */}
    <circle cx="25" cy="32" r="7" fill="#fbbf24" opacity="0.7" />
    <circle cx="65" cy="32" r="7" fill="#fbbf24" opacity="0.7" />
    <circle cx="22" cy="28" r="3" fill="#7c2d12" opacity="0.5" />
    <circle cx="68" cy="28" r="3" fill="#7c2d12" opacity="0.5" />
    {/* Lower wings */}
    <path d="M45,42 Q18,45 15,58 Q22,72 45,55" fill="#fb923c" opacity="0.85" />
    <path d="M45,42 Q72,45 75,58 Q68,72 45,55" fill="#fb923c" opacity="0.85" />
    {/* Body */}
    <ellipse cx="45" cy="47" rx="3.5" ry="14" fill="#1c1917" />
    <circle cx="45" cy="34" r="4" fill="#292524" />
    {/* Antennae */}
    <path d="M43,33 Q36,22 31,18" fill="none" stroke="#1c1917" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="31" cy="18" r="2.5" fill="#1c1917" />
    <path d="M47,33 Q54,22 59,18" fill="none" stroke="#1c1917" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="59" cy="18" r="2.5" fill="#1c1917" />
  </svg>
);

// ── Paddenstoel ───────────────────────────────────────────────────────────────
const Paddenstoel = () => (
  <svg viewBox="0 0 80 100" className="w-full h-full">
    {/* Stem */}
    <path d="M28,90 Q26,68 30,60 Q38,55 42,55 Q50,55 52,60 Q56,68 52,90 Z" fill="#fef9c3" />
    <path d="M30,85 Q32,70 30,65" fill="none" stroke="#fef08a" strokeWidth="1.5" opacity="0.5" />
    {/* Cap */}
    <ellipse cx="41" cy="52" rx="34" ry="8" fill="#dc2626" opacity="0.3" />
    <path d="M7,52 Q10,20 41,16 Q72,20 75,52 Z" fill="#dc2626" />
    <path d="M10,50 Q12,22 41,18 Q70,22 72,50" fill="#ef4444" opacity="0.4" />
    {/* Spots */}
    {[
      { cx: 25, cy: 38, r: 6 }, { cx: 57, cy: 36, r: 5 },
      { cx: 40, cy: 26, r: 4 }, { cx: 18, cy: 48, r: 4 },
      { cx: 62, cy: 46, r: 3.5 },
    ].map((s, i) => (
      <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="white" opacity="0.9" />
    ))}
    {/* Ground shadow */}
    <ellipse cx="41" cy="92" rx="26" ry="6" fill="#5c3d1a" opacity="0.25" />
  </svg>
);

// ── Boom ──────────────────────────────────────────────────────────────────────
const Boom = () => (
  <svg viewBox="0 0 100 140" className="w-full h-full">
    {/* Trunk */}
    <rect x="42" y="90" width="16" height="50" rx="5" fill="#7a5120" />
    <rect x="46" y="95" width="4" height="40" rx="2" fill="#8b6428" opacity="0.4" />
    {/* Crown layers */}
    <circle cx="50" cy="70" r="36" fill="#15803d" />
    <circle cx="32" cy="80" r="26" fill="#166534" />
    <circle cx="68" cy="80" r="26" fill="#166534" />
    <circle cx="50" cy="55" r="28" fill="#16a34a" />
    <circle cx="50" cy="52" r="24" fill="#22c55e" />
    {/* Highlights */}
    <circle cx="42" cy="44" r="10" fill="#4ade80" opacity="0.3" />
    {/* Apples */}
    <circle cx="36" cy="74" r="5" fill="#ef4444" />
    <circle cx="60" cy="68" r="4.5" fill="#dc2626" />
    <circle cx="50" cy="82" r="4" fill="#f87171" />
    {/* Apple stems */}
    <line x1="36" y1="69" x2="38" y2="66" stroke="#4a7828" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="60" y1="63" x2="62" y2="60" stroke="#4a7828" strokeWidth="1.5" strokeLinecap="round" />
    {/* Ground shadow */}
    <ellipse cx="50" cy="138" rx="22" ry="5" fill="#365314" opacity="0.3" />
  </svg>
);

// ── Kikker ────────────────────────────────────────────────────────────────────
const Kikker = () => (
  <svg viewBox="0 0 90 80" className="w-full h-full">
    {/* Back legs */}
    <ellipse cx="20" cy="65" rx="14" ry="8" fill="#16a34a" transform="rotate(-20 20 65)" />
    <ellipse cx="70" cy="65" rx="14" ry="8" fill="#16a34a" transform="rotate(20 70 65)" />
    {/* Feet */}
    <ellipse cx="12" cy="70" rx="10" ry="5" fill="#15803d" />
    <ellipse cx="78" cy="70" rx="10" ry="5" fill="#15803d" />
    {/* Body */}
    <ellipse cx="45" cy="55" rx="30" ry="22" fill="#22c55e" />
    <ellipse cx="45" cy="52" rx="26" ry="18" fill="#4ade80" opacity="0.5" />
    {/* Belly */}
    <ellipse cx="45" cy="58" rx="18" ry="12" fill="#86efac" opacity="0.7" />
    {/* Front legs */}
    <ellipse cx="18" cy="58" rx="8" ry="5" fill="#16a34a" transform="rotate(-30 18 58)" />
    <ellipse cx="72" cy="58" rx="8" ry="5" fill="#16a34a" transform="rotate(30 72 58)" />
    {/* Eyes */}
    <circle cx="32" cy="36" r="11" fill="#22c55e" />
    <circle cx="58" cy="36" r="11" fill="#22c55e" />
    <circle cx="32" cy="36" r="8" fill="#f0fdf4" />
    <circle cx="58" cy="36" r="8" fill="#f0fdf4" />
    <circle cx="33" cy="36" r="5" fill="#1c1917" />
    <circle cx="59" cy="36" r="5" fill="#1c1917" />
    <circle cx="34" cy="35" r="2" fill="white" />
    <circle cx="60" cy="35" r="2" fill="white" />
    {/* Smile */}
    <path d="M33,52 Q45,60 57,52" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" />
    {/* Nostrils */}
    <circle cx="41" cy="47" r="2" fill="#16a34a" />
    <circle cx="49" cy="47" r="2" fill="#16a34a" />
  </svg>
);

// ── Regenboog ─────────────────────────────────────────────────────────────────
const Regenboog = () => (
  <svg viewBox="0 0 150 90" className="w-full h-full">
    {/* Clouds */}
    <g>
      <circle cx="16" cy="68" r="12" fill="white" />
      <circle cx="28" cy="62" r="14" fill="white" />
      <circle cx="42" cy="65" r="11" fill="white" />
    </g>
    <g>
      <circle cx="134" cy="68" r="12" fill="white" />
      <circle cx="122" cy="62" r="14" fill="white" />
      <circle cx="108" cy="65" r="11" fill="white" />
    </g>
    {/* Rainbow arcs — outermost to innermost */}
    {[
      { r: 68, sw: 10, c: "#ef4444" },
      { r: 56, sw: 10, c: "#f97316" },
      { r: 44, sw: 10, c: "#fbbf24" },
      { r: 32, sw: 10, c: "#4ade80" },
      { r: 20, sw: 10, c: "#60a5fa" },
    ].map(({ r, sw, c }, i) => (
      <path
        key={i}
        d={`M ${75 - r},72 A ${r},${r} 0 0,1 ${75 + r},72`}
        fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round"
        opacity="0.9"
      />
    ))}
    {/* Cloud overlap on rainbow ends */}
    <ellipse cx="28" cy="68" rx="24" ry="16" fill="white" />
    <ellipse cx="122" cy="68" rx="24" ry="16" fill="white" />
  </svg>
);

// ── Schommel ──────────────────────────────────────────────────────────────────
const Schommel = () => (
  <svg viewBox="0 0 110 120" className="w-full h-full">
    {/* Left post */}
    <line x1="15" y1="110" x2="38" y2="18" stroke="#7a5120" strokeWidth="7" strokeLinecap="round" />
    {/* Right post */}
    <line x1="95" y1="110" x2="72" y2="18" stroke="#7a5120" strokeWidth="7" strokeLinecap="round" />
    {/* Top bar */}
    <rect x="35" y="14" width="40" height="9" rx="4" fill="#7a5120" />
    {/* Left leg brace */}
    <line x1="10" y1="105" x2="25" y2="80" stroke="#7a5120" strokeWidth="5" strokeLinecap="round" />
    {/* Right leg brace */}
    <line x1="100" y1="105" x2="85" y2="80" stroke="#7a5120" strokeWidth="5" strokeLinecap="round" />
    {/* Ropes */}
    <line x1="46" y1="20" x2="42" y2="72" stroke="#a37a3a" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="64" y1="20" x2="68" y2="72" stroke="#a37a3a" strokeWidth="2.5" strokeLinecap="round" />
    {/* Seat */}
    <rect x="38" y="70" width="34" height="8" rx="4" fill="#c4813a" />
    {/* Ground shadow */}
    <ellipse cx="55" cy="113" rx="38" ry="5" fill="#365314" opacity="0.22" />
  </svg>
);

// ── Brievenbus ────────────────────────────────────────────────────────────────
const Brievenbus = () => (
  <svg viewBox="0 0 70 100" className="w-full h-full">
    {/* Post */}
    <rect x="30" y="68" width="10" height="32" rx="3" fill="#6b7280" />
    {/* Body */}
    <rect x="10" y="28" width="50" height="44" rx="6" fill="#dc2626" />
    {/* Dome top */}
    <ellipse cx="35" cy="28" rx="25" ry="10" fill="#b91c1c" />
    <path d="M10,28 Q10,18 35,14 Q60,18 60,28" fill="#ef4444" />
    {/* Mail slot */}
    <rect x="18" y="52" width="34" height="5" rx="2.5" fill="#991b1b" />
    {/* Door line */}
    <line x1="35" y1="28" x2="35" y2="72" stroke="#b91c1c" strokeWidth="1.5" opacity="0.5" />
    {/* Royal emblem placeholder */}
    <circle cx="35" cy="42" r="8" fill="#b91c1c" />
    <text x="35" y="46" textAnchor="middle" fontSize="10" fill="#fbbf24" fontWeight="bold">✦</text>
    {/* Ground shadow */}
    <ellipse cx="35" cy="98" rx="20" ry="4" fill="#365314" opacity="0.2" />
  </svg>
);

// ── Waterkan ──────────────────────────────────────────────────────────────────
const Waterkan = () => (
  <svg viewBox="0 0 80 80" className="w-full h-full">
    {/* Body */}
    <path d="M18,30 Q16,68 22,72 L54,72 Q62,68 60,30 Z" fill="#3b82f6" />
    <path d="M18,30 Q16,68 22,72 L54,72 Q62,68 60,30 Z" fill="#60a5fa" opacity="0.4" />
    {/* Top opening */}
    <ellipse cx="39" cy="30" rx="21" ry="7" fill="#2563eb" />
    <ellipse cx="39" cy="30" rx="18" ry="5" fill="#3b82f6" />
    {/* Handle */}
    <path d="M60,38 Q78,38 78,52 Q78,66 60,64" fill="none" stroke="#2563eb" strokeWidth="6" strokeLinecap="round" />
    {/* Spout */}
    <path d="M18,36 Q4,34 4,28 Q8,20 16,24" fill="none" stroke="#2563eb" strokeWidth="6" strokeLinecap="round" />
    {/* Spout head / rose */}
    <circle cx="8" cy="24" r="7" fill="#1d4ed8" />
    {/* Water drops */}
    {[[5,14],[9,10],[13,13]].map(([x,y],i) => (
      <ellipse key={i} cx={x} cy={y} rx="1.8" ry="3" fill="#7dd3fc" opacity="0.8" />
    ))}
    {/* Shine */}
    <ellipse cx="30" cy="44" rx="5" ry="12" fill="white" opacity="0.15" transform="rotate(-10 30 44)" />
    {/* Ground shadow */}
    <ellipse cx="38" cy="75" rx="22" ry="4" fill="#365314" opacity="0.2" />
  </svg>
);

// ── Hoofdcomponent ────────────────────────────────────────────────────────────
// ── Huis ──────────────────────────────────────────────────────────────────────
const Huis = () => (
  <svg viewBox="0 0 140 130" className="w-full h-full">
    {/* Fundament */}
    <rect x="10" y="75" width="120" height="50" rx="3" fill="#d4a96a" />
    {/* Bakstenen patroon */}
    {[0,1,2].map(row => [0,1,2,3].map(col => (
      <rect key={`${row}-${col}`}
        x={12 + col * 30 + (row % 2 === 0 ? 0 : 15)} y={77 + row * 16}
        width={26} height={12} rx="1.5"
        fill={row % 2 === 0 ? "#c8945a" : "#bf8550"} opacity="0.7" />
    )))}
    {/* Dak */}
    <polygon points="4,78 70,18 136,78" fill="#8b3a1a" />
    <polygon points="4,78 70,22 136,78" fill="#a04020" opacity="0.5" />
    {/* Dakrand */}
    <rect x="2" y="74" width="136" height="7" rx="3" fill="#7c2e14" />
    {/* Schoorsteen */}
    <rect x="88" y="26" width="16" height="36" rx="3" fill="#c8945a" />
    <rect x="86" y="24" width="20" height="6" rx="2" fill="#a07040" />
    {/* Rook */}
    <path d="M96,22 Q91,14 96,8 Q101,2 96,-2" fill="none" stroke="#ccc" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
    {/* Deur */}
    <rect x="55" y="90" width="30" height="35" rx="4" fill="#6b3a1f" />
    <rect x="57" y="92" width="26" height="30" rx="3" fill="#7d4a2a" />
    <circle cx="82" cy="108" r="3" fill="#d4a028" />
    {/* Linker raam */}
    <rect x="16" y="84" width="28" height="22" rx="3" fill="#93c5fd" />
    <line x1="30" y1="84" x2="30" y2="106" stroke="white" strokeWidth="1.5" />
    <line x1="16" y1="95" x2="44" y2="95" stroke="white" strokeWidth="1.5" />
    {/* Rechter raam */}
    <rect x="96" y="84" width="28" height="22" rx="3" fill="#93c5fd" />
    <line x1="110" y1="84" x2="110" y2="106" stroke="white" strokeWidth="1.5" />
    <line x1="96" y1="95" x2="124" y2="95" stroke="white" strokeWidth="1.5" />
    {/* Pad */}
    <rect x="60" y="124" width="20" height="6" rx="2" fill="#c8a870" opacity="0.6" />
    {/* Grond schaduw */}
    <ellipse cx="70" cy="128" rx="50" ry="5" fill="#365314" opacity="0.2" />
  </svg>
);

// ── Moestuin ──────────────────────────────────────────────────────────────────
const Moestuin = () => (
  <svg viewBox="0 0 140 100" className="w-full h-full">
    {/* Houten rand */}
    <rect x="5" y="42" width="130" height="52" rx="6" fill="#7a5120" />
    <rect x="8" y="45" width="124" height="46" rx="4" fill="#5c3a14" />
    {/* Aarde */}
    <rect x="10" y="47" width="120" height="42" rx="3" fill="#7a4f28" />
    <rect x="10" y="47" width="120" height="8" rx="3" fill="#8b5e32" opacity="0.6" />
    {/* Plankjes horizontaal */}
    <line x1="8" y1="68" x2="132" y2="68" stroke="#6b3d10" strokeWidth="2" opacity="0.4" />
    {/* Wortel 1 */}
    <line x1="28" y1="47" x2="28" y2="30" stroke="#4a7828" strokeWidth="2" strokeLinecap="round" />
    <path d="M22,28 Q28,20 34,28" fill="none" stroke="#4a7828" strokeWidth="2" strokeLinecap="round" />
    <ellipse cx="22" cy="26" rx="6" ry="4" fill="#4a7828" />
    <ellipse cx="34" cy="26" rx="6" ry="4" fill="#4a7828" />
    <ellipse cx="28" cy="22" rx="5" ry="4" fill="#4a7828" />
    <line x1="28" y1="55" x2="26" y2="65" stroke="#e05a1a" strokeWidth="3" strokeLinecap="round" />
    <line x1="28" y1="55" x2="30" y2="65" stroke="#e05a1a" strokeWidth="3" strokeLinecap="round" />
    {/* Tomatenplant */}
    <line x1="70" y1="47" x2="70" y2="20" stroke="#4a7828" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="60" cy="32" r="7" fill="#22c55e" />
    <circle cx="78" cy="28" r="7" fill="#22c55e" />
    <circle cx="70" cy="22" r="6" fill="#4ade80" />
    <circle cx="58" cy="38" r="6" fill="#ef4444" />
    <circle cx="76" cy="34" r="5" fill="#dc2626" />
    <circle cx="66" cy="42" r="5" fill="#f87171" />
    {/* Sla */}
    <ellipse cx="112" cy="46" rx="18" ry="10" fill="#4ade80" />
    <ellipse cx="112" cy="44" rx="14" ry="8" fill="#22c55e" />
    <ellipse cx="112" cy="42" rx="10" ry="6" fill="#4ade80" />
    <ellipse cx="112" cy="40" rx="7" ry="5" fill="#86efac" />
    {/* Bordje */}
    <rect x="46" y="28" width="18" height="12" rx="2" fill="#c4813a" />
    <line x1="55" y1="40" x2="55" y2="50" stroke="#7a5120" strokeWidth="2" />
    <line x1="48" y1="31" x2="62" y2="31" stroke="white" strokeWidth="1" opacity="0.6" />
    <line x1="48" y1="35" x2="62" y2="35" stroke="white" strokeWidth="1" opacity="0.6" />
  </svg>
);

// ── Vlindertuin ───────────────────────────────────────────────────────────────
const Vlindertuin = () => (
  <svg viewBox="0 0 160 130" className="w-full h-full">
    {/* Boog */}
    <path d="M10,120 Q10,20 80,15 Q150,20 150,120" fill="none" stroke="#7a5120" strokeWidth="7" strokeLinecap="round"/>
    {/* Klimplant */}
    {[0.2,0.4,0.6,0.8].map((t,i)=>{
      const x=10+(150-10)*t*0.5+(i%2===0?-8:8); const y=120-(120-15)*t;
      return <ellipse key={i} cx={x} cy={y} rx="8" ry="5" fill="#4ade80" transform={`rotate(${i%2===0?-30:30} ${x} ${y})`} opacity="0.85"/>;
    })}
    {[0.25,0.5,0.75,0.9].map((t,i)=>{
      const x=150-(150-10)*t*0.5+(i%2===0?8:-8); const y=120-(120-15)*t;
      return <ellipse key={i} cx={x} cy={y} rx="8" ry="5" fill="#4ade80" transform={`rotate(${i%2===0?30:-30} ${x} ${y})`} opacity="0.85"/>;
    })}
    {/* Vlinders */}
    {[{x:40,y:50,c:"#f97316"},{x:80,y:25,c:"#a855f7"},{x:120,y:48,c:"#ec4899"},{x:60,y:80,c:"#fbbf24"}].map(({x,y,c},i)=>(
      <g key={i}>
        <path d={`M${x},${y} Q${x-14},${y-10} ${x-10},${y+8}`} fill={c} opacity="0.88"/>
        <path d={`M${x},${y} Q${x+14},${y-10} ${x+10},${y+8}`} fill={c} opacity="0.88"/>
        <path d={`M${x},${y} Q${x-8},${y+6} ${x-6},${y+16}`} fill={c} opacity="0.7"/>
        <path d={`M${x},${y} Q${x+8},${y+6} ${x+6},${y+16}`} fill={c} opacity="0.7"/>
        <ellipse cx={x} cy={y+4} rx="2" ry="7" fill="#1c1917"/>
      </g>
    ))}
    {/* Bloemen aan voet */}
    {[20,50,80,110,140].map((x,i)=>(
      <g key={i}>
        <line x1={x} y1="120" x2={x} y2="105" stroke="#4a7828" strokeWidth="2"/>
        {[0,60,120,180,240,300].map(a=>(
          <ellipse key={a} cx={x} cy={102} rx="4" ry="6" fill={["#f472b6","#fbbf24","#f87171","#a78bfa","#34d399"][i%5]} transform={`rotate(${a} ${x} 105)`}/>
        ))}
        <circle cx={x} cy="105" r="3" fill="#fbbf24"/>
      </g>
    ))}
  </svg>
);

// ── Fontein ───────────────────────────────────────────────────────────────────
const Fontein = () => (
  <svg viewBox="0 0 120 150" className="w-full h-full">
    {/* Basis */}
    <ellipse cx="60" cy="135" rx="45" ry="12" fill="#94a3b8"/>
    <path d="M15,125 Q15,135 60,138 Q105,135 105,125 Q105,118 60,116 Q15,118 15,125Z" fill="#cbd5e1"/>
    {/* Grote kom */}
    <path d="M20,120 Q20,130 60,132 Q100,130 100,120 L95,108 Q95,100 60,98 Q25,100 25,108Z" fill="#e2e8f0"/>
    <path d="M25,108 Q25,116 60,118 Q95,116 95,108" fill="none" stroke="#93c5fd" strokeWidth="2" opacity="0.6"/>
    {/* Water in grote kom */}
    <ellipse cx="60" cy="110" rx="32" ry="8" fill="#7dd3fc" opacity="0.5"/>
    {/* Zuil */}
    <rect x="53" y="70" width="14" height="40" rx="4" fill="#cbd5e1"/>
    <rect x="51" y="106" width="18" height="5" rx="2" fill="#94a3b8"/>
    {/* Kleine kom */}
    <path d="M36,72 Q36,80 60,82 Q84,80 84,72 L80,62 Q80,56 60,54 Q40,56 40,62Z" fill="#e2e8f0"/>
    <ellipse cx="60" cy="64" rx="18" ry="6" fill="#7dd3fc" opacity="0.5"/>
    {/* Waterstralen */}
    <rect x="56" y="44" width="4" height="12" rx="2" fill="#93c5fd"/>
    {[[-14,50],[-8,42],[8,42],[14,50]].map(([dx,y],i)=>(
      <path key={i} d={`M60,44 Q${60+dx},${y} ${60+dx},${y+8}`} fill="none" stroke="#7dd3fc" strokeWidth="2.5" strokeLinecap="round"/>
    ))}
    {/* Druppels */}
    {[[-16,60],[-10,54],[10,54],[16,60]].map(([dx,y],i)=>(
      <ellipse key={i} cx={60+dx} cy={y} rx="2" ry="3" fill="#bae6fd" opacity="0.8"/>
    ))}
    {/* Sierlijk detail */}
    {[0,72,144,216,288].map(a=>(
      <ellipse key={a} cx={60+28*Math.cos((a-90)*Math.PI/180)} cy={115+8*Math.sin((a-90)*Math.PI/180)} rx="3" ry="2" fill="#94a3b8"/>
    ))}
  </svg>
);

// ── Villa ─────────────────────────────────────────────────────────────────────
const Villa = () => (
  <svg viewBox="0 0 190 170" className="w-full h-full">
    {/* Fundament */}
    <rect x="5" y="95" width="180" height="70" rx="3" fill="#e8d5b0"/>
    {/* Baksteen textuur */}
    {[0,1,2,3].map(row=>[0,1,2,3,4].map(col=>(
      <rect key={`${row}-${col}`} x={8+col*36+(row%2===0?0:18)} y={98+row*17} width={32} height={13} rx="1.5" fill={row%2===0?"#d4b87a":"#c8a860"} opacity="0.65"/>
    )))}
    {/* Verdieping */}
    <rect x="25" y="55" width="140" height="44" rx="2" fill="#f0e4c0"/>
    {/* Dak */}
    <polygon points="0,58 95,8 190,58" fill="#6b2d10"/>
    <polygon points="0,58 95,13 190,58" fill="#843515" opacity="0.4"/>
    <rect x="0" y="54" width="190" height="8" rx="2" fill="#5c2208"/>
    {/* Dakkapellen */}
    {[55,135].map((x,i)=>(
      <g key={i}>
        <polygon points={`${x-16},56 ${x},32 ${x+16},56`} fill="#5c2208"/>
        <rect x={x-10} y={40} width={20} height={17} rx="2" fill="#93c5fd"/>
        <line x1={x} y1={40} x2={x} y2={57} stroke="white" strokeWidth="1.2"/>
        <line x1={x-10} y1={48} x2={x+10} y2={48} stroke="white" strokeWidth="1.2"/>
      </g>
    ))}
    {/* Zuilen */}
    {[28,52,138,162].map((x,i)=>(
      <g key={i}>
        <rect x={x} y={90} width={10} height={75} rx="3" fill="#ede0bc"/>
        <ellipse cx={x+5} cy={90} rx="7" ry="4" fill="#ddd0a0"/>
        <ellipse cx={x+5} cy={162} rx="7" ry="3" fill="#ddd0a0"/>
      </g>
    ))}
    {/* Grand deur */}
    <rect x="75" y="115" width="40" height="50" rx="5" fill="#5c3010"/>
    <path d="M75,130 Q95,118 115,130" fill="#6b3a18" opacity="0.5"/>
    <circle cx="82" cy="142" r="3.5" fill="#d4a020"/>
    <circle cx="108" cy="142" r="3.5" fill="#d4a020"/>
    <line x1="95" y1="115" x2="95" y2="165" stroke="#7a4520" strokeWidth="2"/>
    {/* Ramen begane grond */}
    {[14,136].map((x,i)=>(
      <g key={i}>
        <rect x={x} y={110} width={38} height={30} rx="3" fill="#bae6fd"/>
        <line x1={x+19} y1={110} x2={x+19} y2={140} stroke="white" strokeWidth="1.5"/>
        <line x1={x} y1={125} x2={x+38} y2={125} stroke="white" strokeWidth="1.5"/>
        <rect x={x} y={106} width={38} height={7} rx="2" fill="#a07840"/>
      </g>
    ))}
    {/* Ramen verdieping */}
    {[35,80,115,150].map((x,i)=>(
      <g key={i}>
        <rect x={x} y={62} width={24} height={18} rx="2" fill="#bae6fd"/>
        <line x1={x+12} y1={62} x2={x+12} y2={80} stroke="white" strokeWidth="1.2"/>
        <line x1={x} y1={71} x2={x+24} y2={71} stroke="white" strokeWidth="1.2"/>
      </g>
    ))}
    {/* Pad */}
    <rect x="80" y="162" width="30" height="8" rx="3" fill="#d4bc84" opacity="0.7"/>
    <ellipse cx="95" cy="168" rx="48" ry="5" fill="#365314" opacity="0.18"/>
  </svg>
);

// ── Gouden brievenbus ─────────────────────────────────────────────────────────
const Goudbrievenbus = () => (
  <svg viewBox="0 0 90 120" className="w-full h-full">
    <rect x="35" y="80" width="10" height="40" rx="3" fill="#a07830"/>
    <rect x="12" y="32" width="56" height="52" rx="6" fill="#d4a020"/>
    <path d="M12,32 Q12,20 40,16 Q68,20 68,32" fill="#e8b830"/>
    <ellipse cx="40" cy="32" rx="28" ry="10" fill="#f0c840" opacity="0.5"/>
    <rect x="20" y="58" width="36" height="5" rx="2.5" fill="#b88a10"/>
    <line x1="40" y1="32" x2="40" y2="84" stroke="#b88a10" strokeWidth="1.5" opacity="0.5"/>
    <circle cx="56" cy="52" r="4" fill="#f0c840"/>
    {/* Kroon */}
    <polygon points="25,16 30,6 35,14 40,4 45,14 50,6 55,16" fill="#f0c840"/>
    {/* Sterren */}
    {[[-12,-8],[12,-8],[0,-4]].map(([dx,dy],i)=>(
      <text key={i} x={40+dx} y={22+dy} textAnchor="middle" fontSize="8" fill="#fbbf24">✦</text>
    ))}
    <ellipse cx="40" cy="118" rx="20" ry="4" fill="#365314" opacity="0.2"/>
  </svg>
);

// ── Kas ───────────────────────────────────────────────────────────────────────
const Kas = () => (
  <svg viewBox="0 0 170 140" className="w-full h-full">
    {/* Fundament */}
    <rect x="5" y="95" width="160" height="40" rx="4" fill="#cbd5e1"/>
    {/* Glazen wanden */}
    <rect x="8" y="55" width="154" height="42" fill="#bfdbfe" opacity="0.4" stroke="#93c5fd" strokeWidth="1.5"/>
    {/* Glazen dak */}
    <polygon points="5,57 85,12 165,57" fill="#bfdbfe" opacity="0.5" stroke="#93c5fd" strokeWidth="1.5"/>
    {/* Dak panelen lijnen */}
    {[35,60,85,110,135].map((x,i)=>(
      <line key={i} x1={x} y1={57} x2={85+(x-85)*0.25} y2={14} stroke="#93c5fd" strokeWidth="1" opacity="0.7"/>
    ))}
    {/* Verticale raamspijlen */}
    {[40,75,110,145].map((x,i)=>(
      <line key={i} x1={x} y1={55} x2={x} y2={97} stroke="#93c5fd" strokeWidth="1.2" opacity="0.8"/>
    ))}
    {/* Planten binnen */}
    {[22,55,88,120,150].map((x,i)=>(
      <g key={i}>
        <rect x={x-5} y={82} width={10} height={14} rx="2" fill="#7a5120" opacity="0.7"/>
        <circle cx={x} cy={76} r={i===2?12:8} fill={["#4ade80","#22c55e","#16a34a","#4ade80","#22c55e"][i]}/>
        {i===2&&<circle cx={x} cy={72} r={6} fill="#4ade80"/>}
        {i%2===0&&<circle cx={x} cy={68} r={4} fill={["#f472b6","#fbbf24","#f87171"][i%3]}/>}
      </g>
    ))}
    {/* Deur */}
    <rect x="73" y="68" width="24" height="29" rx="3" fill="#7dd3fc" opacity="0.6" stroke="#93c5fd" strokeWidth="1.5"/>
    <circle cx="94" cy="83" r="2.5" fill="#475569"/>
    <ellipse cx="85" cy="133" rx="55" ry="5" fill="#365314" opacity="0.2"/>
  </svg>
);

// ── Paddestoelring ────────────────────────────────────────────────────────────
const Paddestoelring = () => (
  <svg viewBox="0 0 170 110" className="w-full h-full">
    {/* Gras cirkel */}
    <ellipse cx="85" cy="88" rx="70" ry="18" fill="#22c55e" opacity="0.3"/>
    {/* 7 paddenstoelen in een ring */}
    {[0,51,103,154,205,257,308].map((deg,i)=>{
      const rad=(deg-90)*Math.PI/180;
      const rx=58,ry=22;
      const cx=85+rx*Math.cos(rad), cy=68+ry*Math.sin(rad);
      const scale=0.7+0.3*Math.sin(i*0.9);
      const colors=["#dc2626","#f97316","#a855f7","#dc2626","#ec4899","#f97316","#dc2626"];
      return (
        <g key={i} transform={`translate(${cx},${cy}) scale(${scale})`}>
          <rect x="-4" y="0" width="8" height="18" rx="3" fill="#fef9c3"/>
          <path d={`M-18,2 Q-18,-16 0,-20 Q18,-16 18,2Z`} fill={colors[i]}/>
          {[-6,0,6].map((dx,j)=>(
            <circle key={j} cx={dx} cy={-8-j*2} r="3" fill="white" opacity="0.85"/>
          ))}
        </g>
      );
    })}
    {/* Magisch glinsteren */}
    {[[85,30],[50,55],[120,52],[70,80],[100,78]].map(([x,y],i)=>(
      <text key={i} x={x} y={y} textAnchor="middle" fontSize="10" fill="#fbbf24" opacity="0.7">✦</text>
    ))}
  </svg>
);

// ── Volière ───────────────────────────────────────────────────────────────────
const Voliere = () => (
  <svg viewBox="0 0 130 150" className="w-full h-full">
    {/* Sokkel */}
    <rect x="40" y="130" width="50" height="15" rx="4" fill="#94a3b8"/>
    <rect x="50" y="110" width="30" height="22" rx="3" fill="#94a3b8"/>
    {/* Kooi lichaam */}
    <ellipse cx="65" cy="70" rx="48" ry="62" fill="#bfdbfe" opacity="0.25" stroke="#93c5fd" strokeWidth="1.5"/>
    {/* Spijlen */}
    {[-40,-28,-14,0,14,28,40].map((dx,i)=>(
      <line key={i} x1={65+dx} y1={10} x2={65+dx} y2={110} stroke="#7dd3fc" strokeWidth="1.5" opacity="0.9"/>
    ))}
    {/* Horizontale ringen */}
    {[30,55,80].map((y,i)=>(
      <ellipse key={i} cx="65" cy={y} rx={48-i*4} ry={8-i} fill="none" stroke="#93c5fd" strokeWidth="1.2"/>
    ))}
    {/* Kooi top */}
    <ellipse cx="65" cy="10" rx="48" ry="10" fill="#7dd3fc" opacity="0.5"/>
    <ellipse cx="65" cy="8" rx="12" ry="5" fill="#60a5fa"/>
    {/* Vogels */}
    <g transform="translate(50,55)">
      <ellipse cx="0" cy="0" rx="10" ry="7" fill="#fbbf24"/>
      <circle cx="8" cy="-4" r="5" fill="#f59e0b"/>
      <circle cx="10" cy="-5" r="1.5" fill="black"/>
      <path d="M-8,-2 Q-16,-8 -10,0" fill="#fde68a"/>
    </g>
    <g transform="translate(80,40)">
      <ellipse cx="0" cy="0" rx="9" ry="6" fill="#a78bfa"/>
      <circle cx="7" cy="-3" r="4.5" fill="#7c3aed"/>
      <circle cx="9" cy="-4" r="1.5" fill="black"/>
      <path d="M-7,-2 Q-14,-7 -9,0" fill="#c4b5fd"/>
    </g>
    {/* Zitstok */}
    <line x1="28" y1="72" x2="102" y2="68" stroke="#7a5120" strokeWidth="3" strokeLinecap="round"/>
    <ellipse cx="65" cy="143" rx="30" ry="5" fill="#365314" opacity="0.2"/>
  </svg>
);

// ── Rozentuin ─────────────────────────────────────────────────────────────────
const Rozentuin = () => (
  <svg viewBox="0 0 170 130" className="w-full h-full">
    {/* Heg omheining */}
    <rect x="5" y="55" width="160" height="70" rx="5" fill="#15803d" opacity="0.15"/>
    <rect x="5" y="55" width="160" height="12" rx="5" fill="#16a34a" opacity="0.4"/>
    {/* Pad */}
    {[0,1,2,3,4].map(i=>(
      <rect key={i} x={72} y={80+i*10} width={26} height={8} rx="3" fill="#e8d5b0" opacity="0.8"/>
    ))}
    {/* Rozenstruiken */}
    {[{x:28,y:88},{x:142,y:88},{x:28,y:115},{x:142,y:115}].map(({x,y},i)=>(
      <g key={i}>
        <circle cx={x} cy={y} r="18" fill="#15803d"/>
        <circle cx={x} cy={y-4} r="14" fill="#16a34a"/>
        {[[-6,-8],[6,-6],[-4,2],[6,0],[0,-12]].map(([dx,dy],j)=>(
          <g key={j}>
            {[0,60,120,180,240,300].map(a=>(
              <ellipse key={a} cx={x+dx} cy={y+dy} rx="3.5" ry="5" fill="#f43f5e" opacity="0.9" transform={`rotate(${a} ${x+dx} ${y+dy})`}/>
            ))}
            <circle cx={x+dx} cy={y+dy} r="2.5" fill="#fbbf24"/>
          </g>
        ))}
      </g>
    ))}
    {/* Boog met rozen */}
    <path d="M65,55 Q65,20 85,15 Q105,20 105,55" fill="none" stroke="#7a5120" strokeWidth="5" strokeLinecap="round"/>
    {[0.2,0.5,0.8].map((t,i)=>{
      const y=55-(55-15)*t; const x=65+(20)*t*(i%2===0?0.3:-0.3);
      return (
        <g key={i}>
          {[0,60,120,180,240,300].map(a=>(
            <ellipse key={a} cx={x} cy={y} rx="4" ry="6" fill="#f43f5e" opacity="0.9" transform={`rotate(${a} ${x} ${y})`}/>
          ))}
          <circle cx={x} cy={y} r="3" fill="#fbbf24"/>
        </g>
      );
    })}
    <ellipse cx="85" cy="124" rx="60" ry="5" fill="#365314" opacity="0.2"/>
  </svg>
);

// ── Vijver ────────────────────────────────────────────────────────────────────
const Vijver = () => (
  <svg viewBox="0 0 190 130" className="w-full h-full">
    {/* Vijverrand stenen */}
    <ellipse cx="95" cy="90" rx="85" ry="35" fill="#94a3b8"/>
    <ellipse cx="95" cy="88" rx="80" ry="30" fill="#7dd3fc" opacity="0.7"/>
    {/* Water reflectie */}
    <ellipse cx="95" cy="86" rx="75" ry="26" fill="#38bdf8" opacity="0.5"/>
    <ellipse cx="70" cy="82" rx="20" ry="6" fill="#7dd3fc" opacity="0.3"/>
    <ellipse cx="120" cy="90" rx="15" ry="5" fill="#bae6fd" opacity="0.3"/>
    {/* Waterlelies */}
    {[{x:55,y:82},{x:130,y:88},{x:95,y:100}].map(({x,y},i)=>(
      <g key={i}>
        <ellipse cx={x} cy={y} rx="12" ry="7" fill="#4ade80" opacity="0.85"/>
        <path d={`M${x},${y} Q${x+6},${y-4} ${x+8},${y}`} fill="#15803d" opacity="0.4"/>
        <circle cx={x} cy={y} r="4" fill="#f9a8d4"/>
        {[0,72,144,216,288].map(a=>(
          <ellipse key={a} cx={x} cy={y-3} rx="2.5" ry="3.5" fill="#f472b6" opacity="0.8" transform={`rotate(${a} ${x} ${y})`}/>
        ))}
        <circle cx={x} cy={y} r="2" fill="#fbbf24"/>
      </g>
    ))}
    {/* Kikker */}
    <g transform="translate(82,72)">
      <ellipse cx="0" cy="0" rx="10" ry="7" fill="#22c55e"/>
      <circle cx="7" cy="-4" r="5" fill="#22c55e"/>
      <circle cx="-7" cy="-4" r="5" fill="#22c55e"/>
      <circle cx="7" cy="-4" r="3" fill="white"/><circle cx="-7" cy="-4" r="3" fill="white"/>
      <circle cx="8" cy="-4" r="1.5" fill="black"/><circle cx="-6" cy="-4" r="1.5" fill="black"/>
      <path d="M-4,2 Q0,5 4,2" fill="none" stroke="#15803d" strokeWidth="1.5" strokeLinecap="round"/>
    </g>
    {/* Eend */}
    <g transform="translate(130,76)">
      <ellipse cx="0" cy="0" rx="12" ry="7" fill="#fbbf24"/>
      <circle cx="10" cy="-4" r="6" fill="#f59e0b"/>
      <circle cx="13" cy="-4" r="1.5" fill="black"/>
      <path d="M16,-4 Q20,-2 16,-1" fill="#f97316"/>
    </g>
    {/* Rietstengels */}
    {[20,168].map((x,i)=>(
      <g key={i}>
        <line x1={x} y1={120} x2={x+(i===0?-3:3)} y2={60} stroke="#78716c" strokeWidth="2.5" strokeLinecap="round"/>
        <ellipse cx={x+(i===0?-3:3)} cy={58} rx="4" ry="10" fill="#78350f"/>
      </g>
    ))}
  </svg>
);

// ── Speeltuin ─────────────────────────────────────────────────────────────────
const Speeltuin = () => (
  <svg viewBox="0 0 190 170" className="w-full h-full">
    {/* Zandbak */}
    <ellipse cx="155" cy="148" rx="32" ry="16" fill="#f59e0b" opacity="0.4"/>
    <ellipse cx="155" cy="145" rx="28" ry="12" fill="#fcd34d" opacity="0.6"/>
    {/* Klimtoren */}
    <rect x="8" y="60" width="50" height="90" rx="4" fill="#ef4444" opacity="0.15"/>
    <rect x="8" y="58" width="50" height="10" rx="3" fill="#ef4444"/>
    {/* Toren palen */}
    <rect x="10" y="58" width="8" height="100" rx="3" fill="#dc2626"/>
    <rect x="50" y="58" width="8" height="100" rx="3" fill="#dc2626"/>
    {/* Glijbaan */}
    <path d="M10,60 Q35,90 55,130" fill="none" stroke="#fbbf24" strokeWidth="8" strokeLinecap="round"/>
    <path d="M12,60 Q37,90 57,130" fill="none" stroke="#fde68a" strokeWidth="4" strokeLinecap="round"/>
    {/* Treden */}
    {[0,1,2,3,4].map(i=>(
      <rect key={i} x={50} y={62+i*12} width={18} height={5} rx="2" fill="#b45309"/>
    ))}
    {/* Schommelset */}
    <line x1="90" y1="30" x2="160" y2="30" stroke="#7a5120" strokeWidth="5" strokeLinecap="round"/>
    <line x1="90" y1="30" x2="80" y2="155" stroke="#7a5120" strokeWidth="5" strokeLinecap="round"/>
    <line x1="160" y1="30" x2="170" y2="155" stroke="#7a5120" strokeWidth="5" strokeLinecap="round"/>
    {/* Schommel 1 */}
    <line x1="108" y1="30" x2="104" y2="100" stroke="#a37a3a" strokeWidth="2.5"/>
    <line x1="128" y1="30" x2="124" y2="100" stroke="#a37a3a" strokeWidth="2.5"/>
    <rect x="100" y="98" width="28" height="7" rx="3" fill="#c4813a"/>
    {/* Schommel 2 */}
    <line x1="140" y1="30" x2="138" y2="85" stroke="#a37a3a" strokeWidth="2.5"/>
    <line x1="155" y1="30" x2="153" y2="85" stroke="#a37a3a" strokeWidth="2.5"/>
    <rect x="134" y="83" width="23" height="6" rx="3" fill="#c4813a"/>
    {/* Kind op schommel */}
    <circle cx="113" cy="92" r="6" fill="#fcd34d"/>
    <rect x="108" y="97" width="10" height="10" rx="2" fill="#3b82f6"/>
    {/* Vlag op toren */}
    <line x1="33" y1="58" x2="33" y2="38" stroke="#7a5120" strokeWidth="2"/>
    <polygon points="33,38 33,50 48,44" fill="#ef4444"/>
    <ellipse cx="95" cy="164" rx="75" ry="5" fill="#365314" opacity="0.2"/>
  </svg>
);

// ── Boomhut ───────────────────────────────────────────────────────────────────
const Boomhut = () => (
  <svg viewBox="0 0 170 210" className="w-full h-full">
    {/* Stam */}
    <rect x="70" y="130" width="30" height="80" rx="8" fill="#7a5120"/>
    <rect x="76" y="140" width="8" height="65" rx="4" fill="#8b6428" opacity="0.4"/>
    {/* Wortels */}
    <path d="M70,195 Q50,200 45,210" fill="none" stroke="#7a5120" strokeWidth="6" strokeLinecap="round"/>
    <path d="M100,195 Q120,200 125,210" fill="none" stroke="#7a5120" strokeWidth="6" strokeLinecap="round"/>
    {/* Bladerkroon groot */}
    <circle cx="85" cy="95" r="55" fill="#15803d"/>
    <circle cx="55" cy="110" r="38" fill="#166534"/>
    <circle cx="115" cy="110" r="38" fill="#166534"/>
    <circle cx="85" cy="75" r="42" fill="#16a34a"/>
    <circle cx="85" cy="68" r="36" fill="#22c55e"/>
    {/* Platform */}
    <rect x="28" y="120" width="114" height="14" rx="5" fill="#a07030"/>
    <rect x="30" y="118" width="110" height="6" rx="3" fill="#c4913a"/>
    {/* Hut */}
    <rect x="38" y="68" width="94" height="54" rx="4" fill="#c4813a"/>
    <polygon points="30,70 85,40 140,70" fill="#7a3010"/>
    <rect x="30" y="66" width="110" height="7" rx="2" fill="#6b2808"/>
    {/* Ramen hut */}
    {[44,100].map((x,i)=>(
      <g key={i}>
        <rect x={x} y={80} width={22} height={18} rx="3" fill="#bae6fd"/>
        <line x1={x+11} y1={80} x2={x+11} y2={98} stroke="white" strokeWidth="1.2"/>
        <line x1={x} y1={89} x2={x+22} y2={89} stroke="white" strokeWidth="1.2"/>
      </g>
    ))}
    {/* Deur */}
    <rect x="73" y="90" width="24" height="32" rx="3" fill="#5c2808"/>
    <circle cx="70" cy="107" r="2.5" fill="#d4a020"/>
    {/* Touwladder */}
    <line x1="50" y1="134" x2="42" y2="200" stroke="#a37a3a" strokeWidth="2.5"/>
    <line x1="60" y1="134" x2="52" y2="200" stroke="#a37a3a" strokeWidth="2.5"/>
    {[0,1,2,3,4,5].map(i=>(
      <line key={i} x1={50-i*1.4} y1={144+i*10} x2={60-i*1.4} y2={144+i*10} stroke="#7a5120" strokeWidth="3" strokeLinecap="round"/>
    ))}
    {/* Vlag */}
    <line x1="85" y1="40" x2="85" y2="22" stroke="#5c2808" strokeWidth="2"/>
    <polygon points="85,22 85,33 100,27" fill="#ef4444"/>
  </svg>
);

// ── Gouden regenboog ──────────────────────────────────────────────────────────
const Goudregenboog = () => (
  <svg viewBox="0 0 240 160" className="w-full h-full">
    {/* Grote wolken */}
    <g>
      {[12,26,40,18].map((r,i)=>(<circle key={i} cx={18+i*12} cy={130-i%2*8} r={r} fill="white"/>))}
    </g>
    <g>
      {[12,26,40,18].map((r,i)=>(<circle key={i} cx={222-i*12} cy={130-i%2*8} r={r} fill="white"/>))}
    </g>
    {/* Regenboog bogen */}
    {[
      {r:100,sw:14,c:"#ef4444"},
      {r:84, sw:14,c:"#f97316"},
      {r:68, sw:14,c:"#fbbf24"},
      {r:52, sw:14,c:"#4ade80"},
      {r:36, sw:14,c:"#60a5fa"},
      {r:20, sw:14,c:"#a78bfa"},
    ].map(({r,sw,c},i)=>(
      <path key={i} d={`M ${120-r},130 A ${r},${r} 0 0,1 ${120+r},130`}
        fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" opacity="0.92"/>
    ))}
    {/* Wolken over uiteinden */}
    <ellipse cx="30" cy="130" rx="32" ry="18" fill="white"/>
    <ellipse cx="210" cy="130" rx="32" ry="18" fill="white"/>
    {/* Pot van goud links */}
    <g transform="translate(12,125)">
      <path d="M0,0 Q0,-22 18,-22 Q36,-22 36,0Z" fill="#374151"/>
      <rect x="-3" y="-2" width="42" height="8" rx="3" fill="#4b5563"/>
      <ellipse cx="18" cy="-22" rx="18" ry="6" fill="#fbbf24" opacity="0.9"/>
      {[-6,0,6,-3,3].map((dx,i)=>(
        <circle key={i} cx={18+dx} cy={-26-i%2*3} r="3.5" fill="#fbbf24"/>
      ))}
    </g>
    {/* Glinstering */}
    {[[120,15],[80,40],[160,38],[100,65],[140,62]].map(([x,y],i)=>(
      <text key={i} x={x} y={y} textAnchor="middle" fontSize="12" fill="#fbbf24" opacity="0.8">✦</text>
    ))}
    {/* Sterren */}
    {[[120,8],[95,25],[145,23]].map(([x,y],i)=>(
      <text key={i} x={x} y={y} textAnchor="middle" fontSize="16" fill="white" opacity="0.9">★</text>
    ))}
  </svg>
);

const RENDERERS: Record<FieldItemType, () => JSX.Element> = {
  vlinder:        Vlinder,
  waterkan:       Waterkan,
  huis:           Huis,
  brievenbus:     Brievenbus,
  moestuin:       Moestuin,
  paddenstoel:    Paddenstoel,
  vogelhuisje:    Vogelhuisje,
  perkje:         Perkje,
  kikker:         Kikker,
  schommel:       Schommel,
  boom:           Boom,
  regenboog:      Regenboog,
  vlindertuin:    Vlindertuin,
  fontein:        Fontein,
  villa:          Villa,
  goudbrievenbus: Goudbrievenbus,
  kas:            Kas,
  paddestoelring: Paddestoelring,
  voliere:        Voliere,
  rozentuin:      Rozentuin,
  vijver:         Vijver,
  speeltuin:      Speeltuin,
  boomhut:        Boomhut,
  goudregenboog:  Goudregenboog,
};

export const FieldItemSVG = ({ type }: { type: FieldItemType }) => {
  const Renderer = RENDERERS[type];
  return Renderer ? <Renderer /> : null;
};
