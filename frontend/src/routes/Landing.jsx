import React, { useEffect, useState, useRef, useReducer, useLayoutEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  { pos: "P2", name: "Lando Norris",   team: "McLaren",         pts: 287, spark: [18, 21, 26, 24, 32, 36, 42, 47], gap: "-44" },
  { pos: "P3", name: "Oscar Piastri",  team: "McLaren",         pts: 271, spark: [20, 22, 25, 29, 33, 35, 39, 43], gap: "-60" },
];

const TEASER_CONSTRUCTORS = [
  { pos: "P1", name: "McLaren",  base: "Woking, UK",     pts: 568, spark: [22, 28, 35, 40, 52, 61, 74, 88], gap: null },
  { pos: "P2", name: "Red Bull", base: "Milton Keynes",  pts: 532, spark: [40, 48, 55, 60, 58, 62, 66, 70], gap: "-36" },
  { pos: "P3", name: "Mercedes", base: "Brackley, UK",   pts: 418, spark: [30, 35, 38, 42, 44, 50, 55, 60], gap: "-150" },
];

const TEASER_RACES = [
  { round: "R20", name: "Mexico City GP", circuit: "Hermanos Rodríguez", date: "27 Oct", status: "done", winner: "VER" },
  { round: "R21", name: "São Paulo GP",   circuit: "Interlagos",          date: "03 Nov", status: "done", winner: "VER" },
  { round: "R22", name: "Abu Dhabi GP",   circuit: "Yas Marina",           date: "08 Dec", status: "next", winner: null },
];

const SESSION_OVERVIEW = {
  name: "Abu Dhabi GP", round: "R22", circuit: "Yas Marina",
  fp3:  [{ pos: "P1", drv: "VER", time: "1:23.445" }, { pos: "P2", drv: "NOR", time: "1:23.701" }, { pos: "P3", drv: "PIA", time: "1:23.889" }],
  qual: [{ pos: "P1", drv: "VER", time: "1:22.595" }, { pos: "P2", drv: "NOR", time: "1:22.841" }, { pos: "P3", drv: "LEC", time: "1:22.972" }],
  race: [{ pos: "P1", drv: "Verstappen", team: "Red Bull", gap: "Winner" }, { pos: "P2", drv: "Norris", team: "McLaren", gap: "+3.7s" }, { pos: "P3", drv: "Piastri", team: "McLaren", gap: "+11.2s" }],
};

/* ─────────────────────────────────────────────
   UTILS
───────────────────────────────────────────── */
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
function SparkLine({ data, id, animated, fillHeight = false }) {
  const containerRef = useRef(null), pathRef = useRef(null);
  const [dims, setDims] = useState({ w: 217, h: 40 });
  const [progress, setProgress] = useState(0);
  const [point, setPoint] = useState({ x: 0, y: 0 });
  const [phase, setPhase] = useState("move");
  const defaultH = 40, moveDuration = 4.5, pulseDuration = 0.7;
  const { w: W, h: H } = dims;

  useEffect(() => {
    const el = containerRef.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      setDims({ w: width, h: Math.max(height, defaultH) });
    });
    ro.observe(el); return () => ro.disconnect();
  }, []);

  const min = Math.min(...data), max = Math.max(...data), range = Math.max(1, max - min);
  const pts = data.map((y, i) => ({ x: i * (W / (data.length - 1)), y: H - ((y - min) / range) * (H - 8) - 4 }));
  const linePath = pts.map((p, i) => `${i ? "L" : "M"} ${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L ${W},${H} L 0,${H} Z`;

  useEffect(() => {
    if (!animated) return;
    let raf, start = null;
    const animate = (t) => {
      if (!start) start = t;
      const elapsed = (t - start) / 1000;
      if (phase === "move") {
        const p = elapsed / moveDuration;
        if (p >= 1) { setProgress(1); setPhase("pulse"); start = t; }
        else setProgress(p);
      } else {
        if (elapsed >= pulseDuration) { setProgress(0); setPhase("move"); start = t; }
      }
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [animated, phase]);

  useLayoutEffect(() => {
    const path = pathRef.current; if (!path) return;
    const len = path.getTotalLength();
    const pos = path.getPointAtLength(progress * len);
    setPoint({ x: pos.x, y: pos.y });
  }, [progress]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: fillHeight ? "100%" : defaultH, minHeight: defaultH }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "100%", display: "block", overflow: "visible" }}>
        <defs>
          <linearGradient id={`sg-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E8001D" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#E8001D" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#sg-${id})`} />
        <path ref={pathRef} d={linePath} fill="none" stroke="#E8001D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {animated && (
          <>
            <motion.circle cx={point.x} cy={point.y} r="2.8" fill="#E8001D"
              animate={{ opacity: phase === "pulse" ? [1, 0] : 1 }}
              transition={{ duration: phase === "pulse" ? pulseDuration : 0.2, ease: "easeOut" }}
            />
            {phase === "pulse" && (
              <motion.circle cx={point.x} cy={point.y} r="2.8" stroke="#E8001D" strokeWidth="1.2" fill="none"
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: pulseDuration, ease: "easeOut" }}
              />
            )}
          </>
        )}
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CARDS
   Single source of truth: whileHover drives all
   visual changes. No React state for hover.
   No shimmer AnimatePresence flicker.
───────────────────────────────────────────── */
/* Shared card hover — framer owns all state */
const cardHover = {
  whileHover: { backgroundColor: "#161618", borderColor: "#2e2e32", y: -2, boxShadow: "0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(232,0,29,0.06)" },
  transition:  { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
  whileTap:    { scale: 0.99, y: 0 },
};

/* ─────────────────────────────────────────────
   MOTION SYSTEM — variants + staggerChildren
───────────────────────────────────────────── */
const sectionVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};
const labelVariants = {
  hidden:  { clipPath: "inset(0 0 100% 0)", opacity: 0 },
  visible: { clipPath: "inset(0 0 0% 0)",   opacity: 1, transition: { duration: 0.45, ease: [0.76, 0, 0.24, 1] } },
};
const headingVariants = {
  hidden:  { clipPath: "inset(0 0 100% 0)", opacity: 0 },
  visible: { clipPath: "inset(0 0 0% 0)",   opacity: 1, transition: { duration: 0.55, ease: [0.76, 0, 0.24, 1] } },
};
const bodyVariants = {
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};
const ctaVariants = {
  hidden:  { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.4,  ease: [0.22, 1, 0.36, 1] } },
};
const lineVariants = {
  hidden:  { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] } },
};
const statVariants = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.4,  ease: [0.22, 1, 0.36, 1] } },
};

function RevealLabel({ children, inView, delay = 0 }) {
  const text = typeof children === "string" ? children : null;
  const [displayed, setDisplayed] = useState("");
  const rafRef = useRef(null);
  const timerRef = useRef(null);
  useEffect(() => {
    if (!inView || !text) return;
    timerRef.current = setTimeout(() => {
      let i = 0;
      const startTime = performance.now();
      const charDuration = 26;
      const tick = (now) => {
        const elapsed = now - startTime;
        const newI = Math.min(Math.floor(elapsed / charDuration) + 1, text.length);
        if (newI !== i) { i = newI; setDisplayed(text.slice(0, i)); }
        if (i < text.length) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    }, delay);
    return () => { clearTimeout(timerRef.current); cancelAnimationFrame(rafRef.current); };
  }, [inView, text, delay]);
  if (!text) return <motion.div variants={labelVariants}>{children}</motion.div>;
  return (
    <motion.div variants={labelVariants} style={{ marginBottom: 10 }}>
      <span className="font-mono text-[9px] tracking-widest" style={{ color: "#E8001D" }}>
        {displayed || "\u00A0"}
        {inView && displayed.length > 0 && displayed.length < text.length && (
          <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.4, repeat: Infinity, repeatType: "reverse" }}
            style={{ display: "inline-block", width: 1, height: "0.75em", background: "#E8001D", marginLeft: 1, verticalAlign: "middle" }}
          />
        )}
      </span>
    </motion.div>
  );
}
function RevealHeading({ children, style = {}, className = "" }) {
  return <motion.div variants={headingVariants} className={className} style={style}>{children}</motion.div>;
}
function RevealBody({ children, style = {}, className = "" }) {
  return <motion.div variants={bodyVariants} className={className} style={style}>{children}</motion.div>;
}
function RevealStat({ label, value, align = "left" }) {
  return (
    <motion.div variants={statVariants} whileHover={{ y: -3 }} style={{ textAlign: align, cursor: "default" }}>
      <div className="font-mono text-[9px] tracking-widest mb-0.5" style={{ color: "#2e2e2e" }}>{label}</div>
      <motion.div className="font-mono text-[11px]" style={{ color: "#555" }}
        whileHover={{ color: "#999" }} transition={{ duration: 0.15 }}
      >{value}</motion.div>
    </motion.div>
  );
}
function RevealLine() {
  return <motion.div variants={lineVariants} style={{ height: 1, background: "#111113", transformOrigin: "left", width: "100%" }} />;
}
function Reveal({ children, className = "" }) {
  return <motion.div variants={ctaVariants} className={className}>{children}</motion.div>;
}

/* Cards assemble on scroll:
   1. Border clips in from top-left corner
   2. Position tag types on
   3. Name slams up from clip
   4. Points count from 0
   5. Sparkline draws
   Stagger multiplied by index so grid fills L→R */
