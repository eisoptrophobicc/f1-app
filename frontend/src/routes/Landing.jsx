import { useEffect, useState } from "react";

const NAV_LEFT = ["Standings", "Calendar"];
const GALLERY_TABS = ["Overview", "Drivers", "Constructors", "Momentum"];
const FILTER_TABS = ["Replay", "Standings", "Calendar", "Sessions"];

const SESSIONS = [
  {
    id: 1,
    sub: "Drivers Leader",
    label: "Max Verstappen",
    badge: "P1",
    value: "331",
    unit: "pts",
    delta: "+44 gap",
    spark: [30, 34, 38, 44, 42, 48, 54, 58],
    stats: [
      ["Wins", "9"],
      ["Podiums", "14"],
      ["Gap", "+44"],
      ["Team", "RBR"],
    ],
  },
  {
    id: 2,
    sub: "Constructors P1",
    label: "McLaren",
    badge: "P1",
    value: "568",
    unit: "pts",
    delta: "+36 lead",
    spark: [24, 30, 36, 39, 46, 52, 57, 64],
    stats: [
      ["Wins", "11"],
      ["Podiums", "22"],
      ["Lead", "+36"],
      ["Lineup", "NOR / PIA"],
    ],
  },
  {
    id: 3,
    sub: "Momentum Watch",
    label: "Lando Norris",
    badge: "+18",
    value: "287",
    unit: "pts",
    delta: "last 5 up",
    spark: [18, 21, 26, 24, 32, 36, 42, 47],
    stats: [
      ["Last 5", "102"],
      ["Wins", "4"],
      ["Average", "20.4"],
      ["Trend", "Up"],
    ],
  },
  {
    id: 4,
    sub: "Gap Projection",
    label: "Ferrari",
    badge: "P2",
    value: "532",
    unit: "pts",
    delta: "closing",
    spark: [28, 29, 31, 34, 38, 37, 41, 45],
    stats: [
      ["Gap", "-36"],
      ["Wins", "5"],
      ["Podiums", "17"],
      ["Trend", "Stable"],
    ],
  },
  {
    id: 5,
    sub: "Drivers P2",
    label: "Oscar Piastri",
    badge: "P2",
    value: "287",
    unit: "pts",
    delta: "steady gain",
    spark: [20, 22, 25, 29, 33, 35, 39, 43],
    stats: [
      ["Wins", "4"],
      ["Podiums", "10"],
      ["Poles", "3"],
      ["Team", "MCL"],
    ],
  },
  {
    id: 6,
    sub: "Constructor Form",
    label: "Mercedes",
    badge: "P3",
    value: "418",
    unit: "pts",
    delta: "rising",
    spark: [16, 18, 20, 24, 27, 31, 34, 39],
    stats: [
      ["Last 3", "54"],
      ["Podiums", "9"],
      ["Gap", "-114"],
      ["Trend", "Rising"],
    ],
  },
];

