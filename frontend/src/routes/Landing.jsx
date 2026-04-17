import { useEffect, useRef, useState } from "react";

const NAV_LINKS = ["Standings", "Calendar", "Sessions", "Replay"];

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M3 3v18h18" /><path d="M7 16l4-4 4 4 4-6" />
      </svg>
    ),
    title: "Standings & Results",
    body: "Driver and constructor standings for any season, with nationality, team, and points — defaulting to the latest completed race.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
    title: "Calendar & Sessions",
    body: "Full race calendar with testing weekends, session breakdowns, status, and top-3 fastest laps per session.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "Telemetry Replay",
    body: "Animated track replay powered by PIXI.js — throttle, brake, speed, and gear channels for any driver, any race.",
  },
];

function TelemetryBar({ label, value, color, delay }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 600 + delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "0.08em" }} className="text-neutral-500 uppercase">
          {label}
        </span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }} className="text-neutral-300">
          {value}%
        </span>
      </div>
      <div className="h-px bg-neutral-800 relative overflow-hidden rounded-full">
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function SpeedGlyph() {
  return (
    <div
      className="absolute right-8 top-1/2 -translate-y-1/2 opacity-[0.06] pointer-events-none select-none"
      style={{ fontFamily: "'Playfair Display', serif", fontSize: "28vw", fontWeight: 900, color: "#fff", lineHeight: 1 }}
    >
      L
    </div>
  );
}