function DriverCard({ driver, index, active, compact = false, style: extraStyle = {} }) {
  const pts = useCountUp(driver.pts, active, 1000, 180 + index * 140);
  const base = index * 140;
  const { gridColumn, gridRow, alignSelf, ...motionStyle } = extraStyle;

  return (
    <div style={{ gridColumn, gridRow, alignSelf, minHeight: 0 }}>
      <motion.div
        {...cardHover}
        className="cursor-pointer"
        initial={{ opacity: 0, clipPath: "inset(0 100% 100% 0)" }}
        animate={active
          ? { opacity: 1, clipPath: "inset(0 0% 0% 0)" }
          : { opacity: 0, clipPath: "inset(0 100% 100% 0)" }}
        transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1], delay: base / 1000 }}
        style={{
          backgroundColor: "#0F0F11", border: "1px solid #1a1a1c",
          padding: compact ? "16px 18px" : 20,
          height: "100%", boxSizing: "border-box",
          display: "flex", flexDirection: "column",
          justifyContent: compact ? "space-between" : "flex-start",
          gap: compact ? 0 : 14,
          overflow: "visible",
          ...motionStyle,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: compact ? 10 : 0 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: compact ? 4 : 6 }}>
              {/* Position — burns in */}
              <motion.span className="font-mono tracking-widest"
                style={{ fontSize: compact ? 9 : 10, color: "#E8001D" }}
                initial={{ opacity: 0 }} animate={active ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.3, delay: (base + 200) / 1000 }}
              >{driver.pos}</motion.span>
              <span style={{ width: 1, height: 10, background: "#222", flexShrink: 0 }} />
              {/* Team — fades after pos */}
              <motion.span className="font-mono tracking-wider"
                style={{ fontSize: compact ? 8 : 9, color: "#444" }}
                initial={{ opacity: 0 }} animate={active ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.4, delay: (base + 280) / 1000 }}
              >{driver.team}</motion.span>
            </div>
            {/* Name — clips up hard */}
            <div style={{ overflow: "hidden" }}>
              <motion.div className="font-normal"
                style={{ fontSize: compact ? 13 : 14, color: "#C8C8C2", fontFamily: "'Instrument Serif', serif" }}
                initial={{ y: "110%" }} animate={active ? { y: "0%" } : { y: "110%" }}
                transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1], delay: (base + 320) / 1000 }}
              >{driver.name}</motion.div>
            </div>
          </div>
          {/* Points — counts up, slams in from right */}
          <div style={{ textAlign: "right" }}>
            <motion.div className="font-mono leading-none tracking-tighter"
              style={{ fontSize: compact ? 24 : 30, color: "#E8E8E2" }}
              initial={{ x: 20, opacity: 0 }} animate={active ? { x: 0, opacity: 1 } : { x: 20, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1], delay: (base + 300) / 1000 }}
            >{pts}</motion.div>
            <motion.div className="font-mono tracking-widest"
              style={{ fontSize: 8, color: "#333", marginTop: 2 }}
              initial={{ opacity: 0 }} animate={active ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.3, delay: (base + 420) / 1000 }}
            >PTS</motion.div>
          </div>
        </div>
        {/* Sparkline area — wipes in */}
        <motion.div
          style={{ flex: compact ? "0 0 auto" : "1 1 auto", display: "flex", flexDirection: "column", minHeight: 0 }}
          initial={{ opacity: 0 }} animate={active ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: (base + 480) / 1000 }}
        >
          <div style={{ flex: compact ? "0 0 auto" : "1 1 0", minHeight: compact ? 40 : "clamp(84px, 11vw, 132px)" }}>
            <SparkLine data={driver.spark} id={index} animated={active} fillHeight={!compact} />
          </div>
          <motion.div className="font-mono tracking-wider"
            style={{ marginTop: 6, fontSize: 9, color: "#444" }}
            initial={{ opacity: 0 }} animate={active ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.3, delay: (base + 600) / 1000 }}
          >
            {driver.gap ? `${driver.gap} to leader` : `+${TEASER_DRIVERS[0].pts - TEASER_DRIVERS[1].pts} ahead of P2`}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function ConstructorCard({ constructor: c, index, active, compact = false, style: extraStyle = {} }) {
  const pts = useCountUp(c.pts, active, 1000, 180 + index * 140);
  const base = index * 140;
  const { gridColumn, gridRow, alignSelf, ...motionStyle } = extraStyle;

  return (
    <div style={{ gridColumn, gridRow, alignSelf, minHeight: 0 }}>
      <motion.div
        {...cardHover}
        className="cursor-pointer"
        initial={{ opacity: 0, clipPath: "inset(0 100% 100% 0)" }}
        animate={active
          ? { opacity: 1, clipPath: "inset(0 0% 0% 0)" }
          : { opacity: 0, clipPath: "inset(0 100% 100% 0)" }}
        transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1], delay: base / 1000 }}
        style={{
          backgroundColor: "#0F0F11", border: "1px solid #1a1a1c",
          padding: compact ? "16px 18px" : 20,
          height: "100%", boxSizing: "border-box",
          display: "flex", flexDirection: "column",
          justifyContent: compact ? "space-between" : "flex-start",
          gap: compact ? 0 : 14,
          overflow: "visible",
          ...motionStyle,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: compact ? 10 : 0 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: compact ? 4 : 6 }}>
              <motion.span className="font-mono tracking-widest"
                style={{ fontSize: compact ? 9 : 10, color: "#E8001D" }}
                initial={{ opacity: 0 }} animate={active ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.3, delay: (base + 200) / 1000 }}
              >{c.pos}</motion.span>
              <span style={{ width: 1, height: 10, background: "#222", flexShrink: 0 }} />
              <motion.span className="font-mono tracking-wider"
                style={{ fontSize: compact ? 8 : 9, color: "#444" }}
                initial={{ opacity: 0 }} animate={active ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.4, delay: (base + 280) / 1000 }}
              >{c.base}</motion.span>
            </div>
            <div style={{ overflow: "hidden" }}>
              <motion.div className="font-normal"
                style={{ fontSize: compact ? 13 : 14, color: "#C8C8C2", fontFamily: "'Instrument Serif', serif" }}
                initial={{ y: "110%" }} animate={active ? { y: "0%" } : { y: "110%" }}
                transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1], delay: (base + 320) / 1000 }}
              >{c.name}</motion.div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <motion.div className="font-mono leading-none tracking-tighter"
              style={{ fontSize: compact ? 24 : 30, color: "#E8E8E2" }}
              initial={{ x: 20, opacity: 0 }} animate={active ? { x: 0, opacity: 1 } : { x: 20, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1], delay: (base + 300) / 1000 }}
            >{pts}</motion.div>
            <motion.div className="font-mono tracking-widest"
              style={{ fontSize: 8, color: "#333", marginTop: 2 }}
              initial={{ opacity: 0 }} animate={active ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.3, delay: (base + 420) / 1000 }}
            >PTS</motion.div>
          </div>
        </div>
        <motion.div
          style={{ flex: compact ? "0 0 auto" : "1 1 auto", display: "flex", flexDirection: "column", minHeight: 0 }}
          initial={{ opacity: 0 }} animate={active ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: (base + 480) / 1000 }}
        >
          <div style={{ flex: compact ? "0 0 auto" : "1 1 0", minHeight: compact ? 40 : "clamp(84px, 11vw, 132px)" }}>
            <SparkLine data={c.spark} id={index + 10} animated={active} fillHeight={!compact} />
          </div>
          <motion.div className="font-mono tracking-wider"
            style={{ marginTop: 6, fontSize: 9, color: "#444" }}
            initial={{ opacity: 0 }} animate={active ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.3, delay: (base + 600) / 1000 }}
          >
            {c.gap ? `${c.gap} to leader` : `+${TEASER_CONSTRUCTORS[0].pts - TEASER_CONSTRUCTORS[1].pts} ahead of P2`}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SCROLL ASSEMBLY SYSTEM
   The page doesn't reveal — it assembles.
   Each element type behaves like data loading
   onto a live timing screen, not a webpage
   fading in. Borders draw, text types, numbers
   count, grids snap column by column.
───────────────────────────────────────────── */

