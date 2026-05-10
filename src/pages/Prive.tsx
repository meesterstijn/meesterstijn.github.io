import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Plus, Check, X, Search, Play, Pause, RotateCcw, ExternalLink, Lock } from "lucide-react";

const PRIVE_WW  = "nietvoorleerlingen";
const PRIVE_KEY = "prive_ok";

// ── CSS ────────────────────────────────────────────────────────────────────────
const STYLES = `
  @keyframes blob {
    0%   { transform: translate(0,0) scale(1); }
    33%  { transform: translate(40px,-30px) scale(1.08); }
    66%  { transform: translate(-25px,20px) scale(0.94); }
    100% { transform: translate(0,0) scale(1); }
  }
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(14px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes scaleIn {
    from { opacity:0; transform:scale(0.96) translateY(-6px); }
    to   { opacity:1; transform:scale(1) translateY(0); }
  }
  @keyframes seconds-tick {
    0%,100% { opacity:1; } 50% { opacity:0.45; }
  }
  .pv-card {
    background: rgba(18,16,32,0.72);
    border: 1px solid rgba(255,255,255,0.07);
    backdrop-filter: blur(28px);
    -webkit-backdrop-filter: blur(28px);
    border-radius: 22px;
    animation: fadeUp 0.5s ease both;
    transition: border-color 0.3s, box-shadow 0.3s;
  }
  .pv-card:hover {
    border-color: rgba(124,106,247,0.22);
    box-shadow: 0 0 40px rgba(124,106,247,0.07);
  }
  .pv-link {
    display:flex; align-items:center; gap:8px;
    padding:10px 13px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    color: #dddaf8;
    font-size: 13px; font-weight:500;
    text-decoration:none;
    transition: all 0.2s ease;
    cursor:pointer;
  }
  .pv-link:hover {
    background: rgba(124,106,247,0.13);
    border-color: rgba(124,106,247,0.38);
    box-shadow: 0 0 22px rgba(124,106,247,0.14), inset 0 0 14px rgba(124,106,247,0.06);
    transform: translateY(-2px);
    color: #fff;
  }
  .pv-btn {
    display:inline-flex; align-items:center; justify-content:center; gap:6px;
    background: linear-gradient(135deg,#7c6af7,#a78bfa);
    border:none; border-radius:13px; color:#fff;
    font-weight:600; font-size:13px; cursor:pointer;
    box-shadow: 0 4px 16px rgba(124,106,247,0.38);
    transition: all 0.2s ease;
    padding: 9px 18px;
  }
  .pv-btn:hover { transform:translateY(-1px); box-shadow:0 6px 22px rgba(124,106,247,0.55); }
  .pv-btn:active { transform:translateY(0); }
  .pv-btn-ghost {
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 13px; cursor:pointer;
    color: rgba(255,255,255,0.45);
    transition: all 0.2s ease;
    display:flex; align-items:center; justify-content:center;
    padding: 9px 12px;
  }
  .pv-btn-ghost:hover { background:rgba(255,255,255,0.11); color:rgba(255,255,255,0.75); }
  .pv-input {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 13px; color:#f1f0ff;
    padding: 9px 14px; font-size:13px;
    outline:none; width:100%;
    transition: all 0.2s ease;
  }
  .pv-input:focus {
    border-color: rgba(124,106,247,0.55);
    background: rgba(124,106,247,0.07);
    box-shadow: 0 0 0 3px rgba(124,106,247,0.12);
  }
  .pv-input::placeholder { color: rgba(255,255,255,0.2); }
  .pv-check {
    width:17px; height:17px; border-radius:5px; flex-shrink:0;
    border: 1.5px solid rgba(255,255,255,0.18);
    background:transparent; display:grid; place-items:center;
    cursor:pointer; transition:all 0.2s ease;
  }
  .pv-check.done {
    background: linear-gradient(135deg,#7c6af7,#a78bfa);
    border-color:transparent;
  }
  .pv-todo-row { display:flex; align-items:center; gap:8px; }
  .pv-todo-row .del { opacity:0; transition:opacity 0.15s; background:none; border:none; cursor:pointer; color:rgba(255,255,255,0.3); flex-shrink:0; padding:2px; }
  .pv-todo-row:hover .del { opacity:1; }
  .pv-todo-row .del:hover { color:#f87171; }
  .pv-cmd-bg {
    position:fixed; inset:0; z-index:200;
    background:rgba(0,0,0,0.7);
    backdrop-filter:blur(10px);
    -webkit-backdrop-filter:blur(10px);
    display:flex; align-items:flex-start; justify-content:center;
    padding-top:110px;
  }
  .pv-cmd-box {
    width:100%; max-width:560px;
    background:rgba(16,14,28,0.97);
    border: 1px solid rgba(124,106,247,0.28);
    border-radius: 22px;
    overflow:hidden;
    animation: scaleIn 0.16s ease both;
    box-shadow: 0 30px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04);
  }
  .pv-cmd-item {
    display:flex; align-items:center; gap:10px;
    padding:10px 18px; cursor:pointer; font-size:13px;
    color:#c4c1e8; transition:background 0.1s;
  }
  .pv-cmd-item:hover,.pv-cmd-item.sel { background:rgba(124,106,247,0.16); color:#fff; }
  .blob { position:absolute; border-radius:50%; filter:blur(90px); opacity:0.16; animation:blob linear infinite; }
  .pv-label { font-size:10px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase; color:rgba(255,255,255,0.3); margin-bottom:12px; }
`;