export default function Landing() {
  const heroRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ background: "#0A0A0B", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", color: "#E8E8E2" }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />

      {/* NAV */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          background: scrolled ? "rgba(10,10,11,0.85)" : "transparent",
        }}
      >
        <nav className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex gap-8 flex-1">
            {NAV_LINKS.slice(0, 2).map((l) => (
              <a
                key={l}
                href="#"
                style={{ fontSize: 13, letterSpacing: "0.04em", fontFamily: "'DM Mono', monospace" }}
                className="text-neutral-500 hover:text-neutral-200 transition-colors"
              >
                {l}
              </a>
            ))}
          </div>

          <div className="flex flex-col items-center" style={{ gap: 2 }}>
            <span
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: "-0.03em",
                color: "#E8E8E2",
                lineHeight: 1,
              }}
            >
              Lumen
            </span>
            <span
              style={{
                fontSize: 8,
                fontFamily: "'DM Mono', monospace",
                color: "#444",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              Formula One Analytics
            </span>
          </div>

          <div className="flex items-center gap-6 flex-1 justify-end">
            {NAV_LINKS.slice(2).map((l) => (
              <a
                key={l}
                href="#"
                style={{ fontSize: 13, letterSpacing: "0.04em", fontFamily: "'DM Mono', monospace" }}
                className="text-neutral-500 hover:text-neutral-200 transition-colors"
              >
                {l}
              </a>
            ))}
            <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.1)" }} />
            <button
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 12,
                letterSpacing: "0.06em",
                color: "#E8E8E2",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 100,
                padding: "7px 18px",
                cursor: "pointer",
                transition: "background 0.2s, border-color 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
            >
              Sign In
            </button>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6">
        <SpeedGlyph />

        {/* top accent line */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 h-px"
          style={{ width: "1px", height: "30vh", background: "linear-gradient(to bottom, transparent, rgba(224,0,29,0.4), transparent)" }}
        />

        {/* eyebrow */}
        <div className="flex items-center gap-3 mb-10 animate-fade-in">
          <div className="h-px w-8" style={{ background: "#E8001D" }} />
          <span
            style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "0.18em", color: "#E8001D" }}
            className="uppercase"
          >
            All Seasons · All Circuits
          </span>
          <div className="h-px w-8" style={{ background: "#E8001D" }} />
        </div>

        {/* headline */}
        <h1
          className="text-center leading-none mb-6 max-w-4xl"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 900,
            fontSize: "clamp(3.2rem, 9vw, 8rem)",
            letterSpacing: "-0.03em",
            color: "#F0F0EA",
          }}
        >
          Lumen
          <br />
          <em style={{ fontStyle: "italic", color: "#AAAAAA" }}>for Formula One</em>
        </h1>

        {/* subheading */}
        <p
          className="text-center max-w-md mb-12"
          style={{ fontSize: "clamp(0.95rem, 2vw, 1.1rem)", color: "#6B6B65", lineHeight: 1.75, fontWeight: 300 }}
        >
          Standings, calendars, session data, and animated telemetry replays — every season, every circuit, in one place.
        </p>

        {/* CTAs */}
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <button
            style={{
              background: "#E8001D",
              color: "#fff",
              border: "none",
              borderRadius: 100,
              padding: "14px 32px",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500,
              fontSize: 15,
              letterSpacing: "0.01em",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 10,
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.03)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            Open Dashboard
            <svg viewBox="0 0 16 16" fill="none" width="16" height="16">
              <circle cx="8" cy="8" r="7" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
              <polygon points="6,5 11,8 6,11" fill="white" />
            </svg>
          </button>

          <button
            style={{
              background: "transparent",
              color: "#888882",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 100,
              padding: "14px 28px",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 400,
              fontSize: 15,
              cursor: "pointer",
              transition: "border-color 0.2s, color 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; e.currentTarget.style.color = "#E8E8E2"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#888882"; }}
          >
            View Sample Replay
          </button>
        </div>

        {/* telemetry card */}
        <div
          className="mt-24 w-full max-w-2xl mx-auto relative"
          style={{
            background: "#111113",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 20,
            padding: "28px 32px",
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.14em", color: "#555" }} className="uppercase mb-1">
                Replay Telemetry · HAM vs VER
              </p>
              <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 20, color: "#E0E0DA" }}>
                Lap 47 · Sector 2
              </p>
            </div>
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 100,
                padding: "6px 14px",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <svg viewBox="0 0 12 12" width="10" height="10" fill="none">
                <path d="M9.5 6A3.5 3.5 0 1 1 6 2.5" stroke="#888" strokeWidth="1.2" strokeLinecap="round"/>
                <path d="M6 1v2.5L7.5 2" stroke="#888" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#666", letterSpacing: "0.1em" }}>REPLAY</span>
            </div>
          </div>

          <div className="space-y-4">
            <TelemetryBar label="Throttle — HAM" value={87} color="#E8001D" delay={0} />
            <TelemetryBar label="Throttle — VER" value={92} color="#1E90FF" delay={100} />
            <TelemetryBar label="Brake — HAM" value={14} color="#E8001D" delay={200} />
            <TelemetryBar label="Brake — VER" value={8} color="#1E90FF" delay={300} />
          </div>

          <div className="mt-6 pt-5 flex items-center justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            {[["Speed", "318 km/h"], ["Gear", "7th"], ["Gap", "+0.342s"], ["DRS", "Open"]].map(([k, v]) => (
              <div key={k} className="text-center">
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#555", letterSpacing: "0.1em" }} className="uppercase mb-1">
                  {k}
                </p>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 15, color: "#E0E0DA", fontWeight: 500 }}>{v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.12em", color: "#fff" }}>SCROLL</span>
          <div style={{ width: 1, height: 40, background: "linear-gradient(to bottom, #fff, transparent)" }} />
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-8 py-32">
        <div className="mb-20 max-w-xl">
          <p
            style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "0.18em", color: "#E8001D" }}
            className="uppercase mb-4"
          >
            Core Systems
          </p>
          <h2
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.02em", lineHeight: 1.15 }}
          >
            Every function engineered
            <br />
            <em style={{ color: "#666660", fontStyle: "italic" }}>for precision.</em>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              style={{
                background: "#111113",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 16,
                padding: "32px 28px",
                transition: "border-color 0.2s, background 0.2s",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(232,0,29,0.2)";
                e.currentTarget.style.background = "#14100F";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                e.currentTarget.style.background = "#111113";
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "rgba(232,0,29,0.1)",
                  border: "1px solid rgba(232,0,29,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#E8001D",
                  marginBottom: 24,
                }}
              >
                {f.icon}
              </div>
              <h3
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 20, color: "#E8E8E2", marginBottom: 12, lineHeight: 1.2 }}
              >
                {f.title}
              </h3>
              <p style={{ fontSize: 14, color: "#555550", lineHeight: 1.8, fontWeight: 300 }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BOTTOM CTA BAND */}
      <section
        className="mx-8 mb-16 rounded-2xl overflow-hidden relative flex flex-col items-center justify-center py-24 px-6 text-center"
        style={{ background: "#111113", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: "radial-gradient(ellipse 60% 80% at 50% 110%, rgba(232,0,29,0.35) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "0.18em", color: "#E8001D" }} className="uppercase mb-6">
          Standings · Calendar · Telemetry
        </p>
        <h2
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: "clamp(2.4rem, 6vw, 5rem)", letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: 32 }}
        >
          Race data, beautifully
          <br />
          <em style={{ fontStyle: "italic", color: "#555" }}>reimagined.</em>
        </h2>
        <button
          style={{
            background: "#E8001D",
            color: "#fff",
            border: "none",
            borderRadius: 100,
            padding: "16px 40px",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
            fontSize: 15,
            cursor: "pointer",
            letterSpacing: "0.01em",
            position: "relative",
            zIndex: 1,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.03)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          Open Dashboard →
        </button>
      </section>

      {/* FOOTER */}
      <footer className="max-w-6xl mx-auto px-8 py-10 flex items-center justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex flex-col" style={{ gap: 2 }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 15, color: "#444" }}>Lumen</span>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, color: "#2A2A2A", letterSpacing: "0.18em" }}>FORMULA ONE ANALYTICS</span>
        </div>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#2A2A2A", letterSpacing: "0.08em" }}>
          © 2025 LUMEN
        </span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#333", letterSpacing: "0.06em" }}>
          ALL CIRCUITS · ALL SEASONS
        </span>
      </footer>

      <style>{``}</style>
    </div>
  );
}
