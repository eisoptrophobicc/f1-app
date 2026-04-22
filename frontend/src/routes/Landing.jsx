import React, { useEffect, useState, useRef, useCallback, useReducer } from "react";
import { motion, AnimatePresence } from "motion/react";

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const TICKER_ITEMS = [
  { category: "DRV", pos: "P1", label: "VER", value: "331", unit: "pts" },
  { category: "DRV", pos: "P2", label: "NOR", value: "287", unit: "pts" },
  { category: "DRV", pos: "P3", label: "PIA", value: "271", unit: "pts" },
  { category: "CON", pos: "P1", label: "McLaren", value: "568", unit: "pts" },
  { category: "CON", pos: "P2", label: "Red Bull", value: "532", unit: "pts" },
  { category: "CON", pos: "P3", label: "Mercedes", value: "418", unit: "pts" },
  { category: "RND", label: "Round 22", value: "Abu Dhabi GP" },
  { category: "RND", label: "Next", value: "Bahrain · R1 2025" },
];

const TEASER_DRIVERS = [
  { pos: "P1", name: "Max Verstappen", team: "Red Bull Racing", pts: 331, spark: [30, 34, 38, 44, 42, 48, 54, 58], gap: null },
  { pos: "P2", name: "Lando Norris",   team: "McLaren",         pts: 287, spark: [18, 21, 26, 24, 32, 36, 42, 47], gap: "−44" },
  { pos: "P3", name: "Oscar Piastri",  team: "McLaren",         pts: 271, spark: [20, 22, 25, 29, 33, 35, 39, 43], gap: "−60" },
];

const TEASER_CONSTRUCTORS = [
  { pos: "P1", name: "McLaren",  base: "Woking, UK",     pts: 568, spark: [22, 28, 35, 40, 52, 61, 74, 88], gap: null },
  { pos: "P2", name: "Red Bull", base: "Milton Keynes",  pts: 532, spark: [40, 48, 55, 60, 58, 62, 66, 70], gap: "−36" },
  { pos: "P3", name: "Mercedes", base: "Brackley, UK",   pts: 418, spark: [30, 35, 38, 42, 44, 50, 55, 60], gap: "−150" },
];

const TEASER_RACES = [
  { round: "R20", name: "Mexico City GP", circuit: "Hermanos Rodríguez", date: "27 Oct", status: "done", winner: "VER" },
  { round: "R21", name: "São Paulo GP",   circuit: "Interlagos",          date: "03 Nov", status: "done", winner: "VER" },
  { round: "R22", name: "Abu Dhabi GP",   circuit: "Yas Marina",           date: "08 Dec", status: "next", winner: null },
];

const REPLAY_PTS = [
  [0, 78], [31, 60], [62, 70], [93, 28], [124, 50], [155, 18], [186, 42], [217, 24], [248, 36],
];

/* ─────────────────────────────────────────────
   UTILS
───────────────────────────────────────────── */
function replayDotPos(progress) {
  const x = (progress / 100) * 248;
  for (let i = 0; i < REPLAY_PTS.length - 1; i++) {
    const [x0, y0] = REPLAY_PTS[i];
    const [x1, y1] = REPLAY_PTS[i + 1];
    if (x <= x1) {
      const t = (x - x0) / (x1 - x0);
      return { x, y: y0 + t * (y1 - y0) };
    }
  }
  return { x: 248, y: REPLAY_PTS[REPLAY_PTS.length - 1][1] };
}

function useCountUp(target, active, duration = 1100, delay = 0) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => {
      let start = null;
      const step = (ts) => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        setValue(Math.round(target * ease));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(timer);
  }, [active, target, duration, delay]);
  return value;
}

/* ─────────────────────────────────────────────
   SPARKLINE
───────────────────────────────────────────── */
function SparkLine({ data, id, animated }) {
  const W = 217, H = 40;
  const min = Math.min(...data), max = Math.max(...data);
  const range = Math.max(1, max - min);
  const pts = data.map((y, x) => {
    const ny = (y - min) / range;
    return { x: x * (W / (data.length - 1)), y: H - ny * (H - 4) - 2 };
  });
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${W},${H} L 0,${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: "100%", height: 40, display: "block", overflow: "visible" }}>
      <defs>
        <linearGradient id={`sg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8001D" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#E8001D" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#sg-${id})`} />
      <path d={linePath} fill="none" stroke="#E8001D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {animated && (
        <>
          <circle r="5" fill="rgba(232,0,29,0.12)">
            <animateMotion dur={`${4.5 + id * 0.5}s`} repeatCount="indefinite" calcMode="linear" path={linePath} />
          </circle>
          <circle r="2.4" fill="#E8001D">
            <animateMotion dur={`${4.5 + id * 0.5}s`} repeatCount="indefinite" calcMode="linear" path={linePath} />
          </circle>
        </>
      )}
    </svg>
  );
}

/* ─────────────────────────────────────────────
   CARDS
───────────────────────────────────────────── */
const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: i * 0.09 },
  }),
};

function DriverCard({ driver, index, active }) {
  const pts = useCountUp(driver.pts, active, 1000, index * 100);
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate={active ? "visible" : "hidden"}
      whileHover={{ backgroundColor: "#141416", borderColor: "#2a2a2d" }}
      className="p-5 cursor-pointer"
      style={{ background: "#0F0F11", border: "1px solid #1a1a1c", transition: "background 0.2s, border-color 0.2s" }}
    >
      <div className="flex justify-between items-start mb-3.5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-[10px] tracking-widest" style={{ color: "#E8001D" }}>{driver.pos}</span>
            <span className="w-px h-2.5" style={{ background: "#222" }} />
            <span className="font-mono text-[9px] tracking-wider" style={{ color: "#444" }}>{driver.team}</span>
          </div>
          <div className="text-sm font-normal" style={{ color: "#C8C8C2", fontFamily: "'Instrument Serif', serif" }}>{driver.name}</div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[30px] leading-none tracking-tighter" style={{ color: "#E8E8E2" }}>{pts}</div>
          <div className="font-mono text-[8px] tracking-widest mt-0.5" style={{ color: "#333" }}>PTS</div>
        </div>
      </div>
      <SparkLine data={driver.spark} id={index} animated={active} />
      {driver.gap && (
        <div className="mt-2 font-mono text-[9px] tracking-wider" style={{ color: "#444" }}>{driver.gap} to leader</div>
      )}
    </motion.div>
  );
}