// ── Bible ──────────────────────────────────────────────────────────────────────
const VERZEN = [
  { tekst: "Want zo lief heeft God de wereld gehad, dat Hij zijn eniggeboren Zoon gegeven heeft, opdat ieder die in Hem gelooft, niet verloren gaat maar eeuwig leven heeft.", ref: "Johannes 3:16" },
  { tekst: "De HEER is mijn herder, het ontbreekt mij aan niets.", ref: "Psalm 23:1" },
  { tekst: "Vertrouw op de HEER met heel je hart, steun niet op eigen inzicht.", ref: "Spreuken 3:5" },
  { tekst: "Ik ben de weg, de waarheid en het leven.", ref: "Johannes 14:6" },
  { tekst: "Ik kan alles aan door Hem die mij kracht geeft.", ref: "Filippenzen 4:13" },
  { tekst: "Wees niet bevreesd, want Ik ben met u; wees niet verbijsterd, want Ik ben uw God.", ref: "Jesaja 41:10" },
  { tekst: "Zoek eerst het Koninkrijk van God en zijn gerechtigheid, en al die andere dingen zullen u erbij gegeven worden.", ref: "Matteüs 6:33" },
  { tekst: "De HEER zegent je en beschermt je, de HEER laat zijn licht over je schijnen.", ref: "Numeri 6:24-25" },
  { tekst: "Ik heb plannen voor uw toekomst, plannen ten goede en niet ten kwade, om u een hoopvolle toekomst te geven.", ref: "Jeremia 29:11" },
  { tekst: "Maar wie op de HEER vertrouwen, putten nieuwe kracht.", ref: "Jesaja 40:31" },
  { tekst: "Dit is de dag die de HEER gemaakt heeft, laten wij juichen en ons verheugen.", ref: "Psalm 118:24" },
  { tekst: "Heb de HEER, uw God, lief met heel uw hart en met heel uw ziel en met heel uw verstand.", ref: "Matteüs 22:37" },
  { tekst: "Bid en u zal gegeven worden, zoek en u zult vinden, klop en er zal voor u worden opengedaan.", ref: "Matteüs 7:7" },
  { tekst: "Wees altijd blij, bid zonder ophouden, dank God onder alle omstandigheden.", ref: "1 Tessalonicenzen 5:16-18" },
  { tekst: "Kom naar Mij, allen die vermoeid en belast zijn, en Ik zal u rust geven.", ref: "Matteüs 11:28" },
  { tekst: "Uw woord is een lamp voor mijn voet en een licht op mijn pad.", ref: "Psalm 119:105" },
  { tekst: "Laat uw licht zo schijnen voor de mensen dat zij uw goede werken zien.", ref: "Matteüs 5:16" },
  { tekst: "De HEER is nabij allen die Hem aanroepen.", ref: "Psalm 145:18" },
  { tekst: "Alles is mogelijk voor wie gelooft.", ref: "Marcus 9:23" },
  { tekst: "Heb uw naaste lief als uzelf.", ref: "Matteüs 22:39" },
  { tekst: "Noch dood noch leven zal ons kunnen scheiden van de liefde van God.", ref: "Romeinen 8:38-39" },
  { tekst: "Doe alles in liefde.", ref: "1 Korintiërs 16:14" },
  { tekst: "Ik ben de opstanding en het leven.", ref: "Johannes 11:25" },
  { tekst: "Spreek, HEER, uw dienaar luistert.", ref: "1 Samuël 3:10" },
  { tekst: "Want Uw goedertierenheid is beter dan het leven.", ref: "Psalm 63:4" },
  { tekst: "Maak je geen zorgen over morgen, morgen zorgt voor zichzelf.", ref: "Matteüs 6:34" },
  { tekst: "Genade en vrede zij u van God onze Vader en van de Heer Jezus Christus.", ref: "Filippenzen 1:2" },
  { tekst: "Weest standvastig, onwankelbaar, altijd overvloedig in het werk van de Heer.", ref: "1 Korintiërs 15:58" },
  { tekst: "In het begin schiep God hemel en aarde.", ref: "Genesis 1:1" },
  { tekst: "Ik ben bij jullie, alle dagen, tot aan de voltooiing van deze wereld.", ref: "Matteüs 28:20" },
];
const dagVers = () => VERZEN[Math.floor(Date.now() / 86400000) % VERZEN.length];

// ── Weather ────────────────────────────────────────────────────────────────────
const WEER_ICON = (c: number) => c === 0 ? "☀️" : c <= 3 ? "⛅" : c <= 48 ? "🌫️" : c <= 67 ? "🌧️" : c <= 77 ? "❄️" : c <= 82 ? "🌦️" : "⛈️";
const WEER_NL   = (c: number) => c === 0 ? "helder" : c <= 3 ? "bewolkt" : c <= 48 ? "mistig" : c <= 67 ? "regen" : c <= 77 ? "sneeuw" : c <= 82 ? "buien" : "onweer";
const DAGEN     = ["zo","ma","di","wo","do","vr","za"];

