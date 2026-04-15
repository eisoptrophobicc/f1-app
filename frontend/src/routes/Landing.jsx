export default function Landing() {
  return (
    <div style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      background: "#000",
      color: "white"
    }}>
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>
        F1 Telemetry Dashboard
      </h1>

      <p style={{ color: "#aaa", marginBottom: "2rem" }}>
        Visualize race telemetry in real-time
      </p>

      <a href="/replay" style={{
        background: "#E10600",
        padding: "12px 24px",
        borderRadius: "8px",
        color: "white",
        textDecoration: "none"
      }}>
        Start Replay
      </a>
    </div>
  );
}