function SessionCard({ session, motionStyle }) {
  const [hovered, setHovered] = useState(false);
  const sparkMin = Math.min(...session.spark);
  const sparkMax = Math.max(...session.spark);
  const sparkRange = Math.max(1, sparkMax - sparkMin);
  const sparkPath = `M ${session.spark
    .map((y, x) => {
      const normalized = (y - sparkMin) / sparkRange;
      const plottedY = 82 - normalized * 44;
      return `${x * 31},${plottedY}`;
    })
    .join(" L ")}`;
  return (
    <div
      className="session-card reveal-up"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        "--card-delay": `${session.id * 90}ms`,
        background: hovered ? "#161618" : "#111113",
        aspectRatio: "1 / 1",
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        transition: "background 0.2s",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "20px",
        border: "1px solid #1e1e20",
        ...motionStyle(session.id * 90),
      }}
    >
      <div className="session-card-head" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "22px" }}>
        <div className="session-card-copy">
          <div className="card-subline" style={{ fontSize: "10px", color: "#555", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", marginBottom: "8px" }}>{session.sub}</div>
          <div className="card-title" style={{ fontSize: "13px", fontWeight: 400, color: "#C8C8C2", fontFamily: "'Instrument Serif', serif", marginBottom: "14px" }}>{session.label}</div>
          <div className="card-value-row" style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span style={{ fontSize: "36px", lineHeight: 1, color: "#E8E8E2", fontFamily: "'DM Mono', monospace", letterSpacing: "-0.04em" }}>{session.value}</span>
            <span style={{ fontSize: "11px", color: "#666", fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em" }}>{session.unit}</span>
          </div>
        </div>
        <div className="card-badge" style={{
          minWidth: "48px",
          height: "48px",
          borderRadius: "12px",
          border: "1px solid #2a2a2d",
          background: hovered ? "#1B1B1E" : "#141416",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#E8001D",
          fontFamily: "'DM Mono', monospace",
          fontSize: "12px",
          letterSpacing: "0.08em",
        }}>
          {session.badge}
        </div>
      </div>
      <div className="card-signal-panel" style={{
        marginBottom: "16px",
        background: "#0D0D0F",
        border: "1px solid #1A1A1D",
        padding: "12px 12px 12px",
        minHeight: "148px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <span style={{ fontSize: "9px", color: "#555", fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em" }}>FORM SIGNAL</span>
          <span style={{ fontSize: "9px", color: "#E8001D", fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em", display: "inline-flex", alignItems: "center", gap: "5px" }}>
            <span style={{ fontSize: "11px", lineHeight: 1 }}>↗</span>
            {session.delta}
          </span>
        </div>
        <svg className="card-signal-graph" viewBox="0 0 220 104" preserveAspectRatio="none" style={{ width: "100%", height: "102px", display: "block", flex: 1 }}>
          <line x1="0" y1="82" x2="220" y2="82" stroke="#161618" strokeWidth="1" />
          <path
            d={sparkPath}
            fill="none"
            stroke="#E8001D"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="card-signal-line"
          />
          <path
            d={`${sparkPath} L 217,82 L 0,82 Z`}
            fill={`url(#cardGlow-${session.id})`}
            opacity="0.28"
            className="card-signal-fill"
          />
          <path
            d={sparkPath}
            fill="none"
            stroke="#FF4D67"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.16"
            className="card-signal-trace"
          />
          <g>
            <circle r="6.4" fill="rgba(232,0,29,0.14)" filter={`url(#cardSignalGlow-${session.id})`}>
              <animateMotion
                dur={`${5.8 + session.id * 0.45}s`}
                repeatCount="indefinite"
                calcMode="linear"
                keyTimes="0;1"
                keyPoints="0;1"
                path={sparkPath}
              />
            </circle>
            <circle r="2.7" fill="#FF3B52">
              <animateMotion
                dur={`${5.8 + session.id * 0.45}s`}
                repeatCount="indefinite"
                calcMode="linear"
                keyTimes="0;1"
                keyPoints="0;1"
                path={sparkPath}
              />
            </circle>
          </g>
          <defs>
            <linearGradient id={`cardGlow-${session.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E8001D" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#E8001D" stopOpacity="0" />
            </linearGradient>
            <filter id={`cardSignalGlow-${session.id}`} x="-120%" y="-120%" width="340%" height="340%">
              <feGaussianBlur stdDeviation="2.4" />
            </filter>
          </defs>
        </svg>
      </div>
      <div className="session-card-stats" style={{
        marginTop: "0",
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "10px",
      }}>
        {session.stats.map(([key, val]) => (
          <div key={key} className="stat-tile" style={{
            background: "#0D0D0F",
            border: "1px solid #1A1A1D",
            padding: "10px 12px",
            minHeight: "58px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}>
            <span style={{ fontSize: "9px", color: "#555", fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em" }}>{key}</span>
            <span style={{ fontSize: "15px", color: "#E0E0DA", fontFamily: "'DM Mono', monospace", letterSpacing: "-0.02em" }}>{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Landing() {
  const [activeFilter, setActiveFilter] = useState("Replay");
  const [activeGallery, setActiveGallery] = useState("Overview");
  const [animationsReady, setAnimationsReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setAnimationsReady(true), 80);
    return () => window.clearTimeout(timer);
  }, []);

  const motionStyle = (delay = 0) => (
    animationsReady
      ? { animation: `revealUp 780ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms both` }
      : { opacity: 0, transform: "translateY(18px)" }
  );

  return (
    <div data-motion-ready={animationsReady ? "true" : "false"}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500&family=DM+Mono:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body {
          background: #0A0A0B;
          color: #888;
          font-family: 'Geist', sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        .nav-link {
          background: none; border: none; cursor: pointer;
          font-family: 'Geist', sans-serif; font-size: 12px;
          color: #555; letter-spacing: 0.01em; padding: 0;
          transition: color 0.15s;
        }
        .nav-link:hover { color: #C8C8C2; }

        .filter-tab {
          background: none; border: none; cursor: pointer;
          font-family: 'Geist', sans-serif; font-size: 12px;
          color: #555; padding: 0; transition: color 0.15s;
        }
        .filter-tab.active { color: #E0E0DA; font-weight: 500; }
        .filter-tab:hover { color: #C8C8C2; }

        .cta-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: #E0E0DA; color: #0A0A0B; border: none;
          padding: 10px 18px;
          font-family: 'Geist', sans-serif; font-size: 12px; font-weight: 500;
          cursor: pointer; transition: background 0.2s; white-space: nowrap;
        }
        .cta-btn:hover { background: #fff; }

        .cta-btn-ghost {
          display: inline-flex; align-items: center; gap: 6px;
          background: transparent; color: #C8C8C2;
          border: 1px solid rgba(255,255,255,0.15);
          padding: 9px 16px;
          font-family: 'Geist', sans-serif; font-size: 11px; font-weight: 500;
          cursor: pointer; transition: border-color 0.2s, color 0.2s;
        }
        .cta-btn-ghost:hover { border-color: rgba(255,255,255,0.4); color: #E0E0DA; }

        .cta-btn-red {
          display: inline-flex; align-items: center; gap: 6px;
          background: #E8001D; color: #fff; border: none;
          padding: 12px 28px; border-radius: 3px;
          font-family: 'Geist', sans-serif; font-size: 13px; font-weight: 500;
          cursor: pointer; transition: background 0.2s;
        }
        .cta-btn-red:hover { background: #c4001a; }

        .gallery-tab {
          background: none; border: none; cursor: pointer;
          font-family: 'Geist', sans-serif; font-size: 12px;
          color: #555; padding: 0; transition: color 0.15s;
        }
        .gallery-tab.active { color: #E0E0DA; font-weight: 500; }
        .gallery-tab:hover { color: #C8C8C2; }

        .checklist-item {
          display: flex; align-items: center; gap: 10px;
          font-size: 12px; color: #666;
          padding: 7px 0; border-bottom: 1px solid #161618;
        }
        .checklist-item:last-child { border-bottom: none; }

        .pill {
          display: inline-block;
          border: 1px solid #2a2a2a;
          border-radius: 999px;
          padding: 3px 12px;
          font-size: 11px;
          color: #555;
          font-family: 'DM Mono', monospace;
        }

        .surface-glow {
          position: relative;
          isolation: isolate;
          overflow: hidden;
        }

        .surface-glow::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background:
            radial-gradient(circle at 18% 30%, rgba(232,0,29,0.035), transparent 32%),
            radial-gradient(circle at 78% 18%, rgba(255,255,255,0.015), transparent 22%),
            linear-gradient(180deg, rgba(255,255,255,0.006) 0%, rgba(255,255,255,0) 100%);
          opacity: 0.9;
        }

        .surface-glow::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          opacity: 0.022;
          mix-blend-mode: screen;
          background-image:
            radial-gradient(rgba(255,255,255,0.05) 0.5px, transparent 0.5px),
            radial-gradient(rgba(232,0,29,0.02) 0.35px, transparent 0.35px);
          background-size: 7px 7px, 11px 11px;
          background-position: 0 0, 3px 4px;
        }

        .surface-glow > * {
          position: relative;
          z-index: 1;
        }

        .surface-glow-soft::before {
          background:
            radial-gradient(circle at 18% 34%, rgba(232,0,29,0.012), transparent 38%),
            radial-gradient(circle at 82% 14%, rgba(255,255,255,0.01), transparent 20%),
            linear-gradient(180deg, rgba(255,255,255,0.005) 0%, rgba(255,255,255,0) 100%);
        }

        .surface-glow-soft::after {
          opacity: 0.012;
        }

        @keyframes revealUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes softFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 0 rgba(232, 0, 29, 0);
          }
          50% {
            box-shadow: 0 0 18px rgba(232, 0, 29, 0.08);
          }
        }

        @keyframes fieldPulse {
          0%, 100% {
            transform: scale(1) translateY(0px);
            opacity: 0.72;
          }
          50% {
            transform: scale(1.018) translateY(-2px);
            opacity: 0.94;
          }
        }

        @keyframes pathDriftA {
          0%, 100% {
            transform: translate3d(0px, 0px, 0px);
          }
          50% {
            transform: translate3d(0px, -3px, 0px);
          }
        }

        @keyframes pathDriftB {
          0%, 100% {
            transform: translate3d(0px, 0px, 0px);
          }
          50% {
            transform: translate3d(2px, 2px, 0px);
          }
        }

        @keyframes orbitSpin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes orbitPulse {
          0%, 100% {
            opacity: 0.75;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.03);
          }
        }

        @keyframes traceFlow {
          from {
            stroke-dashoffset: 0;
          }
          to {
            stroke-dashoffset: calc(-1 * var(--trace-cycle, 30));
          }
        }

        @keyframes stripeBreathe {
          0%, 100% {
            opacity: 0.22;
            transform: translateY(0px);
          }
          50% {
            opacity: 0.5;
            transform: translateY(-4px);
          }
        }

        @keyframes cloudDrift {
          0%, 100% {
            transform: translate3d(0px, 0px, 0px) scale(1);
            opacity: 0.18;
          }
          50% {
            transform: translate3d(3px, -4px, 0px) scale(1.05);
            opacity: 0.32;
          }
        }

        @keyframes shellPrecess {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes electronJitter {
          0%, 100% {
            transform: scale(1) translateY(0px);
            opacity: 0.72;
          }
          50% {
            transform: scale(1.18) translateY(-1px);
            opacity: 1;
          }
        }

        @keyframes replayHexPulse {
          0%, 100% {
            opacity: 0.42;
            transform: translateY(0px);
          }
          50% {
            opacity: 0.82;
            transform: translateY(-2px);
          }
        }

        @keyframes kalmanPanelGlow {
          0%, 100% {
            opacity: 0.75;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes premiumSignalGlow {
          0%, 100% {
            opacity: 0.18;
            filter: blur(2px);
          }
          50% {
            opacity: 0.34;
            filter: blur(4px);
          }
        }

        @keyframes premiumSignalFill {
          0%, 100% {
            opacity: 0.16;
          }
          50% {
            opacity: 0.26;
          }
        }

        .reveal-up {
          opacity: 0;
        }

        [data-motion-ready="true"] .reveal-up {
          animation: revealUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .soft-float {
          transform: translateY(0px);
        }

        [data-motion-ready="true"] .soft-float {
          animation: softFloat 7s ease-in-out infinite;
        }

        .session-card {
          transition: transform 0.25s ease, border-color 0.25s ease, background 0.2s;
        }

        .session-card:hover {
          transform: translateY(-4px);
          border-color: #2A2A2D;
        }

        .stat-tile {
          transition: transform 0.25s ease, border-color 0.25s ease, background 0.25s ease;
        }

        .session-card:hover .stat-tile {
          transform: translateY(-1px);
          border-color: #26262A;
          background: #101013;
        }

        [data-motion-ready="true"] .pulse-glow {
          animation: pulseGlow 4.5s ease-in-out infinite;
        }

        .field-shape-svg path,
        .field-shape-svg circle {
          transform-box: fill-box;
          transform-origin: center;
        }

        [data-motion-ready="true"] .field-shape-card {
          animation: pulseGlow 6s ease-in-out infinite;
        }

        [data-motion-ready="true"] .field-shape-svg {
          animation: fieldPulse 7s ease-in-out infinite;
        }

        [data-motion-ready="true"] .field-shape-svg .shape-a {
          animation: pathDriftA 6.5s ease-in-out infinite;
          stroke-dasharray: 18 14;
          animation-name: pathDriftA, traceFlow;
          animation-duration: 6.5s, 4.8s;
          animation-timing-function: ease-in-out, linear;
          animation-iteration-count: infinite, infinite;
        }

        [data-motion-ready="true"] .field-shape-svg .shape-b {
          animation: pathDriftB 7.2s ease-in-out infinite;
        }

        [data-motion-ready="true"] .field-shape-svg .shape-c {
          animation: pathDriftA 8.2s ease-in-out infinite reverse;
        }

        [data-motion-ready="true"] .field-shape-svg .field-dot {
          animation: orbitPulse 4.8s ease-in-out infinite;
        }

        .cta-orbit {
          transform-origin: 50% 50%;
        }

        [data-motion-ready="true"] .cta-orbit {
          animation: revealUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) 460ms both;
        }

        [data-motion-ready="true"] .cta-orbit .quantum-shell {
          transform-box: fill-box;
          transform-origin: center;
          animation: shellPrecess 28s linear infinite;
        }

        [data-motion-ready="true"] .cta-orbit .quantum-shell.shell-b {
          animation-duration: 36s;
          animation-direction: reverse;
        }

        [data-motion-ready="true"] .cta-orbit .quantum-shell.shell-c {
          animation-duration: 44s;
        }

        [data-motion-ready="true"] .cta-orbit .quantum-shell.shell-d {
          animation-duration: 24s;
          animation-direction: reverse;
        }

        [data-motion-ready="true"] .cta-orbit .quantum-shell.shell-e {
          animation-duration: 31s;
        }

        [data-motion-ready="true"] .cta-orbit .quantum-shell.shell-f {
          animation-duration: 18s;
          animation-direction: reverse;
        }

        [data-motion-ready="true"] .cta-orbit .electron-cloud {
          transform-box: fill-box;
          transform-origin: center;
          animation: cloudDrift 8s ease-in-out infinite;
        }

        [data-motion-ready="true"] .cta-orbit .electron-cloud.cloud-b {
          animation-duration: 11s;
          animation-direction: reverse;
        }

        [data-motion-ready="true"] .cta-orbit .electron-cloud.cloud-c {
          animation-duration: 13s;
        }

        [data-motion-ready="true"] .cta-orbit .orbit-core {
          animation: orbitPulse 5.2s ease-in-out infinite;
        }

        [data-motion-ready="true"] .cta-orbit .quantum-electron {
          animation: electronJitter 3.8s ease-in-out infinite;
        }

        [data-motion-ready="true"] .replay-stripe-field .stripe-line {
          animation: stripeBreathe 6.6s ease-in-out infinite;
        }

        [data-motion-ready="true"] .replay-stripe-field .stripe-line:nth-child(2n) {
          animation-duration: 8.2s;
        }

        [data-motion-ready="true"] .replay-stripe-field .stripe-line:nth-child(3n) {
          animation-duration: 9.4s;
        }

        [data-motion-ready="true"] .telemetry-graph .telemetry-line {
          --trace-cycle: 30;
          stroke-dasharray: 18 12;
          stroke-dashoffset: 0;
          animation: traceFlow 2.6s linear infinite;
        }

        [data-motion-ready="true"] .telemetry-graph .telemetry-line.telemetry-secondary {
          --trace-cycle: 26;
          stroke-dasharray: 12 14;
          animation-duration: 3.8s;
        }

        [data-motion-ready="true"] .telemetry-graph .telemetry-line.telemetry-tertiary {
          --trace-cycle: 28;
          stroke-dasharray: 10 18;
          animation-duration: 5.2s;
        }

        [data-motion-ready="true"] .telemetry-graph .telemetry-flow {
          --trace-cycle: 56;
          stroke-dasharray: 10 46;
          stroke-dashoffset: 0;
          animation: traceFlow 1.8s linear infinite;
        }

        [data-motion-ready="true"] .telemetry-graph .telemetry-flow.telemetry-secondary {
          --trace-cycle: 64;
          stroke-dasharray: 8 56;
          animation-duration: 2.8s;
        }

        [data-motion-ready="true"] .telemetry-graph .telemetry-flow.telemetry-tertiary {
          --trace-cycle: 72;
          stroke-dasharray: 8 64;
          animation-duration: 3.6s;
        }

        [data-motion-ready="true"] .card-signal-panel {
          box-shadow: inset 0 0 0 rgba(232,0,29,0);
        }

        [data-motion-ready="true"] .card-signal-graph .card-signal-fill {
          animation: premiumSignalFill 9.2s ease-in-out infinite;
        }

        [data-motion-ready="true"] .card-signal-graph .card-signal-trace {
          animation: premiumSignalGlow 11.6s ease-in-out infinite;
        }

        [data-motion-ready="true"] .replay-hex-stack .hex-shell,
        [data-motion-ready="true"] .replay-hex-stack .hex-cloud {
          transform-box: fill-box;
          transform-origin: center;
          animation: replayHexPulse 7s ease-in-out infinite;
        }

        [data-motion-ready="true"] .replay-hex-stack {
          filter: drop-shadow(0 0 18px rgba(232,0,29,0.2));
        }

        [data-motion-ready="true"] .replay-hex-stack .hex-cloud {
          animation-duration: 9.4s;
          opacity: 1;
        }

        [data-motion-ready="true"] .replay-hex-stack .hex-cloud.cloud-b {
          animation-duration: 11.2s;
          animation-direction: reverse;
        }

        [data-motion-ready="true"] .replay-hex-stack .hex-shell.shell-b { animation-delay: 220ms; }
        [data-motion-ready="true"] .replay-hex-stack .hex-shell.shell-c { animation-delay: 440ms; }

        [data-motion-ready="true"] .replay-hex-stack .hex-beam {
          stroke-dasharray: 10 14;
          animation: traceFlow 4.8s linear infinite;
        }

        [data-motion-ready="true"] .replay-hex-stack .hex-core {
          animation: orbitPulse 5.6s ease-in-out infinite;
        }

        [data-motion-ready="true"] .kalman-visual .state-halo,
        [data-motion-ready="true"] .kalman-visual .state-ring {
          animation: orbitPulse 6.2s ease-in-out infinite;
          transform-box: fill-box;
          transform-origin: center;
        }

        [data-motion-ready="true"] .kalman-visual .state-panel {
          animation: kalmanPanelGlow 6.8s ease-in-out infinite;
        }

        [data-motion-ready="true"] .kalman-visual .panel-line {
          stroke-dasharray: 12 12;
          animation: traceFlow 3.2s linear infinite;
        }

        .landing-nav > div > *,
        .hero-copy > *,
        .hero-side > *,
        .filter-group > *,
        .feature-copy > *,
        .feature-visual-stack > *,
        .feature-list > *,
        .snapshot-card > *,
        .banner-copy > *,
        .banner-meta > *,
        .gallery-header > *,
        .gallery-tabs > *,
        .cta-copy > *,
        .cta-center > *,
        .footer-copy > *,
        .footer-links > *,
        .watermark > *,
        .session-card-head > *,
          .session-card-copy > *,
          .session-card-stats > * {
          opacity: 0;
        }

        [data-motion-ready="true"] .landing-nav > div > *,
        [data-motion-ready="true"] .hero-copy > *,
        [data-motion-ready="true"] .hero-side > *,
        [data-motion-ready="true"] .filter-group > *,
        [data-motion-ready="true"] .feature-copy > *,
        [data-motion-ready="true"] .feature-visual-stack > *,
        [data-motion-ready="true"] .feature-list > *,
        [data-motion-ready="true"] .snapshot-card > *,
        [data-motion-ready="true"] .banner-copy > *,
        [data-motion-ready="true"] .banner-meta > *,
        [data-motion-ready="true"] .gallery-header > *,
        [data-motion-ready="true"] .gallery-tabs > *,
        [data-motion-ready="true"] .cta-copy > *,
        [data-motion-ready="true"] .cta-center > *,
        [data-motion-ready="true"] .footer-copy > *,
        [data-motion-ready="true"] .footer-links > *,
        [data-motion-ready="true"] .watermark > *,
        [data-motion-ready="true"] .session-card-head > *,
        [data-motion-ready="true"] .session-card-copy > *,
        [data-motion-ready="true"] .session-card-stats > * {
          animation: revealUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        [data-motion-ready="true"] .landing-nav > div:first-child > *:nth-child(1) { animation-delay: 80ms; }
        [data-motion-ready="true"] .landing-nav > div:first-child > *:nth-child(2) { animation-delay: 140ms; }
        [data-motion-ready="true"] .landing-nav .brand-title { animation-delay: 120ms; }
        [data-motion-ready="true"] .landing-nav .brand-subtitle { animation-delay: 180ms; }
        [data-motion-ready="true"] .landing-nav > div:last-child > *:nth-child(1) { animation-delay: 160ms; }
        [data-motion-ready="true"] .landing-nav > div:last-child > *:nth-child(2) { animation-delay: 220ms; }

        [data-motion-ready="true"] .hero-copy > *:nth-child(1) { animation-delay: 180ms; }
        [data-motion-ready="true"] .hero-side > *:nth-child(1) { animation-delay: 260ms; }
        [data-motion-ready="true"] .hero-side > *:nth-child(2) { animation-delay: 340ms; }

        [data-motion-ready="true"] .filter-group > *:nth-child(1) { animation-delay: 220ms; }
        [data-motion-ready="true"] .filter-group > *:nth-child(2) { animation-delay: 270ms; }
        [data-motion-ready="true"] .filter-group > *:nth-child(3) { animation-delay: 320ms; }
        [data-motion-ready="true"] .filter-group > *:nth-child(4) { animation-delay: 370ms; }
        .filter-stamp { opacity: 0; }
        [data-motion-ready="true"] .filter-stamp { animation: revealUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) 420ms both; }

        [data-motion-ready="true"] .telemetry-panel > *:nth-child(1) { animation-delay: 260ms; }
        [data-motion-ready="true"] .telemetry-panel > *:nth-child(2) { animation-delay: 320ms; }
        [data-motion-ready="true"] .telemetry-panel > *:nth-child(3) { animation-delay: 380ms; }
        [data-motion-ready="true"] .telemetry-panel > *:nth-child(4) { animation-delay: 440ms; }

        [data-motion-ready="true"] .replay-panel > *:nth-child(1) { animation-delay: 300ms; }
        [data-motion-ready="true"] .replay-panel > *:nth-child(2) { animation-delay: 360ms; }
        [data-motion-ready="true"] .replay-panel > *:nth-child(3) { animation-delay: 430ms; }
        [data-motion-ready="true"] .replay-panel-copy > *:nth-child(1) { animation-delay: 420ms; }
        [data-motion-ready="true"] .replay-panel-copy > *:nth-child(2) { animation-delay: 500ms; }

        [data-motion-ready="true"] .feature-copy > *:nth-child(1) { animation-delay: 300ms; }
        [data-motion-ready="true"] .feature-copy > *:nth-child(2) { animation-delay: 360ms; }
        [data-motion-ready="true"] .feature-copy > *:nth-child(3) { animation-delay: 430ms; }
        [data-motion-ready="true"] .feature-copy > *:nth-child(4) { animation-delay: 500ms; }
        [data-motion-ready="true"] .feature-visual-stack > *:nth-child(1) { animation-delay: 380ms; }
        [data-motion-ready="true"] .feature-visual-stack > *:nth-child(2) { animation-delay: 460ms; }
        [data-motion-ready="true"] .feature-list > *:nth-child(1) { animation-delay: 420ms; }
        [data-motion-ready="true"] .feature-list > *:nth-child(2) { animation-delay: 470ms; }
        [data-motion-ready="true"] .feature-list > *:nth-child(3) { animation-delay: 520ms; }
        [data-motion-ready="true"] .snapshot-card > *:nth-child(1) { animation-delay: 540ms; }
        [data-motion-ready="true"] .snapshot-card > *:nth-child(2) { animation-delay: 590ms; }
        [data-motion-ready="true"] .snapshot-card > *:nth-child(3) { animation-delay: 640ms; }
        [data-motion-ready="true"] .snapshot-card > *:nth-child(4) { animation-delay: 690ms; }

        [data-motion-ready="true"] .banner-copy > *:nth-child(1) { animation-delay: 240ms; }
        [data-motion-ready="true"] .banner-copy > *:nth-child(2) { animation-delay: 320ms; }
        [data-motion-ready="true"] .banner-meta > *:nth-child(1) { animation-delay: 300ms; }
        [data-motion-ready="true"] .banner-meta > *:nth-child(2) { animation-delay: 360ms; }
        .banner-note { opacity: 0; }
        [data-motion-ready="true"] .banner-note { animation: revealUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) 440ms both; }

        [data-motion-ready="true"] .gallery-header > *:nth-child(1) { animation-delay: 280ms; }
        [data-motion-ready="true"] .gallery-header > *:nth-child(2) { animation-delay: 340ms; }
        [data-motion-ready="true"] .gallery-tabs > *:nth-child(1) { animation-delay: 360ms; }
        [data-motion-ready="true"] .gallery-tabs > *:nth-child(2) { animation-delay: 410ms; }
        [data-motion-ready="true"] .gallery-tabs > *:nth-child(3) { animation-delay: 460ms; }
        [data-motion-ready="true"] .gallery-tabs > *:nth-child(4) { animation-delay: 510ms; }

        [data-motion-ready="true"] .cta-copy > *:nth-child(1) { animation-delay: 260ms; }
        [data-motion-ready="true"] .cta-copy > *:nth-child(2) { animation-delay: 330ms; }
        [data-motion-ready="true"] .cta-copy > *:nth-child(3) { animation-delay: 400ms; }
        [data-motion-ready="true"] .cta-center > *:nth-child(1) { animation-delay: 340ms; }
        [data-motion-ready="true"] .cta-center > *:nth-child(2) { animation-delay: 420ms; }
        [data-motion-ready="true"] .cta-center > *:nth-child(3) { animation-delay: 500ms; }
        .cta-orbit { opacity: 0; }

        [data-motion-ready="true"] .footer-copy > *:nth-child(1) { animation-delay: 180ms; }
        [data-motion-ready="true"] .footer-copy > *:nth-child(2) { animation-delay: 240ms; }
        [data-motion-ready="true"] .footer-links > *:nth-child(1) { animation-delay: 220ms; }
        [data-motion-ready="true"] .footer-links > *:nth-child(2) { animation-delay: 270ms; }
        [data-motion-ready="true"] .footer-links > *:nth-child(3) { animation-delay: 320ms; }
        [data-motion-ready="true"] .footer-links > *:nth-child(4) { animation-delay: 370ms; }
        [data-motion-ready="true"] .watermark > * { animation-delay: 320ms; }

        [data-motion-ready="true"] .session-card-head > *:nth-child(1) { animation-delay: calc(var(--card-delay, 0ms) + 70ms); }
        [data-motion-ready="true"] .session-card-head > *:nth-child(2) { animation-delay: calc(var(--card-delay, 0ms) + 120ms); }
        [data-motion-ready="true"] .session-card-copy > *:nth-child(1) { animation-delay: calc(var(--card-delay, 0ms) + 90ms); }
        [data-motion-ready="true"] .session-card-copy > *:nth-child(2) { animation-delay: calc(var(--card-delay, 0ms) + 130ms); }
        [data-motion-ready="true"] .session-card-copy > *:nth-child(3) { animation-delay: calc(var(--card-delay, 0ms) + 170ms); }
        [data-motion-ready="true"] .session-card-stats > *:nth-child(1) { animation-delay: calc(var(--card-delay, 0ms) + 220ms); }
        [data-motion-ready="true"] .session-card-stats > *:nth-child(2) { animation-delay: calc(var(--card-delay, 0ms) + 260ms); }
        [data-motion-ready="true"] .session-card-stats > *:nth-child(3) { animation-delay: calc(var(--card-delay, 0ms) + 300ms); }
        [data-motion-ready="true"] .session-card-stats > *:nth-child(4) { animation-delay: calc(var(--card-delay, 0ms) + 340ms); }

        @media (prefers-reduced-motion: reduce) {
          .reveal-up,
          .soft-float,
          .pulse-glow,
          .landing-nav > div > *,
          .hero-copy > *,
          .hero-side > *,
          .filter-group > *,
          .feature-copy > *,
          .feature-visual-stack > *,
          .feature-list > *,
          .snapshot-card > *,
          .banner-copy > *,
          .banner-meta > *,
          .gallery-header > *,
          .gallery-tabs > *,
          .cta-copy > *,
          .cta-center > *,
          .footer-copy > *,
          .footer-links > *,
          .watermark > *,
          .session-card-head > *,
          .session-card-copy > *,
          .session-card-stats > * {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      <div style={{ position: "relative", zIndex: 1 }}>
      <nav className="landing-nav" style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px", height: "48px",
        borderBottom: "1px solid #161618",
        position: "sticky", top: 0, background: "#0A0A0B", zIndex: 100,
      }}>
        <div style={{ display: "flex", gap: "28px", flex: 1 }}>
          {NAV_LEFT.map((l) => <button key={l} className="nav-link">{"-> "}{l}</button>)}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
          <span className="brand-title" style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: "16px", letterSpacing: "-0.01em", lineHeight: 1, color: "#E0E0DA", ...motionStyle(120) }}>Lumen</span>
          <span className="brand-subtitle" style={{ fontFamily: "'DM Mono', monospace", fontSize: "7px", letterSpacing: "0.2em", color: "#333", textTransform: "uppercase", ...motionStyle(180) }}>Formula One Analytics</span>
        </div>
        <div style={{ display: "flex", gap: "28px", alignItems: "center", flex: 1, justifyContent: "flex-end" }}>
          <button className="nav-link">Sessions</button>
          <button className="cta-btn" style={{ padding: "7px 16px", fontSize: "11px" }}>{"Sign In ->"}</button>
        </div>
      </nav>

      <section className="surface-glow" style={{
        padding: "48px 32px 40px",
        display: "grid", gridTemplateColumns: "1fr 300px",
        gap: "40px", alignItems: "start",
        borderBottom: "1px solid #161618",
        background: "radial-gradient(circle at 14% 24%, rgba(232,0,29,0.08), transparent 28%), linear-gradient(180deg, #0C0C0D 0%, #0A0A0B 100%)",
      }}>
        <div className="hero-copy">
        <h1 className="reveal-up" style={{
          fontFamily: "'Instrument Serif', serif", fontWeight: 400,
          fontSize: "clamp(36px, 5vw, 60px)", lineHeight: 1.06,
          letterSpacing: "-0.02em", color: "#E8E8E2", maxWidth: "600px",
          animationDelay: "80ms",
        }}>
          Standings, Calendars, and Telemetry Replay - Every Season, Every Circuit
        </h1>
        </div>
        <div className="hero-side" style={{ paddingTop: "6px" }}>
          <p style={{ fontSize: "13px", color: "#666", lineHeight: 1.75, marginBottom: "22px" }}>
            Driver standings, race calendars, session overviews, and animated telemetry replay - all in one place, powered by FastF1.
          </p>
          <button className="cta-btn">{"Open Dashboard ->"}</button>
        </div>
      </section>

      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px", height: "40px",
        borderBottom: "1px solid #161618", background: "#0A0A0B",
      }}>
        <div className="filter-group" style={{ display: "flex", gap: "28px" }}>
          {FILTER_TABS.map((t) => (
            <button key={t} className={`filter-tab${activeFilter === t ? " active" : ""}`}
              onClick={() => setActiveFilter(t)}>{t}</button>
          ))}
        </div>
        <span className="filter-stamp" style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "#333", letterSpacing: "0.1em" }}>ALL SEASONS . ALL CIRCUITS</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", height: "360px" }}>
        <div className="telemetry-panel reveal-up" style={{
          background: "radial-gradient(circle at 18% 24%, rgba(232,0,29,0.06), transparent 28%), linear-gradient(180deg, #0C0C0D 0%, #0A0A0B 100%)", position: "relative", overflow: "hidden",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          padding: "28px", borderRight: "1px solid #161618",
          animationDelay: "220ms",
        }}>
          <div style={{ fontSize: "11px", color: "#E8001D", fontFamily: "'DM Mono', monospace", letterSpacing: "0.12em" }}>
            Telemetry Overlay . Driver Comparison
          </div>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "stretch", padding: "60px 28px", gap: "20px", opacity: 0.04 }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} style={{ width: "1px", background: "#fff", flex: "none" }} />
            ))}
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "2px" }}>
            {[
              { color: "#E8001D", pts: [35, 12, 28, 8, 22, 40, 18, 32, 10] },
              { color: "#2a2a2a", pts: [45, 28, 40, 22, 35, 52, 28, 44, 24] },
              { color: "#1a1a1a", pts: [55, 40, 50, 35, 48, 62, 40, 55, 36] },
            ].map((t, i) => {
              const points = t.pts.map((y, x) => `${x * 50},${y}`).join(" ");
              const path = `M ${t.pts.map((y, x) => `${x * 50},${y}`).join(" L ")}`;
              const lineClass = i === 0 ? "telemetry-line telemetry-primary" : i === 1 ? "telemetry-line telemetry-secondary" : "telemetry-line telemetry-tertiary";

              return (
                <svg key={i} className="telemetry-graph" viewBox="0 0 400 50" preserveAspectRatio="none" style={{ width: "100%", height: "38px" }}>
                  <polyline
                    className={lineClass}
                    points={points}
                    fill="none"
                    stroke={t.color}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    shapeRendering="geometricPrecision"
                  />
                  <polyline
                    className={`telemetry-flow ${lineClass}`}
                    points={points}
                    fill="none"
                    stroke={i === 0 ? "#FF5A6E" : i === 1 ? "#A4A4AB" : "#6A6A72"}
                    strokeWidth={i === 0 ? "2.4" : "2"}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={i === 0 ? "0.95" : i === 1 ? "0.72" : "0.5"}
                    vectorEffect="non-scaling-stroke"
                    shapeRendering="geometricPrecision"
                  />
                  {i < 2 ? (
                    <circle r={i === 0 ? "3.2" : "2.6"} fill={i === 0 ? "#E8001D" : "#74747A"} opacity={i === 0 ? "0.95" : "0.55"}>
                      <animateMotion dur={i === 0 ? "2.8s" : "4.2s"} repeatCount="indefinite" calcMode="linear" path={path} />
                    </circle>
                  ) : null}
                </svg>
              );
            })}
          </div>
          <div style={{ fontSize: "10px", color: "#444", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em" }}>
            SPEED . THROTTLE . BRAKE . DRS
          </div>
        </div>

        <div className="replay-panel reveal-up" style={{
          background: "radial-gradient(circle at 72% 20%, rgba(232,0,29,0.08), transparent 24%), linear-gradient(180deg, #0E0E0F 0%, #0A0A0B 100%)", position: "relative", overflow: "hidden",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          padding: "28px",
          animationDelay: "300ms",
        }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <span style={{ fontSize: "10px", color: "#444", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em" }}>PIXI.js Renderer</span>
          </div>
          <div className="soft-float" style={{ position: "absolute", top: "40px", left: "50%", transform: "translateX(-50%)", pointerEvents: "none" }}>
            <svg className="replay-hex-stack" viewBox="0 0 180 150" width="180" height="150" style={{ opacity: 0.7 }}>
              <defs>
                <linearGradient id="replayPrismGlow" x1="34" y1="22" x2="148" y2="116" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FF9AA5" stopOpacity="0.18" />
                  <stop offset="46%" stopColor="#E8001D" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#E8001D" stopOpacity="0.08" />
                </linearGradient>
                <radialGradient id="replayHexCloudA" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FF4D67" stopOpacity="0.26" />
                  <stop offset="100%" stopColor="#E8001D" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="replayHexCloudB" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FF6B7E" stopOpacity="0.16" />
                  <stop offset="100%" stopColor="#E8001D" stopOpacity="0" />
                </radialGradient>
              </defs>
              <g className="hex-cloud cloud-a">
                <ellipse cx="90" cy="76" rx="68" ry="24" fill="url(#replayHexCloudA)" transform="rotate(-18 90 76)" />
                <ellipse cx="90" cy="76" rx="34" ry="72" fill="url(#replayHexCloudB)" transform="rotate(24 90 76)" />
              </g>
              <g className="hex-cloud cloud-b">
                <ellipse cx="90" cy="76" rx="76" ry="20" fill="rgba(232,0,29,0.08)" transform="rotate(34 90 76)" />
                <ellipse cx="90" cy="76" rx="24" ry="78" fill="rgba(255,77,103,0.07)" transform="rotate(-28 90 76)" />
              </g>
              <g className="hex-shell shell-a">
                <path d="M90,18 L144,48 L144,104 L90,134 L36,104 L36,48 Z" fill="none" stroke="rgba(232,0,29,0.34)" strokeWidth="1.3" />
              </g>
              <g className="hex-shell shell-b" transform="rotate(18 90 76)">
                <path d="M90,26 L130,48 L130,104 L90,126 L50,104 L50,48 Z" fill="none" stroke="rgba(232,0,29,0.28)" strokeWidth="1.15" />
              </g>
              <g className="hex-shell shell-c" transform="rotate(-26 90 76)">
                <path d="M90,32 L154,56 L154,96 L90,120 L26,96 L26,56 Z" fill="none" stroke="rgba(232,0,29,0.2)" strokeWidth="1.05" />
              </g>
              <path className="hex-beam" d="M90,18 L118,40 L130,48 L154,56" fill="none" stroke="rgba(232,0,29,0.3)" strokeWidth="1" />
              <path className="hex-beam" d="M36,104 L62,98 L90,134 L122,110" fill="none" stroke="rgba(232,0,29,0.22)" strokeWidth="0.95" />
              <polygon points="90,46 118,62 118,92 90,108 62,92 62,62" fill="url(#replayPrismGlow)" opacity="0.88" />
              <circle className="hex-core" cx="90" cy="76" r="7" fill="#FF3049" opacity="0.98" />
              <circle className="hex-core" cx="90" cy="76" r="16" fill="none" stroke="#FF5A6E" strokeWidth="1.15" opacity="0.48" />
              <circle r="3.4" fill="#E8001D" opacity="1">
                <animateMotion dur="8.4s" repeatCount="indefinite" path="M90,18 L144,48 L144,104 L90,134 L36,104 L36,48 L90,18 L130,48 L130,104 L90,126 L50,104 L50,48 L90,26 L154,56 L154,96 L90,120 L26,96 L26,56 L90,32" />
              </circle>
              <circle r="7.2" fill="rgba(232,0,29,0.08)" opacity="0.9">
                <animateMotion dur="8.4s" repeatCount="indefinite" path="M90,18 L144,48 L144,104 L90,134 L36,104 L36,48 L90,18 L130,48 L130,104 L90,126 L50,104 L50,48 L90,26 L154,56 L154,96 L90,120 L26,96 L26,56 L90,32" />
              </circle>
            </svg>
          </div>
          <div className="replay-panel-copy">
            <h2 style={{
              fontFamily: "'Instrument Serif', serif", fontWeight: 400,
              fontSize: "clamp(24px, 3vw, 38px)", color: "#E0E0DA",
              lineHeight: 1.12, marginBottom: "18px",
            }}>
              Replay any session with a single command
            </h2>
            <button className="cta-btn-ghost">{"Try Now ->"}</button>
          </div>
        </div>
      </div>

      <section className="surface-glow" style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
        borderTop: "1px solid #161618", borderBottom: "1px solid #161618",
        background: "radial-gradient(110% 120% at 0% 100%, rgba(232,0,29,0.11) 0%, rgba(232,0,29,0.045) 18%, rgba(232,0,29,0.01) 30%, rgba(232,0,29,0) 42%), linear-gradient(180deg, #0B0B0C 0%, #0A0A0B 55%, #09090A 100%)",
      }}>
        <div className="feature-copy" style={{ padding: "40px 32px", borderRight: "1px solid #161618" }}>
          <div style={{ fontSize: "10px", color: "#444", fontFamily: "'DM Mono', monospace", letterSpacing: "0.12em", marginBottom: "18px" }}>Lumen</div>
          <h2 style={{
            fontFamily: "'Instrument Serif', serif", fontWeight: 400,
            fontSize: "clamp(20px, 2.2vw, 28px)", lineHeight: 1.2,
            marginBottom: "16px", color: "#E0E0DA",
          }}>
            Every screen engineered for precision analysis
          </h2>
          <p style={{ fontSize: "13px", color: "#666", lineHeight: 1.75, marginBottom: "28px" }}>
            From driver and constructor standings to session-level telemetry replay - Lumen surfaces the data that matters, every season.
          </p>
          <button className="cta-btn">{"Open Dashboard ->"}</button>
        </div>

        <div style={{
          padding: "32px 24px", borderRight: "1px solid #161618",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "radial-gradient(circle at 50% 35%, rgba(232,0,29,0.024), transparent 36%), linear-gradient(180deg, #0C0C0D 0%, #0A0A0B 100%)",
        }}>
          <div className="feature-visual-stack" style={{ width: "100%", maxWidth: "220px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div className="field-shape-card pulse-glow soft-float" style={{ background: "#111113", border: "1px solid #1e1e20", borderRadius: "8px", padding: "14px" }}>
              <div style={{ fontSize: "9px", color: "#555", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", marginBottom: "10px" }}>FIELD SHAPE - LIVE MODEL</div>
              <svg className="field-shape-svg" viewBox="0 0 180 100" style={{ width: "100%" }}>
                <path className="shape-a" d="M26,70 C44,30 70,20 92,34 C108,44 122,48 146,28" fill="none" stroke="#222" strokeWidth="7" strokeLinecap="round" />
                <path className="shape-b" d="M24,58 C42,46 70,52 90,42 C112,30 132,48 154,42" fill="none" stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round" />
                <path className="shape-c" d="M30,78 C48,60 64,66 84,58 C110,48 132,66 150,56" fill="none" stroke="#202022" strokeWidth="3" strokeLinecap="round" />
                {[{ x: 48, y: 47, c: "#E8001D" }, { x: 98, y: 41, c: "#3b82f6" }, { x: 132, y: 50, c: "#f59e0b" }].map((dot, i) => (
                  <circle key={i} className="field-dot" cx={dot.x} cy={dot.y} r="4" fill={dot.c} />
                ))}
                <circle className="field-dot" cx="48" cy="47" r="12" fill="none" stroke="rgba(232,0,29,0.18)" strokeWidth="1" />
                <circle className="field-dot" cx="98" cy="41" r="10" fill="none" stroke="rgba(59,130,246,0.18)" strokeWidth="1" />
                <circle className="field-dot" cx="132" cy="50" r="11" fill="none" stroke="rgba(245,158,11,0.18)" strokeWidth="1" />
                <circle r="2.6" fill="#E8001D" opacity="0.92">
                  <animateMotion dur="6.4s" repeatCount="indefinite" path="M26,70 C44,30 70,20 92,34 C108,44 122,48 146,28" />
                </circle>
                <circle r="2.2" fill="#3b82f6" opacity="0.72">
                  <animateMotion dur="7.6s" repeatCount="indefinite" path="M24,58 C42,46 70,52 90,42 C112,30 132,48 154,42" />
                </circle>
              </svg>
            </div>
            <div style={{ background: "#111113", border: "1px solid #1e1e20", borderRadius: "8px", padding: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <div style={{ fontSize: "9px", color: "#555", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em" }}>PACE INDEX</div>
                <div style={{ width: "22px", height: "22px", background: "#E8001D", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#fff", fontSize: "8px" }}>▶</span>
                </div>
              </div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "20px", color: "#E0E0DA", letterSpacing: "-0.01em" }}>91.4</div>
              <div style={{ fontSize: "9px", color: "#555", fontFamily: "'DM Mono', monospace", marginTop: "2px" }}>composite ranking signal . live</div>
            </div>
          </div>
        </div>

        <div style={{ padding: "40px 28px" }}>
          <div className="feature-list" style={{ marginBottom: "24px" }}>
            {[
              "Driver & constructor standings",
              "Race calendar with session breakdown",
              "Animated telemetry replay via PIXI.js",
            ].map((item, i) => (
              <div key={i} className="checklist-item">
                <div style={{ width: "13px", height: "13px", borderRadius: "50%", border: "1.5px solid #E8001D", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#E8001D" }} />
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="snapshot-card reveal-up" style={{ background: "#111113", border: "1px solid #1e1e20", borderRadius: "8px", padding: "14px", animationDelay: "420ms" }}>
            <div style={{ fontSize: "9px", color: "#555", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", marginBottom: "8px" }}>STANDINGS SNAPSHOT</div>
            <div style={{ fontSize: "13px", fontFamily: "'Instrument Serif', serif", marginBottom: "4px", color: "#E0E0DA" }}>Selected Season Pulse</div>
            <div style={{ fontSize: "11px", color: "#555" }}>drivers . constructors . movement by season</div>
            <div style={{ margin: "10px 0", height: "1px", background: "#161618" }} />
            <div style={{ display: "flex", gap: "6px" }}>
              {["P1 VER", "P2 NOR", "P3 PIA"].map((d) => (
                <span key={d} style={{ background: "#0E0E0F", border: "1px solid #1e1e20", borderRadius: "4px", padding: "2px 8px", fontSize: "10px", fontFamily: "'DM Mono', monospace", color: "#555" }}>{d}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", height: "320px" }}>
        <div className="banner-copy" style={{
          background: "radial-gradient(circle at 66% 46%, rgba(232,0,29,0.075), transparent 30%), linear-gradient(120deg, #0C0C0D 0%, #120B0D 52%, #0A0A0B 100%)", position: "relative", overflow: "hidden",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          padding: "28px", borderRight: "1px solid #161618",
        }}>
          <div>
            <div style={{ fontSize: "10px", color: "#444", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", marginBottom: "4px" }}>TELEMETRY DECODED</div>
            <div style={{ fontSize: "10px", color: "#333", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em" }}>ALL SEASONS . ALL CIRCUITS</div>
          </div>
          <div style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}>
            <div style={{
              position: "relative",
              width: "74%",
              maxWidth: "420px",
              minHeight: "214px",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
            }}>
              <div className="replay-stripe-field" style={{
                position: "absolute",
                inset: "12% 6% 12% 34%",
                display: "flex",
                gap: "18px",
                alignItems: "stretch",
                justifyContent: "flex-start",
                opacity: 0.16,
                maskImage: "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.88) 18%, rgba(0,0,0,0.88) 82%, transparent 100%)",
              }}>
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={i}
                    className="stripe-line"
                    style={{
                      width: i === 3 ? "2px" : "1px",
                      background: i === 3 ? "linear-gradient(180deg, rgba(232,0,29,0) 0%, rgba(232,0,29,0.3) 18%, rgba(232,0,29,0.34) 50%, rgba(232,0,29,0.3) 82%, rgba(232,0,29,0) 100%)" : "linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.10) 20%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.10) 80%, rgba(255,255,255,0) 100%)",
                      height: "100%",
                    }}
                  />
                ))}
              </div>
              <div style={{
                position: "absolute",
                inset: "14% 4% 14% 0",
                background: "linear-gradient(90deg, rgba(12,12,13,0.96) 0%, rgba(12,12,13,0.78) 46%, rgba(12,12,13,0.12) 100%)",
                filter: "blur(12px)",
              }} />
              <h2 style={{
                fontFamily: "'Instrument Serif', serif", fontWeight: 400,
                fontSize: "clamp(22px, 3.2vw, 40px)", color: "#E0E0DA",
                lineHeight: 1.1, letterSpacing: "-0.02em", position: "relative", zIndex: 1, textAlign: "left",
                textWrap: "balance",
                width: "100%",
                maxWidth: "320px",
              }}>
                Don't Watch It.
                <br />Don't Guess It.
                <br />Just Replay It.
              </h2>
            </div>
          </div>
        </div>

        <div className="banner-meta" style={{
          background: "radial-gradient(circle at 50% 42%, rgba(232,0,29,0.04), transparent 30%), linear-gradient(180deg, #0E0E0F 0%, #0A0A0B 100%)", position: "relative",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          padding: "28px",
        }}>
          <div className="reveal-up" style={{ position: "absolute", top: "18px", right: "22px", textAlign: "right", animationDelay: "220ms" }}>
            <div style={{ fontSize: "11px", color: "#444", fontFamily: "'DM Mono', monospace" }}>Kalman-smoothed</div>
            <div style={{ fontSize: "11px", color: "#444", fontFamily: "'DM Mono', monospace" }}>telemetry</div>
          </div>
          <div className="soft-float" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg className="kalman-visual" viewBox="0 0 220 160" width="220" height="160">
              <circle className="state-halo" cx="78" cy="88" r="48" fill="#161618" stroke="#1e1e20" strokeWidth="1" />
              <ellipse className="state-ring" cx="78" cy="88" rx="64" ry="16" fill="none" stroke="#2a2a2a" strokeWidth="1.5" opacity="0.6" />
              <circle className="state-core" cx="78" cy="88" r="8" fill="#E8001D" opacity="0.8" />
              <circle r="3" fill="#E8001D" opacity="0.9">
                <animateMotion dur="6.8s" repeatCount="indefinite" path="M14,88 A64,16 0 1,1 142,88 A64,16 0 1,1 14,88" />
              </circle>
              <g transform="skewY(-8) translate(0,8)">
                <rect className="state-panel" x="132" y="62" width="68" height="40" rx="3" fill="#111113" stroke="#1e1e20" strokeWidth="1" />
                <line className="panel-line" x1="140" y1="72" x2="192" y2="72" stroke="#2a2a2a" strokeWidth="0.8" />
                <line className="panel-line" x1="140" y1="80" x2="180" y2="80" stroke="#1e1e1e" strokeWidth="0.8" />
                <circle r="2.6" fill="#E8001D" opacity="0.72">
                  <animate attributeName="cx" values="140;192;140" dur="3.2s" repeatCount="indefinite" />
                  <animate attributeName="cy" values="72;72;72" dur="3.2s" repeatCount="indefinite" />
                </circle>
              </g>
              <circle r="2.2" fill="#E8001D" opacity="0.4">
                <animate attributeName="cx" values="140;180;140" dur="5.4s" repeatCount="indefinite" />
                <animate attributeName="cy" values="80;80;80" dur="5.4s" repeatCount="indefinite" />
              </circle>
            </svg>
          </div>
          <div className="banner-note" style={{ fontSize: "12px", color: "#555" }}>
            6-state constant-acceleration Kalman model - frame-accurate position at every point
          </div>
        </div>
      </div>

      <section className="reveal-up" style={{ padding: "48px 32px", background: "#0A0A0B", animationDelay: "260ms" }}>
        <div className="gallery-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: "clamp(22px, 2.5vw, 30px)", color: "#E0E0DA" }}>
            Championship standings
          </h2>
          <div className="gallery-tabs" style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            {GALLERY_TABS.map((t) => (
              <button key={t} className={`gallery-tab${activeGallery === t ? " active" : ""}`}
                onClick={() => setActiveGallery(t)}>{t}</button>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2px" }}>
          {SESSIONS.map((s) => <SessionCard key={s.id} session={s} motionStyle={motionStyle} />)}
        </div>
      </section>

      <section className="surface-glow" style={{
        background: "radial-gradient(circle at 76% 50%, rgba(232,0,29,0.032), transparent 32%), linear-gradient(180deg, #0C0C0D 0%, #0A0A0B 100%)", padding: "72px 32px",
        display: "grid", gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center", gap: "40px",
        borderTop: "1px solid #161618",
      }}>
        <div className="cta-copy">
          <div style={{ display: "flex", gap: "8px", marginBottom: "22px" }}>
            <span className="pill">Replay</span>
            <span className="pill">Standings</span>
            <span className="pill">Calendar</span>
          </div>
          <h2 style={{
            fontFamily: "'Instrument Serif', serif", fontWeight: 400,
            fontSize: "clamp(30px, 4.5vw, 56px)", color: "#E0E0DA",
            lineHeight: 1.05, letterSpacing: "-0.025em",
          }}>
            One session -
            <br />Infinite insights
            <br /><em>/ Limitless replay.</em>
          </h2>
          <p style={{ fontSize: "13px", color: "#666", lineHeight: 1.75, marginTop: "20px", maxWidth: "280px" }}>
            Load any race weekend and watch every battle, strategy call, and braking point - frame by frame, every season.
          </p>
        </div>

        <div className="cta-center" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: "1px", height: "48px", background: "#1e1e20", marginBottom: "16px" }} />
          <button className="cta-btn-red">{"Open Dashboard ->"}</button>
          <div style={{ width: "1px", height: "48px", background: "#1e1e20", marginTop: "16px" }} />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <svg className="cta-orbit" viewBox="0 0 180 180" width="180" height="180">
            <circle cx="90" cy="90" r="72" fill="#0f0f0f" stroke="#1a1a1a" strokeWidth="1" />
            <g className="electron-cloud cloud-a">
              <ellipse cx="90" cy="90" rx="52" ry="24" fill="rgba(232,0,29,0.05)" transform="rotate(-28 90 90)" />
              <ellipse cx="90" cy="90" rx="34" ry="62" fill="rgba(232,0,29,0.035)" transform="rotate(18 90 90)" />
            </g>
            <g className="electron-cloud cloud-b">
              <ellipse cx="90" cy="90" rx="64" ry="18" fill="rgba(245,158,11,0.04)" transform="rotate(42 90 90)" />
              <ellipse cx="90" cy="90" rx="20" ry="70" fill="rgba(255,255,255,0.025)" transform="rotate(-12 90 90)" />
            </g>
            <g className="electron-cloud cloud-c">
              <ellipse cx="90" cy="90" rx="26" ry="72" fill="rgba(232,0,29,0.03)" transform="rotate(62 90 90)" />
              <ellipse cx="90" cy="90" rx="70" ry="20" fill="rgba(255,255,255,0.02)" transform="rotate(-44 90 90)" />
            </g>
            <g className="quantum-shell shell-a">
              <ellipse cx="90" cy="90" rx="30" ry="10" fill="none" stroke="rgba(232,0,29,0.22)" strokeWidth="1.1" transform="rotate(-26 90 90)" />
            </g>
            <g className="quantum-shell shell-b">
              <ellipse cx="90" cy="90" rx="46" ry="12" fill="none" stroke="rgba(232,0,29,0.18)" strokeWidth="1" transform="rotate(22 90 90)" />
            </g>
            <g className="quantum-shell shell-c">
              <ellipse cx="90" cy="90" rx="62" ry="14" fill="none" stroke="rgba(232,0,29,0.14)" strokeWidth="1" transform="rotate(68 90 90)" />
            </g>
            <g className="quantum-shell shell-d">
              <ellipse cx="90" cy="90" rx="54" ry="18" fill="none" stroke="rgba(232,0,29,0.12)" strokeWidth="0.9" transform="rotate(-58 90 90)" />
            </g>
            <g className="quantum-shell shell-e">
              <ellipse cx="90" cy="90" rx="38" ry="22" fill="none" stroke="rgba(232,0,29,0.1)" strokeWidth="0.9" transform="rotate(54 90 90)" />
            </g>
            <g className="quantum-shell shell-f">
              <ellipse cx="90" cy="90" rx="66" ry="9" fill="none" stroke="rgba(232,0,29,0.11)" strokeWidth="0.85" transform="rotate(8 90 90)" />
            </g>
            <circle className="quantum-electron" r="3.4" fill="#E8001D" opacity="0.95">
              <animateMotion dur="10.5s" repeatCount="indefinite" path="M120,90 A30,10 0 1,1 60,90 A30,10 0 1,1 120,90" rotate="auto" />
            </circle>
            <circle className="quantum-electron" r="2.4" fill="#F3F4F6" opacity="0.75">
              <animateMotion dur="14.2s" repeatCount="indefinite" path="M136,90 A46,12 0 1,0 44,90 A46,12 0 1,0 136,90" rotate="auto" />
            </circle>
            <circle className="quantum-electron" r="2.1" fill="#E8001D" opacity="0.58">
              <animateMotion dur="18.8s" repeatCount="indefinite" path="M152,90 A62,14 0 1,1 28,90 A62,14 0 1,1 152,90" rotate="auto" />
            </circle>
            <circle className="orbit-core" cx="90" cy="90" r="6" fill="#E8001D" />
            <circle className="orbit-core" cx="90" cy="90" r="12" fill="none" stroke="#E8001D" strokeWidth="1" opacity="0.4" />
            <circle cx="90" cy="90" r="72" fill="none" stroke="rgba(232,0,29,0.12)" strokeWidth="1" />
          </svg>
        </div>
      </section>

      <footer style={{
        background: "#0A0A0B", borderTop: "1px solid #161618",
        padding: "28px 32px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div className="footer-copy">
          <div style={{ fontSize: "12px", color: "#444", fontFamily: "'DM Mono', monospace", marginBottom: "3px" }}>
            A Race Intelligence Tool by Lumen
          </div>
          <div style={{ fontSize: "11px", color: "#333", fontFamily: "'DM Mono', monospace" }}>
            Lumen - All rights reserved.
          </div>
        </div>
        <div className="footer-links" style={{ display: "flex", gap: "28px" }}>
          {["-> Standings", "-> Calendar", "-> Sessions", "-> Replay"].map((l) => (
            <button key={l} className="nav-link" style={{ fontSize: "11px", color: "#444", letterSpacing: "0.03em" }}>{l}</button>
          ))}
        </div>
      </footer>

      <div className="watermark" style={{ background: "#0A0A0B", textAlign: "center", padding: "0 0 16px", overflow: "hidden" }}>
        <div style={{
          fontFamily: "'Instrument Serif', serif", fontWeight: 400,
          fontSize: "clamp(48px, 16vw, 160px)",
          color: "#121212", letterSpacing: "-0.03em",
          lineHeight: 1, userSelect: "none",
        }}>
          Lumen
        </div>
      </div>
      </div>
    </div>
  );
}