// ── Links ──────────────────────────────────────────────────────────────────────
const LINKS = [
  { label:"Gmail",          icon:"✉️",  url:"https://mail.google.com" },
  { label:"Google Drive",   icon:"📁",  url:"https://drive.google.com" },
  { label:"Google Agenda",  icon:"📅",  url:"https://calendar.google.com" },
  { label:"Home Assistant", icon:"🏠",  url:"http://homeassistant.local:8123" },
  { label:"Claude",         icon:"🤖",  url:"https://claude.ai" },
  { label:"YouTube",        icon:"▶️",  url:"https://youtube.com" },
  { label:"GitHub",         icon:"🐙",  url:"https://github.com" },
  { label:"Notion",         icon:"📝",  url:"https://notion.so" },
];

// ── Types ──────────────────────────────────────────────────────────────────────
type Todo     = { id: number; tekst: string; gedaan: boolean };
type Gewoonte = { id: number; naam: string; kleur: string; datums: string[] };

// ── Command palette ────────────────────────────────────────────────────────────
const CommandPalette = ({ onClose }: { onClose: () => void }) => {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);

  const matches = q ? LINKS.filter(l => l.label.toLowerCase().includes(q.toLowerCase())) : LINKS;
  const items = [
    ...matches,
    ...(q ? [{ label: `Google: "${q}"`, icon: "🔍", url: `https://google.com/search?q=${encodeURIComponent(q)}` }] : []),
  ];

  const go = (url: string) => { window.open(url, "_blank"); onClose(); };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { onClose(); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setSel(i => Math.min(i+1, items.length-1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setSel(i => Math.max(i-1, 0)); }
    if (e.key === "Enter" && items[sel]) go(items[sel].url);
  };

  return (
    <div className="pv-cmd-bg" onClick={onClose}>
      <div className="pv-cmd-box" onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"14px 18px", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
          <Search style={{ color:"rgba(255,255,255,0.35)", flexShrink:0 }} className="h-4 w-4" />
          <input ref={ref} value={q} onChange={e=>{setQ(e.target.value);setSel(0);}} onKeyDown={onKey}
            placeholder="Zoek een link of op Google…"
            style={{ background:"none", border:"none", outline:"none", color:"#f1f0ff", fontSize:15, flex:1 }} />
          <kbd style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:6, padding:"2px 7px", fontSize:11, color:"rgba(255,255,255,0.35)" }}>ESC</kbd>
        </div>
        <div style={{ maxHeight:300, overflowY:"auto", padding:"6px 0" }}>
          {items.map((item, i) => (
            <div key={i} className={`pv-cmd-item ${i===sel?"sel":""}`} onClick={() => go(item.url)}>
              <span style={{ fontSize:16 }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
        <div style={{ padding:"8px 18px", borderTop:"1px solid rgba(255,255,255,0.05)", display:"flex", gap:16 }}>
          {[["↵","Openen"],["↑↓","Navigeren"],["ESC","Sluiten"]].map(([k,v])=>(
            <span key={k} style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"rgba(255,255,255,0.28)" }}>
              <kbd style={{ background:"rgba(255,255,255,0.06)", borderRadius:4, padding:"1px 5px", fontSize:10 }}>{k}</kbd>{v}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Habit ring ─────────────────────────────────────────────────────────────────
const HabitRing = ({ g, vandaag, onToggle, onDel }: { g: Gewoonte; vandaag: string; onToggle: ()=>void; onDel: ()=>void; }) => {
  const [hov, setHov] = useState(false);
  const gedaan = g.datums.includes(vandaag);
  const r1 = 30, r2 = 21;
  const C1 = 2*Math.PI*r1, C2 = 2*Math.PI*r2;

  const last7 = Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-i);return d.toISOString().split("T")[0];});
  const pct7 = last7.filter(d=>g.datums.includes(d)).length / 7;

  let streak = 0;
  const sd = new Date();
  while(g.datums.includes(sd.toISOString().split("T")[0])){streak++;sd.setDate(sd.getDate()-1);}

  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5, position:"relative" }}>
      <button onClick={onToggle} style={{ background:"none", border:"none", cursor:"pointer", lineHeight:0 }}>
        <svg width={76} height={76} viewBox="0 0 76 76">
          <circle cx={38} cy={38} r={r1} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5}/>
          <circle cx={38} cy={38} r={r1} fill="none" stroke={g.kleur+"50"} strokeWidth={5}
            strokeLinecap="round" strokeDasharray={C1} strokeDashoffset={C1*(1-pct7)}
            transform="rotate(-90 38 38)" style={{ transition:"stroke-dashoffset 0.7s ease" }}/>
          <circle cx={38} cy={38} r={r2} fill="none"
            stroke={gedaan ? g.kleur : "rgba(255,255,255,0.06)"} strokeWidth={5}
            strokeLinecap="round" strokeDasharray={C2} strokeDashoffset={gedaan?0:C2}
            transform="rotate(-90 38 38)" style={{ transition:"all 0.45s ease", filter: gedaan?`drop-shadow(0 0 6px ${g.kleur})`:"none" }}/>
          {gedaan
            ? <text x={38} y={43} textAnchor="middle" style={{ fontSize:15, fill:g.kleur }}>✓</text>
            : <circle cx={38} cy={38} r={3} fill="rgba(255,255,255,0.18)"/>}
        </svg>
      </button>
      <span style={{ fontSize:11, color:"rgba(255,255,255,0.55)", textAlign:"center", maxWidth:76, lineHeight:1.3 }}>{g.naam}</span>
      {streak > 1 && <span style={{ fontSize:10, color:g.kleur, fontWeight:700 }}>🔥 {streak}</span>}
      {hov && (
        <button onClick={e=>{e.stopPropagation();onDel();}}
          style={{ position:"absolute", top:-5, right:2, background:"rgba(239,68,68,0.85)", border:"none", borderRadius:"50%", width:18, height:18, display:"grid", placeItems:"center", cursor:"pointer" }}>
          <X style={{ width:10, height:10, color:"#fff" }}/>
        </button>
      )}
    </div>
  );
};

