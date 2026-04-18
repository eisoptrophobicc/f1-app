import { useState } from "react";

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
    stats: [
      ["Last 3", "54"],
      ["Podiums", "9"],
      ["Gap", "-114"],
      ["Trend", "Rising"],
    ],
  },
];

function SessionCard({ session }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
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
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "22px" }}>
        <div>
          <div style={{ fontSize: "10px", color: "#555", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", marginBottom: "8px" }}>{session.sub}</div>
          <div style={{ fontSize: "13px", fontWeight: 400, color: "#C8C8C2", fontFamily: "'Instrument Serif', serif", marginBottom: "14px" }}>{session.label}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span style={{ fontSize: "36px", lineHeight: 1, color: "#E8E8E2", fontFamily: "'DM Mono', monospace", letterSpacing: "-0.04em" }}>{session.value}</span>
            <span style={{ fontSize: "11px", color: "#666", fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em" }}>{session.unit}</span>
          </div>
        </div>
        <div style={{
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
      <div style={{
        marginTop: "auto",
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "10px",
      }}>
        {session.stats.map(([key, val]) => (
          <div key={key} style={{
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

export default function F1ReplayLanding() {
  const [activeFilter, setActiveFilter] = useState("Replay");
  const [activeGallery, setActiveGallery] = useState("Overview");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500&family=DM+Mono:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #0A0A0B; color: #888; font-family: 'Geist', sans-serif; -webkit-font-smoothing: antialiased; }

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
      `}</style>

      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px", height: "48px",
        borderBottom: "1px solid #161618",
        position: "sticky", top: 0, background: "#0A0A0B", zIndex: 100,
      }}>
        <div style={{ display: "flex", gap: "28px", flex: 1 }}>
          {NAV_LEFT.map((l) => <button key={l} className="nav-link">{"-> "}{l}</button>)}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
          <span style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: "16px", letterSpacing: "-0.01em", lineHeight: 1, color: "#E0E0DA" }}>Lumen</span>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "7px", letterSpacing: "0.2em", color: "#333", textTransform: "uppercase" }}>Formula One Analytics</span>
        </div>
        <div style={{ display: "flex", gap: "28px", alignItems: "center", flex: 1, justifyContent: "flex-end" }}>
          <button className="nav-link">Sessions</button>
          <button className="cta-btn" style={{ padding: "7px 16px", fontSize: "11px" }}>{"Sign In ->"}</button>
        </div>
      </nav>

      <section style={{
        padding: "48px 32px 40px",
        display: "grid", gridTemplateColumns: "1fr 300px",
        gap: "40px", alignItems: "start",
        borderBottom: "1px solid #161618",
      }}>
        <h1 style={{
          fontFamily: "'Instrument Serif', serif", fontWeight: 400,
          fontSize: "clamp(36px, 5vw, 60px)", lineHeight: 1.06,
          letterSpacing: "-0.02em", color: "#E8E8E2", maxWidth: "600px",
        }}>
          Standings, Calendars, and Telemetry Replay - Every Season, Every Circuit
        </h1>
        <div style={{ paddingTop: "6px" }}>
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
        <div style={{ display: "flex", gap: "28px" }}>
          {FILTER_TABS.map((t) => (
            <button key={t} className={`filter-tab${activeFilter === t ? " active" : ""}`}
              onClick={() => setActiveFilter(t)}>{t}</button>
          ))}
        </div>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "#333", letterSpacing: "0.1em" }}>ALL SEASONS . ALL CIRCUITS</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", height: "360px" }}>
        <div style={{
          background: "#0C0C0D", position: "relative", overflow: "hidden",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          padding: "28px", borderRight: "1px solid #161618",
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
            ].map((t, i) => (
              <svg key={i} viewBox="0 0 400 50" preserveAspectRatio="none" style={{ width: "100%", height: "38px" }}>
                <polyline points={t.pts.map((y, x) => `${x * 50},${y}`).join(" ")}
                  fill="none" stroke={t.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ))}
          </div>
          <div style={{ fontSize: "10px", color: "#444", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em" }}>
            SPEED . THROTTLE . BRAKE . DRS
          </div>
        </div>

        <div style={{
          background: "#0E0E0F", position: "relative", overflow: "hidden",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          padding: "28px",
        }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <span style={{ fontSize: "10px", color: "#444", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em" }}>PIXI.js Renderer</span>
          </div>
          <div style={{ position: "absolute", top: "40px", left: "50%", transform: "translateX(-50%)", pointerEvents: "none" }}>
            <svg viewBox="0 0 180 150" width="180" height="150" style={{ opacity: 0.7 }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <polygon key={i}
                  points="90,12 158,52 158,102 90,142 22,102 22,52"
                  fill={i === 2 ? "rgba(232,0,29,0.04)" : "none"}
                  stroke={`rgba(232,0,29,${0.04 + i * 0.04})`}
                  strokeWidth="1"
                  transform={`translate(${(i - 2) * 7},${(i - 2) * 5})`}
                />
              ))}
            </svg>
          </div>
          <div>
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

      <section style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
        borderTop: "1px solid #161618", borderBottom: "1px solid #161618",
      }}>
        <div style={{ padding: "40px 32px", borderRight: "1px solid #161618" }}>
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
          background: "#0C0C0D",
        }}>
          <div style={{ width: "100%", maxWidth: "220px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ background: "#111113", border: "1px solid #1e1e20", borderRadius: "8px", padding: "14px" }}>
              <div style={{ fontSize: "9px", color: "#555", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", marginBottom: "10px" }}>FIELD SHAPE - LIVE MODEL</div>
              <svg viewBox="0 0 180 100" style={{ width: "100%" }}>
                <path d="M26,70 C44,30 70,20 92,34 C108,44 122,48 146,28" fill="none" stroke="#222" strokeWidth="7" strokeLinecap="round" />
                <path d="M24,58 C42,46 70,52 90,42 C112,30 132,48 154,42" fill="none" stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round" />
                <path d="M30,78 C48,60 64,66 84,58 C110,48 132,66 150,56" fill="none" stroke="#202022" strokeWidth="3" strokeLinecap="round" />
                {[{ x: 48, y: 47, c: "#E8001D" }, { x: 98, y: 41, c: "#3b82f6" }, { x: 132, y: 50, c: "#f59e0b" }].map((dot, i) => (
                  <circle key={i} cx={dot.x} cy={dot.y} r="4" fill={dot.c} />
                ))}
                <circle cx="48" cy="47" r="12" fill="none" stroke="rgba(232,0,29,0.18)" strokeWidth="1" />
                <circle cx="98" cy="41" r="10" fill="none" stroke="rgba(59,130,246,0.18)" strokeWidth="1" />
                <circle cx="132" cy="50" r="11" fill="none" stroke="rgba(245,158,11,0.18)" strokeWidth="1" />
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
          <div style={{ marginBottom: "24px" }}>
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
          <div style={{ background: "#111113", border: "1px solid #1e1e20", borderRadius: "8px", padding: "14px" }}>
            <div style={{ fontSize: "9px", color: "#555", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", marginBottom: "8px" }}>STANDINGS SNAPSHOT</div>
            <div style={{ fontSize: "13px", fontFamily: "'Instrument Serif', serif", marginBottom: "4px", color: "#E0E0DA" }}>2025 Championship Pulse</div>
            <div style={{ fontSize: "11px", color: "#555" }}>drivers . constructors . movement</div>
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
        <div style={{
          background: "#0C0C0D", position: "relative", overflow: "hidden",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          padding: "28px", borderRight: "1px solid #161618",
        }}>
          <div>
            <div style={{ fontSize: "10px", color: "#444", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em", marginBottom: "4px" }}>TELEMETRY DECODED</div>
            <div style={{ fontSize: "10px", color: "#333", fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em" }}>ALL SEASONS . ALL CIRCUITS</div>
          </div>
          <div style={{ position: "absolute", inset: 0, display: "flex", gap: "22px", padding: "0 28px", alignItems: "center", opacity: 0.03, pointerEvents: "none" }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} style={{ width: "1px", background: "#fff", height: "65%" }} />
            ))}
          </div>
          <h2 style={{
            fontFamily: "'Instrument Serif', serif", fontWeight: 400,
            fontSize: "clamp(22px, 3.2vw, 40px)", color: "#E0E0DA",
            lineHeight: 1.1, letterSpacing: "-0.02em",
          }}>
            Don't Watch It.
            <br />Don't Guess It.
            <br />Just Replay It.
          </h2>
        </div>

        <div style={{
          background: "#0E0E0F", position: "relative",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          padding: "28px",
        }}>
          <div style={{ position: "absolute", top: "18px", right: "22px", textAlign: "right" }}>
            <div style={{ fontSize: "11px", color: "#444", fontFamily: "'DM Mono', monospace" }}>Kalman-smoothed</div>
            <div style={{ fontSize: "11px", color: "#444", fontFamily: "'DM Mono', monospace" }}>telemetry</div>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox="0 0 220 160" width="220" height="160">
              <circle cx="78" cy="88" r="48" fill="#161618" stroke="#1e1e20" strokeWidth="1" />
              <ellipse cx="78" cy="88" rx="64" ry="16" fill="none" stroke="#2a2a2a" strokeWidth="1.5" opacity="0.6" />
              <circle cx="78" cy="88" r="8" fill="#E8001D" opacity="0.8" />
              <rect x="132" y="62" width="68" height="40" rx="3" fill="#111113" stroke="#1e1e20" strokeWidth="1" transform="skewY(-8) translate(0,8)" />
              <line x1="140" y1="72" x2="192" y2="72" stroke="#2a2a2a" strokeWidth="0.8" transform="skewY(-8) translate(0,8)" />
              <line x1="140" y1="80" x2="180" y2="80" stroke="#1e1e1e" strokeWidth="0.8" transform="skewY(-8) translate(0,8)" />
            </svg>
          </div>
          <div style={{ fontSize: "12px", color: "#555" }}>
            6-state constant-acceleration Kalman model - frame-accurate position at every point
          </div>
        </div>
      </div>

      <section style={{ padding: "48px 32px", background: "#0A0A0B" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: "clamp(22px, 2.5vw, 30px)", color: "#E0E0DA" }}>
            Championship standings
          </h2>
          <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            {GALLERY_TABS.map((t) => (
              <button key={t} className={`gallery-tab${activeGallery === t ? " active" : ""}`}
                onClick={() => setActiveGallery(t)}>{t}</button>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2px" }}>
          {SESSIONS.map((s) => <SessionCard key={s.id} session={s} />)}
        </div>
      </section>

      <section style={{
        background: "#0C0C0D", padding: "72px 32px",
        display: "grid", gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center", gap: "40px",
        borderTop: "1px solid #161618",
      }}>
        <div>
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

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: "1px", height: "48px", background: "#1e1e20", marginBottom: "16px" }} />
          <button className="cta-btn-red">{"Open Dashboard ->"}</button>
          <div style={{ width: "1px", height: "48px", background: "#1e1e20", marginTop: "16px" }} />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <svg viewBox="0 0 180 180" width="180" height="180">
            <circle cx="90" cy="90" r="72" fill="#0f0f0f" stroke="#1a1a1a" strokeWidth="1" />
            {[0, 1, 2, 3].map((i) => (
              <ellipse key={i} cx="90" cy="90" rx={28 + i * 14} ry="7"
                fill="none" stroke="rgba(232,0,29,0.15)" strokeWidth="1"
                transform={`rotate(${-35 + i * 18} 90 90)`} />
            ))}
            <circle cx="90" cy="90" r="6" fill="#E8001D" />
            <circle cx="90" cy="90" r="12" fill="none" stroke="#E8001D" strokeWidth="1" opacity="0.4" />
            <circle cx="90" cy="90" r="72" fill="none" stroke="rgba(232,0,29,0.12)" strokeWidth="1" />
          </svg>
        </div>
      </section>

      <footer style={{
        background: "#0A0A0B", borderTop: "1px solid #161618",
        padding: "28px 32px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div>
          <div style={{ fontSize: "12px", color: "#444", fontFamily: "'DM Mono', monospace", marginBottom: "3px" }}>
            A Race Intelligence Tool by Lumen
          </div>
          <div style={{ fontSize: "11px", color: "#333", fontFamily: "'DM Mono', monospace" }}>
            (c) 2025 - All rights reserved.
          </div>
        </div>
        <div style={{ display: "flex", gap: "28px" }}>
          {["-> Standings", "-> Calendar", "-> Sessions", "-> Replay"].map((l) => (
            <button key={l} className="nav-link" style={{ fontSize: "11px", color: "#444", letterSpacing: "0.03em" }}>{l}</button>
          ))}
        </div>
      </footer>

      <div style={{ background: "#0A0A0B", textAlign: "center", padding: "0 0 16px", overflow: "hidden" }}>
        <div style={{
          fontFamily: "'Instrument Serif', serif", fontWeight: 400,
          fontSize: "clamp(48px, 16vw, 160px)",
          color: "#0e0e0f", letterSpacing: "-0.03em",
          lineHeight: 1, userSelect: "none",
        }}>
          Lumen
        </div>
      </div>
    </>
  );
}
