import { useState, useRef, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════════
const T = {
  bg:"#0a0a0a", surface:"#ffffff", surfaceDim:"#f7f7f5", surfaceDimmer:"#f0efe9",
  border:"rgba(0,0,0,0.08)", borderDark:"rgba(255,255,255,0.06)",
  shadow:"0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.25)",
  shadowSm:"0 4px 16px rgba(0,0,0,0.3)",
  radius:16, radiusSm:10,
  purple:"#6366f1", violet:"#c084fc", green:"#4ade80", blue:"#38bdf8",
  textDark:"rgba(0,0,0,0.75)", textMid:"rgba(0,0,0,0.45)", textLight:"rgba(0,0,0,0.22)",
  textWhite:"#ffffff", textWhiteDim:"rgba(255,255,255,0.4)", textWhiteDimmer:"rgba(255,255,255,0.18)",
};



// ═══════════════════════════════════════════════════════════════════
// SHARED CONSTANTS
// ═══════════════════════════════════════════════════════════════════
const DEMO_AUDIO = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
const DEMO_VIDEO = "https://www.w3schools.com/html/mov_bbb.mp4";

const MOCK_USER = {
  name:"Geev", handle:"@geev", avatar:"G",
  plan:"Pro", credits:120, creditsMax:200,
  joined:"Jan 2026", projects:7, scenes:34,
};

const CREDIT_COSTS = [
  { key:"image", label:"Visual",  icon:"▭", cost:2 },
  { key:"video", label:"Video",   icon:"▶", cost:8 },
  { key:"audio", label:"Audio",   icon:"♪", cost:3 },
  { key:"score", label:"Score",   icon:"≋", cost:4 },
  { key:"stitch",label:"Stitch",  icon:"⬡", cost:5 },
];

const RECHARGE_PACKS = [
  { id:"s",  credits:100,  price:"$4.99",  label:"Starter", popular:false, perCredit:"$0.05" },
  { id:"m",  credits:300,  price:"$9.99",  label:"Popular", popular:true,  perCredit:"$0.03" },
  { id:"l",  credits:700,  price:"$19.99", label:"Pro",     popular:false, perCredit:"$0.03" },
  { id:"xl", credits:2000, price:"$49.99", label:"Studio",  popular:false, perCredit:"$0.02" },
];


// ═══════════════════════════════════════════════════════════════════
// ADMIN CONFIG STORE  (in-memory; swap for localStorage in prod)
// ═══════════════════════════════════════════════════════════════════
const ADMIN_PASSWORD = "sceneforge2026"; // change this before shipping

// ── Available EvoLink models ──────────────────────────────────────
const EVOLINK_IMAGE_MODELS = [
  { id:"gemini-3.1-flash-image-preview", label:"Nanobanana 2",       speed:"fast",   quality:"high"   },
  { id:"nano-banana-2-beta",             label:"Nanobanana 2 Beta",  speed:"fast",   quality:"medium" },
  { id:"gemini-3-pro-image-preview",     label:"Nanobanana Pro",     speed:"medium", quality:"best"   },
  { id:"gpt-image-2",                    label:"GPT Image 2",        speed:"medium", quality:"best"   },
  { id:"doubao-seedream-4.5",            label:"Seedream 4.5",       speed:"medium", quality:"high"   },
  { id:"doubao-seedream-5.0-lite",       label:"Seedream 5.0 Lite",  speed:"fast",   quality:"high"   },
];

const EVOLINK_VIDEO_MODELS = [
  // Image-to-Video (recommended for SceneForge — uses the generated image as first frame)
  { id:"seedance-2.0-image-to-video",  label:"Seedance 2.0 I2V",    mode:"i2v", speed:"medium", quality:"best",   endpoint:"/v1/videos/generations" },
  { id:"kling-v3-image-to-video",      label:"Kling V3 I2V",        mode:"i2v", speed:"medium", quality:"best",   endpoint:"/v1/videos/generations" },
  { id:"kling-v3-turbo-image-to-video",label:"Kling V3 Turbo I2V",  mode:"i2v", speed:"fast",   quality:"high",   endpoint:"/v1/videos/generations" },
  { id:"wan2.6-image-to-video",        label:"Wan 2.6 I2V",         mode:"i2v", speed:"medium", quality:"high",   endpoint:"/v1/videos/generations" },
  { id:"wan2.6-image-to-video-flash",  label:"Wan 2.6 Flash I2V",   mode:"i2v", speed:"fast",   quality:"medium", endpoint:"/v1/videos/generations" },
  { id:"hailuo-2.3-image-to-video",    label:"Hailuo 2.3 I2V",      mode:"i2v", speed:"fast",   quality:"high",   endpoint:"/v1/videos/generations" },
  // Text-to-Video (fallback when no image exists yet)
  { id:"seedance-2.0-text-to-video",   label:"Seedance 2.0 T2V",    mode:"t2v", speed:"medium", quality:"best",   endpoint:"/v1/videos/generations" },
  { id:"kling-v3-text-to-video",       label:"Kling V3 T2V",        mode:"t2v", speed:"medium", quality:"best",   endpoint:"/v1/videos/generations" },
  { id:"kling-v3-turbo-text-to-video", label:"Kling V3 Turbo T2V",  mode:"t2v", speed:"fast",   quality:"high",   endpoint:"/v1/videos/generations" },
  { id:"wan2.6-text-to-video",         label:"Wan 2.6 T2V",         mode:"t2v", speed:"medium", quality:"high",   endpoint:"/v1/videos/generations" },
];

const ADMIN_DEFAULTS = {
  // Auth
  evolinkApiKey:    "",
  geminiApiKey:     "",
  // Image generation
  evolinkEnabled:        false,
  evolinkImageModel:     "gemini-3.1-flash-image-preview",
  evolinkImageQuality:   "2K",
  evolinkImageAspect:    "9:16",
  // Video generation
  evolinkVideoEnabled:   false,
  evolinkVideoModel:     "seedance-2.0-image-to-video",  // I2V preferred
  evolinkVideoQuality:   "720p",
  evolinkVideoAspect:    "9:16",
  evolinkVideoDuration:  5,
  evolinkVideoAudio:     true,   // include AI-generated audio in video
  // Platform
  markupPercent:    40,
  freeTrialCredits: 10,
  maintenanceMode:  false,
};

const ADMIN_STORAGE_KEY = "sceneforge_admin_config";

// Load from localStorage on startup, fall back to defaults
function loadAdminConfig() {
  try {
    const saved = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (saved) return { ...ADMIN_DEFAULTS, ...JSON.parse(saved) };
  } catch(_) {}
  return { ...ADMIN_DEFAULTS };
}

let _adminConfig = loadAdminConfig();
const _adminListeners = new Set();
function getAdminConfig() { return _adminConfig; }
function setAdminConfig(patch) {
  _adminConfig = { ..._adminConfig, ...patch };
  // Persist to localStorage
  try { localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(_adminConfig)); } catch(_) {}
  _adminListeners.forEach(fn => fn({ ..._adminConfig }));
}
function useAdminConfig() {
  const [cfg, setCfg] = useState(getAdminConfig());
  useEffect(() => {
    _adminListeners.add(setCfg);
    return () => _adminListeners.delete(setCfg);
  }, []);
  return cfg;
}

// ═══════════════════════════════════════════════════════════════════
// EVOLINK API SERVICE  — unified image + video via one API key
// ═══════════════════════════════════════════════════════════════════

// ── Backend API base — auto-detects dev vs production ────────────
const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, ""); // strip trailing slash

// Safe fetch wrapper — shows real error instead of "Unexpected end of JSON"
async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  if (!API_BASE) throw new Error("Backend not configured — add VITE_API_URL in Vercel environment variables, then redeploy");
  const res = await fetch(url, options);
  const text = await res.text();
  if (!text) throw new Error(`Empty response from server (${res.status})`);
  try {
    const data = JSON.parse(text);
    if (!res.ok) throw new Error(data.error || `Server error ${res.status}`);
    return data;
  } catch(e) {
    if (e.message.includes("Server error") || e.message.includes("Backend not")) throw e;
    throw new Error(`Server returned non-JSON (${res.status}): ${text.slice(0,120)}`);
  }
}

// ── Poll task status via backend ──────────────────────────────────
async function evolinkPollTask(taskId, onProgress, maxWaitMs = 180000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    await new Promise(r => setTimeout(r, 3000));
    try {
      const data = await apiFetch(`/api/task/${taskId}`);
      if (onProgress) onProgress(Math.min(data.progress || 0, 99));
      if (data.status === "completed" && data.results?.[0]) {
        if (onProgress) onProgress(100);
        return data.results[0];
      }
      if (data.status === "failed") throw new Error(data.error?.message || "Task failed");
    } catch(e) {
      if (e.message.includes("failed") || e.message.includes("Backend")) throw e;
    }
  }
  throw new Error("Task timed out after 3 min");
}

// ── IMAGE generation via backend ──────────────────────────────────
async function evolinkGenerateImage(prompt, onProgress, options = {}) {
  const cfg = getAdminConfig();
  const { taskId } = await apiFetch(`/api/generate/image`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      model:     options.model   || cfg.evolinkImageModel   || "gemini-3.1-flash-image-preview",
      size:      options.size    || cfg.evolinkImageAspect  || "9:16",
      quality:   options.quality || cfg.evolinkImageQuality || "2K",
      imageUrls: options.imageUrls || [],
    }),
  });
  return await evolinkPollTask(taskId, onProgress);
}

// ── VIDEO generation via backend ──────────────────────────────────
async function evolinkGenerateVideo(prompt, imageUrl, onProgress, options = {}) {
  const cfg = getAdminConfig();
  const { taskId, usedModel, isI2V } = await apiFetch(`/api/generate/video`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      imageUrl:      imageUrl || null,
      model:         options.model    || cfg.evolinkVideoModel    || "seedance-2.0-image-to-video",
      quality:       options.quality  || cfg.evolinkVideoQuality  || "720p",
      aspect:        options.aspect   || cfg.evolinkVideoAspect   || "9:16",
      duration:      options.duration || cfg.evolinkVideoDuration || 5,
      generateAudio: cfg.evolinkVideoAudio !== false,
    }),
  });
  const url = await evolinkPollTask(taskId, onProgress, 240000);
  return { url, usedModel, isI2V };
}

// ═══════════════════════════════════════════════════════════════════
// PARROT TRANSITION SYSTEM
// ═══════════════════════════════════════════════════════════════════

// African Lovebird palette — 8 feather colors, cinematically sequenced
const PARROT_COLORS = [
  "#FF4D00", // flame orange — face blaze
  "#FF9500", // mango amber — throat
  "#FFD600", // solar yellow — chest
  "#7ED321", // leaf green  — wing
  "#1DB954", // emerald      — back
  "#00B4D8", // sky cyan     — rump
  "#7B2FBE", // violet       — tail tip
  "#FF2D78", // rose-pink    — cheek patch
];

// Decorative words per context — cinematic, not generic
const TRANSITION_WORDS = {
  create:    "CREATE",
  produce:   "PRODUCE",
  settings:  "TUNE",
  // catalogue steps
  products:  "PRODUCTS",
  model:     "MODEL",
  setting:   "SETTING",
  output:    "OUTPUT",
  shotlist:  "SHOTS",
  // film steps
  brief:     "BRIEF",
  storyboard:"STORY",
  scenes:    "SCENES",
  // generic fallback
  default:   "ACTION",
};

// Hook — returns { trigger } to fire a transition, and the overlay element
function useParrotTransition() {
  const [state, setState] = useState(null);
  const activeRef = useRef(false);

  function trigger(contextKey) {
    if (activeRef.current) return; // don't stack transitions
    const word = TRANSITION_WORDS[contextKey] || TRANSITION_WORDS.default;
    const letters = word.split("");
    activeRef.current = true;
    setState({ word, letters, phase: "enter", letterPhases: letters.map(() => 0) });
  }

  useEffect(() => {
    if (!state || state.phase !== "enter") return;

    const timers = [];
    const n = state.letters.length;

    // Phase 1: white arrival — stagger each letter in
    state.letters.forEach((_, i) => {
      timers.push(setTimeout(() => {
        setState(prev => {
          if (!prev) return prev;
          const lp = [...prev.letterPhases];
          lp[i] = 1;
          return { ...prev, letterPhases: lp };
        });
      }, 80 + i * 65));
    });

    // Phase 2: color burst
    const colorStart = 80 + n * 65 + 120;
    state.letters.forEach((_, i) => {
      timers.push(setTimeout(() => {
        setState(prev => {
          if (!prev) return prev;
          const lp = [...prev.letterPhases];
          lp[i] = 2;
          return { ...prev, letterPhases: lp };
        });
      }, colorStart + i * 55));
    });

    // Phase 3: dance
    const danceStart = colorStart + n * 55 + 80;
    timers.push(setTimeout(() => {
      setState(prev => prev ? { ...prev, letterPhases: prev.letterPhases.map(() => 3) } : prev);
    }, danceStart));

    // Phase 4: exit fade
    const exitStart = danceStart + 680;
    timers.push(setTimeout(() => {
      setState(prev => prev ? { ...prev, phase: "exit" } : prev);
    }, exitStart));

    // Phase 5: unmount
    timers.push(setTimeout(() => {
      setState(null);
      activeRef.current = false;
    }, exitStart + 420));

    return () => timers.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.word]); // only re-run when a new word is triggered

  return { trigger, transitionEl: state ? <ParrotOverlay state={state} /> : null };
}