// ── Pomodoro ───────────────────────────────────────────────────────────────────
const Pomodoro = () => {
  const [mode, setMode] = useState<"focus"|"pauze">("focus");
  const [sec, setSec]   = useState(25*60);
  const [run, setRun]   = useState(false);
  const iv = useRef<ReturnType<typeof setInterval>|null>(null);
  const total = mode==="focus"?25*60:5*60;
  const pct = sec/total;
  const r=52, C=2*Math.PI*r;
  const danger=sec<60&&sec>0, done=sec===0;
  const clr = done?"#22c55e":danger?"#ef4444":mode==="focus"?"#7c6af7":"#22c55e";

  useEffect(()=>{
    if(run&&sec>0){ iv.current=setInterval(()=>setSec(s=>s-1),1000); }
    else {
      if(iv.current) clearInterval(iv.current);
      if(done){ setRun(false); setTimeout(()=>{ const n=mode==="focus"?"pauze":"focus"; setMode(n); setSec(n==="focus"?25*60:5*60); },600); }
    }
    return ()=>{ if(iv.current) clearInterval(iv.current); };
  },[run,sec]);

  const reset=()=>{setRun(false);setSec(total);};
  const fmt=(s:number)=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  return(
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
      <div style={{ display:"flex", background:"rgba(255,255,255,0.05)", borderRadius:12, padding:3 }}>
        {(["focus","pauze"] as const).map(m=>(
          <button key={m} onClick={()=>{setMode(m);setRun(false);setSec(m==="focus"?25*60:5*60);}}
            style={{ padding:"5px 16px", borderRadius:9, border:"none", cursor:"pointer", fontSize:12, fontWeight:600,
              background:mode===m?"rgba(124,106,247,0.28)":"transparent",
              color:mode===m?"#a78bfa":"rgba(255,255,255,0.38)", transition:"all 0.2s" }}>
            {m==="focus"?"🎯 Focus":"☕ Pauze"}
          </button>
        ))}
      </div>
      <svg width={130} height={130} viewBox="0 0 120 120">
        <circle cx={60} cy={60} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={6}/>
        <circle cx={60} cy={60} r={r} fill="none" stroke={clr} strokeWidth={6} strokeLinecap="round"
          strokeDasharray={C} strokeDashoffset={C*(1-pct)}
          transform="rotate(-90 60 60)"
          style={{ transition:"stroke-dashoffset 1s linear, stroke 0.3s", filter:`drop-shadow(0 0 10px ${clr}80)` }}/>
        <text x={60} y={55} textAnchor="middle"
          style={{ fontSize:24, fontWeight:700, fill:done?"#22c55e":"#f1f0ff", fontFamily:"monospace" }}>
          {fmt(sec)}
        </text>
        <text x={60} y={72} textAnchor="middle"
          style={{ fontSize:10, fill:"rgba(255,255,255,0.35)" }}>
          {done?"Klaar! 🎉":mode==="focus"?"focus":"pauze"}
        </text>
      </svg>
      <div style={{ display:"flex", gap:8 }}>
        <button onClick={()=>setRun(r=>!r)} className="pv-btn">
          {run?<Pause className="h-3.5 w-3.5"/>:<Play className="h-3.5 w-3.5"/>}
          {run?"Pauze":"Start"}
        </button>
        <button onClick={reset} className="pv-btn-ghost"><RotateCcw className="h-3.5 w-3.5"/></button>
      </div>
    </div>
  );
};

