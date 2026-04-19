import React, { useEffect, useState, useRef, useCallback, useReducer } from "react";

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
  { pos: "P2", name: "Lando Norris", team: "McLaren", pts: 287, spark: [18, 21, 26, 24, 32, 36, 42, 47], gap: "−44" },
  { pos: "P3", name: "Oscar Piastri", team: "McLaren", pts: 271, spark: [20, 22, 25, 29, 33, 35, 39, 43], gap: "−60" },
];

const TEASER_CONSTRUCTORS = [
  { pos: "P1", name: "McLaren",       base: "Woking, UK",      pts: 568, spark: [22, 28, 35, 40, 52, 61, 74, 88], gap: null },
  { pos: "P2", name: "Red Bull",      base: "Milton Keynes",   pts: 532, spark: [40, 48, 55, 60, 58, 62, 66, 70], gap: "−36" },
  { pos: "P3", name: "Mercedes",      base: "Brackley, UK",    pts: 418, spark: [30, 35, 38, 42, 44, 50, 55, 60], gap: "−150" },
];

const TEASER_RACES = [
  { round: "R20", name: "Mexico City GP", circuit: "Hermanos Rodríguez", date: "27 Oct", status: "done", winner: "VER" },
  { round: "R21", name: "São Paulo GP", circuit: "Interlagos", date: "03 Nov", status: "done", winner: "VER" },
  { round: "R22", name: "Abu Dhabi GP", circuit: "Yas Marina", date: "08 Dec", status: "next", winner: null },
];

// ── Replay polyline points — single source of truth for both the drawn line and the dot ──
const REPLAY_PTS = [
  [0, 78], [31, 60], [62, 70], [93, 28], [124, 50], [155, 18], [186, 42], [217, 24], [248, 36],
];

// Given a 0–100 playhead progress, return {x, y} interpolated along REPLAY_PTS
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

// ── useInView: fires once, stays true — reversing is jarring UX for this style ──
function useInView(threshold = 0.15) {
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

// ── SparkLine: FIX — animateMotion path must be a closed-form absolute path
//    matching the drawn polyline exactly. We pass the path string and ensure
//    the animateMotion path starts at the FIRST data point, not (0,0).
function SparkLine({ data, id, animated }) {
  const W = 217, H = 40;
  const min = Math.min(...data), max = Math.max(...data);
  const range = Math.max(1, max - min);

  // Build points array for reuse
  const pts = data.map((y, x) => {
    const ny = (y - min) / range;
    return { x: x * (W / (data.length - 1)), y: H - ny * (H - 4) - 2 };
  });

  // SVG path string (absolute M + L commands)
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  // Area fill path
  const areaPath = `${linePath} L ${W},${H} L 0,${H} Z`;
  // animateMotion path — must be same absolute coords as linePath
  const motionPath = linePath;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: "100%", height: "40px", display: "block", overflow: "visible" }}>
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
          {/* Outer glow dot */}
          <circle r="5" fill="rgba(232,0,29,0.12)">
            <animateMotion
              dur={`${4.5 + id * 0.5}s`}
              repeatCount="indefinite"
              calcMode="linear"
              path={motionPath}
            />
          </circle>
          {/* Inner solid dot */}
          <circle r="2.4" fill="#E8001D">
            <animateMotion
              dur={`${4.5 + id * 0.5}s`}
              repeatCount="indefinite"
              calcMode="linear"
              path={motionPath}
            />
          </circle>
        </>
      )}
    </svg>
  );
}