function ParrotOverlay({ state }) {
  const { letters, letterPhases, phase } = state;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9000,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(8,8,10,0.97)",
      opacity: phase === "exit" ? 0 : 1,
      transition: phase === "exit" ? "opacity 0.38s ease-in" : "opacity 0.18s ease-out",
      pointerEvents: phase === "exit" ? "none" : "all",
    }}>
      {/* subtle radial glow behind letters */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 60% 35% at 50% 50%, rgba(126,211,33,0.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }}/>

      <div style={{ display: "flex", gap: 6, alignItems: "flex-end", position: "relative" }}>
        {letters.map((letter, i) => {
          const phase = letterPhases[i];
          const color = PARROT_COLORS[i % PARROT_COLORS.length];
          const nextColor = PARROT_COLORS[(i + 2) % PARROT_COLORS.length];

          return (
            <span key={i} style={{
              display: "inline-block",
              fontSize: "clamp(36px, 10vw, 64px)",
              fontWeight: 900,
              fontFamily: "Inter, system-ui, sans-serif",
              letterSpacing: "-0.02em",
              lineHeight: 1,
              userSelect: "none",

              // Color transitions
              color: phase === 0 ? "transparent"
                   : phase === 1 ? "#ffffff"
                   : phase >= 2  ? color
                   : "#ffffff",
              textShadow: phase >= 2
                ? `0 0 24px ${color}88, 0 0 48px ${color}44`
                : phase === 1
                ? "0 0 20px rgba(255,255,255,0.3)"
                : "none",

              // Opacity
              opacity: phase === 0 ? 0 : 1,

              // Entrance transform
              transform: phase === 0 ? "translateY(18px) scale(0.7)"
                       : phase === 3 ? undefined  // dance handles its own transform via animation
                       : "translateY(0) scale(1)",

              // Transitions
              transition: phase === 0 ? "none"
                        : phase === 1 ? `opacity 0.22s ease-out, transform 0.28s cubic-bezier(0.34,1.56,0.64,1), color 0.15s, text-shadow 0.15s`
                        : phase === 2 ? `color 0.28s ease-out ${i * 0.03}s, text-shadow 0.28s ease-out ${i * 0.03}s`
                        : "none",

              // Dance animation — each letter gets a different dance
              animation: phase === 3 ? `parrotDance${i % 4} 0.55s ease-in-out infinite alternate` : "none",
              animationDelay: phase === 3 ? `${i * 0.07}s` : "0s",
            }}>
              {letter}
            </span>
          );
        })}
      </div>

      {/* Small parrot feather dots — ambient particles */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden" }}>
        {PARROT_COLORS.map((color, i) => (
          <div key={i} style={{
            position: "absolute",
            width: 5, height: 5,
            borderRadius: "50%",
            background: color,
            opacity: phase === "exit" ? 0 : 0.35,
            boxShadow: `0 0 8px ${color}`,
            left: `${12 + (i * 11) % 76}%`,
            top:  `${30 + (i * 17) % 40}%`,
            animation: `featherFloat${i % 3} ${1.8 + i * 0.15}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.12}s`,
            transition: "opacity 0.3s",
          }}/>
        ))}
      </div>

      {/* Keyframes injected once */}
      <style>{`
        @keyframes parrotDance0 {
          0%   { transform: translateY(0)    rotate(-4deg)  scale(1);    }
          100% { transform: translateY(-14px) rotate(5deg)  scale(1.12); }
        }
        @keyframes parrotDance1 {
          0%   { transform: translateY(-8px)  rotate(3deg)  scale(1.08); }
          100% { transform: translateY(6px)   rotate(-6deg) scale(0.94); }
        }
        @keyframes parrotDance2 {
          0%   { transform: translateY(4px)   rotate(-2deg) scale(0.96); }
          100% { transform: translateY(-12px) rotate(7deg)  scale(1.1);  }
        }
        @keyframes parrotDance3 {
          0%   { transform: translateY(-10px) rotate(5deg)  scale(1.05); }
          100% { transform: translateY(8px)   rotate(-3deg) scale(0.92); }
        }
        @keyframes featherFloat0 {
          0%   { transform: translateY(0)    translateX(0);  }
          100% { transform: translateY(-18px) translateX(6px); }
        }
        @keyframes featherFloat1 {
          0%   { transform: translateY(0)    translateX(0);   }
          100% { transform: translateY(12px) translateX(-8px); }
        }
        @keyframes featherFloat2 {
          0%   { transform: translateY(0)    translateX(0);  }
          100% { transform: translateY(-9px) translateX(10px); }
        }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// SHARED UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════
function FloatingCard({ children, style, accentColor, onClick }) {
  return (
    <div onClick={onClick} style={{ background:T.surface, borderRadius:T.radius, boxShadow:T.shadow, overflow:"hidden", border:accentColor?`1.5px solid ${accentColor}33`:`1px solid ${T.border}`, cursor:onClick?"pointer":"default", ...style }}>
      {accentColor && <div style={{height:3,background:accentColor}}/>}
      {children}
    </div>
  );
}

function SectionLabel({ label, style }) {
  return <div style={{fontSize:8,fontWeight:700,color:T.textLight,letterSpacing:"0.08em",marginBottom:6,...style}}>{label}</div>;
}

function Tag({ label, color, onRemove }) {
  return (
    <div style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 9px",background:color+"15",border:`1px solid ${color}33`,borderRadius:20,fontSize:9,color,fontWeight:600}}>
      {label}
      {onRemove && <button onClick={onRemove} style={{background:"transparent",border:"none",color,cursor:"pointer",fontSize:11,padding:0,lineHeight:1}}>×</button>}
    </div>
  );
}

function Toggle({ value, onChange, leftLabel, rightLabel }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:0,background:"rgba(255,255,255,0.06)",borderRadius:22,padding:3,border:`1px solid ${T.borderDark}`}}>
      {[{v:"left",l:leftLabel},{v:"right",l:rightLabel}].map(({v,l})=>(
        <button key={v} onClick={()=>onChange(v)} style={{padding:"5px 14px",borderRadius:20,background:value===v?"#fff":"transparent",border:"none",fontSize:10,fontWeight:value===v?700:400,color:value===v?T.textDark:T.textWhiteDim,cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s",whiteSpace:"nowrap"}}>{l}</button>
      ))}
    </div>
  );
}

function Whiteboard({ height=130, label, children }) {
  return (
    <div style={{height,borderRadius:T.radiusSm,background:T.surfaceDimmer,border:`1px solid ${T.border}`,backgroundImage:"linear-gradient(rgba(0,0,0,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.04) 1px,transparent 1px)",backgroundSize:"20px 20px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,position:"relative",overflow:"hidden"}}>
      {[[8,null,8,null],[8,null,null,8],[null,8,8,null],[null,8,null,8]].map(([t,b,l,r],i)=>(
        <div key={i} style={{position:"absolute",top:t??undefined,bottom:b??undefined,left:l??undefined,right:r??undefined,width:10,height:10,borderTop:t!=null?"1.5px solid rgba(0,0,0,0.1)":undefined,borderBottom:b!=null?"1.5px solid rgba(0,0,0,0.1)":undefined,borderLeft:l!=null?"1.5px solid rgba(0,0,0,0.1)":undefined,borderRight:r!=null?"1.5px solid rgba(0,0,0,0.1)":undefined}}/>
      ))}
      {label && <div style={{fontSize:9,color:T.textLight,fontFamily:"monospace"}}>{label}</div>}
      {children}
    </div>
  );
}

function AudioPlayer({ url, color=T.violet }) {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [prog, setProg] = useState(0);
  useEffect(()=>{
    const a=ref.current; if(!a) return;
    const up=()=>setProg(a.duration?(a.currentTime/a.duration)*100:0);
    const end=()=>setPlaying(false);
    a.addEventListener("timeupdate",up); a.addEventListener("ended",end);
    return()=>{a.removeEventListener("timeupdate",up);a.removeEventListener("ended",end);};
  },[]);
  function toggle(){ if(!ref.current) return; if(playing){ref.current.pause();setPlaying(false);}else{ref.current.play();setPlaying(true);} }
  return (
    <div style={{background:T.surface,borderRadius:T.radiusSm,padding:"7px 9px",border:`1px solid ${color}22`}}>
      <audio ref={ref} src={url} style={{display:"none"}}/>
      <div style={{display:"flex",alignItems:"center",gap:7}}>
        <button onClick={toggle} style={{width:24,height:24,borderRadius:"50%",background:color+"18",border:`1px solid ${color}44`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color,fontSize:9,flexShrink:0}}>{playing?"⏸":"▶"}</button>
        <div style={{flex:1,display:"flex",alignItems:"center",gap:1.5,height:18}}>
          {Array.from({length:20}).map((_,i)=>{const h=3+Math.abs(Math.sin(i*0.85))*11+(i%3);return <div key={i} style={{flex:1,height:h,borderRadius:1,background:(i/20)*100<prog?color:color+"25"}}/>;})}
        </div>
      </div>
    </div>
  );
}

function Fullscreen({ type, url, onClose }) {
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.96)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(12px)"}}>
      <button onClick={onClose} style={{position:"absolute",top:20,right:20,background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:"50%",width:40,height:40,color:"#fff",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
      <div onClick={e=>e.stopPropagation()}>
        {type==="image"&&<img src={url} style={{maxWidth:"92vw",maxHeight:"92vh",borderRadius:12,objectFit:"contain"}}/>}
        {type==="video"&&<video src={url} controls autoPlay style={{maxWidth:"92vw",maxHeight:"92vh",borderRadius:12}}/>}
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════
// CREDIT · PROFILE · LIBRARY
// ═══════════════════════════════════════════════════════════════════

// ── Credit Pill ───────────────────────────────────────────────────────────────
function CreditPill({ credits, creditsMax, onRecharge }) {
  const pct  = Math.max(0, (credits / creditsMax) * 100);
  const low  = credits <= 20;
  const crit = credits <= 5;

  return (
    <div onClick={onRecharge} style={{
      display:"flex", alignItems:"center", gap:8,
      padding:"5px 12px 5px 6px",
      background:"rgba(10,10,10,0.95)",
      backdropFilter:"blur(20px)",
      borderRadius:28,
      border:`1px solid ${crit?"rgba(255,255,255,0.2)":low?"rgba(255,255,255,0.12)":"rgba(255,255,255,0.08)"}`,
      boxShadow: crit
        ? `0 0 20px ${T.purple}55, 0 0 8px ${T.purple}33, 0 2px 8px rgba(0,0,0,0.6)`
        : `0 0 12px ${T.purple}22, 0 2px 8px rgba(0,0,0,0.5)`,
      cursor:"pointer",
      transition:"all 0.3s",
      userSelect:"none",
    }}>
      {/* Glowing circle icon */}
      <div style={{
        width:26, height:26, borderRadius:"50%",
        background:`radial-gradient(circle at 35% 35%, ${T.purple}55, transparent 70%)`,
        border:`1.5px solid ${crit?"rgba(255,255,255,0.35)":T.purple+"66"}`,
        display:"flex", alignItems:"center", justifyContent:"center",
        boxShadow: crit
          ? `0 0 12px ${T.purple}88, inset 0 0 6px ${T.purple}44`
          : `0 0 8px ${T.purple}44`,
        flexShrink:0,
        animation: crit ? "glow 1.5s ease-in-out infinite" : "none",
      }}>
        <span style={{
          fontSize:10, fontWeight:700,
          color: crit ? "#fff" : "rgba(255,255,255,0.8)",
          letterSpacing:"-0.5px",
        }}>cr</span>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:2}}>
        {/* Count */}
        <div style={{
          fontSize:13, fontWeight:700, color:"#fff",
          lineHeight:1, fontVariantNumeric:"tabular-nums",
          display:"flex", alignItems:"baseline", gap:3,
        }}>
          {credits}
          <span style={{fontSize:8,color:T.textWhiteDimmer,fontWeight:400}}>/ {creditsMax}</span>
        </div>
        {/* Bar */}
        <div style={{width:44,height:2,background:"rgba(255,255,255,0.08)",borderRadius:1}}>
          <div style={{
            height:"100%", width:pct+"%",
            background: crit
              ? `linear-gradient(90deg,${T.purple},${T.violet})`
              : low
              ? `linear-gradient(90deg,${T.purple}88,${T.purple})`
              : `linear-gradient(90deg,${T.purple},${T.violet})`,
            borderRadius:1,
            transition:"width 0.5s",
            boxShadow: crit ? `0 0 4px ${T.purple}` : "none",
          }}/>
        </div>
      </div>

      {crit && (
        <div style={{
          fontSize:9, fontWeight:700, color:"rgba(255,255,255,0.9)",
          animation:"fadePulse 1s infinite",
          letterSpacing:"0.02em",
        }}>!</div>
      )}
    </div>
  );
}

// ── Recharge Modal ────────────────────────────────────────────────────────────
function RechargeModal({ credits, creditsMax, autoTriggered, onClose, onRecharge }) {
  const [selected, setSelected]   = useState("m");
  const [purchasing, setPurchasing] = useState(false);
  const [done, setDone]            = useState(false);

  async function handlePurchase() {
    setPurchasing(true);
    await new Promise(r=>setTimeout(r,1500));
    const pack = RECHARGE_PACKS.find(p=>p.id===selected);
    setDone(true);
    setTimeout(()=>{ onRecharge(pack.credits); onClose(); }, 1200);
  }

  const pack = RECHARGE_PACKS.find(p=>p.id===selected);

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(8px)"}}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:"#111", borderRadius:"22px 22px 0 0",
        width:"100%", maxWidth:480,
        maxHeight:"92vh",
        boxShadow:"0 -8px 48px rgba(0,0,0,0.8)",
        border:`1px solid ${T.borderDark}`, borderBottom:"none",
        display:"flex", flexDirection:"column",
        overflow:"hidden",
      }}>
        <div style={{height:3,background:`linear-gradient(90deg,${T.purple},${T.violet})`,flexShrink:0}}/>
        <div style={{overflowY:"auto",padding:"20px 20px 40px"}}>

          {/* Top bar with back button */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
            <button onClick={onClose} style={{
              display:"flex",alignItems:"center",gap:6,
              background:"transparent",border:"none",
              color:T.textWhiteDim,cursor:"pointer",fontFamily:"inherit",
              padding:"4px 0",
            }}>
              <span style={{fontSize:18,lineHeight:1,marginTop:-1}}>←</span>
              <span style={{fontSize:12,fontWeight:500}}>Back</span>
            </button>
            <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>Top Up Credits</div>
            <div style={{width:52}}/>{/* spacer to centre title */}
          </div>

          {/* Low credit warning */}
          {autoTriggered && (
            <div style={{
              background:"rgba(255,255,255,0.03)",
              border:`1px solid rgba(255,255,255,0.1)`,
              borderRadius:T.radiusSm, padding:"10px 14px",
              marginBottom:16, display:"flex", alignItems:"center", gap:8,
            }}>
              <div style={{width:6,height:6,borderRadius:"50%",background:T.purple,flexShrink:0,animation:"fadePulse 1s infinite"}}/>
              <div style={{fontSize:11,color:T.textWhiteDim,fontWeight:500}}>Running low — top up to keep generating</div>
            </div>
          )}

          {/* Balance */}
          <div style={{marginBottom:16}}>
            <div style={{fontSize:11,color:T.textWhiteDim}}>
              Balance: <span style={{color:"#fff",fontWeight:600}}>{credits}</span>
              <span style={{color:T.textWhiteDimmer}}> / {creditsMax}</span>
            </div>
          </div>

          {/* Cost ref */}
          <div style={{
            background:"rgba(255,255,255,0.03)",
            border:`1px solid ${T.borderDark}`,
            borderRadius:T.radiusSm, padding:"10px 14px", marginBottom:16,
          }}>
            <div style={{fontSize:8,color:T.textWhiteDimmer,fontWeight:700,letterSpacing:"0.08em",marginBottom:8}}>COST PER ACTION</div>
            <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
              {CREDIT_COSTS.map(c=>(
                <div key={c.key} style={{display:"flex",alignItems:"center",gap:5}}>
                  <span style={{fontSize:11,color:"rgba(255,255,255,0.5)"}}>{c.icon}</span>
                  <span style={{fontSize:9,color:T.textWhiteDimmer}}>{c.label}</span>
                  <span style={{fontSize:9,color:"rgba(255,255,255,0.6)",fontWeight:600}}>{c.cost}cr</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pack grid */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
            {RECHARGE_PACKS.map(p=>(
              <div key={p.id} onClick={()=>setSelected(p.id)} style={{
                background: selected===p.id
                  ? `linear-gradient(145deg, rgba(99,102,241,0.18), rgba(192,132,252,0.1))`
                  : "rgba(255,255,255,0.05)",
                border:`1.5px solid ${selected===p.id ? T.purple : "rgba(255,255,255,0.1)"}`,
                borderRadius:T.radius, padding:"14px 12px",
                cursor:"pointer", position:"relative",
                transition:"all 0.2s",
                boxShadow: selected===p.id
                  ? `0 0 24px ${T.purple}33, inset 0 0 0 1px ${T.purple}22`
                  : "inset 0 1px 0 rgba(255,255,255,0.05)",
              }}
                onMouseEnter={e=>{ if(p.id!==selected){ e.currentTarget.style.background="rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.18)"; }}}
                onMouseLeave={e=>{ if(p.id!==selected){ e.currentTarget.style.background="rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"; }}}
              >
                {/* Best value — inside card, top row */}
                {p.popular && (
                  <div style={{
                    display:"inline-flex", alignItems:"center", gap:4,
                    background:T.purple,
                    borderRadius:20, padding:"2px 8px",
                    fontSize:7, fontWeight:700, color:"#fff",
                    letterSpacing:"0.06em", marginBottom:8,
                  }}>BEST VALUE</div>
                )}
                {!p.popular && <div style={{height:18,marginBottom:8}}/>}

                <div style={{fontSize:26,fontWeight:800,color:"#fff",lineHeight:1,fontVariantNumeric:"tabular-nums",marginBottom:2}}>{p.credits}</div>
                <div style={{fontSize:8,color:T.textWhiteDimmer,marginBottom:10,letterSpacing:"0.04em"}}>CREDITS</div>
                <div style={{fontSize:15,fontWeight:700,color:selected===p.id?"#fff":"rgba(255,255,255,0.85)",marginBottom:2}}>{p.price}</div>
                <div style={{fontSize:8,color:T.textWhiteDimmer}}>{p.perCredit} per credit</div>

                {/* Selected tick */}
                {selected===p.id && (
                  <div style={{
                    position:"absolute",top:10,right:10,
                    width:18,height:18,borderRadius:"50%",
                    background:T.purple,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:9,color:"#fff",fontWeight:700,
                    boxShadow:`0 0 8px ${T.purple}88`,
                  }}>✓</div>
                )}
              </div>
            ))}
          </div>

          {/* Buy button */}
          <button onClick={handlePurchase} disabled={purchasing||done} style={{
            width:"100%", padding:"14px",
            background: done ? "rgba(255,255,255,0.1)" : `linear-gradient(135deg,${T.purple},${T.violet})`,
            border: done ? `1px solid rgba(255,255,255,0.1)` : "none",
            borderRadius:T.radius,
            color:"#fff", fontSize:13, fontWeight:700,
            cursor:purchasing||done?"default":"pointer",
            fontFamily:"inherit",
            display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            transition:"all 0.3s",
            boxShadow: done ? "none" : `0 4px 20px ${T.purple}44`,
          }}>
            {done
              ? "Credits added"
              : purchasing
              ? <><span style={{animation:"spin 1s linear infinite",display:"inline-block"}}>⟳</span> Processing...</>
              : `Add ${pack?.credits} credits · ${pack?.price}`
            }
          </button>
          <div style={{fontSize:9,color:T.textWhiteDimmer,textAlign:"center",marginTop:10}}>Credits never expire</div>
        </div>
      </div>
    </div>
  );
}

// ── Profile Sheet ─────────────────────────────────────────────────────────────
function ProfileSheet({ user, credits, onClose, onRecharge, onLibrary, onSettings, onSignOut }) {
  const pct = Math.max(0,(credits/user.creditsMax)*100);
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:900,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(6px)"}}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:"#111", borderRadius:"22px 22px 0 0",
        width:"100%", maxWidth:480,
        maxHeight:"90vh",
        boxShadow:"0 -8px 40px rgba(0,0,0,0.7)",
        border:`1px solid ${T.borderDark}`, borderBottom:"none",
        display:"flex", flexDirection:"column",
        overflow:"hidden",
      }}>
        <div style={{height:3,background:`linear-gradient(90deg,${T.purple},${T.violet})`,flexShrink:0}}/>
        <div style={{overflowY:"auto",padding:"16px 20px 48px"}}>
          {/* Top bar */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
            <button onClick={onClose} style={{display:"flex",alignItems:"center",gap:6,background:"transparent",border:"none",color:T.textWhiteDim,cursor:"pointer",fontFamily:"inherit",padding:"4px 0"}}>
              <span style={{fontSize:18,lineHeight:1,marginTop:-1}}>←</span>
              <span style={{fontSize:12,fontWeight:500}}>Back</span>
            </button>
            <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>Profile</div>
            <div style={{width:52}}/>
          </div>

          {/* Avatar + info */}
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20}}>
            <div style={{
              width:60, height:60, borderRadius:"50%",
              background:`linear-gradient(135deg,${T.purple},${T.violet})`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:22, fontWeight:700, color:"#fff",
              boxShadow:`0 0 28px ${T.purple}44`,
              flexShrink:0,
            }}>{user.avatar}</div>
            <div>
              <div style={{fontSize:17,fontWeight:700,color:"#fff",marginBottom:3}}>{user.name}</div>
              <div style={{fontSize:11,color:T.textWhiteDim,marginBottom:6,fontFamily:"monospace"}}>{user.handle}</div>
              <div style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 10px",background:`rgba(99,102,241,0.12)`,border:`1px solid ${T.purple}33`,borderRadius:20}}>
                <div style={{width:5,height:5,borderRadius:"50%",background:T.purple}}/>
                <span style={{fontSize:9,fontWeight:700,color:T.purple}}>{user.plan}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{display:"flex",gap:8,marginBottom:16}}>
            {[{label:"Projects",value:user.projects},{label:"Scenes",value:user.scenes},{label:"Since",value:user.joined}].map(({label,value})=>(
              <div key={label} style={{flex:1,background:"rgba(255,255,255,0.03)",border:`1px solid ${T.borderDark}`,borderRadius:T.radiusSm,padding:"10px 8px",textAlign:"center"}}>
                <div style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:3}}>{value}</div>
                <div style={{fontSize:8,color:T.textWhiteDimmer,fontWeight:500,letterSpacing:"0.04em"}}>{label.toUpperCase()}</div>
              </div>
            ))}
          </div>

          {/* Credit card */}
          <div style={{background:"rgba(99,102,241,0.06)",border:`1px solid ${T.purple}33`,borderRadius:T.radius,padding:"16px",marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
              <div>
                <div style={{fontSize:8,color:T.textWhiteDimmer,fontWeight:700,letterSpacing:"0.08em",marginBottom:6}}>CREDIT BALANCE</div>
                <div style={{display:"flex",alignItems:"baseline",gap:5}}>
                  <span style={{fontSize:30,fontWeight:800,color:"#fff",fontVariantNumeric:"tabular-nums"}}>{credits}</span>
                  <span style={{fontSize:11,color:T.textWhiteDimmer}}>/ {user.creditsMax}</span>
                </div>
              </div>
              <button onClick={onRecharge} style={{padding:"8px 14px",background:`linear-gradient(135deg,${T.purple},${T.violet})`,border:"none",borderRadius:T.radiusSm,color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",boxShadow:`0 4px 12px ${T.purple}44`}}>+ Top Up</button>
            </div>
            <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:2,marginBottom:12,overflow:"hidden"}}>
              <div style={{height:"100%",width:pct+"%",background:`linear-gradient(90deg,${T.purple},${T.violet})`,borderRadius:2,transition:"width 0.5s"}}/>
            </div>
            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              {CREDIT_COSTS.map(c=>(
                <div key={c.key} style={{display:"flex",alignItems:"center",gap:4}}>
                  <span style={{fontSize:10,color:"rgba(255,255,255,0.35)"}}>{c.icon}</span>
                  <span style={{fontSize:8,color:T.textWhiteDimmer}}>{c.label} {c.cost}cr</span>
                </div>
              ))}
            </div>
          </div>

          {/* Menu items */}
          <div style={{display:"flex",flexDirection:"column",gap:1}}>
            {[
              { icon:"▣", label:"Library",       sub:"Projects, models, assets",   action:()=>{onClose();onLibrary?.();}  },
              { icon:"◎", label:"Settings",       sub:"API keys, preferences",       action:()=>{onClose();onSettings?.();} },
              { icon:"≡", label:"Usage History",  sub:"Credits spent per project",   action:onClose },
            ].map(({icon,label,sub,action})=>(
              <button key={label} onClick={action} style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"13px 14px",background:"transparent",border:"none",borderTop:`1px solid ${T.borderDark}`,cursor:"pointer",fontFamily:"inherit",textAlign:"left",transition:"background 0.1s"}}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.04)"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{width:28,height:28,borderRadius:"50%",background:"rgba(255,255,255,0.05)",border:`1px solid ${T.borderDark}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:T.textWhiteDim,flexShrink:0}}>{icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:600,color:"#fff"}}>{label}</div>
                  {sub && <div style={{fontSize:9,color:T.textWhiteDimmer,marginTop:1}}>{sub}</div>}
                </div>
                <span style={{fontSize:14,color:T.textWhiteDimmer}}>›</span>
              </button>
            ))}

            {/* Sign Out — separate with confirm */}
            {!confirmSignOut ? (
              <button onClick={()=>setConfirmSignOut(true)} style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"13px 14px",background:"transparent",border:"none",borderTop:`1px solid ${T.borderDark}`,cursor:"pointer",fontFamily:"inherit",textAlign:"left",transition:"background 0.1s"}}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(255,80,80,0.06)"}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <div style={{width:28,height:28,borderRadius:"50%",background:"rgba(255,80,80,0.08)",border:"1px solid rgba(255,80,80,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"rgba(255,80,80,0.6)",flexShrink:0}}>→</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:600,color:"rgba(255,100,100,0.7)"}}>Sign Out</div>
                </div>
              </button>
            ) : (
              <div style={{padding:"14px",borderTop:`1px solid ${T.borderDark}`,background:"rgba(255,50,50,0.06)",borderRadius:"0 0 16px 16px"}}>
                <div style={{fontSize:11,color:"rgba(255,150,150,0.9)",marginBottom:10,textAlign:"center"}}>Sign out of SceneForge?</div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>setConfirmSignOut(false)} style={{flex:1,padding:"9px",background:"rgba(255,255,255,0.06)",border:`1px solid ${T.borderDark}`,borderRadius:T.radiusSm,color:T.textWhiteDim,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
                  <button onClick={()=>{onSignOut?.();onClose();}} style={{flex:1,padding:"9px",background:"rgba(200,50,50,0.3)",border:"1px solid rgba(200,50,50,0.4)",borderRadius:T.radiusSm,color:"#ff8080",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Sign Out</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Library Sheet ─────────────────────────────────────────────────────────────
function LibrarySheet({ library, onAddToLibrary, onClose }) {
  const [filter, setFilter] = useState("all");
  const [uploadingSection, setUploadingSection] = useState(null); // "model"|"product"|"asset"
  const [uploading, setUploading] = useState(false);

  const FILTERS = [
    { v:"all",     label:"All"      },
    { v:"project", label:"Projects" },
    { v:"model",   label:"Models"   },
    { v:"product", label:"Products" },
    { v:"asset",   label:"Assets"   },
  ];

  const TYPE_LABELS = { project:"Project", model:"Model", product:"Product", asset:"Asset" };

  // Merge mock + real library
  const allItems = [...MOCK_LIBRARY, ...library];
  const filtered = filter==="all" ? allItems : allItems.filter(i=>i.type===filter);

  // Sections with upload capability
  const UPLOAD_SECTIONS = [
    { type:"model",   label:"Models",   hint:"Upload a model photo — Claude extracts description", icon:"◉" },
    { type:"product", label:"Products", hint:"Upload product images for catalogue shoots",          icon:"▣" },
    { type:"asset",   label:"Assets",   hint:"Upload reference images, stills or brand assets",     icon:"◫" },
  ];

  async function handleUpload(type, file) {
    setUploading(true);
    const url = URL.createObjectURL(file);
    const handle = "@" + file.name.split(".")[0].toLowerCase().replace(/[^a-z0-9_]/g,"_").slice(0,18);
    const name = file.name.split(".")[0].replace(/_/g," ");
    // In real app: Claude Vision would extract description here
    const newItem = {
      id: "u_" + Date.now(),
      type,
      handle,
      name,
      title: name,
      thumb: url,
      description: "Uploaded — tap to add description",
      date: "Just now",
      ...(type==="asset" ? { assetType: file.type.startsWith("video")?"video":"image" } : {}),
    };
    setTimeout(()=>{
      onAddToLibrary(newItem);
      setUploading(false);
      setUploadingSection(null);
      setFilter(type);
    }, 600);
  }

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:900,display:"flex",alignItems:"flex-end",backdropFilter:"blur(6px)"}}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:"#111", borderRadius:"22px 22px 0 0",
        width:"100%", height:"88vh",
        boxShadow:"0 -8px 40px rgba(0,0,0,0.7)",
        border:`1px solid ${T.borderDark}`, borderBottom:"none",
        display:"flex", flexDirection:"column", overflow:"hidden",
      }}>
        <div style={{height:3,background:`linear-gradient(90deg,${T.purple},${T.violet})`,flexShrink:0}}/>

        {/* Header */}
        <div style={{padding:"14px 18px 0",flexShrink:0}}>
          {/* Top bar */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <button onClick={onClose} style={{display:"flex",alignItems:"center",gap:6,background:"transparent",border:"none",color:T.textWhiteDim,cursor:"pointer",fontFamily:"inherit",padding:"4px 0"}}>
              <span style={{fontSize:18,lineHeight:1,marginTop:-1}}>←</span>
              <span style={{fontSize:12,fontWeight:500}}>Back</span>
            </button>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>Library</div>
              <div style={{fontSize:8,color:T.textWhiteDimmer,marginTop:1}}>{allItems.length} items</div>
            </div>
            <div style={{width:52}}/>
          </div>

          {/* Filter tabs */}
          <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:12,scrollbarWidth:"none"}}>
            {FILTERS.map(f=>(
              <button key={f.v} onClick={()=>{ setFilter(f.v); setUploadingSection(null); }} style={{
                flexShrink:0, padding:"5px 12px",
                background:filter===f.v ? "#fff" : "rgba(255,255,255,0.04)",
                border:`1px solid ${filter===f.v?"rgba(255,255,255,0.15)":T.borderDark}`,
                borderRadius:20,
                color:filter===f.v ? T.textDark : T.textWhiteDim,
                fontSize:10, fontWeight:filter===f.v?700:400,
                cursor:"pointer", fontFamily:"inherit",
                transition:"all 0.15s",
              }}>{f.label}</button>
            ))}
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{flex:1,overflowY:"auto",padding:"0 14px 32px"}}>

          {/* Upload sections — shown for model/product/asset filters or all */}
          {(filter==="all"||UPLOAD_SECTIONS.some(s=>s.type===filter)) && (
            <div style={{marginBottom:16}}>
              {/* Section header */}
              <div style={{fontSize:8,fontWeight:700,color:T.textWhiteDimmer,letterSpacing:"0.08em",marginBottom:10}}>
                {filter==="all" ? "ADD TO LIBRARY" : `ADD ${filter.toUpperCase()}`}
              </div>

              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {UPLOAD_SECTIONS.filter(s=>filter==="all"||s.type===filter).map(sec=>(
                  <div key={sec.type}>
                    <label style={{display:"block",cursor:"pointer",position:"relative"}}>
                      <input
                        type="file"
                        accept={sec.type==="asset"?"image/*,video/*":"image/*"}
                        style={{position:"absolute",inset:0,opacity:0,width:"100%",height:"100%",cursor:"pointer",zIndex:2}}
                        onChange={e=>{ const f=e.target.files[0]; if(f) handleUpload(sec.type,f); e.target.value=""; }}
                      />
                      <div style={{
                        padding:"11px 14px",
                        background: uploadingSection===sec.type&&uploading ? `rgba(99,102,241,0.1)` : "rgba(255,255,255,0.03)",
                        border:`1px dashed ${uploading&&uploadingSection===sec.type ? T.purple : "rgba(255,255,255,0.12)"}`,
                        borderRadius:T.radiusSm,
                        display:"flex", alignItems:"center", gap:12,
                        transition:"all 0.15s",
                        pointerEvents:"none",
                      }}>
                        <div style={{
                          width:32,height:32,borderRadius:"50%",
                          background:"rgba(255,255,255,0.05)",
                          border:`1px solid rgba(255,255,255,0.1)`,
                          display:"flex",alignItems:"center",justifyContent:"center",
                          fontSize:14,color:"rgba(255,255,255,0.3)",flexShrink:0,
                        }}>
                          {uploading&&uploadingSection===sec.type
                            ? <span style={{animation:"spin 1s linear infinite",display:"inline-block",fontSize:12}}>⟳</span>
                            : sec.icon
                          }
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:11,fontWeight:600,color:uploading&&uploadingSection===sec.type?T.purple:"rgba(255,255,255,0.7)",marginBottom:2}}>
                            {uploading&&uploadingSection===sec.type ? `Uploading ${sec.label.toLowerCase()}...` : `Upload ${sec.label}`}
                          </div>
                          <div style={{fontSize:9,color:T.textWhiteDimmer,lineHeight:1.4}}>{sec.hint}</div>
                        </div>
                        <span style={{fontSize:16,color:"rgba(255,255,255,0.15)"}}>+</span>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Items grid */}
          {filtered.length > 0 && (
            <>
              <div style={{fontSize:8,fontWeight:700,color:T.textWhiteDimmer,letterSpacing:"0.08em",marginBottom:10}}>
                {filter==="all" ? "ALL ITEMS" : filter.toUpperCase()+"S"}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {filtered.map(item=>(
                  <div key={item.id} style={{
                    background:"rgba(255,255,255,0.03)",
                    border:`1px solid ${T.borderDark}`,
                    borderRadius:T.radius, overflow:"hidden",
                    cursor:"pointer", transition:"all 0.15s",
                  }}
                    onMouseEnter={e=>{ e.currentTarget.style.borderColor="rgba(255,255,255,0.14)"; e.currentTarget.style.background="rgba(255,255,255,0.05)"; }}
                    onMouseLeave={e=>{ e.currentTarget.style.borderColor=T.borderDark; e.currentTarget.style.background="rgba(255,255,255,0.03)"; }}
                  >
                    {/* Thumbnail */}
                    <div style={{height:80,position:"relative",overflow:"hidden",background:"#1a1a1a"}}>
                      <img src={item.thumb} style={{width:"100%",height:"100%",objectFit:"cover",display:"block",opacity:0.85}}/>
                      <div style={{position:"absolute",inset:0,background:"linear-gradient(transparent 40%,rgba(0,0,0,0.65))"}}/>
                      {/* Type label */}
                      <div style={{position:"absolute",top:6,left:6,padding:"1px 6px",background:"rgba(0,0,0,0.7)",backdropFilter:"blur(4px)",borderRadius:20,fontSize:7,fontWeight:700,color:"rgba(255,255,255,0.6)",letterSpacing:"0.07em",border:"1px solid rgba(255,255,255,0.08)"}}>
                        {TYPE_LABELS[item.type]?.toUpperCase()}
                      </div>
                      {/* Status dot */}
                      {item.type==="project" && (
                        <div style={{position:"absolute",top:6,right:6,width:6,height:6,borderRadius:"50%",background:item.status==="complete"?"#fff":"rgba(255,255,255,0.35)",boxShadow:item.status==="complete"?"0 0 5px rgba(255,255,255,0.4)":"none"}}/>
                      )}
                    </div>
                    {/* Info */}
                    <div style={{padding:"7px 9px 8px"}}>
                      <div style={{fontSize:10,fontWeight:600,color:"#fff",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",marginBottom:2}}>
                        {item.title||item.name||item.handle}
                      </div>
                      {(item.handle||item.description) && (
                        <div style={{fontSize:8,color:T.textWhiteDimmer,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",marginBottom:4,fontFamily:item.handle?"monospace":"inherit"}}>
                          {item.handle||item.description?.slice(0,28)}
                        </div>
                      )}
                      <div style={{display:"flex",justifyContent:"space-between"}}>
                        <span style={{fontSize:7,color:"rgba(255,255,255,0.2)"}}>{item.scenes?`${item.scenes} scenes`:item.assetType||""}</span>
                        <span style={{fontSize:7,color:"rgba(255,255,255,0.2)"}}>{item.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {filtered.length===0 && (
            <div style={{textAlign:"center",padding:"40px 20px",color:T.textWhiteDimmer}}>
              <div style={{fontSize:28,marginBottom:10,opacity:0.2}}>◫</div>
              <div style={{fontSize:11}}>No {filter==="all"?"items":filter+"s"} yet</div>
              <div style={{fontSize:9,marginTop:4,opacity:0.6}}>Upload above to get started</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Out of Credits popup ──────────────────────────────────────────────────────
function OutOfCreditsPopup({ onRecharge, onDismiss }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:"24px",backdropFilter:"blur(12px)"}}>
      <div style={{
        background:"#111", borderRadius:T.radius,
        width:"100%", maxWidth:320,
        border:`1px solid rgba(255,255,255,0.1)`,
        boxShadow:`0 0 48px ${T.purple}22, 0 8px 32px rgba(0,0,0,0.8)`,
        overflow:"hidden",
      }}>
        <div style={{height:3,background:`linear-gradient(90deg,${T.purple},${T.violet})`}}/>
        <div style={{padding:"28px 24px"}}>
          <div style={{textAlign:"center",marginBottom:20}}>
            {/* Icon */}
            <div style={{
              width:52,height:52,borderRadius:"50%",
              background:`radial-gradient(circle at 35% 35%, ${T.purple}44, transparent 70%)`,
              border:`1.5px solid ${T.purple}44`,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:20,margin:"0 auto 14px",
              boxShadow:`0 0 24px ${T.purple}33`,
            }}>
              <span style={{color:"rgba(255,255,255,0.8)",fontSize:16,fontWeight:700,fontFamily:"monospace"}}>cr</span>
            </div>
            <div style={{fontSize:17,fontWeight:700,color:"#fff",marginBottom:6}}>Out of Credits</div>
            <div style={{fontSize:11,color:T.textWhiteDim,lineHeight:1.6}}>
              Top up to continue generating visuals, video and audio.
            </div>
          </div>

          <button onClick={onRecharge} style={{
            width:"100%", padding:"13px",
            background:`linear-gradient(135deg,${T.purple},${T.violet})`,
            border:"none", borderRadius:T.radiusSm,
            color:"#fff", fontSize:13, fontWeight:700,
            cursor:"pointer", fontFamily:"inherit",
            marginBottom:8,
            boxShadow:`0 4px 20px ${T.purple}44`,
          }}>Top Up Credits</button>

          <button onClick={onDismiss} style={{
            width:"100%", padding:"11px",
            background:"transparent",
            border:`1px solid ${T.borderDark}`,
            borderRadius:T.radiusSm,
            color:T.textWhiteDim, fontSize:12,
            cursor:"pointer", fontFamily:"inherit",
          }}>Maybe later</button>
        </div>
      </div>
    </div>
  );
}

// ── App Header ────────────────────────────────────────────────────────────────
function AppHeader({ credits, creditsMax, avatar, onCreditClick, onProfileClick }) {
  return (
    <div style={{
      height:54,
      background:"rgba(10,10,10,0.97)",
      backdropFilter:"blur(20px)",
      borderBottom:`1px solid ${T.borderDark}`,
      display:"flex", alignItems:"center",
      padding:"0 16px",
      justifyContent:"space-between",
      flexShrink:0, position:"relative",
    }}>
      {/* Credit pill — left */}
      <CreditPill credits={credits} creditsMax={creditsMax} onRecharge={onCreditClick}/>

      {/* App name — center */}
      <div style={{position:"absolute",left:"50%",transform:"translateX(-50%)",textAlign:"center",pointerEvents:"none"}}>
        <div style={{fontSize:12,fontWeight:700,color:T.textWhite,letterSpacing:"0.02em"}}>Storyboard</div>
      </div>

      {/* Avatar — right */}
      <button onClick={onProfileClick} style={{
        width:34, height:34, borderRadius:"50%",
        background:`linear-gradient(135deg,${T.purple},${T.violet})`,
        border:`1.5px solid ${T.purple}44`,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:13, fontWeight:700, color:"#fff",
        cursor:"pointer",
        boxShadow:`0 0 14px ${T.purple}33`,
        flexShrink:0,
        transition:"box-shadow 0.2s",
      }}
        onMouseEnter={e=>e.currentTarget.style.boxShadow=`0 0 22px ${T.purple}55`}
        onMouseLeave={e=>e.currentTarget.style.boxShadow=`0 0 14px ${T.purple}33`}
      >{avatar}</button>
    </div>
  );
}



// ═══════════════════════════════════════════════════════════════════
// PRODUCE TAB — SCENES + TIMELINE
// ═══════════════════════════════════════════════════════════════════

// ── Shared utilities ──────────────────────────────────────────────────────────
function useGenerator(setScenes) {
  const [progress, setProgress] = useState({});
  const [justCompleted, setJustCompleted] = useState({});
  const [genErrors, setGenErrors] = useState({});

  function _finish(sceneId, type) {
    setJustCompleted(prev=>({...prev,[sceneId]:type}));
    setTimeout(()=>setJustCompleted(prev=>{const n={...prev};delete n[sceneId];return n;}),2500);
    setProgress(prev=>{const n={...prev};delete n[sceneId+"_"+type];return n;});
  }

  function _simProgress(sceneId, type, onDone) {
    let p=0;
    const t=setInterval(()=>{
      p=Math.min(95,p+Math.floor(Math.random()*10)+3);
      setProgress(prev=>({...prev,[sceneId+"_"+type]:p}));
      if(p>=95){ clearInterval(t); onDone(); }
    },160);
    return t;
  }

  async function generateOne(sceneId, type) {
    const cfg = getAdminConfig();
    const key = type==="image"?"imageState":type==="video"?"videoState":"audioState";
    setScenes(prev=>prev.map(s=>s.id===sceneId?{...s,[key]:"rendering"}:s));
    setProgress(prev=>({...prev,[sceneId+"_"+type]:0}));
    setGenErrors(prev=>{const n={...prev};delete n[sceneId+"_"+type];return n;});

    // ── IMAGE: try EvoLink if enabled, else picsum fallback ──────────
    if (type === "image") {
      if (cfg.evolinkEnabled && cfg.evolinkApiKey) {
        try {
          // Get prompt from scene
          let prompt = "";
          setScenes(prev=>{
            const s = prev.find(sc=>sc.id===sceneId);
            prompt = s?.visualPrompt || s?.script || `Cinematic scene ${sceneId}`;
            return prev;
          });
          // Kick off polling progress animation while we wait
          const progTimer = setInterval(()=>{
            setProgress(prev=>{
              const cur = prev[sceneId+"_image"] || 0;
              return {...prev,[sceneId+"_image"]:Math.min(90,cur+2)};
            });
          },1500);
          const url = await evolinkGenerateImage(
            prompt,
            p => setProgress(prev=>({...prev,[sceneId+"_image"]:p})),
            { size: cfg.evolinkAspect }
          );
          clearInterval(progTimer);
          setProgress(prev=>({...prev,[sceneId+"_image"]:100}));
          setScenes(prev=>prev.map(s=>s.id===sceneId?{...s,imageState:"done",imageUrl:url,imgbbLocked:true,imageSource:"evolink"}:s));
          _finish(sceneId, type);
          return;
        } catch(err) {
          // Fall through to picsum fallback, log error
          console.warn("EvoLink image gen failed, using fallback:", err.message);
          setGenErrors(prev=>({...prev,[sceneId+"_image"]:err.message}));
        }
      }
      // Fallback: picsum placeholder
      return new Promise(resolve=>{
        _simProgress(sceneId, type, ()=>{
          const url=`https://picsum.photos/seed/${sceneId*31+7}/800/450`;
          setProgress(prev=>({...prev,[sceneId+"_image"]:100}));
          setScenes(prev=>prev.map(s=>s.id===sceneId?{...s,imageState:"done",imageUrl:url,imgbbLocked:true,imageSource:"picsum"}:s));
          _finish(sceneId, type);
          resolve();
        });
      });
    }

    // ── VIDEO: try EvoLink if enabled, else demo fallback ───────────
    if (type === "video") {
      if (cfg.evolinkVideoEnabled && cfg.evolinkApiKey) {
        try {
          let prompt = "";
          let imageUrl = null;
          setScenes(prev => {
            const s = prev.find(sc => sc.id === sceneId);
            prompt   = s?.videoPrompt || s?.script || `Cinematic scene ${sceneId}, dynamic motion`;
            imageUrl = s?.imageUrl || null; // use locked image as first frame
            return prev;
          });
          const progTimer = setInterval(() => {
            setProgress(prev => {
              const cur = prev[sceneId+"_video"] || 0;
              return { ...prev, [sceneId+"_video"]: Math.min(90, cur + 1) };
            });
          }, 2000);
          const { url, usedModel, isI2V } = await evolinkGenerateVideo(
            prompt, imageUrl,
            p => setProgress(prev => ({ ...prev, [sceneId+"_video"]: p }))
          );
          clearInterval(progTimer);
          setProgress(prev => ({ ...prev, [sceneId+"_video"]: 100 }));
          setScenes(prev => prev.map(s => s.id === sceneId
            ? { ...s, videoState:"done", videoUrl:url, videoSource:`evolink:${usedModel}`, videoMode: isI2V?"i2v":"t2v" }
            : s
          ));
          _finish(sceneId, type);
          return;
        } catch(err) {
          console.warn("EvoLink video gen failed, using fallback:", err.message);
          setGenErrors(prev => ({ ...prev, [sceneId+"_video"]: err.message }));
        }
      }
      // Fallback: demo video
      return new Promise(resolve => {
        _simProgress(sceneId, type, () => {
          setProgress(prev => ({ ...prev, [sceneId+"_video"]: 100 }));
          setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, videoState:"done", videoUrl:DEMO_VIDEO } : s));
          _finish(sceneId, type);
          resolve();
        });
      });
    }

    // ── AUDIO: simulated (wire EvoLink Qwen TTS or Suno similarly) ──
    return new Promise(resolve => {
      _simProgress(sceneId, type, () => {
        setProgress(prev => ({ ...prev, [sceneId+"_audio"]: 100 }));
        setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, audioState:"done", audioUrl:DEMO_AUDIO } : s));
        _finish(sceneId, type);
        resolve();
      });
    });
  }

  return { progress, justCompleted, genErrors, generateOne };
}

// ── Shared card modal (Image/Video/Audio panels) ──────────────────────────────
function CardModal({ scene, prevScene, onClose, onUpdate, onFullscreen, onRegenerate }) {
  const [panel, setPanel] = useState(0);
  // progress comes from parent via scene state
  const imgPct = scene.imageState==="rendering" ? 50 : 0;
  const vidPct = scene.videoState==="rendering" ? 50 : 0;
  const audPct = scene.audioState==="rendering" ? 50 : 0;
  const [bgInput, setBgInput] = useState("");
  const [showBgInput, setShowBgInput] = useState(false);
  const [editScript, setEditScript] = useState(false);
  const [scriptVal, setScriptVal] = useState(scene.script);
  const scrollRef = useRef(null);

  const canImg = !prevScene || prevScene.imgbbLocked;
  const imgDone = scene.imageState==="done";
  const vidDone = scene.videoState==="done";
  const audDone = scene.audioState==="done";

  // Use shared generator so card thumbnails update live
  function genImage() { if(canImg) onRegenerate(scene.id,"image"); }
  function genVideo() { if(imgDone) onRegenerate(scene.id,"video"); }
  function genAudio() { onRegenerate(scene.id,"audio"); }

  function addBg(){
    if(!bgInput.trim()) return;
    onUpdate(scene.id,{bgScores:[...scene.bgScores,{id:Date.now(),prompt:bgInput,audioUrl:null}]});
    setBgInput(""); setShowBgInput(false);
  }

  function scrollToPanel(i){ if(scrollRef.current) scrollRef.current.scrollTo({left:i*scrollRef.current.offsetWidth,behavior:"smooth"}); setPanel(i); }
  function handleScroll(e){ setPanel(Math.round(e.target.scrollLeft/e.target.offsetWidth)); }

  const PANELS=[{key:"img",label:"Image",icon:"▭",color:T.green,done:imgDone},{key:"vid",label:"Video",icon:"▶",color:T.blue,done:vidDone},{key:"aud",label:"Audio",icon:"♪",color:T.violet,done:audDone}];

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.72)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(6px)",padding:"16px"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:T.surface,borderRadius:T.radius,boxShadow:"0 24px 64px rgba(0,0,0,0.6)",width:"100%",maxWidth:360,maxHeight:"85vh",display:"flex",flexDirection:"column",overflow:"hidden",border:`1.5px solid ${T.purple}33`}}>
        <div style={{height:3,background:`linear-gradient(90deg,${T.purple},${T.violet})`,flexShrink:0}}/>

        {/* Header */}
        <div style={{padding:"12px 14px",borderBottom:`1px solid ${T.border}`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{background:"rgba(99,102,241,0.08)",borderRadius:20,padding:"3px 9px",display:"flex",alignItems:"center",gap:5}}>
              <span style={{fontFamily:"monospace",fontSize:12,fontWeight:700,color:T.textDark}}>{String(scene.id).padStart(2,"0")}</span>
              <span style={{fontSize:10,color:T.textMid}}>{scene.shot} · {scene.duration}s</span>
            </div>
            {scene.imgbbLocked&&<div style={{background:"rgba(74,222,128,0.15)",border:`1px solid ${T.green}44`,borderRadius:20,padding:"2px 7px",fontSize:8,fontWeight:700,color:"#16a34a"}}>🔒 locked</div>}
          </div>
          <button onClick={onClose} style={{background:"rgba(0,0,0,0.06)",border:`1px solid ${T.border}`,borderRadius:"50%",width:26,height:26,color:T.textMid,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
        </div>

        {/* Editable script */}
        <div style={{padding:"10px 14px",borderBottom:`1px solid ${T.border}`,flexShrink:0,background:T.surfaceDim}}>
          {editScript
            ?<div>
              <textarea autoFocus value={scriptVal} onChange={e=>setScriptVal(e.target.value)} rows={2} style={{width:"100%",background:T.surface,border:`1.5px solid ${T.purple}55`,borderRadius:T.radiusSm,color:T.textDark,fontFamily:"inherit",fontSize:12,padding:"7px 9px",resize:"none",outline:"none",lineHeight:1.5,boxSizing:"border-box",fontStyle:"italic"}}/>
              <div style={{display:"flex",gap:6,marginTop:6}}>
                <button onClick={()=>setEditScript(false)} style={{flex:1,padding:"5px",background:"transparent",border:`1px solid ${T.border}`,borderRadius:8,color:T.textMid,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
                <button onClick={()=>{onUpdate(scene.id,{script:scriptVal});setEditScript(false);}} style={{flex:2,padding:"5px",background:T.purple,border:"none",borderRadius:8,color:"#fff",fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Save</button>
              </div>
            </div>
            :<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
              <div style={{fontSize:12,color:T.textDark,fontStyle:"italic",lineHeight:1.55,flex:1}}>"{scene.script}"</div>
              <button onClick={()=>{setScriptVal(scene.script);setEditScript(true);}} style={{background:"transparent",border:`1px solid ${T.border}`,borderRadius:8,padding:"3px 8px",fontSize:9,color:T.textLight,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>✎</button>
            </div>
          }
        </div>

        {/* Panel tabs */}
        <div style={{padding:"8px 14px",borderBottom:`1px solid ${T.border}`,flexShrink:0,display:"flex",gap:6}}>
          {PANELS.map((p,i)=>(
            <button key={p.key} onClick={()=>scrollToPanel(i)} style={{flex:1,padding:"7px 4px",background:panel===i?p.color:T.surfaceDim,border:`1.5px solid ${panel===i?p.color:T.border}`,borderRadius:T.radiusSm,color:panel===i?"#fff":T.textMid,fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",flexDirection:"column",alignItems:"center",gap:2,transition:"all 0.15s"}}>
              <span style={{fontSize:13}}>{p.done?"✓":p.icon}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        {/* Panels */}
        <div ref={scrollRef} onScroll={handleScroll} style={{display:"flex",overflowX:"auto",overflowY:"hidden",scrollSnapType:"x mandatory",WebkitOverflowScrolling:"touch",flex:1}} className="panel-scroll">

          {/* IMAGE */}
          <div style={{minWidth:"100%",scrollSnapAlign:"start",overflowY:"auto",padding:"14px",display:"flex",flexDirection:"column",gap:10}}>
            {imgDone&&scene.imageUrl
              ?<div style={{position:"relative",borderRadius:T.radiusSm,overflow:"hidden",height:160,cursor:"pointer"}} onClick={()=>onFullscreen({type:"image",url:scene.imageUrl})}>
                <img src={scene.imageUrl} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                <div style={{position:"absolute",inset:0,background:"linear-gradient(transparent 60%,rgba(0,0,0,0.5))",display:"flex",alignItems:"flex-end",padding:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:5,width:"100%"}}>
                    <div style={{width:5,height:5,borderRadius:"50%",background:T.green}}/>
                    <span style={{fontSize:9,color:T.green,fontWeight:600}}>Generated · Flux.1</span>
                    <span style={{fontSize:9,color:"rgba(255,255,255,0.4)",marginLeft:"auto"}}>⛶ fullscreen</span>
                  </div>
                </div>
              </div>
              :scene.imageState==="rendering"
              ?<Whiteboard height={160}><div style={{fontSize:11,color:T.textLight,fontFamily:"monospace",animation:"fadePulse 1.5s infinite"}}>rendering · {imgPct}%</div><div style={{width:120,height:2,background:"rgba(0,0,0,0.06)",borderRadius:1}}><div style={{height:"100%",width:imgPct+"%",background:`linear-gradient(90deg,${T.purple},${T.violet})`,borderRadius:1,transition:"width 0.3s"}}/></div></Whiteboard>
              :<Whiteboard height={160} label="no image yet"/>
            }
            {prevScene?.imgbbLocked&&!imgDone&&(
              <div style={{background:"rgba(96,165,250,0.06)",border:"1px solid rgba(96,165,250,0.15)",borderRadius:T.radiusSm,padding:"8px 10px",display:"flex",gap:8,alignItems:"center"}}>
                {prevScene.imageUrl&&<img src={prevScene.imageUrl} style={{width:32,height:22,objectFit:"cover",borderRadius:4,flexShrink:0}}/>}
                <div style={{fontSize:10,color:T.textMid,lineHeight:1.4}}><span style={{color:T.blue,fontWeight:600}}>S{prevScene.id} locked</span> — used as style reference</div>
              </div>
            )}
            <div style={{display:"flex",gap:8}}>
              <button style={{flex:1,padding:"9px",background:T.surfaceDim,border:`1px solid ${T.border}`,borderRadius:T.radiusSm,color:T.textMid,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>↑ Upload</button>
              <button
                onClick={canImg&&scene.imageState!=="rendering"?genImage:undefined}
                disabled={!canImg||scene.imageState==="rendering"}
                style={{
                  flex:2,padding:"9px",
                  background: scene.imageState==="rendering"?"rgba(0,0,0,0.04)":canImg?`linear-gradient(135deg,${T.purple},${T.violet})`:"rgba(0,0,0,0.04)",
                  border:"none",borderRadius:T.radiusSm,
                  color:scene.imageState==="rendering"?"rgba(0,0,0,0.2)":canImg?"#fff":"rgba(0,0,0,0.2)",
                  fontSize:11,fontWeight:600,
                  cursor:canImg&&scene.imageState!=="rendering"?"pointer":"default",
                  fontFamily:"inherit",
                }}>
                {!canImg?"⏳ S"+(scene.id-1)+" first":scene.imageState==="rendering"?"Generating...":imgDone?"↺ Regenerate Image":"✦ Generate Image"}
              </button>
            </div>
          </div>

          {/* VIDEO */}
          <div style={{minWidth:"100%",scrollSnapAlign:"start",overflowY:"auto",padding:"14px",display:"flex",flexDirection:"column",gap:10}}>
            {vidDone
              ?<div style={{position:"relative",borderRadius:T.radiusSm,overflow:"hidden",height:160,cursor:"pointer"}} onClick={()=>onFullscreen({type:"video",url:scene.videoUrl})}>
                <video src={scene.videoUrl} muted loop autoPlay playsInline style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                <div style={{position:"absolute",inset:0,background:"linear-gradient(transparent 60%,rgba(0,0,0,0.5))",display:"flex",alignItems:"flex-end",padding:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:5,width:"100%"}}>
                    <div style={{width:5,height:5,borderRadius:"50%",background:T.blue}}/>
                    <span style={{fontSize:9,color:T.blue,fontWeight:600}}>Video ready · Luma</span>
                    <span style={{fontSize:9,color:"rgba(255,255,255,0.4)",marginLeft:"auto"}}>⛶ fullscreen</span>
                  </div>
                </div>
              </div>
              :<Whiteboard height={160} label={scene.videoState==="rendering"?`rendering · ${vidPct}%`:imgDone?"ready to generate":"image needed first"}>
                {scene.videoState==="rendering"&&<div style={{width:120,height:2,background:"rgba(0,0,0,0.06)",borderRadius:1}}><div style={{height:"100%",width:vidPct+"%",background:T.blue,borderRadius:1,transition:"width 0.3s"}}/></div>}
              </Whiteboard>
            }
            <div style={{background:T.surfaceDim,borderRadius:T.radiusSm,padding:"10px 12px"}}>
              <div style={{fontSize:8,color:T.textLight,marginBottom:5,letterSpacing:"0.06em",fontWeight:700}}>MOTION PROMPT</div>
              <textarea defaultValue={scene.videoPrompt} rows={2} style={{width:"100%",background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,color:T.textDark,fontFamily:"monospace",fontSize:10,padding:"7px 9px",resize:"none",outline:"none",lineHeight:1.5,boxSizing:"border-box"}}/>
            </div>
            <button
              onClick={imgDone&&scene.videoState!=="rendering"?genVideo:undefined}
              disabled={!imgDone||scene.videoState==="rendering"}
              style={{
                width:"100%",padding:"10px",
                background:scene.videoState==="rendering"?"rgba(0,0,0,0.04)":imgDone?"#000":"rgba(0,0,0,0.04)",
                border:"none",borderRadius:T.radiusSm,
                color:scene.videoState==="rendering"?"rgba(0,0,0,0.2)":imgDone?"#fff":"rgba(0,0,0,0.2)",
                fontSize:12,fontWeight:600,
                cursor:imgDone&&scene.videoState!=="rendering"?"pointer":"default",
                fontFamily:"inherit",
              }}>
              {scene.videoState==="rendering"?`Rendering...`:!imgDone?"Image needed first":vidDone?"↺ Regenerate Video":"▶ Generate Video"}
            </button>
          </div>

          {/* AUDIO */}
          <div style={{minWidth:"100%",scrollSnapAlign:"start",overflowY:"auto",padding:"14px",display:"flex",flexDirection:"column",gap:10}}>
            <div style={{background:T.surfaceDim,borderRadius:T.radiusSm,padding:"10px 12px"}}>
              <div style={{fontSize:8,color:T.textLight,marginBottom:4,letterSpacing:"0.06em",fontWeight:700}}>SCRIPT LINE</div>
              <div style={{fontSize:12,color:T.textDark,fontStyle:"italic",lineHeight:1.5}}>"{scene.audioScript}"</div>
            </div>
            <div style={{background:T.surfaceDim,borderRadius:T.radiusSm,padding:"10px 12px"}}>
              <div style={{fontSize:8,color:T.textLight,marginBottom:5,letterSpacing:"0.06em",fontWeight:700}}>VOICE DIRECTION</div>
              <textarea defaultValue={scene.audioPrompt} rows={2} style={{width:"100%",background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,color:T.textDark,fontFamily:"monospace",fontSize:10,padding:"7px 9px",resize:"none",outline:"none",lineHeight:1.5,boxSizing:"border-box"}}/>
            </div>
            {audDone?<AudioPlayer url={scene.audioUrl} color={T.violet}/>
              :scene.audioState==="rendering"
              ?<div style={{height:44,borderRadius:T.radiusSm,background:T.surfaceDimmer,display:"flex",alignItems:"center",justifyContent:"center",gap:2}}>{Array.from({length:16}).map((_,i)=><div key={i} style={{width:3,borderRadius:2,background:T.violet+"55",animation:"audioBar 0.7s ease-in-out infinite",animationDelay:i*0.04+"s",height:(5+Math.abs(Math.sin(i*0.8))*14)+"px"}}/>)}</div>
              :<Whiteboard height={44} label="no audio yet"/>
            }
            <div style={{display:"flex",gap:8}}>
              <button style={{flex:1,padding:"9px",background:T.surfaceDim,border:`1px solid ${T.border}`,borderRadius:T.radiusSm,color:T.textMid,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>↑ Upload</button>
              <button
                onClick={scene.audioState!=="rendering"?genAudio:undefined}
                disabled={scene.audioState==="rendering"}
                style={{
                  flex:2,padding:"9px",
                  background:scene.audioState==="rendering"?"rgba(0,0,0,0.04)":T.purple,
                  border:"none",borderRadius:T.radiusSm,
                  color:scene.audioState==="rendering"?"rgba(0,0,0,0.2)":"#fff",
                  fontSize:11,fontWeight:600,
                  cursor:scene.audioState!=="rendering"?"pointer":"default",
                  fontFamily:"inherit",
                }}>
                {scene.audioState==="rendering"?"Generating...":audDone?"↺ Regenerate Audio":"♪ Generate Audio"}
              </button>
            </div>
            {/* BG scoring */}
            <div style={{borderTop:`1px solid ${T.border}`,paddingTop:10}}>
              <div style={{fontSize:8,color:T.textLight,fontWeight:700,letterSpacing:"0.06em",marginBottom:8}}>BACKGROUND SCORING</div>
              {scene.bgScores.map(bg=>(
                <div key={bg.id} style={{marginBottom:8,background:T.surfaceDim,borderRadius:T.radiusSm,padding:"8px 10px",border:`1px solid ${T.purple}22`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:bg.audioUrl?6:0}}>
                    <span style={{fontSize:10,color:T.purple,fontStyle:"italic",flex:1}}>{bg.prompt}</span>
                    <button onClick={()=>onUpdate(scene.id,{bgScores:scene.bgScores.filter(b=>b.id!==bg.id)})} style={{background:"transparent",border:"none",color:T.textLight,cursor:"pointer",fontSize:14}}>×</button>
                  </div>
                  {bg.audioUrl?<AudioPlayer url={bg.audioUrl} color={T.purple}/>:<button onClick={()=>onUpdate(scene.id,{bgScores:scene.bgScores.map(b=>b.id===bg.id?{...b,audioUrl:DEMO_AUDIO}:b)})} style={{width:"100%",padding:"6px",background:T.purple,border:"none",borderRadius:8,color:"#fff",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>♪ Generate score</button>}
                </div>
              ))}
              {showBgInput
                ?<div style={{display:"flex",gap:6}}><input autoFocus value={bgInput} onChange={e=>setBgInput(e.target.value)} placeholder="e.g. low cello, cold and sparse..." onKeyDown={e=>{if(e.key==="Enter")addBg();if(e.key==="Escape")setShowBgInput(false);}} style={{flex:1,background:T.surface,border:`1px solid ${T.purple}33`,borderRadius:8,color:T.textDark,fontFamily:"monospace",fontSize:10,padding:"6px 9px",outline:"none"}}/><button onClick={addBg} style={{padding:"6px 10px",background:T.purple,border:"none",borderRadius:8,color:"#fff",fontSize:10,cursor:"pointer"}}>+</button><button onClick={()=>setShowBgInput(false)} style={{padding:"6px 8px",background:"transparent",border:`1px solid ${T.border}`,borderRadius:8,color:T.textLight,fontSize:10,cursor:"pointer"}}>✕</button></div>
                :<button onClick={()=>setShowBgInput(true)} style={{width:"100%",padding:"7px",background:"transparent",border:`1px dashed ${T.purple}33`,borderRadius:8,color:T.purple+"88",fontSize:10,cursor:"pointer",fontFamily:"monospace",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}><span style={{fontSize:14,lineHeight:1}}>+</span> add background score</button>
              }
            </div>
          </div>
        </div>

        {/* Panel dots */}
        <div style={{padding:"8px 14px",borderTop:`1px solid ${T.border}`,display:"flex",justifyContent:"center",gap:6,flexShrink:0}}>
          {PANELS.map((p,i)=>(
            <div key={p.key} onClick={()=>scrollToPanel(i)} style={{width:panel===i?24:6,height:6,borderRadius:3,background:panel===i?p.color:"rgba(0,0,0,0.12)",transition:"all 0.25s",cursor:"pointer"}}/>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── SCENES VIEW (vertical scroll) ─────────────────────────────────────────────
async function generateNextScene(scenes, userBrief) {
  const last = scenes[scenes.length - 1];
  const nextId = scenes.length + 1;
  const system = "You are a cinematic storyboard AI. Generate ONE scene card as JSON only. No markdown. " +
    "PROJECT: " + PROJECT.title + " — " + PROJECT.style_bible + ". " +
    "CHARACTER: " + PROJECT.character.name + " — " + PROJECT.character.description + ". " +
    "PREVIOUS HANDOFF (Scene " + last.id + "): " + (last.handoff||last.script) + ". " +
    "RULES: character description MUST appear verbatim in visual_generation_prompt. shot_duration_seconds: 4-10. " +
    'Return ONLY: {"shot_type":"string","shot_duration_seconds":5,"camera_mechanics":"string","script":"string","audioScript":"string","audio_direction":"string","visual_generation_prompt":"string","video_motion_prompt":"string","handoff":"string"}';
  try {
    const data = await apiFetch(`/api/generate/text`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ system, prompt:"Scene "+nextId+" should be about: "+userBrief, maxTokens:800 }),
    });
    return extractJSON(data.text || "{}");
  } catch(e) {
    return { shot_type:"Medium Shot", shot_duration_seconds:6, camera_mechanics:"slow push in",
      script:userBrief, audioScript:userBrief, audio_direction:"Quiet and measured",
      visual_generation_prompt:PROJECT.character.description+", "+userBrief,
      video_motion_prompt:"slow observational push", handoff:"Scene "+nextId+" ends." };
  }
}


function AddSceneSheet({ scenes, onAdd, onCancel }) {
  const [brief, setBrief] = useState("");
  const [loading, setLoading] = useState(false);
  const last = scenes[scenes.length - 1];
  const nextNum = scenes.length + 1;

  const SUGGESTIONS = [
    "She finds something unexpected on the ground",
    "A sound breaks the silence — she turns",
    "She enters a building, finds it untouched",
    "Close on her hands — then her face",
  ];

  async function handle() {
    if (!brief.trim()) return;
    setLoading(true);
    try {
      const result = await generateNextScene(scenes, brief);
      onAdd({
        id: nextNum,
        shot: result.shot_type || "Medium Shot",
        duration: result.shot_duration_seconds || 6,
        script: result.script || brief,
        audioScript: result.audioScript || brief,
        imageUrl: null, imgbbLocked: false,
        videoUrl: null, audioUrl: null,
        imageState:"idle", videoState:"idle", audioState:"idle",
        videoPrompt: result.video_motion_prompt || "slow push in",
        audioPrompt: result.audio_direction || "Quiet and measured.",
        bgScores: [],
        handoff: result.handoff || `Scene ${nextNum} ends.`,
        visualPrompt: result.visual_generation_prompt || brief,
      });
    } catch(e) {
      // Fallback
      onAdd({
        id: nextNum, shot:"Medium Shot", duration:6,
        script: brief, audioScript: brief,
        imageUrl:null, imgbbLocked:false, videoUrl:null, audioUrl:null,
        imageState:"idle", videoState:"idle", audioState:"idle",
        videoPrompt:"slow push in, observational",
        audioPrompt:"Quiet and measured delivery.",
        bgScores:[], handoff:`Scene ${nextNum} ends.`,
        visualPrompt:`${PROJECT.character.description}, ${brief}, ${PROJECT.style_bible}`,
      });
    }
    setLoading(false);
  }

  return (
    <div onClick={onCancel} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:600,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(6px)"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:T.surface,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:480,boxShadow:"0 -8px 40px rgba(0,0,0,0.5)",overflow:"hidden"}}>
        <div style={{height:3,background:`linear-gradient(90deg,${T.purple},${T.violet})`}}/>
        <div style={{padding:"16px"}}>
          {/* Handle */}
          <div style={{width:36,height:4,background:"rgba(0,0,0,0.12)",borderRadius:2,margin:"0 auto 14px"}}/>

          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:T.textDark}}>Add Scene {nextNum}</div>
              <div style={{fontSize:10,color:T.textMid,marginTop:2}}>Claude generates with full continuity</div>
            </div>
            <button onClick={onCancel} style={{background:"rgba(0,0,0,0.06)",border:`1px solid ${T.border}`,borderRadius:"50%",width:28,height:28,color:T.textMid,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
          </div>

          {/* Locked context */}
          <div style={{background:T.surfaceDim,borderRadius:T.radiusSm,padding:"10px 12px",marginBottom:12,border:`1px solid ${T.border}`}}>
            <div style={{fontSize:8,fontWeight:700,color:T.textLight,marginBottom:6,letterSpacing:"0.07em"}}>CONTINUING FROM SCENE {last.id}</div>
            <div style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:8}}>
              {last.imageUrl&&<img src={last.imageUrl} style={{width:44,height:30,objectFit:"cover",borderRadius:5,flexShrink:0,border:`1.5px solid ${T.green}44`}}/>}
              <div style={{fontSize:10,color:T.textMid,lineHeight:1.4}}>{last.handoff||last.script}</div>
            </div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {[{t:`✓ ${PROJECT.character.name}`,c:T.green},{t:"✓ Style locked",c:T.blue},{t:"✓ 9:16 vertical",c:T.violet}].map(({t,c})=>(
                <span key={t} style={{padding:"2px 8px",background:c+"15",border:`1px solid ${c}33`,borderRadius:20,fontSize:8,color:c,fontWeight:600}}>{t}</span>
              ))}
            </div>
          </div>

          <div style={{fontSize:11,fontWeight:600,color:T.textDark,marginBottom:6}}>What happens in this scene?</div>
          <textarea value={brief} onChange={e=>setBrief(e.target.value)}
            placeholder="Describe loosely — e.g. she finds an old photograph..."
            rows={3} autoFocus
            style={{width:"100%",background:T.surfaceDim,border:`1.5px solid ${brief?T.purple+"55":T.border}`,borderRadius:T.radiusSm,color:T.textDark,fontFamily:"inherit",fontSize:12,padding:"10px 12px",resize:"none",outline:"none",lineHeight:1.5,boxSizing:"border-box",marginBottom:8,transition:"border-color 0.2s"}}
          />

          <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:12}}>
            {SUGGESTIONS.map(s=>(
              <button key={s} onClick={()=>setBrief(s)} style={{padding:"4px 9px",background:"rgba(99,102,241,0.06)",border:`1px solid ${T.purple}22`,borderRadius:20,color:T.purple+"99",fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>
                {s.length>32?s.slice(0,32)+"…":s}
              </button>
            ))}
          </div>

          <div style={{display:"flex",gap:8}}>
            <button onClick={onCancel} style={{flex:1,padding:"11px",background:"transparent",border:`1px solid ${T.border}`,borderRadius:T.radiusSm,color:T.textMid,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
            <button onClick={handle} disabled={!brief.trim()||loading} style={{flex:2,padding:"11px",background:brief.trim()&&!loading?`linear-gradient(135deg,${T.purple},${T.violet})`:"rgba(0,0,0,0.05)",border:"none",borderRadius:T.radiusSm,color:brief.trim()&&!loading?"#fff":"rgba(0,0,0,0.2)",fontSize:12,fontWeight:700,cursor:brief.trim()&&!loading?"pointer":"not-allowed",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
              {loading?<><span style={{animation:"spin 1s linear infinite",display:"inline-block"}}>⟳</span>Claude is writing...</>:<>✦ Generate Scene</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Shared utilities ──────────────────────────────────────────────────────────

function ScenesView({ scenes, onOpenCard, onDelete, onAddScene, progress, justCompleted }) {
  return (
    <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:12}}>
      {scenes.map((scene,idx)=>{
        const imgDone=scene.imageState==="done";
        const vidDone=scene.videoState==="done";
        const audDone=scene.audioState==="done";
        const imgR=scene.imageState==="rendering";
        const vidR=scene.videoState==="rendering";
        const audR=scene.audioState==="rendering";
        const imgPct=progress[scene.id+"_image"]||0;
        const flash=justCompleted[scene.id];

        return (
          <div key={scene.id} style={{
            background:T.surface,borderRadius:T.radius,
            boxShadow:flash?`0 0 0 2px ${flash==="image"?T.green:flash==="video"?T.blue:T.violet},${T.shadow}`:T.shadow,
            overflow:"hidden",
            border:imgDone?`1.5px solid ${T.green}33`:`1px solid ${T.border}`,
            transition:"box-shadow 0.3s,border-color 0.3s",
          }}>
            {/* Top accent */}
            {(imgDone||imgR||vidR||audR)&&<div style={{height:3,background:imgDone&&vidDone&&audDone?T.green:`linear-gradient(90deg,${T.purple},${T.violet})`,animation:imgR||vidR||audR?"shimmerBar 1.5s linear infinite":"none",backgroundSize:"200% 100%"}}/>}

            {/* Image area */}
            <div style={{position:"relative",height:180,background:T.surfaceDimmer,overflow:"hidden"}}>
              {scene.imageUrl
                ?<img src={scene.imageUrl} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                :<div style={{width:"100%",height:"100%",background:T.surfaceDimmer,backgroundImage:"linear-gradient(rgba(0,0,0,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.04) 1px,transparent 1px)",backgroundSize:"20px 20px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6}}>
                  {imgR?<><div style={{fontSize:10,color:T.textLight,fontFamily:"monospace",animation:"fadePulse 1.5s infinite"}}>rendering {imgPct}%</div><div style={{width:100,height:2,background:"rgba(0,0,0,0.06)",borderRadius:1}}><div style={{height:"100%",width:imgPct+"%",background:`linear-gradient(90deg,${T.purple},${T.violet})`,borderRadius:1,transition:"width 0.3s"}}/></div></>:<><div style={{fontSize:28,color:"rgba(0,0,0,0.08)"}}>▭</div><div style={{fontSize:9,color:T.textLight,fontFamily:"monospace"}}>S{String(scene.id).padStart(2,"0")} · no image</div></>}
                </div>
              }
              {vidDone&&<div style={{position:"absolute",inset:0}}><video src={scene.videoUrl} muted loop autoPlay playsInline style={{width:"100%",height:"100%",objectFit:"cover"}}/></div>}
              {flash&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.35)"}}><div style={{background:flash==="image"?T.green:flash==="video"?T.blue:T.violet,borderRadius:20,padding:"5px 14px",fontSize:11,fontWeight:700,color:"#000"}}>✓ {flash==="image"?"Visual":flash==="video"?"Video":"Audio"} ready</div></div>}

              {/* Badges */}
              <div style={{position:"absolute",top:10,left:10,display:"flex",gap:5}}>
                <div style={{background:"rgba(0,0,0,0.55)",backdropFilter:"blur(4px)",borderRadius:20,padding:"3px 9px",fontSize:10,fontWeight:700,color:"#fff",fontFamily:"monospace"}}>{String(scene.id).padStart(2,"00")} · {scene.shot}</div>
                <div style={{background:"rgba(0,0,0,0.45)",backdropFilter:"blur(4px)",borderRadius:20,padding:"3px 9px",fontSize:9,color:"rgba(255,255,255,0.7)"}}>{scene.duration}s</div>
              </div>
              {scene.imgbbLocked&&<div style={{position:"absolute",top:10,right:10,background:"rgba(74,222,128,0.9)",borderRadius:20,padding:"2px 8px",fontSize:8,fontWeight:700,color:"#000"}}>🔒 locked</div>}
            </div>

            {/* Body */}
            <div style={{padding:"12px 14px"}}>
              <div style={{fontSize:13,color:T.textDark,fontStyle:"italic",lineHeight:1.55,marginBottom:10}}>"{scene.script}"</div>

              {/* Status row */}
              <div style={{display:"flex",gap:6,marginBottom:10}}>
                {[
                  {d:imgDone,r:imgR,c:T.green,label:"Image"},
                  {d:vidDone,r:vidR,c:T.blue,label:"Video"},
                  {d:audDone,r:audR,c:T.violet,label:"Audio"},
                ].map(({d,r,c,label})=>(
                  <div key={label} style={{flex:1,padding:"5px 6px",background:d?c+"10":r?c+"08":"rgba(0,0,0,0.03)",border:`1px solid ${d?c+"33":r?c+"22":"rgba(0,0,0,0.06)"}`,borderRadius:8,display:"flex",alignItems:"center",gap:4}}>
                    <div style={{width:5,height:5,borderRadius:"50%",background:d?c:r?c:"rgba(0,0,0,0.15)",animation:r?"fadePulse 1s infinite":"none",flexShrink:0}}/>
                    <span style={{fontSize:9,color:d?c:r?c:T.textLight,fontWeight:d||r?600:400}}>{d?"✓ "+label:r?"..."+label:label}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>onOpenCard(scene.id)} style={{flex:1,padding:"9px",background:`linear-gradient(135deg,${T.purple},${T.violet})`,border:"none",borderRadius:T.radiusSm,color:"#fff",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                  ✦ Edit Scene
                </button>
                <button onClick={()=>onDelete(scene.id)} style={{width:36,height:36,borderRadius:T.radiusSm,background:"rgba(248,113,113,0.08)",border:`1px solid ${T.red}22`,color:"rgba(248,113,113,0.7)",fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}
                  onMouseEnter={e=>{e.currentTarget.style.background="rgba(248,113,113,0.15)";e.currentTarget.style.color=T.red;}}
                  onMouseLeave={e=>{e.currentTarget.style.background="rgba(248,113,113,0.08)";e.currentTarget.style.color="rgba(248,113,113,0.7)";}}>
                  🗑
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Add scene */}
      <button onClick={()=>onAddScene()} style={{width:"100%",padding:"16px",background:"rgba(200,200,210,0.08)",border:"1.5px dashed rgba(200,200,220,0.2)",borderRadius:T.radius,cursor:"pointer",fontFamily:"inherit",display:"flex",flexDirection:"column",alignItems:"center",gap:6,color:"rgba(200,200,220,0.5)"}}>
        <div style={{fontSize:22}}>+</div>
        <div style={{fontSize:11,fontWeight:600}}>Add Scene</div>
        <div style={{fontSize:9,opacity:0.7}}>Claude writes with full continuity</div>
      </button>
    </div>
  );
}

// ── TIMELINE VIEW (horizontal scroll) ────────────────────────────────────────
function TimelineView({ scenes, onOpenCard, onDelete, onAddScene, progress, justCompleted }) {
  return (
    <div style={{flex:1,overflowX:"auto",overflowY:"hidden",display:"flex",alignItems:"flex-start",padding:"20px 16px",gap:12,scrollSnapType:"x mandatory",WebkitOverflowScrolling:"touch"}}>
      {scenes.map(scene=>{
        const imgDone=scene.imageState==="done";
        const vidDone=scene.videoState==="done";
        const audDone=scene.audioState==="done";
        const allDone=imgDone&&vidDone&&audDone;
        const imgR=scene.imageState==="rendering";
        const vidR=scene.videoState==="rendering";
        const audR=scene.audioState==="rendering";
        const imgPct=progress[scene.id+"_image"]||0;
        const vidPct=progress[scene.id+"_video"]||0;
        const flash=justCompleted[scene.id];

        return (
          <div key={scene.id} style={{display:"flex",gap:12,alignItems:"flex-start",flexShrink:0,scrollSnapAlign:"start"}}>
            <div style={{
              width:"calc(50vw - 24px)",minWidth:160,maxWidth:240,
              background:T.surface,borderRadius:T.radius,
              boxShadow:flash?`0 0 0 2px ${flash==="image"?T.green:flash==="video"?T.blue:T.violet},${T.shadow}`:T.shadow,
              overflow:"hidden",
              border:allDone?`1.5px solid ${T.green}33`:`1px solid ${T.border}`,
              cursor:"pointer",
              transition:"transform 0.2s,box-shadow 0.3s",
            }} onClick={()=>onOpenCard(scene.id)}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";}}
            >
              {(allDone||imgR||vidR||audR)&&<div style={{height:3,background:allDone?T.green:`linear-gradient(90deg,${T.purple},${T.violet})`,animation:imgR||vidR||audR?"shimmerBar 1.5s linear infinite":"none",backgroundSize:"200% 100%"}}/>}

              {/* Thumbnail */}
              <div style={{position:"relative",height:120,background:T.surfaceDimmer,overflow:"hidden"}}>
                {scene.imageUrl?<img src={scene.imageUrl} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                  :<div style={{width:"100%",height:"100%",background:T.surfaceDimmer,backgroundImage:"linear-gradient(rgba(0,0,0,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.04) 1px,transparent 1px)",backgroundSize:"20px 20px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:5}}>
                    {imgR?<><div style={{fontSize:9,color:T.textLight,fontFamily:"monospace",animation:"fadePulse 1.5s infinite"}}>rendering {imgPct}%</div><div style={{width:80,height:2,background:"rgba(0,0,0,0.06)",borderRadius:1}}><div style={{height:"100%",width:imgPct+"%",background:`linear-gradient(90deg,${T.purple},${T.violet})`,borderRadius:1,transition:"width 0.2s"}}/></div></>:<><div style={{fontSize:20,color:"rgba(0,0,0,0.08)"}}>▭</div><div style={{fontSize:8,color:T.textLight,fontFamily:"monospace"}}>S{scene.id}</div></>}
                  </div>
                }
                {vidDone&&<div style={{position:"absolute",inset:0,overflow:"hidden"}}><video src={scene.videoUrl} muted loop autoPlay playsInline controls={false} style={{width:"100%",height:"100%",objectFit:"cover",pointerEvents:"none"}}/><div style={{position:"absolute",bottom:6,right:6,background:"rgba(96,165,250,0.9)",borderRadius:20,padding:"2px 7px",fontSize:8,fontWeight:700,color:"#000"}}>▶ video</div></div>}
                {vidR&&<div style={{position:"absolute",inset:0,background:"rgba(96,165,250,0.15)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3}}><div style={{fontSize:8,color:T.blue,fontFamily:"monospace",animation:"fadePulse 1.5s infinite"}}>video {progress[scene.id+"_video"]||0}%</div><div style={{width:70,height:2,background:"rgba(255,255,255,0.2)",borderRadius:1}}><div style={{height:"100%",width:(progress[scene.id+"_video"]||0)+"%",background:T.blue,borderRadius:1,transition:"width 0.2s"}}/></div></div>}
                {flash&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.35)"}}><div style={{background:flash==="image"?T.green:flash==="video"?T.blue:T.violet,borderRadius:20,padding:"4px 10px",fontSize:10,fontWeight:700,color:"#000"}}>✓ {flash==="image"?"Visual":flash==="video"?"Video":"Audio"} ready</div></div>}
                <div style={{position:"absolute",top:7,left:7,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(4px)",borderRadius:20,padding:"2px 7px",fontSize:9,fontWeight:700,color:"#fff",fontFamily:"monospace"}}>{String(scene.id).padStart(2,"0")} · {scene.duration}s</div>
              </div>

              {/* Body */}
              <div style={{padding:"8px 10px 10px",borderTop:`1px solid ${T.border}`}}>
                <div style={{fontSize:10,color:T.textDark,fontStyle:"italic",lineHeight:1.5,marginBottom:8,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>"{scene.script}"</div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                  <div style={{fontSize:8,color:T.textLight,fontFamily:"monospace",background:"rgba(0,0,0,0.04)",borderRadius:20,padding:"2px 7px"}}>{scene.shot}</div>
                </div>
                <div style={{display:"flex",gap:4,marginBottom:6}}>
                  {[{d:imgDone,r:imgR,c:T.green,l:"img"},{d:vidDone,r:vidR,c:T.blue,l:"vid"},{d:audDone,r:audR,c:T.violet,l:"aud"}].map(({d,r,c,l})=>(
                    <div key={l} style={{flex:1,padding:"3px 4px",background:d?c+"10":r?c+"08":"rgba(0,0,0,0.03)",border:`1px solid ${d?c+"33":r?c+"22":"rgba(0,0,0,0.06)"}`,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",gap:3}}>
                      <div style={{width:4,height:4,borderRadius:"50%",background:d?c:r?c:"rgba(0,0,0,0.12)",animation:r?"fadePulse 1s infinite":"none",flexShrink:0}}/>
                      <span style={{fontSize:8,color:d?c:r?c:T.textLight,fontFamily:"monospace"}}>{l}</span>
                    </div>
                  ))}
                  <button onClick={e=>{e.stopPropagation();onDelete(scene.id);}} style={{width:24,height:24,borderRadius:6,background:"rgba(248,113,113,0.08)",border:`1px solid ${T.red}22`,color:"rgba(248,113,113,0.6)",fontSize:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}
                    onMouseEnter={e=>{e.stopPropagation();e.currentTarget.style.background="rgba(248,113,113,0.18)";e.currentTarget.style.color=T.red;}}
                    onMouseLeave={e=>{e.currentTarget.style.background="rgba(248,113,113,0.08)";e.currentTarget.style.color="rgba(248,113,113,0.6)";}}>
                    🗑
                  </button>
                </div>

              </div>
            </div>

            {/* + between cards */}
            <div style={{display:"flex",alignItems:"center",alignSelf:"center"}}>
              <button onClick={onAddScene} style={{width:26,height:26,borderRadius:"50%",background:"rgba(255,255,255,0.04)",border:`1px dashed ${T.borderDark}`,color:T.textWhiteDimmer,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.15s"}}
                onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.1)";e.currentTarget.style.color=T.textWhiteDim;}}
                onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.04)";e.currentTarget.style.color=T.textWhiteDimmer;}}>+</button>
            </div>
          </div>
        );
      })}

      {/* Add scene at end */}
      <button onClick={onAddScene} style={{flexShrink:0,width:"calc(50vw - 24px)",minWidth:160,maxWidth:240,height:240,background:"rgba(200,200,210,0.08)",border:"1.5px dashed rgba(200,200,220,0.18)",borderRadius:T.radius,color:"rgba(200,200,220,0.4)",fontSize:13,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,transition:"all 0.2s",scrollSnapAlign:"start"}}
        onMouseEnter={e=>{e.currentTarget.style.background="rgba(200,200,220,0.14)";e.currentTarget.style.borderColor="rgba(200,200,220,0.3)";e.currentTarget.style.color="rgba(200,200,220,0.7)";}}
        onMouseLeave={e=>{e.currentTarget.style.background="rgba(200,200,210,0.08)";e.currentTarget.style.borderColor="rgba(200,200,220,0.18)";e.currentTarget.style.color="rgba(200,200,220,0.4)";}}>
        <div style={{width:40,height:40,borderRadius:"50%",background:"rgba(200,200,220,0.1)",border:"1.5px dashed rgba(200,200,220,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>+</div>
        <div><div style={{fontSize:11,fontWeight:600,textAlign:"center",marginBottom:3}}>Scene {scenes.length+1}</div><div style={{fontSize:9,opacity:0.7,textAlign:"center",lineHeight:1.4}}>Claude writes with<br/>full continuity</div></div>
        <div style={{padding:"3px 10px",background:"rgba(200,200,220,0.08)",border:"1px solid rgba(200,200,220,0.12)",borderRadius:20,fontSize:9}}>✦ Add Scene</div>
      </button>
    </div>
  );
}

// ── View toggle + top action bar ──────────────────────────────────────────────
function ActionBar({ view, setView, scenes, autoRunning, autoStep, onAutoCreate, onGenerateAll, stitchState, stitchPct, onStitch }) {
  const allVisualsDone = scenes.every(s=>s.imageState==="done");
  const vidDoneCount = scenes.filter(s=>s.videoState==="done").length;
  const audDoneCount = scenes.filter(s=>s.audioState==="done").length;
  const canStitch = vidDoneCount===scenes.length && audDoneCount===scenes.length;

  return (
    <div style={{background:"rgba(10,10,10,0.97)",backdropFilter:"blur(20px)",borderBottom:`1px solid ${T.borderDark}`,padding:"10px 14px",flexShrink:0}}>

      {/* Title + view toggle + stitch */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
        <div>
          <div style={{fontSize:13,fontWeight:700,color:T.textWhite}}>{scenes.length} Scenes · {scenes.reduce((a,s)=>a+s.duration,0)}s</div>
          <div style={{fontSize:9,color:T.textWhiteDimmer,marginTop:1}}>tap card to edit · swipe to browse</div>
        </div>

        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {/* View toggle */}
          <div style={{display:"flex",background:"rgba(255,255,255,0.06)",borderRadius:22,padding:2,border:`1px solid ${T.borderDark}`}}>
            {[{v:"scenes",icon:"☰",tip:"Scenes"},{v:"timeline",icon:"⬡",tip:"Timeline"}].map(({v,icon,tip})=>(
              <button key={v} onClick={()=>setView(v)} title={tip} style={{
                padding:"5px 12px",borderRadius:20,
                background:view===v?"#fff":"transparent",
                border:"none",
                color:view===v?T.textDark:T.textWhiteDimmer,
                fontSize:11,fontWeight:view===v?600:400,
                cursor:"pointer",fontFamily:"inherit",
                display:"flex",alignItems:"center",gap:4,
                transition:"all 0.2s",
              }}>
                <span>{icon}</span>
                <span style={{fontSize:9}}>{tip}</span>
              </button>
            ))}
          </div>

          {/* Stitch */}
          {stitchState==="idle"&&(
            canStitch
              ?<button onClick={onStitch} style={{padding:"7px 12px",background:T.surface,border:"none",borderRadius:22,color:T.textDark,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 2px 8px rgba(0,0,0,0.3)"}}>Stitch →</button>
              :<div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:2}}>
                <div style={{fontSize:8,color:T.textWhiteDimmer}}>{vidDoneCount}/{scenes.length}v · {audDoneCount}/{scenes.length}a</div>
                <div style={{width:60,height:2,background:"rgba(255,255,255,0.08)",borderRadius:1}}><div style={{height:"100%",width:((vidDoneCount+audDoneCount)/(scenes.length*2))*100+"%",background:`linear-gradient(90deg,${T.blue},${T.violet})`,borderRadius:1,transition:"width 0.4s"}}/></div>
              </div>
          )}
          {stitchState==="stitching"&&<div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:60,height:2,background:"rgba(255,255,255,0.08)",borderRadius:1}}><div style={{height:"100%",width:stitchPct+"%",background:`linear-gradient(90deg,${T.purple},${T.green})`,borderRadius:1,transition:"width 0.3s"}}/></div><span style={{fontSize:9,color:T.textWhiteDim}}>{stitchPct}%</span></div>}
          {stitchState==="done"&&<button style={{padding:"7px 12px",background:T.green,border:"none",borderRadius:22,color:"#000",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>↓ MP4</button>}
        </div>
      </div>

      {/* Auto-create + 3 buttons */}
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        <button onClick={onAutoCreate} disabled={autoRunning} style={{
          width:"100%",padding:"8px 14px",
          background:autoRunning?"rgba(255,255,255,0.06)":T.surface,
          border:autoRunning?`1px solid ${T.borderDark}`:`1px solid ${T.border}`,
          borderRadius:T.radiusSm,
          boxShadow:autoRunning?"none":"0 3px 12px rgba(0,0,0,0.3)",
          cursor:autoRunning?"default":"pointer",
          fontFamily:"inherit",
          display:"flex",alignItems:"center",justifyContent:"center",gap:8,
          transition:"all 0.2s",
        }}>
          {autoRunning
            ?<><span style={{fontSize:12,animation:"spin 1s linear infinite",display:"inline-block",color:T.textWhiteDim}}>⟳</span><span style={{fontSize:10,fontWeight:600,color:T.textWhiteDim}}>{autoStep||"Running..."}</span></>
            :<><span style={{fontSize:13}}>✦</span><span style={{fontSize:11,fontWeight:700,color:T.textDark}}>Auto-Create All</span><span style={{fontSize:9,color:T.textLight}}>Visual → Video → Audio</span></>
          }
        </button>

        <div style={{display:"flex",gap:6}}>
          {[
            {type:"image",icon:"▭",label:"Visual",accent:T.purple},
            {type:"video",icon:"▶",label:"Video",accent:T.blue},
            {type:"audio",icon:"♪",label:"Audio",accent:T.violet},
          ].map(({type,icon,label,accent})=>{
            const rendering=scenes.some(s=>s[type==="image"?"imageState":type==="video"?"videoState":"audioState"]==="rendering");
            const locked=(type==="video"||type==="audio")&&!allVisualsDone;
            const disabled=autoRunning||locked;
            return (
              <button key={type} onClick={()=>!disabled&&onGenerateAll(type)} style={{
                flex:1,padding:"6px 4px",
                background:locked?"rgba(255,255,255,0.03)":T.surface,
                border:locked?`1px solid rgba(255,255,255,0.05)`:`1px solid ${T.border}`,
                borderRadius:T.radiusSm,
                boxShadow:locked?"none":"0 2px 8px rgba(0,0,0,0.2)",
                cursor:disabled?"not-allowed":"pointer",
                fontFamily:"inherit",
                display:"flex",flexDirection:"column",alignItems:"center",gap:3,
                opacity:locked?0.3:autoRunning?0.5:1,
                transition:"all 0.2s",
              }}
                onMouseEnter={e=>{if(!disabled){e.currentTarget.style.boxShadow=`0 4px 12px ${accent}33`;e.currentTarget.style.borderColor=accent+"55";}}}
                onMouseLeave={e=>{if(!disabled){e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.2)";e.currentTarget.style.borderColor=T.border;}}}
              >
                <span style={{fontSize:13,color:locked?"rgba(255,255,255,0.12)":rendering?T.blue:accent,animation:rendering?"fadePulse 1s infinite":"none"}}>{locked?"🔒":rendering?"⟳":icon}</span>
                <span style={{fontSize:9,fontWeight:600,color:locked?T.textWhiteDimmer:T.textDark,whiteSpace:"nowrap"}}>{locked?"Locked":rendering?"Running":label}</span>
              </button>
            );
          })}
        </div>

        {!allVisualsDone&&(
          <div style={{display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:4,height:4,borderRadius:"50%",background:T.yellow,flexShrink:0}}/>
            <span style={{fontSize:8,color:T.textWhiteDimmer}}>Video & Audio unlock after all visuals generated</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────


// ═══════════════════════════════════════════════════════════════════
// CREATE TAB — FILM / STORY MODE
// ═══════════════════════════════════════════════════════════════════

async function callClaude(system, messages, maxTokens = 4000) {
  const data = await apiFetch(`/api/generate/text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, messages, maxTokens }),
  });
  return data.text || "";
}

// Robustly extract the first valid JSON object from any model response
function extractJSON(raw) {
  if (!raw) throw new Error("Empty response from server");
  // Strip markdown bold/italic asterisks that contaminate JSON strings
  let text = raw.trim();
  // 1. Direct parse
  try { return JSON.parse(text); } catch(_) {}
  // 2. Strip ```json ... ``` or ``` ... ``` fences
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) { try { return JSON.parse(fenced[1].trim()); } catch(_) {} }
  // 3. Extract first complete { ... } block
  const start = text.indexOf("{");
  const end   = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    try { return JSON.parse(text.slice(start, end + 1)); } catch(_) {}
  }
  // 4. Last resort — strip all markdown formatting and retry
  const cleaned = text
    .replace(/\*\*([^*]+)\*\*/g, "$1")  // **bold**
    .replace(/\*([^*]+)\*/g, "$1")       // *italic*
    .replace(/`([^`]+)`/g, "$1")         // `code`
    .trim();
  const s2 = cleaned.indexOf("{");
  const e2 = cleaned.lastIndexOf("}");
  if (s2 !== -1 && e2 !== -1 && e2 > s2) {
    try { return JSON.parse(cleaned.slice(s2, e2 + 1)); } catch(_) {}
  }
  throw new Error("No valid JSON found in response");
}

const INTERROGATION_SYSTEM = `You are a creative director helping build a storyboard. The user has a rough idea. Ask them exactly 4 focused questions about: tone/mood, main character, visual style, and number of scenes. Format your response as plain text only — no markdown, no bold, no asterisks, no formatting symbols. Write a short warm intro sentence, then number your questions 1. 2. 3. 4. Keep it concise.`;

const STORYBOARD_SYSTEM = `You are a cinematic storyboard AI. You must respond with ONLY a raw JSON object. No markdown. No code fences. No backticks. No explanation. No text before or after. The very first character of your response must be { and the very last character must be }.

Required JSON structure — fill every field with real creative content:
{"title":"snake_case_title","style_bible":"2-3 sentence visual style description","character":{"name":"Character name","description":"Detailed physical description for AI image generation including gender, age, appearance, clothing"},"scenes":[{"scene_number":1,"cards":[{"card_sequence_id":"01","shot_type":"Wide Shot","shot_duration_seconds":5,"camera_mechanics":"camera movement description","script_narration":"narration or dialogue text","audio_direction":"sound and music direction","visual_generation_prompt":"complete detailed prompt for image AI including character, setting, lighting, mood, style","video_motion_prompt":"motion description for video AI","scene_handoff":"how this connects to next card"}]}]}

Rules:
- shot_duration_seconds must be an integer number like 5, not a string like "5"
- scene_number must be an integer number
- Generate 4 to 6 cards total spread across scenes
- Fill every single field with real content — no placeholders
- Start your response with { and end with } — nothing else`;

function StepIndicator({ current }) {
  const STEPS = [
    { label: "Idea", icon: "✦" },
    { label: "Questions", icon: "?" },
    { label: "Storyboard", icon: "◈" },
    { label: "Done", icon: "✓" },
  ];
  return (
    <div style={{ display:"flex", alignItems:"center", marginBottom:24, padding:"0 4px" }}>
      {STEPS.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={step.label} style={{ display:"flex", alignItems:"center", flex: i < STEPS.length-1 ? 1 : "none" }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5, flexShrink:0 }}>
              <div style={{
                width: active ? 38 : 28, height: active ? 38 : 28,
                borderRadius:"50%",
                background: done ? T.green : active ? `linear-gradient(135deg,${T.purple},${T.violet})` : "rgba(255,255,255,0.06)",
                border: active ? `2px solid ${T.purple}66` : done ? `2px solid ${T.green}44` : "1.5px solid rgba(255,255,255,0.08)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize: active ? 15 : 11,
                color: done||active ? "#fff" : "rgba(255,255,255,0.18)",
                fontWeight:700,
                boxShadow: active ? `0 4px 16px ${T.purple}44` : done ? `0 2px 8px ${T.green}33` : "none",
                transition:"all 0.35s cubic-bezier(0.4,0,0.2,1)",
              }}>
                {done ? "✓" : step.icon}
              </div>
              <div style={{
                fontSize: active ? 10 : 9,
                fontWeight: active ? 700 : done ? 500 : 400,
                color: active ? T.textWhite : done ? T.green : T.textWhiteDimmer,
                transition:"color 0.3s", whiteSpace:"nowrap",
              }}>{step.label}</div>
            </div>
            {i < STEPS.length-1 && (
              <div style={{ flex:1, height:2, margin:"0 6px", marginBottom:18, background:"rgba(255,255,255,0.06)", borderRadius:1, position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", inset:0, background: done ? T.green : active ? `linear-gradient(90deg,${T.purple},${T.violet}44)` : "transparent", borderRadius:1, transition:"background 0.4s" }}/>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function getOptionsForQuestion(question) {
  const q = question.toLowerCase();
  if (q.includes("tone")||q.includes("mood")||q.includes("feel"))
    return ["Melancholic & cold","Tense & suspenseful","Warm & hopeful","Dreamlike & surreal","Raw & gritty","Quiet & contemplative"];
  if (q.includes("style")||q.includes("visual")||q.includes("look"))
    return ["Cold cinematic (A24)","Warm documentary","Stylized & graphic","Photorealistic","Desaturated noir","Vibrant & commercial"];
  if (q.includes("length")||q.includes("scene")||q.includes("card")||q.includes("how many"))
    return ["3 cards — short","5 cards — standard","7 cards — detailed","8 cards — full story"];
  if (q.includes("character")||q.includes("who")||q.includes("protagonist"))
    return ["Young woman, 20s","Middle-aged man, 40s","Elderly person","Child or teenager","No main character","Ensemble cast"];
  if (q.includes("location")||q.includes("setting")||q.includes("where")||q.includes("place"))
    return ["Urban city","Rural countryside","Interior space","Natural landscape","Futuristic / sci-fi","Historical setting"];
  if (q.includes("pace")||q.includes("rhythm")||q.includes("speed"))
    return ["Very slow & meditative","Slow build","Moderate","Fast-paced","Variable rhythm"];
  if (q.includes("genre"))
    return ["Drama","Thriller","Documentary","Commercial","Music video","Experimental"];
  return ["Yes, definitely","Somewhat","Not really","Keep it open","Surprise me"];
}

function QuestionCard({ question, value, onChange }) {
  const options = getOptionsForQuestion(question);
  const [showCustom, setShowCustom] = useState(false);
  const [customVal, setCustomVal] = useState("");
  const answered = !!value?.trim();

  return (
    <FloatingCard accentColor={answered ? T.green : T.purple}>
      <div style={{ padding:"14px" }}>
        <div style={{ fontSize:12, fontWeight:600, color:T.textDark, lineHeight:1.5, marginBottom:12 }}>{question}</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom: showCustom ? 10 : 0 }}>
          {options.map(opt => {
            const sel = value===opt;
            return (
              <button key={opt} onClick={()=>{ onChange(opt); setShowCustom(false); setCustomVal(""); }} style={{
                padding:"7px 13px",
                background: sel ? T.purple : T.surfaceDim,
                border:`1.5px solid ${sel ? T.purple : T.border}`,
                borderRadius:22, color: sel?"#fff":T.textMid,
                fontSize:11, fontWeight: sel?600:400,
                cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s",
              }}>{opt}</button>
            );
          })}
          <button onClick={()=>{ setShowCustom(!showCustom); if(!showCustom) onChange(""); }} style={{
            padding:"7px 13px",
            background: showCustom ? T.surfaceDimmer : "transparent",
            border:`1.5px dashed ${showCustom ? T.purple+"55" : "rgba(0,0,0,0.12)"}`,
            borderRadius:22, color: showCustom ? T.purple : T.textLight,
            fontSize:11, cursor:"pointer", fontFamily:"inherit",
          }}>✎ custom</button>
        </div>
        {showCustom && (
          <textarea autoFocus value={customVal}
            onChange={e=>{ setCustomVal(e.target.value); onChange(e.target.value); }}
            placeholder="Type your own answer..." rows={2}
            style={{ width:"100%", background:T.surfaceDim, border:`1.5px solid ${customVal?T.purple+"55":T.border}`, borderRadius:T.radiusSm, color:T.textDark, fontFamily:"inherit", fontSize:12, padding:"8px 10px", resize:"none", outline:"none", lineHeight:1.5, boxSizing:"border-box" }}
          />
        )}
        {answered && (
          <div style={{ marginTop:8, display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:5, height:5, borderRadius:"50%", background:T.green }}/>
            <span style={{ fontSize:10, color:"#16a34a", fontWeight:600 }}>{value}</span>
          </div>
        )}
      </div>
    </FloatingCard>
  );
}

function StoryboardCard({ card }) {
  const [open, setOpen] = useState(false);
  return (
    <FloatingCard>
      <div style={{ padding:"14px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:28, height:28, borderRadius:"50%", background:T.surfaceDim, border:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:T.textMid, fontFamily:"monospace" }}>{card.card_sequence_id}</div>
            <div>
              <div style={{ fontSize:11, fontWeight:600, color:T.textDark }}>{card.shot_type}</div>
              <div style={{ fontSize:9, color:T.textLight }}>{card.shot_duration_seconds}s · {card.camera_mechanics?.slice(0,30)}</div>
            </div>
          </div>
          <button onClick={()=>setOpen(!open)} style={{ background:T.surfaceDim, border:"none", borderRadius:8, padding:"4px 8px", color:T.textLight, fontSize:10, cursor:"pointer", fontFamily:"inherit" }}>{open?"▲":"▼"}</button>
        </div>
        <div style={{ background:T.surfaceDim, borderRadius:T.radiusSm, padding:"8px 10px", marginBottom: open?10:0 }}>
          <SectionLabel label="SCRIPT" />
          <div style={{ fontSize:12, color:T.textDark, fontStyle:"italic", lineHeight:1.5 }}>"{card.script_narration}"</div>
        </div>
        {open && (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {[
              { label:"VISUAL PROMPT",   value:card.visual_generation_prompt, bg:T.surfaceDim, mono:true  },
              { label:"VIDEO MOTION",    value:card.video_motion_prompt,      bg:"#f0f0ff",    mono:true  },
              { label:"AUDIO DIRECTION", value:card.audio_direction,          bg:"#faf0ff",    mono:false },
            ].map(({label,value,bg,mono})=>(
              <div key={label} style={{ background:bg, borderRadius:T.radiusSm, padding:"8px 10px" }}>
                <SectionLabel label={label} />
                <div style={{ fontSize:10, color:T.textMid, lineHeight:1.5, fontFamily:mono?"monospace":"inherit" }}>{value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </FloatingCard>
  );
}

function CreateTab({ onGenerated }) {
  const [step, setStep] = useState(0);
  const [prompt, setPrompt] = useState("");
  const [questions, setQuestions] = useState("");
  const [answers, setAnswers] = useState({});
  const [storyboard, setStoryboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { trigger: triggerTransition, transitionEl } = useParrotTransition();

  const EXAMPLES = [
    "A lone astronaut returns to a silent Earth at dawn",
    "A street food vendor who hides a secret past",
    "Two strangers share an umbrella in Tokyo rain",
    "The last lighthouse keeper on a vanishing coast",
  ];

  const parsedQs = questions.split("\n").filter(l=>l.trim().match(/^\d+[\.\)]/));
  const parsedIntro = questions.split("\n").filter(l=>l.trim()&&!l.trim().match(/^\d+[\.\)]/)).join(" ");
  const allAnswered = parsedQs.length>0 && parsedQs.every((_,i)=>answers[i]?.trim());

  async function handleIdea() {
    if (!prompt.trim()) return;
    setLoading(true); setError(null);
    try {
      const q = await callClaude(INTERROGATION_SYSTEM, [{ role:"user", content:`My idea: "${prompt}"` }]);
      triggerTransition("brief");
      setTimeout(() => { setQuestions(q); setStep(1); }, 420);
    } catch(e) {
      triggerTransition("brief");
      setTimeout(() => {
        setQuestions(`Great concept! A few quick questions before I build your storyboard.\n\n1. What tone are you going for? (melancholic, tense, hopeful, dreamlike)\n2. Tell me about the main character — who are they?\n3. What visual style suits this? (cold cinematic, warm doc, stylized)\n4. How many scenes? (3–8 cards recommended)`);
        setStep(1);
      }, 420);
    }
    setLoading(false);
  }

  async function handleAnswers() {
    if (!allAnswered) return;
    setLoading(true); setError(null);
    const combined = parsedQs.map((q,i)=>`${q}\nAnswer: ${answers[i]}`).join("\n\n");
    try {
      const raw = await callClaude(STORYBOARD_SYSTEM, [
        { role:"user", content:`My idea: "${prompt}"` },
        { role:"assistant", content:questions },
        { role:"user", content:combined },
      ]);
      const sb = extractJSON(raw);
      // Basic sanity check
      if (!sb.scenes || !Array.isArray(sb.scenes) || sb.scenes.length === 0) {
        throw new Error("Storyboard has no scenes");
      }
      triggerTransition("storyboard");
      setTimeout(() => { setStoryboard(sb); setStep(2); }, 420);
    } catch(e) {
      setError(`Generation failed: ${e.message}. Please try again.`);
    }
    setLoading(false);
  }

  function reset() { setStep(0); setPrompt(""); setQuestions(""); setAnswers({}); setStoryboard(null); setError(null); }

  return (
    <div style={{ padding:"20px 16px 40px", display:"flex", flexDirection:"column", gap:12 }}>
      {transitionEl}
      <StepIndicator current={step} />

      {/* ── STEP 0: Idea ── */}
      {step === 0 && (
        <>
          <FloatingCard accentColor={T.purple}>
            <div style={{ padding:"18px 16px" }}>
              <div style={{ fontSize:17, fontWeight:700, color:T.textDark, marginBottom:4 }}>What do you want to make?</div>
              <div style={{ fontSize:12, color:T.textMid, marginBottom:14 }}>Describe an idea. Claude asks a few questions then builds the full storyboard.</div>
              <textarea value={prompt} onChange={e=>setPrompt(e.target.value)}
                placeholder="e.g. A lone astronaut returns to a silent Earth at dawn..."
                rows={4} autoFocus
                onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); handleIdea(); } }}
                style={{ width:"100%", background:T.surfaceDim, border:`1.5px solid ${prompt?T.purple+"55":T.border}`, borderRadius:T.radiusSm, color:T.textDark, fontFamily:"inherit", fontSize:13, padding:"12px 14px", resize:"none", outline:"none", lineHeight:1.6, boxSizing:"border-box", transition:"border-color 0.2s" }}
              />
              <button onClick={handleIdea} disabled={!prompt.trim()||loading} style={{
                marginTop:12, width:"100%", padding:"12px",
                background: prompt.trim()&&!loading ? `linear-gradient(135deg,${T.purple},${T.violet})` : "rgba(0,0,0,0.05)",
                border:"none", borderRadius:T.radiusSm,
                color: prompt.trim()&&!loading ? "#fff" : "rgba(0,0,0,0.2)",
                fontSize:13, fontWeight:700, cursor: prompt.trim()&&!loading?"pointer":"not-allowed",
                fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              }}>
                {loading ? <><span style={{ animation:"spin 1s linear infinite", display:"inline-block" }}>⟳</span> Claude is thinking...</> : "Continue →"}
              </button>
            </div>
          </FloatingCard>

          <div style={{ fontSize:10, color:T.textWhiteDim, fontWeight:600, marginTop:4 }}>TRY AN EXAMPLE</div>
          {EXAMPLES.map(ex => (
            <FloatingCard key={ex} onClick={()=>setPrompt(ex)}>
              <div style={{ padding:"11px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ fontSize:12, color:T.textMid, fontStyle:"italic" }}>"{ex}"</div>
                <div style={{ fontSize:13, color:T.textLight, flexShrink:0, marginLeft:8 }}>→</div>
              </div>
            </FloatingCard>
          ))}
        </>
      )}

      {/* ── STEP 1: Questions ── */}
      {step === 1 && (
        <>
          <FloatingCard>
            <div style={{ padding:"12px 14px" }}>
              <SectionLabel label="YOUR IDEA" />
              <div style={{ fontSize:13, color:T.textDark, fontStyle:"italic" }}>"{prompt}"</div>
            </div>
          </FloatingCard>

          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"0 2px" }}>
            <div style={{ width:28, height:28, borderRadius:"50%", background:`linear-gradient(135deg,${T.purple},${T.violet})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:"#fff", fontWeight:700, flexShrink:0 }}>✦</div>
            <div style={{ fontSize:11, fontWeight:600, color:T.textWhiteDim }}>Claude asks</div>
          </div>

          {parsedIntro && (
            <FloatingCard>
              <div style={{ padding:"12px 14px" }}>
                <div style={{ fontSize:12, color:T.textMid, lineHeight:1.6 }}>{parsedIntro}</div>
              </div>
            </FloatingCard>
          )}

          {parsedQs.map((q,i) => (
            <QuestionCard key={i} question={q} value={answers[i]||""} onChange={val=>setAnswers(p=>({...p,[i]:val}))} />
          ))}

          {/* Progress */}
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"0 2px" }}>
            <div style={{ flex:1, height:3, background:"rgba(255,255,255,0.06)", borderRadius:2 }}>
              <div style={{ height:"100%", width:`${(Object.values(answers).filter(a=>a?.trim()).length/Math.max(parsedQs.length,1))*100}%`, background:`linear-gradient(90deg,${T.purple},${T.green})`, borderRadius:2, transition:"width 0.3s" }}/>
            </div>
            <div style={{ fontSize:10, color:T.textWhiteDimmer, flexShrink:0 }}>
              {Object.values(answers).filter(a=>a?.trim()).length}/{parsedQs.length}
            </div>
          </div>

          {error && <div style={{ padding:"8px 12px", background:"rgba(248,113,113,0.08)", border:`1px solid ${T.red}33`, borderRadius:T.radiusSm, fontSize:11, color:T.red }}>{error}</div>}

          <div style={{ display:"flex", gap:8 }}>
            <button onClick={()=>setStep(0)} style={{ flex:1, padding:"11px", background:"transparent", border:`1px solid rgba(255,255,255,0.1)`, borderRadius:T.radiusSm, color:T.textWhiteDim, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>← Back</button>
            <button onClick={handleAnswers} disabled={!allAnswered||loading} style={{
              flex:2, padding:"11px",
              background: allAnswered&&!loading ? `linear-gradient(135deg,${T.purple},${T.violet})` : "rgba(255,255,255,0.04)",
              border:"none", borderRadius:T.radiusSm,
              color: allAnswered&&!loading ? "#fff" : T.textWhiteDimmer,
              fontSize:12, fontWeight:700, cursor: allAnswered&&!loading?"pointer":"not-allowed",
              fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:6,
            }}>
              {loading ? <><span style={{ animation:"spin 1s linear infinite", display:"inline-block" }}>⟳</span> Building storyboard...</> : "✦ Generate Storyboard"}
            </button>
          </div>
        </>
      )}

      {/* ── STEP 2: Storyboard preview ── */}
      {step === 2 && storyboard && (
        <>
          <FloatingCard accentColor={T.green}>
            <div style={{ padding:"16px" }}>
              <Tag label="✓ STORYBOARD READY" color={T.green} />
              <div style={{ fontSize:15, fontWeight:700, color:T.textDark, margin:"8px 0 6px" }}>{storyboard.title}</div>
              <div style={{ fontSize:11, color:T.textMid, lineHeight:1.6, marginBottom:12 }}>{storyboard.style_bible}</div>
              {storyboard.character?.name && (
                <div style={{ background:T.surfaceDim, borderRadius:T.radiusSm, padding:"10px 12px", marginBottom:12 }}>
                  <SectionLabel label="MAIN CHARACTER" />
                  <div style={{ fontSize:11, fontWeight:600, color:T.textDark, marginBottom:2 }}>{storyboard.character.name}</div>
                  <div style={{ fontSize:10, color:T.textMid, lineHeight:1.5 }}>{storyboard.character.description}</div>
                </div>
              )}
              <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                <Tag label={`${storyboard.scenes.flatMap(s=>s.cards).length} cards`} color={T.purple} />
                <Tag label={`${storyboard.scenes.length} scene${storyboard.scenes.length>1?"s":""}`} color={T.green} />
                <Tag label={`${storyboard.scenes.flatMap(s=>s.cards).reduce((a,c)=>a+c.shot_duration_seconds,0)}s total`} color={T.blue} />
              </div>
            </div>
          </FloatingCard>

          {storyboard.scenes.flatMap(s=>s.cards).map((card,idx) => (
            <StoryboardCard key={card.card_sequence_id || idx} card={card} />
          ))}

          <div style={{ display:"flex", gap:8 }}>
            <button onClick={reset} style={{ flex:1, padding:"11px", background:"transparent", border:`1px solid rgba(255,255,255,0.1)`, borderRadius:T.radiusSm, color:T.textWhiteDim, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>↺ Start over</button>
            <button onClick={()=>{ triggerTransition("scenes"); setTimeout(()=>{ onGenerated(storyboard); setStep(3); }, 420); }} style={{ flex:2, padding:"11px", background:`linear-gradient(135deg,${T.purple},${T.violet})`, border:"none", borderRadius:T.radiusSm, color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>Go to Scenes →</button>
          </div>
        </>
      )}

      {/* ── STEP 3: Done ── */}
      {step === 3 && storyboard && (
        <>
          <FloatingCard accentColor={T.green}>
            <div style={{ padding:"24px 16px", textAlign:"center" }}>
              <div style={{ fontSize:36, marginBottom:10 }}>🎬</div>
              <div style={{ fontSize:15, fontWeight:700, color:T.textDark, marginBottom:6 }}>Storyboard created!</div>
              <div style={{ fontSize:12, color:T.textMid, lineHeight:1.6, marginBottom:14 }}>
                <strong>{storyboard.title}</strong> is ready with {storyboard.scenes.flatMap(s=>s.cards).length} cards. Head to Scenes to generate images, video and audio.
              </div>
              <div style={{ display:"flex", gap:6, justifyContent:"center", flexWrap:"wrap" }}>
                <Tag label={`${storyboard.scenes.flatMap(s=>s.cards).length} cards`} color={T.purple} />
                <Tag label={`${storyboard.scenes.flatMap(s=>s.cards).reduce((a,c)=>a+c.shot_duration_seconds,0)}s`} color={T.blue} />
              </div>
            </div>
          </FloatingCard>
          <button onClick={reset} style={{ width:"100%", padding:"12px", background:"transparent", border:`1px solid rgba(255,255,255,0.1)`, borderRadius:T.radiusSm, color:T.textWhiteDim, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>← Create another</button>
        </>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// SCENES TAB
// ═════════════════════════════════════════════════════════════════════════════


const DEMO_SCENES = [
  { id:1, shot:"Wide Shot", duration:7, script:"A lone astronaut steps onto silent Earth at dawn.", audioScript:"Wind. Grass. Silence.", imageUrl:"https://picsum.photos/seed/201/800/450", imgbbLocked:true, videoUrl:DEMO_VIDEO, audioUrl:DEMO_AUDIO, imageState:"done", videoState:"done", audioState:"done", videoPrompt:"slow push in, camera rises from ground, mist clearing", audioPrompt:"Soft, breathy narration. Long pauses.", bgScores:[{ id:1, prompt:"Low cello drone, cold and sparse", audioUrl:DEMO_AUDIO }] },
  { id:2, shot:"Close-Up", duration:5, script:"She looks up — the sky is the wrong shade of blue.", audioScript:"But the ground feels wrong. Everything does.", imageUrl:null, imgbbLocked:false, videoUrl:null, audioUrl:null, imageState:"idle", videoState:"idle", audioState:"idle", videoPrompt:"rack focus from horizon to face, slow zoom in", audioPrompt:"Quiet whisper, intimate and uncertain.", bgScores:[] },
  { id:3, shot:"Medium Shot", duration:6, script:"Wind moves through empty streets. She is the only one left.", audioScript:"Everyone knows where they belong. I just... stand here.", imageUrl:null, imgbbLocked:false, videoUrl:null, audioUrl:null, imageState:"idle", videoState:"idle", audioState:"idle", videoPrompt:"aerial drone, slow crane down", audioPrompt:"Flat, zero emotion.", bgScores:[] },
];

function SceneCard({ scene, prevScene, onUpdate, onFullscreen }) {
  const [expanded, setExpanded] = useState(false);
  const [imgPct, setImgPct] = useState(0);
  const [vidPct, setVidPct] = useState(0);
  const [audPct, setAudPct] = useState(0);
  const [bgInput, setBgInput] = useState("");
  const [showBgInput, setShowBgInput] = useState(false);
  const fileRef = useRef(null);

  const canImg = !prevScene || prevScene.imgbbLocked;
  const imgDone = scene.imageState==="done";
  const vidDone = scene.videoState==="done";
  const audDone = scene.audioState==="done";

  function sim(setter, onDone) {
    let p=0;
    const t = setInterval(()=>{
      p = Math.min(100, p+Math.floor(Math.random()*12)+4);
      setter(p);
      if(p>=100){ clearInterval(t); setTimeout(onDone,300); }
    },140);
  }

  function genImage() {
    if(!canImg) return;
    onUpdate(scene.id,{imageState:"rendering"});
    sim(setImgPct,()=>{
      const url=`https://picsum.photos/seed/${scene.id*31}/800/450`;
      onUpdate(scene.id,{imageState:"done",imageUrl:url});
      setTimeout(()=>onUpdate(scene.id,{imgbbLocked:true}),800);
    });
  }

  function genVideo() {
    onUpdate(scene.id,{videoState:"rendering"});
    sim(setVidPct,()=>onUpdate(scene.id,{videoState:"done",videoUrl:DEMO_VIDEO}));
  }

  function genAudio() {
    onUpdate(scene.id,{audioState:"rendering"});
    sim(setAudPct,()=>onUpdate(scene.id,{audioState:"done",audioUrl:DEMO_AUDIO}));
  }

  function addBg() {
    if(!bgInput.trim()) return;
    onUpdate(scene.id,{bgScores:[...scene.bgScores,{id:Date.now(),prompt:bgInput,audioUrl:null}]});
    setBgInput(""); setShowBgInput(false);
  }

  const accentCol = imgDone ? T.green : scene.imageState==="rendering" ? T.purple : null;

  return (
    <FloatingCard accentColor={accentCol} style={{ marginBottom:14 }}>

      {/* Image / Video area */}
      <div style={{ position:"relative", height:200, background:T.surfaceDimmer, overflow:"hidden" }}>
        {scene.imageUrl
          ? <img src={scene.imageUrl} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}/>
          : <WhiteboardPlaceholder height={200} label={`scene ${String(scene.id).padStart(2,"0")} · empty`}>
              {scene.imageState==="rendering"
                ? <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:10, color:T.textLight, fontFamily:"monospace", animation:"fadePulse 1.5s infinite", marginBottom:6 }}>rendering · {imgPct}%</div>
                    <div style={{ width:100, height:2, background:"rgba(0,0,0,0.06)", borderRadius:1, margin:"0 auto" }}>
                      <div style={{ height:"100%", width:imgPct+"%", background:`linear-gradient(90deg,${T.purple},${T.violet})`, borderRadius:1, transition:"width 0.3s" }}/>
                    </div>
                  </div>
                : <div style={{ display:"flex", gap:6 }}>
                    <button onClick={()=>fileRef.current?.click()} style={{ padding:"5px 12px", background:"rgba(0,0,0,0.04)", border:`1px solid ${T.border}`, borderRadius:20, color:T.textMid, fontSize:10, cursor:"pointer", fontFamily:"monospace" }}>↑ upload</button>
                    <button onClick={genImage} disabled={!canImg} style={{ padding:"5px 12px", background:canImg?"rgba(99,102,241,0.08)":"rgba(0,0,0,0.03)", border:`1px solid ${canImg?"rgba(99,102,241,0.25)":"rgba(0,0,0,0.06)"}`, borderRadius:20, color:canImg?"rgba(99,102,241,0.8)":"rgba(0,0,0,0.2)", fontSize:10, cursor:canImg?"pointer":"not-allowed", fontFamily:"monospace" }}>
                      {canImg?"✦ generate":"⏳ S"+(scene.id-1)+" first"}
                    </button>
                  </div>
              }
            </WhiteboardPlaceholder>
        }
        <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }}
          onChange={e=>{ const f=e.target.files[0]; if(f){ const u=URL.createObjectURL(f); onUpdate(scene.id,{imageState:"done",imageUrl:u,imgbbLocked:true}); } }}/>

        {vidDone && (
          <div style={{ position:"absolute", inset:0 }}>
            <video src={scene.videoUrl} muted loop autoPlay playsInline style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
            <div style={{ position:"absolute", inset:0, background:"linear-gradient(transparent 55%,rgba(0,0,0,0.4))" }}/>
          </div>
        )}

        {/* Badges top left */}
        <div style={{ position:"absolute", top:10, left:10, display:"flex", gap:5 }}>
          <div style={{ background:"rgba(0,0,0,0.55)", backdropFilter:"blur(6px)", borderRadius:20, padding:"3px 9px", fontSize:10, fontWeight:700, color:"#fff", fontFamily:"monospace" }}>
            {String(scene.id).padStart(2,"0")}
          </div>
          <div style={{ background:"rgba(0,0,0,0.45)", backdropFilter:"blur(6px)", borderRadius:20, padding:"3px 9px", fontSize:9, color:"rgba(255,255,255,0.7)" }}>
            {scene.shot} · {scene.duration}s
          </div>
        </div>

        {/* Badges top right */}
        <div style={{ position:"absolute", top:10, right:10, display:"flex", gap:5 }}>
          {scene.imgbbLocked && <div style={{ background:"rgba(74,222,128,0.9)", borderRadius:20, padding:"2px 8px", fontSize:8, fontWeight:700, color:"#000" }}>🔒 locked</div>}
          {vidDone && <div style={{ background:"rgba(96,165,250,0.9)", borderRadius:20, padding:"2px 8px", fontSize:8, fontWeight:700, color:"#000" }}>▶ video</div>}
          {(imgDone||vidDone) && (
            <button onClick={()=>onFullscreen({type:vidDone?"video":"image",url:vidDone?scene.videoUrl:scene.imageUrl})}
              style={{ background:"rgba(0,0,0,0.5)", backdropFilter:"blur(4px)", border:"none", borderRadius:20, padding:"3px 9px", fontSize:9, color:"#fff", cursor:"pointer" }}>
              ⛶
            </button>
          )}
        </div>

        {/* Status dots */}
        <div style={{ position:"absolute", bottom:10, right:10, display:"flex", gap:4 }}>
          {[imgDone?T.green:scene.imageState==="rendering"?T.blue:"rgba(255,255,255,0.2)", vidDone?T.blue:scene.videoState==="rendering"?T.blue:"rgba(255,255,255,0.2)", audDone?T.violet:scene.audioState==="rendering"?T.violet:"rgba(255,255,255,0.2)"].map((c,i)=>(
            <div key={i} style={{ width:7, height:7, borderRadius:"50%", background:c, border:"1px solid rgba(255,255,255,0.2)" }}/>
          ))}
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding:"12px 14px", display:"flex", flexDirection:"column", gap:10 }}>
        <div style={{ fontSize:13, color:T.textDark, fontStyle:"italic", lineHeight:1.55 }}>"{scene.script}"</div>

        <button onClick={()=>setExpanded(!expanded)} style={{ background:T.surfaceDim, border:"none", borderRadius:T.radiusSm, padding:"8px 12px", color:T.textMid, fontSize:10, cursor:"pointer", fontFamily:"inherit", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span>Video · Audio · Scoring</span>
          <span>{expanded?"▲":"▼"}</span>
        </button>

        {expanded && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>

            {/* VIDEO */}
            <div style={{ background:T.surfaceDim, borderRadius:T.radiusSm, padding:"12px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background:vidDone?T.blue:"rgba(0,0,0,0.15)" }}/>
                  <SectionLabel label="VIDEO" style={{ marginBottom:0 }}/>
                </div>
                {!vidDone
                  ? <PillButton small primary label={scene.videoState==="rendering"?"Rendering "+vidPct+"%":imgDone?"▶ Generate":"Image first"} color="#000" onClick={imgDone&&scene.videoState!=="rendering"?genVideo:undefined} disabled={!imgDone||scene.videoState==="rendering"}/>
                  : <PillButton small label="⛶ View" color={T.blue} onClick={()=>onFullscreen({type:"video",url:scene.videoUrl})}/>
                }
              </div>
              <SectionLabel label="MOTION PROMPT"/>
              <textarea defaultValue={scene.videoPrompt} rows={2} style={{ width:"100%", background:T.surface, border:`1px solid ${T.border}`, borderRadius:8, color:T.textDark, fontFamily:"monospace", fontSize:10, padding:"7px 9px", resize:"none", outline:"none", lineHeight:1.5, boxSizing:"border-box" }}/>
              {scene.videoState==="rendering" && <div style={{ marginTop:6, height:2, background:"rgba(0,0,0,0.05)", borderRadius:1 }}><div style={{ height:"100%", width:vidPct+"%", background:T.blue, borderRadius:1, transition:"width 0.3s" }}/></div>}
              {vidDone && (
                <div onClick={()=>onFullscreen({type:"video",url:scene.videoUrl})} style={{ marginTop:8, borderRadius:8, overflow:"hidden", height:64, cursor:"pointer", position:"relative" }}>
                  <video src={scene.videoUrl} muted loop autoPlay playsInline style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                  <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.25)" }}>
                    <span style={{ color:"#fff", fontSize:16 }}>⛶</span>
                  </div>
                </div>
              )}
            </div>

            {/* AUDIO */}
            <div style={{ background:T.surfaceDim, borderRadius:T.radiusSm, padding:"12px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background:audDone?T.violet:"rgba(0,0,0,0.15)" }}/>
                  <SectionLabel label="NARRATION" style={{ marginBottom:0 }}/>
                </div>
                {!audDone
                  ? <PillButton small primary label={scene.audioState==="rendering"?"Generating "+audPct+"%":"♪ Generate"} color={T.purple} onClick={scene.audioState!=="rendering"?genAudio:undefined} disabled={scene.audioState==="rendering"}/>
                  : <span style={{ fontSize:10, color:T.violet, fontWeight:600 }}>✓ Ready</span>
                }
              </div>
              <div style={{ background:T.surface, borderRadius:8, padding:"7px 9px", marginBottom:8, border:`1px solid ${T.border}` }}>
                <SectionLabel label="SCRIPT LINE"/>
                <div style={{ fontSize:11, color:T.textMid, fontStyle:"italic" }}>"{scene.audioScript}"</div>
              </div>
              <SectionLabel label="VOICE DIRECTION"/>
              <textarea defaultValue={scene.audioPrompt} rows={2} style={{ width:"100%", background:T.surface, border:`1px solid ${T.border}`, borderRadius:8, color:T.textDark, fontFamily:"monospace", fontSize:10, padding:"7px 9px", resize:"none", outline:"none", lineHeight:1.5, boxSizing:"border-box", marginBottom:8 }}/>
              {audDone
                ? <AudioPlayer url={scene.audioUrl} label="AI narration · ElevenLabs" color={T.violet}/>
                : scene.audioState==="rendering"
                ? <div style={{ background:T.surfaceDimmer, borderRadius:T.radiusSm, height:44, display:"flex", alignItems:"center", justifyContent:"center", gap:2 }}>
                    {Array.from({length:16}).map((_,i)=>(
                      <div key={i} style={{ width:3, borderRadius:2, background:T.violet+"55", animation:"audioBar 0.7s ease-in-out infinite", animationDelay:i*0.04+"s", height:(5+Math.abs(Math.sin(i*0.8))*14)+"px" }}/>
                    ))}
                  </div>
                : <div style={{ background:T.surfaceDimmer, borderRadius:T.radiusSm, height:44, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                    <PillButton small label="↑ upload audio" onClick={()=>{}}/>
                    <PillButton small primary label="♪ generate" color={T.purple} onClick={genAudio}/>
                  </div>
              }
              {scene.audioState==="rendering" && <div style={{ marginTop:6, height:2, background:"rgba(0,0,0,0.05)", borderRadius:1 }}><div style={{ height:"100%", width:audPct+"%", background:T.violet, borderRadius:1, transition:"width 0.3s" }}/></div>}
            </div>

            {/* BG SCORING */}
            <div style={{ background:T.surfaceDim, borderRadius:T.radiusSm, padding:"12px" }}>
              <SectionLabel label="BACKGROUND SCORING"/>
              {scene.bgScores.map(bg=>(
                <div key={bg.id} style={{ marginBottom:8 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                    <span style={{ fontSize:10, color:T.purple, fontStyle:"italic" }}>{bg.prompt}</span>
                    <button onClick={()=>onUpdate(scene.id,{bgScores:scene.bgScores.filter(b=>b.id!==bg.id)})} style={{ background:"transparent", border:"none", color:T.textLight, cursor:"pointer", fontSize:13 }}>×</button>
                  </div>
                  {bg.audioUrl
                    ? <AudioPlayer url={bg.audioUrl} label={"BG · "+bg.prompt.slice(0,22)} color={T.purple}/>
                    : <PillButton small primary label="♪ Generate score" color={T.purple} onClick={()=>onUpdate(scene.id,{bgScores:scene.bgScores.map(b=>b.id===bg.id?{...b,audioUrl:DEMO_AUDIO}:b)})}/>
                  }
                </div>
              ))}
              {showBgInput
                ? <div style={{ display:"flex", gap:6 }}>
                    <input autoFocus value={bgInput} onChange={e=>setBgInput(e.target.value)}
                      placeholder="e.g. low cello, cold and sparse..."
                      onKeyDown={e=>{ if(e.key==="Enter") addBg(); if(e.key==="Escape") setShowBgInput(false); }}
                      style={{ flex:1, background:T.surface, border:`1px solid ${T.purple}33`, borderRadius:8, color:T.textDark, fontFamily:"monospace", fontSize:10, padding:"6px 9px", outline:"none" }}/>
                    <button onClick={addBg} style={{ padding:"6px 10px", background:T.purple, border:"none", borderRadius:8, color:"#fff", fontSize:10, cursor:"pointer" }}>+</button>
                    <button onClick={()=>setShowBgInput(false)} style={{ padding:"6px 8px", background:"transparent", border:`1px solid ${T.border}`, borderRadius:8, color:T.textLight, fontSize:10, cursor:"pointer" }}>✕</button>
                  </div>
                : <button onClick={()=>setShowBgInput(true)} style={{ width:"100%", padding:"7px", background:"transparent", border:`1px dashed ${T.purple}33`, borderRadius:8, color:T.purple+"99", fontSize:10, cursor:"pointer", fontFamily:"monospace", display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}>
                    <span style={{ fontSize:14, lineHeight:1 }}>+</span> add background score
                  </button>
              }
            </div>
          </div>
        )}
      </div>
    </FloatingCard>
  );
}



// ═══════════════════════════════════════════════════════════════════
// CREATE TAB — PRODUCT CATALOGUE MODE
// ═══════════════════════════════════════════════════════════════════

// ── Mock library models (in real app comes from user library) ─────────────────
const MOCK_LIBRARY_MODELS = [
  { id:"m1", handle:"@mara_model", name:"Mara", description:"Young woman, late 20s, sharp angular features, pale cool-toned skin, dark circles under deep-set grey-green eyes, black hair cut short and neat.", imageUrl:"https://picsum.photos/seed/model1/200/200" },
  { id:"m2", handle:"@studio_girl", name:"Studio Girl", description:"South Asian woman, early 30s, warm golden-brown skin, long dark wavy hair, high cheekbones, athletic build, confident posture.", imageUrl:"https://picsum.photos/seed/model2/200/200" },
];

// ── Demo products for sandbox testing ────────────────────────────────────────
const DEMO_PRODUCTS = [
  { label:"👗 Linen Dress", name:"Summer Linen Dress", description:"Off-shoulder linen dress, ivory white, eyelet trim, flowy midi length, relaxed fit", imageUrl:"https://picsum.photos/seed/dress1/200/300" },
  { label:"👜 Leather Bag", name:"Mini Leather Tote", description:"Structured mini tote, cognac brown leather, gold hardware, top handles, detachable strap", imageUrl:"https://picsum.photos/seed/bag1/200/300" },
  { label:"👟 Sneakers", name:"Canvas Court Sneakers", description:"Low-top canvas sneakers, off-white, rubber sole, minimal branding, unisex", imageUrl:"https://picsum.photos/seed/shoe1/200/300" },
  { label:"🧥 Blazer", name:"Oversized Linen Blazer", description:"Relaxed oversized blazer, sage green linen, notched lapel, single button, dropped shoulders", imageUrl:"https://picsum.photos/seed/blazer1/200/300" },
];

// ── Claude API ────────────────────────────────────────────────────────────────

async function extractModelDescription(imageBase64) {
  const data = await apiFetch(`/api/generate/describe-image`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64 }),
  });
  return data.text || "";
}

async function generateShotList(products, model, setting, outputType, multiMode) {
  const productList = products.map(p=>`${p.handle}: ${p.name} — ${p.description}`).join("\n");
  const system = `You are a professional fashion photography director. Generate a shot list as JSON only. No markdown.

PRODUCTS:
${productList}

MODEL: ${model.description}
SETTING: ${setting.studio} — ${setting.lighting}
STYLE: ${setting.brandTone}
OUTPUT: ${outputType==="video"?"Images + short video clips":"Images only"}
MULTI-PRODUCT MODE: ${multiMode==="auto"?"Auto-distribute shots across products":"Manual assignment"}

Return ONLY a valid JSON object with no markdown, no fences, no explanation — starting with { and ending with }:
{
  "shoot_title": "Title of this shoot",
  "style_bible": "Visual style description for all shots",
  "shots": [
    {
      "shot_id": "01",
      "shot_type": "Full Body Front",
      "product_handle": "${products[0]?.handle||"@product_01"}",
      "duration_seconds": 5,
      "composition": "Camera angle and framing description",
      "styling_notes": "How product is worn or displayed",
      "visual_generation_prompt": "Complete Flux.1 prompt with model and product description",
      "video_motion_prompt": "Subtle motion description for video",
      "highlight": "What this shot emphasises"
    }
  ]
}

Generate 6-8 shots. Cover: full body front, full body back, 3/4 angle, detail close-up per product, one multi-product shot if multiple products, one flat lay. duration_seconds must be a number. For video prompts use subtle motions: slow rotate, micro drift, hair movement, fabric sway.`;

  const raw = await callClaude(system, [{ role:"user", content:"Generate the shot list now." }], 4000);
  return extractJSON(raw);
}

// ── Shared UI components ──────────────────────────────────────────────────────

function StepBar({ steps, current }) {
  return (
    <div style={{display:"flex",alignItems:"center",padding:"0 4px",marginBottom:20}}>
      {steps.map((step,i)=>{
        const done=i<current, active=i===current;
        return (
          <div key={step} style={{display:"flex",alignItems:"center",flex:i<steps.length-1?1:"none"}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,flexShrink:0}}>
              <div style={{width:active?34:26,height:active?34:26,borderRadius:"50%",background:done?T.green:active?`linear-gradient(135deg,${T.purple},${T.violet})`:"rgba(255,255,255,0.06)",border:active?`2px solid ${T.purple}55`:done?`2px solid ${T.green}44`:"1.5px solid rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:active?13:10,color:done||active?"#fff":"rgba(255,255,255,0.18)",fontWeight:700,boxShadow:active?`0 4px 14px ${T.purple}44`:done?`0 2px 8px ${T.green}33`:"none",transition:"all 0.3s"}}>
                {done?"✓":i+1}
              </div>
              <div style={{fontSize:8,fontWeight:active?700:400,color:active?T.textWhite:done?T.green:T.textWhiteDimmer,whiteSpace:"nowrap"}}>{step}</div>
            </div>
            {i<steps.length-1&&(
              <div style={{flex:1,height:2,margin:"0 4px",marginBottom:16,background:"rgba(255,255,255,0.06)",borderRadius:1,position:"relative"}}>
                <div style={{position:"absolute",inset:0,background:done?T.green:"transparent",borderRadius:1,transition:"background 0.4s"}}/>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Product Row (own fileRef so upload always works) ─────────────────────────
function ProductRow({ product, onUpdate, onRemove, showRemove }) {
  function handleFile(file) {
    const url = URL.createObjectURL(file);
    const handle = "@" + file.name.split(".")[0].toLowerCase().replace(/[^a-z0-9_]/g,"_").slice(0,15);
    onUpdate({ imageUrl:url, imageFile:file, handle });
  }

  return (
    <div style={{
      background:T.surface, borderRadius:T.radius,
      boxShadow: product.imageUrl ? T.shadow : T.shadowSm,
      overflow:"hidden",
      border: product.imageUrl ? `1.5px solid ${T.green}33` : `1px solid ${T.border}`,
      transition:"box-shadow 0.3s, border-color 0.3s",
    }}>
      {product.imageUrl && <div style={{height:3,background:T.green}}/>}

      {/* Full-width image area */}
      <label style={{display:"block",cursor:"pointer",position:"relative"}}>
        <input type="file" accept="image/*"
          style={{position:"absolute",inset:0,opacity:0,width:"100%",height:"100%",cursor:"pointer",zIndex:2}}
          onChange={e=>{const f=e.target.files[0];if(f)handleFile(f);e.target.value="";}}
        />
        <div style={{height:180,position:"relative",overflow:"hidden",
          background:T.surfaceDimmer,
          backgroundImage:"linear-gradient(rgba(0,0,0,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.04) 1px,transparent 1px)",
          backgroundSize:"20px 20px",
        }}>
          {product.imageUrl
            ? <>
                <img src={product.imageUrl} style={{width:"100%",height:"100%",objectFit:"cover",display:"block",pointerEvents:"none"}}/>
                {/* Overlay gradient */}
                <div style={{position:"absolute",inset:0,background:"linear-gradient(transparent 50%, rgba(0,0,0,0.5))",pointerEvents:"none"}}/>
                {/* Locked badge */}
                <div style={{position:"absolute",top:10,right:10,background:"rgba(74,222,128,0.9)",borderRadius:20,padding:"3px 9px",fontSize:9,fontWeight:700,color:"#000",pointerEvents:"none"}}>✓ uploaded</div>
                {/* Replace hint */}
                <div style={{position:"absolute",bottom:10,left:10,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(4px)",borderRadius:20,padding:"3px 9px",fontSize:9,color:"rgba(255,255,255,0.7)",pointerEvents:"none"}}>tap to replace</div>
              </>
            : <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,pointerEvents:"none"}}>
                <div style={{width:44,height:44,borderRadius:"50%",background:"rgba(0,0,0,0.06)",border:`1.5px dashed rgba(0,0,0,0.15)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>📷</div>
                <div style={{fontSize:11,color:T.textMid,fontWeight:500}}>Tap to upload product photo</div>
                <div style={{fontSize:9,color:T.textLight}}>or use a demo below</div>
              </div>
          }
        </div>
      </label>

      {/* Card body */}
      <div style={{padding:"12px 14px",display:"flex",flexDirection:"column",gap:8}}>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <input value={product.name} onChange={e=>onUpdate({name:e.target.value})}
            placeholder="Product name (e.g. Summer Linen Dress)"
            style={{flex:1,background:T.surfaceDim,border:`1px solid ${T.border}`,borderRadius:T.radiusSm,color:T.textDark,fontFamily:"inherit",fontSize:12,fontWeight:600,padding:"8px 10px",outline:"none",boxSizing:"border-box"}}
          />
          {showRemove && (
            <button onClick={onRemove} style={{background:"rgba(248,113,113,0.08)",border:`1px solid ${T.red}22`,borderRadius:"50%",width:28,height:28,color:T.red,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>×</button>
          )}
        </div>

        <input value={product.handle} onChange={e=>onUpdate({handle:e.target.value})}
          placeholder="@handle"
          style={{width:"100%",background:"rgba(99,102,241,0.06)",border:`1px solid ${T.purple}22`,borderRadius:T.radiusSm,color:T.purple,fontFamily:"monospace",fontSize:11,fontWeight:600,padding:"6px 10px",outline:"none",boxSizing:"border-box"}}
        />

        <textarea value={product.description} onChange={e=>onUpdate({description:e.target.value})}
          placeholder="Key details — color, material, cut, features (e.g. ivory linen, off-shoulder, eyelet trim, flowy midi)"
          rows={2}
          style={{width:"100%",background:T.surfaceDim,border:`1px solid ${T.border}`,borderRadius:T.radiusSm,color:T.textDark,fontFamily:"inherit",fontSize:11,padding:"8px 10px",resize:"none",outline:"none",lineHeight:1.5,boxSizing:"border-box"}}
        />

        {/* Demo quick-fill */}
        {!product.imageUrl && (
          <div>
            <div style={{fontSize:8,color:T.textLight,fontWeight:700,letterSpacing:"0.06em",marginBottom:6}}>DEMO PRODUCTS</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
              {DEMO_PRODUCTS.map(d=>(
                <button key={d.label} onClick={()=>onUpdate({imageUrl:d.imageUrl,name:d.name,description:d.description,handle:"@"+d.name.toLowerCase().replace(/\s+/g,"_").replace(/[^a-z0-9_]/g,"")})}
                  style={{
                    padding:0, background:T.surfaceDim, border:`1px solid ${T.border}`,
                    borderRadius:T.radiusSm, cursor:"pointer", overflow:"hidden",
                    display:"flex", flexDirection:"column", transition:"all 0.15s",
                  }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=T.purple+"55";e.currentTarget.style.background="rgba(99,102,241,0.04)";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.background=T.surfaceDim;}}
                >
                  <div style={{height:60,overflow:"hidden",position:"relative"}}>
                    <img src={d.imageUrl} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                    <div style={{position:"absolute",inset:0,background:"linear-gradient(transparent 40%,rgba(0,0,0,0.4))"}}/>
                  </div>
                  <div style={{padding:"5px 7px",textAlign:"left"}}>
                    <div style={{fontSize:9,fontWeight:600,color:T.textDark}}>{d.label}</div>
                    <div style={{fontSize:8,color:T.textLight,marginTop:1,lineHeight:1.3,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{d.description.slice(0,40)}...</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {product.imageUrl && product.name && (
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <Tag label={product.handle} color={T.purple}/>
            <span style={{fontSize:9,color:T.textLight}}>· saved to library</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Step 1: Products ──────────────────────────────────────────────────────────
function ProductsStep({ products, onUpdate, onNext, onBack, library, onAddToLibrary }) {

  function addProduct() {
    const num = (products.length + 1).toString().padStart(2,"0");
    onUpdate([...products, { id:"p"+Date.now(), handle:`@product_${num}`, name:"", description:"", imageUrl:null, imageFile:null }]);
  }

  function updateProduct(id, updates) {
    const updated = products.map(p=>p.id===id?{...p,...updates}:p);
    onUpdate(updated);
    // Auto-save to library when image + name both set
    const changed = updated.find(p=>p.id===id);
    if(changed?.imageUrl && changed?.name?.trim()) {
      onAddToLibrary({ id:changed.id, type:"product", handle:changed.handle, name:changed.name, imageUrl:changed.imageUrl, description:changed.description });
    }
  }

  function removeProduct(id) { onUpdate(products.filter(p=>p.id!==id)); }

  const canContinue = products.length > 0 && products.every(p=>p.imageUrl && p.name.trim());

  // Library products already saved
  const savedProducts = library.filter(i=>i.type==="product");

  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <FloatingCard accentColor={T.purple}>
        <div style={{padding:"16px"}}>
          <div style={{fontSize:15,fontWeight:700,color:T.textDark,marginBottom:4}}>Add Your Products</div>
          <div style={{fontSize:11,color:T.textMid,marginBottom:14}}>
            Upload product photos. Each gets a <span style={{fontFamily:"monospace",color:T.purple}}>@handle</span> for use in prompts.
          </div>

          {/* Saved products from library */}
          {savedProducts.length > 0 && (
            <div style={{marginBottom:12}}>
              <SectionLabel label="FROM YOUR LIBRARY"/>
              <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4}}>
                {savedProducts.map(p=>{
                  const already = products.find(pr=>pr.id===p.id);
                  return (
                    <div key={p.id} onClick={()=>{ if(!already) onUpdate([...products,{...p,imageFile:null}]); }}
                      style={{
                        flexShrink:0, width:80,
                        background:T.surface, borderRadius:T.radiusSm,
                        border:`1.5px solid ${already?T.purple:T.border}`,
                        overflow:"hidden", cursor:already?"default":"pointer",
                        boxShadow:already?`0 0 0 2px ${T.purple}22,${T.shadowSm}`:T.shadowSm,
                        opacity:already?0.7:1, transition:"all 0.15s",
                      }}>
                      <div style={{height:60,overflow:"hidden",position:"relative"}}>
                        <img src={p.imageUrl} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                        {already&&<div style={{position:"absolute",inset:0,background:"rgba(99,102,241,0.3)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:14,color:"#fff",fontWeight:700}}>✓</span></div>}
                      </div>
                      <div style={{padding:"4px 6px"}}>
                        <div style={{fontSize:8,color:T.purple,fontFamily:"monospace",fontWeight:600,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{p.handle}</div>
                        <div style={{fontSize:7,color:T.textLight,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{p.name}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {products.map((product,idx)=>(
              <ProductRow
                key={product.id}
                product={product}
                onUpdate={updates=>updateProduct(product.id, updates)}
                onRemove={()=>removeProduct(product.id)}
                showRemove={products.length>1}
              />
            ))}
          </div>

          <button onClick={addProduct} style={{width:"100%",marginTop:10,padding:"9px",background:"transparent",border:`1.5px dashed ${T.purple}33`,borderRadius:T.radiusSm,color:T.purple+"88",fontSize:11,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
            <span style={{fontSize:16,lineHeight:1}}>+</span> Add another product
          </button>

          <div style={{display:"flex",gap:8,marginTop:10}}>
            <button onClick={onBack} style={{flex:1,padding:"11px",background:"transparent",border:`1px solid ${T.border}`,borderRadius:T.radiusSm,color:T.textMid,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>← Back</button>
            <button onClick={onNext} disabled={!canContinue} style={{flex:2,padding:"11px",background:canContinue?`linear-gradient(135deg,${T.purple},${T.violet})`:"rgba(0,0,0,0.05)",border:"none",borderRadius:T.radiusSm,color:canContinue?"#fff":"rgba(0,0,0,0.2)",fontSize:12,fontWeight:700,cursor:canContinue?"pointer":"not-allowed",fontFamily:"inherit"}}>
              Continue →
            </button>
          </div>
        </div>
      </FloatingCard>
    </div>
  );
}

// ── Step 2: Model ─────────────────────────────────────────────────────────────
function ModelStep({ model, onUpdate, onNext, onBack, library, onAddToLibrary }) {
  const [extracting, setExtracting] = useState(false);
  const [modelSource, setModelSource] = useState(model.source||"library");

  async function handleModelUpload(file) {
    setExtracting(true);
    const url = URL.createObjectURL(file);
    const handle = "@" + file.name.split(".")[0].toLowerCase().replace(/[^a-z0-9_]/g,"_").slice(0,15);
    onUpdate({...model, imageUrl:url, imageFile:file, handle, source:"upload", name:handle, description:"Analysing..."});
    try {
      const reader = new FileReader();
      const base64 = await new Promise(r=>{ reader.onload=()=>r(reader.result.split(",")[1]); reader.readAsDataURL(file); });
      const description = await extractModelDescription(base64);
      const updated = {...model, imageUrl:url, imageFile:file, handle, source:"upload", description, name:handle};
      onUpdate(updated);
      // Auto-save to library
      onAddToLibrary({ id:"model_"+Date.now(), type:"model", handle, name:handle, imageUrl:url, description });
    } catch(e) {
      onUpdate({...model, imageUrl:url, imageFile:file, handle, source:"upload", description:"Could not extract — describe manually.", name:handle});
    }
    setExtracting(false);
  }

  function selectLibraryModel(m) {
    onUpdate({...model, ...m, source:"library"});
    setModelSource("library");
  }

  const canContinue = model.description?.trim() || model.source==="ai";

  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <FloatingCard accentColor={T.blue}>
        <div style={{padding:"16px"}}>
          <div style={{fontSize:15,fontWeight:700,color:T.textDark,marginBottom:4}}>Choose Your Model</div>
          <div style={{fontSize:11,color:T.textMid,marginBottom:14}}>Select from your library, upload a new model, or let AI create one.</div>

          {/* Source toggle */}
          <div style={{display:"flex",gap:6,marginBottom:14}}>
            {[{v:"library",label:"📚 Library"},{v:"upload",label:"↑ Upload"},{v:"ai",label:"✦ AI Model"}].map(({v,label})=>(
              <button key={v} onClick={()=>{setModelSource(v);if(v==="ai")onUpdate({...model,source:"ai",handle:"@ai_model"});}} style={{flex:1,padding:"7px 4px",background:modelSource===v?T.surface:T.surfaceDim,border:`1.5px solid ${modelSource===v?T.blue:T.border}`,borderRadius:T.radiusSm,color:modelSource===v?T.textDark:T.textMid,fontSize:10,fontWeight:modelSource===v?600:400,cursor:"pointer",fontFamily:"inherit",boxShadow:modelSource===v?T.shadowSm:"none",transition:"all 0.15s"}}>
                {label}
              </button>
            ))}
          </div>

          {/* Library models */}
          {modelSource==="library" && (
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {(()=>{
                const allModels=[...MOCK_LIBRARY_MODELS,...library.filter(i=>i.type==="model")];
                return allModels.length===0
                ?<div style={{padding:"20px",textAlign:"center",color:T.textLight,fontSize:11}}>No models in library yet.<br/>Upload one to get started.</div>
                :(<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>{allModels.map(m=>(
                  <div key={m.id} onClick={()=>selectLibraryModel(m)} style={{
                    background:T.surface, borderRadius:T.radius,
                    border: model.id===m.id ? `2px solid ${T.blue}` : `1px solid ${T.border}`,
                    overflow:"hidden", cursor:"pointer",
                    boxShadow: model.id===m.id ? `0 0 0 3px ${T.blue}22, ${T.shadowSm}` : T.shadowSm,
                    transition:"all 0.2s",
                  }}>
                    {model.id===m.id && <div style={{height:3,background:T.blue}}/>}
                    {/* Model image */}
                    <div style={{height:100,position:"relative",overflow:"hidden",background:T.surfaceDimmer}}>
                      <img src={m.imageUrl} style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
                      <div style={{position:"absolute",inset:0,background:"linear-gradient(transparent 50%,rgba(0,0,0,0.5))"}}/>
                      {model.id===m.id && (
                        <div style={{position:"absolute",top:6,right:6,width:20,height:20,borderRadius:"50%",background:T.blue,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:"#fff",fontWeight:700}}>✓</div>
                      )}
                    </div>
                    {/* Model info */}
                    <div style={{padding:"8px 10px"}}>
                      <div style={{fontSize:10,fontWeight:700,color:T.textDark,marginBottom:2}}>{m.name}</div>
                      <div style={{fontFamily:"monospace",fontSize:9,color:T.purple,marginBottom:4}}>{m.handle}</div>
                      <div style={{fontSize:8,color:T.textMid,lineHeight:1.4,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{m.description}</div>
                    </div>
                  </div>
                ))}</div>);
              })()})()}
            </div>
          )}

          {/* Upload new model */}
          {modelSource==="upload" && (
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <label style={{display:"block",cursor:"pointer",position:"relative"}}>
                <input
                  type="file"
                  accept="image/*"
                  style={{position:"absolute",inset:0,opacity:0,width:"100%",height:"100%",cursor:"pointer",zIndex:2}}
                  onChange={e=>{const f=e.target.files[0];if(f)handleModelUpload(f);e.target.value="";}}
                />
                <div style={{
                  height:200, borderRadius:T.radius,
                  border:`1.5px dashed ${model.imageUrl?T.green:T.border}`,
                  background:model.imageUrl?"transparent":T.surfaceDimmer,
                  backgroundImage:model.imageUrl?"none":"linear-gradient(rgba(0,0,0,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,0.04) 1px,transparent 1px)",
                  backgroundSize:"20px 20px",
                  overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",
                }}>
                  {model.imageUrl
                    ? <>
                        <img src={model.imageUrl} style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"top center",pointerEvents:"none"}}/>
                        <div style={{position:"absolute",inset:0,background:"linear-gradient(transparent 60%,rgba(0,0,0,0.5))",pointerEvents:"none"}}/>
                        <div style={{position:"absolute",bottom:10,left:10,background:"rgba(0,0,0,0.5)",backdropFilter:"blur(4px)",borderRadius:20,padding:"3px 9px",fontSize:9,color:"rgba(255,255,255,0.8)",pointerEvents:"none"}}>tap to replace</div>
                        {!extracting && <div style={{position:"absolute",top:10,right:10,background:"rgba(74,222,128,0.9)",borderRadius:20,padding:"3px 9px",fontSize:9,fontWeight:700,color:"#000",pointerEvents:"none"}}>✓ uploaded</div>}
                        {extracting && <div style={{position:"absolute",inset:0,background:"rgba(255,255,255,0.88)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8,pointerEvents:"none"}}>
                          <div style={{fontSize:13,animation:"spin 1s linear infinite",display:"inline-block"}}>⟳</div>
                          <div style={{fontSize:11,color:T.purple,fontWeight:600}}>Claude is analysing model...</div>
                          <div style={{fontSize:9,color:T.textMid}}>Extracting description for prompts</div>
                        </div>}
                      </>
                    : <div style={{textAlign:"center",color:T.textLight,pointerEvents:"none",padding:20}}>
                        <div style={{width:56,height:56,borderRadius:"50%",background:"rgba(0,0,0,0.06)",border:"1.5px dashed rgba(0,0,0,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,margin:"0 auto 10px"}}>👤</div>
                        <div style={{fontSize:12,fontWeight:600,color:T.textMid,marginBottom:4}}>Upload model photo</div>
                        <div style={{fontSize:10,color:T.textLight,lineHeight:1.4}}>Claude Vision will auto-extract<br/>the model description for prompts</div>
                      </div>
                  }
                </div>
              </label>

              {model.imageUrl && !extracting && (
                <>
                  <input value={model.handle||""} onChange={e=>onUpdate({...model,handle:e.target.value})} placeholder="@model_handle" style={{width:"100%",background:T.surfaceDim,border:`1px solid ${T.purple}22`,borderRadius:8,color:T.purple,fontFamily:"monospace",fontSize:11,padding:"7px 9px",outline:"none",boxSizing:"border-box"}}/>
                  <div style={{background:T.surfaceDim,borderRadius:T.radiusSm,padding:"10px 12px"}}>
                    <SectionLabel label="AUTO-EXTRACTED DESCRIPTION"/>
                    <div style={{fontSize:10,color:T.textMid,lineHeight:1.5,fontStyle:"italic"}}>{model.description||"No description extracted yet"}</div>
                    <div style={{fontSize:8,color:T.textLight,marginTop:4}}>✦ Saved to library as {model.handle}</div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* AI model description */}
          {modelSource==="ai" && (
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <div style={{background:T.surfaceDim,borderRadius:T.radiusSm,padding:"10px 12px",border:`1px solid rgba(99,102,241,0.15)`}}>
                <SectionLabel label="DESCRIBE YOUR AI MODEL"/>
                <textarea
                  value={model.description||""}
                  onChange={e=>onUpdate({...model,description:e.target.value,source:"ai"})}
                  placeholder="e.g. South Asian woman, early 30s, warm golden skin, long dark wavy hair, athletic build, high cheekbones, confident posture"
                  rows={3} style={{width:"100%",background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,color:T.textDark,fontFamily:"inherit",fontSize:11,padding:"7px 9px",resize:"none",outline:"none",lineHeight:1.5,boxSizing:"border-box"}}
                />
              </div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {["Young woman, 20s, fair skin","South Asian woman, 30s","Black woman, 20s, natural hair","East Asian woman, 20s","Middle-aged woman, 40s","Plus-size model, confident"].map(s=>(
                  <button key={s} onClick={()=>onUpdate({...model,description:s,source:"ai"})} style={{padding:"4px 9px",background:"rgba(99,102,241,0.06)",border:`1px solid ${T.purple}22`,borderRadius:20,color:T.purple+"99",fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>{s}</button>
                ))}
              </div>
            </div>
          )}

          <div style={{display:"flex",gap:8,marginTop:14}}>
            <button onClick={onBack} style={{flex:1,padding:"10px",background:"transparent",border:`1px solid ${T.border}`,borderRadius:T.radiusSm,color:T.textMid,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>← Back</button>
            <button onClick={onNext} disabled={!canContinue} style={{flex:2,padding:"10px",background:canContinue?`linear-gradient(135deg,${T.purple},${T.violet})`:"rgba(0,0,0,0.05)",border:"none",borderRadius:T.radiusSm,color:canContinue?"#fff":"rgba(0,0,0,0.2)",fontSize:12,fontWeight:700,cursor:canContinue?"pointer":"not-allowed",fontFamily:"inherit"}}>
              Continue →
            </button>
          </div>
        </div>
      </FloatingCard>
    </div>
  );
}

// ── Step 3: Setting ───────────────────────────────────────────────────────────
function SettingStep({ setting, onUpdate, onNext, onBack }) {
  const STUDIOS = ["Clean White Studio","Soft Grey Gradient","Black High-Fashion","Warm Beige Minimal","Outdoor Natural Light","Urban Street","Luxury Interior","Garden / Floral"];
  const LIGHTING = ["Soft Diffused Natural","Dramatic Side Light","Ring Light Beauty","Hard Editorial","Golden Hour Warm","Cool Blue Fashion","Flat Commercial","Rembrandt Portrait"];
  const TONES = ["Luxury & Editorial","Minimal & Clean","Streetwear & Urban","Soft & Romantic","Bold & Graphic","Natural & Organic","High-Fashion Dark","Commercial Bright"];

  const canContinue = setting.studio && setting.lighting && setting.brandTone;

  return (
    <FloatingCard accentColor={T.violet}>
      <div style={{padding:"16px"}}>
        <div style={{fontSize:15,fontWeight:700,color:T.textDark,marginBottom:4}}>Studio & Setting</div>
        <div style={{fontSize:11,color:T.textMid,marginBottom:14}}>Define the visual environment for your shoot.</div>

        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div>
            <SectionLabel label="STUDIO BACKGROUND"/>
            <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
              {STUDIOS.map(s=>(
                <button key={s} onClick={()=>onUpdate({...setting,studio:s})} style={{padding:"6px 11px",background:setting.studio===s?T.purple:T.surfaceDim,border:`1.5px solid ${setting.studio===s?T.purple:T.border}`,borderRadius:20,color:setting.studio===s?"#fff":T.textMid,fontSize:10,fontWeight:setting.studio===s?600:400,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s"}}>{s}</button>
              ))}
            </div>
          </div>

          <div>
            <SectionLabel label="LIGHTING"/>
            <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
              {LIGHTING.map(l=>(
                <button key={l} onClick={()=>onUpdate({...setting,lighting:l})} style={{padding:"6px 11px",background:setting.lighting===l?T.blue:T.surfaceDim,border:`1.5px solid ${setting.lighting===l?T.blue:T.border}`,borderRadius:20,color:setting.lighting===l?"#fff":T.textMid,fontSize:10,fontWeight:setting.lighting===l?600:400,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s"}}>{l}</button>
              ))}
            </div>
          </div>

          <div>
            <SectionLabel label="BRAND TONE"/>
            <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
              {TONES.map(t=>(
                <button key={t} onClick={()=>onUpdate({...setting,brandTone:t})} style={{padding:"6px 11px",background:setting.brandTone===t?T.violet:T.surfaceDim,border:`1.5px solid ${setting.brandTone===t?T.violet:T.border}`,borderRadius:20,color:setting.brandTone===t?"#fff":T.textMid,fontSize:10,fontWeight:setting.brandTone===t?600:400,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s"}}>{t}</button>
              ))}
            </div>
          </div>

          {/* Aspect ratio */}
          <div>
            <SectionLabel label="ASPECT RATIO"/>
            <div style={{display:"flex",gap:6}}>
              {[{v:"9:16",label:"9:16",sub:"Mobile"},{v:"1:1",label:"1:1",sub:"Square"},{v:"4:5",label:"4:5",sub:"Portrait"},{v:"3:4",label:"3:4",sub:"Standard"}].map(({v,label,sub})=>(
                <button key={v} onClick={()=>onUpdate({...setting,aspectRatio:v})} style={{flex:1,padding:"8px 4px",background:setting.aspectRatio===v?T.surface:T.surfaceDim,border:`1.5px solid ${setting.aspectRatio===v?T.purple:T.border}`,borderRadius:T.radiusSm,cursor:"pointer",fontFamily:"inherit",display:"flex",flexDirection:"column",alignItems:"center",gap:2,boxShadow:setting.aspectRatio===v?T.shadowSm:"none",transition:"all 0.15s"}}>
                  <span style={{fontSize:11,fontWeight:700,color:setting.aspectRatio===v?T.purple:T.textMid}}>{label}</span>
                  <span style={{fontSize:8,color:T.textLight}}>{sub}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{display:"flex",gap:8,marginTop:14}}>
          <button onClick={onBack} style={{flex:1,padding:"10px",background:"transparent",border:`1px solid ${T.border}`,borderRadius:T.radiusSm,color:T.textMid,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>← Back</button>
          <button onClick={onNext} disabled={!canContinue} style={{flex:2,padding:"10px",background:canContinue?`linear-gradient(135deg,${T.purple},${T.violet})`:"rgba(0,0,0,0.05)",border:"none",borderRadius:T.radiusSm,color:canContinue?"#fff":"rgba(0,0,0,0.2)",fontSize:12,fontWeight:700,cursor:canContinue?"pointer":"not-allowed",fontFamily:"inherit"}}>
            Continue →
          </button>
        </div>
      </div>
    </FloatingCard>
  );
}

// ── Step 4: Output settings ───────────────────────────────────────────────────
function OutputStep({ outputType, onOutputType, multiMode, onMultiMode, products, onNext, onBack }) {
  return (
    <FloatingCard accentColor={T.green}>
      <div style={{padding:"16px"}}>
        <div style={{fontSize:15,fontWeight:700,color:T.textDark,marginBottom:4}}>Output Settings</div>
        <div style={{fontSize:11,color:T.textMid,marginBottom:14}}>Configure what gets generated and how.</div>

        <div style={{display:"flex",flexDirection:"column",gap:14}}>

          {/* Output type toggle */}
          <div style={{background:T.surfaceDim,borderRadius:T.radiusSm,padding:"12px"}}>
            <SectionLabel label="OUTPUT TYPE"/>
            <div style={{display:"flex",gap:8}}>
              {[
                {v:"images",icon:"📷",label:"Start with Images",sub:"Generate video later if you like"},
                {v:"video",icon:"🎬",label:"Auto-create Video",sub:"Images + video clips together"},
              ].map(({v,icon,label,sub})=>(
                <button key={v} onClick={()=>onOutputType(v)} style={{flex:1,padding:"10px 8px",background:outputType===v?T.surface:T.surfaceDimmer,border:`1.5px solid ${outputType===v?T.purple:T.border}`,borderRadius:T.radiusSm,cursor:"pointer",fontFamily:"inherit",display:"flex",flexDirection:"column",alignItems:"center",gap:4,boxShadow:outputType===v?T.shadow:"none",transition:"all 0.15s"}}>
                  <span style={{fontSize:20}}>{icon}</span>
                  <span style={{fontSize:11,fontWeight:700,color:outputType===v?T.textDark:T.textMid}}>{label}</span>
                  <span style={{fontSize:9,color:T.textLight}}>{sub}</span>
                </button>
              ))}
            </div>
          </div>
          <div style={{padding:"8px 10px",background:"rgba(96,165,250,0.06)",border:`1px solid rgba(96,165,250,0.15)`,borderRadius:T.radiusSm,display:"flex",gap:6,alignItems:"flex-start"}}>
            <span style={{fontSize:12,flexShrink:0}}>💡</span>
            <div style={{fontSize:10,color:T.textMid,lineHeight:1.5}}>
              All shots always include visual prompt, video motion prompt and script. You can generate video for any shot later in Scenes — the output toggle just sets what Auto-Create does by default.
            </div>
          </div>

          {/* Multi-product mode (only if >1 product) */}
          {products.length > 1 && (
            <div style={{background:T.surfaceDim,borderRadius:T.radiusSm,padding:"12px"}}>
              <SectionLabel label="MULTI-PRODUCT SHOT DISTRIBUTION"/>
              <div style={{display:"flex",gap:8,marginBottom:8}}>
                {[
                  {v:"auto",label:"⟳ Auto",sub:"Claude distributes"},
                  {v:"manual",label:"✎ Manual",sub:"You assign per shot"},
                ].map(({v,label,sub})=>(
                  <button key={v} onClick={()=>onMultiMode(v)} style={{flex:1,padding:"8px",background:multiMode===v?T.surface:T.surfaceDimmer,border:`1.5px solid ${multiMode===v?T.blue:T.border}`,borderRadius:T.radiusSm,cursor:"pointer",fontFamily:"inherit",display:"flex",flexDirection:"column",alignItems:"center",gap:2,boxShadow:multiMode===v?T.shadowSm:"none",transition:"all 0.15s"}}>
                    <span style={{fontSize:11,fontWeight:700,color:multiMode===v?T.textDark:T.textMid}}>{label}</span>
                    <span style={{fontSize:9,color:T.textLight}}>{sub}</span>
                  </button>
                ))}
              </div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {products.map(p=><Tag key={p.id} label={p.handle} color={T.purple}/>)}
              </div>
              {multiMode==="auto" && <div style={{fontSize:10,color:T.textMid,marginTop:8,lineHeight:1.4}}>Claude will create 2-3 shots per product, one combined outfit shot, and one flat lay of all products.</div>}
            </div>
          )}

          {/* Export options */}
          <div style={{background:T.surfaceDim,borderRadius:T.radiusSm,padding:"12px"}}>
            <SectionLabel label="EXPORT &amp; PREVIEW"/>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {[
                {icon:"📦",label:"Download ZIP",sub:"All images" + (outputType==="video"?" + video clips":"")},
                {icon:"👁",label:"Preview Gallery",sub:"Browse before downloading"},
                {icon:"📚",label:"Add to Library",sub:"Save shoot as @shoot_name"},
              ].map(({icon,label,sub})=>(
                <div key={label} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",background:T.surface,borderRadius:8,border:`1px solid ${T.border}`}}>
                  <span style={{fontSize:16,flexShrink:0}}>{icon}</span>
                  <div>
                    <div style={{fontSize:11,fontWeight:600,color:T.textDark}}>{label}</div>
                    <div style={{fontSize:9,color:T.textMid}}>{sub}</div>
                  </div>
                  <div style={{marginLeft:"auto",width:16,height:16,borderRadius:"50%",background:T.green,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:"#000",fontWeight:700,flexShrink:0}}>✓</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{display:"flex",gap:8,marginTop:14}}>
          <button onClick={onBack} style={{flex:1,padding:"10px",background:"transparent",border:`1px solid ${T.border}`,borderRadius:T.radiusSm,color:T.textMid,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>← Back</button>
          <button onClick={onNext} style={{flex:2,padding:"10px",background:`linear-gradient(135deg,${T.purple},${T.violet})`,border:"none",borderRadius:T.radiusSm,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
            ✦ Generate Shot List →
          </button>
        </div>
      </div>
    </FloatingCard>
  );
}

// ── Step 5: Shot list preview ─────────────────────────────────────────────────
function ShotListStep({ shotList, outputType, onProceed, onBack, onRegenerate }) {
  const [expanded, setExpanded] = useState(null);
  const [durations, setDurations] = useState({});

  if (!shotList) return (
    <FloatingCard accentColor={T.purple}>
      <div style={{padding:"40px 16px",textAlign:"center"}}>
        <div style={{fontSize:24,marginBottom:10,animation:"spin 1s linear infinite",display:"inline-block"}}>⟳</div>
        <div style={{fontSize:13,color:T.textMid}}>Claude is building your shot list...</div>
      </div>
    </FloatingCard>
  );

  const shots = shotList.shots || [];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <FloatingCard accentColor={T.green}>
        <div style={{padding:"14px 16px"}}>
          <div style={{fontSize:15,fontWeight:700,color:T.textDark,marginBottom:4}}>✓ Shot List Ready</div>
          <div style={{fontSize:11,color:T.textMid,marginBottom:8}}>{shotList.shoot_title}</div>
          <div style={{fontSize:10,color:T.textMid,lineHeight:1.5,marginBottom:10}}>{shotList.style_bible}</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            <Tag label={`${shots.length} shots`} color={T.purple}/>
            <Tag label={outputType==="video"?"Images + Video":"Images only"} color={outputType==="video"?T.blue:T.green}/>
          </div>
        </div>
      </FloatingCard>

      {shots.map((shot,idx)=>(
        <FloatingCard key={shot.shot_id}>
          <div style={{padding:"12px 14px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                <div style={{fontFamily:"monospace",fontSize:12,fontWeight:700,color:T.textDark}}>{shot.shot_id}</div>
                <div style={{fontSize:11,fontWeight:600,color:T.textDark}}>{shot.shot_type}</div>
                <Tag label={shot.product_handle} color={T.purple}/>
              </div>
              <button onClick={()=>setExpanded(expanded===idx?null:idx)} style={{background:T.surfaceDim,border:"none",borderRadius:8,padding:"3px 8px",fontSize:10,color:T.textLight,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>{expanded===idx?"▲":"▼"}</button>
            </div>

            <div style={{fontSize:11,color:T.textMid,marginBottom:8}}>{shot.highlight}</div>

            {/* Duration per shot — only shown for video output */}
            {outputType==="video" ? (
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{fontSize:9,color:T.textLight}}>Duration:</div>
                <div style={{display:"flex",gap:4}}>
                  {[3,5,7,10].map(d=>(
                    <button key={d} onClick={()=>setDurations(p=>({...p,[shot.shot_id]:d}))} style={{padding:"3px 8px",background:(durations[shot.shot_id]||shot.duration_seconds)===d?T.purple:T.surfaceDim,border:`1px solid ${(durations[shot.shot_id]||shot.duration_seconds)===d?T.purple:T.border}`,borderRadius:20,color:(durations[shot.shot_id]||shot.duration_seconds)===d?"#fff":T.textMid,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>{d}s</button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{display:"flex",alignItems:"center",gap:4}}>
                  <div style={{width:5,height:5,borderRadius:"50%",background:T.green}}/>
                  <span style={{fontSize:9,color:"#16a34a",fontWeight:600}}>Image auto-create</span>
                </div>
                <span style={{fontSize:9,color:T.blue,background:"rgba(96,165,250,0.08)",border:`1px solid rgba(96,165,250,0.2)`,borderRadius:20,padding:"1px 7px"}}>video available in Scenes</span>
              </div>
            )}

            {expanded===idx&&(
              <div style={{marginTop:10,display:"flex",flexDirection:"column",gap:8}}>
                <div style={{background:T.surfaceDim,borderRadius:T.radiusSm,padding:"8px 10px"}}>
                  <SectionLabel label="COMPOSITION"/>
                  <div style={{fontSize:10,color:T.textMid,lineHeight:1.5}}>{shot.composition}</div>
                </div>
                <div style={{background:T.surfaceDim,borderRadius:T.radiusSm,padding:"8px 10px"}}>
                  <SectionLabel label="STYLING NOTES"/>
                  <div style={{fontSize:10,color:T.textMid,lineHeight:1.5}}>{shot.styling_notes}</div>
                </div>
                <div style={{background:"#f0f0ff",borderRadius:T.radiusSm,padding:"8px 10px"}}>
                  <SectionLabel label="VISUAL PROMPT"/>
                  <div style={{fontSize:9,color:T.textMid,lineHeight:1.5,fontFamily:"monospace"}}>{shot.visual_generation_prompt}</div>
                </div>
                {outputType==="video"&&(
                  <div style={{background:"#f0f8ff",borderRadius:T.radiusSm,padding:"8px 10px"}}>
                    <SectionLabel label="VIDEO MOTION"/>
                    <div style={{fontSize:9,color:T.textMid,lineHeight:1.5,fontFamily:"monospace"}}>{shot.video_motion_prompt}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </FloatingCard>
      ))}

      <div style={{display:"flex",gap:8}}>
        <button onClick={onRegenerate} style={{flex:1,padding:"10px",background:"transparent",border:`1px solid rgba(255,255,255,0.1)`,borderRadius:T.radiusSm,color:T.textWhiteDim,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>↺ Regenerate</button>
        <button onClick={()=>onProceed(shots.map(s=>({...s,duration_seconds:durations[s.shot_id]||s.duration_seconds})))} style={{flex:2,padding:"10px",background:`linear-gradient(135deg,${T.purple},${T.violet})`,border:"none",borderRadius:T.radiusSm,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
          Go to Scenes →
        </button>
      </div>
    </div>
  );
}

// ── Main: Product Catalogue Mode ─────────────────────────────────────────────
// ── Scenes Preview (what gets passed to Scenes/Timeline tab) ─────────────────
function ScenesPreview({ cards, outputType, onBack, onProceed }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>

      <div style={{background:"rgba(74,222,128,0.08)",border:"1px solid rgba(74,222,128,0.2)",borderRadius:T.radius,padding:"14px 16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:T.green}}/>
          <div style={{fontSize:13,fontWeight:700,color:T.textWhite}}>{cards.length} cards ready for production</div>
        </div>
        <div style={{fontSize:11,color:T.textWhiteDim,lineHeight:1.5}}>
          Each card has visual prompt, video motion prompt and script — ready for any stage. Auto-Create will {outputType==="video"?"generate images and video":"start with images"} — you can always generate video later.
        </div>
        <div style={{display:"flex",gap:6,marginTop:10,flexWrap:"wrap"}}>
          <span style={{padding:"3px 9px",background:T.purple+"15",border:`1px solid ${T.purple}33`,borderRadius:20,fontSize:9,color:T.purple,fontWeight:600}}>{cards.length} shots</span>
          <span style={{padding:"3px 9px",background:T.green+"15",border:`1px solid ${T.green}33`,borderRadius:20,fontSize:9,color:"#16a34a",fontWeight:600}}>Auto: {outputType==="video"?"Images + Video":"Images first"}</span>
          <span style={{padding:"3px 9px",background:T.blue+"15",border:`1px solid ${T.blue}33`,borderRadius:20,fontSize:9,color:T.blue,fontWeight:600}}>✦ Full pipeline available</span>
        </div>
      </div>

      {/* Card previews */}
      {cards.map((card,idx)=>(
        <div key={card.card_sequence_id} style={{background:T.surface,borderRadius:T.radius,boxShadow:"0 4px 16px rgba(0,0,0,0.3)",overflow:"hidden",border:`1px solid ${T.border}`}}>
          <div style={{height:3,background:`linear-gradient(90deg,${T.purple},${T.violet})`}}/>
          <div style={{padding:"12px 14px"}}>

            {/* Header */}
            <div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:10}}>
              {/* Shot number */}
              <div style={{fontFamily:"monospace",fontSize:13,fontWeight:700,color:T.textDark,background:T.surfaceDim,borderRadius:20,padding:"3px 10px",flexShrink:0}}>{card.card_sequence_id}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:700,color:T.textDark,marginBottom:4}}>{card.shot_type}</div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  <div style={{padding:"2px 8px",background:T.purple+"12",border:`1px solid ${T.purple}22`,borderRadius:20,fontSize:9,color:T.purple,fontFamily:"monospace"}}>{card.product_handle}</div>
                  {outputType==="video"&&<div style={{padding:"2px 8px",background:T.blue+"12",border:`1px solid ${T.blue}22`,borderRadius:20,fontSize:9,color:T.blue}}>{card.shot_duration_seconds}s</div>}
                  {outputType==="images"&&<div style={{padding:"2px 8px",background:"rgba(96,165,250,0.1)",border:`1px solid rgba(96,165,250,0.2)`,borderRadius:20,fontSize:9,color:T.blue}}>video available</div>}
                </div>
              </div>
            </div>

            {/* Script */}
            <div style={{background:T.surfaceDim,borderRadius:T.radiusSm,padding:"8px 10px",marginBottom:8}}>
              <div style={{fontSize:8,color:T.textLight,marginBottom:3,fontWeight:700,letterSpacing:"0.06em"}}>SCRIPT</div>
              <div style={{fontSize:11,color:T.textDark,fontStyle:"italic",lineHeight:1.5}}>"{card.script_narration}"</div>
            </div>

            {/* Visual prompt preview */}
            <div style={{background:"#f0f0ff",borderRadius:T.radiusSm,padding:"8px 10px",marginBottom:outputType==="video"?8:0}}>
              <div style={{fontSize:8,color:T.textLight,marginBottom:3,fontWeight:700,letterSpacing:"0.06em"}}>VISUAL PROMPT</div>
              <div style={{fontSize:9,color:T.textMid,lineHeight:1.5,fontFamily:"monospace",display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{card.visual_generation_prompt}</div>
            </div>

            {/* Video motion — always shown, always available */}
            <div style={{background:"#f0f8ff",borderRadius:T.radiusSm,padding:"8px 10px",position:"relative"}}>
              <div style={{fontSize:8,color:T.textLight,marginBottom:3,fontWeight:700,letterSpacing:"0.06em"}}>VIDEO MOTION</div>
              <div style={{fontSize:9,color:T.textMid,lineHeight:1.5,fontFamily:"monospace"}}>{card.video_motion_prompt}</div>
              {outputType==="images"&&(
                <div style={{position:"absolute",top:6,right:8,fontSize:8,color:T.blue,background:"rgba(96,165,250,0.1)",borderRadius:20,padding:"1px 6px"}}>available</div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Actions */}
      <div style={{display:"flex",gap:8,paddingBottom:20}}>
        <button onClick={onBack} style={{flex:1,padding:"11px",background:"transparent",border:"1px solid rgba(255,255,255,0.1)",borderRadius:T.radiusSm,color:T.textWhiteDim,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>← Back</button>
        <button onClick={()=>onProceed(cards)} style={{flex:2,padding:"11px",background:`linear-gradient(135deg,${T.green},${T.blue})`,border:"none",borderRadius:T.radiusSm,color:"#000",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          Open in Scenes →
        </button>
      </div>
    </div>
  );
}



// ═══════════════════════════════════════════════════════════════════
// CATALOGUE MODE WRAPPER
// ═══════════════════════════════════════════════════════════════════
function CatalogueMode({ onGoToProduce }) {
  const [step, setStep]             = useState(0);
  const [products, setProducts]     = useState([{id:"p1",handle:"@product_01",name:"",description:"",imageUrl:null}]);
  const [model, setModel]           = useState({source:"library",id:null,handle:"",name:"",description:"",imageUrl:null});
  const [setting, setSetting]       = useState({studio:"",lighting:"",brandTone:"",aspectRatio:"9:16"});
  const [outputType, setOutputType] = useState("images");
  const [multiMode, setMultiMode]   = useState("auto");
  const [shotList, setShotList]     = useState(null);
  const [generating, setGenerating] = useState(false);
  const [sceneCards, setSceneCards] = useState(null);
  const [library, setLibrary]       = useState([]);
  const { trigger: triggerTransition, transitionEl } = useParrotTransition();

  const STEP_KEYS = ["products","model","setting","output","shotlist"];

  function goStep(n) {
    if (n > step) triggerTransition(STEP_KEYS[n] || "default");
    setTimeout(() => setStep(n), n > step ? 420 : 0);
  }

  function addToLibrary(item){ setLibrary(prev=>prev.find(i=>i.handle===item.handle)?prev.map(i=>i.handle===item.handle?{...i,...item}:i):[...prev,item]); }

  async function handleGenerateShotList(){
    triggerTransition("shotlist");
    setTimeout(async () => {
      setStep(4); setGenerating(true); setShotList(null);
      try {
        const result = await generateShotList(products,model,setting,outputType,multiMode);
        setShotList(result);
      } catch(e) {
        setShotList({
          shoot_title:products.map(p=>p.name).join(" + ")+" — "+setting.studio,
          style_bible:setting.brandTone+" aesthetic. "+setting.lighting+" lighting.",
          shots:[
            {shot_id:"01",shot_type:"Full Body Front",product_handle:products[0]?.handle||"@product",duration_seconds:5,composition:"Full body centred",styling_notes:"Product worn naturally",visual_generation_prompt:`${model.description||"Fashion model"}, wearing ${products[0]?.name||"product"} ${products[0]?.description||""}, ${setting.studio}, ${setting.lighting}, ${setting.brandTone}, professional fashion photography`,video_motion_prompt:"subtle fabric sway, micro drift",highlight:"Front silhouette and overall look"},
            {shot_id:"02",shot_type:"3/4 Angle",product_handle:products[0]?.handle||"@product",duration_seconds:5,composition:"3/4 dynamic angle",styling_notes:"Show movement and volume",visual_generation_prompt:`${model.description||"Fashion model"}, 3/4 angle, wearing ${products[0]?.name||"product"} ${products[0]?.description||""}, ${setting.studio}, ${setting.lighting}, professional fashion photography`,video_motion_prompt:"gentle turn, hair movement",highlight:"Shape and silhouette in motion"},
            {shot_id:"03",shot_type:"Detail Close-Up",product_handle:products[0]?.handle||"@product",duration_seconds:4,composition:"Macro close-up on key feature",styling_notes:"Highlight texture and craft",visual_generation_prompt:`close-up detail, ${products[0]?.name||"product"} ${products[0]?.description||""}, ${setting.studio}, macro lens, ${setting.brandTone}, professional product photography`,video_motion_prompt:"very slow push in, rack focus",highlight:"Product craftsmanship"},
            {shot_id:"04",shot_type:"Flat Lay",product_handle:products[0]?.handle||"@product",duration_seconds:4,composition:"Overhead flat lay",styling_notes:"Clean product-only shot",visual_generation_prompt:`overhead flat lay, ${products[0]?.name||"product"} ${products[0]?.description||""}, ${setting.studio} surface, ${setting.brandTone}, minimal product photography`,video_motion_prompt:"very slow zoom out",highlight:"Product in isolation"},
          ]
        });
      }
      setGenerating(false);
    }, 420);
  }

  return (
    <div style={{padding:"16px 16px 40px",display:"flex",flexDirection:"column",gap:12}}>
      {transitionEl}
      <StepBar steps={["Products","Model","Setting","Output","Shot List"]} current={step}/>
      {step===0&&<ProductsStep products={products} onUpdate={setProducts} onNext={()=>goStep(1)} onBack={()=>{}} library={library} onAddToLibrary={addToLibrary}/>}
      {step===1&&<ModelStep model={model} onUpdate={setModel} onNext={()=>goStep(2)} onBack={()=>goStep(0)} library={library} onAddToLibrary={addToLibrary}/>}
      {step===2&&<SettingStep setting={setting} onUpdate={setSetting} onNext={()=>goStep(3)} onBack={()=>goStep(1)}/>}
      {step===3&&<OutputStep outputType={outputType} onOutputType={setOutputType} multiMode={multiMode} onMultiMode={setMultiMode} products={products} onNext={handleGenerateShotList} onBack={()=>goStep(2)}/>}
      {!sceneCards&&step===4&&<ShotListStep shotList={shotList} outputType={outputType} onBack={()=>goStep(3)} onRegenerate={handleGenerateShotList}
        onProceed={shots=>{
          const cards=shots.map((shot,idx)=>({
            id:idx+1,shot:shot.shot_type,duration:shot.duration_seconds,
            script:shot.highlight||shot.shot_type,audioScript:shot.highlight||"",
            imageUrl:null,imgbbLocked:false,videoUrl:null,audioUrl:null,
            imageState:"idle",videoState:"idle",audioState:"idle",
            videoPrompt:shot.video_motion_prompt||"subtle movement",
            audioPrompt:"Clear product-focused narration",
            bgScores:[],handoff:"",
            visualPrompt:shot.visual_generation_prompt||"",
            productHandle:shot.product_handle,mode:"catalogue",
          }));
          triggerTransition("scenes");
          setTimeout(() => setSceneCards(cards), 420);
        }}
      />}
      {sceneCards&&<ScenesPreview cards={sceneCards} outputType={outputType} onBack={()=>setSceneCards(null)} onProceed={cards=>onGoToProduce(cards)}/>}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════
// SETTINGS TAB
// ═══════════════════════════════════════════════════════════════════
function SettingsTab({ onRecharge, onAdmin, onLibrary }) {
  const ENGINE_OPTIONS = {
    image: ["Together.ai — Flux.1 Schnell","Together.ai — Flux.1 Dev","Fal.ai — Flux","Replicate — SDXL","EvoLink — Nanobanana 2"],
    video: ["Luma Dream Machine","Kling","Runway Gen-3","Pika","MiniMax"],
    audio: ["ElevenLabs","OpenAI TTS","PlayHT","Cartesia"],
    host:  ["imgbb","Cloudflare Images","S3"],
  };
  const [engines, setEngines] = useState({ image:0, video:0, audio:0, host:0 });
  const [defaults, setDefaults] = useState({ aspectRatio:"9:16", shotDuration:5, outputMode:"images", continuity:true });
  const [tapCount, setTapCount] = useState(0);
  const tapTimer = useRef(null);
  const cfg = useAdminConfig();

  function handleVersionTap() {
    setTapCount(n => {
      const next = n + 1;
      clearTimeout(tapTimer.current);
      tapTimer.current = setTimeout(() => setTapCount(0), 1500);
      if (next >= 5) { setTapCount(0); onAdmin?.(); }
      return next;
    });
  }

  return (
    <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:10,paddingBottom:40}}>

      {/* API Engines */}
      <div style={{fontSize:9,fontWeight:700,color:T.textWhiteDim,letterSpacing:"0.08em",marginTop:4}}>API ENGINES</div>
      {[
        { key:"image", label:"Image Generation",   icon:"▭", hint:"Flux.1 model via selected provider" },
        { key:"video", label:"Video Generation",   icon:"▶", hint:"First-frame video with motion prompt" },
        { key:"audio", label:"Audio Narration",    icon:"♪", hint:"Text-to-speech for scene narration" },
        { key:"host",  label:"Image Hosting",      icon:"◫", hint:"Public URL for video continuity chain" },
      ].map(({key,label,icon,hint})=>(
        <div key={key} style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${T.borderDark}`,borderRadius:T.radiusSm,padding:"12px 14px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:13,color:"rgba(255,255,255,0.3)"}}>{icon}</span>
              <div>
                <div style={{fontSize:11,fontWeight:600,color:T.textWhite}}>{label}</div>
                <div style={{fontSize:9,color:T.textWhiteDimmer}}>{hint}</div>
              </div>
            </div>
            <div style={{width:8,height:8,borderRadius:"50%",background:T.purple,boxShadow:`0 0 6px ${T.purple}`}}/>
          </div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {ENGINE_OPTIONS[key].map((opt,i)=>(
              <button key={opt} onClick={()=>setEngines(p=>({...p,[key]:i}))} style={{padding:"4px 10px",background:engines[key]===i?T.purple:"rgba(255,255,255,0.04)",border:`1px solid ${engines[key]===i?T.purple:T.borderDark}`,borderRadius:20,color:engines[key]===i?"#fff":T.textWhiteDim,fontSize:9,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s"}}>{opt}</button>
            ))}
          </div>
        </div>
      ))}

      {/* Project Defaults */}
      <div style={{fontSize:9,fontWeight:700,color:T.textWhiteDim,letterSpacing:"0.08em",marginTop:8}}>PROJECT DEFAULTS</div>

      {/* Aspect ratio */}
      <div style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${T.borderDark}`,borderRadius:T.radiusSm,padding:"12px 14px"}}>
        <div style={{fontSize:10,fontWeight:600,color:T.textWhite,marginBottom:8}}>Aspect Ratio</div>
        <div style={{display:"flex",gap:6}}>
          {["9:16","1:1","4:5","3:4"].map(r=>(
            <button key={r} onClick={()=>setDefaults(p=>({...p,aspectRatio:r}))} style={{flex:1,padding:"7px 4px",background:defaults.aspectRatio===r?"#fff":"rgba(255,255,255,0.04)",border:`1px solid ${defaults.aspectRatio===r?"rgba(255,255,255,0.3)":T.borderDark}`,borderRadius:T.radiusSm,color:defaults.aspectRatio===r?T.textDark:T.textWhiteDim,fontSize:10,fontWeight:defaults.aspectRatio===r?700:400,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s"}}>{r}</button>
          ))}
        </div>
      </div>

      {/* Shot duration */}
      <div style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${T.borderDark}`,borderRadius:T.radiusSm,padding:"12px 14px"}}>
        <div style={{fontSize:10,fontWeight:600,color:T.textWhite,marginBottom:8}}>Default Shot Duration</div>
        <div style={{display:"flex",gap:6}}>
          {[3,5,7,10].map(d=>(
            <button key={d} onClick={()=>setDefaults(p=>({...p,shotDuration:d}))} style={{flex:1,padding:"7px 4px",background:defaults.shotDuration===d?"#fff":"rgba(255,255,255,0.04)",border:`1px solid ${defaults.shotDuration===d?"rgba(255,255,255,0.3)":T.borderDark}`,borderRadius:T.radiusSm,color:defaults.shotDuration===d?T.textDark:T.textWhiteDim,fontSize:10,fontWeight:defaults.shotDuration===d?700:400,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s"}}>{d}s</button>
          ))}
        </div>
      </div>

      {/* Output mode */}
      <div style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${T.borderDark}`,borderRadius:T.radiusSm,padding:"12px 14px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:10,fontWeight:600,color:T.textWhite}}>Auto-Create Video</div>
            <div style={{fontSize:9,color:T.textWhiteDimmer,marginTop:2}}>Generate video clips automatically after images</div>
          </div>
          <div onClick={()=>setDefaults(p=>({...p,outputMode:p.outputMode==="video"?"images":"video"}))} style={{width:40,height:22,borderRadius:11,background:defaults.outputMode==="video"?T.purple:"rgba(255,255,255,0.1)",position:"relative",cursor:"pointer",transition:"background 0.2s",flexShrink:0}}>
            <div style={{position:"absolute",top:3,left:defaults.outputMode==="video"?20:3,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left 0.2s",boxShadow:"0 1px 4px rgba(0,0,0,0.3)"}}/>
          </div>
        </div>
      </div>

      {/* Continuity */}
      <div style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${T.borderDark}`,borderRadius:T.radiusSm,padding:"12px 14px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:10,fontWeight:600,color:T.textWhite}}>Scene Continuity</div>
            <div style={{fontSize:9,color:T.textWhiteDimmer,marginTop:2}}>Pass previous image as style reference for next scene</div>
          </div>
          <div onClick={()=>setDefaults(p=>({...p,continuity:!p.continuity}))} style={{width:40,height:22,borderRadius:11,background:defaults.continuity?T.purple:"rgba(255,255,255,0.1)",position:"relative",cursor:"pointer",transition:"background 0.2s",flexShrink:0}}>
            <div style={{position:"absolute",top:3,left:defaults.continuity?20:3,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left 0.2s",boxShadow:"0 1px 4px rgba(0,0,0,0.3)"}}/>
          </div>
        </div>
      </div>

      {/* Continuity chain info */}
      <div style={{background:"rgba(99,102,241,0.06)",border:`1px solid ${T.purple}22`,borderRadius:T.radiusSm,padding:"12px 14px"}}>
        <div style={{fontSize:8,color:T.textWhiteDimmer,fontWeight:700,letterSpacing:"0.07em",marginBottom:8}}>GENERATION PIPELINE</div>
        {[
          { icon:"▭", label:"Images generate sequentially — each waits for previous lock" },
          { icon:"▶", label:"Videos generate in parallel after all images complete" },
          { icon:"♪", label:"Audio generates in parallel — no dependency" },
          { icon:"⬡", label:"Stitch runs when all video + audio are complete" },
        ].map(({icon,label})=>(
          <div key={label} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:6}}>
            <span style={{fontSize:10,color:"rgba(255,255,255,0.25)",flexShrink:0,width:14}}>{icon}</span>
            <div style={{fontSize:10,color:T.textWhiteDim,lineHeight:1.5}}>{label}</div>
          </div>
        ))}
      </div>

      {/* App info */}
      <div style={{fontSize:9,fontWeight:700,color:T.textWhiteDim,letterSpacing:"0.08em",marginTop:8}}>APP</div>
      {[
        { label:"My Library",       sub:"Saved models, products and assets",       icon:"▣", action: onLibrary  },
        { label:"Recharge Credits", sub:"Buy more generation credits",             icon:"⚡", action: onRecharge },
        { label:"Clear Library",    sub:"Remove all saved models and assets",       icon:"✕", action:()=>{}     },
        { label:"Export All Data",  sub:"Download your projects as JSON",           icon:"↓", action:()=>{}     },
      ].map(({label,sub,action,icon})=>(
        <button key={label} onClick={action} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",background:"rgba(255,255,255,0.03)",border:`1px solid ${T.borderDark}`,borderRadius:T.radiusSm,cursor:"pointer",fontFamily:"inherit",textAlign:"left",transition:"background 0.15s"}}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"}
          onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.03)"}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:14,color:"rgba(255,255,255,0.25)",width:18,textAlign:"center"}}>{icon}</span>
            <div>
              <div style={{fontSize:11,fontWeight:600,color:T.textWhite}}>{label}</div>
              <div style={{fontSize:9,color:T.textWhiteDimmer,marginTop:1}}>{sub}</div>
            </div>
          </div>
          <span style={{fontSize:16,color:T.textWhiteDimmer}}>›</span>
        </button>
      ))}

      <div style={{textAlign:"center",padding:"8px 0"}}>
        {/* EvoLink status pills */}
        <div style={{display:"flex",gap:6,justifyContent:"center",flexWrap:"wrap",marginBottom:8}}>
          {[
            { label:"Image", on:cfg.evolinkEnabled&&!!cfg.evolinkApiKey },
            { label:"Video", on:cfg.evolinkVideoEnabled&&!!cfg.evolinkApiKey },
          ].map(({label,on})=>(
            <div key={label} style={{display:"inline-flex",alignItems:"center",gap:5,padding:"4px 10px",background:on?"rgba(74,222,128,0.08)":"rgba(255,255,255,0.04)",border:`1px solid ${on?T.green+"33":T.borderDark}`,borderRadius:20}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:on?T.green:T.textWhiteDimmer}}/>
              <span style={{fontSize:9,color:on?T.green:T.textWhiteDimmer}}>EvoLink {label} {on?"on":"off"}</span>
            </div>
          ))}
        </div>
        {/* Version — tap 5× to enter admin */}
        <div onClick={handleVersionTap} style={{fontSize:9,color:tapCount>0?T.purple+"99":T.textWhiteDimmer,cursor:"default",userSelect:"none",transition:"color 0.2s"}}>
          Storyboard Engine · v2.0{tapCount>0?` (${tapCount}/5)`:""}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// CREATE TAB WRAPPER — Film/Story ↔ Product Catalogue toggle
// ═══════════════════════════════════════════════════════════════════
function CreateTabWrapper({ onGoToProduce }) {
  const [mode, setMode] = useState("film"); // "film" | "catalogue"

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      {/* Mode toggle */}
      <div style={{padding:"12px 16px 0",flexShrink:0,display:"flex",justifyContent:"center"}}>
        <div style={{display:"flex",background:"rgba(255,255,255,0.06)",borderRadius:22,padding:3,border:`1px solid ${T.borderDark}`}}>
          {[{v:"film",l:"Film / Story"},{v:"catalogue",l:"Product Catalogue"}].map(({v,l})=>(
            <button key={v} onClick={()=>setMode(v)} style={{padding:"6px 16px",borderRadius:20,background:mode===v?"#fff":"transparent",border:"none",fontSize:10,fontWeight:mode===v?700:400,color:mode===v?T.textDark:T.textWhiteDim,cursor:"pointer",fontFamily:"inherit",transition:"all 0.2s",whiteSpace:"nowrap"}}>{l}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{flex:1,overflowY:"auto"}}>
        {mode==="film"
          ? <CreateTab onGenerated={sb=>onGoToProduce(sb,"film")}/>
          : <CatalogueMode onGoToProduce={cards=>onGoToProduce(cards,"catalogue")}/>
        }
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PRODUCE TAB WRAPPER — Scenes ↔ Timeline toggle (same data)
// ═══════════════════════════════════════════════════════════════════
// Uses ActionBar + ScenesView + TimelineView from scenes-timeline-view.jsx
// ProduceTab is just the App() from scenes-timeline-view.jsx renamed
function ProduceTab({ initialScenes, onGoHome }) {
  const [scenes, setScenes] = useState(initialScenes || DEMO_SCENES);
  const [view, setView] = useState("scenes");
  const [openId, setOpenId] = useState(null);
  const [fullscreen, setFullscreen] = useState(null);
  const [stitchState, setStitchState] = useState("idle");
  const [stitchPct, setStitchPct] = useState(0);
  const [autoRunning, setAutoRunning] = useState(false);
  const [autoStep, setAutoStep] = useState("");
  const [showAddSheet, setShowAddSheet] = useState(false);
  const { progress, justCompleted, generateOne } = useGenerator(setScenes);

  const openScene = scenes.find(s=>s.id===openId);
  const openIdx   = scenes.findIndex(s=>s.id===openId);

  function updateScene(id,updates){ setScenes(prev=>prev.map(s=>s.id===id?{...s,...updates}:s)); }
  function deleteScene(id){ if(scenes.length<=1){alert("Cannot delete the last scene!");return;} if(openId===id)setOpenId(null); setScenes(prev=>prev.filter(s=>s.id!==id)); }
  function handleAddScene(s){ setScenes(prev=>[...prev,{...s,id:prev.length+1}]); setShowAddSheet(false); }

  function handleGenerateAll(type){
    const key=type==="image"?"imageState":type==="video"?"videoState":"audioState";
    const targets=type==="video"?scenes.filter(s=>s.videoState==="idle"&&s.imageState==="done"):scenes.filter(s=>s[key]==="idle");
    if(type==="video"&&targets.length===0){alert("Generate visuals first!");return;}
    targets.forEach((s,i)=>setTimeout(()=>generateOne(s.id,type),i*(type==="video"?800:600)));
  }

  async function autoCreate(){
    if(autoRunning)return;
    setAutoRunning(true);
    const wait=ms=>new Promise(r=>setTimeout(r,ms));
    const snap=()=>{let s;setScenes(p=>{s=p;return p;});return s;};
    setAutoStep("Generating visuals...");
    for(const s of snap().filter(s=>s.imageState==="idle")){setAutoStep(`Visual — S${String(s.id).padStart(2,"0")}`);await generateOne(s.id,"image");await wait(300);}
    setAutoStep("Generating videos...");await wait(400);
    for(const s of snap().filter(s=>s.videoState==="idle")){setAutoStep(`Video — S${String(s.id).padStart(2,"0")}`);await generateOne(s.id,"video");await wait(300);}
    setAutoStep("Generating audio...");await wait(400);
    await Promise.all(snap().filter(s=>s.audioState==="idle").map(s=>generateOne(s.id,"audio")));
    setAutoStep("All done ✦");await wait(2000);
    setAutoRunning(false);setAutoStep("");
  }

  function stitch(){
    setStitchState("stitching");setStitchPct(0);
    let p=0;const t=setInterval(()=>{p=Math.min(100,p+Math.floor(Math.random()*5)+2);setStitchPct(p);if(p>=100){clearInterval(t);setTimeout(()=>setStitchState("done"),400);}},180);
  }

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%",overflow:"hidden"}}>
      {/* Home button row */}
      {onGoHome && (
        <div style={{padding:"8px 16px 0",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <button onClick={onGoHome} style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.05)",border:`1px solid ${T.borderDark}`,borderRadius:20,padding:"5px 12px",color:T.textWhiteDim,fontSize:10,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s"}}
            onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.09)"}
            onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.05)"}>
            <span style={{fontSize:13}}>⌂</span>
            <span>Home</span>
          </button>
          <div style={{fontSize:9,color:T.textWhiteDimmer}}>{scenes.length} scene{scenes.length!==1?"s":""} · tap Home to continue later</div>
        </div>
      )}
      <ActionBar
        view={view} setView={setView} scenes={scenes}
        autoRunning={autoRunning} autoStep={autoStep}
        onAutoCreate={autoCreate} onGenerateAll={handleGenerateAll}
        stitchState={stitchState} stitchPct={stitchPct} onStitch={stitch}
      />
      <div style={{flex:1,overflowY:view==="scenes"?"auto":"hidden",overflowX:"hidden",display:"flex",flexDirection:"column"}}>
        {view==="scenes"
          ?<ScenesView scenes={scenes} onOpenCard={setOpenId} onDelete={deleteScene} onAddScene={()=>setShowAddSheet(true)} progress={progress} justCompleted={justCompleted}/>
          :<TimelineView scenes={scenes} onOpenCard={setOpenId} onDelete={deleteScene} onAddScene={()=>setShowAddSheet(true)} progress={progress} justCompleted={justCompleted}/>
        }
      </div>
      {openScene&&<CardModal scene={openScene} prevScene={openIdx>0?scenes[openIdx-1]:null} onClose={()=>setOpenId(null)} onUpdate={updateScene} onFullscreen={setFullscreen} onRegenerate={generateOne}/>}
      {showAddSheet&&<AddSceneSheet scenes={scenes} onAdd={handleAddScene} onCancel={()=>setShowAddSheet(false)}/>}
      {fullscreen&&<Fullscreen type={fullscreen.type} url={fullscreen.url} onClose={()=>setFullscreen(null)}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ADMIN PAGE — password-gated, never shown to users
// ═══════════════════════════════════════════════════════════════════
function AdminPage({ onExit }) {
  const [authed, setAuthed]     = useState(false);
  const [pwInput, setPwInput]   = useState("");
  const [pwError, setPwError]   = useState(false);
  const [saved, setSaved]       = useState(false);
  const cfg                     = useAdminConfig();
  const [local, setLocal]       = useState({ ...cfg });

  useEffect(() => { setLocal({ ...cfg }); }, [cfg.evolinkEnabled]);

  function handleLogin() {
    if (pwInput === ADMIN_PASSWORD) { setAuthed(true); setPwError(false); }
    else { setPwError(true); setPwInput(""); }
  }

  function handleSave() {
    setAdminConfig(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function Field({ label, hint, children }) {
    return (
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: T.textWhite, marginBottom: 2 }}>{label}</div>
        {hint && <div style={{ fontSize: 9, color: T.textWhiteDimmer, marginBottom: 6 }}>{hint}</div>}
        {children}
      </div>
    );
  }

  function inputStyle(extra={}) {
    return { width:"100%", background:"rgba(255,255,255,0.06)", border:`1px solid ${T.borderDark}`, borderRadius:8, color:T.textWhite, fontFamily:"monospace", fontSize:11, padding:"8px 10px", outline:"none", boxSizing:"border-box", ...extra };
  }

  function Toggle2({ value, onChange }) {
    return (
      <div onClick={() => onChange(!value)} style={{ width:44, height:24, borderRadius:12, background:value?T.purple:"rgba(255,255,255,0.1)", position:"relative", cursor:"pointer", transition:"background 0.2s", flexShrink:0 }}>
        <div style={{ position:"absolute", top:4, left:value?22:4, width:16, height:16, borderRadius:"50%", background:"#fff", transition:"left 0.2s", boxShadow:"0 1px 4px rgba(0,0,0,0.4)" }}/>
      </div>
    );
  }

  function StatusPill({ on, labelOn, labelOff, labelWarn, warn }) {
    return (
      <div style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${T.borderDark}`, borderRadius:T.radiusSm, padding:"10px 12px", display:"flex", alignItems:"center", gap:8, marginTop:10 }}>
        <div style={{ width:7, height:7, borderRadius:"50%", flexShrink:0, background: on?T.green:warn?"#f59e0b":T.textWhiteDimmer, boxShadow: on?`0 0 6px ${T.green}`:warn?`0 0 6px #f59e0b`:"none" }}/>
        <div style={{ fontSize:10, color:T.textWhiteDim }}>{on ? labelOn : warn ? (labelWarn||labelOff) : labelOff}</div>
      </div>
    );
  }

  // ── Password Gate ────────────────────────────────────────────────
  if (!authed) return (
    <div style={{ height:"100vh", background:T.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:24, fontFamily:"Inter,system-ui,sans-serif" }}>
      <div style={{ width:"100%", maxWidth:320 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ width:52, height:52, borderRadius:"50%", background:`linear-gradient(135deg,${T.purple},${T.violet})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, margin:"0 auto 14px", boxShadow:`0 0 32px ${T.purple}44` }}>⚙</div>
          <div style={{ fontSize:18, fontWeight:700, color:T.textWhite, marginBottom:4 }}>Admin Access</div>
          <div style={{ fontSize:11, color:T.textWhiteDimmer }}>SceneForge control panel</div>
        </div>
        <div style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${T.borderDark}`, borderRadius:T.radius, padding:"22px 20px" }}>
          <div style={{ fontSize:10, fontWeight:600, color:T.textWhiteDim, marginBottom:8 }}>Password</div>
          <input
            type="password"
            value={pwInput}
            onChange={e => { setPwInput(e.target.value); setPwError(false); }}
            onKeyDown={e => e.key==="Enter" && handleLogin()}
            placeholder="Enter admin password"
            style={{ width:"100%", background:"rgba(255,255,255,0.06)", border:`1.5px solid ${pwError?"#f87171":T.borderDark}`, borderRadius:8, color:T.textWhite, fontFamily:"monospace", fontSize:12, padding:"10px 12px", outline:"none", boxSizing:"border-box", marginBottom:pwError?6:14, transition:"border-color 0.2s" }}
          />
          {pwError && <div style={{ fontSize:10, color:"#f87171", marginBottom:10 }}>Incorrect password</div>}
          <button onClick={handleLogin} style={{ width:"100%", padding:"11px", background:`linear-gradient(135deg,${T.purple},${T.violet})`, border:"none", borderRadius:T.radiusSm, color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit", boxShadow:`0 4px 16px ${T.purple}44` }}>
            Unlock
          </button>
        </div>
        <button onClick={onExit} style={{ width:"100%", marginTop:12, padding:"10px", background:"transparent", border:"none", color:T.textWhiteDimmer, fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>← Back to app</button>
      </div>
    </div>
  );

  // ── Admin Panel ──────────────────────────────────────────────────
  return (
    <div style={{ height:"100vh", background:"#0d0d0f", color:T.textWhite, fontFamily:"Inter,system-ui,sans-serif", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      {/* Header */}
      <div style={{ height:3, background:`linear-gradient(90deg,${T.purple},${T.violet})`, flexShrink:0 }}/>
      <div style={{ padding:"14px 16px", borderBottom:`1px solid ${T.borderDark}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0, background:"rgba(0,0,0,0.4)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:`linear-gradient(135deg,${T.purple},${T.violet})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>⚙</div>
          <div>
            <div style={{ fontSize:13, fontWeight:700 }}>SceneForge Admin</div>
            <div style={{ fontSize:9, color:T.textWhiteDimmer }}>Platform control panel · restricted access</div>
          </div>
        </div>
        <button onClick={onExit} style={{ background:"rgba(255,255,255,0.06)", border:`1px solid ${T.borderDark}`, borderRadius:8, padding:"5px 12px", color:T.textWhiteDim, fontSize:10, cursor:"pointer", fontFamily:"inherit" }}>Exit</button>
      </div>

      {/* Content */}
      <div style={{ flex:1, overflowY:"auto", padding:"16px 16px 48px" }}>

        {/* ── EVOLINK IMAGE ───────────────────────── */}
        <div style={{ fontSize:8, fontWeight:700, color:T.textWhiteDimmer, letterSpacing:"0.1em", marginBottom:10, marginTop:4 }}>EVOLINK — IMAGE GENERATION</div>
        <div style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${T.borderDark}`, borderRadius:T.radius, padding:"16px", marginBottom:14 }}>

          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
            <div>
              <div style={{ fontSize:12, fontWeight:600, color:T.textWhite }}>Enable EvoLink Image Generation</div>
              <div style={{ fontSize:9, color:T.textWhiteDimmer, marginTop:2 }}>Replaces placeholder images with real AI-generated visuals</div>
            </div>
            <Toggle2 value={local.evolinkEnabled} onChange={v=>setLocal(p=>({...p,evolinkEnabled:v}))}/>
          </div>

          <Field label="API Key" hint="Single Bearer token — works for image, video, audio, and LLM. Get it at evolink.ai/dashboard/keys">
            <div style={{ position:"relative" }}>
              <input type="password" value={local.evolinkApiKey}
                onChange={e=>setLocal(p=>({...p,evolinkApiKey:e.target.value}))}
                placeholder="sk-evo-..."
                style={inputStyle()}
              />
              {local.evolinkApiKey && <div style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", fontSize:9, color:T.green, fontWeight:700 }}>✓ SET</div>}
            </div>
          </Field>

          <Field label="Image Model">
            <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
              {EVOLINK_IMAGE_MODELS.map(m=>(
                <button key={m.id} onClick={()=>setLocal(p=>({...p,evolinkImageModel:m.id}))} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 10px", background:local.evolinkImageModel===m.id?`rgba(99,102,241,0.18)`:"rgba(255,255,255,0.04)", border:`1px solid ${local.evolinkImageModel===m.id?T.purple:T.borderDark}`, borderRadius:8, cursor:"pointer", fontFamily:"inherit", textAlign:"left", transition:"all 0.15s" }}>
                  <span style={{ fontSize:10, fontWeight:600, color:local.evolinkImageModel===m.id?"#fff":T.textWhiteDim }}>{m.label}</span>
                  <div style={{ display:"flex", gap:5 }}>
                    <span style={{ fontSize:8, padding:"2px 6px", background:"rgba(255,255,255,0.06)", borderRadius:20, color:T.textWhiteDimmer }}>{m.speed}</span>
                    <span style={{ fontSize:8, padding:"2px 6px", background:"rgba(255,255,255,0.06)", borderRadius:20, color:T.textWhiteDimmer }}>{m.quality}</span>
                  </div>
                </button>
              ))}
            </div>
          </Field>

          <div style={{ display:"flex", gap:10 }}>
            <div style={{ flex:1 }}>
              <Field label="Quality">
                <div style={{ display:"flex", gap:5 }}>
                  {["0.5K","1K","2K","4K"].map(q=>(
                    <button key={q} onClick={()=>setLocal(p=>({...p,evolinkImageQuality:q}))} style={{ flex:1, padding:"6px 4px", background:local.evolinkImageQuality===q?"#fff":"rgba(255,255,255,0.05)", border:`1px solid ${local.evolinkImageQuality===q?"rgba(255,255,255,0.3)":T.borderDark}`, borderRadius:8, color:local.evolinkImageQuality===q?T.textDark:T.textWhiteDim, fontSize:9, cursor:"pointer", fontFamily:"inherit", fontWeight:local.evolinkImageQuality===q?700:400 }}>{q}</button>
                  ))}
                </div>
              </Field>
            </div>
            <div style={{ flex:1 }}>
              <Field label="Aspect">
                <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                  {["9:16","16:9","1:1","4:5"].map(r=>(
                    <button key={r} onClick={()=>setLocal(p=>({...p,evolinkImageAspect:r}))} style={{ padding:"5px 8px", background:local.evolinkImageAspect===r?"#fff":"rgba(255,255,255,0.05)", border:`1px solid ${local.evolinkImageAspect===r?"rgba(255,255,255,0.3)":T.borderDark}`, borderRadius:8, color:local.evolinkImageAspect===r?T.textDark:T.textWhiteDim, fontSize:9, cursor:"pointer", fontFamily:"inherit", fontWeight:local.evolinkImageAspect===r?700:400 }}>{r}</button>
                  ))}
                </div>
              </Field>
            </div>
          </div>

          <StatusPill on={local.evolinkEnabled && !!local.evolinkApiKey} labelOn="Image generation active — real API" labelOff="Image disabled — using Picsum placeholders" labelWarn="Toggle ON but no API key — will fallback" warn={local.evolinkEnabled && !local.evolinkApiKey}/>
        </div>

        {/* ── EVOLINK VIDEO ───────────────────────── */}
        <div style={{ fontSize:8, fontWeight:700, color:T.textWhiteDimmer, letterSpacing:"0.1em", marginBottom:10 }}>EVOLINK — VIDEO GENERATION</div>
        <div style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${T.borderDark}`, borderRadius:T.radius, padding:"16px", marginBottom:14 }}>

          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
            <div>
              <div style={{ fontSize:12, fontWeight:600, color:T.textWhite }}>Enable EvoLink Video Generation</div>
              <div style={{ fontSize:9, color:T.textWhiteDimmer, marginTop:2 }}>Same API key — uses generated image as first frame (I2V) for continuity</div>
            </div>
            <Toggle2 value={local.evolinkVideoEnabled} onChange={v=>setLocal(p=>({...p,evolinkVideoEnabled:v}))}/>
          </div>

          <Field label="Video Model" hint="I2V = Image-to-Video (recommended — uses scene image as first frame). T2V = Text-to-Video (fallback if no image yet).">
            <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
              {EVOLINK_VIDEO_MODELS.map(m=>(
                <button key={m.id} onClick={()=>setLocal(p=>({...p,evolinkVideoModel:m.id}))} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 10px", background:local.evolinkVideoModel===m.id?`rgba(99,102,241,0.18)`:"rgba(255,255,255,0.04)", border:`1px solid ${local.evolinkVideoModel===m.id?T.purple:T.borderDark}`, borderRadius:8, cursor:"pointer", fontFamily:"inherit", textAlign:"left", transition:"all 0.15s" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ fontSize:8, padding:"2px 6px", background:m.mode==="i2v"?"rgba(99,102,241,0.3)":"rgba(56,189,248,0.2)", borderRadius:20, color:m.mode==="i2v"?T.violet:T.blue, fontWeight:700 }}>{m.mode.toUpperCase()}</span>
                    <span style={{ fontSize:10, fontWeight:600, color:local.evolinkVideoModel===m.id?"#fff":T.textWhiteDim }}>{m.label}</span>
                  </div>
                  <div style={{ display:"flex", gap:5 }}>
                    <span style={{ fontSize:8, padding:"2px 6px", background:"rgba(255,255,255,0.06)", borderRadius:20, color:T.textWhiteDimmer }}>{m.speed}</span>
                    <span style={{ fontSize:8, padding:"2px 6px", background:"rgba(255,255,255,0.06)", borderRadius:20, color:T.textWhiteDimmer }}>{m.quality}</span>
                  </div>
                </button>
              ))}
            </div>
          </Field>

          <div style={{ display:"flex", gap:10 }}>
            <div style={{ flex:1 }}>
              <Field label="Quality">
                <div style={{ display:"flex", gap:5 }}>
                  {["480p","720p","1080p"].map(q=>(
                    <button key={q} onClick={()=>setLocal(p=>({...p,evolinkVideoQuality:q}))} style={{ flex:1, padding:"6px 4px", background:local.evolinkVideoQuality===q?"#fff":"rgba(255,255,255,0.05)", border:`1px solid ${local.evolinkVideoQuality===q?"rgba(255,255,255,0.3)":T.borderDark}`, borderRadius:8, color:local.evolinkVideoQuality===q?T.textDark:T.textWhiteDim, fontSize:9, cursor:"pointer", fontFamily:"inherit", fontWeight:local.evolinkVideoQuality===q?700:400 }}>{q}</button>
                  ))}
                </div>
              </Field>
            </div>
            <div style={{ flex:1 }}>
              <Field label="Duration">
                <div style={{ display:"flex", gap:5 }}>
                  {[3,5,7,10].map(d=>(
                    <button key={d} onClick={()=>setLocal(p=>({...p,evolinkVideoDuration:d}))} style={{ flex:1, padding:"6px 4px", background:local.evolinkVideoDuration===d?"#fff":"rgba(255,255,255,0.05)", border:`1px solid ${local.evolinkVideoDuration===d?"rgba(255,255,255,0.3)":T.borderDark}`, borderRadius:8, color:local.evolinkVideoDuration===d?T.textDark:T.textWhiteDim, fontSize:9, cursor:"pointer", fontFamily:"inherit", fontWeight:local.evolinkVideoDuration===d?700:400 }}>{d}s</button>
                  ))}
                </div>
              </Field>
            </div>
          </div>

          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderTop:`1px solid ${T.borderDark}` }}>
            <div>
              <div style={{ fontSize:10, fontWeight:600, color:T.textWhite }}>AI Audio in Video</div>
              <div style={{ fontSize:9, color:T.textWhiteDimmer, marginTop:2 }}>Seedance & Wan include AI-generated ambient audio at no extra charge</div>
            </div>
            <Toggle2 value={local.evolinkVideoAudio !== false} onChange={v=>setLocal(p=>({...p,evolinkVideoAudio:v}))}/>
          </div>

          <StatusPill on={local.evolinkVideoEnabled && !!local.evolinkApiKey} labelOn="Video generation active — same API key as image" labelOff="Video disabled — using demo clips" labelWarn="Toggle ON but no API key set above" warn={local.evolinkVideoEnabled && !local.evolinkApiKey}/>
        </div>

        {/* ── GEMINI ───────────────────────────── */}
        <div style={{ fontSize:8, fontWeight:700, color:T.textWhiteDimmer, letterSpacing:"0.1em", marginBottom:10 }}>GEMINI API (SCRIPT GENERATION)</div>
        <div style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${T.borderDark}`, borderRadius:T.radius, padding:"16px", marginBottom:14 }}>
          <Field label="Gemini API Key" hint="Used for storyboard and shot-list generation">
            <div style={{ position:"relative" }}>
              <input
                type="password"
                value={local.geminiApiKey}
                onChange={e=>setLocal(p=>({...p,geminiApiKey:e.target.value}))}
                placeholder="AIza..."
                style={inputStyle()}
              />
              {local.geminiApiKey && <div style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", fontSize:9, color:T.green, fontWeight:700 }}>✓ SET</div>}
            </div>
          </Field>
        </div>

        {/* ── PLATFORM ───────────────────────────── */}
        <div style={{ fontSize:8, fontWeight:700, color:T.textWhiteDimmer, letterSpacing:"0.1em", marginBottom:10 }}>PLATFORM SETTINGS</div>
        <div style={{ background:"rgba(255,255,255,0.03)", border:`1px solid ${T.borderDark}`, borderRadius:T.radius, padding:"16px", marginBottom:14 }}>

          <Field label="Credit Markup" hint="Your margin on top of API cost (e.g. 40 = 40% markup)">
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <input
                type="number"
                min="0" max="500"
                value={local.markupPercent}
                onChange={e=>setLocal(p=>({...p,markupPercent:Number(e.target.value)}))}
                style={{ ...inputStyle({ width:80 }) }}
              />
              <span style={{ fontSize:11, color:T.textWhiteDim }}>%</span>
              <div style={{ flex:1, fontSize:10, color:T.textWhiteDimmer }}>EvoLink costs × {(1+local.markupPercent/100).toFixed(2)} = user price</div>
            </div>
          </Field>

          <Field label="Free Trial Credits" hint="Credits given to new users on sign-up">
            <input
              type="number"
              min="0" max="500"
              value={local.freeTrialCredits}
              onChange={e=>setLocal(p=>({...p,freeTrialCredits:Number(e.target.value)}))}
              style={{ ...inputStyle({ width:100 }) }}
            />
          </Field>

          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderTop:`1px solid ${T.borderDark}`, marginTop:6 }}>
            <div>
              <div style={{ fontSize:11, fontWeight:600, color:"#f87171" }}>Maintenance Mode</div>
              <div style={{ fontSize:9, color:T.textWhiteDimmer, marginTop:2 }}>Blocks all user generation — shows "under maintenance" message</div>
            </div>
            <Toggle2 value={local.maintenanceMode} onChange={v=>setLocal(p=>({...p,maintenanceMode:v}))}/>
          </div>
        </div>

        {/* ── SAVE ───────────────────────────── */}
        <button onClick={handleSave} style={{
          width:"100%", padding:"14px",
          background: saved ? "rgba(74,222,128,0.15)" : `linear-gradient(135deg,${T.purple},${T.violet})`,
          border: saved ? `1px solid ${T.green}44` : "none",
          borderRadius:T.radius,
          color: saved ? T.green : "#fff",
          fontSize:13, fontWeight:700,
          cursor:"pointer", fontFamily:"inherit",
          display:"flex", alignItems:"center", justifyContent:"center", gap:8,
          transition:"all 0.3s",
          boxShadow: saved ? "none" : `0 4px 20px ${T.purple}44`,
        }}>
          {saved ? "✓ Saved" : "Save All Settings"}
        </button>
        <div style={{ textAlign:"center", marginTop:12, fontSize:9, color:T.textWhiteDimmer }}>Changes apply immediately — no restart needed</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════
export default function App() {
  const [tab, setTab]                    = useState("create");
  const [credits, setCredits]            = useState(MOCK_USER.credits);
  const [showRecharge, setShowRecharge]  = useState(false);
  const [showProfile, setShowProfile]    = useState(false);
  const [showLibrary, setShowLibrary]    = useState(false);
  const [outOfCredits, setOutOfCredits]  = useState(false);
  const [autoTriggered, setAutoTriggered]= useState(false);
  const [library, setLibrary]            = useState([]);
  const [produceScenes, setProduceScenes]= useState(null);
  const [showAdmin, setShowAdmin]        = useState(false);
  const [activeWorkflow, setActiveWorkflow] = useState(null); // persists across tab switches
  const { trigger: triggerTransition, transitionEl } = useParrotTransition();

  function switchTab(newTab) {
    if (newTab === tab) return;
    triggerTransition(newTab);
    setTimeout(() => setTab(newTab), 420);
  }

  useEffect(()=>{
    if(credits<=5&&credits>0&&!showRecharge){setAutoTriggered(true);setShowRecharge(true);}
    if(credits<=0){setOutOfCredits(true);}
  },[credits]);

  function addToLibrary(item){ setLibrary(prev=>prev.find(i=>i.id===item.id)?prev:[...prev,item]); }
  function handleRecharge(amount){ setCredits(c=>Math.min(c+amount,MOCK_USER.creditsMax)); setAutoTriggered(false); setOutOfCredits(false); }

  function handleGoToProduce(data, mode) {
    let scenes;
    if(mode==="film") {
      const cards = data.scenes?.flatMap(s=>s.cards)||[];
      scenes = cards.map((card,idx)=>({
        id:idx+1, shot:card.shot_type||"Shot", duration:card.shot_duration_seconds||5,
        script:card.script_narration||"", audioScript:card.script_narration||"",
        imageUrl:null, imgbbLocked:false, videoUrl:null, audioUrl:null,
        imageState:"idle", videoState:"idle", audioState:"idle",
        videoPrompt:card.video_motion_prompt||"", audioPrompt:card.audio_direction||"",
        bgScores:[], handoff:card.scene_handoff||"",
        visualPrompt:card.visual_generation_prompt||"",
      }));
    } else {
      scenes = Array.isArray(data) ? data : null;
    }
    if (scenes?.length) {
      setProduceScenes(scenes);
      setActiveWorkflow({ scenes, title: data?.title || "Untitled Project" });
    }
    triggerTransition("produce");
    setTimeout(() => setTab("produce"), 420);
  }

  function handleGoHome() {
    triggerTransition("create");
    setTimeout(() => setTab("create"), 420);
  }

  function handleResumeWorkflow() {
    if (!activeWorkflow) return;
    setProduceScenes(activeWorkflow.scenes);
    triggerTransition("produce");
    setTimeout(() => setTab("produce"), 420);
  }

  function handleSignOut() {
    setProduceScenes(null);
    setActiveWorkflow(null);
    setTab("create");
    // In a real app: clear auth tokens here
  }

  const TABS=[
    {id:"create",  icon:"✦", label:"Create"},
    {id:"produce", icon:"◈", label:"Produce"},
    {id:"settings",icon:"⚙", label:"Settings"},
  ];

  return (
    <>
    {showAdmin && <AdminPage onExit={()=>setShowAdmin(false)}/>}
    {!showAdmin && (
    <div style={{height:"100dvh",background:T.bg,color:T.textWhite,fontFamily:"Inter, system-ui, sans-serif",display:"flex",flexDirection:"column",overflow:"hidden",position:"fixed",inset:0}}>
      <style>{`
        html, body, #root { height: 100%; margin: 0; padding: 0; overflow: hidden; }
        @keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
        @keyframes fadePulse{0%,100%{opacity:0.4}50%{opacity:1}}
        @keyframes audioBar{0%,100%{transform:scaleY(0.3)}50%{transform:scaleY(1)}}
        @keyframes shimmerBar{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes glow{0%,100%{box-shadow:0 0 8px ${T.purple}44}50%{box-shadow:0 0 18px ${T.purple}88}}
        .panel-scroll::-webkit-scrollbar{display:none}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:3px;height:3px}
        ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}
      `}</style>

      {/* Header */}
      <AppHeader
        credits={credits} creditsMax={MOCK_USER.creditsMax} avatar={MOCK_USER.avatar}
        onCreditClick={()=>{setAutoTriggered(false);setShowRecharge(true);}}
        onProfileClick={()=>setShowProfile(true)}
      />

      {/* Content */}
      <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
        {tab==="create" && (
          <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
            {/* Resume banner — shown when there's an active workflow */}
            {activeWorkflow && (
              <div style={{padding:"8px 16px 0",flexShrink:0}}>
                <button onClick={handleResumeWorkflow} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:`rgba(99,102,241,0.1)`,border:`1px solid ${T.purple}33`,borderRadius:T.radiusSm,cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s"}}
                  onMouseEnter={e=>e.currentTarget.style.background=`rgba(99,102,241,0.16)`}
                  onMouseLeave={e=>e.currentTarget.style.background=`rgba(99,102,241,0.1)`}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:T.purple,boxShadow:`0 0 6px ${T.purple}`,animation:"fadePulse 1.5s ease-in-out infinite"}}/>
                    <div style={{textAlign:"left"}}>
                      <div style={{fontSize:11,fontWeight:700,color:"#fff"}}>Resume: {activeWorkflow.title}</div>
                      <div style={{fontSize:9,color:T.textWhiteDimmer}}>{activeWorkflow.scenes.length} scenes · tap to continue</div>
                    </div>
                  </div>
                  <span style={{fontSize:13,color:T.purple}}>▶</span>
                </button>
              </div>
            )}
            <div style={{flex:1,overflow:"hidden"}}>
              <CreateTabWrapper onGoToProduce={handleGoToProduce}/>
            </div>
          </div>
        )}
        {tab==="produce"  && <ProduceTab key={produceScenes?produceScenes[0]?.id:"default"} initialScenes={produceScenes} onGoHome={handleGoHome}/>}
        {tab==="settings" && <div style={{overflowY:"auto",flex:1}}><SettingsTab onRecharge={()=>setShowRecharge(true)} onAdmin={()=>setShowAdmin(true)} onLibrary={()=>setShowLibrary(true)}/></div>}
      </div>

      {/* Bottom nav — 3 tabs */}
      <div style={{height:62,background:"rgba(8,8,12,0.98)",backdropFilter:"blur(20px)",borderTop:`1px solid rgba(255,255,255,0.08)`,display:"flex",alignItems:"center",padding:"0 6px",flexShrink:0,paddingBottom:"env(safe-area-inset-bottom)"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>switchTab(t.id)} style={{
            flex:1, height:48,
            background: tab===t.id ? "rgba(99,102,241,0.12)" : "transparent",
            border:"none", borderRadius:14,
            color: tab===t.id ? "#ffffff" : "rgba(255,255,255,0.55)",
            fontSize:10, fontWeight: tab===t.id ? 700 : 500,
            cursor:"pointer", fontFamily:"inherit",
            display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:3,
            transition:"all 0.15s",
          }}>
            <span style={{fontSize:16, opacity: tab===t.id ? 1 : 0.7}}>{t.icon}</span>
            <span style={{letterSpacing:"0.01em"}}>{t.label}</span>
            {tab===t.id && <div style={{width:18,height:2.5,borderRadius:2,background:T.purple,marginTop:1}}/>}
          </button>
        ))}
      </div>

      {/* Overlays */}
      {outOfCredits&&<OutOfCreditsPopup onRecharge={()=>{setOutOfCredits(false);setShowRecharge(true);}} onDismiss={()=>setOutOfCredits(false)}/>}
      {showRecharge&&<RechargeModal credits={credits} creditsMax={MOCK_USER.creditsMax} autoTriggered={autoTriggered} onClose={()=>{setShowRecharge(false);setAutoTriggered(false);}} onRecharge={handleRecharge}/>}
      {showProfile&&<ProfileSheet user={MOCK_USER} credits={credits} onClose={()=>setShowProfile(false)} onRecharge={()=>{setShowProfile(false);setShowRecharge(true);}} onLibrary={()=>{setShowProfile(false);setShowLibrary(true);}} onSettings={()=>{setShowProfile(false);switchTab("settings");}} onSignOut={handleSignOut}/>}
      {showLibrary&&<LibrarySheet library={library} onAddToLibrary={addToLibrary} onClose={()=>setShowLibrary(false)}/>}

      {/* Parrot transition overlay — renders on top of everything */}
      {transitionEl}
    </div>
    )}
    </>
  );
}