// ── Lock screen ────────────────────────────────────────────────────────────────
const LockScreen = ({ onUnlock }: { onUnlock: () => void }) => {
  const [ww, setWw]     = useState("");
  const [fout, setFout] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);

  const probeer = () => {
    if (ww === PRIVE_WW) {
      sessionStorage.setItem(PRIVE_KEY, "1");
      onUnlock();
    } else {
      setFout(true);
      setWw("");
      setTimeout(() => setFout(false), 1400);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#08080f", display:"flex", alignItems:"center", justifyContent:"center", color:"#e8e6ff" }}>
      <style>{STYLES}</style>
      <div className="blob" style={{ width:500, height:500, background:"#7c6af7", top:-150, left:-100, animationDuration:"25s" }}/>
      <div className="blob" style={{ width:400, height:400, background:"#4f46e5", bottom:-100, right:-100, animationDuration:"30s", animationDelay:"-8s" }}/>
      <div className="pv-card" style={{ padding:"40px 44px", maxWidth:380, width:"100%", textAlign:"center", position:"relative", zIndex:1 }}>
        <div style={{ width:52, height:52, borderRadius:16, background:"linear-gradient(135deg,#7c6af7,#a78bfa)", display:"grid", placeItems:"center", margin:"0 auto 20px" }}>
          <Lock style={{ width:22, height:22, color:"#fff" }}/>
        </div>
        <h2 style={{ fontWeight:700, fontSize:20, marginBottom:6, letterSpacing:"-0.02em" }}>Privé dashboard</h2>
        <p style={{ fontSize:13, color:"rgba(255,255,255,0.38)", marginBottom:24 }}>Voer het wachtwoord in om verder te gaan.</p>
        <input
          ref={ref}
          type="password"
          value={ww}
          className="pv-input"
          style={{ textAlign:"center", marginBottom:12, borderColor: fout ? "rgba(239,68,68,0.6)" : undefined }}
          placeholder="Wachtwoord…"
          onChange={e => setWw(e.target.value)}
          onKeyDown={e => e.key === "Enter" && probeer()}
        />
        {fout && <p style={{ fontSize:12, color:"#f87171", marginBottom:10 }}>Onjuist wachtwoord</p>}
        <button className="pv-btn" style={{ width:"100%", justifyContent:"center" }} onClick={probeer}>
          Ontgrendelen
        </button>
        <Link to="/" style={{ display:"block", marginTop:18, fontSize:12, color:"rgba(255,255,255,0.28)", textDecoration:"none" }}>← Terug naar Meester Stijn</Link>
      </div>
    </div>
  );
};