function DriverCard({ driver, index, active }) {
  const pts = useCountUp(driver.pts, active, 1000, index * 100);
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "#141416" : "#0F0F11",
        border: `1px solid ${hov ? "#2a2a2d" : "#1a1a1c"}`,
        padding: "20px",
        opacity: active ? 1 : 0,
        transform: active ? "translateY(0)" : "translateY(14px)",
        transition: `opacity 0.55s cubic-bezier(0.22,1,0.36,1) ${index * 90}ms, transform 0.55s cubic-bezier(0.22,1,0.36,1) ${index * 90}ms, background 0.2s, border-color 0.2s`,
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "7px" }}>
            <span style={{ fontSize: "10px", color: "#E8001D", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em" }}>{driver.pos}</span>
            <span style={{ width: "1px", height: "10px", background: "#222" }} />
            <span style={{ fontSize: "9px", color: "#444", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em" }}>{driver.team}</span>
          </div>
          <div style={{ fontSize: "14px", color: "#C8C8C2", fontFamily: "'Instrument Serif', serif", fontWeight: 400 }}>{driver.name}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "30px", color: "#E8E8E2", fontFamily: "'DM Mono', monospace", letterSpacing: "-0.04em", lineHeight: 1 }}>{pts}</div>
          <div style={{ fontSize: "8px", color: "#333", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", marginTop: "2px" }}>PTS</div>
        </div>
      </div>
      <SparkLine data={driver.spark} id={index} animated={active} />
      {driver.gap && (
        <div style={{ marginTop: "8px", fontSize: "9px", color: "#444", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em" }}>
          {driver.gap} to leader
        </div>
      )}
    </div>
  );
}

function ConstructorCard({ constructor: c, index, active }) {
  const pts = useCountUp(c.pts, active, 1000, index * 100);
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "#141416" : "#0F0F11",
        border: `1px solid ${hov ? "#2a2a2d" : "#1a1a1c"}`,
        padding: "20px",
        opacity: active ? 1 : 0,
        transform: active ? "translateY(0)" : "translateY(14px)",
        transition: `opacity 0.55s cubic-bezier(0.22,1,0.36,1) ${index * 90}ms, transform 0.55s cubic-bezier(0.22,1,0.36,1) ${index * 90}ms, background 0.2s, border-color 0.2s`,
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "7px" }}>
            <span style={{ fontSize: "10px", color: "#E8001D", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em" }}>{c.pos}</span>
            <span style={{ width: "1px", height: "10px", background: "#222" }} />
            <span style={{ fontSize: "9px", color: "#444", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em" }}>{c.base}</span>
          </div>
          <div style={{ fontSize: "14px", color: "#C8C8C2", fontFamily: "'Instrument Serif', serif", fontWeight: 400 }}>{c.name}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "30px", color: "#E8E8E2", fontFamily: "'DM Mono', monospace", letterSpacing: "-0.04em", lineHeight: 1 }}>{pts}</div>
          <div style={{ fontSize: "8px", color: "#333", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", marginTop: "2px" }}>PTS</div>
        </div>
      </div>
      <SparkLine data={c.spark} id={index + 10} animated={active} />
      {c.gap && (
        <div style={{ marginTop: "8px", fontSize: "9px", color: "#444", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em" }}>
          {c.gap} to leader
        </div>
      )}
    </div>
  );
}

// ── Scroll-reveal wrapper — one-directional (no reverse) for clean UX ──
function Reveal({ children, delay = 0, inView, direction = "up", style = {} }) {
  const hidden =
    direction === "left"  ? "translateX(-20px)" :
    direction === "right" ? "translateX(20px)"  :
                            "translateY(18px)";
  return (
    <div style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translate(0,0)" : hidden,
      transition: `opacity 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.65s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── Auth Modal ──
const AUTH_INITIAL = { tab: "login", form: { email: "", password: "", name: "" }, loading: false, done: false };

function authReducer(state, action) {
  switch (action.type) {
    case "RESET":       return AUTH_INITIAL;
    case "SET_TAB":     return { ...AUTH_INITIAL, tab: action.tab }; // switching tab resets everything else atomically
    case "SET_FIELD":   return { ...state, form: { ...state.form, [action.field]: action.value } };
    case "SUBMIT":      return { ...state, loading: true };
    case "DONE":        return { ...state, loading: false, done: true };
    default:            return state;
  }
}

function AuthModal({ open, onClose }) {
  const [state, dispatch] = useReducer(authReducer, AUTH_INITIAL);
  const { tab, form, loading, done } = state;
  const overlayRef = useRef(null);

  // Reset every time the modal opens — single dispatch, no cascading setState
  useEffect(() => {
    if (open) dispatch({ type: "RESET" });
  }, [open]);

  // Close on overlay click
  const handleOverlay = useCallback((e) => {
    if (e.target === overlayRef.current) onClose();
  }, [onClose]);

  // Close on Escape
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

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlay}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "fadeIn 0.2s ease both",
      }}
    >
      <div style={{
        background: "#0D0D0F",
        border: "1px solid #1e1e22",
        width: "100%", maxWidth: "380px",
        position: "relative",
        animation: "slideUp 0.28s cubic-bezier(0.22,1,0.36,1) both",
      }}>
        {/* Top accent line */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(232,0,29,0.6), transparent)" }} />

        {/* Header */}
        <div style={{ padding: "28px 28px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: "20px", color: "#E0E0DA", fontWeight: 400, marginBottom: "4px" }}>
              {tab === "login" ? "Welcome back" : "Create account"}
            </div>
            <div style={{ fontSize: "10px", color: "#333", fontFamily: "'DM Mono', monospace", letterSpacing: "0.12em" }}>
              LUMEN · FORMULA ONE ANALYTICS
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#333", padding: "4px", transition: "color 0.15s", lineHeight: 1 }}
            onMouseEnter={e => e.currentTarget.style.color = "#888"}
            onMouseLeave={e => e.currentTarget.style.color = "#333"}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <line x1="1" y1="1" x2="13" y2="13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <line x1="13" y1="1" x2="1" y2="13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", margin: "24px 28px 0", borderBottom: "1px solid #161618" }}>
          {[["login", "Sign In"], ["signup", "Sign Up"]].map(([t, label]) => (
            <button
              key={t}
              onClick={() => dispatch({ type: "SET_TAB", tab: t })}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "'DM Mono', monospace", fontSize: "10px", letterSpacing: "0.1em",
                color: tab === t ? "#E0E0DA" : "#2e2e2e",
                padding: "0 0 10px", marginRight: "24px",
                borderBottom: `1px solid ${tab === t ? "#E8001D" : "transparent"}`,
                marginBottom: "-1px",
                transition: "color 0.15s, border-color 0.15s",
              }}
            >
              {label.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Form */}
        <div style={{ padding: "24px 28px 28px" }}>
          {done ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: "28px", marginBottom: "12px" }}>⚑</div>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: "18px", color: "#E0E0DA", marginBottom: "8px" }}>
                {tab === "login" ? "You're in." : "Account created."}
              </div>
              <div style={{ fontSize: "10px", color: "#444", fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em" }}>
                REDIRECTING TO DASHBOARD
              </div>
            </div>
          ) : (
            <>
              {tab === "signup" && (
                <AuthField
                  label="FULL NAME"
                  type="text"
                  placeholder="Lewis Hamilton"
                  value={form.name}
                  onChange={v => dispatch({ type: "SET_FIELD", field: "name", value: v })}
                />
              )}
              <AuthField
                label="EMAIL"
                type="email"
                placeholder="driver@team.f1"
                value={form.email}
                onChange={v => dispatch({ type: "SET_FIELD", field: "email", value: v })}              />
              <AuthField
                label="PASSWORD"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={v => dispatch({ type: "SET_FIELD", field: "password", value: v })}                last
              />

              {tab === "login" && (
                <div style={{ textAlign: "right", marginBottom: "20px" }}>
                  <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: "9px", color: "#333", fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em", transition: "color 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.color = "#666"}
                    onMouseLeave={e => e.currentTarget.style.color = "#333"}
                  >FORGOT PASSWORD</button>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  width: "100%", border: "none", cursor: loading ? "default" : "pointer",
                  background: loading ? "#5a000f" : "#E8001D",
                  color: "#fff",
                  padding: "12px 20px",
                  fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "0.1em",
                  transition: "background 0.2s, transform 0.15s",
                  transform: "translateY(0)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#c4001a"; }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#E8001D"; }}
              >
                {loading ? (
                  <><LoadingDots /> {tab === "login" ? "SIGNING IN" : "CREATING ACCOUNT"}</>
                ) : (
                  tab === "login" ? "SIGN IN ->" : "CREATE ACCOUNT ->"
                )}
              </button>

              <div style={{ marginTop: "20px", textAlign: "center", fontSize: "9px", color: "#1e1e1e", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em" }}>
                {tab === "login" ? "DON'T HAVE AN ACCOUNT? " : "ALREADY HAVE AN ACCOUNT? "}
                <button
                  onClick={() => dispatch({ type: "SET_TAB", tab: tab === "login" ? "signup" : "login" })}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: "9px", color: "#444", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", textDecoration: "underline", textUnderlineOffset: "2px" }}
                >
                  {tab === "login" ? "SIGN UP" : "SIGN IN"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AuthField({ label, type, placeholder, value, onChange, last = false }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: last ? "20px" : "14px" }}>
      <div style={{ fontSize: "8px", color: focused ? "#E8001D" : "#2e2e2e", fontFamily: "'DM Mono', monospace", letterSpacing: "0.14em", marginBottom: "6px", transition: "color 0.15s" }}>
        {label}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%", background: "#0A0A0B",
          border: `1px solid ${focused ? "#2a2a2e" : "#161618"}`,
          color: "#C8C8C2", padding: "10px 12px",
          fontFamily: "'DM Mono', monospace", fontSize: "12px",
          outline: "none", transition: "border-color 0.15s",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

function LoadingDots() {
  return (
    <span style={{ display: "inline-flex", gap: "3px", alignItems: "center" }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{ width: "3px", height: "3px", background: "#fff", borderRadius: "50%", animation: `dotBounce 0.9s ease-in-out ${i * 0.15}s infinite` }} />
      ))}
    </span>
  );
}

export default function Landing() {
  const [animationsReady, setAnimationsReady] = useState(false);
  const [scrolled, setScrolled]               = useState(false);
  const [activeNav, setActiveNav]             = useState(null);
  const [playhead, setPlayhead]               = useState(0);
  const [authOpen, setAuthOpen]               = useState(false);
  const [standingsView, setStandingsView]     = useState("driver"); // "driver" | "constructor"

  const standingsRef = useRef(null);
  const calendarRef  = useRef(null);
  const replayRef    = useRef(null);

  // heroInView removed — hero uses time-based motionStyle(), not scroll-based
  const [heroRef]                              = useInView(0.05);
  const [standingsTeaserRef, standingsInView]  = useInView(0.1);
  const [calendarTeaserRef,  calendarInView]   = useInView(0.1);
  const [replayTeaserRef,    replayInView]     = useInView(0.08);
  const [ctaRef,             ctaInView]        = useInView(0.15);
  const [footerRef,          footerInView]     = useInView(0.1);

  // Boot hero animations after first paint
  useEffect(() => {
    const t = setTimeout(() => setAnimationsReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Playhead rAF — drives SVG clipPath width in sync with the 6s CSS sweep
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

  // Lock body scroll when auth open
  useEffect(() => {
    document.body.style.overflow = authOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [authOpen]);

  const scrollTo = (ref, label) => {
    setActiveNav(label);
    ref?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const motionStyle = (delay = 0) =>
    animationsReady
      ? { animation: `revealUp 780ms cubic-bezier(0.22,1,0.36,1) ${delay}ms both` }
      : { opacity: 0, transform: "translateY(16px)" };

  const navLink = (label, ref) => (
    <button key={label} className="nav-link" onClick={() => scrollTo(ref, label)} style={{ position: "relative", paddingBottom: "2px" }}>
      <span style={{ color: activeNav === label ? "#E8001D" : undefined, transition: "color 0.15s" }}>{"-> "}{label}</span>
      <span style={{ position: "absolute", bottom: "-1px", left: 0, height: "1px", background: "#E8001D", width: activeNav === label ? "100%" : "0%", transition: "width 0.28s cubic-bezier(0.22,1,0.36,1)" }} />
    </button>
  );

  return (
    <div data-motion-ready={animationsReady ? "true" : "false"}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500&family=DM+Mono:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #0A0A0B; color: #888; font-family: 'Geist', sans-serif; -webkit-font-smoothing: antialiased; }

        .nav-link { background: none; border: none; cursor: pointer; font-family: 'Geist', sans-serif; font-size: 12px; color: #555; letter-spacing: 0.01em; padding: 0; transition: color 0.15s; }
        .nav-link:hover { color: #C8C8C2; }
        .cta-btn { display: inline-flex; align-items: center; gap: 6px; background: #E0E0DA; color: #0A0A0B; border: none; padding: 10px 20px; font-family: 'Geist', sans-serif; font-size: 12px; font-weight: 500; cursor: pointer; transition: background 0.2s, transform 0.15s; white-space: nowrap; }
        .cta-btn:hover { background: #fff; transform: translateY(-1px); }
        .cta-btn-red { display: inline-flex; align-items: center; gap: 6px; background: #E8001D; color: #fff; border: none; padding: 12px 28px; font-family: 'Geist', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; transition: background 0.2s, transform 0.15s; }
        .cta-btn-red:hover { background: #c4001a; transform: translateY(-1px); }
        .ghost-btn { display: inline-flex; align-items: center; gap: 6px; background: transparent; color: #666; border: 1px solid #1e1e20; padding: 8px 18px; font-family: 'Geist', sans-serif; font-size: 11px; cursor: pointer; transition: border-color 0.2s, color 0.2s; }
        .ghost-btn:hover { border-color: #3a3a3d; color: #C8C8C2; }
        .pill { display: inline-block; border: 1px solid #1e1e20; border-radius: 999px; padding: 3px 12px; font-size: 10px; color: #444; font-family: 'DM Mono', monospace; letter-spacing: 0.06em; }

        /* ── Ticker ── */
        @keyframes tickerScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-33.333%); } }
        .ticker-inner { animation: tickerScroll 32s linear infinite; }
        .ticker-strip:hover .ticker-inner { animation-play-state: paused; }

        /* ── Hero mount reveal ── */
        @keyframes revealUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

        /* ── Prism float ── */
        @keyframes softFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
        [data-motion-ready="true"] .soft-float { animation: softFloat 7s ease-in-out infinite; }

        /* ── Hero ambient glow ── */
        @keyframes heroGlowPulse { 0%, 100% { opacity: 0.07; } 50% { opacity: 0.14; } }
        .hero-glow { animation: heroGlowPulse 5s ease-in-out infinite; }

        /* ── Replay trace lines ── */
        @keyframes traceFlow { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -30; } }
        .replay-line   { stroke-dasharray: 20 10; animation: traceFlow 2.4s linear infinite; }
        .replay-line-b { stroke-dasharray: 14 14; animation: traceFlow 3.6s linear infinite; }
        .replay-line-c { stroke-dasharray:  8 20; animation: traceFlow 5.2s linear infinite; }

        /* replay-playhead: no CSS animation — position driven by playhead state via x1/x2 attrs */

        /* ── Hex prism ── */
        @keyframes prismRotate    { from { transform: rotate(0deg);   } to { transform: rotate(360deg);  } }
        @keyframes prismRotateRev { from { transform: rotate(0deg);   } to { transform: rotate(-360deg); } }
        @keyframes faceShimmer    { 0%, 100% { opacity: 0.08; } 50% { opacity: 0.22; } }
        .prism-outer { transform-box: fill-box; transform-origin: center; animation: prismRotate    18s linear infinite; }
        .prism-mid   { transform-box: fill-box; transform-origin: center; animation: prismRotateRev 11s linear infinite; }
        .prism-inner { transform-box: fill-box; transform-origin: center; animation: prismRotate     7s linear infinite; }
        .prism-face   { animation: faceShimmer 3.5s ease-in-out infinite; }
        .prism-face.b { animation-delay: 1.16s; }
        .prism-face.c { animation-delay: 2.33s; }

        /* ── Pulse (prism core + atom nucleus) ── */
        @keyframes orbitPulse { 0%, 100% { opacity: 0.6; transform: scale(1); } 50% { opacity: 1; transform: scale(1.05); } }
        .prism-core { animation: orbitPulse 4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }

        /* ── CTA atom electron shells ── */
        @keyframes orbitSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .cta-orbit .q-shell   { transform-box: fill-box; transform-origin: center; animation: orbitSpin 28s linear infinite; }
        .cta-orbit .q-shell.b { animation-duration: 38s; animation-direction: reverse; }
        .cta-orbit .q-shell.c { animation-duration: 50s; }
        .cta-orbit .o-core    { animation: orbitPulse 4.8s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }

        /* ── Auth modal ── */
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes dotBounce { 0%, 100% { opacity: 0.3; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-3px); } }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation: none !important; transition: none !important; }
        }
      `}</style>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ── NAV ── */}
        <nav style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 32px", height: "48px", borderBottom: "1px solid #161618",
          position: "sticky", top: 0,
          background: scrolled ? "rgba(10,10,11,0.94)" : "#0A0A0B",
          backdropFilter: scrolled ? "blur(14px)" : "none", zIndex: 100,
          transition: "background 0.3s, box-shadow 0.3s",
          boxShadow: scrolled ? "0 1px 0 rgba(232,0,29,0.05)" : "none",
        }}>
          <div style={{ display: "flex", gap: "28px", flex: 1 }}>
            {navLink("Standings", standingsRef)}
            {navLink("Calendar", calendarRef)}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
            <span style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: "16px", letterSpacing: "-0.01em", lineHeight: 1, color: "#E0E0DA", ...motionStyle(120) }}>Lumen</span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "7px", letterSpacing: "0.2em", color: "#2e2e2e", textTransform: "uppercase", ...motionStyle(180) }}>Formula One Analytics</span>
          </div>
          <div style={{ display: "flex", gap: "28px", alignItems: "center", flex: 1, justifyContent: "flex-end" }}>
            {navLink("Replay", replayRef)}
            <button className="cta-btn" style={{ padding: "7px 16px", fontSize: "11px" }} onClick={() => setAuthOpen(true)}>{"Sign In ->"}</button>
          </div>
        </nav>

        {/* ── TICKER ── */}
        <div className="ticker-strip" style={{ borderBottom: "1px solid #161618", background: "#0A0A0B", height: "30px", overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: "60px", height: "100%", background: "linear-gradient(90deg, #0A0A0B 40%, transparent)", zIndex: 2, pointerEvents: "none" }} />
          <div style={{ position: "absolute", right: 0, top: 0, width: "60px", height: "100%", background: "linear-gradient(270deg, #0A0A0B 40%, transparent)", zIndex: 2, pointerEvents: "none" }} />
          <div className="ticker-inner" style={{ display: "flex", alignItems: "center", height: "100%", whiteSpace: "nowrap" }}>
            {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <div key={i} style={{ display: "inline-flex", alignItems: "center", height: "100%", flexShrink: 0 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "0", padding: "0 20px", height: "100%" }}>
                  {item.category === "RND" ? (
                    <>
                      <span style={{ fontSize: "8px", color: "#2a2a2a", fontFamily: "'DM Mono', monospace", letterSpacing: "0.14em", marginRight: "8px" }}>{item.label.toUpperCase()}</span>
                      <span style={{ fontSize: "10px", color: "#555", fontFamily: "'DM Mono', monospace" }}>{item.value}</span>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: "8px", color: "#2a2a2a", fontFamily: "'DM Mono', monospace", letterSpacing: "0.14em", marginRight: "10px" }}>{item.category}</span>
                      <span style={{ fontSize: "9px", color: "#E8001D", fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em", marginRight: "10px" }}>{item.pos}</span>
                      <span style={{ fontSize: "10px", color: "#666", fontFamily: "'DM Mono', monospace", marginRight: "8px" }}>{item.label}</span>
                      <span style={{ fontSize: "11px", color: "#C8C8C2", fontFamily: "'DM Mono', monospace", letterSpacing: "-0.02em", fontWeight: 500, marginRight: "4px" }}>{item.value}</span>
                      <span style={{ fontSize: "8px", color: "#2a2a2a", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em" }}>{item.unit}</span>
                    </>
                  )}
                </div>
                <div style={{ width: "1px", height: "14px", background: "#1a1a1a", flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>

        {/* ── HERO ── */}
        <section ref={heroRef} style={{
          padding: "80px 32px 72px", borderBottom: "1px solid #161618",
          background: "radial-gradient(ellipse at 0% 50%, rgba(232,0,29,0.07) 0%, transparent 55%), #0A0A0B",
          position: "relative", overflow: "hidden",
          display: "grid", gridTemplateColumns: "1fr auto", gap: "48px", alignItems: "center",
        }}>
          <div className="hero-glow" style={{ position: "absolute", top: 0, left: "-8%", width: "55%", height: "100%", background: "radial-gradient(ellipse at 20% 50%, rgba(232,0,29,1), transparent 58%)", pointerEvents: "none", zIndex: 0 }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", gap: "8px", marginBottom: "28px", ...motionStyle(60) }}>
              <span className="pill">Replay</span>
              <span className="pill">Standings</span>
              <span className="pill">Calendar</span>
            </div>
            <h1 style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: "clamp(42px, 5.5vw, 74px)", lineHeight: 1.04, letterSpacing: "-0.025em", color: "#E8E8E2", maxWidth: "560px", ...motionStyle(100) }}>
              Every season.<br />Every circuit.<br /><em style={{ color: "#999" }}>Frame by frame.</em>
            </h1>
            <p style={{ fontSize: "13px", color: "#555", lineHeight: 1.8, marginTop: "24px", maxWidth: "340px", ...motionStyle(180) }}>
              Driver standings, race calendars, and animated telemetry replay — powered by FastF1.
            </p>
            <div style={{ display: "flex", gap: "12px", marginTop: "32px", alignItems: "center", ...motionStyle(240) }}>
              <button className="cta-btn" onClick={() => setAuthOpen(true)}>{"Open Dashboard ->"}</button>
              <button className="ghost-btn" onClick={() => scrollTo(replayRef, "Replay")}>See how it works</button>
            </div>
          </div>

          {/* Hex prism */}
          <div className="soft-float" style={{ position: "relative", zIndex: 1, flexShrink: 0, ...motionStyle(320) }}>
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
          </div>
        </section>

        {/* ── STANDINGS TEASER ── */}
        <div ref={standingsRef} style={{ scrollMarginTop: "48px" }} />
        <section ref={standingsTeaserRef} style={{ padding: "64px 32px", borderBottom: "1px solid #161618", background: "radial-gradient(ellipse at 100% 0%, rgba(232,0,29,0.05) 0%, transparent 50%), #0A0A0B" }}>
          <Reveal inView={standingsInView} delay={0} style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "32px" }}>
            <div>
              <div style={{ fontSize: "9px", color: "#E8001D", fontFamily: "'DM Mono', monospace", letterSpacing: "0.14em", marginBottom: "10px" }}>
                {standingsView === "driver" ? "DRIVER" : "CONSTRUCTOR"} STANDINGS · 2024
              </div>
              <h2 style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: "clamp(24px, 3vw, 36px)", color: "#E0E0DA", lineHeight: 1.1 }}>Championship<br />at a glance</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "12px" }}>
              {/* Toggle pill */}
              <div style={{ display: "flex", background: "#0D0D0F", border: "1px solid #1a1a1c", padding: "2px", gap: "2px" }}>
                {[["driver", "Drivers"], ["constructor", "Constructors"]].map(([v, label]) => (
                  <button
                    key={v}
                    onClick={() => setStandingsView(v)}
                    style={{
                      background: standingsView === v ? "#1a1a1c" : "transparent",
                      border: "none", cursor: "pointer",
                      fontFamily: "'DM Mono', monospace", fontSize: "9px", letterSpacing: "0.1em",
                      color: standingsView === v ? "#E0E0DA" : "#333",
                      padding: "5px 12px",
                      transition: "background 0.18s, color 0.18s",
                    }}
                  >{label.toUpperCase()}</button>
                ))}
              </div>
              <button className="ghost-btn">{"Full standings ->"}</button>
            </div>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2px" }}>
            {standingsView === "driver"
              ? TEASER_DRIVERS.map((d, i) => <DriverCard key={d.pos} driver={d} index={i} active={standingsInView} />)
              : TEASER_CONSTRUCTORS.map((c, i) => <ConstructorCard key={c.pos} constructor={c} index={i} active={standingsInView} />)
            }
          </div>
          <div style={{ marginTop: "16px", display: "flex", gap: "32px", paddingTop: "14px", borderTop: "1px solid #111113" }}>
            {[["Rounds complete", "21 / 22"], ["Season", "2024"], ["Next race", "Abu Dhabi · R22"]].map(([k, v], i) => (
              <Reveal key={k} inView={standingsInView} delay={400 + i * 70}>
                <div style={{ fontSize: "9px", color: "#2e2e2e", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", marginBottom: "3px" }}>{k}</div>
                <div style={{ fontSize: "11px", color: "#555", fontFamily: "'DM Mono', monospace" }}>{v}</div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── CALENDAR TEASER ── */}
        <div ref={calendarRef} style={{ scrollMarginTop: "48px" }} />
        <section ref={calendarTeaserRef} style={{ padding: "64px 32px", borderBottom: "1px solid #161618", background: "radial-gradient(ellipse at 50% 100%, rgba(232,0,29,0.05) 0%, transparent 55%), #0A0A0B", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", alignItems: "center" }}>
          <Reveal inView={calendarInView} delay={0}>
            <div style={{ fontSize: "9px", color: "#E8001D", fontFamily: "'DM Mono', monospace", letterSpacing: "0.14em", marginBottom: "10px" }}>RACE CALENDAR · 22 ROUNDS</div>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: "clamp(24px, 3vw, 36px)", color: "#E0E0DA", lineHeight: 1.1, marginBottom: "16px" }}>
              Season schedule,<br />every session
            </h2>
            <p style={{ fontSize: "12px", color: "#555", lineHeight: 1.8, marginBottom: "28px", maxWidth: "280px" }}>
              Browse every round — practice, qualifying, and race — filtered by season and circuit.
            </p>
            <button className="ghost-btn">{"View full calendar ->"}</button>
          </Reveal>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {TEASER_RACES.map((race, i) => (
              <Reveal key={race.round} inView={calendarInView} delay={i * 90 + 100} direction="right">
                <div style={{
                  background: race.status === "next" ? "#111113" : "#0D0D0F",
                  border: "1px solid", borderColor: race.status === "next" ? "#222226" : "#141416",
                  padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between",
                  cursor: "pointer", position: "relative", overflow: "hidden",
                  transition: "background 0.2s, border-color 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#2a2a2d"; e.currentTarget.style.background = "#141416"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = race.status === "next" ? "#222226" : "#141416"; e.currentTarget.style.background = race.status === "next" ? "#111113" : "#0D0D0F"; }}
                >
                  {race.status === "next" && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "2px", background: "#E8001D" }} />}
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <span style={{ fontSize: "9px", color: "#2e2e2e", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", minWidth: "28px" }}>{race.round}</span>
                    <div>
                      <div style={{ fontSize: "12px", color: race.status === "next" ? "#E0E0DA" : "#777", fontFamily: "'Geist', sans-serif", fontWeight: 500 }}>{race.name}</div>
                      <div style={{ fontSize: "9px", color: "#2e2e2e", fontFamily: "'DM Mono', monospace", marginTop: "3px" }}>{race.circuit}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "9px", color: race.status === "next" ? "#E8001D" : "#333", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em" }}>{race.date}</div>
                    {race.winner && <div style={{ fontSize: "8px", color: "#2e2e2e", fontFamily: "'DM Mono', monospace", marginTop: "3px" }}>WIN {race.winner}</div>}
                    {race.status === "next" && <div style={{ fontSize: "8px", color: "#E8001D", fontFamily: "'DM Mono', monospace", marginTop: "3px", letterSpacing: "0.12em" }}>NEXT</div>}
                  </div>
                </div>
              </Reveal>
            ))}
            <Reveal inView={calendarInView} delay={400}>
              <button className="ghost-btn" style={{ marginTop: "8px", width: "100%", justifyContent: "center" }}>{"All 22 rounds ->"}</button>
            </Reveal>
          </div>
        </section>

        {/* ── REPLAY TEASER ── */}
        <div ref={replayRef} style={{ scrollMarginTop: "48px" }} />
        <section ref={replayTeaserRef} style={{ padding: "64px 32px", borderBottom: "1px solid #161618", background: "radial-gradient(ellipse at 0% 100%, rgba(232,0,29,0.06) 0%, transparent 50%), #0A0A0B", display: "grid", gridTemplateColumns: "auto 1fr", gap: "56px", alignItems: "center" }}>
          <Reveal inView={replayInView} delay={0} direction="left" style={{ width: "280px", flexShrink: 0 }}>
            <div style={{ background: "#0D0D0F", border: "1px solid #1a1a1c", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(232,0,29,0.4), transparent)" }} />
              <div style={{ padding: "16px" }}>
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
                  {[25, 50, 75].map(y => <line key={y} x1="0" y1={y} x2="248" y2={y} stroke="#111113" strokeWidth="0.5" />)}
                  {/* Ghost reference lines */}
                  <polyline points="0,72 31,55 62,64 93,24 124,44 155,16 186,36 217,20 248,30" fill="none" stroke="#1e1e1e" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="0,80 31,64 62,74 93,38 124,56 155,30 186,52 217,40 248,48" fill="none" stroke="#161616" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                  {/* Main telemetry line — unplayed (dark) + played (red revealed by clipPath) */}
                  <path d={`M${REPLAY_PTS.map(([x,y])=>`${x},${y}`).join(" L")} L248,100 L0,100 Z`} fill="url(#rt-fill)" clipPath="url(#rt-played)" />
                  <polyline points={REPLAY_PTS.map(([x,y])=>`${x},${y}`).join(" ")} fill="none" stroke="#1e0808" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points={REPLAY_PTS.map(([x,y])=>`${x},${y}`).join(" ")} fill="none" stroke="#E8001D" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" clipPath="url(#rt-played)" />
                  {/* Vertical playhead line — same x as dot, both from playhead state */}
                  {(() => { const p = replayDotPos(playhead); return (
                    <>
                      <line x1={p.x} y1="0" x2={p.x} y2="100" stroke="#E8001D" strokeWidth="0.8" opacity="0.4"/>
                      <circle cx={p.x} cy={p.y} r="5" fill="rgba(232,0,29,0.18)" />
                      <circle cx={p.x} cy={p.y} r="2.8" fill="#E8001D" />
                    </>
                  ); })()}
                </svg>
              </div>
            </div>
          </Reveal>

          <Reveal inView={replayInView} delay={120}>
            <div style={{ fontSize: "9px", color: "#E8001D", fontFamily: "'DM Mono', monospace", letterSpacing: "0.14em", marginBottom: "10px" }}>SESSION REPLAY</div>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: "clamp(24px, 3vw, 36px)", color: "#E0E0DA", lineHeight: 1.1, marginBottom: "16px" }}>
              Replay any session<br /><em>frame by frame</em>
            </h2>
            <p style={{ fontSize: "12px", color: "#555", lineHeight: 1.8, marginBottom: "28px", maxWidth: "340px" }}>
              Load any race weekend and scrub through recorded telemetry — speed, throttle, brake, and DRS across every lap, every circuit, every season.
            </p>
            <div style={{ display: "flex", gap: "6px", marginBottom: "28px", flexWrap: "wrap" }}>
              {["Speed", "Throttle", "Brake", "DRS", "Position"].map((tag, i) => (
                <Reveal key={tag} inView={replayInView} delay={200 + i * 55}>
                  <span className="pill">{tag}</span>
                </Reveal>
              ))}
            </div>
            <button className="cta-btn" onClick={() => setAuthOpen(true)}>{"Try Replay ->"}</button>
          </Reveal>
        </section>

        {/* ── CTA ── */}
        <section ref={ctaRef} style={{ padding: "88px 32px", background: "radial-gradient(ellipse at 50% 50%, rgba(232,0,29,0.06) 0%, transparent 60%), #0A0A0B", borderBottom: "1px solid #161618", display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: "40px" }}>
          <Reveal inView={ctaInView} delay={0}>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: "clamp(28px, 4vw, 52px)", color: "#E0E0DA", lineHeight: 1.06, letterSpacing: "-0.025em" }}>
              One session —<br />infinite insights.<br /><em>/ Open it now.</em>
            </h2>
          </Reveal>
          <Reveal inView={ctaInView} delay={120}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: "1px", height: "48px", background: "#161618", marginBottom: "16px" }} />
              <button className="cta-btn-red" onClick={() => setAuthOpen(true)}>{"Open Dashboard ->"}</button>
              <div style={{ width: "1px", height: "48px", background: "#161618", marginTop: "16px" }} />
            </div>
          </Reveal>
          <Reveal inView={ctaInView} delay={200} style={{ display: "flex", justifyContent: "flex-end" }}>
            <svg className="cta-orbit" viewBox="0 0 160 160" width="160" height="160">
              <circle cx="80" cy="80" r="64" fill="#0D0D0F" stroke="#1a1a1a" strokeWidth="1" />
              <g className="q-shell">
                <ellipse cx="80" cy="80" rx="28" ry="9" fill="none" stroke="rgba(232,0,29,0.24)" strokeWidth="1.1" transform="rotate(-22 80 80)" />
              </g>
              <g className="q-shell b">
                <ellipse cx="80" cy="80" rx="42" ry="11" fill="none" stroke="rgba(232,0,29,0.16)" strokeWidth="1" transform="rotate(18 80 80)" />
              </g>
              <g className="q-shell c">
                <ellipse cx="80" cy="80" rx="56" ry="13" fill="none" stroke="rgba(232,0,29,0.1)" strokeWidth="0.9" transform="rotate(60 80 80)" />
              </g>
              <circle r="3.2" fill="#E8001D" opacity="0.95">
                <animateMotion dur="9.5s" repeatCount="indefinite" path="M108,80 A28,9 0 1,1 52,80 A28,9 0 1,1 108,80" rotate="auto" />
              </circle>
              <circle r="2" fill="#fff" opacity="0.4">
                <animateMotion dur="13.8s" repeatCount="indefinite" path="M122,80 A42,11 0 1,0 38,80 A42,11 0 1,0 122,80" rotate="auto" />
              </circle>
              <circle className="o-core" cx="80" cy="80" r="5" fill="#E8001D" />
              <circle cx="80" cy="80" r="10" fill="none" stroke="#E8001D" strokeWidth="0.8" opacity="0.25" />
            </svg>
          </Reveal>
        </section>

        {/* ── FOOTER ── */}
        <footer ref={footerRef} style={{ background: "#0A0A0B", borderTop: "1px solid #111113", padding: "28px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Reveal inView={footerInView} delay={0}>
            <div style={{ fontSize: "12px", color: "#2a2a2a", fontFamily: "'DM Mono', monospace", marginBottom: "3px" }}>A Race Intelligence Tool by Lumen</div>
            <div style={{ fontSize: "11px", color: "#1e1e1e", fontFamily: "'DM Mono', monospace" }}>Lumen — All rights reserved.</div>
          </Reveal>
          <Reveal inView={footerInView} delay={100}>
            <div style={{ display: "flex", gap: "28px" }}>
              {[["Standings", standingsRef], ["Calendar", calendarRef], ["Replay", replayRef]].map(([l, r]) => (
                <button key={l} className="nav-link" onClick={() => scrollTo(r, l)} style={{ fontSize: "11px", color: "#2a2a2a", letterSpacing: "0.03em" }}>{"-> "}{l}</button>
              ))}
            </div>
          </Reveal>
        </footer>

        {/* ── WORDMARK ── */}
        <div style={{ background: "#0A0A0B", textAlign: "center", padding: "0 0 16px", overflow: "hidden" }}>
          <Reveal inView={footerInView} delay={200}>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: "clamp(48px, 16vw, 160px)", color: "#0D0D0E", letterSpacing: "-0.03em", lineHeight: 1, userSelect: "none" }}>
              Lumen
            </div>
          </Reveal>
        </div>

      </div>
    </div>
  );
}