function ConstructorCard({ constructor: c, index, active }) {
  const pts = useCountUp(c.pts, active, 1000, index * 100);
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate={active ? "visible" : "hidden"}
      whileHover={{ backgroundColor: "#141416", borderColor: "#2a2a2d" }}
      className="p-5 cursor-pointer"
      style={{ background: "#0F0F11", border: "1px solid #1a1a1c", transition: "background 0.2s, border-color 0.2s" }}
    >
      <div className="flex justify-between items-start mb-3.5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-[10px] tracking-widest" style={{ color: "#E8001D" }}>{c.pos}</span>
            <span className="w-px h-2.5" style={{ background: "#222" }} />
            <span className="font-mono text-[9px] tracking-wider" style={{ color: "#444" }}>{c.base}</span>
          </div>
          <div className="text-sm font-normal" style={{ color: "#C8C8C2", fontFamily: "'Instrument Serif', serif" }}>{c.name}</div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[30px] leading-none tracking-tighter" style={{ color: "#E8E8E2" }}>{pts}</div>
          <div className="font-mono text-[8px] tracking-widest mt-0.5" style={{ color: "#333" }}>PTS</div>
        </div>
      </div>
      <SparkLine data={c.spark} id={index + 10} animated={active} />
      {c.gap && (
        <div className="mt-2 font-mono text-[9px] tracking-wider" style={{ color: "#444" }}>{c.gap} to leader</div>
      )}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   REVEAL WRAPPER
───────────────────────────────────────────── */
function Reveal({ children, delay = 0, inView, direction = "up", className = "" }) {
  const initial =
    direction === "left"  ? { opacity: 0, x: -20 } :
    direction === "right" ? { opacity: 0, x: 20 }  :
                            { opacity: 0, y: 18 };
  return (
    <motion.div
      className={className}
      initial={initial}
      animate={inView ? { opacity: 1, x: 0, y: 0 } : initial}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: delay / 1000 }}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   AUTH MODAL
───────────────────────────────────────────── */
const AUTH_INITIAL = { tab: "login", form: { email: "", password: "", name: "" }, loading: false, done: false };

function authReducer(state, action) {
  switch (action.type) {
    case "RESET":     return AUTH_INITIAL;
    case "SET_TAB":   return { ...AUTH_INITIAL, tab: action.tab };
    case "SET_FIELD": return { ...state, form: { ...state.form, [action.field]: action.value } };
    case "SUBMIT":    return { ...state, loading: true };
    case "DONE":      return { ...state, loading: false, done: true };
    default:          return state;
  }
}

function AuthField({ label, type, placeholder, value, onChange, last = false }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className={last ? "mb-5" : "mb-3.5"}>
      <div
        className="font-mono text-[8px] tracking-widest mb-1.5 transition-colors duration-150"
        style={{ color: focused ? "#E8001D" : "#2e2e2e" }}
      >
        {label}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full font-mono text-xs outline-none transition-colors duration-150 px-3 py-2.5"
        style={{
          background: "#0A0A0B",
          border: `1px solid ${focused ? "#2a2a2e" : "#161618"}`,
          color: "#C8C8C2",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

function LoadingDots() {
  return (
    <span className="inline-flex gap-0.5 items-center">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block rounded-full"
          style={{ width: 3, height: 3, background: "#fff" }}
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}

function AuthModal({ open, onClose }) {
  const [state, dispatch] = useReducer(authReducer, AUTH_INITIAL);
  const { tab, form, loading, done } = state;
  const overlayRef = useRef(null);

  useEffect(() => { if (open) dispatch({ type: "RESET" }); }, [open]);

  const handleOverlay = useCallback((e) => { if (e.target === overlayRef.current) onClose(); }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open, onClose]);

  const handleSubmit = () => {
    if (!form.email || !form.password) return;
    dispatch({ type: "SUBMIT" });
    setTimeout(() => dispatch({ type: "DONE" }), 1400);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          onClick={handleOverlay}
          className="fixed inset-0 flex items-center justify-center"
          style={{ zIndex: 1000, background: "rgba(0,0,0,0.72)", backdropFilter: "blur(8px)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="w-full relative"
            style={{ maxWidth: 380, background: "#0D0D0F", border: "1px solid #1e1e22" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(232,0,29,0.6), transparent)" }} />

            {/* Header */}
            <div className="px-7 pt-7 flex justify-between items-start">
              <div>
                <div className="text-xl font-normal mb-1" style={{ fontFamily: "'Instrument Serif', serif", color: "#E0E0DA" }}>
                  {tab === "login" ? "Welcome back" : "Create account"}
                </div>
                <div className="font-mono text-[10px] tracking-widest" style={{ color: "#333" }}>LUMEN · FORMULA ONE ANALYTICS</div>
              </div>
              <motion.button
                onClick={onClose}
                className="p-1 leading-none"
                style={{ background: "none", border: "none", cursor: "pointer", color: "#333" }}
                whileHover={{ color: "#888" }}
                transition={{ duration: 0.15 }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <line x1="1" y1="1" x2="13" y2="13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  <line x1="13" y1="1" x2="1" y2="13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </motion.button>
            </div>

            {/* Tabs */}
            <div className="flex mx-7 mt-6" style={{ borderBottom: "1px solid #161618" }}>
              {[["login", "Sign In"], ["signup", "Sign Up"]].map(([t, label]) => (
                <button
                  key={t}
                  onClick={() => dispatch({ type: "SET_TAB", tab: t })}
                  className="font-mono text-[10px] tracking-widest pb-2.5 mr-6 transition-colors duration-150"
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: tab === t ? "#E0E0DA" : "#2e2e2e",
                    borderBottom: `1px solid ${tab === t ? "#E8001D" : "transparent"}`,
                    marginBottom: -1,
                  }}
                >
                  {label.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Form */}
            <div className="px-7 py-6">
              <AnimatePresence mode="wait">
                {done ? (
                  <motion.div
                    key="done"
                    className="text-center py-5"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-3xl mb-3">⚑</div>
                    <div className="text-lg font-normal mb-2" style={{ fontFamily: "'Instrument Serif', serif", color: "#E0E0DA" }}>
                      {tab === "login" ? "You're in." : "Account created."}
                    </div>
                    <div className="font-mono text-[10px] tracking-widest" style={{ color: "#444" }}>REDIRECTING TO DASHBOARD</div>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                    {tab === "signup" && (
                      <AuthField
                        label="FULL NAME" type="text" placeholder="Lewis Hamilton"
                        value={form.name} onChange={(v) => dispatch({ type: "SET_FIELD", field: "name", value: v })}
                      />
                    )}
                    <AuthField
                      label="EMAIL" type="email" placeholder="driver@team.f1"
                      value={form.email} onChange={(v) => dispatch({ type: "SET_FIELD", field: "email", value: v })}
                    />
                    <AuthField
                      label="PASSWORD" type="password" placeholder="••••••••"
                      value={form.password} onChange={(v) => dispatch({ type: "SET_FIELD", field: "password", value: v })}
                      last
                    />

                    {tab === "login" && (
                      <div className="text-right mb-5">
                        <motion.button
                          className="font-mono text-[9px] tracking-wider"
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#333" }}
                          whileHover={{ color: "#666" }}
                        >
                          FORGOT PASSWORD
                        </motion.button>
                      </div>
                    )}

                    <motion.button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="w-full font-mono text-[11px] tracking-widest text-white flex items-center justify-center gap-2 py-3 px-5"
                      style={{ background: loading ? "#5a000f" : "#E8001D", border: "none", cursor: loading ? "default" : "pointer" }}
                      whileHover={!loading ? { backgroundColor: "#c4001a" } : {}}
                      whileTap={!loading ? { scale: 0.98 } : {}}
                    >
                      {loading ? (
                        <><LoadingDots /> {tab === "login" ? "SIGNING IN" : "CREATING ACCOUNT"}</>
                      ) : (
                        tab === "login" ? "SIGN IN ->" : "CREATE ACCOUNT ->"
                      )}
                    </motion.button>

                    <div className="mt-5 text-center font-mono text-[9px] tracking-wider" style={{ color: "#1e1e1e" }}>
                      {tab === "login" ? "DON'T HAVE AN ACCOUNT? " : "ALREADY HAVE AN ACCOUNT? "}
                      <button
                        onClick={() => dispatch({ type: "SET_TAB", tab: tab === "login" ? "signup" : "login" })}
                        className="font-mono text-[9px] tracking-wider underline underline-offset-2"
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#444" }}
                      >
                        {tab === "login" ? "SIGN UP" : "SIGN IN"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────
   HOOK: useInViewOnce
───────────────────────────────────────────── */
function useInViewOnce(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* ─────────────────────────────────────────────
   NAV LINK
───────────────────────────────────────────── */
function NavLink({ label, scrollRef, activeNav, onNav }) {
  const isActive = activeNav === label;
  return (
    <motion.button
      onClick={() => onNav(scrollRef, label)}
      className="relative pb-0.5 font-sans text-xs"
      style={{ background: "none", border: "none", cursor: "pointer", letterSpacing: "0.01em" }}
      animate={{ color: isActive ? "#E8001D" : "#555" }}
      whileHover={{ color: isActive ? "#E8001D" : "#C8C8C2" }}
      transition={{ duration: 0.15 }}
    >
      {"-> "}{label}
      <motion.span
        className="absolute bottom-0 left-0 h-px"
        style={{ background: "#E8001D" }}
        animate={{ width: isActive ? "100%" : "0%" }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      />
    </motion.button>
  );
}

/* ─────────────────────────────────────────────
   MAIN LANDING
───────────────────────────────────────────── */
export default function Landing() {
  const [animationsReady, setAnimationsReady] = useState(false);
  const [scrolled, setScrolled]               = useState(false);
  const [activeNav, setActiveNav]             = useState(null);
  const [playhead, setPlayhead]               = useState(0);
  const [authOpen, setAuthOpen]               = useState(false);
  const [standingsView, setStandingsView]     = useState("driver");

  const standingsRef = useRef(null);
  const calendarRef  = useRef(null);
  const replayRef    = useRef(null);

  const [heroRef]                              = useInViewOnce(0.05);
  const [standingsTeaserRef, standingsInView]  = useInViewOnce(0.1);
  const [calendarTeaserRef,  calendarInView]   = useInViewOnce(0.1);
  const [replayTeaserRef,    replayInView]     = useInViewOnce(0.08);
  const [ctaRef,             ctaInView]        = useInViewOnce(0.15);
  const [footerRef,          footerInView]     = useInViewOnce(0.1);

  // Inject Google Fonts into <head> — @import inside <style> tags is unreliable in bundlers
  useEffect(() => {
    const id = "lumen-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500&family=DM+Mono:wght@300;400;500&display=swap";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setAnimationsReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Playhead rAF
  useEffect(() => {
    let start = null;
    const duration = 6000;
    let raf;
    const step = (ts) => {
      if (start === null) start = ts;
      setPlayhead(((ts - start) % duration) / duration * 100);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = authOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [authOpen]);

  const scrollTo = (ref, label) => {
    setActiveNav(label);
    ref?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const heroVariants = {
    hidden:  { opacity: 0, y: 16 },
    visible: (delay) => ({
      opacity: 1, y: 0,
      transition: { duration: 0.78, ease: [0.22, 1, 0.36, 1], delay: delay / 1000 },
    }),
  };

  const dot = replayDotPos(playhead);

  return (
    <div
      data-motion-ready={animationsReady ? "true" : "false"}
      style={{ background: "#0A0A0B", minHeight: "100vh" }}
    >
      <style>{`
        html { scroll-behavior: smooth; }

        @keyframes tickerScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-33.333%); } }
        .ticker-inner { animation: tickerScroll 32s linear infinite; }
        .ticker-strip:hover .ticker-inner { animation-play-state: paused; }

        @keyframes softFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
        [data-motion-ready="true"] .soft-float { animation: softFloat 7s ease-in-out infinite; }

        @keyframes heroGlowPulse { 0%, 100% { opacity: 0.07; } 50% { opacity: 0.14; } }
        .hero-glow { animation: heroGlowPulse 5s ease-in-out infinite; }

        @keyframes traceFlow { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -30; } }
        .replay-line   { stroke-dasharray: 20 10; animation: traceFlow 2.4s linear infinite; }
        .replay-line-b { stroke-dasharray: 14 14; animation: traceFlow 3.6s linear infinite; }
        .replay-line-c { stroke-dasharray:  8 20; animation: traceFlow 5.2s linear infinite; }

        @keyframes prismRotate    { from { transform: rotate(0deg);   } to { transform: rotate(360deg);  } }
        @keyframes prismRotateRev { from { transform: rotate(0deg);   } to { transform: rotate(-360deg); } }
        @keyframes faceShimmer    { 0%, 100% { opacity: 0.08; } 50% { opacity: 0.22; } }
        .prism-outer { transform-box: fill-box; transform-origin: center; animation: prismRotate    18s linear infinite; }
        .prism-mid   { transform-box: fill-box; transform-origin: center; animation: prismRotateRev 11s linear infinite; }
        .prism-inner { transform-box: fill-box; transform-origin: center; animation: prismRotate     7s linear infinite; }
        .prism-face   { animation: faceShimmer 3.5s ease-in-out infinite; }
        .prism-face.b { animation-delay: 1.16s; }
        .prism-face.c { animation-delay: 2.33s; }

        @keyframes orbitPulse { 0%, 100% { opacity: 0.6; transform: scale(1); } 50% { opacity: 1; transform: scale(1.05); } }
        .prism-core { animation: orbitPulse 4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        .o-core     { animation: orbitPulse 4.8s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation: none !important; transition: none !important; }
        }
      `}</style>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

      <div className="relative" style={{ zIndex: 1 }}>

        {/* ── NAV ── */}
        <motion.nav
          className="flex items-center justify-between px-8 sticky top-0"
          style={{
            height: 48,
            borderBottom: "1px solid #161618",
            background: scrolled ? "rgba(10,10,11,0.94)" : "#0A0A0B",
            backdropFilter: scrolled ? "blur(14px)" : "none",
            zIndex: 100,
            boxShadow: scrolled ? "0 1px 0 rgba(232,0,29,0.05)" : "none",
            transition: "background 0.3s, box-shadow 0.3s",
          }}
        >
          <div className="flex gap-7 flex-1">
            <NavLink label="Standings" scrollRef={standingsRef} activeNav={activeNav} onNav={scrollTo} />
            <NavLink label="Calendar"  scrollRef={calendarRef}  activeNav={activeNav} onNav={scrollTo} />
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <motion.span
              className="text-base font-normal leading-none"
              style={{ fontFamily: "'Instrument Serif', serif", color: "#E0E0DA", letterSpacing: "-0.01em" }}
              custom={120} variants={heroVariants} initial="hidden" animate={animationsReady ? "visible" : "hidden"}
            >
              Lumen
            </motion.span>
            <motion.span
              className="font-mono text-[7px] uppercase tracking-widest"
              style={{ color: "#2e2e2e" }}
              custom={180} variants={heroVariants} initial="hidden" animate={animationsReady ? "visible" : "hidden"}
            >
              Formula One Analytics
            </motion.span>
          </div>
          <div className="flex gap-7 items-center flex-1 justify-end">
            <NavLink label="Replay" scrollRef={replayRef} activeNav={activeNav} onNav={scrollTo} />
            <motion.button
              className="inline-flex items-center gap-1.5 font-sans font-medium text-[11px] px-4 py-1.5 whitespace-nowrap"
              style={{ background: "#E0E0DA", color: "#0A0A0B", border: "none", cursor: "pointer" }}
              onClick={() => setAuthOpen(true)}
              whileHover={{ backgroundColor: "#fff", y: -1 }}
              transition={{ duration: 0.2 }}
            >
              Sign In -&gt;
            </motion.button>
          </div>
        </motion.nav>

        {/* ── TICKER ── */}
        <div className="ticker-strip relative overflow-hidden" style={{ borderBottom: "1px solid #161618", background: "#0A0A0B", height: 30 }}>
          <div className="absolute left-0 top-0 h-full w-16 pointer-events-none" style={{ background: "linear-gradient(90deg, #0A0A0B 40%, transparent)", zIndex: 2 }} />
          <div className="absolute right-0 top-0 h-full w-16 pointer-events-none" style={{ background: "linear-gradient(270deg, #0A0A0B 40%, transparent)", zIndex: 2 }} />
          <div className="ticker-inner flex items-center h-full whitespace-nowrap">
            {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <div key={i} className="inline-flex items-center h-full flex-shrink-0">
                <div className="inline-flex items-center h-full px-5">
                  {item.category === "RND" ? (
                    <>
                      <span className="font-mono text-[8px] tracking-widest mr-2" style={{ color: "#2a2a2a" }}>{item.label.toUpperCase()}</span>
                      <span className="font-mono text-[10px]" style={{ color: "#555" }}>{item.value}</span>
                    </>
                  ) : (
                    <>
                      <span className="font-mono text-[8px] tracking-widest mr-2.5" style={{ color: "#2a2a2a" }}>{item.category}</span>
                      <span className="font-mono text-[9px] tracking-wider mr-2.5" style={{ color: "#E8001D" }}>{item.pos}</span>
                      <span className="font-mono text-[10px] mr-2" style={{ color: "#666" }}>{item.label}</span>
                      <span className="font-mono text-[11px] tracking-tighter font-medium mr-1" style={{ color: "#C8C8C2" }}>{item.value}</span>
                      <span className="font-mono text-[8px] tracking-widest" style={{ color: "#2a2a2a" }}>{item.unit}</span>
                    </>
                  )}
                </div>
                <div className="w-px flex-shrink-0" style={{ height: 14, background: "#1a1a1a" }} />
              </div>
            ))}
          </div>
        </div>

        {/* ── HERO ── */}
        <section
          ref={heroRef}
          className="relative overflow-hidden grid gap-12 items-center px-8"
          style={{
            paddingTop: 80, paddingBottom: 72,
            borderBottom: "1px solid #161618",
            background: "radial-gradient(ellipse at 0% 50%, rgba(232,0,29,0.07) 0%, transparent 55%), #0A0A0B",
            gridTemplateColumns: "1fr auto",
          }}
        >
          <div className="hero-glow absolute top-0 left-0 pointer-events-none" style={{ left: "-8%", width: "55%", height: "100%", background: "radial-gradient(ellipse at 20% 50%, rgba(232,0,29,1), transparent 58%)", zIndex: 0 }} />
          <div className="relative" style={{ zIndex: 1 }}>
            <motion.div className="flex gap-2 mb-7" custom={60} variants={heroVariants} initial="hidden" animate={animationsReady ? "visible" : "hidden"}>
              {["Replay", "Standings", "Calendar"].map((tag) => (
                <span key={tag} className="font-mono text-[10px] tracking-wider px-3 py-0.5 rounded-full" style={{ border: "1px solid #1e1e20", color: "#444" }}>{tag}</span>
              ))}
            </motion.div>
            <motion.h1
              className="font-normal leading-tight"
              style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(42px, 5.5vw, 74px)", letterSpacing: "-0.025em", color: "#E8E8E2", maxWidth: 560 }}
              custom={100} variants={heroVariants} initial="hidden" animate={animationsReady ? "visible" : "hidden"}
            >
              Every season.<br />Every circuit.<br /><em style={{ color: "#999" }}>Frame by frame.</em>
            </motion.h1>
            <motion.p
              className="text-sm mt-6"
              style={{ color: "#555", lineHeight: 1.8, maxWidth: 340 }}
              custom={180} variants={heroVariants} initial="hidden" animate={animationsReady ? "visible" : "hidden"}
            >
              Driver standings, race calendars, and animated telemetry replay — powered by FastF1.
            </motion.p>
            <motion.div className="flex gap-3 mt-8 items-center" custom={240} variants={heroVariants} initial="hidden" animate={animationsReady ? "visible" : "hidden"}>
              <motion.button
                className="inline-flex items-center gap-1.5 font-sans font-medium text-xs px-5 py-2.5 whitespace-nowrap"
                style={{ background: "#E0E0DA", color: "#0A0A0B", border: "none", cursor: "pointer" }}
                onClick={() => setAuthOpen(true)}
                whileHover={{ backgroundColor: "#fff", y: -1 }}
                transition={{ duration: 0.2 }}
              >
                Open Dashboard -&gt;
              </motion.button>
              <motion.button
                className="inline-flex items-center gap-1.5 text-[11px] font-sans px-4 py-2"
                style={{ background: "transparent", color: "#666", border: "1px solid #1e1e20", cursor: "pointer" }}
                onClick={() => scrollTo(replayRef, "Replay")}
                whileHover={{ borderColor: "#3a3a3d", color: "#C8C8C2" }}
                transition={{ duration: 0.2 }}
              >
                See how it works
              </motion.button>
            </motion.div>
          </div>

          {/* Hex Prism */}
          <motion.div className="soft-float relative flex-shrink-0" style={{ zIndex: 1 }} custom={320} variants={heroVariants} initial="hidden" animate={animationsReady ? "visible" : "hidden"}>
            <svg viewBox="0 0 160 160" width="260" height="260" style={{ overflow: "visible", display: "block" }}>
              <defs>
                <linearGradient id="pf1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#E8001D" stopOpacity="0.35"/><stop offset="100%" stopColor="#FF6B35" stopOpacity="0.06"/></linearGradient>
                <linearGradient id="pf2" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#E8001D" stopOpacity="0.18"/><stop offset="100%" stopColor="#E8001D" stopOpacity="0.04"/></linearGradient>
                <linearGradient id="pf3" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stopColor="#FF3B52" stopOpacity="0.22"/><stop offset="100%" stopColor="#E8001D" stopOpacity="0.04"/></linearGradient>
                <filter id="pglow"><feGaussianBlur stdDeviation="2.5" result="blur"/><feComposite in="SourceGraphic" in2="blur" operator="over"/></filter>
              </defs>
              <g className="prism-outer">
                <polygon points="80,12 124,36 124,84 80,108 36,84 36,36" fill="none" stroke="rgba(232,0,29,0.1)" strokeWidth="0.8"/>
                <line x1="80" y1="12" x2="80" y2="108" stroke="rgba(232,0,29,0.05)" strokeWidth="0.5"/>
                <line x1="36" y1="36" x2="124" y2="84" stroke="rgba(232,0,29,0.05)" strokeWidth="0.5"/>
                <line x1="124" y1="36" x2="36" y2="84" stroke="rgba(232,0,29,0.05)" strokeWidth="0.5"/>
              </g>
              <g className="prism-mid">
                <polygon points="80,28 108,44 108,76 80,92 52,76 52,44" fill="none" stroke="rgba(232,0,29,0.26)" strokeWidth="1.1"/>
                <polygon className="prism-face"   points="80,28 108,44 80,60" fill="url(#pf1)"/>
                <polygon className="prism-face b" points="108,44 108,76 80,60" fill="url(#pf2)"/>
                <polygon className="prism-face c" points="80,92 52,76 80,60" fill="url(#pf3)"/>
                <polygon points="80,28 52,44 80,60"  fill="rgba(232,0,29,0.04)"/>
                <polygon points="52,44 52,76 80,60"  fill="rgba(232,0,29,0.06)"/>
                <polygon points="108,76 80,92 80,60" fill="rgba(232,0,29,0.05)"/>
              </g>
              <g className="prism-inner">
                <polygon points="80,46 94,54 94,70 80,78 66,70 66,54" fill="none" stroke="rgba(232,0,29,0.44)" strokeWidth="1.2"/>
                <polygon points="80,46 94,54 94,70 80,78 66,70 66,54" fill="rgba(232,0,29,0.07)"/>
              </g>
              <line x1="80" y1="60" x2="124" y2="36" stroke="rgba(232,0,29,0.14)" strokeWidth="0.6">
                <animateTransform attributeName="transform" type="rotate" from="0 80 60" to="360 80 60" dur="9s" repeatCount="indefinite"/>
              </line>
              <line x1="80" y1="60" x2="128" y2="90" stroke="rgba(255,80,60,0.09)" strokeWidth="0.6">
                <animateTransform attributeName="transform" type="rotate" from="0 80 60" to="360 80 60" dur="9s" begin="-3s" repeatCount="indefinite"/>
              </line>
              <line x1="80" y1="60" x2="28" y2="96" stroke="rgba(232,0,29,0.07)" strokeWidth="0.6">
                <animateTransform attributeName="transform" type="rotate" from="0 80 60" to="360 80 60" dur="9s" begin="-6s" repeatCount="indefinite"/>
              </line>
              <circle r="3.2" fill="#E8001D" opacity="0.95" filter="url(#pglow)">
                <animateMotion dur="7s" repeatCount="indefinite" path="M80,28 L108,44 L108,76 L80,92 L52,76 L52,44 Z" rotate="auto"/>
              </circle>
              <circle r="1.8" fill="#FF6B35" opacity="0.55">
                <animateMotion dur="7s" repeatCount="indefinite" begin="-3.5s" path="M80,28 L108,44 L108,76 L80,92 L52,76 L52,44 Z" rotate="auto"/>
              </circle>
              <circle className="prism-core" cx="80" cy="60" r="4.5" fill="#E8001D" opacity="0.9"/>
              <circle cx="80" cy="60" r="10" fill="none" stroke="#E8001D" strokeWidth="0.7" opacity="0.2"/>
            </svg>
          </motion.div>
        </section>

        {/* ── STANDINGS TEASER ── */}
        <div ref={standingsRef} style={{ scrollMarginTop: 48 }} />
        <section
          ref={standingsTeaserRef}
          className="px-8 py-16"
          style={{ borderBottom: "1px solid #161618", background: "radial-gradient(ellipse at 100% 0%, rgba(232,0,29,0.05) 0%, transparent 50%), #0A0A0B" }}
        >
          <Reveal inView={standingsInView} delay={0} className="flex items-end justify-between mb-8">
            <div>
              <div className="font-mono text-[9px] tracking-widest mb-2.5" style={{ color: "#E8001D" }}>
                {standingsView === "driver" ? "DRIVER" : "CONSTRUCTOR"} STANDINGS · 2024
              </div>
              <h2 className="font-normal leading-tight" style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(24px, 3vw, 36px)", color: "#E0E0DA" }}>
                Championship<br />at a glance
              </h2>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="flex p-0.5 gap-0.5" style={{ background: "#0D0D0F", border: "1px solid #1a1a1c" }}>
                {[["driver", "Drivers"], ["constructor", "Constructors"]].map(([v, label]) => (
                  <motion.button
                    key={v}
                    onClick={() => setStandingsView(v)}
                    className="font-mono text-[9px] tracking-widest px-3 py-1.5 transition-colors duration-150"
                    style={{
                      background: standingsView === v ? "#1a1a1c" : "transparent",
                      border: "none", cursor: "pointer",
                      color: standingsView === v ? "#E0E0DA" : "#333",
                    }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {label.toUpperCase()}
                  </motion.button>
                ))}
              </div>
              <motion.button
                className="inline-flex items-center gap-1.5 font-sans text-[11px] px-4 py-2"
                style={{ background: "transparent", color: "#666", border: "1px solid #1e1e20", cursor: "pointer" }}
                whileHover={{ borderColor: "#3a3a3d", color: "#C8C8C2" }}
                transition={{ duration: 0.2 }}
              >
                Full standings -&gt;
              </motion.button>
            </div>
          </Reveal>

          <AnimatePresence mode="wait">
            <motion.div
              key={standingsView}
              className="grid gap-0.5"
              style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {standingsView === "driver"
                ? TEASER_DRIVERS.map((d, i) => <DriverCard key={d.pos} driver={d} index={i} active={standingsInView} />)
                : TEASER_CONSTRUCTORS.map((c, i) => <ConstructorCard key={c.pos} constructor={c} index={i} active={standingsInView} />)
              }
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-8 mt-4 pt-3.5" style={{ borderTop: "1px solid #111113" }}>
            {[["Rounds complete", "21 / 22"], ["Season", "2024"], ["Next race", "Abu Dhabi · R22"]].map(([k, v], i) => (
              <Reveal key={k} inView={standingsInView} delay={400 + i * 70}>
                <div className="font-mono text-[9px] tracking-widest mb-0.5" style={{ color: "#2e2e2e" }}>{k}</div>
                <div className="font-mono text-[11px]" style={{ color: "#555" }}>{v}</div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── CALENDAR TEASER ── */}
        <div ref={calendarRef} style={{ scrollMarginTop: 48 }} />
        <section
          ref={calendarTeaserRef}
          className="px-8 py-16 grid gap-16 items-center"
          style={{
            borderBottom: "1px solid #161618",
            background: "radial-gradient(ellipse at 50% 100%, rgba(232,0,29,0.05) 0%, transparent 55%), #0A0A0B",
            gridTemplateColumns: "1fr 1fr",
          }}
        >
          <Reveal inView={calendarInView} delay={0}>
            <div className="font-mono text-[9px] tracking-widest mb-2.5" style={{ color: "#E8001D" }}>RACE CALENDAR · 22 ROUNDS</div>
            <h2 className="font-normal leading-tight mb-4" style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(24px, 3vw, 36px)", color: "#E0E0DA" }}>
              Season schedule,<br />every session
            </h2>
            <p className="text-xs mb-7" style={{ color: "#555", lineHeight: 1.8, maxWidth: 280 }}>
              Browse every round — practice, qualifying, and race — filtered by season and circuit.
            </p>
            <motion.button
              className="inline-flex items-center gap-1.5 font-sans text-[11px] px-4 py-2"
              style={{ background: "transparent", color: "#666", border: "1px solid #1e1e20", cursor: "pointer" }}
              whileHover={{ borderColor: "#3a3a3d", color: "#C8C8C2" }}
              transition={{ duration: 0.2 }}
            >
              View full calendar -&gt;
            </motion.button>
          </Reveal>

          <div className="flex flex-col gap-0.5">
            {TEASER_RACES.map((race, i) => (
              <Reveal key={race.round} inView={calendarInView} delay={i * 90 + 100} direction="right">
                <motion.div
                  className="flex items-center justify-between px-4 py-3.5 relative overflow-hidden cursor-pointer"
                  style={{
                    background: race.status === "next" ? "#111113" : "#0D0D0F",
                    border: "1px solid",
                    borderColor: race.status === "next" ? "#222226" : "#141416",
                  }}
                  whileHover={{ backgroundColor: "#141416", borderColor: "#2a2a2d" }}
                  transition={{ duration: 0.2 }}
                >
                  {race.status === "next" && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{ background: "#E8001D" }} />
                  )}
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-[9px] tracking-widest" style={{ color: "#2e2e2e", minWidth: 28 }}>{race.round}</span>
                    <div>
                      <div className="font-sans text-xs font-medium" style={{ color: race.status === "next" ? "#E0E0DA" : "#777" }}>{race.name}</div>
                      <div className="font-mono text-[9px] mt-0.5" style={{ color: "#2e2e2e" }}>{race.circuit}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[9px] tracking-wider" style={{ color: race.status === "next" ? "#E8001D" : "#333" }}>{race.date}</div>
                    {race.winner && <div className="font-mono text-[8px] mt-0.5" style={{ color: "#2e2e2e" }}>WIN {race.winner}</div>}
                    {race.status === "next" && <div className="font-mono text-[8px] mt-0.5 tracking-widest" style={{ color: "#E8001D" }}>NEXT</div>}
                  </div>
                </motion.div>
              </Reveal>
            ))}
            <Reveal inView={calendarInView} delay={400}>
              <motion.button
                className="mt-2 w-full flex justify-center items-center gap-1.5 font-sans text-[11px] px-4 py-2"
                style={{ background: "transparent", color: "#666", border: "1px solid #1e1e20", cursor: "pointer" }}
                whileHover={{ borderColor: "#3a3a3d", color: "#C8C8C2" }}
                transition={{ duration: 0.2 }}
              >
                All 22 rounds -&gt;
              </motion.button>
            </Reveal>
          </div>
        </section>

        {/* ── REPLAY TEASER ── */}
        <div ref={replayRef} style={{ scrollMarginTop: 48 }} />
        <section
          ref={replayTeaserRef}
          className="px-8 py-16 grid items-center gap-14"
          style={{
            borderBottom: "1px solid #161618",
            background: "radial-gradient(ellipse at 0% 100%, rgba(232,0,29,0.06) 0%, transparent 50%), #0A0A0B",
            gridTemplateColumns: "auto 1fr",
          }}
        >
          <Reveal inView={replayInView} delay={0} direction="left" className="flex-shrink-0" style={{ width: 280 }}>
            <div className="relative overflow-hidden" style={{ background: "#0D0D0F", border: "1px solid #1a1a1c" }}>
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(232,0,29,0.4), transparent)" }} />
              <div className="p-4">
                <svg viewBox="0 0 248 100" style={{ width: "100%", display: "block" }}>
                  <defs>
                    <linearGradient id="rt-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#E8001D" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="#E8001D" stopOpacity="0" />
                    </linearGradient>
                    <clipPath id="rt-played">
                      <rect x="0" y="0" width={`${playhead * 2.48}`} height="100" />
                    </clipPath>
                  </defs>
                  {[25, 50, 75].map((y) => <line key={y} x1="0" y1={y} x2="248" y2={y} stroke="#111113" strokeWidth="0.5" />)}
                  <polyline points="0,72 31,55 62,64 93,24 124,44 155,16 186,36 217,20 248,30" fill="none" stroke="#1e1e1e" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="0,80 31,64 62,74 93,38 124,56 155,30 186,52 217,40 248,48" fill="none" stroke="#161616" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                  <path d={`M${REPLAY_PTS.map(([x, y]) => `${x},${y}`).join(" L")} L248,100 L0,100 Z`} fill="url(#rt-fill)" clipPath="url(#rt-played)" />
                  <polyline points={REPLAY_PTS.map(([x, y]) => `${x},${y}`).join(" ")} fill="none" stroke="#1e0808" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points={REPLAY_PTS.map(([x, y]) => `${x},${y}`).join(" ")} fill="none" stroke="#E8001D" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" clipPath="url(#rt-played)" />
                  <line x1={dot.x} y1="0" x2={dot.x} y2="100" stroke="#E8001D" strokeWidth="0.8" opacity="0.4" />
                  <circle cx={dot.x} cy={dot.y} r="5" fill="rgba(232,0,29,0.18)" />
                  <circle cx={dot.x} cy={dot.y} r="2.8" fill="#E8001D" />
                </svg>
              </div>
            </div>
          </Reveal>

          <Reveal inView={replayInView} delay={120}>
            <div className="font-mono text-[9px] tracking-widest mb-2.5" style={{ color: "#E8001D" }}>SESSION REPLAY</div>
            <h2 className="font-normal leading-tight mb-4" style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(24px, 3vw, 36px)", color: "#E0E0DA" }}>
              Replay any session<br /><em>frame by frame</em>
            </h2>
            <p className="text-xs mb-7" style={{ color: "#555", lineHeight: 1.8, maxWidth: 340 }}>
              Load any race weekend and scrub through recorded telemetry — speed, throttle, brake, and DRS across every lap, every circuit, every season.
            </p>
            <div className="flex gap-1.5 mb-7 flex-wrap">
              {["Speed", "Throttle", "Brake", "DRS", "Position"].map((tag, i) => (
                <Reveal key={tag} inView={replayInView} delay={200 + i * 55}>
                  <span className="font-mono text-[10px] tracking-wider px-3 py-0.5 rounded-full" style={{ border: "1px solid #1e1e20", color: "#444" }}>{tag}</span>
                </Reveal>
              ))}
            </div>
            <motion.button
              className="inline-flex items-center gap-1.5 font-sans font-medium text-xs px-5 py-2.5 whitespace-nowrap"
              style={{ background: "#E0E0DA", color: "#0A0A0B", border: "none", cursor: "pointer" }}
              onClick={() => setAuthOpen(true)}
              whileHover={{ backgroundColor: "#fff", y: -1 }}
              transition={{ duration: 0.2 }}
            >
              Try Replay -&gt;
            </motion.button>
          </Reveal>
        </section>

        {/* ── CTA ── */}
        <section
          ref={ctaRef}
          className="px-8 grid items-center gap-10"
          style={{
            paddingTop: 96,
            paddingBottom: 96,
            background: "radial-gradient(ellipse at 50% 50%, rgba(232,0,29,0.06) 0%, transparent 60%), #0A0A0B",
            borderBottom: "1px solid #161618",
            gridTemplateColumns: "1fr auto 1fr",
          }}
        >
          <Reveal inView={ctaInView} delay={0}>
            <h2 className="font-normal leading-none" style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(28px, 4vw, 52px)", color: "#E0E0DA", letterSpacing: "-0.025em" }}>
              One session —<br />infinite insights.<br /><em>/ Open it now.</em>
            </h2>
          </Reveal>

          <Reveal inView={ctaInView} delay={120}>
            <div className="flex flex-col items-center">
              <div className="w-px h-12 mb-4" style={{ background: "#161618" }} />
              <motion.button
                className="inline-flex items-center gap-1.5 font-sans font-medium text-[13px] px-7 py-3 whitespace-nowrap"
                style={{ background: "#E8001D", color: "#fff", border: "none", cursor: "pointer" }}
                onClick={() => setAuthOpen(true)}
                whileHover={{ backgroundColor: "#c4001a", y: -1 }}
                transition={{ duration: 0.2 }}
              >
                Open Dashboard -&gt;
              </motion.button>
              <div className="w-px h-12 mt-4" style={{ background: "#161618" }} />
            </div>
          </Reveal>

          <Reveal inView={ctaInView} delay={200} className="flex justify-end">
            <svg className="cta-orbit" viewBox="0 0 160 160" width="160" height="160">
              <defs>
                <path id="orbit-a" d="M108,80 A28,9 0 1,1 52,80 A28,9 0 1,1 108,80" />
                <path id="orbit-b" d="M122,80 A42,11 0 1,1 38,80 A42,11 0 1,1 122,80" />
                <path id="orbit-c" d="M136,80 A56,13 0 1,1 24,80 A56,13 0 1,1 136,80" />
              </defs>
              {/* Background */}
              <circle cx="80" cy="80" r="64" fill="#0D0D0F" stroke="#1a1a1a" strokeWidth="1" />
              {/* ORBIT A */}
              <g>
                <animateTransform attributeName="transform" type="rotate" from="0 80 80" to="360 80 80" dur="18s" repeatCount="indefinite" />
                <use href="#orbit-a" fill="none" stroke="rgba(232,0,29,0.24)" strokeWidth="1.1" />
                <circle r="3.2" fill="#E8001D">
                  <animateMotion dur="9.5s" repeatCount="indefinite" rotate="auto">
                    <mpath href="#orbit-a" />
                  </animateMotion>
                </circle>
              </g>
              {/* ORBIT B */}
              <g>
                <animateTransform attributeName="transform" type="rotate" from="360 80 80" to="0 80 80" dur="24s" repeatCount="indefinite" />
                <use href="#orbit-b" fill="none" stroke="rgba(232,0,29,0.16)" strokeWidth="1" />
                <circle r="2" fill="#fff" opacity="0.5">
                  <animateMotion dur="13.8s" repeatCount="indefinite" rotate="auto">
                    <mpath href="#orbit-b" />
                  </animateMotion>
                </circle>
              </g>
              {/* ORBIT C */}
              <g>
                <animateTransform attributeName="transform" type="rotate" from="0 80 80" to="360 80 80" dur="30s" repeatCount="indefinite" />
                <use href="#orbit-c" fill="none" stroke="rgba(232,0,29,0.1)" strokeWidth="0.9" />
                <circle r="1.6" fill="#E8001D" opacity="0.5">
                  <animateMotion dur="20s" repeatCount="indefinite" rotate="auto">
                    <mpath href="#orbit-c" />
                  </animateMotion>
                </circle>
              </g>
              {/* Core */}
              <circle cx="80" cy="80" r="5" fill="#E8001D" />
              <circle cx="80" cy="80" r="10" fill="none" stroke="#E8001D" strokeWidth="0.8" opacity="0.25" />
            </svg>
          </Reveal>
        </section>  

        {/* ── FOOTER ── */}
        <footer
          ref={footerRef}
          className="px-8 py-7 flex justify-between items-center"
          style={{ background: "#0A0A0B", borderTop: "1px solid #111113" }}
        >
          <Reveal inView={footerInView} delay={0}>
            <div className="font-mono text-xs mb-0.5" style={{ color: "#2a2a2a" }}>A Race Intelligence Tool by Lumen</div>
            <div className="font-mono text-[11px]" style={{ color: "#1e1e1e" }}>Lumen — All rights reserved.</div>
          </Reveal>
          <Reveal inView={footerInView} delay={100}>
            <div className="flex gap-7">
              {[["Standings", standingsRef], ["Calendar", calendarRef], ["Replay", replayRef]].map(([label, ref]) => (
                <NavLink key={label} label={label} scrollRef={ref} activeNav={activeNav} onNav={scrollTo} />
              ))}
            </div>
          </Reveal>
        </footer>

        {/* ── WORDMARK ── */}
        <div className="text-center overflow-hidden pb-4" style={{ background: "#0A0A0B" }}>
          <Reveal inView={footerInView} delay={200}>
            <div
              className="font-normal select-none leading-none"
              style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(48px, 16vw, 160px)", color: "#0D0D0E", letterSpacing: "-0.03em" }}
            >
              Lumen
            </div>
          </Reveal>
        </div>

      </div>
    </div>
  );
}