// ── Main ───────────────────────────────────────────────────────────────────────
const Prive = () => {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(PRIVE_KEY) === "1");
  const [tijd, setTijd]         = useState(new Date());
  const [weer, setWeer]         = useState<any>(null);
  const [todos, setTodos]       = useState<Todo[]>([]);
  const [nieuwTodo, setNieuwTodo] = useState("");
  const [notitie, setNotitie]   = useState("");
  const [notStatus, setNotStatus] = useState<"saved"|"saving">("saved");
  const [gewoontes, setGewoontes] = useState<Gewoonte[]>([]);
  const [nieuwG, setNieuwG]     = useState("");
  const [cmd, setCmd]           = useState(false);

  const notTimer = useRef<ReturnType<typeof setTimeout>|null>(null);
  const vandaag  = new Date().toISOString().split("T")[0];
  const vers     = dagVers();

  // Clock
  useEffect(()=>{ const t=setInterval(()=>setTijd(new Date()),1000); return()=>clearInterval(t); },[]);

  // Cmd+K
  const onKeyGlobal = useCallback((e: KeyboardEvent)=>{
    if((e.metaKey||e.ctrlKey)&&e.key==="k"){ e.preventDefault(); setCmd(v=>!v); }
    if(e.key==="Escape") setCmd(false);
  },[]);
  useEffect(()=>{ window.addEventListener("keydown",onKeyGlobal); return()=>window.removeEventListener("keydown",onKeyGlobal); },[onKeyGlobal]);

  // Weather
  useEffect(()=>{
    fetch("https://api.open-meteo.com/v1/forecast?latitude=51.82&longitude=4.62&daily=weathercode,temperature_2m_max,temperature_2m_min&current_weather=true&timezone=Europe%2FAmsterdam&forecast_days=7")
      .then(r=>r.json()).then(setWeer).catch(()=>{});
  },[]);

  // Load data
  useEffect(()=>{
    supabase.from("prive_todos").select("*").order("aangemaakt",{ascending:true}).then(({data})=>setTodos(data??[]));
    supabase.from("prive_notities").select("inhoud").eq("id",1).single().then(({data})=>{ if(data) setNotitie(data.inhoud??""); });
    supabase.from("prive_gewoontes").select("*").order("id",{ascending:true}).then(({data})=>setGewoontes(data??[]));
  },[]);

  // Todos
  const voegTodoToe = async()=>{
    const t=nieuwTodo.trim(); if(!t) return;
    setNieuwTodo("");
    const {data}=await supabase.from("prive_todos").insert({tekst:t}).select().single();
    if(data) setTodos(p=>[...p,data]);
  };
  const toggleTodo = async(id:number,gedaan:boolean)=>{
    setTodos(p=>p.map(i=>i.id===id?{...i,gedaan}:i));
    await supabase.from("prive_todos").update({gedaan}).eq("id",id);
  };
  const delTodo = async(id:number)=>{
    setTodos(p=>p.filter(i=>i.id!==id));
    await supabase.from("prive_todos").delete().eq("id",id);
  };

  // Notes
  const handleNote=(val:string)=>{
    setNotitie(val); setNotStatus("saving");
    if(notTimer.current) clearTimeout(notTimer.current);
    notTimer.current=setTimeout(async()=>{
      const {data}=await supabase.from("prive_notities").update({inhoud:val}).eq("id",1).select("id");
      if(!data||data.length===0) await supabase.from("prive_notities").insert({id:1,inhoud:val});
      setNotStatus("saved");
    },800);
  };

  // Habits
  const voegGewoonteToe=async()=>{
    const naam=nieuwG.trim(); if(!naam) return; setNieuwG("");
    const kleuren=["#7c6af7","#22c55e","#f59e0b","#ef4444","#06b6d4","#ec4899"];
    const kleur=kleuren[gewoontes.length%kleuren.length];
    const {data}=await supabase.from("prive_gewoontes").insert({naam,kleur,datums:[]}).select().single();
    if(data) setGewoontes(g=>[...g,data]);
  };
  const toggleG=async(id:number,datums:string[])=>{
    const nd=datums.includes(vandaag)?datums.filter(d=>d!==vandaag):[...datums,vandaag];
    setGewoontes(g=>g.map(i=>i.id===id?{...i,datums:nd}:i));
    await supabase.from("prive_gewoontes").update({datums:nd}).eq("id",id);
  };
  const delG=async(id:number)=>{
    setGewoontes(g=>g.filter(i=>i.id!==id));
    await supabase.from("prive_gewoontes").delete().eq("id",id);
  };

  // Clock display
  const hh=String(tijd.getHours()).padStart(2,"0");
  const mm=String(tijd.getMinutes()).padStart(2,"0");
  const ss=String(tijd.getSeconds()).padStart(2,"0");
  const uur=tijd.getHours();
  const begroeting=uur<6?"Goede nacht":uur<12?"Goedemorgen":uur<18?"Goedemiddag":"Goedenavond";

  // Smart weather tip
  const weerTip=()=>{
    if(!weer?.current_weather) return null;
    const c=weer.current_weather.weathercode;
    const t=Math.round(weer.current_weather.temperature);
    if(c>=60&&c<=67) return `🌂 Neem een paraplu mee — ${t}°C en regen`;
    if(c===0&&t>20) return `☀️ Mooi weer vandaag — ${t}°C`;
    if(t<5) return `🧥 Trek iets warms aan — ${t}°C`;
    return `${WEER_ICON(c)} ${t}°C · ${WEER_NL(c)}`;
  };

  if (!unlocked) return <LockScreen onUnlock={() => setUnlocked(true)} />;

  return (
    <div style={{ minHeight:"100vh", background:"#08080f", position:"relative", overflow:"hidden", color:"#e8e6ff" }}>
      <style>{STYLES}</style>

      {/* Background blobs */}
      <div className="blob" style={{ width:600, height:600, background:"#7c6af7", top:-200, left:-100, animationDuration:"25s" }}/>
      <div className="blob" style={{ width:500, height:500, background:"#4f46e5", top:"40%", right:-150, animationDuration:"32s", animationDelay:"-10s" }}/>
      <div className="blob" style={{ width:400, height:400, background:"#7c3aed", bottom:-100, left:"30%", animationDuration:"20s", animationDelay:"-5s" }}/>

      {/* Navbar */}
      <nav style={{ position:"sticky", top:0, zIndex:50, background:"rgba(8,8,15,0.8)", borderBottom:"1px solid rgba(255,255,255,0.06)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)" }}>
        <div style={{ maxWidth:1280, margin:"0 auto", padding:"0 24px", height:56, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:10, background:"linear-gradient(135deg,#7c6af7,#a78bfa)", display:"grid", placeItems:"center", fontSize:14, fontWeight:700, color:"#fff" }}>S</div>
            <span style={{ fontWeight:600, fontSize:17, letterSpacing:"-0.02em" }}>Dashboard</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <button onClick={()=>setCmd(true)}
              style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:11, padding:"7px 14px", cursor:"pointer", color:"rgba(255,255,255,0.45)", fontSize:13, transition:"all 0.2s" }}
              onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor="rgba(124,106,247,0.4)";(e.currentTarget as HTMLButtonElement).style.color="rgba(255,255,255,0.75)";}}
              onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.borderColor="rgba(255,255,255,0.09)";(e.currentTarget as HTMLButtonElement).style.color="rgba(255,255,255,0.45)";}}>
              <Search className="h-3.5 w-3.5"/>
              <span>Zoeken</span>
              <kbd style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:5, padding:"1px 6px", fontSize:10 }}>⌘K</kbd>
            </button>
            <Link to="/" style={{ color:"rgba(255,255,255,0.35)", fontSize:13, textDecoration:"none", padding:"7px 12px", borderRadius:10, transition:"color 0.2s" }}
              onMouseEnter={e=>(e.currentTarget.style.color="rgba(255,255,255,0.7)")}
              onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.35)")}>
              ← Meester Stijn
            </Link>
          </div>
        </div>
      </nav>

      {/* Command palette */}
      {cmd && <CommandPalette onClose={()=>setCmd(false)}/>}

      <main style={{ maxWidth:1280, margin:"0 auto", padding:"32px 24px 80px", position:"relative", zIndex:1 }}>

        {/* Hero */}
        <div style={{ marginBottom:36 }}>
          <div style={{ display:"flex", alignItems:"flex-end", gap:16, flexWrap:"wrap" }}>
            <div>
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", marginBottom:4 }}>{begroeting}</p>
              <h1 style={{ fontFamily:"var(--font-display,serif)", fontSize:52, fontWeight:700, letterSpacing:"-0.03em", lineHeight:1, margin:0 }}>
                <span style={{ fontVariantNumeric:"tabular-nums" }}>{hh}:{mm}</span>
                <span style={{ fontSize:28, color:"rgba(255,255,255,0.3)", marginLeft:6, animation:"seconds-tick 2s ease infinite" }}>{ss}</span>
              </h1>
              <p style={{ fontSize:14, color:"rgba(255,255,255,0.4)", marginTop:6 }}>
                {tijd.toLocaleDateString("nl-NL",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
              </p>
            </div>
            {weerTip() && (
              <div style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:"8px 16px", fontSize:13, color:"rgba(255,255,255,0.6)", marginBottom:6 }}>
                {weerTip()}
              </div>
            )}
          </div>
        </div>

        {/* Grid */}
        <div style={{ display:"grid", gap:18, gridTemplateColumns:"repeat(3,1fr)" }}>

          {/* ── Weer ── */}
          <div className="pv-card" style={{ padding:22, gridColumn:"span 2", animationDelay:"0ms" }}>
            <p className="pv-label">Weer — 7 dagen</p>
            {weer?.daily ? (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:8 }}>
                {weer.daily.time.map((dag:string, i:number)=>{
                  const dt=new Date(dag+"T00:00:00");
                  const isVandaag=dag===vandaag;
                  return(
                    <div key={dag} style={{
                      background: isVandaag?"rgba(124,106,247,0.14)":"rgba(255,255,255,0.03)",
                      border: `1px solid ${isVandaag?"rgba(124,106,247,0.35)":"rgba(255,255,255,0.06)"}`,
                      borderRadius:14, padding:"12px 4px",
                      display:"flex", flexDirection:"column", alignItems:"center", gap:4,
                      boxShadow: isVandaag?"0 0 20px rgba(124,106,247,0.12)":"none"
                    }}>
                      <span style={{ fontSize:10, fontWeight:700, color: isVandaag?"#a78bfa":"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.06em" }}>
                        {DAGEN[dt.getDay()]}
                      </span>
                      <span style={{ fontSize:20 }}>{WEER_ICON(weer.daily.weathercode[i])}</span>
                      <span style={{ fontSize:13, fontWeight:700, color:"#f1f0ff" }}>{Math.round(weer.daily.temperature_2m_max[i])}°</span>
                      <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)" }}>{Math.round(weer.daily.temperature_2m_min[i])}°</span>
                    </div>
                  );
                })}
              </div>
            ):(
              <p style={{ color:"rgba(255,255,255,0.3)", fontSize:13 }}>Laden…</p>
            )}
          </div>

          {/* ── Snelle links ── */}
          <div className="pv-card" style={{ padding:22, animationDelay:"60ms" }}>
            <p className="pv-label">Snelle links</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {LINKS.map(l=>(
                <a key={l.label} href={l.url} target="_blank" rel="noreferrer" className="pv-link">
                  <span style={{ fontSize:15 }}>{l.icon}</span>
                  <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{l.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* ── To-do ── */}
          <div className="pv-card" style={{ padding:22, animationDelay:"120ms" }}>
            <p className="pv-label">To-do</p>
            <div style={{ display:"flex", gap:8, marginBottom:14 }}>
              <input className="pv-input" value={nieuwTodo} onChange={e=>setNieuwTodo(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&voegTodoToe()} placeholder="Nieuwe taak… (Enter)" />
              <button className="pv-btn" onClick={voegTodoToe} style={{ flexShrink:0, padding:"9px 13px" }}><Plus className="h-4 w-4"/></button>
            </div>
            <ul style={{ display:"flex", flexDirection:"column", gap:8, maxHeight:280, overflowY:"auto" }}>
              {todos.length===0 && <p style={{ color:"rgba(255,255,255,0.25)", fontSize:13, textAlign:"center", padding:"16px 0" }}>Geen taken 🎉</p>}
              {todos.map(t=>(
                <li key={t.id} className="pv-todo-row">
                  <button className={`pv-check${t.gedaan?" done":""}`} onClick={()=>toggleTodo(t.id,!t.gedaan)}>
                    {t.gedaan&&<Check style={{ width:10, height:10, color:"#fff" }}/>}
                  </button>
                  <span style={{ flex:1, fontSize:13, color:t.gedaan?"rgba(255,255,255,0.3)":"#e8e6ff", textDecoration:t.gedaan?"line-through":"none", transition:"all 0.2s" }}>{t.tekst}</span>
                  <button className="del" onClick={()=>delTodo(t.id)}><X style={{ width:13, height:13 }}/></button>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Notities ── */}
          <div className="pv-card" style={{ padding:22, animationDelay:"160ms" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <p className="pv-label" style={{ margin:0 }}>Notities</p>
              <span style={{ fontSize:11, color:notStatus==="saved"?"rgba(124,106,247,0.7)":"rgba(255,255,255,0.3)" }}>
                {notStatus==="saved"?"✓ opgeslagen":"opslaan…"}
              </span>
            </div>
            <textarea className="pv-input" value={notitie} onChange={e=>handleNote(e.target.value)}
              placeholder="Snelle gedachten, ideeën, aantekeningen…"
              style={{ resize:"none", height:220, paddingTop:12, lineHeight:1.6 }}/>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.2)", marginTop:6, textAlign:"right" }}>{notitie.length} tekens</p>
          </div>

          {/* ── Gewoontes ── */}
          <div className="pv-card" style={{ padding:22, animationDelay:"200ms" }}>
            <p className="pv-label">Gewoontes</p>
            <div style={{ display:"flex", gap:8, marginBottom:18 }}>
              <input className="pv-input" value={nieuwG} onChange={e=>setNieuwG(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&voegGewoonteToe()} placeholder="Nieuwe gewoonte…"/>
              <button className="pv-btn" onClick={voegGewoonteToe} style={{ flexShrink:0, padding:"9px 13px" }}><Plus className="h-4 w-4"/></button>
            </div>
            {gewoontes.length===0
              ? <p style={{ color:"rgba(255,255,255,0.25)", fontSize:13, textAlign:"center", padding:"20px 0" }}>Voeg gewoontes toe om bij te houden.</p>
              : <div style={{ display:"flex", flexWrap:"wrap", gap:16, justifyContent:"center" }}>
                  {gewoontes.map(g=>(
                    <HabitRing key={g.id} g={g} vandaag={vandaag} onToggle={()=>toggleG(g.id,g.datums)} onDel={()=>delG(g.id)}/>
                  ))}
                </div>
            }
            {gewoontes.length>0 && (
              <p style={{ fontSize:11, color:"rgba(255,255,255,0.2)", textAlign:"center", marginTop:14 }}>
                Buitenste ring = 7-daags · Binnenste ring = vandaag
              </p>
            )}
          </div>

          {/* ── Pomodoro ── */}
          <div className="pv-card" style={{ padding:22, animationDelay:"240ms" }}>
            <p className="pv-label">Focus timer</p>
            <Pomodoro/>
          </div>

          {/* ── Bijbel ── */}
          <div className="pv-card" style={{ padding:28, gridColumn:"span 2", animationDelay:"280ms", background:"rgba(30,20,60,0.7)", borderColor:"rgba(124,106,247,0.2)" }}>
            <p className="pv-label" style={{ color:"rgba(167,139,250,0.6)" }}>Vers van de dag</p>
            <blockquote style={{ fontFamily:"var(--font-display,serif)", fontSize:18, fontWeight:500, lineHeight:1.7, color:"#ede9ff", margin:0, borderLeft:"3px solid rgba(124,106,247,0.4)", paddingLeft:18 }}>
              "{vers.tekst}"
            </blockquote>
            <p style={{ fontSize:13, color:"rgba(167,139,250,0.7)", marginTop:16, fontWeight:600 }}>— {vers.ref}</p>
          </div>

        </div>
      </main>

      {/* Floating Claude */}
      <a href="https://claude.ai" target="_blank" rel="noreferrer"
        style={{ position:"fixed", bottom:24, right:24, zIndex:50, display:"flex", alignItems:"center", gap:8, background:"linear-gradient(135deg,#7c6af7,#a78bfa)", color:"#fff", borderRadius:18, padding:"12px 20px", fontSize:14, fontWeight:600, textDecoration:"none", boxShadow:"0 8px 30px rgba(124,106,247,0.5)", transition:"all 0.2s" }}
        onMouseEnter={e=>{(e.currentTarget as HTMLAnchorElement).style.transform="translateY(-2px) scale(1.02)";(e.currentTarget as HTMLAnchorElement).style.boxShadow="0 12px 40px rgba(124,106,247,0.65)";}}
        onMouseLeave={e=>{(e.currentTarget as HTMLAnchorElement).style.transform="translateY(0) scale(1)";(e.currentTarget as HTMLAnchorElement).style.boxShadow="0 8px 30px rgba(124,106,247,0.5)";}}>
        🤖 Claude
        <ExternalLink className="h-3.5 w-3.5"/>
      </a>

      {/* Keyboard hint */}
      <div style={{ position:"fixed", bottom:28, left:24, zIndex:50, display:"flex", alignItems:"center", gap:6, fontSize:12, color:"rgba(255,255,255,0.22)" }}>
        <kbd style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:5, padding:"2px 7px", fontSize:11 }}>⌘K</kbd>
        snel zoeken
      </div>
    </div>
  );
};

export default Prive;