/* Typewriter — eyebrow labels type on char by char */
/* ─────────────────────────────────────────────
   SMART BUTTON — pulse ring on click, arrow animate
───────────────────────────────────────────── */
function SmartButton({ children, onClick, style: extraStyle = {}, className = "", variant = "primary" }) {
  const [clicked, setClicked] = useState(false);
  const [hovered, setHovered] = useState(false);

  const base = variant === "primary"
    ? { background: "#E8001D", color: "#fff", border: "none" }
    : variant === "secondary"
    ? { background: "#E0E0DA", color: "#0A0A0B", border: "none" }
    : { background: "transparent", color: "#666", border: "1px solid #1e1e20" };

  const hoverStyle = variant === "primary"
    ? { background: "#c4001a" }
    : variant === "secondary"
    ? { background: "#fff" }
    : { borderColor: "#3a3a3d", color: "#C8C8C2" };

  const handleClick = () => {
    setClicked(true);
    setTimeout(() => setClicked(false), 600);
    onClick?.();
  };

  return (
    <div style={{ position: "relative", display: "inline-flex" }}>
      <motion.button
        onClick={handleClick}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        className={`inline-flex items-center gap-1.5 font-sans font-medium text-xs px-5 py-2.5 whitespace-nowrap ${className}`}
        style={{ ...base, cursor: "pointer", position: "relative", overflow: "hidden", ...extraStyle }}
        whileHover={{ ...hoverStyle, y: -1 }}
        whileTap={{ scale: 0.97, y: 0 }}
        transition={{ duration: 0.18 }}
      >
        {/* Ripple */}
        <AnimatePresence>
          {clicked && (
            <motion.span
              initial={{ scale: 0, opacity: 0.4 }}
              animate={{ scale: 3, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{
                position: "absolute", inset: 0, background: "rgba(255,255,255,0.18)",
                borderRadius: "50%", transformOrigin: "center", pointerEvents: "none",
              }}
            />
          )}
        </AnimatePresence>
        <span style={{ position: "relative", zIndex: 1, display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
          <span>{children}</span>
          <motion.span
            animate={{ x: hovered ? 3 : 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{ display: "inline-block" }}
          >→</motion.span>
        </span>
      </motion.button>
      {/* Click ring */}
      <AnimatePresence>
        {clicked && (
          <motion.span
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{ scale: 1.6, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              position: "absolute", inset: -2,
              border: `1px solid ${variant === "primary" ? "#E8001D" : "#E0E0DA"}`,
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────
   AUTH MODAL — with enriched micro-interactions
───────────────────────────────────────────── */
const AUTH_INITIAL = { tab: "login", form: { email: "", password: "", name: "" }, loading: false, done: false, error: "" };

function authReducer(state, action) {
  switch (action.type) {
    case "RESET":     return AUTH_INITIAL;
    case "SET_TAB":   return { ...AUTH_INITIAL, tab: action.tab };
    case "SET_FIELD": return { ...state, form: { ...state.form, [action.field]: action.value }, error: "" };
    case "SUBMIT":    return { ...state, loading: true, error: "" };
    case "DONE":      return { ...state, loading: false, done: true };
    case "ERROR":     return { ...state, loading: false, error: action.msg };
    default:          return state;
  }
}

/* Smart input with shake on error, glow on focus, strength meter for password */
function AuthField({ label, type, placeholder, value, onChange, last = false, error = false, showStrength = false }) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  const strength = showStrength && value
    ? value.length >= 12 ? 3 : value.length >= 8 ? 2 : 1
    : 0;
  const strengthColor = ["#E8001D", "#ff8c00", "#22c55e"][strength - 1] || "transparent";
  const strengthLabel = ["WEAK", "FAIR", "STRONG"][strength - 1] || "";

  const effectiveType = type === "password" ? (visible ? "text" : "password") : type;

  return (
    <motion.div
      className={last ? "mb-5" : "mb-3.5"}
      animate={error ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="flex justify-between items-center mb-1.5">
        <motion.div
          className="font-mono text-[8px] tracking-widest"
          animate={{ color: error ? "#E8001D" : focused ? "#888" : "#2e2e2e" }}
          transition={{ duration: 0.15 }}
        >{label}</motion.div>
        {showStrength && strength > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 4 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-mono text-[7px] tracking-widest"
            style={{ color: strengthColor }}
          >{strengthLabel}</motion.div>
        )}
      </div>
      <div style={{ position: "relative" }}>
        <motion.input
          type={effectiveType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full font-mono text-xs outline-none px-3 py-2.5"
          style={{
            background: "#0A0A0B",
            color: "#C8C8C2",
            boxSizing: "border-box",
            transition: "border-color 0.2s, box-shadow 0.2s",
            paddingRight: type === "password" ? "2.25rem" : undefined,
          }}
          animate={{
            borderColor: error ? "#E8001D" : focused ? "#3a3a3e" : "#161618",
            boxShadow: error
              ? "0 0 0 1px rgba(232,0,29,0.3)"
              : focused
              ? "0 0 0 1px rgba(232,0,29,0.08), inset 0 1px 0 rgba(255,255,255,0.02)"
              : "0 0 0 0px transparent",
          }}
          transition={{ duration: 0.18 }}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setVisible(v => !v)}
            style={{
              position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer", color: focused ? "#444" : "#2a2a2a",
              padding: 0, display: "flex", alignItems: "center", transition: "color 0.15s",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              {visible
                ? <><path d="M1 6.5C1 6.5 3 3 6.5 3C10 3 12 6.5 12 6.5C12 6.5 10 10 6.5 10C3 10 1 6.5 1 6.5Z" stroke="currentColor" strokeWidth="1.1"/><circle cx="6.5" cy="6.5" r="1.5" stroke="currentColor" strokeWidth="1.1"/></>
                : <><path d="M1 6.5C1 6.5 3 3 6.5 3C10 3 12 6.5 12 6.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/><line x1="1.5" y1="11.5" x2="11.5" y2="1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></>
              }
            </svg>
          </button>
        )}
        {/* Strength bar under password */}
        {showStrength && (
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: "#111" }}>
            <motion.div
              animate={{ width: `${(strength / 3) * 100}%`, background: strengthColor }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{ height: "100%" }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}

function LoadingDots() {
  return (
    <span className="inline-flex gap-0.5 items-center">
      {[0, 1, 2].map((i) => (
        <motion.span key={i} className="block rounded-full"
          style={{ width: 3, height: 3, background: "#fff" }}
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}

/* Auth progress bar */
function AuthProgressBar({ loading }) {
  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 0.85, opacity: 1 }}
          exit={{ scaleX: 1, opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 1,
            background: "#E8001D", transformOrigin: "left",
          }}
        />
      )}
    </AnimatePresence>
  );
}

function AuthModal({ open, onClose }) {
  const [state, dispatch] = useReducer(authReducer, AUTH_INITIAL);
  const { tab, form, loading, done, error } = state;
  const overlayRef = useRef(null);
  const [tabUnderlinePos, setTabUnderlinePos] = useState({ left: 0, width: 0 });
  const tabRef0 = useRef(null);
  const tabRef1 = useRef(null);
  const tabRefs = [tabRef0, tabRef1];

  useEffect(() => { if (open) dispatch({ type: "RESET" }); }, [open]);

  const handleOverlay = useCallback((e) => { if (e.target === overlayRef.current) onClose(); }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open, onClose]);

  useEffect(() => {
    const el = (tab === "login" ? tabRef0 : tabRef1).current;
    if (!el) return;
    const pRect = el.parentElement.getBoundingClientRect();
    const eRect = el.getBoundingClientRect();
    setTabUnderlinePos({ left: eRect.left - pRect.left, width: eRect.width });
  }, [tab]);

  const handleSubmit = () => {
    if (!form.email || !form.password) {
      dispatch({ type: "ERROR", msg: !form.email ? "Email required" : "Password required" });
      return;
    }
    dispatch({ type: "SUBMIT" });
    setTimeout(() => dispatch({ type: "DONE" }), 1500);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div ref={overlayRef} onClick={handleOverlay}
          className="fixed inset-0 flex items-center justify-center"
          style={{ zIndex: 1000, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)" }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          <motion.div className="w-full relative" style={{ maxWidth: 380, background: "#0D0D0F", border: "1px solid #1e1e22" }}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Loading progress bar */}
            <AuthProgressBar loading={loading} />

            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(232,0,29,0.6), transparent)" }} />

            {/* Header */}
            <div className="px-7 pt-7 flex justify-between items-start">
              <div>
                <AnimatePresence mode="wait">
                  <motion.div key={tab} className="text-xl font-normal mb-1"
                    style={{ fontFamily: "'Instrument Serif', serif", color: "#E0E0DA" }}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.22 }}
                  >
                    {tab === "login" ? "Welcome back" : "Create account"}
                  </motion.div>
                </AnimatePresence>
                <div className="font-mono text-[10px] tracking-widest" style={{ color: "#333" }}>LUMEN · FORMULA ONE ANALYTICS</div>
              </div>
              <motion.button onClick={onClose} className="p-1.5 leading-none"
                style={{ background: "none", border: "none", cursor: "pointer", color: "#333" }}
                whileHover={{ color: "#888", rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <line x1="1" y1="1" x2="13" y2="13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  <line x1="13" y1="1" x2="1" y2="13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </motion.button>
            </div>

            {/* Tabs with gliding underline */}
            <div className="flex mx-7 mt-6 relative" style={{ borderBottom: "1px solid #161618" }}>
              {[["login", "Sign In"], ["signup", "Sign Up"]].map(([t, label], i) => (
                <motion.button key={t} ref={tabRefs[i]}
                  onClick={() => dispatch({ type: "SET_TAB", tab: t })}
                  className="font-mono text-[10px] tracking-widest pb-2.5 mr-6"
                  style={{ background: "none", border: "none", cursor: "pointer", marginBottom: -1, position: "relative" }}
                  animate={{ color: tab === t ? "#E0E0DA" : "#2e2e2e" }}
                  whileHover={{ color: tab === t ? "#E0E0DA" : "#666" }}
                  transition={{ duration: 0.15 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {label.toUpperCase()}
                </motion.button>
              ))}
              {/* Gliding underline */}
              <motion.div
                animate={{ left: tabUnderlinePos.left, width: tabUnderlinePos.width }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                style={{ position: "absolute", bottom: -1, height: 1, background: "#E8001D" }}
              />
            </div>

            {/* Form */}
            <div className="px-7 py-6">
              <AnimatePresence mode="wait">
                {done ? (
                  <motion.div key="done" className="text-center py-8"
                    initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      style={{ fontSize: 32, marginBottom: 12 }}
                    >⚑</motion.div>
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                      className="text-lg font-normal mb-2" style={{ fontFamily: "'Instrument Serif', serif", color: "#E0E0DA" }}
                    >{tab === "login" ? "You're in." : "Account created."}</motion.div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                      className="font-mono text-[10px] tracking-widest" style={{ color: "#444" }}
                    >REDIRECTING TO DASHBOARD</motion.div>
                    {/* Success bar */}
                    <motion.div
                      initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                      transition={{ delay: 0.35, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      style={{ height: 1, background: "#E8001D", marginTop: 20, transformOrigin: "left" }}
                    />
                  </motion.div>
                ) : (
                  <motion.div key={`form-${tab}`} initial={{ opacity: 0, x: tab === "login" ? -12 : 12 }}
                    animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: tab === "login" ? 12 : -12 }}
                    transition={{ duration: 0.22 }}
                  >
                    {tab === "signup" && (
                      <AuthField label="FULL NAME" type="text" placeholder="Lewis Hamilton"
                        value={form.name} onChange={(v) => dispatch({ type: "SET_FIELD", field: "name", value: v })}
                      />
                    )}
                    <AuthField label="EMAIL" type="email" placeholder="driver@team.f1"
                      value={form.email} onChange={(v) => dispatch({ type: "SET_FIELD", field: "email", value: v })}
                      error={error && !form.email}
                    />
                    <AuthField label="PASSWORD" type="password" placeholder="••••••••"
                      value={form.password} onChange={(v) => dispatch({ type: "SET_FIELD", field: "password", value: v })}
                      last={tab === "login"} error={error && !form.password}
                      showStrength={tab === "signup"}
                    />

                    {/* Error message */}
                    <AnimatePresence>
                      {error && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="font-mono text-[9px] tracking-wider mb-3" style={{ color: "#E8001D" }}
                        >{error}</motion.div>
                      )}
                    </AnimatePresence>

                    {tab === "login" && (
                      <div className="text-right mb-5">
                        <motion.button className="font-mono text-[9px] tracking-wider"
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#333" }}
                          whileHover={{ color: "#666" }} whileTap={{ scale: 0.95 }}
                        >FORGOT PASSWORD</motion.button>
                      </div>
                    )}

                    {/* Submit */}
                    <motion.button
                      onClick={handleSubmit} disabled={loading}
                      className="w-full font-mono text-[11px] tracking-widest text-white flex items-center justify-center gap-2 py-3 px-5 relative overflow-hidden"
                      style={{ background: loading ? "#5a000f" : "#E8001D", border: "none", cursor: loading ? "default" : "pointer" }}
                      whileHover={!loading ? { backgroundColor: "#c4001a", scale: 1.005 } : {}}
                      whileTap={!loading ? { scale: 0.985 } : {}}
                    >
                      {loading ? (
                        <><LoadingDots /> {tab === "login" ? "SIGNING IN" : "CREATING ACCOUNT"}</>
                      ) : (
                        <>
                          <span>{tab === "login" ? "SIGN IN" : "CREATE ACCOUNT"}</span>
                          <motion.span animate={{ x: [0, 3, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}>→</motion.span>
                        </>
                      )}
                    </motion.button>

                    <div className="mt-5 text-center font-mono text-[9px] tracking-wider" style={{ color: "#1e1e1e" }}>
                      {tab === "login" ? "DON'T HAVE AN ACCOUNT? " : "ALREADY HAVE AN ACCOUNT? "}
                      <motion.button
                        onClick={() => dispatch({ type: "SET_TAB", tab: tab === "login" ? "signup" : "login" })}
                        className="font-mono text-[9px] tracking-wider underline underline-offset-2"
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#444" }}
                        whileHover={{ color: "#888" }} whileTap={{ scale: 0.95 }}
                      >
                        {tab === "login" ? "SIGN UP" : "SIGN IN"}
                      </motion.button>
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
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* ─────────────────────────────────────────────
   NAV LINK — with predictive hover indicator
───────────────────────────────────────────── */
function NavLink({ label, scrollRef, activeNav, onNav }) {
  const isActive = activeNav === label;
  const [hovered, setHovered] = useState(false);
  return (
    <motion.button onClick={() => onNav(scrollRef, label)}
      onHoverStart={() => setHovered(true)} onHoverEnd={() => setHovered(false)}
      className="relative pb-0.5 font-sans text-xs"
      style={{ background: "none", border: "none", cursor: "pointer", letterSpacing: "0.01em" }}
      animate={{ color: isActive ? "#E8001D" : hovered ? "#C8C8C2" : "#555" }}
      transition={{ duration: 0.15 }}
    >
      <motion.span
        animate={{ x: hovered && !isActive ? 2 : 0 }}
        transition={{ duration: 0.2 }}
        style={{ display: "inline-block" }}
      >{"-> "}</motion.span>
      {label}
      <motion.span className="absolute bottom-0 left-0 h-px"
        style={{ background: "#E8001D" }}
        animate={{ width: isActive ? "100%" : hovered ? "40%" : "0%" }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      />
    </motion.button>
  );
}

/* ─────────────────────────────────────────────
   TICKER ITEM with hover pause
───────────────────────────────────────────── */
function TickerItem({ item, i }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      key={i}
      className="inline-flex items-center h-full flex-shrink-0"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      animate={{ background: hovered ? "rgba(232,0,29,0.04)" : "transparent" }}
      transition={{ duration: 0.15 }}
    >
      <div className="inline-flex items-center h-full px-5">
        {item.category === "RND" ? (
          <>
            <span className="font-mono text-[8px] tracking-widest mr-2" style={{ color: hovered ? "#444" : "#2a2a2a", transition: "color 0.15s" }}>{item.label.toUpperCase()}</span>
            <span className="font-mono text-[10px]" style={{ color: hovered ? "#888" : "#555", transition: "color 0.15s" }}>{item.value}</span>
          </>
        ) : (
          <>
            <span className="font-mono text-[8px] tracking-widest mr-2.5" style={{ color: "#2a2a2a" }}>{item.category}</span>
            <motion.span className="font-mono text-[9px] tracking-wider mr-2.5"
              animate={{ color: hovered ? "#ff3b52" : "#E8001D" }} transition={{ duration: 0.15 }}
            >{item.pos}</motion.span>
            <span className="font-mono text-[10px] mr-2" style={{ color: hovered ? "#888" : "#666", transition: "color 0.15s" }}>{item.label}</span>
            <motion.span className="font-mono text-[11px] tracking-tighter font-medium mr-1"
              animate={{ color: hovered ? "#fff" : "#C8C8C2" }} transition={{ duration: 0.15 }}
            >{item.value}</motion.span>
            <span className="font-mono text-[8px] tracking-widest" style={{ color: "#2a2a2a" }}>{item.unit}</span>
          </>
        )}
      </div>
      <div className="w-px flex-shrink-0" style={{ height: 14, background: "#1a1a1a" }} />
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   HERO TAG — with ripple on hover
───────────────────────────────────────────── */
function HeroTag({ label, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.span
      onClick={onClick}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="font-mono text-[10px] tracking-wider px-3 py-0.5 rounded-full relative overflow-hidden"
      style={{ border: "1px solid #1e1e20", color: "#444", cursor: onClick ? "pointer" : "default" }}
      animate={{
        borderColor: hovered ? "#3a3a3e" : "#1e1e20",
        color: hovered ? "#888" : "#444",
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.18 }}
    >
      <AnimatePresence>
        {hovered && (
          <motion.span
            initial={{ scale: 0, opacity: 0.3 }}
            animate={{ scale: 2.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            style={{
              position: "absolute", inset: 0,
              background: "rgba(232,0,29,0.12)",
              borderRadius: "50%",
              transformOrigin: "center",
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>
      {label}
    </motion.span>
  );
}

/* ─────────────────────────────────────────────
   STANDINGS TOGGLE — with sliding indicator
───────────────────────────────────────────── */
const TOGGLE_OPTS = [["driver", "Drivers"], ["constructor", "Constructors"]];

function StandingsToggle({ value, onChange }) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const btn0 = useRef(null);
  const btn1 = useRef(null);
  const btnRefs = [btn0, btn1];

  useEffect(() => {
    const idx = TOGGLE_OPTS.findIndex(([opt]) => opt === value);
    const el = (idx === 0 ? btn0 : btn1).current;
    if (!el) return;
    const pRect = el.parentElement.getBoundingClientRect();
    const eRect = el.getBoundingClientRect();
    setIndicatorStyle({ left: eRect.left - pRect.left - 2, width: eRect.width + 4 });
  }, [value]);

  return (
    <div className="flex p-0.5 gap-0.5 mb-1 relative" style={{ background: "#0D0D0F", border: "1px solid #1a1a1c" }}>
      {/* Sliding bg pill */}
      <motion.div
        animate={{ left: indicatorStyle.left, width: indicatorStyle.width }}
        transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: "absolute", top: 2, height: "calc(100% - 4px)", background: "#1a1a1c", zIndex: 0, borderRadius: 1 }}
      />
      {TOGGLE_OPTS.map(([v, label], i) => (
        <motion.button key={v} ref={btnRefs[i]} onClick={() => onChange(v)}
          className="font-mono text-[9px] tracking-widest px-3 py-1.5 relative"
          style={{ border: "none", cursor: "pointer", zIndex: 1, background: "transparent" }}
          animate={{ color: value === v ? "#E0E0DA" : "#333" }}
          whileHover={{ color: value === v ? "#E0E0DA" : "#666" }}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.15 }}
        >{label.toUpperCase()}</motion.button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   RACE CARD — with depth and live badge pulse
───────────────────────────────────────────── */
function RaceCard({ race, index, inView, primary = false }) {
  const base = index * 120;
  return (
    <motion.div
      {...cardHover}
      initial={{ opacity: 0, clipPath: "inset(0 100% 100% 0)" }}
      animate={inView
        ? { opacity: 1, clipPath: "inset(0 0% 0% 0)" }
        : { opacity: 0, clipPath: "inset(0 100% 100% 0)" }}
      transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1], delay: base / 1000 }}
      style={{
        backgroundColor: "#0F0F11",
        border: `1px solid ${primary ? "#222226" : "#1a1a1c"}`,
        padding: primary ? 20 : "16px 18px", height: "100%", boxSizing: "border-box",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        position: "relative", overflow: "hidden", cursor: "pointer",
      }}
    >
      {/* Left accent draws down on entry */}
      {primary && (
        <motion.div
          initial={{ scaleY: 0 }} animate={inView ? { scaleY: 1 } : { scaleY: 0 }}
          transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1], delay: (base + 200) / 1000 }}
          style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: "#E8001D", transformOrigin: "top" }}
        />
      )}

      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: primary ? 10 : 6 }}>
          <motion.span className="font-mono tracking-widest"
            style={{ fontSize: 9, color: "#E8001D", letterSpacing: "0.14em" }}
            initial={{ opacity: 0 }} animate={inView ? { opacity: race.status === "next" ? [1, 0.5, 1] : 1 } : { opacity: 0 }}
            transition={{ duration: race.status === "next" ? 2 : 0.3, repeat: race.status === "next" ? Infinity : 0, ease: "easeInOut", delay: (base + 180) / 1000 }}
          >{race.status === "next" ? "NEXT RACE" : race.round}</motion.span>
          {race.status === "next" && (
            <>
              <span style={{ width: 1, height: 8, background: "#2a2a2a" }} />
              <motion.span
                animate={{ opacity: [1, 0.3, 1], scale: [1, 1.2, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                style={{ width: 5, height: 5, borderRadius: "50%", background: "#E8001D", display: "inline-block" }}
              />
            </>
          )}
          {!primary && <><span style={{ width: 1, height: 10, background: "#222" }} /><motion.span className="font-mono tracking-wider" style={{ fontSize: 8, color: "#444" }} initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : { opacity: 0 }} transition={{ delay: (base + 220) / 1000 }}>{race.date}</motion.span></>}
          {primary && <><span style={{ width: 1, height: 8, background: "#2a2a2a" }} /><span className="font-mono" style={{ fontSize: 8, color: "#2a2a2a", letterSpacing: "0.1em" }}>{race.round}</span></>}
        </div>
        {/* Race name — clips up */}
        <div style={{ overflow: "hidden", marginBottom: primary ? 6 : 3 }}>
          <motion.div style={{ fontFamily: "'Instrument Serif', serif", fontSize: primary ? 22 : 13, color: primary ? "#E0E0DA" : "#C8C8C2", lineHeight: 1.1 }}
            initial={{ y: "110%" }} animate={inView ? { y: "0%" } : { y: "110%" }}
            transition={{ duration: 0.45, ease: [0.76, 0, 0.24, 1], delay: (base + 240) / 1000 }}
          >{race.name}</motion.div>
        </div>
        <motion.div className="font-mono" style={{ fontSize: 9, color: "#444", letterSpacing: "0.06em" }}
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.3, delay: (base + 320) / 1000 }}
        >{race.circuit}</motion.div>
      </div>

      {primary ? (
        <div>
          {/* Date number — slams in */}
          <motion.div className="font-mono leading-none tracking-tighter" style={{ fontSize: 36, color: "#E8E8E2", marginBottom: 2 }}
            initial={{ opacity: 0, x: -12 }} animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
            transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1], delay: (base + 360) / 1000 }}
          >08</motion.div>
          <motion.div className="font-mono tracking-widest" style={{ fontSize: 8, color: "#333" }}
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.3, delay: (base + 440) / 1000 }}
          >DEC 2024</motion.div>
          <motion.div className="font-mono tracking-wider mt-2" style={{ fontSize: 9, color: "#2a2a2a" }}
            initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.3, delay: (base + 500) / 1000 }}
          >Season finale</motion.div>
        </div>
      ) : (
        <motion.div className="font-mono tracking-wider" style={{ fontSize: 9, color: "#444" }}
          initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.3, delay: (base + 380) / 1000 }}
        >{race.winner ? `WIN ${race.winner}` : "—"}</motion.div>
      )}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   MAIN LANDING
───────────────────────────────────────────── */
export default function Landing() {
  const [teaserDrivers, setTeaserDrivers]     = useState([]);
  const [animationsReady, setAnimationsReady] = useState(false);
  const [scrolled, setScrolled]               = useState(false);
  const [activeNav, setActiveNav]             = useState(null);
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

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/v1/teaser/drivers")
      .then((res) => res.json())
      .then((data) => {
        setTeaserDrivers(data.drivers);
      })
      .catch((err) => {
        console.error(err);
      });

  }, []);

  useEffect(() => {
    const id = "lumen-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id; link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500&family=DM+Mono:wght@300;400;500&display=swap";
    document.head.appendChild(link);
  }, []);

  useEffect(() => { const t = setTimeout(() => setAnimationsReady(true), 80); return () => clearTimeout(t); }, []);

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
    hidden:  { opacity: 0, clipPath: "inset(0 0 100% 0)" },
    visible: (delay) => ({
      opacity: 1,
      clipPath: "inset(0 0 0% 0)",
      transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1], delay: delay / 1000 }
    }),
  };

  return (
    <div data-motion-ready={animationsReady ? "true" : "false"} style={{ background: "#0A0A0B", minHeight: "100vh" }}>
      <style>{`
        html { scroll-behavior: smooth; }

        @keyframes tickerScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
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

        @keyframes ctaGlow { 0%, 100% { box-shadow: 0 0 0 0 rgba(232,0,29,0); } 50% { box-shadow: 0 0 24px 4px rgba(232,0,29,0.18); } }
        .cta-glow-btn { animation: ctaGlow 3s ease-in-out infinite; }

        @keyframes scanLine { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
        .scan-line { animation: scanLine 8s linear infinite; pointer-events: none; }

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
            height: 48, borderBottom: "1px solid #161618",
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

          {/* Logo with hover pulse */}
          <motion.div className="flex flex-col items-center gap-0.5" whileHover={{ scale: 1.04 }} transition={{ duration: 0.2 }}>
            <motion.span className="text-base font-normal leading-none"
              style={{ fontFamily: "'Instrument Serif', serif", color: "#E0E0DA", letterSpacing: "-0.01em" }}
              custom={120} variants={heroVariants} initial="hidden" animate={animationsReady ? "visible" : "hidden"}
            >Lumen</motion.span>
            <motion.span className="font-mono text-[7px] uppercase tracking-widest" style={{ color: "#2e2e2e" }}
              custom={180} variants={heroVariants} initial="hidden" animate={animationsReady ? "visible" : "hidden"}
            >Formula One Analytics</motion.span>
          </motion.div>

          <div className="flex gap-7 items-center flex-1 justify-end">
            <NavLink label="Replay" scrollRef={replayRef} activeNav={activeNav} onNav={scrollTo} />
            <SmartButton variant="secondary" onClick={() => setAuthOpen(true)} style={{ fontSize: 11, padding: "6px 16px" }}>
              Sign In
            </SmartButton>
          </div>
        </motion.nav>

        {/* ── TICKER ── */}
        <div className="ticker-strip relative overflow-hidden" style={{ borderBottom: "1px solid #161618", background: "#0A0A0B", height: 30 }}>
          <div className="absolute left-0 top-0 h-full w-16 pointer-events-none" style={{ background: "linear-gradient(90deg, #0A0A0B 40%, transparent)", zIndex: 2 }} />
          <div className="absolute right-0 top-0 h-full w-16 pointer-events-none" style={{ background: "linear-gradient(270deg, #0A0A0B 40%, transparent)", zIndex: 2 }} />
          <div className="ticker-inner flex items-center h-full whitespace-nowrap">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <TickerItem key={i} item={item} i={i} />
            ))}
          </div>
        </div>

        {/* ── HERO ── */}
        <section ref={heroRef} className="relative overflow-hidden grid gap-12 items-center px-8"
          style={{ paddingTop: 80, paddingBottom: 72, borderBottom: "1px solid #161618", background: "radial-gradient(ellipse at 0% 50%, rgba(232,0,29,0.07) 0%, transparent 55%), #0A0A0B", gridTemplateColumns: "1fr auto" }}
        >
          <div className="hero-glow absolute top-0 left-0 pointer-events-none" style={{ left: "-8%", width: "55%", height: "100%", background: "radial-gradient(ellipse at 20% 50%, rgba(232,0,29,1), transparent 58%)", zIndex: 0 }} />
          
          <div className="relative" style={{ zIndex: 1 }}>
            <motion.div className="flex gap-2 mb-7" custom={60} variants={heroVariants} initial="hidden" animate={animationsReady ? "visible" : "hidden"}>
              {[
                { label: "Replay", ref: replayRef },
                { label: "Standings", ref: standingsRef },
                { label: "Calendar", ref: calendarRef },
              ].map(({ label, ref }) => (
                <HeroTag key={label} label={label} onClick={() => scrollTo(ref, label)} />
              ))}
            </motion.div>

            <motion.h1 className="font-normal leading-tight"
              style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(42px, 5.5vw, 74px)", letterSpacing: "-0.025em", color: "#E8E8E2", maxWidth: 560 }}
              custom={100} variants={heroVariants} initial="hidden" animate={animationsReady ? "visible" : "hidden"}
            >
              Every season.<br />Every circuit.<br /><em style={{ color: "#999" }}>Frame by frame.</em>
            </motion.h1>
            
            <motion.p className="text-sm mt-6" style={{ color: "#555", lineHeight: 1.8, maxWidth: 340 }}
              custom={180} variants={heroVariants} initial="hidden" animate={animationsReady ? "visible" : "hidden"}
            >
              Driver standings, race calendars, and animated telemetry replay — powered by FastF1.
            </motion.p>

            <motion.div className="flex gap-3 mt-8 items-center" custom={240} variants={heroVariants} initial="hidden" animate={animationsReady ? "visible" : "hidden"}>
              <SmartButton variant="secondary" onClick={() => setAuthOpen(true)}>
                Open Dashboard
              </SmartButton>
              <SmartButton variant="ghost" onClick={() => scrollTo(replayRef, "Replay")} style={{ fontSize: 11, padding: "8px 16px" }}>
                See how it works
              </SmartButton>
            </motion.div>
          </div>

          {/* Hex Prism — with subtle 3D tilt */}
          <motion.div className="soft-float relative flex-shrink-0" style={{ zIndex: 1 }}
            custom={320} variants={heroVariants} initial="hidden" animate={animationsReady ? "visible" : "hidden"}
            whileHover={{ scale: 1.04 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <svg viewBox="0 0 160 160" width="260" height="260" style={{ overflow: "visible", display: "block" }}>
              <defs>
                <linearGradient id="pf1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#E8001D" stopOpacity=".35"/><stop offset="100%" stopColor="#FF6B35" stopOpacity=".06"/></linearGradient>
                <linearGradient id="pf2" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#E8001D" stopOpacity=".18"/><stop offset="100%" stopColor="#E8001D" stopOpacity=".04"/></linearGradient>
                <linearGradient id="pf3" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stopColor="#FF3B52" stopOpacity=".22"/><stop offset="100%" stopColor="#E8001D" stopOpacity=".04"/></linearGradient>
                <filter id="pglow"><feGaussianBlur stdDeviation="2.5" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>
              </defs>
              <g><animateTransform attributeName="transform" type="rotate" from="0 80 60" to="360 80 60" dur="18s" repeatCount="indefinite"/>
                <polygon points="80,12 124,36 124,84 80,108 36,84 36,36" fill="none" stroke="rgba(232,0,29,.1)" strokeWidth=".8"/>
                <line x1="80" y1="12" x2="80" y2="108" stroke="rgba(232,0,29,.05)" strokeWidth=".5"/>
                <line x1="36" y1="36" x2="124" y2="84" stroke="rgba(232,0,29,.05)" strokeWidth=".5"/>
                <line x1="124" y1="36" x2="36" y2="84" stroke="rgba(232,0,29,.05)" strokeWidth=".5"/>
              </g>
              <g><animateTransform attributeName="transform" type="rotate" from="0 80 60" to="360 80 60" dur="9s" repeatCount="indefinite"/>
                <polygon points="80,28 108,44 108,76 80,92 52,76 52,44" fill="none" stroke="rgba(232,0,29,.26)" strokeWidth="1.1"/>
                <polygon points="80,28 108,44 80,60" fill="url(#pf1)"/>
                <polygon points="108,44 108,76 80,60" fill="url(#pf2)"/>
                <polygon points="80,92 52,76 80,60" fill="url(#pf3)"/>
                <line x1="80" y1="60" x2="124" y2="36" stroke="rgba(232,0,29,.14)" strokeWidth=".6"/>
                <line x1="80" y1="60" x2="128" y2="90" stroke="rgba(255,80,60,.09)" strokeWidth=".6"/>
                <line x1="80" y1="60" x2="28" y2="96" stroke="rgba(232,0,29,.07)" strokeWidth=".6"/>
                <circle r="3.2" fill="#E8001D" opacity=".95" filter="url(#pglow)">
                  <animateMotion dur="9s" repeatCount="indefinite" calcMode="linear" path="M80,28 L108,44 L108,76 L80,92 L52,76 L52,44 Z"/>
                </circle>
                <circle r="1.8" fill="#FF6B35" opacity=".55">
                  <animateMotion dur="9s" begin="-4.5s" repeatCount="indefinite" calcMode="linear" path="M80,28 L108,44 L108,76 L80,92 L52,76 L52,44 Z"/>
                </circle>
              </g>
              <g><animateTransform attributeName="transform" type="rotate" from="0 80 60" to="-360 80 60" dur="6s" repeatCount="indefinite"/>
                <polygon points="80,46 94,54 94,70 80,78 66,70 66,54" fill="none" stroke="rgba(232,0,29,.44)" strokeWidth="1.2"/>
                <polygon points="80,46 94,54 94,70 80,78 66,70 66,54" fill="rgba(232,0,29,.07)"/>
              </g>
              <circle cx="80" cy="60" r="4.5" fill="#E8001D" opacity=".9"/>
              <circle cx="80" cy="60" r="10" fill="none" stroke="#E8001D" strokeWidth=".7" opacity=".2"/>
            </svg>
          </motion.div>
        </section>

        {/* ── STANDINGS TEASER ── */}
        <div ref={standingsRef} style={{ scrollMarginTop: 48 }} />
        <section ref={standingsTeaserRef} className="px-8 py-16 grid gap-16 items-start"
          style={{ borderBottom: "1px solid #161618", background: "radial-gradient(ellipse at 100% 0%, rgba(232,0,29,0.05) 0%, transparent 50%), #0A0A0B", gridTemplateColumns: "1fr 1fr" }}
        >
          <div>
            <AnimatePresence mode="wait">
              <motion.div key={standingsView}
                style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gridTemplateRows: "1fr 1fr", gap: 2 }}
                initial={{ opacity: 0, x: standingsView === "driver" ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: standingsView === "driver" ? 10 : -10 }}
                transition={{ duration: 0.24 }}
              >
                {standingsView === "driver" && teaserDrivers.length >= 3
                  ? <DriverCard driver={teaserDrivers[0]} index={0} active={standingsInView} style={{ gridColumn: 1, gridRow: "1 / 3", alignSelf: "stretch" }} />
                  : <ConstructorCard constructor={TEASER_CONSTRUCTORS[0]} index={0} active={standingsInView} style={{ gridColumn: 1, gridRow: "1 / 3", alignSelf: "stretch" }} />
                }
                {standingsView === "driver" && teaserDrivers.length >= 3
                  ? <DriverCard driver={teaserDrivers[1]} index={1} active={standingsInView} compact style={{ gridColumn: 2, gridRow: 1 }} />
                  : <ConstructorCard constructor={TEASER_CONSTRUCTORS[1]} index={1} active={standingsInView} compact style={{ gridColumn: 2, gridRow: 1 }} />
                }
                {standingsView === "driver" && teaserDrivers.length >= 3
                  ? <DriverCard driver={teaserDrivers[2]} index={2} active={standingsInView} compact style={{ gridColumn: 2, gridRow: 2 }} />
                  : <ConstructorCard constructor={TEASER_CONSTRUCTORS[2]} index={2} active={standingsInView} compact style={{ gridColumn: 2, gridRow: 2 }} />
                }
              </motion.div>
            </AnimatePresence>
          </div>

          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate={standingsInView ? "visible" : "hidden"}
          >
            <RevealLabel inView={standingsInView} delay={0}>
              {standingsView === "driver" ? "DRIVER STANDINGS · 2024" : "CONSTRUCTOR STANDINGS · 2024"}
            </RevealLabel>
            <RevealHeading
              style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(24px, 3vw, 36px)", color: "#E0E0DA", fontWeight: "normal", lineHeight: 1.15, marginBottom: 16 }}
            >Championship<br />at a glance</RevealHeading>
            <RevealBody className="text-xs mb-7" style={{ color: "#555", lineHeight: 1.8, maxWidth: 280 }}>
              Live driver and constructor standings updated after every round, with point progression across the season.
            </RevealBody>
            <Reveal>
              <div className="flex flex-col items-start gap-3">
                <StandingsToggle value={standingsView} onChange={setStandingsView} />
                <SmartButton variant="ghost" onClick={() => setAuthOpen(true)} style={{ fontSize: 11 }}>
                  Full standings
                </SmartButton>
              </div>
            </Reveal>
            <div className="mt-4 pt-3.5">
              <RevealLine />
              <motion.div className="flex gap-8 mt-3.5" variants={sectionVariants}>
                {[["Rounds complete", "21 / 22"], ["Season", "2024"], ["Next race", "Abu Dhabi · R22"]].map(([k, v]) => (
                  <RevealStat key={k} label={k} value={v} />
                ))}
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* ── CALENDAR TEASER ── */}
        <div ref={calendarRef} style={{ scrollMarginTop: 48 }} />
        <section ref={calendarTeaserRef} className="px-8 py-16 grid gap-16 items-start"
          style={{ borderBottom: "1px solid #161618", background: "radial-gradient(ellipse at 50% 100%, rgba(232,0,29,0.05) 0%, transparent 55%), #0A0A0B", gridTemplateColumns: "1fr 1fr" }}
        >
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate={calendarInView ? "visible" : "hidden"}
          >
            <RevealLabel inView={calendarInView} delay={0} style={{ textAlign: "right" }}>
              {"RACE CALENDAR · 22 ROUNDS"}
            </RevealLabel>
            <RevealHeading
              style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(24px, 3vw, 36px)", color: "#E0E0DA", fontWeight: "normal", lineHeight: 1.15, marginBottom: 16, textAlign: "right" }}
            >Season schedule,<br />every session</RevealHeading>
            <RevealBody className="text-xs mb-7"
              style={{ color: "#555", lineHeight: 1.8, maxWidth: 280, textAlign: "right", marginLeft: "auto" }}
            >
              Browse every round — practice, qualifying, and race — filtered by season and circuit.
            </RevealBody>
            <Reveal>
              <div className="flex justify-end">
                <SmartButton variant="ghost" onClick={() => setAuthOpen(true)} style={{ fontSize: 11 }}>
                  View full calendar
                </SmartButton>
              </div>
            </Reveal>
            <div className="mt-4 pt-3.5">
              <RevealLine />
              <motion.div className="flex gap-8 mt-3.5 justify-end" variants={sectionVariants}>
                {[["Rounds complete", "21 / 22"], ["Season", "2024"], ["Next race", "Abu Dhabi · R22"]].map(([k, v]) => (
                  <RevealStat key={k} label={k} value={v} align="right" />
                ))}
              </motion.div>
            </div>
          </motion.div>

          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 2 }}>
              <div style={{ gridColumn: 2, gridRow: "1 / 3", minHeight: 0, overflow: "visible" }}>
                <RaceCard race={{ round: "R22", name: "Abu Dhabi GP", circuit: "Yas Marina", status: "next", winner: null }} index={0} inView={calendarInView} primary />
              </div>
              <div style={{ gridColumn: 1, gridRow: 1, minHeight: 0, overflow: "visible" }}>
                <RaceCard race={{ round: "R20", name: "Mexico City GP", circuit: "Hermanos Rodríguez", date: "27 Oct", status: "done", winner: "VER" }} index={1} inView={calendarInView} />
              </div>
              <div style={{ gridColumn: 1, gridRow: 2, minHeight: 0, overflow: "visible" }}>
                <RaceCard race={{ round: "R21", name: "São Paulo GP", circuit: "Interlagos", date: "03 Nov", status: "done", winner: "VER" }} index={2} inView={calendarInView} />
              </div>
            </div>
          </div>
        </section>

        {/* ── REPLAY TEASER ── */}
        <div ref={replayRef} style={{ scrollMarginTop: 48 }} />
        <section ref={replayTeaserRef} className="px-8 py-16 grid gap-16 items-start"
          style={{ borderBottom: "1px solid #161618", background: "radial-gradient(ellipse at 100% 100%, rgba(232,0,29,0.06) 0%, transparent 50%), #0A0A0B", gridTemplateColumns: "1fr 1fr" }}
        >
          {/* Session overview panel — LEFT */}
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 2 }}>

              {/* RACE card — clips in from top */}
              <motion.div
                {...cardHover}
                className="cursor-pointer"
                initial={{ opacity: 0, y: 12 }}
                animate={replayInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1], delay: 0 }}
                style={{ gridColumn: 1, gridRow: "1 / 3", backgroundColor: "#0F0F11", border: "1px solid #222226", padding: 20, boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}
              >
                {/* Left accent bar */}
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: "#E8001D" }} />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span className="font-mono" style={{ fontSize: 8, color: "#E8001D", letterSpacing: "0.14em" }}>RACE</span>
                    <span style={{ width: 1, height: 8, background: "#2a2a2a" }} />
                    <span className="font-mono" style={{ fontSize: 8, color: "#2a2a2a", letterSpacing: "0.1em" }}>R22 · ABU DHABI</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 8 }}>
                    {SESSION_OVERVIEW.race.map(({ pos, drv, team, gap }, i) => (
                      <motion.div key={i} whileHover={{ x: 3 }} style={{ cursor: "default" }}>
                        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 2 }}>
                          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                            {/* Pos — burns in first */}
                            <motion.span className="font-mono"
                              style={{ fontSize: i === 0 ? 10 : 9, color: i === 0 ? "#E8001D" : "#333", letterSpacing: "0.1em" }}
                              initial={{ opacity: 0 }}
                              animate={replayInView ? { opacity: 1 } : { opacity: 0 }}
                              transition={{ duration: 0.2, delay: 0.55 + i * 0.18 }}
                            >{pos}</motion.span>
                            {/* Driver name clips up */}
                            <div style={{ overflow: "hidden" }}>
                              <motion.span style={{ fontFamily: "'Instrument Serif', serif", fontSize: i === 0 ? 18 : 14, color: i === 0 ? "#C8C8C2" : "#555", display: "block" }}
                                initial={{ y: "110%" }}
                                animate={replayInView ? { y: "0%" } : { y: "110%" }}
                                transition={{ duration: 0.38, ease: [0.76, 0, 0.24, 1], delay: 0.6 + i * 0.18 }}
                              >{drv}</motion.span>
                            </div>
                          </div>
                          {/* Gap — types in from right */}
                          <motion.span className="font-mono"
                            style={{ fontSize: 8, color: i === 0 ? "#555" : "#2a2a2a" }}
                            initial={{ opacity: 0, x: 6 }}
                            animate={replayInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 6 }}
                            transition={{ duration: 0.3, delay: 0.72 + i * 0.18 }}
                          >{gap}</motion.span>
                        </div>
                        {/* Team — fades last */}
                        <motion.div className="font-mono"
                          style={{ fontSize: 8, color: "#2a2a2a", letterSpacing: "0.06em" }}
                          initial={{ opacity: 0 }}
                          animate={replayInView ? { opacity: 1 } : { opacity: 0 }}
                          transition={{ duration: 0.3, delay: 0.78 + i * 0.18 }}
                        >{team}</motion.div>
                        {i < 2 && (
                          <motion.div
                            style={{ marginTop: 14, height: 1, background: "#111113", transformOrigin: "left", scaleX: 0 }}
                            initial={{ scaleX: 0 }}
                            animate={replayInView ? { scaleX: 1 } : { scaleX: 0 }}
                            transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1], delay: 0.82 + i * 0.18 }}
                          />
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div className="font-mono tracking-widest" style={{ fontSize: 8, color: "#2a2a2a", marginTop: 16 }}>Yas Marina · 2024</div>
              </motion.div>

              {/* FP3 — clips in from bottom after RACE card */}
              <motion.div
                {...cardHover}
                className="cursor-pointer"
                initial={{ opacity: 0, y: 12 }}
                animate={replayInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1], delay: 0.15 }}
                style={{ gridColumn: 2, gridRow: 1, backgroundColor: "#0F0F11", border: "1px solid #1a1a1c", padding: "16px 18px", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}
              >
                {/* Left border reveal on hover */}
                <motion.div
                  style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: "#E8001D", scaleY: 0, transformOrigin: "top" }}
                  whileHover={{ scaleY: 1 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                />
                {/* Label slams up */}
                <div style={{ overflow: "hidden", marginBottom: 10 }}>
                  <motion.div className="font-mono tracking-widest"
                    style={{ fontSize: 8, color: "#444", letterSpacing: "0.12em" }}
                    initial={{ y: "110%" }}
                    animate={replayInView ? { y: "0%" } : { y: "110%" }}
                    transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
                  >FP3</motion.div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {SESSION_OVERVIEW.fp3.map(({ pos, drv, time }, i) => (
                    <motion.div key={i} whileHover={{ x: 2 }}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "default" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <motion.span className="font-mono"
                          style={{ fontSize: 8, color: i === 0 ? "#E8001D" : "#333", minWidth: 16 }}
                          initial={{ opacity: 0 }}
                          animate={replayInView ? { opacity: 1 } : { opacity: 0 }}
                          transition={{ duration: 0.2, delay: 0.32 + i * 0.14 }}
                        >{pos}</motion.span>
                        <div style={{ overflow: "hidden" }}>
                          <motion.span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 13, color: i === 0 ? "#C8C8C2" : "#555", display: "block" }}
                            initial={{ y: "110%" }}
                            animate={replayInView ? { y: "0%" } : { y: "110%" }}
                            transition={{ duration: 0.32, ease: [0.76, 0, 0.24, 1], delay: 0.36 + i * 0.14 }}
                          >{drv}</motion.span>
                        </div>
                      </div>
                      {/* Lap time — slides in from right */}
                      <motion.span className="font-mono"
                        style={{ fontSize: 8, color: i === 0 ? "#555" : "#2a2a2a" }}
                        initial={{ opacity: 0, x: 8 }}
                        animate={replayInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 8 }}
                        transition={{ duration: 0.28, delay: 0.44 + i * 0.14 }}
                      >{time}</motion.span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* QUALIFYING — clips in from top, slightly later */}
              <motion.div
                {...cardHover}
                className="cursor-pointer"
                initial={{ opacity: 0, y: 12 }}
                animate={replayInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1], delay: 0.28 }}
                style={{ gridColumn: 2, gridRow: 2, backgroundColor: "#0F0F11", border: "1px solid #1a1a1c", padding: "16px 18px", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}
              >
                <motion.div
                  style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: "#E8001D", scaleY: 0, transformOrigin: "top" }}
                  whileHover={{ scaleY: 1 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                />
                <div style={{ overflow: "hidden", marginBottom: 10 }}>
                  <motion.div className="font-mono tracking-widest"
                    style={{ fontSize: 8, color: "#444", letterSpacing: "0.12em" }}
                    initial={{ y: "110%" }}
                    animate={replayInView ? { y: "0%" } : { y: "110%" }}
                    transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1], delay: 0.33 }}
                  >QUALIFYING</motion.div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {SESSION_OVERVIEW.qual.map(({ pos, drv, time }, i) => (
                    <motion.div key={i} whileHover={{ x: 2 }}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "default" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <motion.span className="font-mono"
                          style={{ fontSize: 8, color: i === 0 ? "#E8001D" : "#333", minWidth: 16 }}
                          initial={{ opacity: 0 }}
                          animate={replayInView ? { opacity: 1 } : { opacity: 0 }}
                          transition={{ duration: 0.2, delay: 0.46 + i * 0.14 }}
                        >{pos}</motion.span>
                        <div style={{ overflow: "hidden" }}>
                          <motion.span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 13, color: i === 0 ? "#C8C8C2" : "#555", display: "block" }}
                            initial={{ y: "110%" }}
                            animate={replayInView ? { y: "0%" } : { y: "110%" }}
                            transition={{ duration: 0.32, ease: [0.76, 0, 0.24, 1], delay: 0.5 + i * 0.14 }}
                          >{drv}</motion.span>
                        </div>
                      </div>
                      <motion.span className="font-mono"
                        style={{ fontSize: 8, color: i === 0 ? "#444" : "#2a2a2a" }}
                        initial={{ opacity: 0, x: 8 }}
                        animate={replayInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 8 }}
                        transition={{ duration: 0.28, delay: 0.58 + i * 0.14 }}
                      >{time}</motion.span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

            </div>
          </div>

          {/* Copy — RIGHT */}
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate={replayInView ? "visible" : "hidden"}
          >
            <RevealLabel inView={replayInView} delay={80}>
              {"SESSION REPLAY"}
            </RevealLabel>
            <RevealHeading
              style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(24px, 3vw, 36px)", color: "#E0E0DA", fontWeight: "normal", lineHeight: 1.15, marginBottom: 16 }}
            >Replay any session,<br /><em>frame by frame</em></RevealHeading>
            <RevealBody className="text-xs mb-7" style={{ color: "#555", lineHeight: 1.8, maxWidth: 340 }}>
              Load any race weekend and scrub through recorded telemetry — speed, throttle, brake, and DRS across every lap, every circuit, every season.
            </RevealBody>
            <Reveal>
              <SmartButton variant="secondary" onClick={() => setAuthOpen(true)}>
                Try Replay
              </SmartButton>
            </Reveal>
            <div className="mt-4 pt-3.5">
              <RevealLine />
              <motion.div className="flex gap-8 mt-3.5" variants={sectionVariants}>
                {[["Season", "2024"], ["Sessions", "FP1 · FP2 · FP3 · Q · R"], ["Telemetry", "FastF1"]].map(([k, v]) => (
                  <RevealStat key={k} label={k} value={v} />
                ))}
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* ── CTA ── */}
        <section ref={ctaRef} className="px-8 grid items-center gap-10"
          style={{ paddingTop: 96, paddingBottom: 96, background: "radial-gradient(ellipse at 50% 50%, rgba(232,0,29,0.06) 0%, transparent 60%), #0A0A0B", borderBottom: "1px solid #161618", gridTemplateColumns: "1fr auto 1fr" }}
        >
          <motion.div variants={sectionVariants} initial="hidden" animate={ctaInView ? "visible" : "hidden"}>
            <RevealHeading
              style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(28px, 4vw, 52px)", color: "#E0E0DA", letterSpacing: "-0.025em", fontWeight: "normal", lineHeight: 1.05 }}
            >One session —<br />infinite insights.<br /><em>/ Open it now.</em></RevealHeading>
          </motion.div>

          <motion.div variants={sectionVariants} initial="hidden" animate={ctaInView ? "visible" : "hidden"}>
            <Reveal>
              <div className="flex flex-col items-center">
                <motion.div className="w-px h-12 mb-4"
                  style={{ background: "#161618", transformOrigin: "top" }}
                  initial={{ scaleY: 0 }}
                  animate={ctaInView ? { scaleY: 1 } : { scaleY: 0 }}
                  transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
                />
                <div className="cta-glow-btn">
                  <SmartButton variant="primary" onClick={() => setAuthOpen(true)} style={{ fontSize: 13, padding: "12px 28px" }}>
                    Open Dashboard
                  </SmartButton>
                </div>
                <motion.div className="w-px h-12 mt-4"
                  style={{ background: "#161618", transformOrigin: "top" }}
                  initial={{ scaleY: 0 }}
                  animate={ctaInView ? { scaleY: 1 } : { scaleY: 0 }}
                  transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1], delay: 0.36 }}
                />
              </div>
            </Reveal>
          </motion.div>

          <motion.div variants={sectionVariants} initial="hidden" animate={ctaInView ? "visible" : "hidden"}
            className="flex justify-end"
          >
            <Reveal>
            <svg className="cta-orbit" viewBox="0 0 160 160" width="160" height="160">
              <defs>
                <path id="orbit-a" d="M108,80 A28,9 0 1,1 52,80 A28,9 0 1,1 108,80" />
                <path id="orbit-b" d="M122,80 A42,11 0 1,1 38,80 A42,11 0 1,1 122,80" />
                <path id="orbit-c" d="M136,80 A56,13 0 1,1 24,80 A56,13 0 1,1 136,80" />
              </defs>
              <circle cx="80" cy="80" r="64" fill="#0D0D0F" stroke="#1a1a1a" strokeWidth="1" />
              <g><animateTransform attributeName="transform" type="rotate" from="0 80 80" to="360 80 80" dur="18s" repeatCount="indefinite" />
                <use href="#orbit-a" fill="none" stroke="rgba(232,0,29,0.24)" strokeWidth="1.1" />
                <circle r="3.2" fill="#E8001D"><animateMotion dur="9.5s" repeatCount="indefinite" rotate="auto"><mpath href="#orbit-a" /></animateMotion></circle>
              </g>
              <g><animateTransform attributeName="transform" type="rotate" from="360 80 80" to="0 80 80" dur="24s" repeatCount="indefinite" />
                <use href="#orbit-b" fill="none" stroke="rgba(232,0,29,0.16)" strokeWidth="1" />
                <circle r="2" fill="#fff" opacity="0.5"><animateMotion dur="13.8s" repeatCount="indefinite" rotate="auto"><mpath href="#orbit-b" /></animateMotion></circle>
              </g>
              <g><animateTransform attributeName="transform" type="rotate" from="0 80 80" to="360 80 80" dur="30s" repeatCount="indefinite" />
                <use href="#orbit-c" fill="none" stroke="rgba(232,0,29,0.1)" strokeWidth="0.9" />
                <circle r="1.6" fill="#E8001D" opacity="0.5"><animateMotion dur="20s" repeatCount="indefinite" rotate="auto"><mpath href="#orbit-c" /></animateMotion></circle>
              </g>
              <circle cx="80" cy="80" r="5" fill="#E8001D" className="o-core" />
              <circle cx="80" cy="80" r="10" fill="none" stroke="#E8001D" strokeWidth="0.8" opacity="0.25" />
            </svg>
            </Reveal>
          </motion.div>
        </section>

        {/* ── FOOTER ── */}
        <footer ref={footerRef} className="px-8 py-7 flex justify-between items-center"
          style={{ background: "#0A0A0B", borderTop: "1px solid #111113" }}
        >
          <motion.div variants={bodyVariants} initial="hidden" animate={footerInView ? "visible" : "hidden"}>
            <div className="font-mono text-xs mb-0.5" style={{ color: "#2a2a2a" }}>A Race Intelligence Tool by Lumen</div>
            <div className="font-mono text-[11px]" style={{ color: "#1e1e1e" }}>Lumen — All rights reserved.</div>
          </motion.div>
          <motion.div variants={ctaVariants} initial="hidden" animate={footerInView ? "visible" : "hidden"}>
            <div className="flex gap-7">
              {[["Standings", standingsRef], ["Calendar", calendarRef], ["Replay", replayRef]].map(([label, ref]) => (
                <NavLink key={label} label={label} scrollRef={ref} activeNav={activeNav} onNav={scrollTo} />
              ))}
            </div>
          </motion.div>
        </footer>

        {/* ── WORDMARK ── */}
        <div className="text-center pb-4" style={{ background: "#0A0A0B", overflow: "hidden" }}>
          <div style={{ overflow: "hidden" }}>
            <motion.div className="font-normal select-none leading-none"
              initial={{ y: "100%", opacity: 0 }}
              animate={footerInView ? { y: "0%", opacity: 1 } : { y: "100%", opacity: 0 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
              style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(48px, 16vw, 160px)", color: "#0D0D0E", letterSpacing: "-0.03em" }}
              whileHover={{ color: "#111115", letterSpacing: "-0.02em" }}
            >Lumen</motion.div>
          </div>
        </div>

      </div>
    </div>
  );
}